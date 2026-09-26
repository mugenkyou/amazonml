"""
Batch collector orchestrator and CLI for the Unstop Leaderboard dataset.
Fetches all pages sequentially, persists raw JSON snapshots, and regenerates normalized relational CSVs.
"""

import argparse
import datetime
import logging
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

import config
from .client import UnstopClient, UnstopAPIError
from .parser import parse_leaderboard_page, extract_leaderboard_records
from .normalizer import normalize_dataset
from .storage import (
    save_raw_page,
    load_all_raw_pages,
    raw_page_exists,
    save_processed_csvs,
    save_metadata,
    load_metadata,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("collector.fetch_all")


def collect_leaderboard(
    base_url: str = config.BASE_API_URL,
    challenge_id: str = config.CHALLENGE_ID,
    raw_dir: Path = config.RAW_DATA_DIR,
    processed_dir: Path = config.PROCESSED_DATA_DIR,
    metadata_path: Path = config.COLLECTION_METADATA_JSON,
    start_page: int = 1,
    per_page: int = config.DEFAULT_PER_PAGE,
    delay_seconds: float = config.REQUEST_DELAY_SECONDS,
    max_retries: int = config.MAX_RETRIES,
    backoff_factor: float = config.BACKOFF_FACTOR,
    timeout: int = config.TIMEOUT_SECONDS,
    force: bool = False,
    max_pages: Optional[int] = None,
    regenerate_only: bool = False,
    client: Optional[UnstopClient] = None,
) -> Dict[str, Any]:
    """
    Execute batch collection process or regenerate CSVs from existing raw snapshots.
    """
    start_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    logger.info("Starting Unstop leaderboard collection for Challenge ID: %s", challenge_id)

    if not regenerate_only:
        client = client or UnstopClient(
            base_url=base_url,
            max_retries=max_retries,
            backoff_factor=backoff_factor,
            timeout=timeout,
        )

    pages_requested = 0
    pages_successful = 0
    pages_failed: List[int] = []
    is_complete = True
    discovered_total_pages: Optional[int] = None

    if not regenerate_only:
        current_page = start_page
        while True:
            if max_pages is not None and current_page > max_pages:
                logger.info("Reached specified max_pages limit (%d). Stopping.", max_pages)
                break

            if discovered_total_pages is not None and current_page > discovered_total_pages:
                logger.info("Reached discovered last_page (%d). Collection complete.", discovered_total_pages)
                break

            # Resumability check: if raw file already exists and force=False, load from disk
            if not force and raw_page_exists(current_page, raw_dir):
                logger.info("Page %d already exists in %s (use --force to re-fetch). Skipping network call.", current_page, raw_dir)
                try:
                    all_raw = load_all_raw_pages(raw_dir)
                    # Find this page's data to check pagination metadata
                    # To be fast, parse page file directly
                    page_path = raw_dir / f"page_{current_page:04d}.json"
                    import json
                    with open(page_path, "r", encoding="utf-8") as pf:
                        cached_data = json.load(pf)
                    records, meta = parse_leaderboard_page(cached_data)
                    pages_successful += 1
                    if meta.get("last_page") and discovered_total_pages is None:
                        discovered_total_pages = meta["last_page"]
                    if not records and discovered_total_pages is None:
                        # Empty page reached
                        break
                    current_page += 1
                    continue
                except Exception as e:
                    logger.warning("Failed to read cached page %d (%s). Will re-fetch.", current_page, e)

            # Fetch page from API
            pages_requested += 1
            try:
                raw_response = client.fetch_page(page=current_page, per_page=per_page)
                records, meta = parse_leaderboard_page(raw_response)

                save_raw_page(current_page, raw_response, raw_dir)
                pages_successful += 1

                last_page_in_meta = meta.get("last_page")
                if last_page_in_meta and discovered_total_pages is None:
                    discovered_total_pages = last_page_in_meta
                    logger.info("Discovered total pages from API metadata: %d", discovered_total_pages)

                logger.info(
                    "Page %d: %d records found (Total discovered pages: %s)",
                    current_page,
                    len(records),
                    discovered_total_pages if discovered_total_pages else "unknown",
                )

                # Termination condition if no records and no last_page specified
                if not records:
                    logger.info("Page %d returned 0 records. End of leaderboard reached.", current_page)
                    break

            except UnstopAPIError as api_err:
                logger.error("Permanent failure fetching page %d: %s", current_page, api_err)
                pages_failed.append(current_page)
                is_complete = False
                break
            except Exception as unk_err:
                logger.exception("Unexpected error fetching page %d: %s", current_page, unk_err)
                pages_failed.append(current_page)
                is_complete = False
                break

            current_page += 1
            if delay_seconds > 0:
                time.sleep(delay_seconds)

    # Now load all stored raw JSON pages and process them
    logger.info("Rebuilding normalized dataset from all saved raw JSON files in %s...", raw_dir)
    all_raw_pages = load_all_raw_pages(raw_dir)
    all_extracted_records: List[Dict[str, Any]] = []

    for raw_page_data in all_raw_pages:
        recs, _ = parse_leaderboard_page(raw_page_data)
        parsed_recs = extract_leaderboard_records(recs)
        all_extracted_records.extend(parsed_recs)

    normalized = normalize_dataset(all_extracted_records)
    save_processed_csvs(normalized, processed_dir)

    finish_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    metadata = {
        "challenge_id": challenge_id,
        "collection_started_at": start_iso,
        "collection_finished_at": finish_iso,
        "pages_requested": pages_requested,
        "pages_successful": pages_successful,
        "pages_failed": len(pages_failed),
        "records_collected": normalized.total_raw_records,
        "unique_teams": normalized.unique_teams_count,
        "unique_players": normalized.unique_players_count,
        "unique_organizations": normalized.unique_orgs_count,
        "complete": is_complete and len(pages_failed) == 0,
        "failed_pages": pages_failed,
        "source_endpoint": base_url,
    }

    save_metadata(metadata, metadata_path)
    logger.info(
        "Collection finished. Total Teams: %d, Total Players: %d, Unique Orgs: %d, Status: %s",
        normalized.unique_teams_count,
        normalized.unique_players_count,
        normalized.unique_orgs_count,
        "COMPLETE" if metadata["complete"] else "INCOMPLETE",
    )
    return metadata


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Unstop ML Leaderboard Batch Data Collector")
    parser.add_argument("--start-page", type=int, default=1, help="Page to start collecting from (default: 1)")
    parser.add_argument("--max-pages", type=int, default=None, help="Maximum number of pages to fetch")
    parser.add_argument("--per-page", type=int, default=config.DEFAULT_PER_PAGE, help="Page size (default: 30)")
    parser.add_argument("--force", action="store_true", help="Force re-fetching existing raw JSON files")
    parser.add_argument("--regenerate-only", action="store_true", help="Rebuild CSV files from raw JSON without making network calls")
    parser.add_argument("--delay", type=float, default=config.REQUEST_DELAY_SECONDS, help="Delay between requests in seconds")
    return parser.parse_args()


def main():
    args = parse_args()
    meta = collect_leaderboard(
        start_page=args.start_page,
        max_pages=args.max_pages,
        per_page=args.per_page,
        force=args.force,
        regenerate_only=args.regenerate_only,
        delay_seconds=args.delay,
    )
    if not meta.get("complete"):
        sys.exit(1)


if __name__ == "__main__":
    main()
