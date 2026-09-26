/**
 * Factual Analytics & Calculation Engine for Unstop ML Challenge Leaderboard.
 * Computes statistical summaries, organization comparisons, cross-college teams,
 * and advanced multi-dimensional leaderboard filters directly from the in-memory dataset.
 */

import { getAllOrganizations, getAllTeams, getOrganizationBySlug, getTeamById } from "./data";
import { normalizeOrganization } from "./normalize";
import type {
  CrossCollegeTeam,
  LeaderboardFilterOptions,
  OrganizationStats,
  ScoreDistributionBucket,
  Team,
} from "./types";

export function calculateMedian(numbers: number[]): number | null {
  if (numbers.length === 0) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

export function computeScoreBuckets(scores: number[]): ScoreDistributionBucket[] {
  if (scores.length === 0) return [];

  const bucketsDef = [
    { label: "≥ 0.985", min: 0.985, max: Infinity },
    { label: "0.950 – 0.985", min: 0.950, max: 0.985 },
    { label: "0.900 – 0.950", min: 0.900, max: 0.950 },
    { label: "0.800 – 0.900", min: 0.800, max: 0.900 },
    { label: "< 0.800", min: -Infinity, max: 0.800 },
  ];

  const total = scores.length;

  return bucketsDef.map((b) => {
    const count = scores.filter((s) => s >= b.min && s < b.max).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      label: b.label,
      min: b.min,
      max: b.max,
      count,
      percentage,
    };
  });
}

export function getOrganizationStats(slugOrName: string): OrganizationStats | null {
  const allOrgs = getAllOrganizations();
  let org = getOrganizationBySlug(slugOrName);

  if (!org) {
    const norm = normalizeOrganization(slugOrName);
    org = allOrgs.find((o) => o.normalizedName === norm) || null;
  }

  if (!org) return null;

  const teamIds = org.teamIds || [];
  const teams: Team[] = [];

  for (const tid of teamIds) {
    const t = getTeamById(tid);
    if (t) teams.push(t);
  }

  // Sort teams by rank ascending
  teams.sort((a, b) => a.sortRank - b.sortRank || a.teamName.localeCompare(b.teamName));

  const validRanks: number[] = [];
  const validScores: number[] = [];
  let totalTeamSize = 0;
  let top10Count = 0;
  let top25Count = 0;
  let top50Count = 0;
  let top100Count = 0;
  let crossCollegeTeamCount = 0;

  for (const t of teams) {
    if (t.sortRank < 9999999) {
      validRanks.push(t.sortRank);
      if (t.sortRank <= 10) top10Count++;
      if (t.sortRank <= 25) top25Count++;
      if (t.sortRank <= 50) top50Count++;
      if (t.sortRank <= 100) top100Count++;
    }

    const numScore = parseFloat(t.score);
    if (!isNaN(numScore)) {
      validScores.push(numScore);
    }

    const size = t.players?.length || 0;
    totalTeamSize += size;

    if (t.organizations && t.organizations.length > 1) {
      crossCollegeTeamCount++;
    }
  }

  const teamCount = teams.length;
  const bestRank = validRanks.length > 0 ? Math.min(...validRanks) : null;
  const bestScore = validScores.length > 0 ? Math.max(...validScores) : null;
  const lowestScore = validScores.length > 0 ? Math.min(...validScores) : null;
  const averageScore =
    validScores.length > 0
      ? validScores.reduce((sum, val) => sum + val, 0) / validScores.length
      : null;
  const medianScore = calculateMedian(validScores);
  const averageTeamSize = teamCount > 0 ? Math.round((totalTeamSize / teamCount) * 10) / 10 : 0;

  const scoreBuckets = computeScoreBuckets(validScores);

  return {
    organization: org,
    teamCount,
    playerCount: org.playerCount,
    bestRank,
    bestScore,
    lowestScore,
    averageScore,
    medianScore,
    top10Count,
    top25Count,
    top50Count,
    top100Count,
    averageTeamSize,
    crossCollegeTeamCount,
    scoreBuckets,
    teams,
  };
}

export function compareOrganizations(slugs: string[]): OrganizationStats[] {
  const results: OrganizationStats[] = [];
  const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean))).slice(0, 5);

  for (const slug of uniqueSlugs) {
    const stats = getOrganizationStats(slug);
    if (stats) {
      results.push(stats);
    }
  }

  return results;
}

export function getCrossCollegeTeams(options?: {
  sortBy?: "rank" | "institutions";
  minInstitutions?: number;
}): CrossCollegeTeam[] {
  const allTeams = getAllTeams();
  const minInst = options?.minInstitutions || 2;
  const crossTeams: CrossCollegeTeam[] = [];

  for (const t of allTeams) {
    const orgs = t.organizations || [];
    if (orgs.length >= minInst) {
      crossTeams.push({
        ...t,
        institutionCount: orgs.length,
        institutions: orgs,
      });
    }
  }

  if (options?.sortBy === "institutions") {
    crossTeams.sort(
      (a, b) =>
        b.institutionCount - a.institutionCount ||
        a.sortRank - b.sortRank ||
        a.teamName.localeCompare(b.teamName)
    );
  } else {
    crossTeams.sort((a, b) => a.sortRank - b.sortRank || a.teamName.localeCompare(b.teamName));
  }

  return crossTeams;
}

export function filterLeaderboard(options: LeaderboardFilterOptions = {}) {
  const allTeams = getAllTeams();
  const rankRange = options.rankRange || "all";
  const teamSize = options.teamSize || "all";
  const query = (options.query || "").trim().toLowerCase();
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.max(1, Math.min(100, options.pageSize || 24));

  let filtered = allTeams;

  // 1. Rank range filter
  if (rankRange === "top10") {
    filtered = filtered.filter((t) => t.sortRank <= 10);
  } else if (rankRange === "top25") {
    filtered = filtered.filter((t) => t.sortRank <= 25);
  } else if (rankRange === "top50") {
    filtered = filtered.filter((t) => t.sortRank <= 50);
  } else if (rankRange === "top100") {
    filtered = filtered.filter((t) => t.sortRank <= 100);
  }

  // 2. Team size filter
  if (teamSize !== "all") {
    const targetSize = parseInt(teamSize, 10);
    if (!isNaN(targetSize)) {
      if (targetSize >= 4) {
        filtered = filtered.filter((t) => (t.players?.length || 0) >= 4);
      } else {
        filtered = filtered.filter((t) => (t.players?.length || 0) === targetSize);
      }
    }
  }

  // 3. Query filter (matches organizations, team names, and player names)
  if (query) {
    filtered = filtered.filter((t) =>
      t.teamName.toLowerCase().includes(query) ||
      t.normalizedOrganizations.some((o) => o.includes(query)) ||
      (t.players && t.players.some((p) => (p.name || "").toLowerCase().includes(query)))
    );
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedTeams = filtered.slice(startIndex, startIndex + pageSize);

  return {
    total,
    page: safePage,
    pageSize,
    totalPages,
    teams: paginatedTeams,
  };
}
