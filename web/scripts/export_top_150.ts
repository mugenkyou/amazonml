import fs from "fs";
import path from "path";

const teamsJsonPath = path.resolve(__dirname, "../data/generated/teams.json");
const outputTxtPath = path.resolve(__dirname, "../../top_150_teams.txt");

const raw = fs.readFileSync(teamsJsonPath, "utf-8");
const teams = JSON.parse(raw);

teams.sort((a: any, b: any) => a.sortRank - b.sortRank || a.teamName.localeCompare(b.teamName));
const top150 = teams.slice(0, 150);

const lines: string[] = [];

lines.push("====================================================================================================");
lines.push("               AMAZON ML CHALLENGE 2024 (UNSTOP CHALLENGE 290344) — TOP 150 LEADERBOARD TEAMS       ");
lines.push("====================================================================================================");
lines.push("");
lines.push("----------------------------------------------------------------------------------------------------");
lines.push("SECTION 1: TOP 150 TEAM NAMES & AFFILIATED COLLEGES (QUICK LOOKUP TABLE)");
lines.push("----------------------------------------------------------------------------------------------------");
lines.push(
  `${"RANK".padEnd(6, " ")} ${"SCORE".padEnd(10, " ")} ${"TEAM NAME".padEnd(35, " ")} ${"COLLEGES / INSTITUTIONS"}`
);
lines.push("-".repeat(100));

top150.forEach((t: any, idx: number) => {
  const rank = `#${t.rank || String(idx + 1)}`;
  const score = t.score || "0.000000";
  const name = t.teamName || "Unnamed";
  const orgs =
    t.organizations && t.organizations.length > 0
      ? t.organizations.join(" ; ")
      : "Not specified";

  lines.push(`${rank.padEnd(6, " ")} ${score.padEnd(10, " ")} ${name.padEnd(35, " ")} ${orgs}`);
});

lines.push("");
lines.push("----------------------------------------------------------------------------------------------------");
lines.push("SECTION 2: DETAILED ROSTER & PARTICIPANT BREAKDOWN (RANKS 1 TO 150)");
lines.push("----------------------------------------------------------------------------------------------------");
lines.push("");

top150.forEach((t: any, idx: number) => {
  const rank = t.rank || String(idx + 1);
  const name = t.teamName || "Unnamed";
  const score = t.score || "0.000000";
  const teamId = t.teamId || "";
  const finishTime = t.finishTime || "N/A";
  const orgs =
    t.organizations && t.organizations.length > 0
      ? t.organizations.join(" ; ")
      : "Not specified";
  const players = t.players || [];

  lines.push(`Rank #${rank}: ${name} (Team ID: ${teamId})`);
  lines.push(`  • Final Score:    ${score}`);
  lines.push(`  • Finish Time:    ${finishTime}`);
  lines.push(`  • Institution(s): ${orgs}`);
  lines.push(`  • Members (${players.length}):`);
  players.forEach((p: any, pIdx: number) => {
    lines.push(
      `      ${pIdx + 1}. ${p.name || "Participant"} — ${p.organization || "No org listed"}`
    );
  });
  lines.push("");
});

lines.push("====================================================================================================");
lines.push("                                      END OF TOP 150 TEAMS REPORT                                   ");
lines.push("====================================================================================================");

fs.writeFileSync(outputTxtPath, lines.join("\n"), "utf-8");
console.log(`Saved top 150 teams to ${outputTxtPath}`);
