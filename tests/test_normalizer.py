"""
Unit tests for collector/normalizer.py
"""

import pytest
from collector.normalizer import normalize_organization, normalize_dataset


def test_normalize_organization_cleanups():
    assert normalize_organization("") == ""
    assert normalize_organization(None) == ""
    assert normalize_organization("   ") == ""
    assert normalize_organization("IIT Bombay") == "iit bombay"
    assert normalize_organization("  Vellore  Institute   of   Technology  ") == "vellore institute of technology"
    assert normalize_organization("BITS Pilani.") == "bits pilani"
    assert normalize_organization("IIT Delhi,") == "iit delhi"
    assert normalize_organization("St. John’s College") == "st. john's college"


def test_normalize_dataset_multi_player_and_multi_org():
    records = [
        {
            "rank": "1",
            "score": "0.99",
            "finish_time": "2026-09-26 10:00:00",
            "has_played": True,
            "proctoring_score": None,
            "is_blacklisted": False,
            "team_id": "T101",
            "team_name": "Alpha Team",
            "players": [
                {"name": "Alice", "organization": "IIT Bombay"},
                {"name": "Bob", "organization": "BITS Pilani"},
            ]
        },
        {
            "rank": "2",
            "score": "0.95",
            "finish_time": "2026-09-26 10:05:00",
            "has_played": True,
            "proctoring_score": 100,
            "is_blacklisted": False,
            "team_id": "T102",
            "team_name": "Beta Team",
            "players": [
                {"name": "Charlie", "organization": "IIT Bombay"},
            ]
        },
        {
            "rank": "3",
            "score": "0.90",
            "finish_time": "2026-09-26 10:10:00",
            "has_played": False,
            "proctoring_score": None,
            "is_blacklisted": False,
            "team_id": "T103",
            "team_name": "Solo Team",
            "players": []
        }
    ]

    normalized = normalize_dataset(records)

    # 1. Teams check
    assert normalized.unique_teams_count == 3
    assert len(normalized.teams) == 3
    assert normalized.teams[0]["team_id"] == "T101"
    assert normalized.teams[1]["team_id"] == "T102"
    assert normalized.teams[2]["team_id"] == "T103"

    # 2. Players check
    assert normalized.unique_players_count == 3
    assert len(normalized.players) == 3
    assert normalized.players[0]["player_name"] == "Alice"
    assert normalized.players[0]["player_index"] == 0
    assert normalized.players[1]["player_name"] == "Bob"
    assert normalized.players[1]["player_index"] == 1

    # 3. Organizations check
    # IIT Bombay has 2 teams (T101, T102) and 2 players (Alice, Charlie)
    # BITS Pilani has 1 team (T101) and 1 player (Bob)
    assert normalized.unique_orgs_count == 2
    iit_b = next(o for o in normalized.organizations if o["organization"] == "IIT Bombay")
    assert iit_b["team_count"] == 2
    assert iit_b["player_count"] == 2
    assert iit_b["normalized_organization"] == "iit bombay"

    bits = next(o for o in normalized.organizations if o["organization"] == "BITS Pilani")
    assert bits["team_count"] == 1
    assert bits["player_count"] == 1

    # 4. Team-Organizations links check
    # T101 -> IIT Bombay, T101 -> BITS Pilani, T102 -> IIT Bombay
    assert len(normalized.team_organizations) == 3
    t101_orgs = [to["organization"] for to in normalized.team_organizations if to["team_id"] == "T101"]
    assert "IIT Bombay" in t101_orgs
    assert "BITS Pilani" in t101_orgs


def test_normalize_dataset_deduplication():
    records = [
        {
            "rank": "1",
            "score": "0.99",
            "team_id": "DUP_01",
            "team_name": "Original Team",
            "players": [{"name": "P1", "organization": "Org A"}]
        },
        {
            "rank": "1",
            "score": "0.99",
            "team_id": "DUP_01",
            "team_name": "Original Team Duplicate",
            "players": [{"name": "P1", "organization": "Org A"}]
        }
    ]
    normalized = normalize_dataset(records)
    assert normalized.unique_teams_count == 1
    assert normalized.teams[0]["team_id"] == "DUP_01"
