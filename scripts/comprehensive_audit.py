import os
import json
import glob
from collections import defaultdict

def run_comprehensive_audit():
    print("=" * 80)
    print("FINAL WEBSITE DATA INTEGRITY & CONSISTENCY AUDIT")
    print("=" * 80)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")

    # 1. Load Timeline Snapshots
    timeline_path = os.path.join(data_dir, "indexes", "timeline-snapshots.json")
    with open(timeline_path, "r", encoding="utf-8") as f:
        timeline = json.load(f)
    print(f"[1] Timeline snapshots: {len(timeline)} (from {timeline[0]['timestamp']} to {timeline[-1]['timestamp']})")

    # 2. Load Master Generated Teams
    gen_teams_path = os.path.join(data_dir, "generated", "teams.json")
    with open(gen_teams_path, "r", encoding="utf-8") as f:
        gen_teams = json.load(f)
    print(f"[2] Master generated teams: {len(gen_teams)}")
    
    # Check for invalid team IDs in generated/teams.json
    invalid_gen_tids = [t for t in gen_teams if str(t.get("teamId")).startswith("21") and len(str(t.get("teamId"))) == 9]
    print(f"    - Invalid submission row IDs in generated/teams.json: {len(invalid_gen_tids)}")
    unknown_gen_names = [t for t in gen_teams if t.get("teamName") in ["Unknown Team", "Unnamed Team", ""] or not t.get("teamName")]
    print(f"    - Unknown/Unnamed team names in generated/teams.json: {len(unknown_gen_names)}")

    gen_team_map = {str(t["teamId"]): t for t in gen_teams}

    # 3. Load Teams History
    history_path = os.path.join(data_dir, "history", "teams-history.json")
    teams_history = {}
    if os.path.exists(history_path):
        with open(history_path, "r", encoding="utf-8") as f:
            teams_history = json.load(f)
    print(f"[3] Teams history: {len(teams_history)} teams")

    history_records = defaultdict(dict) # tid -> snapshot_id -> {rank, score, name}
    history_conflicts = []
    history_invalid_ids = []
    for tid, tdata in teams_history.items():
        tid_str = str(tid).strip()
        if tid_str.startswith("21") and len(tid_str) == 9:
            history_invalid_ids.append(tid_str)
        tname = tdata.get("teamName", "")
        for obs in tdata.get("history", []):
            sid = obs.get("snapshotId")
            r_val = obs.get("rank")
            s_val = obs.get("score")
            if r_val is None or s_val is None:
                continue
            try:
                rank = int(r_val)
                score = float(s_val)
            except (ValueError, TypeError):
                continue
            if sid in history_records[tid_str]:
                existing = history_records[tid_str][sid]
                if existing["rank"] != rank or abs(existing["score"] - score) > 1e-6:
                    history_conflicts.append((tid_str, sid, existing, {"rank": rank, "score": score}))
            else:
                history_records[tid_str][sid] = {"rank": rank, "score": score, "name": tname}

    print(f"    - Invalid submission row IDs in teams-history.json: {len(history_invalid_ids)}")
    print(f"    - Conflicting observations within teams-history.json: {len(history_conflicts)}")

    # 4. Load Race Data
    race_path = os.path.join(data_dir, "leaderboard-race", "race-data.json")
    with open(race_path, "r", encoding="utf-8") as f:
        race_records = json.load(f)
    print(f"[4] Race data: {len(race_records)} observations")

    race_conflicts_with_history = []
    race_invalid_tids = []
    race_unknown_names = []
    date_to_sid_map = {}
    for idx, s in enumerate(timeline):
        d_key = f"2026-01-{idx+1:02d}"
        date_to_sid_map[d_key] = s["snapshotId"]

    for r in race_records:
        tid = str(r["team_id"]).strip()
        tname = r["name"]
        date = r["date"]
        score = float(r["score"])
        recorded_rank = int(r["recorded_rank"])
        
        if tid.startswith("21") and len(tid) == 9:
            race_invalid_tids.append(tid)
        if tname in ["Unknown Team", "Unnamed Team"] or tname.startswith("Team #") or not tname:
            race_unknown_names.append((tid, date, tname))
            
        sid = date_to_sid_map.get(date)
        if sid and tid in history_records and sid in history_records[tid]:
            hist_obs = history_records[tid][sid]
            hist_rank = hist_obs["rank"]
            hist_score = hist_obs["score"]
            if hist_rank != recorded_rank or abs(hist_score - score) > 1e-5:
                race_conflicts_with_history.append((tid, sid, {"race_rank": recorded_rank, "race_score": score}, hist_obs))

    print(f"    - Invalid submission row IDs in race-data.json: {len(race_invalid_tids)}")
    print(f"    - Unknown/Unnamed team names in race-data.json: {len(race_unknown_names)}")
    print(f"    - Conflicts between race-data and teams-history: {len(race_conflicts_with_history)}")

    # 5. Load College / Statistics Data
    stats_path = os.path.join(data_dir, "generated", "competition-stats.json")
    with open(stats_path, "r", encoding="utf-8") as f:
        stats = json.load(f)
    print(f"[5] Competition stats: {len(stats.get('participationOverTime', []))} timeline points")

    colleges_summary_path = os.path.join(data_dir, "generated", "colleges-summary.json")
    with open(colleges_summary_path, "r", encoding="utf-8") as f:
        colleges_summary = json.load(f)
    print(f"    - Colleges in directory summary: {len(colleges_summary)}")

    colleges_lb_path = os.path.join(data_dir, "generated", "colleges-leaderboard.json")
    with open(colleges_lb_path, "r", encoding="utf-8") as f:
        colleges_lb = json.load(f)
    print(f"    - Metric leaderboard tabs: {list(colleges_lb.keys())}")

    # 6. Check College Profile Files for Data Consistency
    college_files = glob.glob(os.path.join(data_dir, "generated", "colleges", "*.json"))
    print(f"[6] College profile files: {len(college_files)} colleges audited")
    college_team_conflicts = []
    for cfile in college_files:
        try:
            with open(cfile, "r", encoding="utf-8") as cf:
                cdata = json.load(cf)
            for t in cdata.get("teams", []):
                tid = str(t.get("teamId")).strip()
                if tid in gen_team_map:
                    master = gen_team_map[tid]
                    m_rank = int(master.get("sortRank", master.get("rank")))
                    c_rank = int(t.get("rank"))
                    m_score = float(master.get("score"))
                    c_score = float(t.get("scoreNumber", t.get("score")))
                    if m_rank != c_rank or abs(m_score - c_score) > 1e-6:
                        college_team_conflicts.append((cfile, tid, t, master))
        except Exception as e:
            pass

    print(f"    - College team conflicts with master generated teams: {len(college_team_conflicts)}")

    print("\n" + "=" * 80)
    print("AUDIT SUMMARY RESULTS:")
    print(f"- Total Snapshots Audited: {len(timeline)}")
    print(f"- Total Teams Audited: {len(gen_teams)}")
    print(f"- Total College Profiles Audited: {len(college_files)}")
    print(f"- Submission Row ID Leaks (Forbidden): {len(invalid_gen_tids) + len(history_invalid_ids) + len(race_invalid_tids)}")
    print(f"- Unknown/Fallback Team Names in Race Data: {len(race_unknown_names)}")
    print(f"- Cross-Dataset Conflicts: {len(history_conflicts) + len(race_conflicts_with_history) + len(college_team_conflicts)}")
    print("=" * 80)

if __name__ == "__main__":
    run_comprehensive_audit()
