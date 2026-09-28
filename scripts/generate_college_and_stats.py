import json
import os
import statistics
import math

print("=== Generating College & Competition Statistics Datasets ===")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
GENERATED_DIR = os.path.join(DATA_DIR, 'generated')
COLLEGES_DIR = os.path.join(GENERATED_DIR, 'colleges')
os.makedirs(COLLEGES_DIR, exist_ok=True)

# 1. Load data
print("Loading source datasets...")
with open(os.path.join(GENERATED_DIR, 'organizations.json'), 'r', encoding='utf-8') as f:
    orgs_list = json.load(f)

with open(os.path.join(GENERATED_DIR, 'teams.json'), 'r', encoding='utf-8') as f:
    teams_list = json.load(f)

with open(os.path.join(DATA_DIR, 'history', 'teams-history.json'), 'r', encoding='utf-8') as f:
    teams_hist = json.load(f)

with open(os.path.join(DATA_DIR, 'indexes', 'timeline-snapshots.json'), 'r', encoding='utf-8') as f:
    snapshots = json.load(f)

print(f"Loaded {len(orgs_list)} orgs, {len(teams_list)} teams, {len(teams_hist)} team histories, {len(snapshots)} snapshots.")

# Map teamId -> team object in final snapshot
teams_by_id = {t['teamId']: t for t in teams_list}

# Pre-map teamId -> set of org names/slugs
team_to_orgs = {}
for org in orgs_list:
    slug = org['slug']
    for tid in org.get('teamIds', []):
        if tid not in team_to_orgs:
            team_to_orgs[tid] = []
        team_to_orgs[tid].append(slug)

# Precompute per-snapshot active teams and participant stats
print("Computing snapshot analytics...")
snapshot_stats_list = []
participation_over_time = []

# Define score bucket thresholds
SCORE_BUCKETS = [
    {"label": "0.00–0.20", "min": 0.0, "max": 0.20},
    {"label": "0.20–0.40", "min": 0.20, "max": 0.40},
    {"label": "0.40–0.60", "min": 0.40, "max": 0.60},
    {"label": "0.60–0.80", "min": 0.60, "max": 0.80},
    {"label": "0.80–0.90", "min": 0.80, "max": 0.90},
    {"label": "0.90–0.95", "min": 0.90, "max": 0.95},
    {"label": "0.95–0.98", "min": 0.95, "max": 0.98},
    {"label": "0.98–1.00", "min": 0.98, "max": 1.0001},
]

