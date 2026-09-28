/**
 * College Leaderboard Engine for Amazon ML Challenge 2026.
 * Derives comprehensive college/university rankings from the existing dataset snapshot.
 */

import { getAllOrganizations, getAllTeams, getTeamById } from "./data";
import { normalizeOrganization, tokenizeQuery } from "./normalize";
import type { Organization, Team } from "./types";

export type CollegeSortMetric =
  | "overall"
  | "best-rank"
  | "avg-rank"
  | "top5-avg-rank"
  | "top10-avg-rank"
  | "teams"
  | "participants"
  | "best-score";

export interface CollegeLeaderboardEntry {
  rank: number;
  name: string;
  normalizedName: string;
  slug: string;
  teamCount: number;
  playerCount: number;
  bestRank: number | null;
  bestScore: number | null;
  avgRank: number | null;
  top5AvgRank: number | null;
  top10AvgRank: number | null;
  avgScore: number | null;
  top10Count: number;
  top25Count: number;
  top50Count: number;
  top100Count: number;
  crossCollegeTeamCount: number;
  overallScore: number;
}

export interface CollegeLeaderboardFilterOptions {
  metric?: CollegeSortMetric;
  tier?: "all" | "top10" | "top25" | "top50" | "top100";
  query?: string;
  page?: number;
  pageSize?: number;
}

export interface CollegeLeaderboardResult {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  metric: CollegeSortMetric;
  tier: "all" | "top10" | "top25" | "top50" | "top100";
  query: string;
  colleges: CollegeLeaderboardEntry[];
  top3Colleges: CollegeLeaderboardEntry[];
  summaryStats: {
    totalColleges: number;
    totalTeamsEvaluated: number;
    totalParticipants: number;
    collegesWithTop10: number;
    collegesWithTop100: number;
  };
}

let cachedLeaderboardEntries: CollegeLeaderboardEntry[] | null = null;

function computeAverage(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const sum = nums.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / nums.length) * 10) / 10;
}

export function computeCollegeLeaderboardEntries(): CollegeLeaderboardEntry[] {
  if (cachedLeaderboardEntries) {
    return cachedLeaderboardEntries;
  }

  const organizations = getAllOrganizations();
  const allTeams = getAllTeams();
  const totalTeamsCount = Math.max(allTeams.length, 4334);

  const entries: CollegeLeaderboardEntry[] = [];

  for (const org of organizations) {
    const rawTeamIds = org.teamIds || [];
    const uniqueTeamIds: string[] = Array.from(new Set(rawTeamIds));

    const teams: Team[] = [];
    for (const tid of uniqueTeamIds) {
      const t = getTeamById(tid);

      if (t) {
        teams.push(t);
      }
    }

    // Sort teams by rank ascending (1 is best)
    teams.sort((a, b) => a.sortRank - b.sortRank || a.teamName.localeCompare(b.teamName));

    const validRanks: number[] = [];
    const validScores: number[] = [];
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

      if (t.organizations && t.organizations.length > 1) {
        crossCollegeTeamCount++;
      }
    }

    const teamCount = teams.length;
    const playerCount = org.playerCount || 0;
    const bestRank = validRanks.length > 0 ? Math.min(...validRanks) : null;
    const bestScore = validScores.length > 0 ? Math.max(...validScores) : null;
    const avgRank = computeAverage(validRanks);
    const avgScore =
      validScores.length > 0
        ? Math.round((validScores.reduce((s, v) => s + v, 0) / validScores.length) * 1000000) /
          1000000
        : null;

    // Top 5 and Top 10 average ranks
    const top5Ranks = validRanks.slice(0, 5);
    const top5AvgRank = computeAverage(top5Ranks);

    const top10Ranks = validRanks.slice(0, 10);
    const top10AvgRank = computeAverage(top10Ranks);

    // Compute Overall Performance Composite Score (0.0 to 100.0)
    // Formula components:
    // 1. Best Rank Percentile (35%): Best team's position on leaderboard
    const bestRankScore = bestRank
      ? Math.max(0, ((totalTeamsCount - bestRank + 1) / totalTeamsCount) * 100)
      : 0;

    // 2. Top-5 Depth Quality (35%): Average rank of up to top 5 teams
    const top5Score = top5AvgRank
      ? Math.max(0, ((totalTeamsCount - top5AvgRank + 1) / totalTeamsCount) * 100)
      : 0;

    // 3. Elite Tier Placements (20%): Bonus for placing teams in top tiers
    const tierPoints = Math.min(
      100,
      top10Count * 40 + top25Count * 25 + top50Count * 15 + top100Count * 5
    );

    // 4. Quality Metric / Best Score (10%): Raw highest model score achieved
    const bestScoreFactor = bestScore ? Math.max(0, Math.min(100, bestScore * 100)) : 0;

    const overallScore =
      teamCount > 0
        ? Math.round(
            (bestRankScore * 0.35 +
              top5Score * 0.35 +
              tierPoints * 0.2 +
              bestScoreFactor * 0.1) *
              10
          ) / 10
        : 0;

    entries.push({
      rank: 0, // Assigned after sorting
      name: org.name,
      normalizedName: org.normalizedName || normalizeOrganization(org.name),
      slug: org.slug,
      teamCount,
      playerCount,
      bestRank,
      bestScore,
      avgRank,
      top5AvgRank,
      top10AvgRank,
      avgScore,
      top10Count,
      top25Count,
      top50Count,
      top100Count,
      crossCollegeTeamCount,
      overallScore,
    });
  }

  cachedLeaderboardEntries = entries;
  return entries;
}

