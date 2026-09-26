/**
 * Data Access Layer for Next.js Server Components and API routes.
 * Loads generated JSON snapshots into memory with zero live external requests.
 */

import fs from "fs";
import path from "path";
import type { DatasetMetadata, Organization, Team } from "./types";

const DATA_DIR = path.resolve(process.cwd(), "data/generated");

let cachedTeams: Team[] | null = null;
let cachedTeamsById: Map<string, Team> | null = null;
let cachedOrganizations: Organization[] | null = null;
let cachedOrgsBySlug: Map<string, Organization> | null = null;
let cachedOrgIndex: Record<string, string[]> | null = null;
let cachedMetadata: DatasetMetadata | null = null;

function loadJSON<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`Generated data file not found: ${filePath}`);
      return fallback;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Failed to load ${filename}:`, err);
    return fallback;
  }
}

export function getAllTeams(): Team[] {
  if (!cachedTeams) {
    cachedTeams = loadJSON<Team[]>("teams.json", []);
  }
  return cachedTeams;
}

export function getTeamById(teamId: string): Team | null {
  if (!cachedTeamsById) {
    const teams = getAllTeams();
    cachedTeamsById = new Map<string, Team>();
    for (const t of teams) {
      cachedTeamsById.set(t.teamId, t);
    }
  }
  return cachedTeamsById.get(teamId) || null;
}

export function getAllOrganizations(): Organization[] {
  if (!cachedOrganizations) {
    cachedOrganizations = loadJSON<Organization[]>("organizations.json", []);
  }
  return cachedOrganizations;
}

export function getOrganizationBySlug(slug: string): Organization | null {
  if (!cachedOrgsBySlug) {
    const orgs = getAllOrganizations();
    cachedOrgsBySlug = new Map<string, Organization>();
    for (const o of orgs) {
      cachedOrgsBySlug.set(o.slug, o);
    }
  }
  return cachedOrgsBySlug.get(slug) || null;
}

export function getOrganizationIndex(): Record<string, string[]> {
  if (!cachedOrgIndex) {
    cachedOrgIndex = loadJSON<Record<string, string[]>>("organization-index.json", {});
  }
  return cachedOrgIndex;
}

export function getDatasetMetadata(): DatasetMetadata {
  if (!cachedMetadata) {
    cachedMetadata = loadJSON<DatasetMetadata>("metadata.json", {
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
  return cachedMetadata;
}
