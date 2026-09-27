"""
Continuous Leaderboard Sync Loop Runner for Amazon ML Challenge 2026.

Periodically fetches live leaderboard standings, validates data against safety thresholds,
and updates Supabase PostgreSQL without requiring Git commits or Vercel redeployments.

Usage:
  python scripts/run_sync_loop.py                                      # Default: 10m interval, 6h duration
  python scripts/run_sync_loop.py --interval 600 --duration 21600      # Explicit 10m interval, 6h duration
  python scripts/run_sync_loop.py --interval 30 --duration 120         # Fast test mode
"""

import argparse
import datetime
import logging
import os
import sys
import time
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Load .env variables
try:
    from dotenv import load_dotenv
    load_dotenv(ROOT_DIR / ".env")
    load_dotenv(ROOT_DIR / ".env.local")
    load_dotenv(ROOT_DIR / "web" / ".env")
    load_dotenv(ROOT_DIR / "web" / ".env.local")
except ImportError:
    pass

from collector.sync import sync_all

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("sync_loop")


def format_duration(seconds: float) -> str:
    """Format seconds into readable H:M:S."""
    hours, rem = divmod(int(seconds), 3600)
    minutes, secs = divmod(rem, 60)
    if hours > 0:
        return f"{hours}h {minutes}m {secs}s"
    elif minutes > 0:
        return f"{minutes}m {secs}s"
    return f"{secs}s"


def run_loop(interval: int = 600, duration: int = 21600, force: bool = True) -> None:
    """
    Executes periodic sync until duration expires or user interrupts with Ctrl+C.
    """
    start_time = time.time()
    end_time = start_time + duration if duration > 0 else float("inf")
    cycle = 1

    print("\n" + "=" * 75)
    print(" AMAZON ML CHALLENGE 2026 — LIVE LEADERBOARD SYNC RUNNER")
    print("=" * 75)
    print(f" Sync Interval:    {interval} seconds ({format_duration(interval)})")
    print(f" Target Duration:  {duration} seconds ({format_duration(duration)})")
    print(f" Supabase Host:    {os.environ.get('NEXT_PUBLIC_SUPABASE_URL') or os.environ.get('SUPABASE_URL') or 'Not configured (Local cache only)'}")
    print(" Press Ctrl+C at any time to gracefully terminate.")
    print("=" * 75 + "\n")

    try:
        while time.time() < end_time:
            now_str = datetime.datetime.now().strftime("%H:%M:%S")
            elapsed = time.time() - start_time
            remaining = max(0.0, end_time - time.time()) if duration > 0 else float("inf")

            print(f"[{now_str}] Sync cycle #{cycle} started (Elapsed: {format_duration(elapsed)}, Remaining: {format_duration(remaining)})")
            cycle_start = time.time()

            try:
                result = sync_all(force=force)
                cycle_duration = time.time() - cycle_start
                teams_count = result.get("web_sync", {}).get("teams_count", 0)
                sb_sync = result.get("web_sync", {}).get("supabase_sync") or {}

                now_complete = datetime.datetime.now().strftime("%H:%M:%S")
                print(f"[{now_complete}] Sync cycle #{cycle} successful ({cycle_duration:.1f}s)")
                print(f"         - Teams: {teams_count}")
                if sb_sync and sb_sync.get("status") == "success":
                    print(f"         - Supabase: Synced {sb_sync.get('teams_synced')} teams ({sb_sync.get('teams_changed')} changed, {sb_sync.get('teams_added')} added)")

            except KeyboardInterrupt:
                raise
            except Exception as err:
                now_err = datetime.datetime.now().strftime("%H:%M:%S")
                print(f"[{now_err}] ERROR in cycle #{cycle}: {err}")
                logger.error("Sync error in cycle #%d: %s", cycle, err, exc_info=True)

            if time.time() >= end_time:
                break

            sleep_time = min(interval, max(1.0, end_time - time.time()))
            print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Next sync in {format_duration(sleep_time)}...\n")
            time.sleep(sleep_time)
            cycle += 1

        total_elapsed = time.time() - start_time
        print("\n" + "=" * 75)
        print(f" SYNC RUNNER COMPLETE: Ran {cycle} cycles over {format_duration(total_elapsed)}.")
        print("=" * 75 + "\n")

    except KeyboardInterrupt:
        total_elapsed = time.time() - start_time
        print("\n\n" + "=" * 75)
        print(f" Sync runner stopped by user after {cycle} cycles ({format_duration(total_elapsed)}).")
        print("=" * 75 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Live Leaderboard Continuous Sync Loop")
    parser.add_argument("--interval", type=int, default=600, help="Sync interval in seconds (default: 600s / 10 min)")
    parser.add_argument("--duration", type=int, default=21600, help="Total run duration in seconds (default: 21600s / 6 hours)")
    parser.add_argument("--no-force", dest="force", action="store_false", help="Skip re-downloading raw API pages if already cached")
    args = parser.parse_args()

    run_loop(interval=args.interval, duration=args.duration, force=args.force)
