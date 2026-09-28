/**
 * Data Access Layer for Next.js Server Components and API routes.
 * Loads generated JSON snapshots into memory with zero live external requests.
 * Automatically hot-reloads caches whenever JSON snapshots are updated on disk.
 */

import fs from "fs";
import path from "path";
import type { DatasetMetadata, Organization, Team, CheckpointMoversData, MoversData } from "./types";
export { formatISTTimestamp } from "./date-utils";
export type { DatasetMetadata, Organization, Team, CheckpointMoversData, MoversData };






function getDataDirectory(): string {
  const pathsToTry = [
    path.resolve(process.cwd(), "data/generated"),
    path.resolve(process.cwd(), "data/indexes"),
    path.resolve(process.cwd(), "data"),
  ];
  for (const p of pathsToTry) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, "teams.json"))) return p;
  }
  return pathsToTry[0];
}

const DATA_DIR = getDataDirectory();

function getHistoryDirectory(): string {
  const p = path.resolve(process.cwd(), "data/history");
  if (fs.existsSync(p)) return p;
  return path.resolve(process.cwd(), "data");
}

const HISTORY_DIR = getHistoryDirectory();

function getTeamsDirectory(): string {
  return path.resolve(process.cwd(), "data/teams");
}

function getOrganizationsDirectory(): string {
  return path.resolve(process.cwd(), "data/organizations");
}

interface CacheEntry<T> {
  data: T;
  mtimeMs: number;
}

const fileCache = new Map<string, CacheEntry<any>>();

let cachedTeamsById: Map<string, Team> | null = null;
let lastTeamsMtime = 0;

let cachedOrgsBySlug: Map<string, Organization> | null = null;
let lastOrgsMtime = 0;

function loadJSON<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const stat = fs.statSync(filePath);
    const currentMtime = stat.mtimeMs;

    const existing = fileCache.get(filename);
    if (existing && existing.mtimeMs === currentMtime) {
      return existing.data as T;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content) as T;
    fileCache.set(filename, { data: parsed, mtimeMs: currentMtime });
    return parsed;
  } catch {
    return fallback;
  }
}

export function getAllTeams(): Team[] {
  const teams = loadJSON<Team[]>("teams.json", []);
  const entry = fileCache.get("teams.json");
  const mtime = entry?.mtimeMs || 0;
  if (cachedTeamsById && mtime !== lastTeamsMtime) {
    cachedTeamsById = null;
  }
  return teams;
}

export function getTeamById(teamId: string | number): Team | null {
  if (!teamId) return null;
  const strId = String(teamId).trim();
  const teams = getAllTeams();
  const entry = fileCache.get("teams.json");
  const mtime = entry?.mtimeMs || 0;

  if (!cachedTeamsById || mtime !== lastTeamsMtime) {
    cachedTeamsById = new Map<string, Team>();
    for (const t of teams) {
      if (t && t.teamId) {
        cachedTeamsById.set(String(t.teamId).trim(), t);
      }
    }
    lastTeamsMtime = mtime;
  }
  return cachedTeamsById.get(strId) || null;
}

export function getAllOrganizations(): Organization[] {
  const orgs = loadJSON<Organization[]>("organizations.json", []);
  const entry = fileCache.get("organizations.json");
  const mtime = entry?.mtimeMs || 0;
  if (cachedOrgsBySlug && mtime !== lastOrgsMtime) {
    cachedOrgsBySlug = null;
  }
  return orgs;
}

export function getOrganizationBySlug(slug: string): Organization | null {
  if (!slug) return null;
  const orgs = getAllOrganizations();
  const entry = fileCache.get("organizations.json");
  const mtime = entry?.mtimeMs || 0;

  if (!cachedOrgsBySlug || mtime !== lastOrgsMtime) {
    cachedOrgsBySlug = new Map<string, Organization>();
    for (const o of orgs) {
      if (o && o.slug) {
        cachedOrgsBySlug.set(o.slug, o);
      }
    }
    lastOrgsMtime = mtime;
  }
  return cachedOrgsBySlug.get(slug) || null;
}

