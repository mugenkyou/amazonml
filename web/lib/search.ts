/**
 * Search Engine for Organization and Team lookups across the complete dataset.
 */

import { getAllOrganizations, getAllTeams } from "./data";
import { normalizeOrganization, tokenizeQuery } from "./normalize";
import type { Organization, SearchResponse, SearchResultTeam, Team } from "./types";

export interface SearchOptions {
  exact?: boolean;
  page?: number;
  pageSize?: number;
}

export function searchTeams(
  rawQuery?: string | null,
  options: SearchOptions = {}
): SearchResponse {
  const query = (rawQuery || "").trim();
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

  const matchedTeamsList: SearchResultTeam[] = [];

  for (const team of allTeams) {
    let teamMatches = false;
    const matchedOrgsSet = new Set<string>();

    // 1. Check exact match
    if (exact) {
      for (let i = 0; i < team.normalizedOrganizations.length; i++) {
        if (team.normalizedOrganizations[i] === normQuery) {
          teamMatches = true;
          matchedOrgsSet.add(team.organizations[i]);
        }
      }
    } else {
      // 2. Substring & Token matching
      for (let i = 0; i < team.normalizedOrganizations.length; i++) {
        const normOrg = team.normalizedOrganizations[i];
        if (!normOrg) continue;

        // Substring match
        if (normOrg.includes(normQuery)) {
          teamMatches = true;
          matchedOrgsSet.add(team.organizations[i]);
          continue;
        }

        // Token match: if all query tokens appear in the organization name
        if (tokens.length > 1) {
          const allTokensMatch = tokens.every((token) => normOrg.includes(token));
          if (allTokensMatch) {
            teamMatches = true;
            matchedOrgsSet.add(team.organizations[i]);
          }
        }
      }
    }

    if (teamMatches) {
      const matchedOrgs = Array.from(matchedOrgsSet);
      // Filter players who belong to the matched organizations
      const matchedPlayers = team.players.filter((p) => {
        if (!p.organization) return false;
        const pNorm = p.normalizedOrganization;
        if (exact) return pNorm === normQuery;
        if (pNorm.includes(normQuery)) return true;
        if (tokens.length > 1 && tokens.every((tok) => pNorm.includes(tok))) return true;
        return false;
      });

      matchedTeamsList.push({
        ...team,
        matchedOrganizations: matchedOrgs.length > 0 ? matchedOrgs : team.organizations,
        matchedPlayers: matchedPlayers.length > 0 ? matchedPlayers : team.players,
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
