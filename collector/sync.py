"""
Unified Data Synchronization Pipeline for Unstop Leaderboard Platform.
Performs an end-to-end sync:
  1. Fetches latest leaderboard pages from Unstop public API (with retry & rate-limiting protection).
  2. Generates/updates processed relational CSVs in data/processed/.
  3. Pre-compiles and updates optimized JSON snapshots directly in web/data/generated/.
"""

import argparse
import csv
import datetime
import json
import logging
import math
import os
import re
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

import config
from .fetch_all import collect_leaderboard
from .normalizer import normalize_organization

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("collector.sync")

WEB_DATA_GENERATED_DIR = config.BASE_DIR / "web" / "data" / "generated"


def slugify_organization(text: str) -> str:
    """Generate a clean URL slug matching web/lib/normalize.ts."""
    norm = normalize_organization(text)
    if not norm:
        return "unknown"
    slug = re.sub(r"[^a-z0-9]+", "-", norm)
    slug = slug.strip("-")
    return slug or "org"


def sync_to_web_json(
    processed_dir: Path = config.PROCESSED_DATA_DIR,
    web_generated_dir: Path = WEB_DATA_GENERATED_DIR,
    metadata_path: Path = config.COLLECTION_METADATA_JSON,
) -> Dict[str, Any]:
    """
    Ingest processed CSVs and compile web/data/generated/*.json snapshots.
    Ensures Next.js website instantly receives all newly fetched data.
    """
    logger.info("Synchronizing processed CSVs to web JSON artifacts in %s...", web_generated_dir)
    web_generated_dir.mkdir(parents=True, exist_ok=True)

    teams_csv = processed_dir / "teams.csv"
    players_csv = processed_dir / "players.csv"
    orgs_csv = processed_dir / "organizations.csv"
    team_orgs_csv = processed_dir / "team_organizations.csv"

    if not teams_csv.exists():
        raise FileNotFoundError(f"Missing {teams_csv}. Run collector first.")

    # 1. Load players grouped by team_id
    players_by_team: Dict[str, List[Dict[str, Any]]] = {}
    if players_csv.exists():
        with open(players_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                tid = row.get("team_id", "").strip()
                if not tid:
                    continue
                if tid not in players_by_team:
                    players_by_team[tid] = []
                
                try:
                    p_idx = int(row.get("player_index", 0))
                except (ValueError, TypeError):
                    p_idx = 0

                p_org = row.get("organization", "").strip()
                players_by_team[tid].append({
                    "name": row.get("player_name", "").strip() or "Participant",
                    "organization": p_org,
                    "normalizedOrganization": normalize_organization(p_org),
                    "playerIndex": p_idx,
                })

    # 2. Load team organizations
    orgs_by_team: Dict[str, Set[str]] = {}
    org_to_team_ids: Dict[str, Set[str]] = {}

    if team_orgs_csv.exists():
        with open(team_orgs_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                tid = row.get("team_id", "").strip()
                org = row.get("organization", "").strip()
                norm_org = row.get("normalized_organization", "").strip() or normalize_organization(org)
                if not tid or not org:
                    continue

                if tid not in orgs_by_team:
                    orgs_by_team[tid] = set()
                orgs_by_team[tid].add(org)

                if norm_org not in org_to_team_ids:
                    org_to_team_ids[norm_org] = set()
                org_to_team_ids[norm_org].add(tid)

    # 3. Load and build teams list
    teams_list: List[Dict[str, Any]] = []
    with open(teams_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            tid = row.get("team_id", "").strip()
            if not tid:
                continue

            rank_str = row.get("rank", "").strip()
            try:
                sort_rank = int(rank_str)
            except (ValueError, TypeError):
                sort_rank = 9999999

            team_players = players_by_team.get(tid, [])
            team_orgs_set = orgs_by_team.get(tid, set())

            if not team_orgs_set:
                for p in team_players:
                    if p.get("organization"):
                        team_orgs_set.add(p["organization"])

            team_orgs = sorted(list(team_orgs_set))
            norm_team_orgs = [normalize_organization(o) for o in team_orgs if normalize_organization(o)]

            for no in norm_team_orgs:
                if no not in org_to_team_ids:
                    org_to_team_ids[no] = set()
                org_to_team_ids[no].add(tid)

            teams_list.append({
                "teamId": tid,
                "teamName": row.get("team_name", "").strip() or "Unnamed Team",
                "rank": rank_str,
                "sortRank": sort_rank,
                "score": row.get("score", "").strip() or "0.000000",
                "finishTime": row.get("finish_time", "").strip(),
                "hasPlayed": row.get("has_played", "").strip(),
                "proctoringScore": row.get("proctoring_score", "").strip(),
                "isBlacklisted": row.get("is_blacklisted", "").strip(),
                "players": team_players,
                "organizations": team_orgs,
                "normalizedOrganizations": norm_team_orgs,
            })

    # Sort teams by rank ascending, then name
    teams_list.sort(key=lambda x: (x["sortRank"], x["teamName"]))

    # 4. Load organizations and assign URL slugs
    organizations_list: List[Dict[str, Any]] = []
    slug_counts: Dict[str, int] = {}

    if orgs_csv.exists():
        with open(orgs_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                org_name = row.get("organization", "").strip()
                if not org_name:
                    continue

                norm_org = row.get("normalized_organization", "").strip() or normalize_organization(org_name)
                slug = slugify_organization(org_name)

                if slug in slug_counts:
                    slug_counts[slug] += 1
                    slug = f"{slug}-{slug_counts[slug]}"
                else:
                    slug_counts[slug] = 1

                team_ids = sorted(list(org_to_team_ids.get(norm_org, set())))

                try:
                    player_count = int(row.get("player_count", 0) or 0)
                except (ValueError, TypeError):
                    player_count = 0

                organizations_list.append({
                    "name": org_name,
                    "normalizedName": norm_org,
                    "slug": slug,
                    "teamCount": len(team_ids),
                    "playerCount": player_count,
                    "teamIds": team_ids,
                })

    organizations_list.sort(key=lambda x: (-x["teamCount"], x["name"]))

    # 5. Build organization index (norm_org -> teamIds)
    org_index: Dict[str, List[str]] = {
        norm: sorted(list(tids)) for norm, tids in org_to_team_ids.items()
    }

    # 6. Build Inter-College Teams snapshot
    org_by_norm: Dict[str, Dict[str, Any]] = {o["normalizedName"]: o for o in organizations_list}
    org_by_slug: Dict[str, Dict[str, Any]] = {o["slug"]: o for o in organizations_list}

    inter_college_teams: List[Dict[str, Any]] = []
    for team in teams_list:
        raw_orgs: List[str] = []
        for p in team.get("players", []):
            if p.get("organization") and p["organization"].strip():
                raw_orgs.append(p["organization"].strip())
        if not raw_orgs and team.get("organizations"):
            for o in team["organizations"]:
                if o and o.strip():
                    raw_orgs.append(o.strip())

        seen_slugs: Set[str] = set()
        resolved_orgs: List[Dict[str, str]] = []

        for raw in raw_orgs:
            norm = normalize_organization(raw)
            slug_guess = slugify_organization(raw)
            matched = org_by_norm.get(norm) or org_by_slug.get(slug_guess)

            if matched:
                org_ref = {
                    "name": matched["name"],
                    "normalizedName": matched.get("normalizedName") or norm,
                    "slug": matched["slug"],
                }
            else:
                org_ref = {
                    "name": raw.strip(),
                    "normalizedName": norm,
                    "slug": slug_guess,
                }

            if org_ref["slug"] and org_ref["slug"] not in seen_slugs:
                seen_slugs.add(org_ref["slug"])
                resolved_orgs.append(org_ref)

        if len(resolved_orgs) >= 2:
            inter_college_teams.append({
                "teamId": team["teamId"],
                "teamName": team["teamName"],
                "rank": team["rank"],
                "sortRank": team["sortRank"],
                "score": team["score"],
                "finishTime": team["finishTime"],
                "hasPlayed": team["hasPlayed"],
                "proctoringScore": team["proctoringScore"],
                "isBlacklisted": team["isBlacklisted"],
                "players": team["players"],
                "organizations": resolved_orgs,
                "collegeCount": len(resolved_orgs),
            })

    # 7. Load / format metadata
    raw_meta = {}
    if metadata_path.exists():
        try:
            with open(metadata_path, "r", encoding="utf-8") as mf:
                raw_meta = json.load(mf)
        except Exception:
            pass

    web_metadata = {
        "challengeId": raw_meta.get("challenge_id", config.CHALLENGE_ID),
        "collectionStartedAt": raw_meta.get("collection_started_at"),
        "collectionFinishedAt": raw_meta.get("collection_finished_at"),
        "recordsCollected": raw_meta.get("records_collected", len(teams_list)),
        "uniqueTeams": len(teams_list),
        "uniquePlayers": sum(len(t["players"]) for t in teams_list),
        "uniqueOrganizations": len(organizations_list),
        "complete": bool(raw_meta.get("complete", True)),
        "failedPages": raw_meta.get("failed_pages", []),
        "sourceEndpoint": raw_meta.get("source_endpoint", config.BASE_API_URL),
    }

    # 8. Write web JSON files
    with open(web_generated_dir / "teams.json", "w", encoding="utf-8") as f:
        json.dump(teams_list, f, indent=2, ensure_ascii=False)

    with open(web_generated_dir / "organizations.json", "w", encoding="utf-8") as f:
        json.dump(organizations_list, f, indent=2, ensure_ascii=False)

    with open(web_generated_dir / "organization-index.json", "w", encoding="utf-8") as f:
        json.dump(org_index, f, indent=2, ensure_ascii=False)

    with open(web_generated_dir / "inter-college-teams.json", "w", encoding="utf-8") as f:
        json.dump(inter_college_teams, f, indent=2, ensure_ascii=False)

    with open(web_generated_dir / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(web_metadata, f, indent=2, ensure_ascii=False)

    logger.info(
        "Successfully generated web JSON artifacts: %d teams, %d organizations, %d inter-college teams, %d indexed org keys",
        len(teams_list),
        len(organizations_list),
        len(inter_college_teams),
        len(org_index),
    )

    return {
        "teams_count": len(teams_list),
        "orgs_count": len(organizations_list),
        "inter_college_teams_count": len(inter_college_teams),
        "org_index_count": len(org_index),
        "web_generated_dir": str(web_generated_dir),
    }


def sync_all(
    force: bool = True,
    start_page: int = 1,
    max_pages: Optional[int] = None,
    per_page: int = config.DEFAULT_PER_PAGE,
    delay_seconds: float = config.REQUEST_DELAY_SECONDS,
    regenerate_only: bool = False,
) -> Dict[str, Any]:
    """
    Orchestrate full data synchronization:
      1. Fetch latest data from API (or load cached raw JSONs).
      2. Write normalized CSVs to data/processed/.
      3. Write optimized JSON snapshots to web/data/generated/.
    """
    print("\n" + "=" * 70)
    print(" UNSTOP LEADERBOARD FULL DATA SYNCHRONIZATION PIPELINE")
    print("=" * 70)
    if regenerate_only:
        print(" Mode: REGENERATE & SYNC (Offline - rebuilding from raw JSON snapshots)")
    else:
        print(f" Mode: FETCH & SYNC (Live API -> Raw Snapshots -> CSVs -> Web JSONs)")
        print(f" Target API: {config.BASE_API_URL}")
        print(f" Force Re-fetch: {force}")
    print("=" * 70 + "\n")

    # Step 1: Collect / Re-generate CSVs
    collection_meta = collect_leaderboard(
        start_page=start_page,
        max_pages=max_pages,
        per_page=per_page,
        delay_seconds=delay_seconds,
        force=force,
        regenerate_only=regenerate_only,
    )

    # Step 2: Sync to web generated JSONs
    web_sync_result = sync_to_web_json()

    print("\n" + "=" * 70)
    print(" SYNCHRONIZATION COMPLETE!")
    print(f" - Teams Synced:         {web_sync_result['teams_count']}")
    print(f" - Organizations Synced: {web_sync_result['orgs_count']}")
    print(f" - CSV Datasets:         {config.PROCESSED_DATA_DIR}")
    print(f" - Web JSON Datasets:    {config.BASE_DIR / 'web' / 'data' / 'generated'}")
    print("=" * 70 + "\n")

    return {
        "collection": collection_meta,
        "web_sync": web_sync_result,
    }


def sync_loop(
    force: bool = True,
    start_page: int = 1,
    max_pages: Optional[int] = None,
    per_page: int = config.DEFAULT_PER_PAGE,
    delay_seconds: float = config.REQUEST_DELAY_SECONDS,
    regenerate_only: bool = False,
    interval_seconds: int = 60,
) -> None:
    """
    Run data synchronization continuously in a background loop.
    Keeps fetching fresh leaderboard rankings & compiling web JSON snapshots
    until interrupted (e.g. while your local development server is running).
    """
    interval_seconds = max(5, interval_seconds)
    iteration = 1
    print("\n" + "=" * 70)
    print(" UNSTOP LEADERBOARD CONTINUOUS AUTO-SYNC WATCHER")
    print(f" - Sync Interval:    {interval_seconds} seconds")
    print(f" - Mode:             {'REGENERATE ONLY (Offline)' if regenerate_only else 'LIVE FETCH & SYNC'}")
    print(f" - Web Generated:    {WEB_DATA_GENERATED_DIR}")
    print(" - Press Ctrl+C at any time to gracefully stop.")
    print("=" * 70 + "\n")

    try:
        while True:
            now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"\n[Auto-Sync] >>> Cycle #{iteration} started at {now_str}")
            try:
                sync_all(
                    force=force,
                    start_page=start_page,
                    max_pages=max_pages,
                    per_page=per_page,
                    delay_seconds=delay_seconds,
                    regenerate_only=regenerate_only,
                )
                print(f"[Auto-Sync] >>> Cycle #{iteration} completed successfully. Next refresh in {interval_seconds}s...")
            except KeyboardInterrupt:
                raise
            except Exception as err:
                logger.error(
                    "Error during auto-sync cycle #%d: %s. Retrying next cycle in %ds...",
                    iteration,
                    err,
                    interval_seconds,
                    exc_info=True,
                )

            iteration += 1
            time.sleep(interval_seconds)
    except KeyboardInterrupt:
        print("\n\n" + "=" * 70)
        print(" Continuous Auto-Sync loop stopped by user. Local data is up-to-date.")
        print("=" * 70 + "\n")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Unstop Leaderboard End-to-End Data Sync")
    parser.add_argument(
        "--no-force",
        dest="force",
        action="store_false",
        help="Skip re-downloading pages that already exist in raw cache",
    )
    parser.add_argument("--start-page", type=int, default=1, help="Starting page number")
    parser.add_argument("--max-pages", type=int, default=None, help="Max pages to fetch")
    parser.add_argument("--per-page", type=int, default=config.DEFAULT_PER_PAGE, help="Page size")
    parser.add_argument("--delay", type=float, default=config.REQUEST_DELAY_SECONDS, help="Request delay (seconds)")
    parser.add_argument(
        "--regenerate-only",
        action="store_true",
        help="Rebuild CSVs and Web JSONs from existing raw snapshots without network calls",
    )
    parser.add_argument(
        "--watch",
        "-w",
        action="store_true",
        help="Run continuously in a loop, updating data every interval as long as process is running",
    )
    parser.add_argument(
        "--interval",
        "-i",
        type=int,
        default=60,
        help="Interval in seconds between sync cycles when --watch is enabled (default: 60)",
    )
    parser.set_defaults(force=True)
    return parser.parse_args()


def main():
    args = parse_args()
    if args.watch:
        sync_loop(
            force=args.force,
            start_page=args.start_page,
            max_pages=args.max_pages,
            per_page=args.per_page,
            delay_seconds=args.delay,
            regenerate_only=args.regenerate_only,
            interval_seconds=args.interval,
        )
    else:
        sync_all(
            force=args.force,
            start_page=args.start_page,
            max_pages=args.max_pages,
            per_page=args.per_page,
            delay_seconds=args.delay,
            regenerate_only=args.regenerate_only,
        )


if __name__ == "__main__":
    main()