export function getOrganizationIndex(): Record<string, string[]> {
  return loadJSON<Record<string, string[]>>("organization-index.json", {});
}

export interface HistoricalDatasetMeta {
  processing_timestamp: string;
  source_directories: string[];
  number_of_snapshots: number;
  number_of_unique_teams: number;
  number_of_unique_participants: number;
  number_of_unique_organizations: number;
  earliest_snapshot: string | null;
  latest_snapshot: string | null;
  total_team_observations: number;
  total_historical_observations: number;
  processing_duration_seconds: number;
  schema_version: string;
}

export interface TimelineSnapshotItem {
  snapshotNumber: number;
  snapshotId: string;
  timestamp: string;
  dateFormatted: string;
  timeFormatted: string;
  teamCount: number;
  topTeams: {
    rank: number | string;
    teamId: string;
    teamName: string;
    score: number | string;
    scoreStr: string;
    organizations: string[];
  }[];
}

export function getHistoricalMetadata(): HistoricalDatasetMeta {
  const defaultMeta: HistoricalDatasetMeta = {
    processing_timestamp: new Date().toISOString(),
    source_directories: ["save_for_later/", "web/data/history/"],
    number_of_snapshots: 34,
    number_of_unique_teams: 20038,
    number_of_unique_participants: 2833,
    number_of_unique_organizations: 412,
    earliest_snapshot: "2026-09-26T12:10:09+05:30",
    latest_snapshot: "2026-09-27T18:34:36.366546+00:00",
    total_team_observations: 288327,
    total_historical_observations: 288327,
    processing_duration_seconds: 47.28,
    schema_version: "1.0.0",
  };

  const metaPath = path.resolve(process.cwd(), "data/metadata.json");
  if (fs.existsSync(metaPath)) {
    try {
      return JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    } catch {
      return defaultMeta;
    }
  }
  return defaultMeta;
}

export function getTimelineSnapshots(): TimelineSnapshotItem[] {
  const timelinePath = path.resolve(process.cwd(), "data/indexes/timeline-snapshots.json");
  if (fs.existsSync(timelinePath)) {
    try {
      const items: TimelineSnapshotItem[] = JSON.parse(fs.readFileSync(timelinePath, "utf-8"));
      for (const item of items) {
        for (const top of item.topTeams || []) {
          if (!top.organizations || top.organizations.length === 0 || !top.teamName || top.teamName === "Unnamed Team") {
            const team = getTeamById(top.teamId);
            if (team) {
              if ((!top.organizations || top.organizations.length === 0) && team.organizations && team.organizations.length > 0) {
                top.organizations = team.organizations;
              }
              if ((!top.teamName || top.teamName === "Unnamed Team") && team.teamName && team.teamName !== "Unnamed Team") {
                top.teamName = team.teamName;
              }
            }
          }
        }
      }
      return items;
    } catch {
      return [];
    }
  }
  return [];
}

export function getDatasetMetadata(): DatasetMetadata {
  const histMeta = getHistoricalMetadata();
  return {
    challengeId: "290344",
    collectionStartedAt: histMeta.earliest_snapshot,
    collectionFinishedAt: histMeta.latest_snapshot,
    recordsCollected: histMeta.total_team_observations,
    uniqueTeams: histMeta.number_of_unique_teams,
    uniquePlayers: histMeta.number_of_unique_participants,
    uniqueOrganizations: histMeta.number_of_unique_organizations,
    complete: true,
    sourceEndpoint: "https://unstop.com/api/public/live-leaderboard/290344/CodeContest",
  };
}

