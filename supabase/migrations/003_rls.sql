-- Migration 003: Row Level Security (RLS) Policies
-- Protects data integrity while allowing fast public read access for the web frontend.

-- Enable Row Level Security on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_snapshot_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;

-- 1. PUBLIC READ POLICIES (anon & authenticated roles)
CREATE POLICY "Public teams are viewable by everyone" 
ON teams FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public organizations are viewable by everyone" 
ON organizations FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public players are viewable by everyone" 
ON players FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public team_organizations are viewable by everyone" 
ON team_organizations FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public leaderboard snapshots are viewable by everyone" 
ON leaderboard_snapshots FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public team snapshot scores are viewable by everyone" 
ON team_snapshot_scores FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Public sync runs status are viewable by everyone" 
ON sync_runs FOR SELECT 
TO anon, authenticated 
USING (true);

-- 2. PRIVILEGED WRITE POLICIES (service_role only)
CREATE POLICY "Service role full access to teams" 
ON teams FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Service role full access to organizations" 
ON organizations FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Service role full access to players" 
ON players FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Service role full access to team_organizations" 
ON team_organizations FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Service role full access to leaderboard_snapshots" 
ON leaderboard_snapshots FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Service role full access to team_snapshot_scores" 
ON team_snapshot_scores FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Service role full access to sync_runs" 
ON sync_runs FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
