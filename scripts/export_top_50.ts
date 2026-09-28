import fs from "fs";
import path from "path";

const teamsJsonPath = path.resolve(__dirname, "../data/generated/teams.json");
const outputTxtPath = path.resolve(__dirname, "../../top_50_teams.txt");

const raw = fs.readFileSync(teamsJsonPath, "utf-8");
const teams = JSON.parse(raw);

teams.sort((a: any, b: any) => a.sortRank - b.sortRank || a.teamName.localeCompare(b.teamName));
const top50 = teams.slice(0, 50);

const lines: string[] = [];

lines.push("================================================================================");
lines.push("           AMAZON ML CHALLENGE 2026 (UNSTOP 290344) — TOP 50 TEAMS              ");
lines.push("================================================================================");
lines.push("");
lines.push("--------------------------------------------------------------------------------");
lines.push("SUMMARY LIST (RANK | TEAM NAME | SCORE | INSTITUTION)");
lines.push("--------------------------------------------------------------------------------");

top50.forEach((t: any, idx: number) => {
  const rank = t.rank || String(idx + 1);
  const name = t.teamName || "Unnamed";
  const score = t.score || "0.000000";
  const orgs = (t.organizations && t.organizations.length > 0)
    ? t.organizations.join(" / ")
    : "Not specified";

  lines.push(`${rank.padStart(2, " ")}. [${score}] ${name} — ${orgs}`);
});

lines.push("");
lines.push("--------------------------------------------------------------------------------");
lines.push("DETAILED TOP 50 BREAKDOWN (TEAM DETAILS, SCORE, FINISH TIME & MEMBERS)");
lines.push("--------------------------------------------------------------------------------");
lines.push("");

top50.forEach((t: any, idx: number) => {
  const rank = t.rank || String(idx + 1);
  const name = t.teamName || "Unnamed";
  const score = t.score || "0.000000";
  const teamId = t.teamId || "";
  const finishTime = t.finishTime || "N/A";
  const orgs = (t.organizations && t.organizations.length > 0)
    ? t.organizations.join(" | ")
    : "Not specified";
  const players = t.players || [];

  lines.push(`RANK #${rank}: ${name} (Team ID: ${teamId})`);
  lines.push(`  • Final Score:    ${score}`);
  lines.push(`  • Finish Time:    ${finishTime}`);
  lines.push(`  • College(s):     ${orgs}`);
  lines.push(`  • Members (${players.length}):`);
  players.forEach((p: any, pIdx: number) => {
    lines.push(`      ${pIdx + 1}. ${p.name || "Participant"} (${p.organization || "No org listed"})`);
  });
  lines.push("");
});

lines.push("================================================================================");
lines.push("END OF TOP 50 TEAMS FILE");
lines.push("================================================================================");

fs.writeFileSync(outputTxtPath, lines.join("\n"), "utf-8");
console.log(`Saved top 50 teams to ${outputTxtPath}`);
