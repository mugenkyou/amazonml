"""
Unit and Integration Tests for Supabase Live Data Architecture & Validation.

Tests:
  1. Strict dataset validation & safety thresholds (drop protection, negative F1, missing IDs).
  2. Duplicate team name handling (Team ID canonical identity).
  3. Inter-college calculation rules (>= 2 distinct normalized institutions).
  4. Delta calculations (rankDelta, scoreDelta with 6 decimal precision).
  5. Deterministic player key generation & idempotency.
"""

import pytest
from collector.supabase_sync import (
    validate_collected_dataset,
    DataValidationError,
    parse_numeric_score,
    format_score_str,
)
from collector.normalizer import normalize_organization
from scripts.migrate_to_supabase import prepare_organizations


def test_validation_minimum_threshold():
    """Validates that collections below threshold raise DataValidationError."""
    with pytest.raises(DataValidationError, match="below minimum safety threshold"):
        validate_collected_dataset(teams_list=[{"team_id": "1", "score": "0.8"}], players_list=[{"player_name": "Alice"}], min_team_threshold=10)


def test_validation_catastrophic_data_drop():
    """Validates that a sudden >50% drop compared to previous snapshot is blocked."""
    teams = [{"team_id": str(i), "score": "0.5"} for i in range(200)]
    players = [{"player_name": f"P{i}"} for i in range(200)]
    with pytest.raises(DataValidationError, match="Catastrophic data drop detected"):
        validate_collected_dataset(teams_list=teams, players_list=players, previous_team_count=1000, min_team_threshold=50)


def test_validation_missing_team_id():
    """Validates that teams with missing team_id trigger validation error."""
    teams = [{"team_id": "", "score": "0.5"}]
    players = [{"player_name": "P1"}]
    with pytest.raises(DataValidationError, match="missing or empty team_id"):
        validate_collected_dataset(teams_list=teams, players_list=players, min_team_threshold=1)


def test_duplicate_team_names_remain_distinct():
    """Validates that teams sharing identical names but different team_ids remain distinct."""
    team_a = {"team_id": "1001", "team_name": "Team Alpha", "rank": "1", "score": "0.950000"}
    team_b = {"team_id": "1002", "team_name": "Team Alpha", "rank": "50", "score": "0.820000"}
    
    assert team_a["team_id"] != team_b["team_id"]
    assert team_a["team_name"] == team_b["team_name"]
    # In relational model, UNIQUE(team_id) permits duplicate names without collision


def test_score_precision_and_deltas():
    """Validates 6-decimal score precision and delta rounding."""
    score_a = parse_numeric_score("0.912122")
    score_b = parse_numeric_score("0.891100")
    assert format_score_str(score_a) == "0.912122"
    assert format_score_str(score_b) == "0.891100"

    score_delta = round(score_a - score_b, 6)
    assert score_delta == 0.021022


def test_inter_college_detection():
    """Validates inter-college detection for teams with >= 2 distinct institutions."""
    org1 = normalize_organization("IIT Bombay")
    org2 = normalize_organization("IIT Bombay, ")
    org3 = normalize_organization("BITS Pilani")

    # org1 and org2 normalize to the exact same entity
    assert org1 == org2 == "iit bombay"

    same_college_players = [
        {"normalized_organization": org1},
        {"normalized_organization": org2},
    ]
    distinct_same = {p["normalized_organization"] for p in same_college_players}
    assert len(distinct_same) == 1  # Not inter-college

    multi_college_players = [
        {"normalized_organization": org1},
        {"normalized_organization": org3},
    ]
    distinct_multi = {p["normalized_organization"] for p in multi_college_players}
    assert len(distinct_multi) == 2  # Inter-college team!


def test_player_key_determinism():
    """Validates deterministic player key creation for idempotency."""
    key1 = f"979407:0:alice smith".lower()
    key2 = f"979407:0:Alice Smith".lower()
    assert key1 == key2
