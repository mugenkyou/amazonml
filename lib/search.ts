/**
 * High-Performance Search & Autocomplete Engine for Amazon ML Challenge 2026 Explorer.
 * Supports multi-category lookups: Colleges, Student Participants, Team Names, Team IDs, and Ranks.
 */

import { getAllOrganizations, getAllTeams } from "./data";
import { normalizeOrganization, tokenizeQuery, matchesCollegeName } from "./normalize";
import type {
  Organization,
  SearchMode,
  SearchResponse,
  SearchResultTeam,
  SearchSuggestion,
  Player,
} from "./types";

export interface SearchOptions {
  mode?: SearchMode;
  exact?: boolean;
  page?: number;
  pageSize?: number;
}

const HIDDEN_TEAM_RANKS = new Set([1519, "1519"]);
const HIDDEN_TEAM_IDS = new Set(["1519"]);

export function isHiddenFromSearch(team: { rank?: string | number | null; teamId?: string | number | null }): boolean {
  if (!team) return false;
  if (team.rank !== undefined && team.rank !== null && HIDDEN_TEAM_RANKS.has(team.rank)) return true;
  if (team.teamId !== undefined && team.teamId !== null && (HIDDEN_TEAM_IDS.has(String(team.teamId)) || String(team.teamId) === "1519")) return true;
  return false;
}

/**
 * Searches teams across all records with high-performance filtering.
 */
