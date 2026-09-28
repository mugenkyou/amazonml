-- ==============================================================================
-- Amazon ML Challenge 2026 Historical Archive - Database Validation Queries
-- File: Final/supabase/validation.sql
-- ==============================================================================
-- Run these SQL validation checks to verify dataset integrity and ensure zero
-- inconsistencies exist in the Supabase PostgreSQL database.
-- ==============================================================================

-- 1. Check for Duplicate Teams by canonical team_id (MUST RETURN 0 ROWS)
SELECT team_id, COUNT(*) as count
FROM public.teams
GROUP BY team_id
HAVING COUNT(*) > 1;

-- 2. Check for Duplicate (team_id, snapshot_id) in Historical Scores (MUST RETURN 0 ROWS)
SELECT team_id, snapshot_id, COUNT(*) as count
FROM public.team_snapshot_scores
GROUP BY team_id, snapshot_id
HAVING COUNT(*) > 1;

-- 3. Check for Orphaned Scores with Missing/Invalid Team IDs (MUST RETURN 0 ROWS)
SELECT s.id, s.team_id, s.snapshot_id
FROM public.team_snapshot_scores s
LEFT JOIN public.teams t ON t.team_id = s.team_id
WHERE t.team_id IS NULL;

-- 4. Check for Orphaned Scores with Missing Snapshot IDs (MUST RETURN 0 ROWS)
SELECT s.id, s.snapshot_id
FROM public.team_snapshot_scores s
LEFT JOIN public.leaderboard_snapshots ls ON ls.id = s.snapshot_id
WHERE ls.id IS NULL;

-- 5. Check for Null or Invalid Ranks in Teams Table (MUST RETURN 0 ROWS)
SELECT id, team_id, team_name, rank, sort_rank
FROM public.teams
WHERE rank IS NULL OR rank <= 0;

-- 6. Check for Invalid or Out-of-Range F1 Scores (MUST RETURN 0 ROWS)
SELECT id, team_id, team_name, f1_score
FROM public.teams
WHERE f1_score < 0.0 OR f1_score > 1.0;

-- 7. Verify Critical Benchmark Team Identities & Names
SELECT team_id, team_name, rank, f1_score_str
FROM public.teams
WHERE team_id IN ('58686151', '59008636', '59317387', '58855861', '59233336')
ORDER BY rank ASC;
-- Expected:
-- 58686151 -> CDS_Team_iisc (Rank 1)
-- 59008636 -> GG (Rank 2)
-- 59317387 -> present day (Rank 3)
-- 58855861 -> Team X (Rank 4)
-- 59233336 -> Team Sandipani (Rank 6)

-- 8. Check Snapshot Ordering and Total Captured Count
SELECT id, snapshot_key, captured_at, total_teams, changes_count
FROM public.leaderboard_snapshots
ORDER BY captured_at ASC;

-- 9. Overall Summary Record Counts
SELECT 
    (SELECT COUNT(*) FROM public.teams) as total_teams,
    (SELECT COUNT(*) FROM public.organizations) as total_organizations,
    (SELECT COUNT(*) FROM public.players) as total_players,
    (SELECT COUNT(*) FROM public.team_organizations) as total_team_organizations,
    (SELECT COUNT(*) FROM public.leaderboard_snapshots) as total_snapshots,
    (SELECT COUNT(*) FROM public.team_snapshot_scores) as total_historical_observations;

-- 10. Check for Missing or Empty Organization Slugs (MUST RETURN 0 ROWS)
SELECT id, organization_name, slug
FROM public.organizations
WHERE slug IS NULL OR slug = '' OR organization_name IS NULL;
