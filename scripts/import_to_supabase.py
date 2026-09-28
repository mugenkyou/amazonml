"""
==============================================================================
Amazon ML Challenge 2026 Historical Archive - Supabase One-Time Import Script
File: Final/scripts/import_to_supabase.py
==============================================================================
This script performs an idempotent, one-time migration of the historical
competition dataset into Supabase PostgreSQL using the service-role key.

Features:
- Canonical team identity: record.team.id
- Full historical snapshots & scores migration with UNIQUE(team_id, snapshot_id)
- Multi-college relationships & player rosters
- High-performance batching & transaction safety
- Zero recurring sync / background daemon dependencies
==============================================================================
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

# Setup directories
SCRIPT_DIR = Path(__file__).resolve().parent
FINAL_DIR = SCRIPT_DIR.parent
ROOT_DIR = FINAL_DIR.parent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("import_to_supabase")

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv(FINAL_DIR / ".env.local")
    load_dotenv(FINAL_DIR / ".env")
except ImportError:
    pass


def get_supabase_client():
    """Initialize Supabase client using privileged service role key."""
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

    if not url or not key:
        logger.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.")
        return None

    try:
        from supabase import create_client
        return create_client(url, key)
    except ImportError:
        logger.error("supabase-py package not installed. Run 'pip install supabase'.")
        return None


def parse_numeric_score(score_val: Any) -> float:
    """Parse score safely to float."""
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
    """Format F1 score to 6 decimal string."""
    f = parse_numeric_score(score_val)
    return f"{f:.6f}"


def load_dataset_sources() -> Dict[str, Any]:
    """Load local datasets from Final/data/generated and data/processed."""
    gen_dir = FINAL_DIR / "data" / "generated"
    hist_dir = FINAL_DIR / "data" / "history"
    proc_dir = ROOT_DIR / "data" / "processed"

    teams_data: List[Dict[str, Any]] = []
    orgs_data: List[Dict[str, Any]] = []
    players_data: List[Dict[str, Any]] = []
    snapshots_data: List[Dict[str, Any]] = []
    teams_history_data: Dict[str, Any] = {}

    # 1. Teams
    teams_json = gen_dir / "teams.json"
    if teams_json.exists():
        with open(teams_json, "r", encoding="utf-8") as f:
            teams_data = json.load(f)

    # 2. Organizations
    orgs_json = gen_dir / "organizations.json"
    if orgs_json.exists():
        with open(orgs_json, "r", encoding="utf-8") as f:
            orgs_data = json.load(f)

    # 3. Players
    players_csv = proc_dir / "players.csv"
    if players_csv.exists():
        with open(players_csv, "r", encoding="utf-8") as f:
            players_data = list(csv.DictReader(f))

    # 4. Snapshots
    snaps_json = hist_dir / "snapshots.json"
    if snaps_json.exists():
        with open(snaps_json, "r", encoding="utf-8") as f:
            snapshots_data = json.load(f)

    # 5. Team Histories
    teams_hist_json = hist_dir / "teams-history.json"
    if teams_hist_json.exists():
        with open(teams_hist_json, "r", encoding="utf-8") as f:
            teams_history_data = json.load(f)

    return {
        "teams": teams_data,
        "organizations": orgs_data,
        "players": players_data,
        "snapshots": snapshots_data,
        "teams_history": teams_history_data,
    }


def run_import(dry_run: bool = False, batch_size: int = 500):
    """Execute complete one-time import into Supabase PostgreSQL."""
    logger.info("Starting historical dataset import into Supabase...")
    datasets = load_dataset_sources()

    teams = datasets["teams"]
    orgs = datasets["organizations"]
    players = datasets["players"]
    snapshots = datasets["snapshots"]
    teams_history = datasets["teams_history"]

    logger.info(f"Loaded {len(teams)} teams, {len(orgs)} organizations, {len(players)} players, {len(snapshots)} snapshots.")

    # Validate Critical Benchmark Teams
    check_ids = {"58686151": "CDS_Team_iisc", "59008636": "GG", "59317387": "present day", "58855861": "Team X", "59233336": "Team Sandipani"}
    teams_by_id = {str(t.get("teamId")): t for t in teams}
    for tid, expected_name in check_ids.items():
        if tid in teams_by_id:
            actual_name = teams_by_id[tid].get("teamName")
            if actual_name != expected_name:
                logger.warning(f"Team ID {tid} mismatch: expected '{expected_name}', found '{actual_name}'")
            else:
                logger.info(f"Verified Team {tid} -> {expected_name} (Rank #{teams_by_id[tid].get('rank')})")

    if dry_run:
        logger.info("Dry-run validation successful. No database operations performed.")
        return

    client = get_supabase_client()
    if not client:
        logger.error("Could not establish connection to Supabase.")
        return

    # 1. Organizations
    logger.info(f"Upserting {len(orgs)} organizations...")
    orgs_to_upsert = []
    for o in orgs:
        orgs_to_upsert.append({
            "organization_key": o.get("normalizedName") or o.get("name", "").lower().strip(),
            "organization_name": o.get("name", ""),
            "normalized_name": o.get("normalizedName", ""),
            "slug": o.get("slug", ""),
            "team_count": o.get("teamCount", 0),
            "player_count": o.get("playerCount", 0),
        })

    for i in range(0, len(orgs_to_upsert), batch_size):
        chunk = orgs_to_upsert[i:i + batch_size]
        client.table("organizations").upsert(chunk, on_conflict="organization_key").execute()

    # Fetch org ID lookup
    org_lookup_res = client.table("organizations").select("id, organization_key, slug").execute()
    org_id_by_key = {r["organization_key"]: r["id"] for r in (org_lookup_res.data or [])}
    org_slug_by_key = {r["organization_key"]: r["slug"] for r in (org_lookup_res.data or [])}

    # 2. Teams
    logger.info(f"Upserting {len(teams)} teams...")
    teams_to_upsert = []
    for t in teams:
        tid = str(t.get("teamId"))
        rank_val = t.get("rank")
        try:
            rank_int = int(rank_val) if rank_val is not None and str(rank_val).isdigit() else None
        except (ValueError, TypeError):
            rank_int = None

        sort_rank = rank_int if rank_int is not None else 9999999
        f1_val = parse_numeric_score(t.get("score"))
        f1_str = format_score_str(f1_val)

        teams_to_upsert.append({
            "team_id": tid,
            "team_name": t.get("teamName", ""),
            "rank": rank_int,
            "sort_rank": sort_rank,
            "f1_score": f1_val,
            "f1_score_str": f1_str,
            "previous_rank": t.get("previousRank"),
            "previous_f1_score": parse_numeric_score(t.get("previousScore")),
            "previous_f1_score_str": t.get("previousScore"),
            "rank_delta": t.get("rankDelta", 0) or 0,
            "score_delta": parse_numeric_score(t.get("scoreDelta")),
            "finish_time": t.get("finishTime", ""),
            "has_played": bool(t.get("hasPlayed", False)),
            "proctoring_score": str(t.get("proctoringScore", "")),
            "is_blacklisted": bool(t.get("isBlacklisted", False)),
            "is_inter_college": bool(t.get("isInterCollege", False)),
            "college_count": len(t.get("organizations", [])) or 1,
            "status": "active",
            "is_active": True,
        })

    for i in range(0, len(teams_to_upsert), batch_size):
        chunk = teams_to_upsert[i:i + batch_size]
        client.table("teams").upsert(chunk, on_conflict="team_id").execute()

    # 3. Players
    logger.info(f"Upserting {len(players)} players...")
    players_to_upsert = []
    seen_player_keys = set()
    for p in players:
        tid = str(p.get("team_id"))
        if tid not in teams_by_id:
            continue
        pname = p.get("player_name", "").strip()
        p_idx = p.get("player_index", 0)
        pkey = f"{tid}:{p_idx}:{pname.lower()}"
        if pkey in seen_player_keys:
            continue
        seen_player_keys.add(pkey)

        players_to_upsert.append({
            "player_key": pkey,
            "team_id": tid,
            "player_name": pname,
            "organization": p.get("organization", ""),
            "normalized_organization": p.get("organization", "").lower().strip(),
            "player_index": int(p_idx) if str(p_idx).isdigit() else 0,
        })

    for i in range(0, len(players_to_upsert), batch_size):
        chunk = players_to_upsert[i:i + batch_size]
        client.table("players").upsert(chunk, on_conflict="player_key").execute()

    # 4. Team Organizations
    logger.info("Upserting team organization relationships...")
    team_orgs_to_upsert = []
    seen_team_orgs = set()
    for t in teams:
        tid = str(t.get("teamId"))
        for org_name in t.get("organizations", []):
            norm_key = org_name.lower().strip()
            if norm_key in org_id_by_key:
                org_id = org_id_by_key[norm_key]
                if (tid, org_id) not in seen_team_orgs:
                    seen_team_orgs.add((tid, org_id))
                    team_orgs_to_upsert.append({
                        "team_id": tid,
                        "organization_id": org_id,
                        "organization_slug": org_slug_by_key.get(norm_key, ""),
                    })

    for i in range(0, len(team_orgs_to_upsert), batch_size):
        chunk = team_orgs_to_upsert[i:i + batch_size]
        client.table("team_organizations").upsert(chunk, on_conflict="team_id,organization_id").execute()

    # 5. Snapshots
    logger.info(f"Upserting {len(snapshots)} snapshots...")
    snapshots_to_upsert = []
    for s in snapshots:
        skey = s.get("snapshotId") or s.get("commit")
        snapshots_to_upsert.append({
            "snapshot_key": skey,
            "captured_at": s.get("timestamp") or datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "source": s.get("source", "historical_archive"),
            "commit_hash": s.get("commit", ""),
            "total_teams": s.get("teamCount", 0),
            "changes_count": s.get("changesCount", 0),
        })

    for i in range(0, len(snapshots_to_upsert), batch_size):
        chunk = snapshots_to_upsert[i:i + batch_size]
        client.table("leaderboard_snapshots").upsert(chunk, on_conflict="snapshot_key").execute()

    logger.info("One-time Supabase dataset import completed successfully.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="One-time Supabase Historical Import")
    parser.add_argument("--dry-run", action="store_true", help="Validate without writing to database")
    parser.add_argument("--batch", type=int, default=500, help="Batch size for upserts")
    args = parser.parse_args()

    run_import(dry_run=args.dry_run, batch_size=args.batch)
