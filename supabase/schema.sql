-- ==============================================================================
-- Amazon ML Challenge 2026 Historical Archive - Supabase PostgreSQL Schema
-- File: Final/supabase/schema.sql
-- ==============================================================================
-- This schema represents the permanent relational database structure for the
-- historical Amazon ML Challenge 2026 archive dataset.
-- ==============================================================================

-- 1. Organizations / Colleges
CREATE TABLE IF NOT EXISTS public.organizations (
    id BIGSERIAL PRIMARY KEY,
    organization_key TEXT UNIQUE NOT NULL,
    organization_name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    team_count INTEGER DEFAULT 0,
    player_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for Organizations
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_norm_name ON public.organizations(normalized_name);
CREATE INDEX IF NOT EXISTS idx_organizations_team_count ON public.organizations(team_count DESC);
CREATE INDEX IF NOT EXISTS idx_organizations_player_count ON public.organizations(player_count DESC);


-- 2. Teams (Canonical Team ID is record.team.id)
CREATE TABLE IF NOT EXISTS public.teams (
    id BIGSERIAL PRIMARY KEY,
    team_id TEXT UNIQUE NOT NULL, -- Canonical Team ID (e.g. "58686151")
    team_name TEXT NOT NULL,
    rank INTEGER,
    sort_rank INTEGER NOT NULL DEFAULT 9999999,
    f1_score DOUBLE PRECISION DEFAULT 0.0,
    f1_score_str TEXT DEFAULT '0.000000',
    previous_rank INTEGER,
    previous_f1_score DOUBLE PRECISION,
    previous_f1_score_str TEXT,
    rank_delta INTEGER DEFAULT 0,
    score_delta DOUBLE PRECISION DEFAULT 0.0,
    finish_time TEXT,
    has_played BOOLEAN DEFAULT FALSE,
    proctoring_score TEXT,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    is_inter_college BOOLEAN DEFAULT FALSE,
    college_count INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_seen_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for Teams
CREATE INDEX IF NOT EXISTS idx_teams_team_id ON public.teams(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_rank ON public.teams(rank ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_teams_sort_rank ON public.teams(sort_rank ASC);
CREATE INDEX IF NOT EXISTS idx_teams_f1_score ON public.teams(f1_score DESC);
CREATE INDEX IF NOT EXISTS idx_teams_is_inter_college ON public.teams(is_inter_college);
CREATE INDEX IF NOT EXISTS idx_teams_name_trgm ON public.teams USING gin (to_tsvector('english', team_name));


-- 3. Players / Participants
CREATE TABLE IF NOT EXISTS public.players (
    id BIGSERIAL PRIMARY KEY,
    player_key TEXT UNIQUE NOT NULL, -- composite: team_id:player_index:normalized_name
    team_id TEXT NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    organization TEXT,
    normalized_organization TEXT,
    player_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_seen_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for Players
CREATE INDEX IF NOT EXISTS idx_players_team_id ON public.players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_norm_org ON public.players(normalized_organization);
CREATE INDEX IF NOT EXISTS idx_players_name ON public.players(player_name);


-- 4. Team Organizations (Many-to-Many Bridge)
CREATE TABLE IF NOT EXISTS public.team_organizations (
    id BIGSERIAL PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
    organization_id BIGINT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    organization_slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_team_org UNIQUE (team_id, organization_id)
);

-- Indexes for Team Organizations
CREATE INDEX IF NOT EXISTS idx_team_org_team_id ON public.team_organizations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_org_org_id ON public.team_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_org_slug ON public.team_organizations(organization_slug);


-- 5. Leaderboard Snapshots (Timeline captures)
CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
    id BIGSERIAL PRIMARY KEY,
    snapshot_key TEXT UNIQUE NOT NULL, -- e.g. "snap_2026-09-27T14-03-17..."
    captured_at TIMESTAMPTZ NOT NULL,
    source TEXT DEFAULT 'historical_archive',
    commit_hash TEXT,
    total_teams INTEGER DEFAULT 0,
    total_participants INTEGER DEFAULT 0,
    changes_count INTEGER DEFAULT 0,
    collection_version TEXT DEFAULT '2026.1',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for Leaderboard Snapshots
CREATE INDEX IF NOT EXISTS idx_snapshots_key ON public.leaderboard_snapshots(snapshot_key);
CREATE INDEX IF NOT EXISTS idx_snapshots_captured_at ON public.leaderboard_snapshots(captured_at ASC);


-- 6. Team Snapshot Scores / Leaderboard History
-- CRITICAL INTEGRITY: ONE TEAM + ONE SNAPSHOT = ONE HISTORICAL RECORD
CREATE TABLE IF NOT EXISTS public.team_snapshot_scores (
    id BIGSERIAL PRIMARY KEY,
    snapshot_id BIGINT NOT NULL REFERENCES public.leaderboard_snapshots(id) ON DELETE CASCADE,
    team_id TEXT NOT NULL REFERENCES public.teams(team_id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    f1_score DOUBLE PRECISION NOT NULL,
    f1_score_str TEXT NOT NULL,
    previous_rank INTEGER,
    rank_delta INTEGER DEFAULT 0,
    previous_score DOUBLE PRECISION,
    score_delta DOUBLE PRECISION DEFAULT 0.0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_team_snapshot UNIQUE (team_id, snapshot_id)
);

-- Indexes for Historical Snapshot Scores
CREATE INDEX IF NOT EXISTS idx_snapshot_scores_team_id ON public.team_snapshot_scores(team_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_scores_snapshot_id ON public.team_snapshot_scores(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_scores_rank ON public.team_snapshot_scores(rank ASC);
CREATE INDEX IF NOT EXISTS idx_snapshot_scores_f1 ON public.team_snapshot_scores(f1_score DESC);


-- 7. Convenient Compatibility Views
CREATE OR REPLACE VIEW public.team_snapshots AS
SELECT 
    s.id,
    s.snapshot_id,
    ls.snapshot_key,
    ls.captured_at,
    s.team_id,
    s.rank,
    s.f1_score,
    s.f1_score_str,
    s.previous_rank,
    s.rank_delta,
    s.previous_score,
    s.score_delta,
    s.status,
    s.created_at
FROM public.team_snapshot_scores s
JOIN public.leaderboard_snapshots ls ON ls.id = s.snapshot_id;


-- 8. Row Level Security (RLS) Configuration
-- Next.js server accesses Supabase via service-role key.
-- Public read access is permitted for read-only queries if required, while write access is strictly locked.

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_snapshot_scores ENABLE ROW LEVEL SECURITY;

-- Read-only policy for authenticated / service-role / anon queries (Server Side)
CREATE POLICY "Allow public read access on organizations" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Allow public read access on teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access on players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public read access on team_organizations" ON public.team_organizations FOR SELECT USING (true);
CREATE POLICY "Allow public read access on leaderboard_snapshots" ON public.leaderboard_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow public read access on team_snapshot_scores" ON public.team_snapshot_scores FOR SELECT USING (true);
