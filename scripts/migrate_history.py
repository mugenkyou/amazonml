"""
CLI Script to execute the full Git Historical Leaderboard Migration.
Reconstructs all previous snapshots from Git commits and generates web/data/history/ datasets.

Usage:
  python scripts/migrate_history.py
"""

import sys
import logging
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from collector.history import migrate_git_history

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

if __name__ == "__main__":
    print("=" * 70)
    print(" STARTING LEADERBOARD GIT HISTORY MIGRATION")
    print("=" * 70)
    report = migrate_git_history()
    print("\n" + "=" * 70)
    print(" MIGRATION COMPLETED SUCCESSFULLY")
    print(f" - Snapshots Processed:    {report['snapshotsProcessed']}")
    print(f" - Unique Teams Observed:  {report['teamsObserved']}")
    print(f" - Historical Observations: {report['historicalRecords']}")
    print(f" - Total Change Events:    {report['changeEvents']}")
    print(f" - First Snapshot Time:    {report['firstSnapshot']}")
    print(f" - Last Snapshot Time:     {report['lastSnapshot']}")
    print(f" - Report File:            {report['historyDir']}/history-migration-report.json")
    print("=" * 70 + "\n")
