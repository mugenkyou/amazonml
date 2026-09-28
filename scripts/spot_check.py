import json
import glob
import os

def spot_check():
    print("=" * 80)
    print("FINAL SPOT-CHECK TRACE ACROSS ALL SITE LAYERS")
    print("=" * 80)

    # Teams to trace
    targets = [
        ("58686151", "CDS_Team_iisc", "Indian Institute of Science (IISc), Bangalore"),
        ("59008636", "GG", "Lovely Professional University (LPU), Punjab"),
        ("59317387", "present day", "Lloyd Institute Of Engineering And Technology"),
        ("58855861", "Team X", "Indian Institute of Technology (IIT), Madras"),
        ("59233336", "Team Sandipani", "Chaitanya Bharathi Institute of Technology (CBIT), Hyderabad"),
        ("58688044", "Androids", "Koneru Lakshmaiah Education Foundation (K.L. University), Guntur"),
        ("59142319", "KL_converge", "LNM Institute of Information Technology (LNMIIT), Jaipur")
    ]

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")

    # Load master generated teams
    with open(os.path.join(data_dir, "generated", "teams.json"), "r", encoding="utf-8") as f:
        master_teams = {str(t["teamId"]): t for t in json.load(f)}

    # Load teams history
    with open(os.path.join(data_dir, "history", "teams-history.json"), "r", encoding="utf-8") as f:
        teams_history = json.load(f)

    # Load race data
    with open(os.path.join(data_dir, "leaderboard-race", "race-data.json"), "r", encoding="utf-8") as f:
        race_records = json.load(f)

    for tid, expected_name, expected_org in targets:
        print(f"\n[TEAM SPOT CHECK] ID: {tid}")
        
        # 1. Master generated team
        m = master_teams.get(tid)
        if m:
            print(f"  [OK] Final Leaderboard: Name='{m['teamName']}', Rank={m['rank']} (sortRank={m['sortRank']}), Score={m['score']}")
            print(f"    Organizations: {m.get('organizations')}")
        else:
            print("  [FAIL] NOT in Final Leaderboard!")

        # 2. History
        h = teams_history.get(tid)
        if h:
            obs = h.get("history", [])
            first_obs = obs[0] if obs else {}
            last_obs = obs[-1] if obs else {}
            print(f"  [OK] Team History: Name='{h.get('teamName')}', Snapshots={len(obs)}")
            print(f"    Earliest: Rank {first_obs.get('rank')} (Score {first_obs.get('score')}) | Latest: Rank {last_obs.get('rank')} (Score {last_obs.get('score')})")
        else:
            print("  [FAIL] NOT in Teams History!")

        # 3. Race Data
        r_matches = [r for r in race_records if str(r["team_id"]) == tid]
        if r_matches:
            first_r = r_matches[0]
            last_r = r_matches[-1]
            print(f"  [OK] Race Data: Name='{first_r['name']}', Present in {len(r_matches)} snapshots, Group='{first_r['group']}'")
            print(f"    Earliest Race: Rank {first_r['rank']} (Score {first_r['score']:.6f}) | Latest Race: Rank {last_r['rank']} (Score {last_r['score']:.6f})")
        else:
            print("  - Not in Top-50 race data (ranked outside top 50)")

if __name__ == "__main__":
    spot_check()
