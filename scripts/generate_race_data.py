import os
import json
import glob
from datetime import datetime, timedelta

def main():
    print("=" * 60)
    print("Pre-processing Amazon ML Challenge 2026 Historical Race Data...")
    print("=" * 60)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")

    # 1. Load snapshots timeline
    timeline_path = os.path.join(data_dir, "indexes", "timeline-snapshots.json")
    with open(timeline_path, "r", encoding="utf-8") as f:
        snapshots_timeline = json.load(f)

    print(f"Total chronological snapshots in timeline: {len(snapshots_timeline)}")

    # 2. Load generated teams mapping for clean names and academic organizations
    teams_gen_path = os.path.join(data_dir, "generated", "teams.json")
    team_lookup = {}
    if os.path.exists(teams_gen_path):
        with open(teams_gen_path, "r", encoding="utf-8") as f:
            generated_teams = json.load(f)
            for t in generated_teams:
                tid = str(t.get("teamId", "")).strip()
                if tid:
                    tname = t.get("teamName")
                    orgs = t.get("organizations", [])
                    clean_name = tname.strip() if tname and tname != "Unnamed Team" and tname != tid else ""
                    team_lookup[tid] = {
                        "team_name": clean_name,
                        "organization": orgs[0] if orgs else "Independent / General",
                        "organizations": orgs
                    }

    print(f"Loaded {len(team_lookup)} master teams from {teams_gen_path}")

    # Map snapshotId -> dict of team_id -> team record
    snapshot_teams_map = {s["snapshotId"]: {} for s in snapshots_timeline}

    # 3. Load teams history from data/history/teams-history.json
    history_file = os.path.join(data_dir, "history", "teams-history.json")
    if os.path.exists(history_file):
        print(f"Loading history from {history_file}...")
        with open(history_file, "r", encoding="utf-8") as f:
            teams_hist = json.load(f)
            
        for tid, tdata in teams_hist.items():
            tid = str(tid).strip()
            tname = tdata.get("teamName")
            if not tname or tname == "Unnamed Team" or tname == tid:
                tname = team_lookup.get(tid, {}).get("team_name", "")
            else:
                tname = tname.strip()
                
            org_info = team_lookup.get(tid, {}).get("organization", "Independent")
            
            for obs in tdata.get("history", []):
                sid = obs.get("snapshotId")
                if sid in snapshot_teams_map:
                    try:
                        rank_val = int(obs.get("rank"))
                        score_val = float(obs.get("score"))
                        snapshot_teams_map[sid][tid] = {
                            "team_id": tid,
                            "team_name": tname or f"Team {tid}",
                            "rank": rank_val,
                            "score": score_val,
                            "score_str": str(obs.get("score")),
                            "organization": org_info,
                            "status": obs.get("status", "active"),
                            "rankDelta": obs.get("rankDelta", 0)
                        }
                    except (ValueError, TypeError):
                        pass

    # 4. Scan all snapshot directories under save_for_later/
    sfl_dirs = sorted(glob.glob("save_for_later/snapshot_*")) + sorted(glob.glob("save_for_later/*"))
    # filter unique directories
    seen_dirs = set()
    unique_sfl_dirs = []
    for d in sfl_dirs:
        if os.path.isdir(d) and d not in seen_dirs:
            seen_dirs.add(d)
            unique_sfl_dirs.append(d)

    print(f"Scanning {len(unique_sfl_dirs)} save_for_later directories...")

    for sdir in unique_sfl_dirs:
        base_name = os.path.basename(sdir)
        meta_file = os.path.join(sdir, "metadata.json")
        
        # Match to snapshot in timeline
        sid_match = None
        ts = None
        if os.path.exists(meta_file):
            try:
                with open(meta_file, "r", encoding="utf-8") as mf:
                    mdata = json.load(mf)
                    ts = mdata.get("collectionStartedAt") or mdata.get("timestamp") or mdata.get("snapshotId")
            except Exception:
                pass

        for s in snapshots_timeline:
            if s["snapshotId"] == base_name or (ts and s["snapshotId"] in ts) or (ts and s["timestamp"].startswith(str(ts)[:16])):
                sid_match = s["snapshotId"]
                break
            if base_name in s["snapshotId"]:
                sid_match = s["snapshotId"]
                break

        if not sid_match or sid_match not in snapshot_teams_map:
            continue

        # Prefer reading from raw_pages/*.json (unaltered Unstop API pages)
        raw_pages_dir = os.path.join(sdir, "raw_pages")
        raw_page_files = sorted(glob.glob(os.path.join(raw_pages_dir, "page_*.json")))
        
        if raw_page_files:
            # Parse top pages (up to first 5 pages, 150 teams, more than enough for Top 50)
            for rpf in raw_page_files[:5]:
                try:
                    with open(rpf, "r", encoding="utf-8") as rf:
                        pdata = json.load(rf)
                    items = []
                    if isinstance(pdata, dict):
                        items = pdata.get("data", {}).get("data", []) or pdata.get("data", [])
                    elif isinstance(pdata, list):
                        items = pdata
                        
                    for it in items:
                        if not isinstance(it, dict):
                            continue
                        
                        # ACTUAL SCHEMA EXTRACTION:
                        # record.team.id / record.team_id is the actual team_id
                        # record.id is the submission row ID - NEVER use record.id as team_id!
                        team_obj = it.get("team") if isinstance(it.get("team"), dict) else {}
                        raw_tid = team_obj.get("id") or it.get("team_id")
                        if not raw_tid:
                            continue
                        
                        team_id = str(raw_tid).strip()
                        
                        # Extract team name safely
                        tname = team_obj.get("team_name") or team_obj.get("name") or it.get("team_name")
                        if not tname or tname == "Unnamed Team" or tname == team_id:
                            tname = team_lookup.get(team_id, {}).get("team_name", "")
                        else:
                            tname = tname.strip()
                            
                        # If still empty, lookup in team_lookup
                        if not tname:
                            tname = team_lookup.get(team_id, {}).get("team_name", f"Team {team_id}")
                            
                        # Extract organization
                        orgs = []
                        for pl in team_obj.get("players", []):
                            if isinstance(pl, dict) and pl.get("organisation"):
                                orgs.append(pl["organisation"].strip())
                                
                        org_info = orgs[0] if orgs else team_lookup.get(team_id, {}).get("organization", "Independent")
                        
                        try:
                            rank_val = int(it.get("rank"))
                            score_val = float(it.get("score"))
                            
                            snapshot_teams_map[sid_match][team_id] = {
                                "team_id": team_id,
                                "team_name": tname,
                                "rank": rank_val,
                                "score": score_val,
                                "score_str": str(it.get("score")),
                                "organization": org_info,
                                "status": "active",
                                "rankDelta": 0
                            }
                        except (ValueError, TypeError):
                            pass
                except Exception as e:
                    pass
        else:
            # Fallback to teams.json if raw_pages don't exist
            teams_file = os.path.join(sdir, "teams.json")
            if os.path.exists(teams_file):
                try:
                    with open(teams_file, "r", encoding="utf-8") as tf:
                        snap_teams = json.load(tf)
                    for st in snap_teams:
                        # Only accept if genuine team_id
                        raw_tid = st.get("team_id") or st.get("teamId")
                        if not raw_tid:
                            continue
                        team_id = str(raw_tid).strip()
                        
                        # If the team_id looks like a submission row ID (e.g. 9 digits) and not in master lookup,
                        # skip it to prevent fallback row IDs
                        tname = st.get("team_name") or st.get("teamName")
                        if not tname or tname == "Unnamed Team" or tname == team_id:
                            tname = team_lookup.get(team_id, {}).get("team_name", "")
                        else:
                            tname = tname.strip()
                            
                        if not tname:
                            tname = team_lookup.get(team_id, {}).get("team_name", f"Team {team_id}")
                            
                        org_info = team_lookup.get(team_id, {}).get("organization", "Independent")
                        try:
                            rank_val = int(st.get("rank"))
                            score_val = float(st.get("score"))
                            snapshot_teams_map[sid_match][team_id] = {
                                "team_id": team_id,
                                "team_name": tname,
                                "rank": rank_val,
                                "score": score_val,
                                "score_str": str(st.get("score")),
                                "organization": org_info,
                                "status": "active",
                                "rankDelta": 0
                            }
                        except (ValueError, TypeError):
                            pass
                except Exception:
                    pass

    # 5. Build Top 50 for every snapshot with stable colors
    colors_palette = [
        "#FF9900", "#007185", "#067D62", "#E47911", "#5C2D91",
        "#B12704", "#005F73", "#0A9396", "#94D2BD", "#E9D8A6",
        "#EE9B00", "#CA6702", "#BB3E03", "#AE2012", "#9B2226",
        "#2A9D8F", "#E76F51", "#264653", "#F4A261", "#457B9D",
        "#1D3557", "#6A4C93", "#1982C4", "#8AC926", "#FFCA3A",
        "#FF595E", "#3D5A80", "#98C1D9", "#EE6C4D", "#293241",
        "#3A86FF", "#8338EC", "#FF006E", "#FB5607", "#FFBE0B",
        "#4361EE", "#4CC9F0", "#7209B7", "#F72585", "#4895EF"
    ]

    def get_team_color(tid_str):
        hash_val = 0
        for char in tid_str:
            hash_val = (hash_val << 5) - hash_val + ord(char)
            hash_val &= 0xFFFFFFFF
        return colors_palette[abs(hash_val) % len(colors_palette)]

    all_top50_records = []
    unique_race_teams = set()
    snapshots_meta_list = []
    previous_top50_ids = set()

    for snap_idx, snap_info in enumerate(snapshots_timeline, 1):
        sid = snap_info["snapshotId"]
        team_dict = snapshot_teams_map.get(sid, {})
        teams_list = list(team_dict.values())
        
        # Sort by recorded rank ascending, then score descending
        teams_list.sort(key=lambda x: (x["rank"], -x["score"]))
        top50 = teams_list[:50]
        
        current_top50_ids = set(t["team_id"] for t in top50)
        new_entries = current_top50_ids - previous_top50_ids if previous_top50_ids else set()
        dropped_entries = previous_top50_ids - current_top50_ids if previous_top50_ids else set()
        previous_top50_ids = current_top50_ids

        # ISO date key formatted for chronologic indexing
        dt_key = (datetime(2026, 1, 1) + timedelta(days=snap_idx - 1)).strftime("%Y-%m-%d")
        time_clean = snap_info["timeFormatted"].replace(" IST", "")
        date_label = f"S{snap_idx:02d} • {snap_info['dateFormatted']}, {time_clean}"
        
        for rank_i, t in enumerate(top50, 1):
            unique_race_teams.add(t["team_id"])
            is_new_to_top50 = t["team_id"] in new_entries
            
            raw_score = round(t["score"], 6)
            all_top50_records.append({
                "date": dt_key,
                "name": t["team_name"],
                "team_id": t["team_id"],
                "value": raw_score,
                "score": raw_score,
                "score_formatted": f"{raw_score:.6f}",
                "rank": rank_i,
                "recorded_rank": t["rank"],
                "group": t["organization"],
                "color": get_team_color(t["team_id"]),
                "is_new_to_top50": is_new_to_top50,
                "rank_delta": t.get("rankDelta", 0)
            })
        
        snapshots_meta_list.append({
            "snapshotNumber": snap_idx,
            "snapshotId": sid,
            "timestamp": snap_info["timestamp"],
            "dateFormatted": snap_info["dateFormatted"],
            "timeFormatted": snap_info["timeFormatted"],
            "dateKey": dt_key,
            "dateLabel": date_label,
            "teamCount": snap_info.get("teamCount", len(teams_list)),
            "top50Count": len(top50),
            "newEntriesCount": len(new_entries),
            "droppedEntriesCount": len(dropped_entries),
            "leader": top50[0] if top50 else None,
            "top5": top50[:5]
        })

    # Save to data/leaderboard-race/
    out_dir = os.path.join(data_dir, "leaderboard-race")
    os.makedirs(out_dir, exist_ok=True)

    with open(os.path.join(out_dir, "race-data.json"), "w", encoding="utf-8") as f:
        json.dump(all_top50_records, f, indent=2)

    with open(os.path.join(out_dir, "snapshots-meta.json"), "w", encoding="utf-8") as f:
        json.dump(snapshots_meta_list, f, indent=2)

    meta_payload = {
        "total_snapshots": len(snapshots_timeline),
        "top_n": 50,
        "total_race_records": len(all_top50_records),
        "unique_teams_in_top50": len(unique_race_teams),
        "earliest_snapshot": snapshots_timeline[0]["timestamp"],
        "latest_snapshot": snapshots_timeline[-1]["timestamp"],
        "final_leader": snapshots_meta_list[-1]["leader"] if snapshots_meta_list else None,
        "final_top50": [r for r in all_top50_records if r["date"] == snapshots_meta_list[-1]["dateKey"]],
        "created_at": datetime.now().isoformat()
    }
    
    with open(os.path.join(out_dir, "metadata.json"), "w", encoding="utf-8") as f:
        json.dump(meta_payload, f, indent=2)

    print("=" * 60)
    print(f"RACE DATA REGENERATION COMPLETE:")
    print(f"- Total Snapshots: {len(snapshots_timeline)}")
    print(f"- Top 50 Records Generated: {len(all_top50_records)}")
    print(f"- Unique Teams in Top 50: {len(unique_race_teams)}")
    if all_top50_records:
        print(f"- Value Range: min={min(r['value'] for r in all_top50_records):.6f}, max={max(r['value'] for r in all_top50_records):.6f}")
    print(f"- Output Directory: {out_dir}/")
    print("=" * 60)

if __name__ == "__main__":
    main()
