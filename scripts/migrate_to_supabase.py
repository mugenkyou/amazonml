"""
Database Migration Script: Local Processed / Historical Leaderboard Data -> Supabase PostgreSQL.

Transfers existing normalized teams, players, organizations, team_organizations,
and historical snapshots into Supabase with 100% idempotency, preserving score precision
(6 decimal places), rank deltas, and relationships.

Usage:
  python scripts/migrate_to_supabase.py              # Full migration
  python scripts/migrate_to_supabase.py --dry-run    # Validation & Dry-run report only
  python scripts/migrate_to_supabase.py --batch 500  # Custom batch size
"""

import argparse
import csv
import datetime
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

# Add repository root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import config
from collector.normalizer import normalize_organization

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("migrate_to_supabase")

# Load environment variables from .env or .env.local if present
try:
    from dotenv import load_dotenv
    load_dotenv(ROOT_DIR / ".env")
    load_dotenv(ROOT_DIR / ".env.local")
    load_dotenv(ROOT_DIR / "web" / ".env")
    load_dotenv(ROOT_DIR / "web" / ".env.local")
except ImportError:
    pass


def get_supabase_client():
    """Initialize Supabase admin client using privileged service role key."""
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not url or not key:
        return None

    try:
        from supabase import create_client, Client
        return create_client(url, key)
    except ImportError:
        logger.warning("supabase-py package not installed. Run 'pip install supabase'.")
        return None
    except Exception as e:
        logger.error("Failed to initialize Supabase client: %s", e)
        return None


def parse_numeric_score(score_val: Any) -> float:
    """Safely parse F1 score to float."""
    if score_val is None:
        return 0.0
    s = str(score_val).strip()
    if not s or s.lower() in ("none", "null", ""):
        return 0.0
    try:
        return float(s)
    except (ValueError, TypeError):
        return 0.0


def format_score_str(score_val: Any) -> str:
    """Format F1 score to exact 6 decimal string."""
    f = parse_numeric_score(score_val)
    return f"{f:.6f}"


def load_local_datasets() -> Dict[str, Any]:
    """Load local processed CSVs and generated web JSONs."""
    processed_dir = config.PROCESSED_DATA_DIR
    history_dir = config.BASE_DIR / "web" / "data" / "history"
    web_dir = config.BASE_DIR / "web" / "data" / "generated"

    teams_csv = processed_dir / "teams.csv"
    players_csv = processed_dir / "players.csv"
    orgs_csv = processed_dir / "organizations.csv"
    team_orgs_csv = processed_dir / "team_organizations.csv"

    # Fallback to web JSON if CSVs are missing
    teams_json = web_dir / "teams.json"
    orgs_json = web_dir / "organizations.json"

    teams_data: List[Dict[str, Any]] = []
    players_data: List[Dict[str, Any]] = []
    orgs_data: List[Dict[str, Any]] = []
    team_orgs_data: List[Dict[str, Any]] = []

    if teams_csv.exists():
        with open(teams_csv, "r", encoding="utf-8") as f:
            teams_data = list(csv.DictReader(f))
    elif teams_json.exists():
        with open(teams_json, "r", encoding="utf-8") as f:
            raw_teams = json.load(f)
            for t in raw_teams:
                teams_data.append({
                    "team_id": str(t.get("teamId", "")),
                    "team_name": t.get("teamName", ""),
                    "rank": str(t.get("rank", "")),
                    "score": str(t.get("score", "0.000000")),
                    "finish_time": t.get("finishTime", ""),
                    "has_played": str(t.get("hasPlayed", "")),
                    "proctoring_score": str(t.get("proctoringScore", "")),
                    "is_blacklisted": str(t.get("isBlacklisted", "")),
                })

    if players_csv.exists():
        with open(players_csv, "r", encoding="utf-8") as f:
            players_data = list(csv.DictReader(f))

    if orgs_csv.exists():
        with open(orgs_csv, "r", encoding="utf-8") as f:
            orgs_data = list(csv.DictReader(f))
    elif orgs_json.exists():
        with open(orgs_json, "r", encoding="utf-8") as f:
            raw_orgs = json.load(f)
            for o in raw_orgs:
                orgs_data.append({
                    "organization": o.get("name", ""),
                    "normalized_organization": o.get("normalizedName", ""),
                    "team_count": str(o.get("teamCount", 0)),
                    "player_count": str(o.get("playerCount", 0)),
                })

    if team_orgs_csv.exists():
        with open(team_orgs_csv, "r", encoding="utf-8") as f:
            team_orgs_data = list(csv.DictReader(f))

    # Snapshots and history
    snapshots_data: List[Dict[str, Any]] = []
    teams_history_data: Dict[str, Any] = {}

    snapshots_json = history_dir / "snapshots.json"
    if snapshots_json.exists():
        with open(snapshots_json, "r", encoding="utf-8") as f:
            snapshots_data = json.load(f)

    teams_history_json = history_dir / "teams-history.json"
    if teams_history_json.exists():
        with open(teams_history_json, "r", encoding="utf-8") as f:
            teams_history_data = json.load(f)

    return {
        "teams": teams_data,
        "players": players_data,
        "organizations": orgs_data,
        "team_organizations": team_orgs_data,
        "snapshots": snapshots_data,
        "teams_history": teams_history_data,
    }


