"""
Root Entrypoint for Unstop Leaderboard Data Synchronization.
Fetches fresh data from the Unstop API, updates processed CSVs, and compiles Web JSONs.

Usage:
  python sync_data.py                          # Full single fetch & web sync
  python sync_data.py --watch                  # Continuous auto-sync loop (every 60s)
  python sync_data.py --watch --interval 30    # Continuous sync every 30s
  python sync_data.py --regenerate-only        # Fast offline rebuild & web sync
  python sync_data.py --max-pages 5            # Quick test sync
"""

from collector.sync import main

if __name__ == "__main__":
    main()
