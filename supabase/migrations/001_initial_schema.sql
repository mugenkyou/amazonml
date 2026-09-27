-- Migration 001: Initial Schema for Amazon ML Challenge Explorer
-- Enables strict typing, numeric precision for F1 scores, deterministic identities, and relational integrity.

CREATE TABLE IF NOT EXISTS teams (
    id BIGSERIAL PRIMARY KEY,
    team_id VARCHAR(64) NOT NULL UNIQUE,
    team_name TEXT NOT NULL,
    rank INTEGER,
    sort_rank INTEGER NOT NULL DEFAULT 9999999,
    f1_score NUMERIC(10, 6) NOT NULL DEFAULT 0.000000,
    f1_score_str VARCHAR(32) NOT NULL DEFAULT '0.000000',
    previous_rank INTEGER,
    previous_f1_score NUMERIC(10, 6),
    previous_f1_score_str VARCHAR(32),
    rank_delta INTEGER DEFAULT 0,
    score_delta NUMERIC(10, 6) DEFAULT 0.000000,
    finish_time TEXT,
    has_played BOOLEAN DEFAULT FALSE,
    proctoring_score TEXT,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    is_inter_college BOOLEAN DEFAULT FALSE,
    college_count INTEGER DEFAULT 1,
    status VARCHAR(32) DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organizations (
    id BIGSERIAL PRIMARY KEY,
    organization_key VARCHAR(255) NOT NULL UNIQUE,
    organization_name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    team_count INTEGER NOT NULL DEFAULT 0,
    player_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
    id BIGSERIAL PRIMARY KEY,
    player_key VARCHAR(255) NOT NULL UNIQUE,
    team_id VARCHAR(64) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    organization TEXT NOT NULL DEFAULT '',
    normalized_organization TEXT NOT NULL DEFAULT '',
    player_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_organizations (
    id BIGSERIAL PRIMARY KEY,
    team_id VARCHAR(64) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    organization_slug VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, organization_id)
);

CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id BIGSERIAL PRIMARY KEY,
    snapshot_key VARCHAR(128) NOT NULL UNIQUE,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source VARCHAR(128) NOT NULL DEFAULT 'sync',
    commit_hash VARCHAR(64),
    total_teams INTEGER NOT NULL DEFAULT 0,
    total_participants INTEGER NOT NULL DEFAULT 0,
    changes_count INTEGER NOT NULL DEFAULT 0,
    collection_version VARCHAR(32) DEFAULT '2026.1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_snapshot_scores (
    id BIGSERIAL PRIMARY KEY,
    snapshot_id BIGINT NOT NULL REFERENCES leaderboard_snapshots(id) ON DELETE CASCADE,
    team_id VARCHAR(64) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    rank INTEGER,
    f1_score NUMERIC(10, 6) NOT NULL DEFAULT 0.000000,
    f1_score_str VARCHAR(32) NOT NULL DEFAULT '0.000000',
    previous_rank INTEGER,
    rank_delta INTEGER DEFAULT 0,
    previous_score NUMERIC(10, 6),
    score_delta NUMERIC(10, 6) DEFAULT 0.000000,
    status VARCHAR(32) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(snapshot_id, team_id)
);

CREATE TABLE IF NOT EXISTS sync_runs (
    id BIGSERIAL PRIMARY KEY,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'running',
    teams_fetched INTEGER NOT NULL DEFAULT 0,
    participants_fetched INTEGER NOT NULL DEFAULT 0,
    teams_changed INTEGER NOT NULL DEFAULT 0,
    teams_added INTEGER NOT NULL DEFAULT 0,
    teams_removed INTEGER NOT NULL DEFAULT 0,
    snapshot_id BIGINT REFERENCES leaderboard_snapshots(id) ON DELETE SET NULL,
    error_message TEXT,
    source VARCHAR(128) NOT NULL DEFAULT 'python_collector',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
