"""
Unit tests for collector/client.py, collector/storage.py, and collector/fetch_all.py
"""

import json
from pathlib import Path
from unittest.mock import MagicMock, patch
import pytest
import requests

from collector.client import UnstopClient, UnstopAPIError, UnstopRateLimitError
from collector.storage import (
    save_raw_page,
    load_all_raw_pages,
    raw_page_exists,
    save_metadata,
    load_metadata,
)
from collector.fetch_all import collect_leaderboard


def test_client_fetch_page_success():
    mock_session = MagicMock()
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "data": [{"rank": "1", "team": {"id": 1, "name": "Winner"}}],
        "current_page": 1,
        "last_page": 1
    }
    mock_session.get.return_value = mock_response

    client = UnstopClient(base_url="https://example.com/api", session=mock_session)
    data = client.fetch_page(page=1, per_page=10)

    assert data["current_page"] == 1
    assert len(data["data"]) == 1
    mock_session.get.assert_called_once()


def test_client_fetch_page_retry_on_429():
    mock_session = MagicMock()
    
    # 1st attempt: 429, 2nd attempt: 200
    resp_429 = MagicMock()
    resp_429.status_code = 429
    resp_429.headers = {"Retry-After": "0.01"}

    resp_200 = MagicMock()
    resp_200.status_code = 200
    resp_200.json.return_value = {"data": [], "current_page": 1}

    mock_session.get.side_effect = [resp_429, resp_200]

    client = UnstopClient(base_url="https://example.com/api", session=mock_session, max_retries=2, backoff_factor=0.01)
    data = client.fetch_page(page=1)
    assert data["current_page"] == 1
    assert mock_session.get.call_count == 2


def test_client_fetch_page_timeout_failure():
    mock_session = MagicMock()
    mock_session.get.side_effect = requests.Timeout("Connection timed out")

    client = UnstopClient(base_url="https://example.com/api", session=mock_session, max_retries=2, backoff_factor=0.01)
    with pytest.raises(UnstopAPIError):
        client.fetch_page(page=1)
    assert mock_session.get.call_count == 3


def test_storage_raw_pages_and_metadata(tmp_path: Path):
    raw_dir = tmp_path / "raw"
    page1_data = {"data": [{"rank": "1", "team": {"id": 101, "team_name": "T1", "players": []}}], "current_page": 1}
    page2_data = {"data": [{"rank": "2", "team": {"id": 102, "team_name": "T2", "players": []}}], "current_page": 2}

    p1_file = save_raw_page(1, page1_data, raw_dir)
    p2_file = save_raw_page(2, page2_data, raw_dir)

    assert p1_file.exists()
    assert raw_page_exists(1, raw_dir)
    assert raw_page_exists(2, raw_dir)
    assert not raw_page_exists(3, raw_dir)

    all_pages = load_all_raw_pages(raw_dir)
    assert len(all_pages) == 2
    assert all_pages[0]["current_page"] == 1
    assert all_pages[1]["current_page"] == 2

    # Metadata test
    meta_path = tmp_path / "processed" / "collection_metadata.json"
    meta_data = {"complete": True, "unique_teams": 2}
    save_metadata(meta_data, meta_path)
    loaded_meta = load_metadata(meta_path)
    assert loaded_meta is not None
    assert loaded_meta["complete"] is True
    assert loaded_meta["unique_teams"] == 2


def test_collect_leaderboard_mocked(tmp_path: Path):
    raw_dir = tmp_path / "raw"
    processed_dir = tmp_path / "processed"
    meta_path = processed_dir / "collection_metadata.json"

    # Mock client
    mock_client = MagicMock(spec=UnstopClient)
    page1 = {
        "data": [
            {
                "rank": "1",
                "score": "0.99",
                "finish_time": "2026-09-26",
                "team": {
                    "id": 1,
                    "team_name": "Team One",
                    "players": [{"name": "P1", "organisation": "IIT Madras"}]
                }
            }
        ],
        "current_page": 1,
        "last_page": 2
    }
    page2 = {
        "data": [
            {
                "rank": "2",
                "score": "0.95",
                "finish_time": "2026-09-26",
                "team": {
                    "id": 2,
                    "team_name": "Team Two",
                    "players": [{"name": "P2", "organisation": "BITS Pilani"}]
                }
            }
        ],
        "current_page": 2,
        "last_page": 2
    }
    mock_client.fetch_page.side_effect = [page1, page2]

    meta = collect_leaderboard(
        raw_dir=raw_dir,
        processed_dir=processed_dir,
        metadata_path=meta_path,
        delay_seconds=0,
        client=mock_client,
    )

    assert meta["complete"] is True
    assert meta["unique_teams"] == 2
    assert meta["unique_organizations"] == 2
    assert (processed_dir / "teams.csv").exists()
    assert (processed_dir / "players.csv").exists()
    assert (processed_dir / "organizations.csv").exists()
    assert (processed_dir / "team_organizations.csv").exists()
    assert (processed_dir / "collection_metadata.json").exists()
