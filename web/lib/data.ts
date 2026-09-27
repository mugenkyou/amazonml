/**
 * Data Access Layer for Next.js Server Components and API routes.
 * Loads generated JSON snapshots into memory with zero live external requests.
 * Automatically hot-reloads caches whenever JSON snapshots are updated on disk.
 */

import fs from "fs";
import path from "path";
import type { DatasetMetadata, Organization, Team } from "./types";

function getDataDirectory(): string {
  const localWebDir = path.resolve(process.cwd(), "data/generated");
  if (fs.existsSync(localWebDir)) return localWebDir;
  const rootDir = path.resolve(process.cwd(), "web/data/generated");
  if (fs.existsSync(rootDir)) return rootDir;
  return localWebDir;
}

const DATA_DIR = getDataDirectory();

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

export function getDatasetMetadata(): DatasetMetadata {
  return loadJSON<DatasetMetadata>("metadata.json", {
    challengeId: "290344",
    collectionStartedAt: null,
    collectionFinishedAt: null,
    recordsCollected: 0,
    uniqueTeams: 0,
    uniquePlayers: 0,
    uniqueOrganizations: 0,
    complete: false,
    sourceEndpoint: "https://unstop.com/api/public/live-leaderboard/290344/CodeContest",
  });
}

function getHistoryDirectory(): string {
  const localWebDir = path.resolve(process.cwd(), "data/history");
  if (fs.existsSync(localWebDir)) return localWebDir;
  const rootDir = path.resolve(process.cwd(), "web/data/history");
  if (fs.existsSync(rootDir)) return rootDir;
  return localWebDir;
}

const HISTORY_DIR = getHistoryDirectory();

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

export function getTeamHistory(teamId: string | number): import("./types").TeamHistoryRecord | null {
  if (!teamId) return null;
  const strId = String(teamId).trim();
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
