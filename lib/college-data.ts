import fs from "fs";
import path from "path";

export interface CollegeSummary {
  name: string;
  slug: string;
  normalizedName: string;
  teamCount: number;
  participantCount: number;
  bestRank: number | null;
  bestScore: number | null;
  teamsInTop100: number;
  teamsInTop500: number;
  growth: number | null;
  growthFormatted: string;
}

export interface DistributionBucket {
  label: string;
  range: string;
  count: number;
  percentage: number;
}

export interface CollegeGrowth {
  hasEnoughData: boolean;
  initialAvg: number | null;
  finalAvg: number | null;
  absoluteChange: number | null;
  growthFormatted: string;
  initialSnapshot: string | null;
  finalSnapshot: string | null;
}

export interface CollegeHistoricalScore {
  snapshotId: string;
  snapshotNumber: number;
  timestamp: string;
  dateFormatted: string;
  timeFormatted: string;
  avgScore: number;
  teamCount: number;
  bestScore: number | null;
  bestTeamName: string;
  bestTeamId: string;
}

export interface CollegeTeamRow {
  teamId: string;
  teamName: string;
  rank: number;
  score: string;
  scoreNumber: number;
  rankDelta: number;
  scoreDelta: number;
  playerCount: number;
  players: string[];
}

export interface CollegeProfile {
  name: string;
  slug: string;
  normalizedName: string;
  teamCount: number;
  participantCount: number;
  bestRank: number | null;
  bestScore: number | null;
  bestTeam: {
    teamId: string;
    teamName: string;
    rank: number | null;
    score: number | null;
  } | null;
  teamsInTop100: number;
  teamsInTop500: number;
  distribution: {
    top10: DistributionBucket;
    top100: DistributionBucket;
    top500: DistributionBucket;
    above500: DistributionBucket;
  };
  growth: CollegeGrowth;
  historicalScores: CollegeHistoricalScore[];
  teams: CollegeTeamRow[];
}

export interface CollegeLeaderboardTab<T> {
  title: string;
  description: string;
  total: number;
  data: T[];
}

export interface CollegeLeaderboards {
  finalPerformance: CollegeLeaderboardTab<{
    rank: number;
    name: string;
    slug: string;
    bestScore: number;
    bestRank: number | null;
    teamCount: number;
    participantCount: number;
  }>;
  participation: CollegeLeaderboardTab<{
    rank: number;
    name: string;
    slug: string;
    teamCount: number;
    participantCount: number;
    bestRank: number | null;
  }>;
  top100: CollegeLeaderboardTab<{
    rank: number;
    name: string;
    slug: string;
    teamsInTop100: number;
    teamCount: number;
    participantCount: number;
    bestRank: number | null;
  }>;
  growth: CollegeLeaderboardTab<{
    rank: number;
    name: string;
    slug: string;
    initialAvg: number;
    finalAvg: number;
    growth: number;
    growthFormatted: string;
    teamCount: number;
    initialSnapshot: string;
    finalSnapshot: string;
  }>;
}

export interface CompetitionScoreBucket {
  label: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
}

export interface SnapshotStat {
  snapshotId: string;
  snapshotNumber: number;
  timestamp: string;
  dateFormatted: string;
  timeFormatted: string;
  teamCount: number;
  participantCount: number;
  orgCount: number;
  avgScore: number;
  medianScore: number;
  minScore: number;
  maxScore: number;
  scoreBuckets: CompetitionScoreBucket[];
}

export interface CompetitionStatsData {
  summary: {
    totalTeams: number;
    totalParticipants: number;
    totalOrganizations: number;
    totalSnapshots: number;
    finalSnapshotTimestamp: string;
  };
  participationOverTime: Array<{
    snapshotId: string;
    snapshotNumber: number;
    timestamp: string;
    dateFormatted: string;
    timeFormatted: string;
    teams: number;
    participants: number;
    organizations: number;
  }>;
  snapshots: SnapshotStat[];
}

const DATA_DIR = path.join(process.cwd(), "data");

export function getCollegesSummary(): CollegeSummary[] {
  try {
    const filePath = path.join(DATA_DIR, "generated", "colleges-summary.json");
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error loading colleges summary:", error);
    return [];
  }
}

export function getCollegeProfile(slug: string): CollegeProfile | null {
  try {
    const filePath = path.join(DATA_DIR, "generated", "colleges", `${slug}.json`);
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading college profile for ${slug}:`, error);
    return null;
  }
}

export function getCollegeLeaderboards(): CollegeLeaderboards | null {
  try {
    const filePath = path.join(DATA_DIR, "generated", "colleges-leaderboard.json");
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error loading colleges leaderboard:", error);
    return null;
  }
}

export function getCompetitionStats(): CompetitionStatsData | null {
  try {
    const filePath = path.join(DATA_DIR, "generated", "competition-stats.json");
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error loading competition stats:", error);
    return null;
  }
}
