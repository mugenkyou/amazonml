/**
 * Search Engine for College, Person / Participant Name, and Team lookups across the dataset.
 */

import { getAllOrganizations, getAllTeams } from "./data";
import { normalizeOrganization, tokenizeQuery } from "./normalize";
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

export function searchTeams(
  rawQuery?: string | null,
  options: SearchOptions = {}
): SearchResponse {
  const query = (rawQuery || "").trim();
  const mode: SearchMode = options.mode || "all";
  const exact = Boolean(options.exact);
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.max(1, Math.min(100, options.pageSize || 30));

  const allTeams = getAllTeams();

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

  const matchedTeamsList: SearchResultTeam[] = [];

  for (const team of allTeams) {
    let teamMatches = false;
    const matchedOrgsSet = new Set<string>();
    const matchedPlayersSet = new Set<Player>();
    const matchedReasons: string[] = [];

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

        let orgMatched = false;
        if (exact) {
          orgMatched = normOrg === normQuery;
        } else {
          if (normOrg.includes(normQuery)) {
            orgMatched = true;
          } else if (tokens.length > 1 && tokens.every((token) => normOrg.includes(token))) {
            orgMatched = true;
          }
        }

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
          const pNorm = player.normalizedOrganization;
          if (exact) {
            if (pNorm === normQuery) matchedPlayersSet.add(player);
          } else {
            if (pNorm.includes(normQuery) || (tokens.length > 1 && tokens.every((tok) => pNorm.includes(tok)))) {
              matchedPlayersSet.add(player);
            }
          }
        }
      }
    }

    // --- 3. TEAM NAME MATCHING ---
    if (mode === "team" || mode === "all") {
      const tLower = (team.teamName || "").trim().toLowerCase();
      let teamNameMatched = false;
      if (exact) {
        teamNameMatched = tLower === lowerQuery || tLower === normQuery;
      } else {
        if (tLower.includes(normQuery) || tLower.includes(lowerQuery)) {
          teamNameMatched = true;
        } else if (tokens.length > 1 && tokens.every((tok) => tLower.includes(tok))) {
          teamNameMatched = true;
        }
      }

      if (teamNameMatched) {
        teamMatches = true;
        matchedReasons.push(`Team: ${team.teamName}`);
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

export function searchOrganizations(query?: string | null, limit: number = 10): Organization[] {
  const allOrgs = getAllOrganizations();
  if (!query || query.trim().length === 0) {
    return allOrgs.slice(0, limit);
  }

  const normQuery = normalizeOrganization(query);
  const tokens = tokenizeQuery(query);

  const matchedOrgs: Organization[] = [];

  for (const org of allOrgs) {
    if (org.normalizedName.includes(normQuery)) {
      matchedOrgs.push(org);
    } else if (tokens.length > 1 && tokens.every((tok) => org.normalizedName.includes(tok))) {
      matchedOrgs.push(org);
    }

    if (matchedOrgs.length >= limit) {
      break;
    }
  }

  return matchedOrgs;
}

export function searchSuggestions(
  query?: string | null,
  mode: SearchMode = "all",
  limit: number = 8
): SearchSuggestion[] {
  if (!query || query.trim().length === 0) {
    if (mode === "college") {
      return getAllOrganizations()
        .slice(0, limit)
        .map((org) => ({
          type: "college",
          title: org.name,
          badge: `${org.teamCount} teams`,
          queryValue: org.name,
          slug: org.slug,
        }));
    }
    return [];
  }

  const normQuery = normalizeOrganization(query);
  const tokens = tokenizeQuery(query);
  const lowerQuery = query.toLowerCase();

  const results: SearchSuggestion[] = [];

  // 1. Suggestions for Colleges
  if (mode === "college" || mode === "all") {
    const orgs = getAllOrganizations();
    for (const org of orgs) {
      if (
        org.normalizedName.includes(normQuery) ||
        (tokens.length > 1 && tokens.every((tok) => org.normalizedName.includes(tok)))
      ) {
        results.push({
          type: "college",
          title: org.name,
          badge: `${org.teamCount} ${org.teamCount === 1 ? "team" : "teams"}`,
          queryValue: org.name,
          slug: org.slug,
        });
      }
      if (results.length >= limit && mode === "college") break;
    }
  }

  // 2. Suggestions for Participants / Persons
  if (mode === "person" || (mode === "all" && results.length < limit)) {
    const allTeams = getAllTeams();
    const seenPersons = new Set<string>();

    for (const team of allTeams) {
      for (const player of team.players || []) {
        if (!player.name) continue;
        const pLower = player.name.toLowerCase();
        const pNorm = normalizeOrganization(player.name);

        if (
          pLower.includes(normQuery) ||
          pLower.includes(lowerQuery) ||
          (tokens.length > 1 && tokens.every((tok) => pLower.includes(tok)))
        ) {
          const key = `${player.name}::${player.organization || ""}`;
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
          }
        }
        if (results.length >= limit) break;
      }
      if (results.length >= limit) break;
    }
  }

  // 3. Suggestions for Teams
  if (mode === "team" || (mode === "all" && results.length < limit)) {
    const allTeams = getAllTeams();
    for (const team of allTeams) {
      const tLower = team.teamName.toLowerCase();
      if (
        tLower.includes(normQuery) ||
        tLower.includes(lowerQuery) ||
        (tokens.length > 1 && tokens.every((tok) => tLower.includes(tok)))
      ) {
        results.push({
          type: "team",
          title: team.teamName,
          subtitle: team.organizations.length > 0 ? team.organizations[0] : `Score: ${team.score}`,
          badge: `Rank #${team.rank}`,
          queryValue: team.teamName,
          teamId: team.teamId,
        });
      }
      if (results.length >= limit) break;
    }
  }

  return results.slice(0, limit);
}
