import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
JSON_PATH = BASE_DIR / "web" / "data" / "generated" / "teams.json"
TXT_PATH = BASE_DIR / "top_150_teams.txt"

with open(JSON_PATH, "r", encoding="utf-8") as f:
    teams = json.load(f)

teams.sort(key=lambda x: (x["sortRank"], x["teamName"]))
top_150 = teams[:150]

lines = []
lines.append("====================================================================================================")
lines.append("               AMAZON ML CHALLENGE 2024 (UNSTOP CHALLENGE 290344) — TOP 150 LEADERBOARD TEAMS       ")
lines.append("====================================================================================================")
lines.append("")
lines.append("----------------------------------------------------------------------------------------------------")
lines.append("SECTION 1: TOP 150 TEAM NAMES & AFFILIATED COLLEGES (QUICK LOOKUP TABLE)")
lines.append("----------------------------------------------------------------------------------------------------")
lines.append(f"{'RANK':<6} {'SCORE':<10} {'TEAM NAME':<35} {'COLLEGES / INSTITUTIONS'}")
lines.append("-" * 100)

for idx, t in enumerate(top_150, 1):
    rank = f"#{t.get('rank') or str(idx)}"
    name = t.get("teamName") or "Unnamed"
    score = t.get("score") or "0.000000"
    orgs = t.get("organizations") or []
    org_str = " ; ".join(orgs) if orgs else "Not specified"
    lines.append(f"{rank:<6} {score:<10} {name:<35} {org_str}")

lines.append("")
lines.append("----------------------------------------------------------------------------------------------------")
lines.append("SECTION 2: DETAILED ROSTER & PARTICIPANT BREAKDOWN (RANKS 1 TO 150)")
lines.append("----------------------------------------------------------------------------------------------------")
lines.append("")

for idx, t in enumerate(top_150, 1):
    rank = t.get("rank") or str(idx)
    name = t.get("teamName") or "Unnamed"
    score = t.get("score") or "0.000000"
    team_id = t.get("teamId") or ""
    finish_time = t.get("finishTime") or "N/A"
    orgs = t.get("organizations") or []
    players = t.get("players") or []
    
    lines.append(f"Rank #{rank}: {name} (Team ID: {team_id})")
    lines.append(f"  • Final Score:    {score}")
    lines.append(f"  • Finish Time:    {finish_time}")
    lines.append(f"  • Institution(s): {', '.join(orgs) if orgs else 'Not specified'}")
    lines.append(f"  • Members ({len(players)}):")
    for p_idx, p in enumerate(players, 1):
        p_name = p.get("name", "Participant")
        p_org = p.get("organization", "Not specified")
        lines.append(f"      {p_idx}. {p_name} — {p_org}")
    lines.append("")

lines.append("====================================================================================================")
lines.append("                                      END OF TOP 150 TEAMS REPORT                                   ")
lines.append("====================================================================================================")

output_text = "\n".join(lines)

with open(TXT_PATH, "w", encoding="utf-8") as f:
    f.write(output_text)

print(f"Successfully generated {TXT_PATH}")