export function getCollegeLeaderboard(
  options: CollegeLeaderboardFilterOptions = {}
): CollegeLeaderboardResult {
  const allEntries = computeCollegeLeaderboardEntries();
  const metric: CollegeSortMetric = options.metric || "overall";
  const tier = options.tier || "all";
  const query = (options.query || "").trim();
  const page = Math.max(1, options.page || 1);
  const pageSize = Math.max(1, Math.min(100, options.pageSize || 25));

  // 1. Sort all entries by the chosen metric to establish rankings
  const sorted = [...allEntries].sort((a, b) => {
    switch (metric) {
      case "overall":
        // Higher overall score is better; tie-break with bestRank ascending, then top5AvgRank, then name
        return (
          b.overallScore - a.overallScore ||
          (a.bestRank || 999999) - (b.bestRank || 999999) ||
          (a.top5AvgRank || 999999) - (b.top5AvgRank || 999999) ||
          b.teamCount - a.teamCount ||
          a.name.localeCompare(b.name)
        );

      case "best-rank":
        // Lower rank number is better (1 is top); unranked last
        const aBest = a.bestRank !== null ? a.bestRank : 999999;
        const bBest = b.bestRank !== null ? b.bestRank : 999999;
        return (
          aBest - bBest ||
          (a.top5AvgRank || 999999) - (b.top5AvgRank || 999999) ||
          b.teamCount - a.teamCount ||
          a.name.localeCompare(b.name)
        );

      case "avg-rank":
        // Lower avg rank number is better
        const aAvg = a.avgRank !== null ? a.avgRank : 999999;
        const bAvg = b.avgRank !== null ? b.avgRank : 999999;
        return (
          aAvg - bAvg ||
          (a.bestRank || 999999) - (b.bestRank || 999999) ||
          b.teamCount - a.teamCount ||
          a.name.localeCompare(b.name)
        );

      case "top5-avg-rank":
        const aTop5 = a.top5AvgRank !== null ? a.top5AvgRank : 999999;
        const bTop5 = b.top5AvgRank !== null ? b.top5AvgRank : 999999;
        return (
          aTop5 - bTop5 ||
          (a.bestRank || 999999) - (b.bestRank || 999999) ||
          b.teamCount - a.teamCount ||
          a.name.localeCompare(b.name)
        );

      case "top10-avg-rank":
        const aTop10 = a.top10AvgRank !== null ? a.top10AvgRank : 999999;
        const bTop10 = b.top10AvgRank !== null ? b.top10AvgRank : 999999;
        return (
          aTop10 - bTop10 ||
          (a.bestRank || 999999) - (b.bestRank || 999999) ||
          b.teamCount - a.teamCount ||
          a.name.localeCompare(b.name)
        );

      case "teams":
        return (
          b.teamCount - a.teamCount ||
          (a.bestRank || 999999) - (b.bestRank || 999999) ||
          a.name.localeCompare(b.name)
        );

      case "participants":
        return (
          b.playerCount - a.playerCount ||
          b.teamCount - a.teamCount ||
          (a.bestRank || 999999) - (b.bestRank || 999999) ||
          a.name.localeCompare(b.name)
        );

      case "best-score":
        const aScore = a.bestScore !== null ? a.bestScore : -1;
        const bScore = b.bestScore !== null ? b.bestScore : -1;
        return (
          bScore - aScore ||
          (a.bestRank || 999999) - (b.bestRank || 999999) ||
          a.name.localeCompare(b.name)
        );

      default:
        return b.overallScore - a.overallScore || a.name.localeCompare(b.name);
    }
  });

  // Assign leaderboard rank based on sorted order
  const rankedEntries = sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  const top3Colleges = rankedEntries.slice(0, 3);

  // 2. Filter by rank tier if specified
  let filtered = rankedEntries;
  if (tier === "top10") {
    filtered = filtered.filter((e) => e.rank <= 10);
  } else if (tier === "top25") {
    filtered = filtered.filter((e) => e.rank <= 25);
  } else if (tier === "top50") {
    filtered = filtered.filter((e) => e.rank <= 50);
  } else if (tier === "top100") {
    filtered = filtered.filter((e) => e.rank <= 100);
  }

  // 3. Filter by search query if provided
  if (query) {
    const tokens = tokenizeQuery(query);
    filtered = filtered.filter((entry) => {
      const norm = entry.normalizedName;
      return tokens.every((token) => norm.includes(token));
    });
  }

  // 4. Compute Summary Stats across the entire dataset
  const collegesWithTop10 = allEntries.filter((e) => e.top10Count > 0).length;
  const collegesWithTop100 = allEntries.filter((e) => e.top100Count > 0).length;
  const totalParticipants = allEntries.reduce((sum, e) => sum + e.playerCount, 0);

  // 5. Paginate
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedColleges = filtered.slice(startIndex, startIndex + pageSize);

  return {
    total,
    page: safePage,
    pageSize,
    totalPages,
    metric,
    tier,
    query,
    colleges: paginatedColleges,
    top3Colleges,
    summaryStats: {
      totalColleges: allEntries.length,
      totalTeamsEvaluated: 4334,
      totalParticipants,
      collegesWithTop10,
      collegesWithTop100,
    },
  };
}
