import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
JSON_PATH = BASE_DIR / "web" / "data" / "generated" / "teams.json"
TXT_PATH = BASE_DIR / "top_50_teams.txt"

with open(JSON_PATH, "r", encoding="utf-8") as f:
    teams = json.load(f)

# Sort by sortRank ascending
teams.sort(key=lambda x: (x["sortRank"], x["teamName"]))
top_50 = teams[:50]

lines = []
lines.append("=" * 85)
lines.append("AMAZON ML CHALLENGE 2024 (UNSTOP CHALLENGE 290344) — TOP 50 LEADERBOARD TEAMS")
lines.append("=" * 85)
lines.append("")

lines.append("--------------------------------------------------------------------------------")
lines.append("PART 1: TOP 50 TEAM NAMES & PRIMARY INSTITUTIONS")
lines.append("--------------------------------------------------------------------------------")
lines.append(f"{'RANK':<6} {'TEAM NAME':<32} {'SCORE':<10} {'COLLEGE / INSTITUTION'}")
lines.append("-" * 85)

for idx, t in enumerate(top_50, 1):
    rank = t.get("rank") or str(idx)
    name = t.get("teamName") or "Unnamed"
    score = t.get("score") or "0.000000"
    orgs = t.get("organizations") or []
    org_str = "; ".join(orgs) if orgs else "Not specified"
    lines.append(f"#{rank:<5} {name:<32} {score:<10} {org_str}")

lines.append("")
lines.append("--------------------------------------------------------------------------------")
lines.append("PART 2: DETAILED TOP 50 TEAMS WITH ROSTER BREAKDOWN")
lines.append("--------------------------------------------------------------------------------")
lines.append("")

for idx, t in enumerate(top_50, 1):
    rank = t.get("rank") or str(idx)
    name = t.get("teamName") or "Unnamed"
    score = t.get("score") or "0.000000"
    team_id = t.get("teamId") or ""
    finish_time = t.get("finishTime") or "N/A"
    orgs = t.get("organizations") or []
    players = t.get("players") or []
    
    lines.append(f"Rank #{rank}: {name} (ID: {team_id})")
    lines.append(f"  • Final Score:    {score}")
    lines.append(f"  • Finish Time:    {finish_time}")
    lines.append(f"  • Institution(s): {', '.join(orgs) if orgs else 'Not specified'}")
    lines.append(f"  • Members ({len(players)}):")
    for p_idx, p in enumerate(players, 1):
        p_name = p.get("name", "Participant")
        p_org = p.get("organization", "Not specified")
        lines.append(f"      {p_idx}. {p_name} — {p_org}")
    lines.append("")

lines.append("=" * 85)
lines.append("END OF TOP 50 TEAMS REPORT")
lines.append("=" * 85)

output_text = "\n".join(lines)

with open(TXT_PATH, "w", encoding="utf-8") as f:
    f.write(output_text)

print(f"Successfully generated {TXT_PATH}")