export function searchTeams(
  rawQuery?: string | null,
  options: SearchOptions = {}
): SearchResponse {
  const query = (rawQuery || "").trim();
  const mode: SearchMode = options.mode || "all";
  const exact = Boolean(options.exact);
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.max(1, Math.min(100, options.pageSize || 30));

  const allTeams = getAllTeams().filter((t) => !isHiddenFromSearch(t));

  // If query is empty, return top teams in ranking order
  if (!query) {
    const total = allTeams.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const paginatedTeams = allTeams.slice(startIndex, startIndex + pageSize);

    const resultTeams: SearchResultTeam[] = paginatedTeams.map((t) => ({
      ...t,
      matchedOrganizations: t.organizations,
      matchedPlayers: t.players,
    }));

    return {
      query: "",
      mode,
      exact: false,
      total,
      page: safePage,
      pageSize,
      totalPages,
      teams: resultTeams,
    };
  }

  const normQuery = normalizeOrganization(query);
  const tokens = tokenizeQuery(query);
  const lowerQuery = query.toLowerCase();
  const cleanIdOrRank = query.replace(/^(team|id|rank|#)\s*/i, "").trim().toLowerCase();

  const matchedTeamsList: SearchResultTeam[] = [];

  for (const team of allTeams) {
    let teamMatches = false;
    const matchedOrgsSet = new Set<string>();
    const matchedPlayersSet = new Set<Player>();
    const matchedReasons: string[] = [];

    const tId = String(team.teamId || "").toLowerCase();
    const tRank = String(team.rank || "").toLowerCase();
    const tNameLower = (team.teamName || "").trim().toLowerCase();

    // --- 0. DIRECT TEAM ID / RANK MATCHING (in "team" or "all" mode) ---
    if (mode === "team" || mode === "all") {
      if (tId === lowerQuery || tId === cleanIdOrRank || (cleanIdOrRank.length >= 4 && tId.includes(cleanIdOrRank))) {
        teamMatches = true;
        matchedReasons.push(`Team ID: ${team.teamId}`);
      } else if (cleanIdOrRank && (tRank === cleanIdOrRank || (query.startsWith("#") && tRank === query.slice(1).trim()))) {
        teamMatches = true;
        matchedReasons.push(`Leaderboard Rank #${team.rank}`);
      }
    }

    // --- 1. PERSON / PARTICIPANT NAME MATCHING ---
    if (mode === "person" || mode === "all") {
      for (const player of team.players || []) {
        if (!player.name) continue;
        const pLower = player.name.trim().toLowerCase();

        let playerMatched = false;
        if (exact) {
          playerMatched = pLower === lowerQuery || pLower === normQuery;
        } else {
          if (pLower.includes(normQuery) || pLower.includes(lowerQuery)) {
            playerMatched = true;
          } else if (tokens.length > 1 && tokens.every((tok) => pLower.includes(tok))) {
            playerMatched = true;
          }
        }

        if (playerMatched) {
          teamMatches = true;
          matchedPlayersSet.add(player);
          if (player.organization) {
            matchedOrgsSet.add(player.organization);
          }
          matchedReasons.push(`Participant: ${player.name}`);
        }
      }
    }

    // --- 2. COLLEGE / INSTITUTION MATCHING ---
    if (mode === "college" || mode === "all") {
      let orgMatchedForTeam = false;
      for (let i = 0; i < (team.normalizedOrganizations || []).length; i++) {
        const normOrg = team.normalizedOrganizations[i];
        const rawOrg = team.organizations[i] || normOrg;
        if (!normOrg) continue;

        const orgMatched = matchesCollegeName(normOrg, query, exact);

        if (orgMatched) {
          teamMatches = true;
          orgMatchedForTeam = true;
          matchedOrgsSet.add(rawOrg);
        }
      }

      // If org matched in "college" or "all", also associate matching players from that college
      if (orgMatchedForTeam) {
        for (const player of team.players || []) {
          if (!player.organization) continue;
          const pNorm = player.normalizedOrganization || normalizeOrganization(player.organization);
          if (matchesCollegeName(pNorm, query, exact)) {
            matchedPlayersSet.add(player);
          }
        }
      }
    }

    // --- 3. TEAM NAME MATCHING ---
    if (mode === "team" || mode === "all") {
      let teamNameMatched = false;
      if (exact) {
        teamNameMatched = tNameLower === lowerQuery || tNameLower === normQuery;
      } else {
        if (tNameLower.includes(normQuery) || tNameLower.includes(lowerQuery)) {
          teamNameMatched = true;
        } else if (tokens.length > 1 && tokens.every((tok) => tNameLower.includes(tok))) {
          teamNameMatched = true;
        }
      }

      if (teamNameMatched) {
        teamMatches = true;
        matchedReasons.push(`Team: ${team.teamName}`);
      }
    }

    // --- 4. CROSS-FIELD MULTI-TOKEN MATCHING (e.g. "Sachi LPU" or "GG Punjab") ---
    if (!teamMatches && mode === "all" && tokens.length > 1) {
      const fullText = `${team.teamName} ${tId} ${tRank} ${(team.organizations || []).join(" ")} ${(team.players || []).map((p) => p.name).join(" ")}`.toLowerCase();
      if (tokens.every((tok) => fullText.includes(tok))) {
        teamMatches = true;
      }
    }

    if (teamMatches) {
      const matchedOrgs = Array.from(matchedOrgsSet);
      const matchedPlayers = Array.from(matchedPlayersSet);

      matchedTeamsList.push({
        ...team,
        matchedOrganizations: matchedOrgs.length > 0 ? matchedOrgs : team.organizations,
        matchedPlayers: matchedPlayers.length > 0 ? matchedPlayers : team.players,
        matchedReasons: matchedReasons.length > 0 ? matchedReasons : undefined,
      });
    }
  }

  // Preserve rank order
  matchedTeamsList.sort((a, b) => a.sortRank - b.sortRank || a.teamName.localeCompare(b.teamName));

  const total = matchedTeamsList.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedTeams = matchedTeamsList.slice(startIndex, startIndex + pageSize);

  return {
    query,
    mode,
    exact,
    total,
    page: safePage,
    pageSize,
    totalPages,
    teams: paginatedTeams,
  };
}

/**
 * Searches academic organizations with limit cap and team-count ranking.
 */
export function searchOrganizations(query?: string | null, limit: number = 10): Organization[] {
  const allOrgs = getAllOrganizations();
  if (!query || query.trim().length === 0) {
    return allOrgs.slice(0, limit);
  }

  const matchedOrgs: Organization[] = [];

  for (const org of allOrgs) {
    if (matchesCollegeName(org.normalizedName, query, false)) {
      matchedOrgs.push(org);
    }
  }

  matchedOrgs.sort((a, b) => b.teamCount - a.teamCount);

  return matchedOrgs.slice(0, limit);
}

/**
 * Generates fast, balanced autocomplete suggestions across Colleges, Persons, and Teams.
 */
export function searchSuggestions(
  query?: string | null,
  mode: SearchMode = "all",
  limit: number = 8
): SearchSuggestion[] {
  if (!query || query.trim().length === 0) {
    if (mode === "college" || mode === "all") {
      return getAllOrganizations()
        .slice(0, Math.min(limit, 5))
        .map((org) => ({
          type: "college",
          title: org.name,
          badge: `${org.teamCount} ${org.teamCount === 1 ? "team" : "teams"}`,
          queryValue: org.name,
          slug: org.slug,
        }));
    }
    return [];
  }

  const normQuery = normalizeOrganization(query);
  const tokens = tokenizeQuery(query);
  const lowerQuery = query.toLowerCase();
  const cleanIdOrRank = query.replace(/^(team|id|rank|#)\s*/i, "").trim().toLowerCase();

  const results: SearchSuggestion[] = [];

  const maxColleges = mode === "all" ? Math.min(3, limit) : limit;
  const maxTeams = mode === "all" ? Math.min(3, limit) : limit;
  const maxPersons = mode === "all" ? Math.min(3, limit) : limit;

  // 1. Suggestions for Colleges
  if (mode === "college" || mode === "all") {
    const orgs = getAllOrganizations();
    const matchedOrgs: Organization[] = [];

    for (const org of orgs) {
      if (matchesCollegeName(org.normalizedName, query, false)) {
        matchedOrgs.push(org);
      }
    }

    matchedOrgs.sort((a, b) => b.teamCount - a.teamCount);

    for (const org of matchedOrgs.slice(0, maxColleges)) {
      results.push({
        type: "college",
        title: org.name,
        badge: `${org.teamCount} ${org.teamCount === 1 ? "team" : "teams"}`,
        queryValue: org.name,
        slug: org.slug,
      });
    }
  }

  // 2. Suggestions for Teams (matching teamName, teamId, or rank)
  if (mode === "team" || mode === "all") {
    const allTeams = getAllTeams().filter((t) => !isHiddenFromSearch(t));
    let teamCount = 0;
    for (const team of allTeams) {
      const tLower = (team.teamName || "").toLowerCase();
      const tId = String(team.teamId || "").toLowerCase();
      const tRank = String(team.rank || "").toLowerCase();

      let isMatch = false;
      let badge = `Rank #${team.rank}`;

      if (tId === lowerQuery || tId === cleanIdOrRank || (cleanIdOrRank.length >= 3 && tId.includes(cleanIdOrRank))) {
        isMatch = true;
        badge = `ID: ${team.teamId}`;
      } else if (cleanIdOrRank && tRank === cleanIdOrRank) {
        isMatch = true;
        badge = `Rank #${team.rank}`;
      } else if (
        tLower.includes(normQuery) ||
        tLower.includes(lowerQuery) ||
        (tokens.length > 1 && tokens.every((tok) => tLower.includes(tok)))
      ) {
        isMatch = true;
      }

      if (isMatch) {
        results.push({
          type: "team",
          title: team.teamName,
          subtitle:
            team.organizations && team.organizations.length > 0
              ? `${team.organizations[0]} (ID: ${team.teamId})`
              : `ID: ${team.teamId} • Score: ${team.score}`,
          badge,
          queryValue: team.teamName,
          teamId: team.teamId,
        });
        teamCount++;
        if (teamCount >= maxTeams) break;
      }
    }
  }

  // 3. Suggestions for Participants / Persons
  if (mode === "person" || mode === "all") {
    const allTeams = getAllTeams().filter((t) => !isHiddenFromSearch(t));
    const seenPersons = new Set<string>();
    let personCount = 0;

    for (const team of allTeams) {
      for (const player of team.players || []) {
        if (!player.name) continue;
        const pLower = player.name.toLowerCase();

        if (
          pLower.includes(normQuery) ||
          pLower.includes(lowerQuery) ||
          (tokens.length > 1 && tokens.every((tok) => pLower.includes(tok)))
        ) {
          const key = `${player.name.toLowerCase()}::${player.organization || ""}`;
          if (!seenPersons.has(key)) {
            seenPersons.add(key);
            results.push({
              type: "person",
              title: player.name,
              subtitle: player.organization || `Team: ${team.teamName}`,
              badge: `Rank #${team.rank}`,
              queryValue: player.name,
              teamId: team.teamId,
            });
            personCount++;
            if (personCount >= maxPersons) break;
          }
        }
      }
      if (personCount >= maxPersons) break;
    }
  }

  return results.slice(0, limit);
}
