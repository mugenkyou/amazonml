export interface Player {
  name: string;
  organization: string;
  normalizedOrganization: string;
  playerIndex: number;
}

export interface Team {
  teamId: string;
  teamName: string;
  rank: string;
  sortRank: number;
  score: string;
  finishTime: string;
  hasPlayed: string;
  proctoringScore: string;
  isBlacklisted: string;
  players: Player[];
  organizations: string[];
  normalizedOrganizations: string[];
  previousRank?: number | null;
  rankDelta?: number;
  previousScore?: string | null;
  scoreDelta?: number;
  status?: "new" | "active" | "missing";
  lastUpdated?: string;
}

export interface HistoricalObservation {
  snapshotId: string;
  timestamp: string;
  rank: number | null;
  score: string | null;
  status: "new" | "active" | "missing";
  previousRank: number | null;
  rankDelta: number;
  previousScore: string | null;
  scoreDelta: number;
  finishTime?: string | null;
}

export interface TeamHistoryRecord {
  teamId: string;
  teamName: string;
  firstObserved: string;
  history: HistoricalObservation[];
}

export interface ChangeEvent {
  timestamp: string;
  snapshotId: string;
  teamId: string;
  teamName: string;
  status: "new" | "active" | "missing";
  previousRank: number | null;
  newRank: number | null;
  rankDelta: number;
  previousScore: string | null;
  newScore: string | null;
  scoreDelta: number;
}

export interface SnapshotMeta {
  snapshotId: string;
  commit: string;
  timestamp: string;
  source: string;
  teamCount: number;
  changesCount: number;
}

export interface TeamMoverSummary {
  teamId: string;
  teamName: string;
  rank: number | null;
  previousRank: number | null;
  rankDelta: number;
  score: string | null;
  previousScore: string | null;
  scoreDelta: number;
  status: "new" | "active" | "missing";
  timestamp: string;
}

export interface MoversData {
  latestSnapshotId: string | null;
  latestTimestamp: string | null;
  topClimbers: TeamMoverSummary[];
  topFallers: TeamMoverSummary[];
  topScoreGainers: TeamMoverSummary[];
  newTeams: TeamMoverSummary[];
}

export interface Organization {
  name: string;
  normalizedName: string;
  slug: string;
  teamCount: number;
  playerCount: number;
  teamIds?: string[];
}

export interface DatasetMetadata {
  challengeId: string;
  collectionStartedAt: string | null;
  collectionFinishedAt: string | null;
  recordsCollected: number;
  uniqueTeams: number;
  uniquePlayers: number;
  uniqueOrganizations: number;
  complete: boolean;
  failedPages?: number[];
  sourceEndpoint: string;
}

export type SearchMode = "all" | "college" | "person" | "team";

export interface SearchSuggestion {
  type: "college" | "person" | "team";
  title: string;
  subtitle?: string;
  badge?: string;
  slug?: string;
  teamId?: string;
  queryValue: string;
}

export interface SearchResultTeam extends Team {
  matchedOrganizations: string[];
  matchedPlayers: Player[];
  matchedReasons?: string[];
}

export interface SearchResponse {
  query: string;
  mode: SearchMode;
  exact: boolean;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  teams: SearchResultTeam[];
}

export interface ScoreDistributionBucket {
  label: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
}

export interface OrganizationStats {
  organization: Organization;
  teamCount: number;
  playerCount: number;
  bestRank: number | null;
  bestScore: number | null;
  lowestScore: number | null;
  averageScore: number | null;
  medianScore: number | null;
  top10Count: number;
  top25Count: number;
  top50Count: number;
  top100Count: number;
  averageTeamSize: number;
  crossCollegeTeamCount: number;
  scoreBuckets: ScoreDistributionBucket[];
  teams: Team[];
}

export interface CrossCollegeTeam extends Team {
  institutionCount: number;
  institutions: string[];
}

export interface LeaderboardFilterOptions {
  rankRange?: "all" | "top10" | "top25" | "top50" | "top100";
  teamSize?: "all" | "1" | "2" | "3" | "4";
  query?: string;
  page?: number;
  pageSize?: number;
}
