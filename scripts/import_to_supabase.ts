/**
 * ==============================================================================
 * Amazon ML Challenge 2026 Historical Archive - Supabase One-Time Import Script (TS)
 * File: Final/scripts/import_to_supabase.ts
 * ==============================================================================
 * Performs idempotent, one-time migration of historical competition data into
 * Supabase PostgreSQL using the service-role key.
 *
 * Usage:
 *   npx tsx scripts/import_to_supabase.ts [--dry-run]
 * ==============================================================================
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_DIR = path.resolve(process.cwd(), "data");
const GENERATED_DIR = path.resolve(DATA_DIR, "generated");
const HISTORY_DIR = path.resolve(DATA_DIR, "history");

const isDryRun = process.argv.includes("--dry-run");

async function runOneTimeImport() {
  console.log("=================================================");
  console.log("Starting Supabase Historical Archive Import...");
  console.log("Mode:", isDryRun ? "DRY-RUN (Validation Only)" : "LIVE DATABASE UPSERT");
  console.log("Target Database:", supabaseUrl);
  console.log("=================================================");

  // 1. Load Generated JSONs
  const teamsPath = path.join(GENERATED_DIR, "teams.json");
  const orgsPath = path.join(GENERATED_DIR, "organizations.json");
  const snapsPath = path.join(HISTORY_DIR, "snapshots.json");

  if (!fs.existsSync(teamsPath) || !fs.existsSync(orgsPath)) {
    console.error("Required dataset JSONs missing in data/generated/.");
    process.exit(1);
  }

  const teams = JSON.parse(fs.readFileSync(teamsPath, "utf-8"));
  const orgs = JSON.parse(fs.readFileSync(orgsPath, "utf-8"));
  const snaps = fs.existsSync(snapsPath) ? JSON.parse(fs.readFileSync(snapsPath, "utf-8")) : [];

  console.log(`Loaded ${teams.length} teams, ${orgs.length} organizations, ${snaps.length} snapshots.`);

  // 2. Validate Benchmark Teams
  const benchmarkTeams: Record<string, string> = {
    "58686151": "CDS_Team_iisc",
    "59008636": "GG",
    "59317387": "present day",
    "58855861": "Team X",
    "59233336": "Team Sandipani",
  };

  const teamsById = new Map<string, any>();
  for (const t of teams) {
    teamsById.set(String(t.teamId), t);
  }

  for (const [tid, expectedName] of Object.entries(benchmarkTeams)) {
    const t = teamsById.get(tid);
    if (!t) {
      console.warn(`WARNING: Benchmark team ${tid} not found in source dataset!`);
    } else if (t.teamName !== expectedName) {
      console.warn(`WARNING: Team ${tid} name mismatch: expected '${expectedName}', got '${t.teamName}'`);
    } else {
      console.log(`✓ Benchmark verified: Team ${tid} -> ${expectedName} (Rank #${t.rank})`);
    }
  }

  if (isDryRun) {
    console.log("Dry run validation finished successfully. No database writes.");
    return;
  }

  const BATCH_SIZE = 500;

  // Helper to fetch all rows across 1000-item page boundaries
  async function fetchAll<T>(tableName: string, columns: string): Promise<T[]> {
    const allRows: T[] = [];
    const PAGE_SIZE = 1000;
    let from = 0;
    while (true) {
      const { data, error } = await supabase.from(tableName).select(columns).range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allRows.push(...(data as T[]));
      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }
    return allRows;
  }

  // 3. Fetch Existing Organizations from DB
  console.log("Checking existing organizations in database...");
  const existingOrgs = await fetchAll<{ id: number; organization_key: string; slug: string }>("organizations", "id, organization_key, slug");
  const existingOrgByKey = new Map<string, any>();
  const takenSlugs = new Set<string>();

  for (const eo of existingOrgs) {
    existingOrgByKey.set(eo.organization_key, eo);
    takenSlugs.add(eo.slug);
  }
  console.log(`Found ${existingOrgs.length} existing organizations in Supabase.`);

  // 4. Prepare Organizations Payload
  console.log(`Processing ${orgs.length} organizations from dataset...`);
  const orgsToInsert: any[] = [];
  const orgsMap = new Map<string, any>();

  for (const o of orgs) {
    const orgKey = (o.normalizedName || o.name || "").toLowerCase().trim();
    if (!orgKey) continue;

    if (existingOrgByKey.has(orgKey)) {
      // Already in DB with correct slug
      const existing = existingOrgByKey.get(orgKey);
      orgsMap.set(orgKey, existing);
    } else if (!orgsMap.has(orgKey)) {
      let baseSlug = (o.slug || orgKey.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "college");
      let finalSlug = baseSlug;
      let counter = 2;
      while (takenSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${counter++}`;
      }
      takenSlugs.add(finalSlug);

      const newOrg = {
        organization_key: orgKey,
        organization_name: o.name,
        normalized_name: o.normalizedName || o.name.toLowerCase().trim(),
        slug: finalSlug,
        team_count: o.teamCount || 0,
        player_count: o.playerCount || 0,
      };
      orgsMap.set(orgKey, newOrg);
      orgsToInsert.push(newOrg);
    }
  }

  if (orgsToInsert.length > 0) {
    console.log(`Inserting ${orgsToInsert.length} new organizations...`);
    for (let i = 0; i < orgsToInsert.length; i += BATCH_SIZE) {
      const chunk = orgsToInsert.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("organizations").insert(chunk);
      if (error) {
        console.error("Error inserting organizations chunk:", error);
        throw error;
      }
    }
  } else {
    console.log("All organizations already present in database.");
  }

  // 4. Fetch Complete Organization ID Map
  const orgRows = await fetchAll<{ id: number; organization_key: string; slug: string }>("organizations", "id, organization_key, slug");
  const orgIdByKey = new Map<string, number>();
  const orgSlugByKey = new Map<string, string>();
  for (const row of orgRows) {
    orgIdByKey.set(row.organization_key, row.id);
    orgSlugByKey.set(row.organization_key, row.slug);
  }

  // 5. Upsert Teams (Deduplicated by team_id)
  const uniqueTeamsMap = new Map<string, any>();
  for (const t of teams) {
    const tid = String(t.teamId);
    if (!uniqueTeamsMap.has(tid)) {
      const rankInt = t.rank && !isNaN(Number(t.rank)) ? parseInt(String(t.rank), 10) : null;
      const scoreNum = t.score ? parseFloat(String(t.score)) : 0.0;
      uniqueTeamsMap.set(tid, {
        team_id: tid,
        team_name: t.teamName,
        rank: rankInt,
        sort_rank: rankInt !== null ? rankInt : 9999999,
        f1_score: scoreNum,
        f1_score_str: t.score ? Number(scoreNum).toFixed(6) : "0.000000",
        previous_rank: t.previousRank ? parseInt(String(t.previousRank), 10) : null,
        previous_f1_score: t.previousScore ? parseFloat(String(t.previousScore)) : null,
        previous_f1_score_str: t.previousScore || null,
        rank_delta: t.rankDelta || 0,
        score_delta: t.scoreDelta ? parseFloat(String(t.scoreDelta)) : 0.0,
        finish_time: t.finishTime || "",
        has_played: Boolean(t.hasPlayed),
        proctoring_score: String(t.proctoringScore || ""),
        is_blacklisted: Boolean(t.isBlacklisted),
        is_inter_college: Boolean(t.isInterCollege),
        college_count: Array.isArray(t.organizations) ? t.organizations.length : 1,
        status: "active",
        is_active: true,
      });
    }
  }

  const teamsPayload = Array.from(uniqueTeamsMap.values());
  console.log(`Upserting ${teamsPayload.length} unique teams...`);

  for (let i = 0; i < teamsPayload.length; i += BATCH_SIZE) {
    const chunk = teamsPayload.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("teams").upsert(chunk, { onConflict: "team_id" });
    if (error) {
      console.error("Error upserting teams chunk:", error);
      throw error;
    }
  }

  // 6. Upsert Players
  console.log("Upserting players...");
  const playersPayload: any[] = [];
  const seenPlayerKeys = new Set<string>();

  for (const t of teams) {
    const tid = String(t.teamId);
    if (Array.isArray(t.players)) {
      t.players.forEach((p: any, idx: number) => {
        const pName = typeof p === "string" ? p : p.name || "";
        const pOrg = typeof p === "object" ? p.organization || "" : "";
        const pKey = `${tid}:${idx}:${pName.toLowerCase()}`;
        if (!seenPlayerKeys.has(pKey)) {
          seenPlayerKeys.add(pKey);
          playersPayload.push({
            player_key: pKey,
            team_id: tid,
            player_name: pName,
            organization: pOrg,
            normalized_organization: pOrg.toLowerCase().trim(),
            player_index: idx,
          });
        }
      });
    }
  }

  for (let i = 0; i < playersPayload.length; i += BATCH_SIZE) {
    const chunk = playersPayload.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("players").upsert(chunk, { onConflict: "player_key" });
    if (error) {
      console.error("Error upserting players chunk:", error);
      throw error;
    }
  }

  // 7. Upsert Team Organizations
  console.log("Upserting team organization mappings...");
  const teamOrgsPayload: any[] = [];
  const seenTeamOrgPairs = new Set<string>();

  for (const t of teams) {
    const tid = String(t.teamId);
    const orgList: string[] = Array.isArray(t.organizations) ? t.organizations : [];
    for (const orgName of orgList) {
      const normKey = orgName.toLowerCase().trim();
      const orgId = orgIdByKey.get(normKey);
      if (orgId) {
        const pairKey = `${tid}:${orgId}`;
        if (!seenTeamOrgPairs.has(pairKey)) {
          seenTeamOrgPairs.add(pairKey);
          teamOrgsPayload.push({
            team_id: tid,
            organization_id: orgId,
            organization_slug: orgSlugByKey.get(normKey) || "",
          });
        }
      }
    }
  }

  for (let i = 0; i < teamOrgsPayload.length; i += BATCH_SIZE) {
    const chunk = teamOrgsPayload.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("team_organizations").upsert(chunk, { onConflict: "team_id,organization_id" });
    if (error) {
      console.error("Error upserting team_organizations chunk:", error);
      throw error;
    }
  }

  // 8. Upsert Snapshots (Deduplicated by snapshot_key)
  if (snaps.length > 0) {
    console.log(`Processing ${snaps.length} snapshots...`);
    const snapsMap = new Map<string, any>();
    for (const s of snaps) {
      const skey = s.snapshotId || s.commit;
      if (skey && !snapsMap.has(skey)) {
        snapsMap.set(skey, {
          snapshot_key: skey,
          captured_at: s.timestamp || new Date().toISOString(),
          source: s.source || "historical_archive",
          commit_hash: s.commit || "",
          total_teams: s.teamCount || 0,
          changes_count: s.changesCount || 0,
        });
      }
    }

    const snapsPayload = Array.from(snapsMap.values());
    console.log(`Upserting ${snapsPayload.length} unique snapshots...`);
    for (let i = 0; i < snapsPayload.length; i += BATCH_SIZE) {
      const chunk = snapsPayload.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("leaderboard_snapshots").upsert(chunk, { onConflict: "snapshot_key" });
      if (error) {
        console.error("Error upserting snapshots chunk:", error);
        throw error;
      }
    }
  }

  console.log("=================================================");
  console.log("One-time Supabase historical import completed successfully!");
  console.log("=================================================");
}

runOneTimeImport().catch((err) => {
  console.error("Import failed with error:", err);
  process.exit(1);
});