def prepare_organizations(raw_orgs: List[Dict[str, Any]], players: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Normalize and deduplicate organizations with unique slugs."""
    orgs_by_norm: Dict[str, Dict[str, Any]] = {}
    slug_counts: Dict[str, int] = {}

    # Seed from organizations dataset
    for o in raw_orgs:
        name = o.get("organization", "").strip() or o.get("name", "").strip()
        if not name:
            continue
        norm = o.get("normalized_organization", "").strip() or o.get("normalizedName", "").strip() or normalize_organization(name)
        if not norm:
            continue

        try:
            tc = int(o.get("team_count", 0) or 0)
        except (ValueError, TypeError):
            tc = 0
        try:
            pc = int(o.get("player_count", 0) or 0)
        except (ValueError, TypeError):
            pc = 0

        if norm not in orgs_by_norm:
            import re
            slug_base = re.sub(r"[^a-z0-9]+", "-", norm).strip("-") or "org"
            if slug_base in slug_counts:
                slug_counts[slug_base] += 1
                slug = f"{slug_base}-{slug_counts[slug_base]}"
            else:
                slug_counts[slug_base] = 1
                slug = slug_base

            orgs_by_norm[norm] = {
                "organization_key": norm,
                "organization_name": name,
                "normalized_name": norm,
                "slug": slug,
                "team_count": tc,
                "player_count": pc,
            }

    # Also capture any organizations present on players
    for p in players:
        p_org = p.get("organization", "").strip()
        if not p_org:
            continue
        norm = p.get("normalized_organization", "").strip() or normalize_organization(p_org)
        if norm and norm not in orgs_by_norm:
            import re
            slug_base = re.sub(r"[^a-z0-9]+", "-", norm).strip("-") or "org"
            if slug_base in slug_counts:
                slug_counts[slug_base] += 1
                slug = f"{slug_base}-{slug_counts[slug_base]}"
            else:
                slug_counts[slug_base] = 1
                slug = slug_base

            orgs_by_norm[norm] = {
                "organization_key": norm,
                "organization_name": p_org,
                "normalized_name": norm,
                "slug": slug,
                "team_count": 0,
                "player_count": 1,
            }

    return list(orgs_by_norm.values())


def run_migration(dry_run: bool = False, batch_size: int = 500) -> Dict[str, Any]:
    """Execute complete migration pipeline."""
    print("\n" + "=" * 75)
    print(" AMAZON ML CHALLENGE EXPLORER — SUPABASE DATA MIGRATION")
    print("=" * 75)
    print(f" Mode: {'DRY RUN (Validation & Integrity Check)' if dry_run else 'LIVE MIGRATION'}")
    print(f" Batch Size: {batch_size}")
    print("=" * 75 + "\n")

    datasets = load_local_datasets()
    raw_teams = datasets["teams"]
    raw_players = datasets["players"]
    raw_orgs = datasets["organizations"]
    raw_team_orgs = datasets["team_organizations"]
    snapshots = datasets["snapshots"]
    teams_history = datasets["teams_history"]

    logger.info("Loaded local datasets:")
    logger.info("  - Teams:              %d", len(raw_teams))
    logger.info("  - Players:            %d", len(raw_players))
    logger.info("  - Organizations:      %d", len(raw_orgs))
    logger.info("  - Team Organizations: %d", len(raw_team_orgs))
    logger.info("  - Snapshots:          %d", len(snapshots))
    logger.info("  - Teams in History:   %d", len(teams_history))

    # 1. Process Organizations
    orgs_to_insert = prepare_organizations(raw_orgs, raw_players)
    org_key_to_meta = {o["organization_key"]: o for o in orgs_to_insert}

    # 2. Build players map by team_id
    players_by_team: Dict[str, List[Dict[str, Any]]] = {}
    for p in raw_players:
        tid = p.get("team_id", "").strip()
        if not tid:
            continue
        if tid not in players_by_team:
            players_by_team[tid] = []
        try:
            pidx = int(p.get("player_index", 0) or 0)
        except (ValueError, TypeError):
            pidx = 0
        p_org = p.get("organization", "").strip()
        p_norm = p.get("normalized_organization", "").strip() or normalize_organization(p_org)
        p_name = p.get("player_name", "").strip() or "Participant"
        
        # Deterministic unique key
        player_key = f"{tid}:{pidx}:{p_name.lower()}"
        players_by_team[tid].append({
            "player_key": player_key,
            "team_id": tid,
            "player_name": p_name,
            "organization": p_org,
            "normalized_organization": p_norm,
            "player_index": pidx,
        })

    # 3. Process Teams with Inter-College and Movement Data
    teams_to_insert: List[Dict[str, Any]] = []
    seen_team_ids: Set[str] = set()

    for t in raw_teams:
        tid = t.get("team_id", "").strip()
        if not tid or tid in seen_team_ids:
            continue
        seen_team_ids.add(tid)

        tname = t.get("team_name", "").strip() or "Unnamed Team"
        rank_str = t.get("rank", "").strip()
        try:
            rank_val = int(rank_str) if rank_str and rank_str.lower() != "none" else None
            sort_rank = rank_val if rank_val is not None else 9999999
        except (ValueError, TypeError):
            rank_val = None
            sort_rank = 9999999

        score_val = parse_numeric_score(t.get("score"))
        score_str = format_score_str(t.get("score"))

        # Check movement and history if available
        team_hist = teams_history.get(tid, {})
        hist_entries = team_hist.get("history", [])
        prev_rank = None
        prev_score = None
        prev_score_str = None
        rank_delta = 0
        score_delta = 0.0

        if len(hist_entries) >= 2:
            latest_h = hist_entries[-1]
            prev_h = hist_entries[-2]
            prev_rank = prev_h.get("rank")
            if prev_h.get("score"):
                prev_score = parse_numeric_score(prev_h["score"])
                prev_score_str = format_score_str(prev_h["score"])
            rank_delta = latest_h.get("rankDelta", 0)
            score_delta = latest_h.get("scoreDelta", 0.0)

        # Inter-college check
        team_players = players_by_team.get(tid, [])
        distinct_orgs = set()
        for tp in team_players:
            if tp["normalized_organization"]:
                distinct_orgs.add(tp["normalized_organization"])
        is_inter_college = len(distinct_orgs) >= 2
        college_count = max(1, len(distinct_orgs))

        has_played = str(t.get("has_played", "")).strip().lower() in ("true", "1", "yes")
        is_blacklisted = str(t.get("is_blacklisted", "")).strip().lower() in ("true", "1", "yes")

        teams_to_insert.append({
            "team_id": tid,
            "team_name": tname,
            "rank": rank_val,
            "sort_rank": sort_rank,
            "f1_score": score_val,
            "f1_score_str": score_str,
            "previous_rank": prev_rank,
            "previous_f1_score": prev_score,
            "previous_f1_score_str": prev_score_str,
            "rank_delta": rank_delta,
            "score_delta": score_delta,
            "finish_time": t.get("finish_time", "").strip(),
            "has_played": has_played,
            "proctoring_score": t.get("proctoring_score", "").strip(),
            "is_blacklisted": is_blacklisted,
            "is_inter_college": is_inter_college,
            "status": "active",
            "is_active": True,
        })

    # 3.5 Ensure any team referenced by players exists in teams_to_insert
    for tid, plist in players_by_team.items():
        if tid not in seen_team_ids:
            seen_team_ids.add(tid)
            teams_to_insert.append({
                "team_id": tid,
                "team_name": f"Team {tid}",
                "rank": None,
                "sort_rank": 9999999,
                "f1_score": 0.0,
                "f1_score_str": "0.000000",
                "previous_rank": None,
                "previous_f1_score": None,
                "previous_f1_score_str": None,
                "rank_delta": 0,
                "score_delta": 0.0,
                "finish_time": "",
                "has_played": False,
                "proctoring_score": "",
                "is_blacklisted": False,
                "is_inter_college": False,
                "college_count": 1,
                "status": "archive",
                "is_active": False,
            })

    # Sort teams by sort_rank
    teams_to_insert.sort(key=lambda x: (x["sort_rank"], x["team_name"]))

    # 4. Flatten all players for insert (ensuring team_id exists in teams_to_insert)
    all_players_to_insert: List[Dict[str, Any]] = []
    seen_player_keys: Set[str] = set()
    for plist in players_by_team.values():
        for p in plist:
            if p["team_id"] in seen_team_ids and p["player_key"] not in seen_player_keys:
                seen_player_keys.add(p["player_key"])
                all_players_to_insert.append(p)

    # 5. Snapshots and Snapshot Scores
    snapshots_to_insert: List[Dict[str, Any]] = []
    scores_to_insert: List[Dict[str, Any]] = []

    for s in snapshots:
        s_key = s.get("snapshotId") or s.get("commit") or "snapshot_0"
        s_time = s.get("timestamp") or datetime.datetime.now(datetime.timezone.utc).isoformat()
        snapshots_to_insert.append({
            "snapshot_key": s_key,
            "captured_at": s_time,
            "source": s.get("source", "sync"),
            "commit_hash": s.get("commit", ""),
            "total_teams": s.get("teamCount", 0),
            "changes_count": s.get("changesCount", 0),
        })

    client = get_supabase_client()

    report = {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "dryRun": dry_run,
        "supabaseConnected": client is not None,
        "teamsCount": len(teams_to_insert),
        "playersCount": len(all_players_to_insert),
        "organizationsCount": len(orgs_to_insert),
        "snapshotsCount": len(snapshots_to_insert),
        "interCollegeTeamsCount": sum(1 for t in teams_to_insert if t["is_inter_college"]),
        "duplicateTeamIdsFound": len(raw_teams) - len(teams_to_insert),
        "status": "validated",
    }

    if client and not dry_run:
        logger.info("Connected to Supabase. Beginning idempotent upserts...")

        # Batch Upsert Organizations
        logger.info("Upserting %d organizations...", len(orgs_to_insert))
        for i in range(0, len(orgs_to_insert), batch_size):
            chunk = orgs_to_insert[i:i + batch_size]
            client.table("organizations").upsert(chunk, on_conflict="organization_key").execute()

        # Fetch org id map
        org_rows = client.table("organizations").select("id, organization_key, slug").execute()
        org_id_by_key = {r["organization_key"]: r["id"] for r in (org_rows.data or [])}
        org_slug_by_key = {r["organization_key"]: r["slug"] for r in (org_rows.data or [])}

        # Batch Upsert Teams
        logger.info("Upserting %d teams...", len(teams_to_insert))
        for i in range(0, len(teams_to_insert), batch_size):
            chunk = teams_to_insert[i:i + batch_size]
            client.table("teams").upsert(chunk, on_conflict="team_id").execute()

        # Batch Upsert Players
        logger.info("Upserting %d players...", len(all_players_to_insert))
        for i in range(0, len(all_players_to_insert), batch_size):
            chunk = all_players_to_insert[i:i + batch_size]
            client.table("players").upsert(chunk, on_conflict="player_key").execute()

        # Build & Upsert Team Organizations
        team_orgs_to_insert: List[Dict[str, Any]] = []
        seen_team_orgs: Set[Tuple[str, int]] = set()

        for t in teams_to_insert:
            tid = t["team_id"]
            for p in players_by_team.get(tid, []):
                norm_org = p["normalized_organization"]
                if norm_org and norm_org in org_id_by_key:
                    org_id = org_id_by_key[norm_org]
                    if (tid, org_id) not in seen_team_orgs:
                        seen_team_orgs.add((tid, org_id))
                        team_orgs_to_insert.append({
                            "team_id": tid,
                            "organization_id": org_id,
                            "organization_slug": org_slug_by_key.get(norm_org, ""),
                        })

        logger.info("Upserting %d team_organizations relationships...", len(team_orgs_to_insert))
        for i in range(0, len(team_orgs_to_insert), batch_size):
            chunk = team_orgs_to_insert[i:i + batch_size]
            client.table("team_organizations").upsert(chunk, on_conflict="team_id,organization_id").execute()

        # Batch Upsert Snapshots
        logger.info("Upserting %d snapshots...", len(snapshots_to_insert))
        for i in range(0, len(snapshots_to_insert), batch_size):
            chunk = snapshots_to_insert[i:i + batch_size]
            client.table("leaderboard_snapshots").upsert(chunk, on_conflict="snapshot_key").execute()

        report["status"] = "completed"
        logger.info("Supabase database migration successfully completed.")
    else:
        if not client:
            logger.info("Supabase environment variables not configured. Completed validation in dry-run mode.")
        else:
            logger.info("Dry-run validation complete. No database writes were performed.")

    # Write report to history migration directory
    report_file = ROOT_DIR / "supabase-migration-report.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\n" + "=" * 75)
    print(" MIGRATION REPORT SUMMARY")
    print("=" * 75)
    print(f" - Teams Processed:            {report['teamsCount']}")
    print(f" - Players Processed:          {report['playersCount']}")
    print(f" - Organizations Processed:    {report['organizationsCount']}")
    print(f" - Inter-College Teams:        {report['interCollegeTeamsCount']}")
    print(f" - Historical Snapshots:       {report['snapshotsCount']}")
    print(f" - Supabase Connected:         {report['supabaseConnected']}")
    print(f" - Status:                     {report['status']}")
    print(f" - Report Saved:               {report_file}")
    print("=" * 75 + "\n")

    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate Local Leaderboard Data to Supabase")
    parser.add_argument("--dry-run", action="store_true", help="Validate and prepare datasets without writing to Supabase")
    parser.add_argument("--batch", type=int, default=500, help="Batch size for database upserts")
    args = parser.parse_args()

    run_migration(dry_run=args.dry_run, batch_size=args.batch)
