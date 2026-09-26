"""
Storage manager for raw JSON snapshots, processed CSV files, and collection metadata.
"""

import csv
import json
import logging
import re
from pathlib import Path
from typing import Any, Dict, List, Optional
from .normalizer import NormalizedData

logger = logging.getLogger(__name__)


def get_raw_page_filename(page: int) -> str:
    """Format standard zero-padded page filename."""
    return f"page_{page:04d}.json"


def save_raw_page(page: int, data: Dict[str, Any], raw_dir: Path) -> Path:
    """
    Save raw API response for a single page into raw_dir with deterministic naming.
    """
    raw_dir.mkdir(parents=True, exist_ok=True)
    filepath = raw_dir / get_raw_page_filename(page)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    logger.debug("Saved raw JSON page %d to %s", page, filepath)
    return filepath


def raw_page_exists(page: int, raw_dir: Path) -> bool:
    """Check if raw snapshot for the given page number already exists."""
    return (raw_dir / get_raw_page_filename(page)).exists()


def load_all_raw_pages(raw_dir: Path) -> List[Dict[str, Any]]:
    """
    Load all page_*.json files in numerical order from raw_dir.
    """
    if not raw_dir.exists():
        return []

    pattern = re.compile(r"^page_(\d+)\.json$")
    page_files = []

    for file_path in raw_dir.iterdir():
        if file_path.is_file():
            match = pattern.match(file_path.name)
            if match:
                page_num = int(match.group(1))
                page_files.append((page_num, file_path))

    page_files.sort(key=lambda x: x[0])

    all_pages: List[Dict[str, Any]] = []
    for page_num, file_path in page_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = json.load(f)
                all_pages.append(content)
        except Exception as e:
            logger.error("Failed to read raw page file %s: %s", file_path, e)

    return all_pages


def save_processed_csvs(normalized_data: NormalizedData, processed_dir: Path) -> None:
    """
    Write normalized entities to their respective CSV files with explicit headers.
    """
    processed_dir.mkdir(parents=True, exist_ok=True)

    # 1. teams.csv
    teams_csv = processed_dir / "teams.csv"
    teams_fields = [
        "team_id",
        "team_name",
        "rank",
        "score",
        "finish_time",
        "has_played",
        "proctoring_score",
        "is_blacklisted",
    ]
    with open(teams_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=teams_fields)
        writer.writeheader()
        for item in normalized_data.teams:
            writer.writerow({k: item.get(k, "") for k in teams_fields})

    # 2. players.csv
    players_csv = processed_dir / "players.csv"
    players_fields = [
        "team_id",
        "team_name",
        "player_name",
        "organization",
        "player_index",
    ]
    with open(players_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=players_fields)
        writer.writeheader()
        for item in normalized_data.players:
            writer.writerow({k: item.get(k, "") for k in players_fields})

    # 3. organizations.csv
    orgs_csv = processed_dir / "organizations.csv"
    orgs_fields = [
        "organization",
        "normalized_organization",
        "team_count",
        "player_count",
    ]
    with open(orgs_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=orgs_fields)
        writer.writeheader()
        for item in normalized_data.organizations:
            writer.writerow({k: item.get(k, "") for k in orgs_fields})

    # 4. team_organizations.csv
    team_orgs_csv = processed_dir / "team_organizations.csv"
    team_orgs_fields = [
        "team_id",
        "team_name",
        "organization",
        "normalized_organization",
    ]
    with open(team_orgs_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=team_orgs_fields)
        writer.writeheader()
        for item in normalized_data.team_organizations:
            writer.writerow({k: item.get(k, "") for k in team_orgs_fields})

    logger.info(
        "Successfully wrote CSVs to %s: %d teams, %d players, %d orgs, %d team-org links",
        processed_dir,
        len(normalized_data.teams),
        len(normalized_data.players),
        len(normalized_data.organizations),
        len(normalized_data.team_organizations),
    )


def save_metadata(metadata: Dict[str, Any], path: Path) -> None:
    """Save collection metadata JSON file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    logger.info("Saved collection metadata to %s", path)


def load_metadata(path: Path) -> Optional[Dict[str, Any]]:
    """Load collection metadata JSON file if it exists."""
    if not path.exists():
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error("Failed to load metadata from %s: %s", path, e)
        return None
