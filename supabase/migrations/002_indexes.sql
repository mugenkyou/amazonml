-- Migration 002: Indexes for High-Performance Leaderboard, Filtering, Search & History Queries

-- Teams Indexes
CREATE INDEX IF NOT EXISTS idx_teams_team_id ON teams(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_rank ON teams(rank);
CREATE INDEX IF NOT EXISTS idx_teams_sort_rank ON teams(sort_rank);
CREATE INDEX IF NOT EXISTS idx_teams_f1_score ON teams(f1_score DESC);
CREATE INDEX IF NOT EXISTS idx_teams_updated_at ON teams(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_teams_last_seen_at ON teams(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_teams_is_inter_college ON teams(is_inter_college);
CREATE INDEX IF NOT EXISTS idx_teams_is_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_teams_team_name_trgm ON teams USING gin(to_tsvector('simple', team_name));

-- Organizations Indexes
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_orgs_norm_name ON organizations(normalized_name);
CREATE INDEX IF NOT EXISTS idx_orgs_key ON organizations(organization_key);
CREATE INDEX IF NOT EXISTS idx_orgs_team_count ON organizations(team_count DESC);
CREATE INDEX IF NOT EXISTS idx_orgs_name_trgm ON organizations USING gin(to_tsvector('simple', organization_name));

-- Players Indexes
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_norm_org ON players(normalized_organization);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(player_name);
CREATE INDEX IF NOT EXISTS idx_players_name_trgm ON players USING gin(to_tsvector('simple', player_name));

-- Team Organizations Junction Indexes
CREATE INDEX IF NOT EXISTS idx_team_orgs_team_id ON team_organizations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_orgs_org_id ON team_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_orgs_slug ON team_organizations(organization_slug);

-- Leaderboard Snapshots Indexes
CREATE INDEX IF NOT EXISTS idx_snapshots_captured_at ON leaderboard_snapshots(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_key ON leaderboard_snapshots(snapshot_key);

-- Team Snapshot Scores Indexes
CREATE INDEX IF NOT EXISTS idx_snapshot_scores_snapshot_id ON team_snapshot_scores(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_scores_team_id ON team_snapshot_scores(team_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_scores_team_snapshot ON team_snapshot_scores(team_id, snapshot_id DESC);
CREATE INDEX IF NOT EXISTS idx_snapshot_scores_rank ON team_snapshot_scores(rank);

-- Sync Runs Indexes
CREATE INDEX IF NOT EXISTS idx_sync_runs_started_at ON sync_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_runs_status ON sync_runs(status);
