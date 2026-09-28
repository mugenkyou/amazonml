/**
 * Supabase Live Data Service for Next.js Server Components and API Routes.
 * Queries PostgreSQL directly for live teams, rankings, organizations, and historical snapshots.
 * Implements high-performance memory caching with 15s TTL so pages load in <10ms.
 */

import { getSupabaseServerClient, isSupabaseConfigured } from "../supabase/server";
import type {
  Team,
  Player,
  Organization,
  DatasetMetadata,
  SnapshotMeta,
  TeamHistoryRecord,
  HistoricalObservation,
  ChangeEvent,
  MoversData,
  TeamMoverSummary,
} from "../types";

interface CacheStore<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheStore<any>>();
const CACHE_TTL_MS = 5000; // 5 seconds TTL for rapid live freshness

function getCached<T>(key: string): T | null {
  const item = memoryCache.get(key);
  if (item && item.expiresAt > Date.now()) {
    return item.data as T;
  }
  return null;
}

function setCached<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 1000, fallback: T | null = null): Promise<T | null> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T | null>((resolve) => {
    timer = setTimeout(() => resolve(fallback), timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    return result;
  } catch {
    clearTimeout(timer!);
    return fallback;
  }
}

/**
 * Fetch top active teams from Supabase with players and organizations.
 * Bounded with a 1.8s timeout to prevent serverless function hangs / 504 timeouts.
 */
export async function fetchTeamsFromSupabase(limit = 100): Promise<Team[] | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabaseServerClient();
  if (!client) return null;

  const cacheKey = `supabase:teams:${limit}`;
  const cached = getCached<Team[]>(cacheKey);
  if (cached) return cached;

  const fetchPromise = async () => {
    try {
      const { data: teamsData, error: teamsError } = await client
        .from("teams")
        .select(`
          team_id,
          team_name,
          rank,
          sort_rank,
          f1_score,
          f1_score_str,
          previous_rank,
          previous_f1_score_str,
          rank_delta,
          score_delta,
          finish_time,
          has_played,
          proctoring_score,
          is_blacklisted,
          is_inter_college,
          college_count,
          status,
          updated_at,
          players (
            player_name,
            organization,
            normalized_organization,
            player_index
          )
        `)
        .order("sort_rank", { ascending: true })
        .order("team_name", { ascending: true })
        .limit(limit);

      if (teamsError || !teamsData) {
        return null;
      }

      const teams: Team[] = teamsData.map((row: any) => {
        const rawPlayers = row.players || [];
        const players: Player[] = rawPlayers.map((p: any) => ({
          name: p.player_name || "Participant",
          organization: p.organization || "",
          normalizedOrganization: p.normalized_organization || "",
          playerIndex: p.player_index || 0,
        }));

        const orgSet = new Set<string>();
        const normOrgSet = new Set<string>();
        for (const p of players) {
          if (p.organization) orgSet.add(p.organization);
          if (p.normalizedOrganization) normOrgSet.add(p.normalizedOrganization);
        }

        return {
          teamId: String(row.team_id),
          teamName: row.team_name || "Unnamed Team",
          rank: row.rank !== null ? String(row.rank) : "",
          sortRank: row.sort_rank ?? 9999999,
          score: row.f1_score_str || "0.000000",
          finishTime: row.finish_time || "",
          hasPlayed: String(row.has_played || false),
          proctoringScore: row.proctoring_score || "",
          isBlacklisted: String(row.is_blacklisted || false),
          players,
          organizations: Array.from(orgSet),
          normalizedOrganizations: Array.from(normOrgSet),
          previousRank: row.previous_rank ?? null,
          rankDelta: row.rank_delta ?? 0,
          previousScore: row.previous_f1_score_str ?? null,
          scoreDelta: row.score_delta ?? 0,
          status: row.status || "active",
          lastUpdated: row.updated_at,
        };
      });

      setCached(cacheKey, teams, 60000);
      return teams;
    } catch {
      return null;
    }
  };

  return withTimeout(fetchPromise(), 1800, null);
}

/**
 * Fetch a single team by its unique team_id from Supabase.
 */
