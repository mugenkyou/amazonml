/**
 * Build-time data preparation script for Next.js website.
 * Ingests processed CSV files and collection metadata from ../data/processed,
 * validates data integrity, and generates optimized JSON snapshots in web/data/generated/.
 */

import fs from "fs";
import path from "path";
import { normalizeOrganization, slugifyOrganization } from "../lib/normalize";
import type { DatasetMetadata, Organization, Player, Team } from "../lib/types";

const SOURCE_PROCESSED_DIR = path.resolve(__dirname, "../data/processed");
const OUTPUT_GENERATED_DIR = path.resolve(__dirname, "../data/generated");

interface RawTeamRow {
  team_id: string;
  team_name: string;
  rank: string;
  score: string;
  finish_time: string;
  has_played: string;
  proctoring_score: string;
  is_blacklisted: string;
}

interface RawPlayerRow {
  team_id: string;
  team_name: string;
  player_name: string;
  organization: string;
  player_index: string;
}

interface RawOrgRow {
  organization: string;
  normalized_organization: string;
  team_count: string;
  player_count: string;
}

interface RawTeamOrgRow {
  team_id: string;
  team_name: string;
  organization: string;
  normalized_organization: string;
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;
    const row: Record<string, string> = {};
    for (let h = 0; h < headers.length; h++) {
      row[headers[h]] = values[h] !== undefined ? values[h] : "";
    }
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuote && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === "," && !insideQuote) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function prepareData() {
  console.log("=================================================");
  console.log("Preparing Next.js Leaderboard Data Snapshot...");
  console.log(`Source directory: ${SOURCE_PROCESSED_DIR}`);
  console.log(`Output directory: ${OUTPUT_GENERATED_DIR}`);
  console.log("=================================================");

  // 1. Verify existence of source CSVs
  const requiredFiles = [
    "teams.csv",
    "players.csv",
    "organizations.csv",
    "team_organizations.csv",
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(SOURCE_PROCESSED_DIR, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Critical dataset file missing: ${filePath}. Please run 'python -m collector.fetch_all' first.`
      );
    }
  }

  // 2. Load and parse CSVs
  const teamsCsv = fs.readFileSync(path.join(SOURCE_PROCESSED_DIR, "teams.csv"), "utf-8");
  const playersCsv = fs.readFileSync(path.join(SOURCE_PROCESSED_DIR, "players.csv"), "utf-8");
  const orgsCsv = fs.readFileSync(path.join(SOURCE_PROCESSED_DIR, "organizations.csv"), "utf-8");
  const teamOrgsCsv = fs.readFileSync(path.join(SOURCE_PROCESSED_DIR, "team_organizations.csv"), "utf-8");

  const rawTeams = parseCSV(teamsCsv) as unknown as RawTeamRow[];
  const rawPlayers = parseCSV(playersCsv) as unknown as RawPlayerRow[];
  const rawOrgs = parseCSV(orgsCsv) as unknown as RawOrgRow[];
  const rawTeamOrgs = parseCSV(teamOrgsCsv) as unknown as RawTeamOrgRow[];

  console.log(`Parsed ${rawTeams.length} teams, ${rawPlayers.length} players, ${rawOrgs.length} org entries.`);

  // 3. Load metadata if available
  let metadata: DatasetMetadata = {
    challengeId: "290344",
    collectionStartedAt: null,
    collectionFinishedAt: null,
    recordsCollected: rawTeams.length,
    uniqueTeams: rawTeams.length,
    uniquePlayers: rawPlayers.length,
    uniqueOrganizations: rawOrgs.length,
    complete: true,
    sourceEndpoint: "https://unstop.com/api/public/live-leaderboard/290344/CodeContest",
  };

  const metaPath = path.join(SOURCE_PROCESSED_DIR, "collection_metadata.json");
  if (fs.existsSync(metaPath)) {
    try {
      const rawMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      metadata = {
        challengeId: rawMeta.challenge_id || "290344",
        collectionStartedAt: rawMeta.collection_started_at || null,
        collectionFinishedAt: rawMeta.collection_finished_at || null,
        recordsCollected: rawMeta.records_collected || rawTeams.length,
        uniqueTeams: rawMeta.unique_teams || rawTeams.length,
        uniquePlayers: rawMeta.unique_players || rawPlayers.length,
        uniqueOrganizations: rawMeta.unique_organizations || rawOrgs.length,
        complete: Boolean(rawMeta.complete),
        failedPages: rawMeta.failed_pages || [],
        sourceEndpoint: rawMeta.source_endpoint || metadata.sourceEndpoint,
      };
    } catch (e) {
      console.warn("Failed to parse collection_metadata.json, using fallback defaults.", e);
    }
  }

  // 4. Group players by team_id
  const playersByTeam = new Map<string, Player[]>();
  for (const p of rawPlayers) {
    const tid = p.team_id?.trim();
    if (!tid) continue;

    const org = p.organization?.trim() || "";
    const normOrg = normalizeOrganization(org);

    let idx = 0;
    try {
      idx = parseInt(p.player_index, 10) || 0;
    } catch {
      idx = 0;
    }

    const playerObj: Player = {
      name: p.player_name?.trim() || "Participant",
      organization: org,
      normalizedOrganization: normOrg,
      playerIndex: idx,
    };

    if (!playersByTeam.has(tid)) {
      playersByTeam.set(tid, []);
    }
    playersByTeam.get(tid)!.push(playerObj);
  }

  // 5. Group organizations by team_id
  const orgsByTeam = new Map<string, Set<string>>();
  const orgToTeamIds = new Map<string, Set<string>>();

  for (const to of rawTeamOrgs) {
    const tid = to.team_id?.trim();
    const org = to.organization?.trim();
    const normOrg = normalizeOrganization(org || to.normalized_organization);
    if (!tid || !org) continue;

    if (!orgsByTeam.has(tid)) {
      orgsByTeam.set(tid, new Set());
    }
    orgsByTeam.get(tid)!.add(org);

    if (!orgToTeamIds.has(normOrg)) {
      orgToTeamIds.set(normOrg, new Set());
    }
    orgToTeamIds.get(normOrg)!.add(tid);
  }

  // 6. Build Teams list and index
  const teamsList: Team[] = [];
  const teamsById: Record<string, Team> = {};

  for (const t of rawTeams) {
    const tid = t.team_id?.trim();
    if (!tid) continue;

    const rankStr = t.rank?.trim() || "";
    let sortRank = 9999999;
    try {
      const parsedRank = parseInt(rankStr, 10);
      if (!isNaN(parsedRank)) sortRank = parsedRank;
    } catch {
      sortRank = 9999999;
    }

    const teamPlayers = playersByTeam.get(tid) || [];
    const teamOrgsSet = orgsByTeam.get(tid) || new Set<string>();

    // If orgs not in team_organizations, derive from player records
    if (teamOrgsSet.size === 0) {
      for (const p of teamPlayers) {
        if (p.organization) teamOrgsSet.add(p.organization);
      }
    }

    const teamOrgs = Array.from(teamOrgsSet).sort();
    const normTeamOrgs = teamOrgs.map(normalizeOrganization);

    // Update orgToTeamIds mapping for derived orgs
    for (const no of normTeamOrgs) {
      if (no) {
        if (!orgToTeamIds.has(no)) {
          orgToTeamIds.set(no, new Set());
        }
        orgToTeamIds.get(no)!.add(tid);
      }
    }

    const teamObj: Team = {
      teamId: tid,
      teamName: t.team_name?.trim() || "Unnamed Team",
      rank: rankStr,
      sortRank,
      score: t.score?.trim() || "0.000000",
      finishTime: t.finish_time?.trim() || "",
      hasPlayed: t.has_played?.trim() || "",
      proctoringScore: t.proctoring_score?.trim() || "",
      isBlacklisted: t.is_blacklisted?.trim() || "",
      players: teamPlayers,
      organizations: teamOrgs,
      normalizedOrganizations: normTeamOrgs,
    };

    teamsList.push(teamObj);
    teamsById[tid] = teamObj;
  }

  // Sort teams by rank ascending, then score descending, then name
  teamsList.sort((a, b) => a.sortRank - b.sortRank || a.teamName.localeCompare(b.teamName));

  // 7. Build Organizations list with unique slugs
  const slugCounts = new Map<string, number>();
  const organizationsList: Organization[] = [];

  for (const o of rawOrgs) {
    const orgName = o.organization?.trim();
    if (!orgName) continue;

    const normOrg = normalizeOrganization(orgName);
    let slug = slugifyOrganization(orgName);

    // Handle slug collision safely
    if (slugCounts.has(slug)) {
      const count = slugCounts.get(slug)! + 1;
      slugCounts.set(slug, count);
      slug = `${slug}-${count}`;
    } else {
      slugCounts.set(slug, 1);
    }

    const teamIds = Array.from(orgToTeamIds.get(normOrg) || []);

    let teamCount = teamIds.length;
    let playerCount = 0;
    try {
      playerCount = parseInt(o.player_count, 10) || 0;
    } catch {
      playerCount = 0;
    }

    organizationsList.push({
      name: orgName,
      normalizedName: normOrg,
      slug,
      teamCount,
      playerCount,
      teamIds,
    });
  }

  // Sort orgs by team count descending
  organizationsList.sort((a, b) => b.teamCount - a.teamCount || a.name.localeCompare(b.name));

  // 8. Build Organization Index (normalized organization -> team IDs)
  const organizationIndex: Record<string, string[]> = {};
  for (const [normOrg, tidsSet] of orgToTeamIds.entries()) {
    organizationIndex[normOrg] = Array.from(tidsSet);
  }

  // 8.5 Build Inter-College Teams snapshot
  const orgByNormMap = new Map<string, Organization>();
  const orgBySlugMap = new Map<string, Organization>();
  for (const org of organizationsList) {
    if (org.normalizedName) orgByNormMap.set(org.normalizedName, org);
    if (org.slug) orgBySlugMap.set(org.slug, org);
  }

  const interCollegeTeamsSnapshot = [];
  for (const team of teamsList) {
    const rawOrgs: string[] = [];
    if (team.players && team.players.length > 0) {
      for (const p of team.players) {
        if (p.organization?.trim()) rawOrgs.push(p.organization.trim());
      }
    }
    if (rawOrgs.length === 0 && team.organizations && team.organizations.length > 0) {
      for (const o of team.organizations) {
        if (o?.trim()) rawOrgs.push(o.trim());
      }
    }

    const seenSlugs = new Set<string>();
    const resolvedOrgs = [];

    for (const raw of rawOrgs) {
      const norm = normalizeOrganization(raw);
      const slugGuess = slugifyOrganization(raw);
      const matched = orgByNormMap.get(norm) || orgBySlugMap.get(slugGuess);

      const orgRef = matched
        ? { name: matched.name, normalizedName: matched.normalizedName || norm, slug: matched.slug }
        : { name: raw.trim(), normalizedName: norm, slug: slugGuess };

      if (orgRef.slug && !seenSlugs.has(orgRef.slug)) {
        seenSlugs.add(orgRef.slug);
        resolvedOrgs.push(orgRef);
      }
    }

    if (resolvedOrgs.length >= 2) {
      interCollegeTeamsSnapshot.push({
        teamId: team.teamId,
        teamName: team.teamName,
        rank: team.rank,
        sortRank: team.sortRank,
        score: team.score,
        finishTime: team.finishTime,
        hasPlayed: team.hasPlayed,
        proctoringScore: team.proctoringScore,
        isBlacklisted: team.isBlacklisted,
        players: team.players,
        organizations: resolvedOrgs,
        collegeCount: resolvedOrgs.length,
      });
    }
  }

  // 9. Write outputs to web/data/generated/
  fs.mkdirSync(OUTPUT_GENERATED_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(OUTPUT_GENERATED_DIR, "teams.json"),
    JSON.stringify(teamsList, null, 2),
    "utf-8"
  );

  fs.writeFileSync(
    path.join(OUTPUT_GENERATED_DIR, "organizations.json"),
    JSON.stringify(organizationsList, null, 2),
    "utf-8"
  );

  fs.writeFileSync(
    path.join(OUTPUT_GENERATED_DIR, "organization-index.json"),
    JSON.stringify(organizationIndex, null, 2),
    "utf-8"
  );

  fs.writeFileSync(
    path.join(OUTPUT_GENERATED_DIR, "inter-college-teams.json"),
    JSON.stringify(interCollegeTeamsSnapshot, null, 2),
    "utf-8"
  );

  fs.writeFileSync(
    path.join(OUTPUT_GENERATED_DIR, "metadata.json"),
    JSON.stringify(metadata, null, 2),
    "utf-8"
  );

  console.log("=================================================");
  console.log("Data Snapshot Generation Summary:");
  console.log(`- Teams: ${teamsList.length}`);
  console.log(`- Organizations: ${organizationsList.length}`);
  console.log(`- Inter-College Teams: ${interCollegeTeamsSnapshot.length}`);
  console.log(`- Org Index entries: ${Object.keys(organizationIndex).length}`);
  console.log(`- Metadata status: ${metadata.complete ? "COMPLETE" : "PARTIAL"}`);
  console.log(`Files generated in: ${OUTPUT_GENERATED_DIR}`);
  console.log("=================================================");
}

prepareData().catch((err) => {
  console.error("Data preparation failed:", err);
  process.exit(1);
});
