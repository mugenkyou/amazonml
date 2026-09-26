"""
Integration and route tests for Flask web application.
"""

from pathlib import Path
import pytest
from app import create_app, LeaderboardDataStore
from collector.normalizer import normalize_dataset
from collector.storage import save_processed_csvs, save_metadata


@pytest.fixture
def test_app_client(tmp_path: Path):
    processed_dir = tmp_path / "processed"
    meta_path = processed_dir / "collection_metadata.json"

    records = [
        {
            "rank": "1",
            "score": "0.995",
            "finish_time": "2026-09-26 10:00:00",
            "has_played": True,
            "proctoring_score": "95",
            "is_blacklisted": False,
            "team_id": "T101",
            "team_name": "Team SuperAI",
            "players": [
                {"name": "Alice Sharma", "organization": "IIT Bombay"},
                {"name": "Bob Verma", "organization": "BITS Pilani"},
            ]
        },
        {
            "rank": "2",
            "score": "0.980",
            "finish_time": "2026-09-26 10:05:00",
            "has_played": True,
            "proctoring_score": "98",
            "is_blacklisted": False,
            "team_id": "T102",
            "team_name": "Team DataWizards",
            "players": [
                {"name": "Charlie Gupta", "organization": "IIT Delhi"},
            ]
        },
        {
            "rank": "3",
            "score": "0.910",
            "finish_time": "2026-09-26 10:10:00",
            "has_played": False,
            "proctoring_score": None,
            "is_blacklisted": False,
            "team_id": "T103",
            "team_name": "Team LoneWolf",
            "players": [
                {"name": "David", "organization": "Vellore Institute of Technology"},
            ]
        }
    ]

    normalized = normalize_dataset(records)
    save_processed_csvs(normalized, processed_dir)

    metadata = {
        "challenge_id": "290344",
        "complete": True,
        "unique_teams": 3,
        "unique_players": 4,
        "unique_organizations": 4,
        "collection_finished_at": "2026-09-26T10:15:00+00:00",
    }
    save_metadata(metadata, meta_path)

    store = LeaderboardDataStore(processed_dir=processed_dir, metadata_path=meta_path)
    app = create_app(store)
    app.config["TESTING"] = True
    return app.test_client()


def test_index_dashboard(test_app_client):
    response = test_app_client.get("/")
    assert response.status_code == 200
    html = response.get_data(as_text=True)
    assert "Team SuperAI" in html
    assert "Team DataWizards" in html
    assert "Team LoneWolf" in html
    assert "Total Teams" in html


def test_search_substring(test_app_client):
    # Searching for "IIT" should return both Team SuperAI (IIT Bombay) and Team DataWizards (IIT Delhi)
    response = test_app_client.get("/search?q=IIT")
    assert response.status_code == 200
    html = response.get_data(as_text=True)
    assert "Team SuperAI" in html
    assert "Team DataWizards" in html
    assert "Team LoneWolf" not in html


def test_search_multi_org_team_matches_either_org(test_app_client):
    # Team SuperAI has players from IIT Bombay AND BITS Pilani.
    # Searching BITS should find Team SuperAI.
    response = test_app_client.get("/search?q=BITS")
    assert response.status_code == 200
    html = response.get_data(as_text=True)
    assert "Team SuperAI" in html
    assert "Team DataWizards" not in html


def test_search_exact_match(test_app_client):
    # Search exact for "IIT" -> matches nothing because exact names are "IIT Bombay" and "IIT Delhi"
    resp_empty = test_app_client.get("/search?q=IIT&exact=1")
    assert resp_empty.status_code == 200
    html_empty = resp_empty.get_data(as_text=True)
    assert "No teams found" in html_empty

    # Search exact for "IIT Bombay"
    resp_exact = test_app_client.get("/search?q=IIT%20Bombay&exact=1")
    assert resp_exact.status_code == 200
    html_exact = resp_exact.get_data(as_text=True)
    assert "Team SuperAI" in html_exact
    assert "Team DataWizards" not in html_exact


def test_team_detail_route(test_app_client):
    # Existing team
    response = test_app_client.get("/team/T101")
    assert response.status_code == 200
    html = response.get_data(as_text=True)
    assert "Team SuperAI" in html
    assert "Alice Sharma" in html
    assert "Bob Verma" in html
    assert "IIT Bombay" in html
    assert "BITS Pilani" in html

    # Non-existing team
    resp_404 = test_app_client.get("/team/NON_EXISTENT")
    assert resp_404.status_code == 404


def test_api_organizations(test_app_client):
    response = test_app_client.get("/api/organizations?q=IIT")
    assert response.status_code == 200
    data = response.get_json()
    assert "organizations" in data
    org_names = [o["organization"] for o in data["organizations"]]
    assert "IIT Bombay" in org_names
    assert "IIT Delhi" in org_names


def test_api_teams(test_app_client):
    response = test_app_client.get("/api/teams?q=BITS")
    assert response.status_code == 200
    data = response.get_json()
    assert data["total_teams"] == 1
    assert data["teams"][0]["team_id"] == "T101"
    assert data["teams"][0]["team_name"] == "Team SuperAI"


def test_health_route(test_app_client):
    response = test_app_client.get("/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert data["teams_indexed"] == 3
    assert data["collection_complete"] is True
