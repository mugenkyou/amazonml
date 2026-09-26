"""
Normalization engine for Unstop Leaderboard dataset.
Transforms parsed records into normalized relational entities (teams, players, organizations, team_organizations).
"""

import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple


@dataclass
class NormalizedData:
    teams: List[Dict[str, Any]] = field(default_factory=list)
    players: List[Dict[str, Any]] = field(default_factory=list)
    organizations: List[Dict[str, Any]] = field(default_factory=list)
    team_organizations: List[Dict[str, Any]] = field(default_factory=list)
    total_raw_records: int = 0
    unique_teams_count: int = 0
    unique_players_count: int = 0
    unique_orgs_count: int = 0


def normalize_organization(org: Optional[str]) -> str:
    """
    Produce a clean, lowercased, canonical string suitable for search/matching.
    - Lowers case
    - Trims leading/trailing whitespace
    - Collapses multiple whitespace characters to a single space
    - Replaces smart quotes/dashes with standard ones
    - Removes trailing punctuation (e.g. '.', ',')
    - Preserves institutional distinctions
    """
    if not org:
        return ""

    text = str(org).strip().lower()
    if not text:
        return ""

    # Replace smart quotes and special hyphens
    text = text.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    text = text.replace("–", "-").replace("—", "-")

    # Collapse multiple whitespace characters
    text = re.sub(r"\s+", " ", text)

    # Strip trailing punctuation often found in user inputs
    text = re.sub(r"[,\.;]+$", "", text).strip()

    return text


def normalize_dataset(records: List[Dict[str, Any]]) -> NormalizedData:
    """
    Process a list of standardized record items into relational entities.

    :param records: List of standardized record dictionaries.
    :return: NormalizedData containing teams, players, organizations, and team_organizations.
    """
    seen_team_ids: Set[str] = set()
    teams_list: List[Dict[str, Any]] = []
    players_list: List[Dict[str, Any]] = []
    team_orgs_list: List[Dict[str, Any]] = []
    seen_team_org_pairs: Set[Tuple[str, str]] = set()

    # Track organizations: org_name -> {"normalized": norm, "team_ids": set(), "player_names": list()}
    org_stats: Dict[str, Dict[str, Any]] = {}

    for record in records:
        team_id = str(record.get("team_id") or "").strip()
        team_name = str(record.get("team_name") or "").strip()

        # If team_id is missing, use a fallback based on team_name and rank if available
        if not team_id:
            team_id = f"gen_{record.get('rank', 'unk')}_{hash(team_name) & 0xFFFFFFFF}"

        # Deduplicate teams if duplicate team_id encountered
        if team_id not in seen_team_ids:
            seen_team_ids.add(team_id)
            teams_list.append({
                "team_id": team_id,
                "team_name": team_name,
                "rank": record.get("rank") or "",
                "score": record.get("score") or "",
                "finish_time": record.get("finish_time") or "",
                "has_played": "" if record.get("has_played") is None else str(record.get("has_played")),
                "proctoring_score": record.get("proctoring_score") or "",
                "is_blacklisted": "" if record.get("is_blacklisted") is None else str(record.get("is_blacklisted")),
            })

        players = record.get("players") or []
        for idx, player in enumerate(players):
            p_name = str(player.get("name") or "").strip()
            p_org = str(player.get("organization") or "").strip()

            players_list.append({
                "team_id": team_id,
                "team_name": team_name,
                "player_name": p_name,
                "organization": p_org,
                "player_index": idx,
            })

            # Record organization relationships if organization is provided
            if p_org:
                pair_key = (team_id, p_org)
                if pair_key not in seen_team_org_pairs:
                    seen_team_org_pairs.add(pair_key)
                    norm_org = normalize_organization(p_org)
                    team_orgs_list.append({
                        "team_id": team_id,
                        "team_name": team_name,
                        "organization": p_org,
                        "normalized_organization": norm_org,
                    })

                # Update org stats
                if p_org not in org_stats:
                    org_stats[p_org] = {
                        "organization": p_org,
                        "normalized_organization": normalize_organization(p_org),
                        "team_ids": set(),
                        "player_count": 0,
                    }
                org_stats[p_org]["team_ids"].add(team_id)
                org_stats[p_org]["player_count"] += 1

    # Build organizations list sorted by team_count descending, then name
    orgs_list: List[Dict[str, Any]] = []
    for org_name, data in org_stats.items():
        orgs_list.append({
            "organization": data["organization"],
            "normalized_organization": data["normalized_organization"],
            "team_count": len(data["team_ids"]),
            "player_count": data["player_count"],
        })

    orgs_list.sort(key=lambda x: (-x["team_count"], -x["player_count"], x["organization"]))

    return NormalizedData(
        teams=teams_list,
        players=players_list,
        organizations=orgs_list,
        team_organizations=team_orgs_list,
        total_raw_records=len(records),
        unique_teams_count=len(teams_list),
        unique_players_count=len(players_list),
        unique_orgs_count=len(orgs_list),
    )