for s in snapshots:
    sid = s['snapshotId']
    snap_num = s.get('snapshotNumber', 0)
    scores = []
    active_team_ids = set()
    active_org_slugs = set()
    total_participants = 0

    for tid, th in teams_hist.items():
        for h in th.get('history', []):
            if h.get('snapshotId') == sid:
                active_team_ids.add(tid)
                try:
                    sc = float(h.get('score', 0))
                    scores.append(sc)
                except:
                    pass
                # Check orgs
                if tid in team_to_orgs:
                    for oslug in team_to_orgs[tid]:
                        active_org_slugs.add(oslug)
                # Check participants from teams_by_id if available
                if tid in teams_by_id:
                    total_participants += len(teams_by_id[tid].get('players', []))
                else:
                    # fallback estimate if team not in final teams list
                    total_participants += 1
                break

    team_cnt = len(active_team_ids)
    org_cnt = len(active_org_slugs)
    
    if scores:
        avg_score = round(statistics.mean(scores), 6)
        med_score = round(statistics.median(scores), 6)
        min_score = round(min(scores), 6)
        max_score = round(max(scores), 6)
        
        # Calculate buckets
        bucket_counts = [0] * len(SCORE_BUCKETS)
        for sc in scores:
            for idx, b in enumerate(SCORE_BUCKETS):
                if b["min"] <= sc < b["max"] or (idx == len(SCORE_BUCKETS) - 1 and sc <= b["max"]):
                    bucket_counts[idx] += 1
                    break
        
        buckets_data = []
        for idx, b in enumerate(SCORE_BUCKETS):
            cnt = bucket_counts[idx]
            pct = round((cnt / len(scores)) * 100, 2) if len(scores) > 0 else 0
            buckets_data.append({
                "label": b["label"],
                "min": b["min"],
                "max": b["max"],
                "count": cnt,
                "percentage": pct
            })
    else:
        avg_score = 0.0
        med_score = 0.0
        min_score = 0.0
        max_score = 0.0
        buckets_data = [{"label": b["label"], "min": b["min"], "max": b["max"], "count": 0, "percentage": 0.0} for b in SCORE_BUCKETS]

    snap_stat = {
        "snapshotId": sid,
        "snapshotNumber": snap_num,
        "timestamp": s.get('timestamp', ''),
        "dateFormatted": s.get('dateFormatted', ''),
        "timeFormatted": s.get('timeFormatted', ''),
        "teamCount": team_cnt,
        "participantCount": total_participants,
        "orgCount": org_cnt,
        "avgScore": avg_score,
        "medianScore": med_score,
        "minScore": min_score,
        "maxScore": max_score,
        "scoreBuckets": buckets_data
    }
    snapshot_stats_list.append(snap_stat)

    participation_over_time.append({
        "snapshotId": sid,
        "snapshotNumber": snap_num,
        "timestamp": s.get('timestamp', ''),
        "dateFormatted": s.get('dateFormatted', ''),
        "timeFormatted": s.get('timeFormatted', ''),
        "teams": team_cnt,
        "participants": total_participants,
        "organizations": org_cnt
    })

# Compute competition overall summary
all_participants_set = set()
for t in teams_list:
    for p in t.get('players', []):
        pname = p.get('name', '').strip().lower()
        porg = p.get('organization', '').strip().lower()
        if pname:
            all_participants_set.add((pname, porg))

comp_summary = {
    "totalTeams": len(teams_list),
    "totalParticipants": len(all_participants_set) if len(all_participants_set) > 0 else sum(len(t.get('players', [])) for t in teams_list),
    "totalOrganizations": len(orgs_list),
    "totalSnapshots": len(snapshots),
    "finalSnapshotTimestamp": snapshots[-1].get('timestamp', '')
}

comp_stats_payload = {
    "summary": comp_summary,
    "participationOverTime": participation_over_time,
    "snapshots": snapshot_stats_list
}

with open(os.path.join(GENERATED_DIR, 'competition-stats.json'), 'w', encoding='utf-8') as f:
    json.dump(comp_stats_payload, f, indent=2)

print("Saved Final/data/generated/competition-stats.json")

# 2. Process Colleges / Organizations
print("Processing college profiles & historical calculations...")
colleges_summary = []
college_profile_map = {}

