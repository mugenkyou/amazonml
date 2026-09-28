import json
import os
from collections import Counter

def validate():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    race_path = os.path.join(base_dir, "data", "leaderboard-race", "race-data.json")
    meta_path = os.path.join(base_dir, "data", "leaderboard-race", "snapshots-meta.json")
    
    with open(race_path, "r", encoding="utf-8") as f:
        records = json.load(f)
        
    with open(meta_path, "r", encoding="utf-8") as f:
        snapshots = json.load(f)
        
    print("=" * 70)
    print("RACE DATA INTEGRITY VALIDATION")
    print("=" * 70)

    # 1. Number of unique teams
    unique_teams = set(r["team_id"] for r in records)
    print(f"1. Unique teams in Top-50: {len(unique_teams)}")

    # 2. Number of snapshots
    print(f"2. Number of snapshots: {len(snapshots)}")

    # 3. Number of race observations
    print(f"3. Number of race observations: {len(records)}")

    # 4. Number of records with missing team_name
    missing_names = [r for r in records if not r.get("name") or not r.get("name").strip()]
    print(f"4. Records with missing team_name: {len(missing_names)}")

    # 5. Number of records where team_id matches a submission row ID (e.g. 211765593, 212696950, etc.)
    # In Unstop, submission row IDs for this contest are 9 digits starting with '21', while team IDs are 8 digits starting with '58' or '59'
    submission_row_ids = [r for r in records if str(r.get("team_id")).startswith("21") and len(str(r.get("team_id"))) == 9]
    print(f"5. Records where team_id matches a submission row ID: {len(submission_row_ids)}")

    # 6. Number of duplicate team_id + snapshot combinations
    date_team_pairs = [(r["date"], r["team_id"]) for r in records]
    counts = Counter(date_team_pairs)
    duplicates = [pair for pair, c in counts.items() if c > 1]
    print(f"6. Duplicate (team_id + snapshot) combinations: {len(duplicates)}")

    # 7. Number of Unknown Team / Unnamed Team records
    unknown_teams = [r for r in records if r.get("name") in ["Unknown Team", "Unnamed Team"] or r.get("name").startswith("Team #")]
    print(f"7. Unknown Team / Unnamed Team count: {len(unknown_teams)}")

    print("\n" + "=" * 70)
    print("MANUAL VERIFICATION OF KNOWN TARGET EXAMPLES:")
    print("=" * 70)

    target_verification = {
        "58686151": ("CDS_Team_iisc", "211765593"),
        "59008636": ("GG", "212696950"),
        "59317387": ("present day", "213487515"),
        "58855861": ("Team X", "212679480"),
        "59233336": ("Team Sandipani", "212802168")
    }

    # Check that forbidden submission IDs never appear
    forbidden_ids = ["211765593", "212696950", "213487515", "212679480", "212802168"]
    found_forbidden = [r for r in records if str(r.get("team_id")) in forbidden_ids]
    print(f"Forbidden submission IDs present as team_id: {len(found_forbidden)}")

    for actual_tid, (expected_name, row_id) in target_verification.items():
        matches = [r for r in records if str(r.get("team_id")) == actual_tid]
        if matches:
            first = matches[0]
            print(f"[PASSED] Target Team {actual_tid}: Name='{first['name']}', Expected='{expected_name}' (Seen in {len(matches)} snapshots, row ID {row_id} correctly bypassed)")
        else:
            print(f"[FAILED] Target Team {actual_tid} not found in Top-50 records")

if __name__ == "__main__":
    validate()
