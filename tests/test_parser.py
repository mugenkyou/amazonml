"""
Unit tests for collector/parser.py
"""

import pytest
from collector.parser import parse_leaderboard_page, parse_record_item, extract_leaderboard_records


def test_parse_leaderboard_page_standard_shape():
    payload = {
        "data": [
            {
                "rank": "1",
                "score": "0.990556",
                "finish_time": "2026-09-26 10:34:10+05:30",
                "team": {
                    "id": 58688044,
                    "team_name": "Androids",
                    "players": [
                        {
                            "name": "Pardheev Krishna Tammineni",
                            "organisation": "Siddartha Educational Academy Group of Institute"
                        }
                    ]
                }
            }
        ],
        "current_page": 1,
        "last_page": 110,
        "total": 3297,
        "per_page": 30
    }
    records, meta = parse_leaderboard_page(payload)
    assert len(records) == 1
    assert meta["current_page"] == 1
    assert meta["last_page"] == 110
    assert meta["total"] == 3297


def test_parse_leaderboard_page_nested_shape():
    payload = {
        "data": {
            "data": [
                {
                    "rank": 2,
                    "score": 0.985,
                    "team": {
                        "id": "1002",
                        "name": "ByteCode",
                        "players": []
                    }
                }
            ],
            "current_page": "2",
            "last_page": "10",
            "total": "300"
        }
    }
    records, meta = parse_leaderboard_page(payload)
    assert len(records) == 1
    assert meta["current_page"] == 2
    assert meta["last_page"] == 10
    assert meta["total"] == 300


def test_parse_leaderboard_page_empty_and_invalid():
    assert parse_leaderboard_page({}) == ([], {"current_page": None, "last_page": None, "total": None})
    assert parse_leaderboard_page(None) == ([], {"current_page": None, "last_page": None, "total": None})
    assert parse_leaderboard_page([]) == ([], {"current_page": None, "last_page": None, "total": 0})


def test_parse_record_item_complete_and_multi_player():
    item = {
        "rank": 10,
        "score": "0.950000",
        "finish_time": "2026-09-26 11:00:00",
        "has_played": True,
        "proctoring_score": 98.5,
        "is_blacklisted": False,
        "team": {
            "id": 12345,
            "team_name": "AI Titans",
            "players": [
                {
                    "name": "Alice Smith",
                    "organization": "IIT Bombay"
                },
                {
                    "name": "Bob Jones",
                    "organisation": "BITS Pilani"
                }
            ]
        }
    }
    parsed = parse_record_item(item)
    assert parsed is not None
    assert parsed["rank"] == "10"
    assert parsed["score"] == "0.950000"
    assert parsed["team_id"] == "12345"
    assert parsed["team_name"] == "AI Titans"
    assert parsed["has_played"] is True
    assert parsed["proctoring_score"] == "98.5"
    assert len(parsed["players"]) == 2
    assert parsed["players"][0]["name"] == "Alice Smith"
    assert parsed["players"][0]["organization"] == "IIT Bombay"
    assert parsed["players"][1]["name"] == "Bob Jones"
    assert parsed["players"][1]["organization"] == "BITS Pilani"


def test_parse_record_item_null_and_missing_fields():
    item = {
        "rank": None,
        "score": None,
        "team": None
    }
    parsed = parse_record_item(item)
    assert parsed is not None
    assert parsed["rank"] is None
    assert parsed["score"] is None
    assert parsed["team_id"] == ""
    assert parsed["team_name"] == ""
    assert parsed["players"] == []


def test_extract_leaderboard_records():
    raw_list = [
        {"rank": "1", "score": "1.0", "team": {"id": 1, "team_name": "T1", "players": []}},
        "invalid_non_dict",
        {"rank": "2", "score": "0.9", "team": {"id": 2, "team_name": "T2", "players": []}},
    ]
    extracted = extract_leaderboard_records(raw_list)
    assert len(extracted) == 2
    assert extracted[0]["team_id"] == "1"
    assert extracted[1]["team_id"] == "2"