function loadHistoryJSON<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(HISTORY_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const stat = fs.statSync(filePath);
    const currentMtime = stat.mtimeMs;

    const cacheKey = `history:${filename}`;
    const existing = fileCache.get(cacheKey);
    if (existing && existing.mtimeMs === currentMtime) {
      return existing.data as T;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content) as T;
    fileCache.set(cacheKey, { data: parsed, mtimeMs: currentMtime });
    return parsed;
  } catch {
    return fallback;
  }
}

export function getAllSnapshots(): import("./types").SnapshotMeta[] {
  return loadHistoryJSON<import("./types").SnapshotMeta[]>("snapshots.json", []);
}

export function getAllTeamsHistory(): Record<string, import("./types").TeamHistoryRecord> {
  return loadHistoryJSON<Record<string, import("./types").TeamHistoryRecord>>("teams-history.json", {});
}

export function getTeamDetailedTimeline(teamId: string | number): any | null {
  if (!teamId) return null;
  const strId = String(teamId).trim();
  const filePath = path.join(getTeamsDirectory(), `${strId}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  return null;
}

export function getOrganizationDetailedProfile(slug: string): any | null {
  if (!slug) return null;
  const filePath = path.join(getOrganizationsDirectory(), `${slug}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  return null;
}

export function getTeamHistory(teamId: string | number): import("./types").TeamHistoryRecord | null {
  if (!teamId) return null;
  const strId = String(teamId).trim();
  const detailed = getTeamDetailedTimeline(strId);
  if (detailed) {
    return {
      teamId: strId,
      teamName: detailed.team_name,
      firstObserved: detailed.first_seen,
      history: (detailed.history || []).map((h: any) => ({
        snapshotId: h.snapshot_id,
        timestamp: h.timestamp,
        rank: h.rank,
        score: h.score_str || String(h.score || ""),
        status: h.status,
        previousRank: h.previous_rank,
        rankDelta: h.rank_delta,
        previousScore: h.previous_score !== null && h.previous_score !== undefined ? String(h.previous_score) : null,
        scoreDelta: h.score_delta,
        finishTime: h.finish_time,
        hasPlayed: h.has_played,
        proctoringScore: h.proctoring_score,
        isBlacklisted: h.is_blacklisted,
      })),
    };
  }
  const allHistory = getAllTeamsHistory();
  return allHistory[strId] || null;
}

export function getAllChanges(limit?: number): import("./types").ChangeEvent[] {
  const changes = loadHistoryJSON<import("./types").ChangeEvent[]>("changes.json", []);
  if (limit && limit > 0) {
    return changes.slice(-limit).reverse();
  }
  return changes;
}

export function getTeamChanges(teamId: string | number): import("./types").ChangeEvent[] {
  if (!teamId) return [];
  const strId = String(teamId).trim();
  const history = getTeamHistory(strId);
  if (!history || !history.history) return [];

  const changes: import("./types").ChangeEvent[] = [];
  for (const h of history.history) {
    if (h.status === "new" || h.rankDelta !== 0 || Math.abs(h.scoreDelta) > 1e-6) {
      changes.push({
        timestamp: h.timestamp,
        snapshotId: h.snapshotId,
        teamId: strId,
        teamName: history.teamName,
        status: h.status,
        previousRank: h.previousRank,
        newRank: h.rank,
        rankDelta: h.rankDelta,
        previousScore: h.previousScore,
        newScore: h.score,
        scoreDelta: h.scoreDelta,
      });
    }
  }
  return changes.reverse();
}

export function getAllCheckpointMovers(): Record<string, CheckpointMoversData> {
  return loadHistoryJSON<Record<string, CheckpointMoversData>>("checkpoint-movers.json", {});
}


export function getMoversData(): import("./types").MoversData {
  return loadHistoryJSON<import("./types").MoversData>("movers.json", {
    latestSnapshotId: null,
    latestTimestamp: null,
    topClimbers: [],
    topFallers: [],
    topScoreGainers: [],
    newTeams: [],
  });
}

// -------------------------------------------------------------

// Live Supabase-First Data Access Functions (Async)
// -------------------------------------------------------------
import {
  fetchTeamsFromSupabase,
  fetchTeamByIdFromSupabase,
  fetchOrganizationsFromSupabase,
  fetchTeamHistoryFromSupabase,
  fetchLiveSyncStatusFromSupabase,
} from "./data/supabase-service";
import { isSupabaseConfigured } from "./supabase/server";

export async function getLiveTeams(): Promise<Team[]> {
  return getAllTeams();
}

export async function getLiveTeamById(teamId: string | number): Promise<Team | null> {
  if (!teamId) return null;
  const strId = String(teamId).trim();
  if (isSupabaseConfigured()) {
    try {
      const sbTeam = await fetchTeamByIdFromSupabase(strId);
      if (sbTeam) return sbTeam;
    } catch (e) {
      console.error("[Data] Failed to fetch live team by id from Supabase, falling back:", e);
    }
  }
  return getTeamById(strId);
}

export async function getLiveOrganizations(): Promise<Organization[]> {
  return getAllOrganizations();
}

export async function getLiveOrganizationBySlug(slug: string): Promise<Organization | null> {
  if (!slug) return null;
  const orgs = await getLiveOrganizations();
  return orgs.find((o) => o.slug === slug) || getOrganizationBySlug(slug);
}

export async function getLiveTeamHistory(teamId: string | number): Promise<import("./types").TeamHistoryRecord | null> {
  if (!teamId) return null;
  const strId = String(teamId).trim();
  if (isSupabaseConfigured()) {
    try {
      const sbHist = await fetchTeamHistoryFromSupabase(strId);
      if (sbHist) return sbHist;
    } catch (e) {
      console.error("[Data] Failed to fetch live team history from Supabase, falling back:", e);
    }
  }
  return getTeamHistory(strId);
}

export async function getLiveTeamChanges(teamId: string | number): Promise<import("./types").ChangeEvent[]> {
  if (!teamId) return [];
  const strId = String(teamId).trim();
  const [hist, team] = await Promise.all([
    getLiveTeamHistory(strId),
    getLiveTeamById(strId),
  ]);
  if (!hist || !hist.history || hist.history.length === 0) return getTeamChanges(strId);

  const changes: import("./types").ChangeEvent[] = [];
  for (const h of hist.history) {
    if (h.status === "new" || h.rankDelta !== 0 || Math.abs(h.scoreDelta) > 1e-6) {
      changes.push({
        timestamp: h.timestamp,
        snapshotId: h.snapshotId,
        teamId: strId,
        teamName: team?.teamName || hist.teamName || "",
        status: h.status,
        previousRank: h.previousRank,
        newRank: h.rank,
        rankDelta: h.rankDelta,
        previousScore: h.previousScore,
        newScore: h.score,
        scoreDelta: h.scoreDelta,
      });
    }
  }
  return changes.reverse();
}

export async function getLiveDatasetMetadata(): Promise<DatasetMetadata> {
  if (isSupabaseConfigured()) {
    try {
      const sbStatus = await fetchLiveSyncStatusFromSupabase();
      if (sbStatus) {
        const fallbackMeta = getDatasetMetadata();
        return {
          ...fallbackMeta,
          collectionStartedAt: sbStatus.lastAttempt || fallbackMeta.collectionStartedAt,
          collectionFinishedAt: sbStatus.lastSuccessfulSync || fallbackMeta.collectionFinishedAt,
          recordsCollected: sbStatus.teamsUpdated || fallbackMeta.recordsCollected,
          complete: sbStatus.status === "success",
          sourceEndpoint: "https://unstop.com/api/public/live-leaderboard/290344/CodeContest",
        };
      }
    } catch (e) {
      console.error("[Data] Failed to fetch live metadata from Supabase, falling back:", e);
    }
  }
  return getDatasetMetadata();
}


