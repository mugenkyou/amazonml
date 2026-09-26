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

export interface SearchResultTeam extends Team {
  matchedOrganizations: string[];
  matchedPlayers: Player[];
}

export interface SearchResponse {
  query: string;
  exact: boolean;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  teams: SearchResultTeam[];
}
