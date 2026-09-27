"""
Historical Leaderboard & Score History Engine.

Provides complete historical reconstruction, delta calculations (rankDelta, scoreDelta),
status tracking (new, active, missing), Git history extraction, and incremental update pipelines.
"""

import csv
import datetime
import json
import logging
import math
import os
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import config

logger = logging.getLogger("collector.history")

DEFAULT_HISTORY_DIR = config.BASE_DIR / "web" / "data" / "history"


def parse_numeric_rank(rank_val: Any) -> Optional[int]:
    """Parse rank value into an integer or None."""
    if rank_val is None:
        return None
    s = str(rank_val).strip()
    if not s or s.lower() == "none" or s.lower() == "null":
        return None
    try:
        return int(float(s))
    except (ValueError, TypeError):
        return None


def parse_numeric_score(score_val: Any) -> Optional[float]:
    """Parse score value into a float or None."""
    if score_val is None:
        return None
    s = str(score_val).strip()
    if not s or s.lower() == "none" or s.lower() == "null":
        return None
    try:
        return float(s)
    except (ValueError, TypeError):
        return None


def format_score_str(score_val: Any) -> str:
    """Format score consistently as a clean float string."""
    f = parse_numeric_score(score_val)
    if f is None:
        return "0.000000"
    return f"{f:.6f}"


def calculate_rank_delta(previous_rank: Optional[int], current_rank: Optional[int]) -> int:
    """
    Calculate rank delta.
    rankDelta = previousRank - currentRank
    Positive (+47) = moved UP 47 positions.
    Negative (-10) = moved DOWN 10 positions.
    Zero (0) = no rank change.
    """
    if previous_rank is None or current_rank is None:
        return 0
    return previous_rank - current_rank


def calculate_score_delta(previous_score: Optional[float], current_score: Optional[float]) -> float:
    """
    Calculate score delta.
    scoreDelta = currentScore - previousScore
    """
    if previous_score is None or current_score is None:
        return 0.0
    return round(current_score - previous_score, 6)


