import fs from "fs";
import path from "path";

export interface RaceRecord {
  date: string;
  name: string;
  team_id: string;
  value: number;
  score?: number;
  rank: number;
  recorded_rank: number;
  group: string;
  color: string;
  is_new_to_top50?: boolean;
  rank_delta?: number;
}

export interface SnapshotRaceMeta {
  snapshotNumber: number;
  snapshotId: string;
  timestamp: string;
  dateFormatted: string;
  timeFormatted: string;
  dateKey: string;
  dateLabel: string;
  teamCount: number;
  top50Count: number;
  newEntriesCount: number;
  droppedEntriesCount: number;
  leader?: {
    team_id: string;
    team_name: string;
    rank: number;
    score: number;
    score_str: string;
    organization: string;
  } | null;
  top5?: any[];
}

export interface RaceMetadata {
  total_snapshots: number;
  top_n: number;
  total_race_records: number;
  unique_teams_in_top50: number;
  earliest_snapshot: string;
  latest_snapshot: string;
  final_leader?: {
    team_id: string;
    team_name: string;
    rank: number;
    score: number;
    score_str: string;
    organization: string;
  } | null;
  final_top50?: RaceRecord[];
  created_at: string;
}

function getRaceDirectory(): string {
  return path.resolve(process.cwd(), "data/leaderboard-race");
}

export function getRaceData(): RaceRecord[] {
  const filePath = path.join(getRaceDirectory(), "race-data.json");
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      return [];
    }
  }
  return [];
}

export function getRaceMetadata(): RaceMetadata {
  const defaultMeta: RaceMetadata = {
    total_snapshots: 34,
    top_n: 50,
    total_race_records: 1650,
    unique_teams_in_top50: 161,
    earliest_snapshot: "2026-09-26T12:10:09+05:30",
    latest_snapshot: "2026-09-27T18:34:36.366546+00:00",
    created_at: new Date().toISOString(),
  };

  const filePath = path.join(getRaceDirectory(), "metadata.json");
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      return defaultMeta;
    }
  }
  return defaultMeta;
}

export function getRaceSnapshotsMeta(): SnapshotRaceMeta[] {
  const filePath = path.join(getRaceDirectory(), "snapshots-meta.json");
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      return [];
    }
  }
  return [];
}