for org in orgs_list:
    name = org.get('name', '').strip()
    slug = org.get('slug', '').strip()
    norm_name = org.get('normalizedName', '').strip()
    team_ids = org.get('teamIds', [])
    
    # Final teams for this org
    org_teams = []
    for tid in team_ids:
        if tid in teams_by_id:
            org_teams.append(teams_by_id[tid])
    
    # Sort teams by sortRank / rank
    def get_team_rank(t):
        try:
            return int(t.get('rank', 999999))
        except:
            return 999999

    org_teams.sort(key=get_team_rank)

    # Participants count (unique in org)
    org_participants = set()
    for t in org_teams:
        for p in t.get('players', []):
            pname = p.get('name', '').strip()
            if pname:
                org_participants.add(pname)
    participant_count = len(org_participants) if org_participants else org.get('playerCount', len(org_teams) * 2)

    # Best rank and score
    best_rank = None
    best_score = None
    best_team = None
    
    if org_teams:
        top_t = org_teams[0]
        try:
            best_rank = int(top_t.get('rank', 0))
        except:
            best_rank = None
        try:
            best_score = round(float(top_t.get('score', 0)), 6)
        except:
            best_score = None
        best_team = {
            "teamId": top_t.get('teamId'),
            "teamName": top_t.get('teamName'),
            "rank": best_rank,
            "score": best_score
        }

    # Distribution Buckets
    # Top 10 (1-10), Top 100 (11-100), Top 500 (101-500), 500+ (501+)
    c_top10 = 0
    c_top100 = 0
    c_top500 = 0
    c_above500 = 0

    for t in org_teams:
        r = get_team_rank(t)
        if 1 <= r <= 10:
            c_top10 += 1
        elif 11 <= r <= 100:
            c_top100 += 1
        elif 101 <= r <= 500:
            c_top500 += 1
        elif r > 500:
            c_above500 += 1

    total_t = len(org_teams)
    dist_data = {
        "top10": {
            "label": "Top 10",
            "range": "Ranks 1–10",
            "count": c_top10,
            "percentage": round((c_top10 / total_t * 100), 1) if total_t > 0 else 0.0
        },
        "top100": {
            "label": "Top 100",
            "range": "Ranks 11–100",
            "count": c_top100,
            "percentage": round((c_top100 / total_t * 100), 1) if total_t > 0 else 0.0
        },
        "top500": {
            "label": "Top 500",
            "range": "Ranks 101–500",
            "count": c_top500,
            "percentage": round((c_top500 / total_t * 100), 1) if total_t > 0 else 0.0
        },
        "above500": {
            "label": "500+",
            "range": "Ranks 501+",
            "count": c_above500,
            "percentage": round((c_above500 / total_t * 100), 1) if total_t > 0 else 0.0
        }
    }

    # Cumulative Top 100 count (1..100) & Top 500 count (1..500)
    teams_in_top100 = c_top10 + c_top100
    teams_in_top500 = c_top10 + c_top100 + c_top500

    # Historical average score & best team score across snapshots
    org_team_id_set = set(team_ids)
    historical_scores = []

    for s in snapshots:
        sid = s['snapshotId']
        s_scores = []
        s_best_sc = -1.0
        s_best_name = ""
        s_best_tid = ""

        for tid in org_team_id_set:
            if tid in teams_hist:
                th = teams_hist[tid]
                for h in th.get('history', []):
                    if h.get('snapshotId') == sid:
                        try:
                            sc = float(h.get('score', 0))
                            if sc > 0:
                                s_scores.append(sc)
                                if sc > s_best_sc:
                                    s_best_sc = sc
                                    s_best_name = th.get('teamName', '')
                                    s_best_tid = tid
                        except:
                            pass
                        break

        if s_scores:
            s_avg = statistics.mean(s_scores)
            historical_scores.append({
                "snapshotId": sid,
                "snapshotNumber": s.get('snapshotNumber'),
                "timestamp": s.get('timestamp'),
                "dateFormatted": s.get('dateFormatted'),
                "timeFormatted": s.get('timeFormatted'),
                "avgScore": round(s_avg, 6),
                "teamCount": len(s_scores),
                "bestScore": round(s_best_sc, 6) if s_best_sc > 0 else None,
                "bestTeamName": s_best_name,
                "bestTeamId": s_best_tid
            })

    # Growth calculation: Final average F1 minus Initial recorded average F1
    # Minimum 2 snapshots required for meaningful growth
    if len(historical_scores) >= 2:
        init_avg = historical_scores[0]['avgScore']
        final_avg = historical_scores[-1]['avgScore']
        abs_change = round(final_avg - init_avg, 6)
        growth_info = {
            "hasEnoughData": True,
            "initialAvg": init_avg,
            "finalAvg": final_avg,
            "absoluteChange": abs_change,
            "growthFormatted": f"{abs_change:+.4f}",
            "initialSnapshot": f"S{historical_scores[0]['snapshotNumber']} ({historical_scores[0]['dateFormatted']})",
            "finalSnapshot": f"S{historical_scores[-1]['snapshotNumber']} ({historical_scores[-1]['dateFormatted']})"
        }
    else:
        growth_info = {
            "hasEnoughData": False,
            "initialAvg": historical_scores[0]['avgScore'] if historical_scores else None,
            "finalAvg": historical_scores[-1]['avgScore'] if historical_scores else None,
            "absoluteChange": None,
            "growthFormatted": "Insufficient historical data",
            "initialSnapshot": None,
            "finalSnapshot": None
        }

    # Format teams list for the profile table
    team_table_rows = []
    for t in org_teams:
        tid = t.get('teamId')
        # Rank change and score change from history
        r_delta = 0
        sc_delta = 0.0
        if tid in teams_hist and teams_hist[tid].get('history'):
            latest_h = teams_hist[tid]['history'][-1]
            r_delta = latest_h.get('rankDelta', 0)
            sc_delta = latest_h.get('scoreDelta', 0.0)

        pnames = [p.get('name', '') for p in t.get('players', []) if p.get('name')]
        
        try:
            rank_val = int(t.get('rank', 0))
        except:
            rank_val = 0
        try:
            score_val = float(t.get('score', 0))
        except:
            score_val = 0.0

        team_table_rows.append({
            "teamId": tid,
            "teamName": t.get('teamName', ''),
            "rank": rank_val,
            "score": f"{score_val:.6f}",
            "scoreNumber": score_val,
            "rankDelta": r_delta,
            "scoreDelta": sc_delta,
            "playerCount": len(pnames),
            "players": pnames
        })

    # Summary entry for directory / search
    colleges_summary.append({
        "name": name,
        "slug": slug,
        "normalizedName": norm_name,
        "teamCount": len(org_teams),
        "participantCount": participant_count,
        "bestRank": best_rank,
        "bestScore": best_score,
        "teamsInTop100": teams_in_top100,
        "teamsInTop500": teams_in_top500,
        "growth": growth_info.get("absoluteChange"),
        "growthFormatted": growth_info.get("growthFormatted")
    })

    # Detailed profile payload
    profile_payload = {
        "name": name,
        "slug": slug,
        "normalizedName": norm_name,
        "teamCount": len(org_teams),
        "participantCount": participant_count,
        "bestRank": best_rank,
        "bestScore": best_score,
        "bestTeam": best_team,
        "teamsInTop100": teams_in_top100,
        "teamsInTop500": teams_in_top500,
        "distribution": dist_data,
        "growth": growth_info,
        "historicalScores": historical_scores,
        "teams": team_table_rows
    }

    # Write individual profile JSON
    profile_path = os.path.join(COLLEGES_DIR, f"{slug}.json")
    with open(profile_path, 'w', encoding='utf-8') as f:
        json.dump(profile_payload, f, separators=(',', ':'))

