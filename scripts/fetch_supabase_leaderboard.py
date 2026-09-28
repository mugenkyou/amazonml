#!/usr/bin/env python3
"""
Amazon ML Challenge Leaderboard Scraper & Exporter
Fetches the entire leaderboard dataset (all 10,942 teams) from the Supabase RPC endpoint
and stores it in a structured JSON file.
"""

import sys
import os
import json
import time
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

DEFAULT_ENDPOINT = "https://uqvlhoejfxhgrnuxbglw.supabase.co/rest/v1/rpc/get_leaderboard"
DEFAULT_ANON_KEY = "sb_publishable_ccXtmZBdAD_b0G7PRSmcSA_wKJKUakL"
DEFAULT_OUTPUT = "supabase_leaderboard.json"
PAGE_SIZE = 100  # Endpoint caps at 100 items per page

def create_session() -> requests.Session:
    session = requests.Session()
    retries = Retry(
        total=5,
        backoff_factor=0.5,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["POST", "GET"]
    )
    adapter = HTTPAdapter(max_retries=retries, pool_connections=20, pool_maxsize=20)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session

def fetch_page(session: requests.Session, endpoint: str, anon_key: str, page: int, page_size: int = PAGE_SIZE) -> Dict[str, Any]:
    headers = {
        "apikey": anon_key,
        "Authorization": f"Bearer {anon_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    }
    payload = {
        "p_search": "",
        "p_page": page,
        "p_page_size": page_size
    }
    response = session.post(endpoint, json=payload, headers=headers, timeout=20)
    response.raise_for_status()
    return response.json()

def fetch_all_leaderboard(
    endpoint: str = DEFAULT_ENDPOINT,
    anon_key: str = DEFAULT_ANON_KEY,
    output_path: str = DEFAULT_OUTPUT,
    concurrency: int = 8
) -> List[Dict[str, Any]]:
    session = create_session()
    
    print("=" * 60)
    print("Amazon ML Challenge Leaderboard Exporter")
    print(f"Endpoint: {endpoint}")
    print(f"Output File: {output_path}")
    print("=" * 60)
    
    # 1. Fetch first page to get total count
    print("[1/3] Initializing connection and fetching metadata...")
    first_page_data = fetch_page(session, endpoint, anon_key, page=1, page_size=PAGE_SIZE)
    total_items = first_page_data.get("total", 0)
    first_page_items = first_page_data.get("items", [])
    
    if not total_items:
        print("Error: Could not retrieve total count from endpoint.")
        sys.exit(1)
        
    total_pages = (total_items + PAGE_SIZE - 1) // PAGE_SIZE
    print(f"Total Teams in Database: {total_items:,}")
    print(f"Total Pages to Fetch: {total_pages} (at {PAGE_SIZE} teams/page)")
    print(f"Concurrency: {concurrency} parallel workers")
    print("=" * 60)
    
    # Store items by page index
    pages_dict: Dict[int, List[Dict[str, Any]]] = {1: first_page_items}
    
    # 2. Concurrently fetch remaining pages
    print(f"[2/3] Fetching pages 2 through {total_pages}...")
    start_time = time.time()
    
    remaining_pages = list(range(2, total_pages + 1))
    completed_count = 1
    
    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        future_to_page = {
            executor.submit(fetch_page, session, endpoint, anon_key, page): page
            for page in remaining_pages
        }
        
        for future in as_completed(future_to_page):
            page = future_to_page[future]
            try:
                data = future.result()
                items = data.get("items", [])
                pages_dict[page] = items
                completed_count += 1
                
                pct = (completed_count / total_pages) * 100
                elapsed = time.time() - start_time
                rate = completed_count / elapsed if elapsed > 0 else 0
                print(f"\rProgress: [{completed_count}/{total_pages}] pages ({pct:.1f}%) | {rate:.1f} pages/sec", end="", flush=True)
            except Exception as exc:
                print(f"\nPage {page} generated an exception: {exc}")
                
    print(f"\nFetch completed in {time.time() - start_time:.2f} seconds.")
    
    # 3. Assemble and sort records
    print("[3/3] Assembling, validating, and saving dataset...")
    all_items: List[Dict[str, Any]] = []
    for page in sorted(pages_dict.keys()):
        all_items.extend(pages_dict[page])
        
    print(f"Total records fetched: {len(all_items):,}")
    
    # Deduplicate by team id if any overlaps occur
    seen_ids = set()
    unique_items: List[Dict[str, Any]] = []
    for item in all_items:
        item_id = item.get("id")
        if item_id and item_id not in seen_ids:
            seen_ids.add(item_id)
            unique_items.append(item)
            
    print(f"Unique teams verified: {len(unique_items):,}")
    
    # Ensure parent directory exists
    output_dir = os.path.dirname(os.path.abspath(output_path))
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
        
    # Save formatted JSON
    export_payload = {
        "metadata": {
            "source_endpoint": endpoint,
            "total_records": len(unique_items),
            "exported_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "page_size": PAGE_SIZE,
            "total_pages": total_pages,
        },
        "teams": unique_items
    }
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(export_payload, f, indent=2, ensure_ascii=False)
        
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Successfully saved {len(unique_items):,} teams to '{output_path}' ({file_size_mb:.2f} MB)")
    print("=" * 60)
    return unique_items

def main():
    parser = argparse.ArgumentParser(description="Fetch all 10,942 teams from Amazon ML Challenge Supabase Leaderboard.")
    parser.add_argument(
        "--output", "-o",
        default="data/supabase_leaderboard_all.json",
        help="Path to the output JSON file (default: data/supabase_leaderboard_all.json)"
    )
    parser.add_argument(
        "--endpoint", "-e",
        default=DEFAULT_ENDPOINT,
        help="Supabase RPC get_leaderboard URL"
    )
    parser.add_argument(
        "--apikey", "-k",
        default=DEFAULT_ANON_KEY,
        help="Supabase Publishable/Anon API Key"
    )
    parser.add_argument(
        "--concurrency", "-c",
        type=int,
        default=8,
        help="Number of concurrent worker threads (default: 8)"
    )
    args = parser.parse_args()
    
    fetch_all_leaderboard(
        endpoint=args.endpoint,
        anon_key=args.apikey,
        output_path=args.output,
        concurrency=args.concurrency
    )

if __name__ == "__main__":
    main()
