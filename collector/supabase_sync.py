"""
Supabase Live Data Synchronization Engine for Amazon ML Challenge 2026.

Handles:
  1. Strict dataset validation and safety threshold enforcement.
  2. Delta calculations (rank movement, F1 score changes).
  3. Relational upserts (teams, players, organizations, team_organizations).
  4. Historical snapshots and team snapshot scores.
  5. Atomic sync run status tracking in sync_runs.
"""

import datetime
import logging
import os
import re
from typing import Any, Dict, List, Optional, Set, Tuple

from .normalizer import normalize_organization

logger = logging.getLogger("collector.supabase_sync")


class DataValidationError(Exception):
    """Raised when collected data fails safety thresholds or integrity rules."""
    pass


def parse_numeric_score(score_val: Any) -> float:
    """Safely parse F1 score to float."""
    if score_val is None:
        return 0.0
    s = str(score_val).strip()
    if not s or s.lower() in ("none", "null", ""):
        return 0.0
    try:
        return float(s)
    except (ValueError, TypeError):
        return 0.0


def format_score_str(score_val: Any) -> str:
    """Format F1 score to exact 6 decimal places."""
    f = parse_numeric_score(score_val)
    return f"{f:.6f}"


def validate_collected_dataset(
    teams_list: List[Dict[str, Any]],
    players_list: List[Dict[str, Any]],
    previous_team_count: Optional[int] = None,
    min_team_threshold: int = 100,
) -> None:
    """
    Validates dataset before committing to Supabase to prevent corrupt / partial API data.
    """
    total_teams = len(teams_list)
    total_players = len(players_list)

    if total_teams < min_team_threshold:
        raise DataValidationError(
            f"Collected team count ({total_teams}) is below minimum safety threshold ({min_team_threshold}). Sync aborted."
        )

    if total_players == 0:
        raise DataValidationError("Collected participant count is 0. Sync aborted.")

    # Check for catastrophic data drops (>50% drop compared to previous snapshot)
    if previous_team_count and previous_team_count > 500:
        drop_ratio = total_teams / float(previous_team_count)
        if drop_ratio < 0.5:
            raise DataValidationError(
                f"Catastrophic data drop detected! Previous team count: {previous_team_count}, New team count: {total_teams} ({drop_ratio:.1%}). Sync aborted to protect production data."
            )

    # Validate individual team records
    seen_team_ids: Set[str] = set()
    for idx, team in enumerate(teams_list):
        tid = str(team.get("team_id") or team.get("teamId") or "").strip()
        if not tid:
            raise DataValidationError(f"Team at index {idx} has missing or empty team_id.")
        
        if tid in seen_team_ids:
            # Note: Unstop API shouldn't return duplicate team IDs in a single snapshot
            logger.warning("Duplicate team_id detected in single batch: %s", tid)
        seen_team_ids.add(tid)

        # F1 Score validation
        raw_score = team.get("score")
        score_val = parse_numeric_score(raw_score)
        if score_val < 0.0 or score_val > 1.0:
            # Score outside [0, 1] range
            logger.warning("Unexpected F1 score for team %s: %f", tid, score_val)

        # Rank validation
        raw_rank = team.get("rank")
        if raw_rank is not None and str(raw_rank).strip():
            try:
                r_int = int(str(raw_rank).strip())
                if r_int <= 0:
                    logger.warning("Non-positive rank for team %s: %d", tid, r_int)
            except (ValueError, TypeError):
                pass

    logger.info(
        "Dataset validation passed: %d unique teams, %d players verified.",
        len(seen_team_ids),
        total_players,
    )