export async function fetchTeamByIdFromSupabase(teamId: string): Promise<Team | null> {
  if (!isSupabaseConfigured() || !teamId) return null;
  const client = getSupabaseServerClient();
  if (!client) return null;

  const cacheKey = `supabase:team:${teamId}`;
  const cached = getCached<Team>(cacheKey);
  if (cached) return cached;

  const fetchPromise = async () => {
    try {
      const { data, error } = await client
        .from("teams")
        .select(`
          team_id,
          team_name,
          rank,
          sort_rank,
          f1_score,
          f1_score_str,
          previous_rank,
          previous_f1_score_str,
          rank_delta,
          score_delta,
          finish_time,
          has_played,
          proctoring_score,
          is_blacklisted,
          is_inter_college,
          college_count,
          status,
          updated_at,
          players (
            player_name,
            organization,
            normalized_organization,
            player_index
          )
        `)
        .eq("team_id", teamId)
        .maybeSingle();

      if (error || !data) return null;

      const rawPlayers = data.players || [];
      const players: Player[] = rawPlayers.map((p: any) => ({
        name: p.player_name || "Participant",
        organization: p.organization || "",
        normalizedOrganization: p.normalized_organization || "",
        playerIndex: p.player_index || 0,
      }));

      const orgSet = new Set<string>();
      const normOrgSet = new Set<string>();
      for (const p of players) {
        if (p.organization) orgSet.add(p.organization);
        if (p.normalizedOrganization) normOrgSet.add(p.normalizedOrganization);
      }

      const team: Team = {
        teamId: String(data.team_id),
        teamName: data.team_name || "Unnamed Team",
        rank: data.rank !== null ? String(data.rank) : "",
        sortRank: data.sort_rank ?? 9999999,
        score: data.f1_score_str || "0.000000",
        finishTime: data.finish_time || "",
        hasPlayed: String(data.has_played || false),
        proctoringScore: data.proctoring_score || "",
        isBlacklisted: String(data.is_blacklisted || false),
        players,
        organizations: Array.from(orgSet),
        normalizedOrganizations: Array.from(normOrgSet),
        previousRank: data.previous_rank ?? null,
        rankDelta: data.rank_delta ?? 0,
        previousScore: data.previous_f1_score_str ?? null,
        scoreDelta: data.score_delta ?? 0,
        status: data.status || "active",
        lastUpdated: data.updated_at,
      };

      setCached(cacheKey, team, 60000);
      return team;
    } catch {
      return null;
    }
  };

  return withTimeout(fetchPromise(), 1800, null);
}

/**
 * Fetch all organizations from Supabase.
 */
export async function fetchOrganizationsFromSupabase(): Promise<Organization[] | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabaseServerClient();
  if (!client) return null;

  const cacheKey = "supabase:organizations";
  const cached = getCached<Organization[]>(cacheKey);
  if (cached) return cached;

  const fetchPromise = async () => {
    try {
      const { data, error } = await client
        .from("organizations")
        .select("organization_name, normalized_name, slug, team_count, player_count")
        .order("team_count", { ascending: false })
        .limit(2000);

      if (error || !data) return null;

      const orgs: Organization[] = data.map((r: any) => ({
        name: r.organization_name,
        normalizedName: r.normalized_name,
        slug: r.slug,
        teamCount: r.team_count || 0,
        playerCount: r.player_count || 0,
      }));

      setCached(cacheKey, orgs, 300000); // 5 min cache
      return orgs;
    } catch {
      return null;
    }
  };

  return withTimeout(fetchPromise(), 1800, null);
}

/**
 * Fetch historical observations for a team from Supabase.
 */
export async function fetchTeamHistoryFromSupabase(teamId: string): Promise<TeamHistoryRecord | null> {
  if (!isSupabaseConfigured() || !teamId) return null;
  const client = getSupabaseServerClient();
  if (!client) return null;

  const cacheKey = `supabase:history:${teamId}`;
  const cached = getCached<TeamHistoryRecord>(cacheKey);
  if (cached) return cached;

  const fetchPromise = async () => {
    try {
      const { data: scoresData, error } = await client
        .from("team_snapshot_scores")
        .select(`
          rank,
          f1_score_str,
          previous_rank,
          rank_delta,
          score_delta,
          status,
          created_at,
          leaderboard_snapshots (
            snapshot_key,
            captured_at
          )
        `)
        .eq("team_id", teamId)
        .order("created_at", { ascending: true })
        .limit(200);

      if (error || !scoresData || scoresData.length === 0) return null;

      const history: HistoricalObservation[] = scoresData
        .map((row: any) => {
          const snap = row.leaderboard_snapshots || {};
          return {
            snapshotId: snap.snapshot_key || "live",
            timestamp: snap.captured_at || row.created_at,
            rank: row.rank ?? null,
            score: row.f1_score_str || "0.000000",
            status: (row.status as any) || "active",
            previousRank: row.previous_rank ?? null,
            rankDelta: row.rank_delta ?? 0,
            previousScore: row.previous_score !== null && row.previous_score !== undefined ? String(row.previous_score) : null,
            scoreDelta: row.score_delta ?? 0,
          };
        })
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const record: TeamHistoryRecord = {
        teamId,
        teamName: "",
        firstObserved: history[0]?.timestamp || new Date().toISOString(),
        history,
      };

      setCached(cacheKey, record, 60000);
      return record;
    } catch {
      return null;
    }
  };

  return withTimeout(fetchPromise(), 1800, null);
}

/**
 * Fetch live sync status from sync_runs table.
 */
export async function fetchLiveSyncStatusFromSupabase(): Promise<{
  status: string;
  lastSuccessfulSync: string | null;
  lastAttempt: string | null;
  teamsUpdated: number;
  teamsAdded: number;
  snapshotId: number | null;
  errorMessage: string | null;
  source: string;
} | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getSupabaseServerClient();
  if (!client) return null;

  const cacheKey = "supabase:sync_status";
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  const fetchPromise = async () => {
    try {
      const { data, error } = await client
        .from("sync_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      const res = {
        status: data.status,
        lastSuccessfulSync: data.status === "success" ? data.completed_at : null,
        lastAttempt: data.started_at,
        teamsUpdated: data.teams_changed || 0,
        teamsAdded: data.teams_added || 0,
        snapshotId: data.snapshot_id,
        errorMessage: data.error_message,
        source: data.source || "python_collector",
      };

      setCached(cacheKey, res, 15000);
      return res;
    } catch {
      return null;
    }
  };

  return withTimeout(fetchPromise(), 1800, null);
}
