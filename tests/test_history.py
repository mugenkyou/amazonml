"""
Unit Tests for Leaderboard History Engine, Delta Calculations, and Multi-Snapshot Scenarios.
"""

import os
import shutil
import tempfile
from pathlib import Path
import pytest

from collector.history import (
    HistoryEngine,
    calculate_rank_delta,
    calculate_score_delta,
    parse_numeric_rank,
    parse_numeric_score,
    format_score_str,
)


@pytest.fixture
def temp_history_dir():
    temp_dir = tempfile.mkdtemp()
    yield Path(temp_dir)
    shutil.rmtree(temp_dir, ignore_errors=True)


def test_delta_calculations_explicit_example():
    """
    Test the specific requirement from specification:
    Team A:
      Snapshot 1 -> Rank 500, Score 50
      Snapshot 2 -> Rank 450, Score 60
    Expected:
      rankDelta = +50
      scoreDelta = +10
    """
    rank_delta = calculate_rank_delta(previous_rank=500, current_rank=450)
    assert rank_delta == 50

    score_delta = calculate_score_delta(previous_score=50.0, current_score=60.0)
    assert score_delta == 10.0


def test_rank_improvement_and_decline():
    # Improvement: Rank 100 -> Rank 80 (+20 spots)
    assert calculate_rank_delta(100, 80) == 20

    # Decline: Rank 80 -> Rank 110 (-30 spots)
    assert calculate_rank_delta(80, 110) == -30

    # Unchanged
    assert calculate_rank_delta(50, 50) == 0

    # None cases
    assert calculate_rank_delta(None, 50) == 0
    assert calculate_rank_delta(50, None) == 0


def test_score_increase_and_decrease():
    # Score increase
    assert calculate_score_delta(80.5, 95.75) == 15.25

    # Score decrease
    assert calculate_score_delta(95.75, 90.0) == -5.75

    # Unchanged score
    assert calculate_score_delta(100.0, 100.0) == 0.0

    # None cases
    assert calculate_score_delta(None, 100.0) == 0.0
    assert calculate_score_delta(100.0, None) == 0.0


def test_parsing_helpers():
    assert parse_numeric_rank("42") == 42
    assert parse_numeric_rank(42) == 42
    assert parse_numeric_rank("null") is None
    assert parse_numeric_rank(None) is None
    assert parse_numeric_rank("") is None

    assert parse_numeric_score("0.991234") == 0.991234
    assert parse_numeric_score("null") is None
    assert parse_numeric_score("") is None
    assert format_score_str(0.5) == "0.500000"


def test_multi_snapshot_lifecycle(temp_history_dir):
    """
    Test full lifecycle across 3 snapshots:
    - New team
    - Score & rank changes
    - Missing team
    - Duplicate team names with different team IDs
    - Unchanged teams
    """
    engine = HistoryEngine(history_dir=temp_history_dir)

    # Snapshot 1: Initial 2 teams
    snap1_teams = [
        {"teamId": "T1", "teamName": "Alpha", "rank": "500", "score": "50.000000"},
        {"teamId": "T2", "teamName": "Alpha", "rank": "600", "score": "40.000000"}, # duplicate team name
    ]
    snaps, hist, changes, cycle_changes = engine.process_snapshot(
        teams_list=snap1_teams,
        timestamp_iso="2026-09-27T10:00:00Z",
        commit_hash="c111111",
    )

    assert len(snaps) == 1
    assert len(hist) == 2
    assert len(cycle_changes) == 2

    # T1 checks in snap 1
    assert snap1_teams[0]["status"] == "new"
    assert snap1_teams[0]["previousRank"] is None
    assert snap1_teams[0]["rankDelta"] == 0
    assert snap1_teams[0]["scoreDelta"] == 0.0

    # Snapshot 2: T1 improves, T2 unchanged, T3 joins
    snap2_teams = [
        {"teamId": "T1", "teamName": "Alpha", "rank": "450", "score": "60.000000"},
        {"teamId": "T2", "teamName": "Alpha", "rank": "600", "score": "40.000000"},
        {"teamId": "T3", "teamName": "Gamma", "rank": "700", "score": "30.000000"},
    ]
    snaps, hist, changes, cycle_changes = engine.process_snapshot(
        teams_list=snap2_teams,
        timestamp_iso="2026-09-27T10:30:00Z",
        commit_hash="c222222",
        snapshots=snaps,
        teams_history=hist,
        changes=changes,
    )

    assert len(snaps) == 2
    assert len(hist) == 3

    # T1 in Snap 2: Rank 500 -> 450 (+50), Score 50 -> 60 (+10)
    assert snap2_teams[0]["status"] == "active"
    assert snap2_teams[0]["previousRank"] == 500
    assert snap2_teams[0]["rankDelta"] == 50
    assert snap2_teams[0]["previousScore"] == "50.000000"
    assert snap2_teams[0]["scoreDelta"] == 10.0

    # T2 in Snap 2: Unchanged
    assert snap2_teams[1]["status"] == "active"
    assert snap2_teams[1]["rankDelta"] == 0
    assert snap2_teams[1]["scoreDelta"] == 0.0

    # T3 in Snap 2: New
    assert snap2_teams[2]["status"] == "new"
    assert snap2_teams[2]["previousRank"] is None

    # Snapshot 3: T1 unchanged, T2 missing (absent), T3 drops
    snap3_teams = [
        {"teamId": "T1", "teamName": "Alpha", "rank": "450", "score": "60.000000"},
        {"teamId": "T3", "teamName": "Gamma", "rank": "750", "score": "25.000000"},
    ]
    snaps, hist, changes, cycle_changes = engine.process_snapshot(
        teams_list=snap3_teams,
        timestamp_iso="2026-09-27T11:00:00Z",
        commit_hash="c333333",
        snapshots=snaps,
        teams_history=hist,
        changes=changes,
    )

    assert len(snaps) == 3
    # Check T2 status in history is now 'missing'
    assert hist["T2"]["history"][-1]["status"] == "missing"
    assert hist["T2"]["history"][-1]["rank"] is None

    # Check T3 dropped: Rank 700 -> 750 (rankDelta: -50)
    assert snap3_teams[1]["rankDelta"] == -50
    assert snap3_teams[1]["scoreDelta"] == -5.0

    # Save to disk and test reload
    engine.save_all(snaps, hist, changes)

    reloaded_snaps = engine.load_snapshots()
    reloaded_hist = engine.load_teams_history()
    reloaded_changes = engine.load_changes()

    assert len(reloaded_snaps) == 3
    assert len(reloaded_hist) == 3
    assert len(reloaded_hist["T1"]["history"]) == 3
    assert len(reloaded_changes) > 0

    # Check movers calculation
    movers = engine.compute_movers(reloaded_hist, reloaded_snaps)
    assert "topClimbers" in movers
    assert "topFallers" in movers
    assert "topScoreGainers" in movers