# Save colleges-summary.json
with open(os.path.join(GENERATED_DIR, 'colleges-summary.json'), 'w', encoding='utf-8') as f:
    json.dump(colleges_summary, f, separators=(',', ':'))

print(f"Saved {len(colleges_summary)} college profiles under {COLLEGES_DIR}")
print("Saved Final/data/generated/colleges-summary.json")

# 3. Generate College Leaderboards with 4 distinct metric tabs
print("Generating College Leaderboards...")

# Tab 1: Final Performance (Ranked by highest recorded final team score)
# Exclude colleges with no score
tab1_list = []
for c in colleges_summary:
    if c['bestScore'] is not None and c['bestScore'] > 0:
        # Find best team name
        tab1_list.append({
            "name": c['name'],
            "slug": c['slug'],
            "bestScore": c['bestScore'],
            "bestRank": c['bestRank'],
            "teamCount": c['teamCount'],
            "participantCount": c['participantCount']
        })

tab1_list.sort(key=lambda x: (x['bestScore'], -x['teamCount']), reverse=True)
for i, item in enumerate(tab1_list):
    item['rank'] = i + 1

# Tab 2: Participation (Ranked by number of participating teams, secondary by participants)
tab2_list = []
for c in colleges_summary:
    if c['teamCount'] > 0:
        tab2_list.append({
            "name": c['name'],
            "slug": c['slug'],
            "teamCount": c['teamCount'],
            "participantCount": c['participantCount'],
            "bestRank": c['bestRank']
        })

