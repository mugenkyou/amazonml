/**
 * ==============================================================================
 * Amazon ML Challenge 2026 Historical Archive - Server-Side Supabase Client
 * File: Final/lib/supabase/server.ts
 * ==============================================================================
 * Privileged server-side queries for Next.js Server Components and Route Handlers.
 * NEVER imported or exposed in client components.
 * ==============================================================================
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { DatasetMetadata, Organization, Player, Team, TeamHistoryRecord, HistoricalObservation } from "../types";

let serverClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

/**
 * Server-side Supabase client with read access (service-role or anon key).
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!serverClient) {
    serverClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: "public",
      },
      global: {
        fetch: (input, init) => {
          // 2500ms safety timeout to prevent serverless function hangs
          const timeoutSignal = AbortSignal.timeout(2500);
          const combinedSignal = init?.signal
            ? AbortSignal.any([init.signal, timeoutSignal])
            : timeoutSignal;
          return fetch(input, { ...init, signal: combinedSignal });
        },
      },
    });
  }
  return serverClient;
}

/**
 * Privileged Admin Supabase client (service role only).
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: "public",
      },
    });
  }
  return adminClient;
}

/**
 * Targeted Server-Side Query: Fetch single team with players & organization affiliations.
 */
export async function fetchTeamFromSupabase(teamId: string | number): Promise<Team | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  try {
    const tid = String(teamId).trim();
    const { data: teamRow, error: teamErr } = await supabase
      .from("teams")
      .select("*")
      .eq("team_id", tid)
      .single();

    if (teamErr || !teamRow) return null;

    // Fetch players for this team
    const { data: playerRows } = await supabase
      .from("players")
      .select("player_name, organization, normalized_organization, player_index")
      .eq("team_id", tid)
      .order("player_index", { ascending: true });

    const players: Player[] = (playerRows || []).map((p, idx) => ({
      name: p.player_name,
      organization: p.organization || "",
      normalizedOrganization: p.normalized_organization || (p.organization || "").toLowerCase().trim(),
      playerIndex: p.player_index ?? idx,
    }));

    // Fetch organizations for this team
    const { data: teamOrgRows } = await supabase
      .from("team_organizations")
      .select("organizations(organization_name)")
      .eq("team_id", tid);

    const organizations: string[] = [];
    if (teamOrgRows) {
      for (const to of teamOrgRows) {
        const orgName = (to.organizations as any)?.organization_name;
        if (orgName && !organizations.includes(orgName)) {
          organizations.push(orgName);
        }
      }
    }

    if (organizations.length === 0) {
      for (const p of players) {
        if (p.organization && !organizations.includes(p.organization)) {
          organizations.push(p.organization);
        }
      }
    }

    const normalizedOrganizations = organizations.map((o) => o.toLowerCase().trim());

    return {
      teamId: teamRow.team_id,
      teamName: teamRow.team_name,
      rank: String(teamRow.rank ?? ""),
      sortRank: teamRow.sort_rank ?? 9999999,
      score: teamRow.f1_score_str || String(teamRow.f1_score || "0.000000"),
      previousRank: teamRow.previous_rank,
      previousScore: teamRow.previous_f1_score_str,
      rankDelta: teamRow.rank_delta || 0,
      scoreDelta: teamRow.score_delta || 0.0,
      finishTime: teamRow.finish_time || "",
      hasPlayed: String(teamRow.has_played),
      proctoringScore: teamRow.proctoring_score || "0",
      isBlacklisted: String(teamRow.is_blacklisted),
      players,
      organizations,
      normalizedOrganizations,
    };
  } catch (error) {
    console.error("fetchTeamFromSupabase error:", error);
    return null;
  }
}

/**
 * Targeted Server-Side Query: Fetch historical timeline observations for a team.
 */
export async function fetchTeamHistoryFromSupabase(teamId: string | number): Promise<TeamHistoryRecord | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  try {
    const tid = String(teamId).trim();
    const { data: teamRow } = await supabase
      .from("teams")
      .select("team_id, team_name")
      .eq("team_id", tid)
      .single();

    if (!teamRow) return null;

    const { data: historyRows, error } = await supabase
      .from("team_snapshot_scores")
      .select(`
        id,
        rank,
        f1_score,
        f1_score_str,
        previous_rank,
        rank_delta,
        previous_score,
        score_delta,
        status,
        created_at,
        leaderboard_snapshots(snapshot_key, captured_at)
      `)
      .eq("team_id", tid)
      .order("id", { ascending: true });

    if (error || !historyRows || historyRows.length === 0) return null;

    const history: HistoricalObservation[] = historyRows.map((h: any) => {
      const snapKey = h.leaderboard_snapshots?.snapshot_key || `snap_${h.id}`;
      const snapTime = h.leaderboard_snapshots?.captured_at || h.created_at;
      return {
        snapshotId: snapKey,
        timestamp: snapTime,
        rank: h.rank,
        score: h.f1_score_str || String(h.f1_score),
        status: (h.status as any) || "active",
        previousRank: h.previous_rank,
        rankDelta: h.rank_delta || 0,
        previousScore: h.previous_score !== null ? String(h.previous_score) : null,
        scoreDelta: h.score_delta || 0.0,
      };
    });

    return {
      teamId: teamRow.team_id,
      teamName: teamRow.team_name,
      firstObserved: history[0]?.timestamp || new Date().toISOString(),
      history,
    };
  } catch (error) {
    console.error("fetchTeamHistoryFromSupabase error:", error);
    return null;
  }
}

/**
 * Targeted Server-Side Query: Fetch dataset summary counts.
 */
export async function fetchDatasetMetadataFromSupabase(): Promise<DatasetMetadata | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  try {
    const [teamsRes, orgsRes, playersRes, snapsRes] = await Promise.all([
      supabase.from("teams").select("id", { count: "exact", head: true }),
      supabase.from("organizations").select("id", { count: "exact", head: true }),
      supabase.from("players").select("id", { count: "exact", head: true }),
      supabase.from("leaderboard_snapshots").select("captured_at").order("captured_at", { ascending: false }).limit(1),
    ]);

    const uniqueTeams = teamsRes.count || 10942;
    const uniqueOrganizations = orgsRes.count || 2579;
    const uniquePlayers = playersRes.count || 36020;
    const lastTimestamp = snapsRes.data?.[0]?.captured_at || new Date().toISOString();

    return {
      challengeId: "290344",
      collectionStartedAt: "2026-09-26T12:10:09+05:30",
      collectionFinishedAt: lastTimestamp,
      recordsCollected: 141712,
      uniqueTeams,
      uniquePlayers,
      uniqueOrganizations,
      complete: true,
      sourceEndpoint: "https://unstop.com/api/public/live-leaderboard/290344/CodeContest",
    };
  } catch (error) {
    console.error("fetchDatasetMetadataFromSupabase error:", error);
    return null;
  }
}
