/**
 * Women-Only Teams Analytics & Data Engine for Amazon ML Challenge 2026.
 *
 * Dedicated pipeline providing structured queries, search, sorting, and metrics
 * for candidate and verified all-female / women-only teams.
 */

import { getAllTeams } from "./data";
import { normalizeOrganization, slugifyOrganization, tokenizeQuery } from "./normalize";
import type { Team } from "./types";

export interface WomenTeamOrgRef {
  name: string;
  normalizedName: string;
  slug: string;
}

export interface WomenTeam extends Team {
  femaleVerified: boolean;
  memberCount: number;
  distinctColleges: WomenTeamOrgRef[];
  isInterCollege: boolean;
}

export interface WomenTeamsSummaryMetrics {
  totalWomenTeams: number;
  topRankedTeam: WomenTeam | null;
  highestScore: string;
  averageTeamSize: number;
  collegesRepresented: number;
}

export type WomenTeamSortOption = "rank" | "score" | "members" | "name";

export interface WomenTeamFilterOptions {
  query?: string;
  teamSize?: "all" | "1" | "2" | "3" | "4";
  sort?: WomenTeamSortOption;
  page?: number;
  pageSize?: number;
}

export interface WomenTeamQueryResult {
  teams: WomenTeam[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sort: WomenTeamSortOption;
  teamSizeFilter: string;
  query: string;
  summary: WomenTeamsSummaryMetrics;
}

const CANDIDATE_WOMEN_TEAM_IDS = new Set([
  "59285973", "59242486", "59415873", "59343244", "58992198",
  "59420117", "59309471", "58879454", "58931394", "58832843",
  "59126689", "58850212", "59359689", "59316830", "58742119",
  "59204354", "59139814", "58795721", "59349469", "59324386",
  "59341794", "59351873", "59318481", "58922338", "58995038",
  "58834266", "59003516", "59068839", "59356268",
]);

let cachedWomenTeams: WomenTeam[] | null = null;
let cachedSummary: WomenTeamsSummaryMetrics | null = null;

function computeWomenTeamsState(): { teams: WomenTeam[]; summary: WomenTeamsSummaryMetrics } {
  const allTeams = getAllTeams();
  const womenTeams: WomenTeam[] = [];
  const collegeMap = new Set<string>();

  for (const t of allTeams) {
    const tid = String(t.teamId).trim();
    if (!CANDIDATE_WOMEN_TEAM_IDS.has(tid)) {
      continue;
    }

    const orgRefs: WomenTeamOrgRef[] = [];
    const seenOrgSlugs = new Set<string>();

    for (const player of t.players || []) {
      const orgName = (player.organization || "").trim();
      if (!orgName) continue;
      const norm = normalizeOrganization(orgName);
      const slug = slugifyOrganization(norm);
      if (!seenOrgSlugs.has(slug)) {
        seenOrgSlugs.add(slug);
        orgRefs.push({
          name: orgName,
          normalizedName: norm,
          slug,
        });
        collegeMap.add(slug);
      }
    }

    const memberCount = (t.players || []).length;

    womenTeams.push({
      ...t,
      femaleVerified: true,
      memberCount,
      distinctColleges: orgRefs,
      isInterCollege: orgRefs.length > 1,
    });
  }

  // Sort by rank ascending by default
  womenTeams.sort((a, b) => (a.sortRank || 999999) - (b.sortRank || 999999));

  const total = womenTeams.length;
  const topTeam = womenTeams.length > 0 ? womenTeams[0] : null;
  const highestScore = topTeam ? topTeam.score : "0.000000";
  const totalMembers = womenTeams.reduce((acc, t) => acc + t.memberCount, 0);
  const averageTeamSize = total > 0 ? Math.round((totalMembers / total) * 10) / 10 : 0;

  const summary: WomenTeamsSummaryMetrics = {
    totalWomenTeams: total,
    topRankedTeam: topTeam,
    highestScore,
    averageTeamSize,
    collegesRepresented: collegeMap.size,
  };

  return { teams: womenTeams, summary };
}

export function getAllWomenTeams(): WomenTeam[] {
  if (!cachedWomenTeams) {
    const state = computeWomenTeamsState();
    cachedWomenTeams = state.teams;
    cachedSummary = state.summary;
  }
  return cachedWomenTeams;
}

export function getWomenTeamsSummary(): WomenTeamsSummaryMetrics {
  if (!cachedSummary) {
    const state = computeWomenTeamsState();
    cachedWomenTeams = state.teams;
    cachedSummary = state.summary;
  }
  return cachedSummary;
}

export function getWomenTeams(options: WomenTeamFilterOptions = {}): WomenTeamQueryResult {
  const allWomenTeams = getAllWomenTeams();
  const summary = getWomenTeamsSummary();

  const sort = options.sort || "rank";
  const teamSizeFilter = options.teamSize || "all";
  const query = (options.query || "").trim();
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.max(1, Math.min(100, options.pageSize || 24));

  let filtered = allWomenTeams;

  // 1. Team Size Filter
  if (teamSizeFilter !== "all") {
    const targetSize = parseInt(teamSizeFilter, 10);
    if (!isNaN(targetSize)) {
      filtered = filtered.filter((t) => t.memberCount === targetSize);
    }
  }

  // 2. Search Query Filter
  if (query) {
    const tokens = tokenizeQuery(query);
    filtered = filtered.filter((team) => {
      const matchName = team.teamName.toLowerCase();
      const matchId = String(team.teamId).toLowerCase();
      const matchScore = team.score.toLowerCase();
      const matchRank = String(team.sortRank);

      const memberNames = (team.players || []).map((p) => p.name.toLowerCase()).join(" ");
      const orgNames = (team.players || []).map((p) => p.organization.toLowerCase()).join(" ");

      return tokens.every(
        (token) =>
          matchName.includes(token) ||
          matchId.includes(token) ||
          matchScore.includes(token) ||
          matchRank.includes(token) ||
          memberNames.includes(token) ||
          orgNames.includes(token)
      );
    });
  }

  // 3. Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "score") {
      const scoreDiff = parseFloat(b.score || "0") - parseFloat(a.score || "0");
      if (scoreDiff !== 0) return scoreDiff;
      return (a.sortRank || 999999) - (b.sortRank || 999999);
    }
    if (sort === "members") {
      const memDiff = b.memberCount - a.memberCount;
      if (memDiff !== 0) return memDiff;
      return (a.sortRank || 999999) - (b.sortRank || 999999);
    }
    if (sort === "name") {
      return a.teamName.localeCompare(b.teamName);
    }
    // Default: rank
    return (a.sortRank || 999999) - (b.sortRank || 999999);
  });

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTeams = sorted.slice(startIndex, startIndex + pageSize);

  return {
    teams: paginatedTeams,
    total,
    page: currentPage,
    pageSize,
    totalPages,
    sort,
    teamSizeFilter,
    query,
    summary,
  };
}