class HistoryEngine:
    """
    Manages historical snapshots, team time-series history, and change events.
    """

    def __init__(self, history_dir: Path = DEFAULT_HISTORY_DIR):
        self.history_dir = history_dir
        self.snapshots_path = self.history_dir / "snapshots.json"
        self.teams_history_path = self.history_dir / "teams-history.json"
        self.changes_path = self.history_dir / "changes.json"
        self.movers_path = self.history_dir / "movers.json"
        self.index_path = self.history_dir / "index.json"

    def ensure_directories(self) -> None:
        self.history_dir.mkdir(parents=True, exist_ok=True)

    def load_snapshots(self) -> List[Dict[str, Any]]:
        if self.snapshots_path.exists():
            try:
                with open(self.snapshots_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning("Could not read %s: %s", self.snapshots_path, e)
        return []

    def load_teams_history(self) -> Dict[str, Dict[str, Any]]:
        if self.teams_history_path.exists():
            try:
                with open(self.teams_history_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning("Could not read %s: %s", self.teams_history_path, e)
        return {}

    def load_changes(self) -> List[Dict[str, Any]]:
        if self.changes_path.exists():
            try:
                with open(self.changes_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning("Could not read %s: %s", self.changes_path, e)
        return []

    def save_all(
        self,
        snapshots: List[Dict[str, Any]],
        teams_history: Dict[str, Dict[str, Any]],
        changes: List[Dict[str, Any]],
    ) -> None:
        self.ensure_directories()

        # Build movers summary
        movers = self.compute_movers(teams_history, snapshots)

        # Build index summary
        index_data = {
            "totalSnapshots": len(snapshots),
            "totalTeamsObserved": len(teams_history),
            "totalChangeEvents": len(changes),
            "latestSnapshot": snapshots[-1] if snapshots else None,
            "firstSnapshot": snapshots[0] if snapshots else None,
            "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }

        with open(self.snapshots_path, "w", encoding="utf-8") as f:
            json.dump(snapshots, f, indent=2, ensure_ascii=False)

        with open(self.teams_history_path, "w", encoding="utf-8") as f:
            json.dump(teams_history, f, indent=2, ensure_ascii=False)

        with open(self.changes_path, "w", encoding="utf-8") as f:
            json.dump(changes, f, indent=2, ensure_ascii=False)

        with open(self.movers_path, "w", encoding="utf-8") as f:
            json.dump(movers, f, indent=2, ensure_ascii=False)

        with open(self.index_path, "w", encoding="utf-8") as f:
            json.dump(index_data, f, indent=2, ensure_ascii=False)

    def compute_movers(
        self,
        teams_history: Dict[str, Dict[str, Any]],
        snapshots: List[Dict[str, Any]],
        limit: int = 50,
    ) -> Dict[str, Any]:
        """Compute top rank climbers, rank fallers, and score gainers from latest delta state."""
        climbers = []
        fallers = []
        gainers = []
        new_teams = []

        for tid, t_record in teams_history.items():
            if not t_record.get("history"):
                continue
            latest_entry = t_record["history"][-1]
            status = latest_entry.get("status", "active")
            r_delta = latest_entry.get("rankDelta", 0)
            s_delta = latest_entry.get("scoreDelta", 0.0)

            summary = {
                "teamId": tid,
                "teamName": t_record.get("teamName", "Unknown Team"),
                "rank": latest_entry.get("rank"),
                "previousRank": latest_entry.get("previousRank"),
                "rankDelta": r_delta,
                "score": latest_entry.get("score"),
                "previousScore": latest_entry.get("previousScore"),
                "scoreDelta": s_delta,
                "status": status,
                "timestamp": latest_entry.get("timestamp"),
            }

            if status == "new":
                new_teams.append(summary)
            else:
                if r_delta > 0:
                    climbers.append(summary)
                elif r_delta < 0:
                    fallers.append(summary)

                if s_delta > 0:
                    gainers.append(summary)

        # Sort climbers: highest rankDelta first
        climbers.sort(key=lambda x: (x["rankDelta"], -(x["rank"] or 999999)), reverse=True)
        # Sort fallers: lowest rankDelta (most negative) first
        fallers.sort(key=lambda x: x["rankDelta"])
        # Sort gainers: highest scoreDelta first
        gainers.sort(key=lambda x: x["scoreDelta"], reverse=True)
        # Sort new teams by rank ascending
        new_teams.sort(key=lambda x: x["rank"] or 999999)

        return {
            "latestSnapshotId": snapshots[-1]["snapshotId"] if snapshots else None,
            "latestTimestamp": snapshots[-1]["timestamp"] if snapshots else None,
            "topClimbers": climbers[:limit],
            "topFallers": fallers[:limit],
            "topScoreGainers": gainers[:limit],
            "newTeams": new_teams[:limit],
        }

    def process_snapshot(
        self,
        teams_list: List[Dict[str, Any]],
        timestamp_iso: str,
        commit_hash: str = "live",
        source: str = "sync",
        snapshots: Optional[List[Dict[str, Any]]] = None,
        teams_history: Optional[Dict[str, Dict[str, Any]]] = None,
        changes: Optional[List[Dict[str, Any]]] = None,
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Ingest a leaderboard snapshot, calculate deltas for all teams,
        record change events, and enrich `teams_list` with current-state delta fields.
        """
        snapshots = snapshots if snapshots is not None else self.load_snapshots()
        teams_history = teams_history if teams_history is not None else self.load_teams_history()
        changes = changes if changes is not None else self.load_changes()

        # Build unique snapshot ID
        clean_ts = timestamp_iso.replace(":", "-").replace("+", "Z")
        short_commit = commit_hash[:7] if commit_hash != "live" else "live"
        snapshot_id = f"{clean_ts}_{short_commit}"

        current_team_ids_in_snapshot: Set[str] = set()
        new_changes_this_cycle: List[Dict[str, Any]] = []

        # Process each team in current snapshot
        for team in teams_list:
            tid = str(team.get("teamId", "")).strip()
            if not tid:
                continue

            current_team_ids_in_snapshot.add(tid)
            team_name = team.get("teamName", "").strip() or "Unnamed Team"
            curr_rank = parse_numeric_rank(team.get("rank") or team.get("sortRank"))
            curr_score_f = parse_numeric_score(team.get("score"))
            curr_score_str = format_score_str(curr_score_f) if curr_score_f is not None else "0.000000"

            t_record = teams_history.get(tid)
            if not t_record:
                # 1. Brand New Team
                status = "new"
                prev_rank = None
                prev_score_f = None
                prev_score_str = None
                r_delta = 0
                s_delta = 0.0

                t_record = {
                    "teamId": tid,
                    "teamName": team_name,
                    "firstObserved": timestamp_iso,
                    "history": [],
                }
                teams_history[tid] = t_record

                change_event = {
                    "timestamp": timestamp_iso,
                    "snapshotId": snapshot_id,
                    "teamId": tid,
                    "teamName": team_name,
                    "status": "new",
                    "previousRank": None,
                    "newRank": curr_rank,
                    "rankDelta": 0,
                    "previousScore": None,
                    "newScore": curr_score_str,
                    "scoreDelta": 0.0,
                }
                new_changes_this_cycle.append(change_event)
            else:
                # Update team name if available
                if team_name and team_name != "Unnamed Team":
                    t_record["teamName"] = team_name

                # Look at previous observation in history
                prev_entry = t_record["history"][-1] if t_record["history"] else None
                prev_rank = prev_entry.get("rank") if prev_entry else None
                prev_score_f = parse_numeric_score(prev_entry.get("score")) if prev_entry else None
                prev_score_str = format_score_str(prev_score_f) if prev_score_f is not None else None

                r_delta = calculate_rank_delta(prev_rank, curr_rank)
                s_delta = calculate_score_delta(prev_score_f, curr_score_f)
                status = "active"

                # Check if rank or score actually changed
                if r_delta != 0 or abs(s_delta) > 1e-6:
                    change_event = {
                        "timestamp": timestamp_iso,
                        "snapshotId": snapshot_id,
                        "teamId": tid,
                        "teamName": team_name,
                        "status": "active",
                        "previousRank": prev_rank,
                        "newRank": curr_rank,
                        "rankDelta": r_delta,
                        "previousScore": prev_score_str,
                        "newScore": curr_score_str,
                        "scoreDelta": s_delta,
                    }
                    new_changes_this_cycle.append(change_event)

            # Append historical record for this team
            hist_entry = {
                "snapshotId": snapshot_id,
                "timestamp": timestamp_iso,
                "rank": curr_rank,
                "score": curr_score_str,
                "status": status,
                "previousRank": prev_rank,
                "rankDelta": r_delta,
                "previousScore": prev_score_str,
                "scoreDelta": s_delta,
            }
            t_record["history"].append(hist_entry)

            # Enrich team dict with current delta fields for teams.json
            team["previousRank"] = prev_rank
            team["rankDelta"] = r_delta
            team["previousScore"] = prev_score_str
            team["scoreDelta"] = s_delta
            team["status"] = status
            team["lastUpdated"] = timestamp_iso

        # Check for teams that were previously observed but are missing from this snapshot
        for tid, t_record in teams_history.items():
            if tid not in current_team_ids_in_snapshot:
                # Only record as missing if the previous observation was not already missing
                prev_entry = t_record["history"][-1] if t_record["history"] else None
                if prev_entry and prev_entry.get("status") != "missing":
                    prev_rank = prev_entry.get("rank")
                    prev_score_f = parse_numeric_score(prev_entry.get("score"))
                    prev_score_str = format_score_str(prev_score_f) if prev_score_f is not None else None

                    hist_entry = {
                        "snapshotId": snapshot_id,
                        "timestamp": timestamp_iso,
                        "rank": None,
                        "score": None,
                        "status": "missing",
                        "previousRank": prev_rank,
                        "rankDelta": 0,
                        "previousScore": prev_score_str,
                        "scoreDelta": 0.0,
                    }
                    t_record["history"].append(hist_entry)

                    change_event = {
                        "timestamp": timestamp_iso,
                        "snapshotId": snapshot_id,
                        "teamId": tid,
                        "teamName": t_record.get("teamName", "Unknown Team"),
                        "status": "missing",
                        "previousRank": prev_rank,
                        "newRank": None,
                        "rankDelta": 0,
                        "previousScore": prev_score_str,
                        "newScore": None,
                        "scoreDelta": 0.0,
                    }
                    new_changes_this_cycle.append(change_event)

        # Record snapshot metadata
        snapshot_meta = {
            "snapshotId": snapshot_id,
            "commit": commit_hash,
            "timestamp": timestamp_iso,
            "source": source,
            "teamCount": len(teams_list),
            "changesCount": len(new_changes_this_cycle),
        }
        snapshots.append(snapshot_meta)
        changes.extend(new_changes_this_cycle)

        return snapshots, teams_history, changes, new_changes_this_cycle


def extract_teams_from_git_commit(commit_hash: str, repo_dir: Path) -> Tuple[List[Dict[str, Any]], str]:
    """
    Extract full team records from a specific git commit.
    Attempts:
      1. web/data/generated/teams.json
      2. data/processed/teams.csv (+ data/processed/players.csv if needed)
    """
    # 1. Try web/data/generated/teams.json
    try:
        proc = subprocess.run(
            ["git", "show", f"{commit_hash}:web/data/generated/teams.json"],
            cwd=repo_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False,
        )
        if proc.returncode == 0 and proc.stdout.strip():
            data = json.loads(proc.stdout)
            if isinstance(data, list) and len(data) > 0:
                return data, "web/data/generated/teams.json"
    except Exception as e:
        logger.debug("Failed to read teams.json from commit %s: %s", commit_hash, e)

    # 2. Try data/processed/teams.csv
    try:
        proc = subprocess.run(
            ["git", "show", f"{commit_hash}:data/processed/teams.csv"],
            cwd=repo_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
            check=False,
        )
        if proc.returncode == 0 and proc.stdout.strip():
            reader = csv.DictReader(proc.stdout.splitlines())
            teams_list = []
            for row in reader:
                tid = str(row.get("team_id", "")).strip()
                if not tid:
                    continue
                rank_str = row.get("rank", "").strip()
                try:
                    s_rank = int(rank_str)
                except (ValueError, TypeError):
                    s_rank = 999999
                teams_list.append({
                    "teamId": tid,
                    "teamName": row.get("team_name", "").strip(),
                    "rank": rank_str,
                    "sortRank": s_rank,
                    "score": row.get("score", "").strip(),
                    "finishTime": row.get("finish_time", "").strip(),
                    "hasPlayed": row.get("has_played", "").strip(),
                    "proctoringScore": row.get("proctoring_score", "").strip(),
                    "isBlacklisted": row.get("is_blacklisted", "").strip(),
                    "players": [],
                    "organizations": [],
                    "normalizedOrganizations": [],
                })
            if teams_list:
                return teams_list, "data/processed/teams.csv"
    except Exception as e:
        logger.debug("Failed to read teams.csv from commit %s: %s", commit_hash, e)

    return [], "none"


def migrate_git_history(repo_dir: Path = config.BASE_DIR, history_dir: Path = DEFAULT_HISTORY_DIR) -> Dict[str, Any]:
    """
    Reconstruct complete historical leaderboard time series from all git commits.
    """
    engine = HistoryEngine(history_dir=history_dir)
    engine.ensure_directories()

    # Get chronological list of all commits (oldest first)
    proc = subprocess.run(
        ["git", "log", "--reverse", "--pretty=format:%H|%cI|%s"],
        cwd=repo_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=True,
    )

    commit_lines = [line.strip() for line in proc.stdout.splitlines() if line.strip()]
    logger.info("Found %d total commits in Git history to analyze.", len(commit_lines))

    snapshots: List[Dict[str, Any]] = []
    teams_history: Dict[str, Dict[str, Any]] = {}
    changes: List[Dict[str, Any]] = []

    commits_processed = 0
    snapshots_found = 0
    snapshots_processed = 0
    duplicate_team_ids = 0
    invalid_records = 0
    missing_rank_values = 0
    missing_score_values = 0

    first_snapshot_time = None
    last_snapshot_time = None

    for line in commit_lines:
        commits_processed += 1
        parts = line.split("|", 2)
        if len(parts) < 3:
            continue
        commit_hash, commit_time_iso, commit_subject = parts

        teams_list, source_file = extract_teams_from_git_commit(commit_hash, repo_dir)
        if not teams_list:
            continue

        snapshots_found += 1

        # Check for team data integrity within this commit
        seen_ids: Set[str] = set()
        clean_teams_list: List[Dict[str, Any]] = []

        for t in teams_list:
            tid = str(t.get("teamId", "")).strip()
            if not tid:
                invalid_records += 1
                continue
            if tid in seen_ids:
                duplicate_team_ids += 1
                continue
            seen_ids.add(tid)

            if t.get("rank") is None or str(t.get("rank")).strip() == "":
                missing_rank_values += 1
            if t.get("score") is None or str(t.get("score")).strip() == "":
                missing_score_values += 1

            clean_teams_list.append(t)

        if not clean_teams_list:
            continue

        # Check if this snapshot is identical to the previous snapshot
        # (avoid creating redundant identical snapshots from multiple commits in a row)
        if snapshots:
            prev_snapshot = snapshots[-1]
            prev_tid_count = prev_snapshot["teamCount"]
            if prev_tid_count == len(clean_teams_list):
                # Sample a few teams to check if scores/ranks actually changed
                is_identical = True
                for sample_t in clean_teams_list[:30]:
                    stid = str(sample_t["teamId"]).strip()
                    st_record = teams_history.get(stid)
                    if not st_record or not st_record.get("history"):
                        is_identical = False
                        break
                    last_h = st_record["history"][-1]
                    s_curr_rank = parse_numeric_rank(sample_t.get("rank"))
                    s_curr_score = format_score_str(sample_t.get("score"))
                    if last_h["rank"] != s_curr_rank or last_h["score"] != s_curr_score:
                        is_identical = False
                        break
                if is_identical and len(clean_teams_list) > 100:
                    logger.debug("Skipping commit %s (data identical to previous snapshot).", commit_hash[:7])
                    continue

        snapshots_processed += 1
        if not first_snapshot_time:
            first_snapshot_time = commit_time_iso
        last_snapshot_time = commit_time_iso

        snapshots, teams_history, changes, cycle_changes = engine.process_snapshot(
            teams_list=clean_teams_list,
            timestamp_iso=commit_time_iso,
            commit_hash=commit_hash,
            source=f"git:{source_file}",
            snapshots=snapshots,
            teams_history=teams_history,
            changes=changes,
        )

        logger.info(
            "Processed Git Snapshot #%d (%s): %d teams, %d changes detected. Commit: %s (%s)",
            snapshots_processed,
            commit_time_iso,
            len(clean_teams_list),
            len(cycle_changes),
            commit_hash[:7],
            commit_subject[:40],
        )

    # Save reconstructed database
    engine.save_all(snapshots=snapshots, teams_history=teams_history, changes=changes)

    total_historical_records = sum(len(t.get("history", [])) for t in teams_history.values())

    report = {
        "snapshotsFound": snapshots_found,
        "snapshotsProcessed": snapshots_processed,
        "teamsObserved": len(teams_history),
        "historicalRecords": total_historical_records,
        "changeEvents": len(changes),
        "firstSnapshot": first_snapshot_time,
        "lastSnapshot": last_snapshot_time,
        "commitsProcessed": commits_processed,
        "duplicateTeamIds": duplicate_team_ids,
        "invalidRecords": invalid_records,
        "missingRankValues": missing_rank_values,
        "missingScoreValues": missing_score_values,
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "historyDir": str(history_dir),
    }

    report_path = history_dir / "history-migration-report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    root_report_path = repo_dir / "history-migration-report.json"
    with open(root_report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    logger.info(
        "Historical migration complete: %d snapshots, %d teams, %d changes. Report saved to %s",
        snapshots_processed,
        len(teams_history),
        len(changes),
        report_path,
    )
    return report
