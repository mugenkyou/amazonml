"""
Parser for Unstop Leaderboard API responses.
Handles diverse JSON payload layouts, robustly extracting records and pagination metadata.
"""

import logging
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


def parse_leaderboard_page(
    response_data: Any,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Parse a raw API response dictionary into a list of leaderboard records
    and a pagination metadata dictionary.

    :param response_data: The JSON-decoded response payload from Unstop API.
    :return: A tuple of (records_list, pagination_metadata_dict).
    """
    if not isinstance(response_data, dict):
        if isinstance(response_data, list):
            return response_data, {"current_page": None, "last_page": None, "total": len(response_data)}
        return [], {"current_page": None, "last_page": None, "total": None}

    # Extract records list
    raw_records: List[Any] = []
    meta: Dict[str, Any] = {
        "current_page": None,
        "last_page": None,
        "total": None,
    }

    # Check top-level 'data' field
    data_field = response_data.get("data")
    if isinstance(data_field, list):
        raw_records = data_field
    elif isinstance(data_field, dict):
        nested_data = data_field.get("data")
        if isinstance(nested_data, list):
            raw_records = nested_data
        else:
            raw_records = []
        # Pull pagination fields from nested data dict if present
        for key in ("current_page", "last_page", "total", "per_page", "from", "to"):
            if key in data_field:
                meta[key] = data_field[key]

    # Pull pagination fields from top-level response_data
    for key in ("current_page", "last_page", "total", "per_page", "from", "to"):
        if key in response_data and response_data[key] is not None:
            meta[key] = response_data[key]

    # Normalize meta fields to int if possible
    for int_key in ("current_page", "last_page", "total", "per_page"):
        if int_key in meta and meta[int_key] is not None:
            try:
                meta[int_key] = int(meta[int_key])
            except (ValueError, TypeError):
                pass

    return raw_records, meta


def parse_record_item(raw_item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Parse and validate a single leaderboard record item.
    Ensures safe extraction of rank, score, finish_time, and team information.

    :param raw_item: A single dictionary item from the records list.
    :return: Standardized record dictionary or None if invalid.
    """
    if not isinstance(raw_item, dict):
        return None

    # Extract rank
    raw_rank = raw_item.get("rank")
    rank_val: Optional[str] = None
    if raw_rank is not None:
        rank_val = str(raw_rank).strip()

    # Extract score
    raw_score = raw_item.get("score")
    score_val: Optional[str] = None
    if raw_score is not None:
        score_val = str(raw_score).strip()

    finish_time = raw_item.get("finish_time")
    if finish_time is not None:
        finish_time = str(finish_time).strip()

    has_played = raw_item.get("has_played")
    proctoring_score = raw_item.get("proctoring_score")
    if proctoring_score is not None:
        proctoring_score = str(proctoring_score).strip()

    is_blacklisted = raw_item.get("is_blacklisted")

    # Team extraction
    team_data = raw_item.get("team")
    if isinstance(team_data, dict):
        team_id = team_data.get("id") or team_data.get("team_id")
        team_name = team_data.get("team_name") or team_data.get("name")
        raw_players = team_data.get("players")
    else:
        # Fallback if team fields are at top level
        team_id = raw_item.get("team_id") or raw_item.get("id")
        team_name = raw_item.get("team_name") or raw_item.get("name")
        raw_players = raw_item.get("players")

    team_id_str = str(team_id).strip() if team_id is not None else ""
    team_name_str = str(team_name).strip() if team_name is not None else ""

    # Player extraction
    players: List[Dict[str, str]] = []
    if isinstance(raw_players, list):
        for p in raw_players:
            if isinstance(p, dict):
                p_name = p.get("name") or p.get("player_name") or ""
                # Support both 'organisation' and 'organization'
                p_org = p.get("organisation") or p.get("organization") or p.get("college") or ""
                players.append({
                    "name": str(p_name).strip(),
                    "organization": str(p_org).strip(),
                })
            elif isinstance(p, str):
                players.append({
                    "name": p.strip(),
                    "organization": "",
                })

    return {
        "rank": rank_val,
        "score": score_val,
        "finish_time": finish_time,
        "has_played": has_played,
        "proctoring_score": proctoring_score,
        "is_blacklisted": is_blacklisted,
        "team_id": team_id_str,
        "team_name": team_name_str,
        "players": players,
    }


def extract_leaderboard_records(
    raw_records: List[Any],
) -> List[Dict[str, Any]]:
    """
    Extract and standardize all records from a raw records list.
    """
    parsed_records = []
    for item in raw_records:
        parsed = parse_record_item(item)
        if parsed:
            parsed_records.append(parsed)
    return parsed_records