def sync_dataset_to_supabase(
    teams_list: List[Dict[str, Any]],
    players_list: List[Dict[str, Any]],
    organizations_list: List[Dict[str, Any]],
    supabase_client: Any,
    batch_size: int = 500,
    source_label: str = "python_collector",
) -> Dict[str, Any]:
    """
    Atomically syncs normalized dataset into Supabase PostgreSQL.
    Tracks execution in sync_runs table.
    """
    if not supabase_client:
        logger.info("Supabase client is not configured. Skipping remote database sync.")
        return {"status": "skipped", "reason": "no_client"}

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # Step 1: Create sync_runs record with status 'running'
    sync_run_id = None
    try:
        run_res = supabase_client.table("sync_runs").insert({
            "started_at": now_iso,
            "status": "running",
            "teams_fetched": len(teams_list),
            "participants_fetched": len(players_list),
            "source": source_label,
        }).execute()
        if run_res.data and len(run_res.data) > 0:
            sync_run_id = run_res.data[0].get("id")
    except Exception as err:
        logger.warning("Could not initialize sync_runs record in Supabase: %s", err)

    try:
        # Step 2: Fetch existing live teams from Supabase for delta calculation
        existing_teams_map: Dict[str, Dict[str, Any]] = {}
        prev_team_count = 0
        try:
            # Select relevant fields for delta calculations
            res = supabase_client.table("teams").select("team_id, rank, f1_score, f1_score_str").execute()
            if res.data:
                prev_team_count = len(res.data)
                for row in res.data:
                    existing_teams_map[row["team_id"]] = row
        except Exception as e:
            logger.warning("Could not fetch existing teams for delta calculation: %s", e)

        # Step 3: Strict Validation
        validate_collected_dataset(
            teams_list=teams_list,
            players_list=players_list,
            previous_team_count=prev_team_count,
        )

        # Step 4: Normalize Organizations (Preserving Existing Slugs)
        existing_org_slugs: Dict[str, str] = {}
        used_slugs: Set[str] = set()
        try:
            db_orgs = supabase_client.table("organizations").select("organization_key, slug").execute()
            if db_orgs.data:
                for r in db_orgs.data:
                    existing_org_slugs[r["organization_key"]] = r["slug"]
                    used_slugs.add(r["slug"])
        except Exception:
            pass

        orgs_by_norm: Dict[str, Dict[str, Any]] = {}

        for o in organizations_list:
            name = o.get("organization", "").strip() or o.get("name", "").strip()
            if not name:
                continue
            norm = o.get("normalized_organization", "").strip() or o.get("normalizedName", "").strip() or normalize_organization(name)
            if not norm:
                continue

            tc = int(o.get("team_count", 0) or o.get("teamCount", 0) or 0)
            pc = int(o.get("player_count", 0) or o.get("playerCount", 0) or 0)

            if norm not in orgs_by_norm:
                if norm in existing_org_slugs:
                    slug = existing_org_slugs[norm]
                else:
                    slug_base = re.sub(r"[^a-z0-9]+", "-", norm).strip("-") or "org"
                    candidate = slug_base
                    counter = 1
                    while candidate in used_slugs:
                        counter += 1
                        candidate = f"{slug_base}-{counter}"
                    used_slugs.add(candidate)
                    slug = candidate

                orgs_by_norm[norm] = {
                    "organization_key": norm,
                    "organization_name": name,
                    "normalized_name": norm,
                    "slug": slug,
                    "team_count": tc,
                    "player_count": pc,
                }

        # Step 5: Process Players grouped by team
        players_by_team: Dict[str, List[Dict[str, Any]]] = {}
        all_players_to_upsert: List[Dict[str, Any]] = []
        seen_player_keys: Set[str] = set()

        for p in players_list:
            tid = str(p.get("team_id") or p.get("teamId") or "").strip()
            if not tid:
                continue
            if tid not in players_by_team:
                players_by_team[tid] = []

            p_idx = int(p.get("player_index", 0) or p.get("playerIndex", 0) or 0)
            p_org = p.get("organization", "").strip()
            p_norm = p.get("normalized_organization", "").strip() or p.get("normalizedOrganization", "").strip() or normalize_organization(p_org)
            p_name = p.get("player_name", "").strip() or p.get("name", "").strip() or "Participant"

            if p_norm and p_norm not in orgs_by_norm:
                if p_norm in existing_org_slugs:
                    slug = existing_org_slugs[p_norm]
                else:
                    slug_base = re.sub(r"[^a-z0-9]+", "-", p_norm).strip("-") or "org"
                    candidate = slug_base
                    counter = 1
                    while candidate in used_slugs:
                        counter += 1
                        candidate = f"{slug_base}-{counter}"
                    used_slugs.add(candidate)
                    slug = candidate

                orgs_by_norm[p_norm] = {
                    "organization_key": p_norm,
                    "organization_name": p_org,
                    "normalized_name": p_norm,
                    "slug": slug,
                    "team_count": 0,
                    "player_count": 1,
                }

            player_key = f"{tid}:{p_idx}:{p_name.lower()}"
            player_record = {
                "player_key": player_key,
                "team_id": tid,
                "player_name": p_name,
                "organization": p_org,
                "normalized_organization": p_norm,
                "player_index": p_idx,
                "last_seen_at": now_iso,
            }
            players_by_team[tid].append(player_record)

        # Step 6: Process Teams with Deltas
        teams_to_upsert: List[Dict[str, Any]] = []
        seen_team_ids: Set[str] = set()
        snapshot_scores_to_insert: List[Dict[str, Any]] = []
        teams_changed_count = 0
        teams_added_count = 0

        for t in teams_list:
            tid = str(t.get("team_id") or t.get("teamId") or "").strip()
            if not tid:
                continue
            seen_team_ids.add(tid)

            tname = t.get("team_name") or t.get("teamName") or "Unnamed Team"
            rank_str = str(t.get("rank", "")).strip()
            try:
                rank_val = int(rank_str) if rank_str and rank_str.lower() != "none" else None
                sort_rank = rank_val if rank_val is not None else 9999999
            except (ValueError, TypeError):
                rank_val = None
                sort_rank = 9999999

            score_val = parse_numeric_score(t.get("score"))
            score_str = format_score_str(t.get("score"))

            # Calculate Deltas from previous state
            prev_row = existing_teams_map.get(tid)
            if prev_row:
                prev_rank = prev_row.get("rank")
                prev_score = float(prev_row.get("f1_score") or 0.0)
                prev_score_str = prev_row.get("f1_score_str") or format_score_str(prev_score)
                rank_delta = (prev_rank - rank_val) if (prev_rank is not None and rank_val is not None) else 0
                score_delta = round(score_val - prev_score, 6) if prev_score is not None else 0.0

                if rank_delta != 0 or abs(score_delta) > 1e-6:
                    teams_changed_count += 1
            else:
                teams_added_count += 1
                prev_rank = None
                prev_score = None
                prev_score_str = None
                rank_delta = 0
                score_delta = 0.0

            # Inter-college detection
            team_players = players_by_team.get(tid, [])
            distinct_orgs = set()
            for tp in team_players:
                if tp["normalized_organization"]:
                    distinct_orgs.add(tp["normalized_organization"])
            is_inter_college = len(distinct_orgs) >= 2
            college_count = max(1, len(distinct_orgs))

            has_played = str(t.get("has_played") or t.get("hasPlayed") or "").strip().lower() in ("true", "1", "yes")
            is_blacklisted = str(t.get("is_blacklisted") or t.get("isBlacklisted") or "").strip().lower() in ("true", "1", "yes")

            teams_to_upsert.append({
                "team_id": tid,
                "team_name": tname,
                "rank": rank_val,
                "sort_rank": sort_rank,
                "f1_score": score_val,
                "f1_score_str": score_str,
                "previous_rank": prev_rank,
                "previous_f1_score": prev_score,
                "previous_f1_score_str": prev_score_str,
                "rank_delta": rank_delta,
                "score_delta": score_delta,
                "finish_time": str(t.get("finish_time") or t.get("finishTime") or "").strip(),
                "has_played": has_played,
                "proctoring_score": str(t.get("proctoring_score") or t.get("proctoringScore") or "").strip(),
                "is_blacklisted": is_blacklisted,
                "is_inter_college": is_inter_college,
                "college_count": college_count,
                "status": "active",
                "is_active": True,
                "updated_at": now_iso,
                "last_seen_at": now_iso,
            })

        # Step 7: Batch Upsert Organizations
        org_list_for_upsert = list(orgs_by_norm.values())
        logger.info("Upserting %d organizations to Supabase...", len(org_list_for_upsert))
        for i in range(0, len(org_list_for_upsert), batch_size):
            chunk = org_list_for_upsert[i:i + batch_size]
            supabase_client.table("organizations").upsert(chunk, on_conflict="organization_key").execute()

        # Step 8: Fetch Organization IDs
        org_rows = supabase_client.table("organizations").select("id, organization_key, slug").execute()
        org_id_by_key = {r["organization_key"]: r["id"] for r in (org_rows.data or [])}
        org_slug_by_key = {r["organization_key"]: r["slug"] for r in (org_rows.data or [])}

        # Step 9: Batch Upsert Teams
        logger.info("Upserting %d teams to Supabase...", len(teams_to_upsert))
        for i in range(0, len(teams_to_upsert), batch_size):
            chunk = teams_to_upsert[i:i + batch_size]
            supabase_client.table("teams").upsert(chunk, on_conflict="team_id").execute()

        # Step 10: Batch Upsert Players (ensuring team_id exists in teams_to_upsert)
        all_players_to_upsert: List[Dict[str, Any]] = []
        seen_player_keys: Set[str] = set()
        for tid, plist in players_by_team.items():
            if tid in seen_team_ids:
                for p in plist:
                    if p["player_key"] not in seen_player_keys:
                        seen_player_keys.add(p["player_key"])
                        all_players_to_upsert.append(p)

        logger.info("Upserting %d players to Supabase...", len(all_players_to_upsert))
        for i in range(0, len(all_players_to_upsert), batch_size):
            chunk = all_players_to_upsert[i:i + batch_size]
            supabase_client.table("players").upsert(chunk, on_conflict="player_key").execute()

        # Step 11: Upsert Team Organizations
        team_orgs_to_upsert: List[Dict[str, Any]] = []
        seen_team_orgs: Set[Tuple[str, int]] = set()

        for t in teams_to_upsert:
            tid = t["team_id"]
            for p in players_by_team.get(tid, []):
                norm_org = p["normalized_organization"]
                if norm_org and norm_org in org_id_by_key:
                    org_id = org_id_by_key[norm_org]
                    if (tid, org_id) not in seen_team_orgs:
                        seen_team_orgs.add((tid, org_id))
                        team_orgs_to_upsert.append({
                            "team_id": tid,
                            "organization_id": org_id,
                            "organization_slug": org_slug_by_key.get(norm_org, ""),
                            "updated_at": now_iso,
                        })

        logger.info("Upserting %d team_organizations to Supabase...", len(team_orgs_to_upsert))
        for i in range(0, len(team_orgs_to_upsert), batch_size):
            chunk = team_orgs_to_upsert[i:i + batch_size]
            supabase_client.table("team_organizations").upsert(chunk, on_conflict="team_id,organization_id").execute()

        # Step 12: Create Snapshot in leaderboard_snapshots
        snapshot_key = f"snap_{now_iso.replace(':', '-').replace('.', '-')}"
        snap_res = supabase_client.table("leaderboard_snapshots").insert({
            "snapshot_key": snapshot_key,
            "captured_at": now_iso,
            "source": source_label,
            "total_teams": len(teams_to_upsert),
            "total_participants": len(all_players_to_upsert),
            "changes_count": teams_changed_count,
            "collection_version": "2026.1",
        }).execute()

        snapshot_db_id = None
        if snap_res.data and len(snap_res.data) > 0:
            snapshot_db_id = snap_res.data[0].get("id")

        # Step 13: Insert Snapshot Scores if snapshot created
        if snapshot_db_id:
            for t in teams_to_upsert:
                snapshot_scores_to_insert.append({
                    "snapshot_id": snapshot_db_id,
                    "team_id": t["team_id"],
                    "rank": t["rank"],
                    "f1_score": t["f1_score"],
                    "f1_score_str": t["f1_score_str"],
                    "previous_rank": t["previous_rank"],
                    "rank_delta": t["rank_delta"],
                    "previous_score": t["previous_f1_score"],
                    "score_delta": t["score_delta"],
                    "status": "active",
                })

            logger.info("Inserting %d team snapshot scores...", len(snapshot_scores_to_insert))
            for i in range(0, len(snapshot_scores_to_insert), batch_size):
                chunk = snapshot_scores_to_insert[i:i + batch_size]
                supabase_client.table("team_snapshot_scores").upsert(chunk, on_conflict="snapshot_id,team_id").execute()

        # Step 14: Update sync_runs with status 'success'
        if sync_run_id:
            supabase_client.table("sync_runs").update({
                "completed_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "status": "success",
                "teams_fetched": len(teams_to_upsert),
                "participants_fetched": len(all_players_to_upsert),
                "teams_changed": teams_changed_count,
                "teams_added": teams_added_count,
                "snapshot_id": snapshot_db_id,
            }).eq("id", sync_run_id).execute()

        logger.info(
            "Supabase Sync Complete: %d teams (%d changed, %d added), %d players, %d orgs synced.",
            len(teams_to_upsert),
            teams_changed_count,
            teams_added_count,
            len(all_players_to_upsert),
            len(org_list_for_upsert),
        )

        return {
            "status": "success",
            "teams_synced": len(teams_to_upsert),
            "teams_changed": teams_changed_count,
            "teams_added": teams_added_count,
            "players_synced": len(all_players_to_upsert),
            "orgs_synced": len(org_list_for_upsert),
            "snapshot_id": snapshot_db_id,
            "sync_run_id": sync_run_id,
        }

    except Exception as err:
        logger.error("Supabase live sync failed: %s", err, exc_info=True)
        if sync_run_id:
            try:
                supabase_client.table("sync_runs").update({
                    "completed_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "status": "failed",
                    "error_message": str(err),
                }).eq("id", sync_run_id).execute()
            except Exception:
                pass
        raise