tab2_list.sort(key=lambda x: (x['teamCount'], x['participantCount']), reverse=True)
for i, item in enumerate(tab2_list):
    item['rank'] = i + 1

# Tab 3: Top 100 (Ranked by number of teams in the final recorded Top 100)
tab3_list = []
for c in colleges_summary:
    if c['teamsInTop100'] > 0:
        tab3_list.append({
            "name": c['name'],
            "slug": c['slug'],
            "teamsInTop100": c['teamsInTop100'],
            "teamCount": c['teamCount'],
            "participantCount": c['participantCount'],
            "bestRank": c['bestRank']
        })

tab3_list.sort(key=lambda x: (x['teamsInTop100'], -x['bestRank'] if x['bestRank'] else 0), reverse=True)
for i, item in enumerate(tab3_list):
    item['rank'] = i + 1

# Tab 4: Growth (Ranked by change in average team F1 score from first usable snapshot to final snapshot)
# Exclude institutions without statistically meaningful data
tab4_list = []
for c in colleges_summary:
    if c['growth'] is not None and c['teamCount'] >= 2:
        # load profile to get initial and final average
        prof_path = os.path.join(COLLEGES_DIR, f"{c['slug']}.json")
        with open(prof_path, 'r', encoding='utf-8') as pf:
            prof = json.load(pf)
        g = prof.get('growth', {})
        if g.get('hasEnoughData'):
            tab4_list.append({
                "name": c['name'],
                "slug": c['slug'],
                "initialAvg": g['initialAvg'],
                "finalAvg": g['finalAvg'],
                "growth": g['absoluteChange'],
                "growthFormatted": g['growthFormatted'],
                "teamCount": c['teamCount'],
                "initialSnapshot": g['initialSnapshot'],
                "finalSnapshot": g['finalSnapshot']
            })

tab4_list.sort(key=lambda x: x['growth'], reverse=True)
for i, item in enumerate(tab4_list):
    item['rank'] = i + 1

leaderboard_payload = {
    "finalPerformance": {
        "title": "Final Performance",
        "description": "Ranked by highest recorded final team score.",
        "total": len(tab1_list),
        "data": tab1_list
    },
    "participation": {
        "title": "Participation",
        "description": "Ranked by number of participating teams.",
        "total": len(tab2_list),
        "data": tab2_list
    },
    "top100": {
        "title": "Top 100",
        "description": "Ranked by number of teams in the final recorded Top 100.",
        "total": len(tab3_list),
        "data": tab3_list
    },
    "growth": {
        "title": "Growth",
        "description": "Ranked by change in average team F1 score from first usable snapshot to final snapshot (min. 2 teams with multi-snapshot history).",
        "total": len(tab4_list),
        "data": tab4_list
    }
}

with open(os.path.join(GENERATED_DIR, 'colleges-leaderboard.json'), 'w', encoding='utf-8') as f:
    json.dump(leaderboard_payload, f, separators=(',', ':'))

print(f"Saved Final/data/generated/colleges-leaderboard.json")
print(f"Tab 1 (Final Performance): {len(tab1_list)} institutions")
print(f"Tab 2 (Participation): {len(tab2_list)} institutions")
print(f"Tab 3 (Top 100): {len(tab3_list)} institutions")
print(f"Tab 4 (Growth): {len(tab4_list)} institutions")
print("=== Done generating all college and competition statistics datasets! ===")
