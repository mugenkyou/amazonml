"""
Flask Web Application for Unstop ML Leaderboard Explorer.
Provides fast in-memory indexing, organization search, team profile views, and REST APIs.
"""

import csv
import json
import logging
import math
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

from flask import Flask, jsonify, render_template, request, abort

import config
from collector.normalizer import normalize_organization
from collector.storage import load_metadata

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("unstop_app")


class LeaderboardDataStore:
    """
    In-memory data store and fast index for leaderboard teams, players, and organizations.
    Loaded once at startup to avoid repeated disk reads.
    """

    def __init__(self, processed_dir: Path = config.PROCESSED_DATA_DIR, metadata_path: Path = config.COLLECTION_METADATA_JSON):
        self.processed_dir = processed_dir
        self.metadata_path = metadata_path
        self.teams_by_id: Dict[str, Dict[str, Any]] = {}
        self.teams_list: List[Dict[str, Any]] = []
        self.players_by_team: Dict[str, List[Dict[str, Any]]] = {}
        self.organizations: List[Dict[str, Any]] = []
        # Normalized org string -> set of team_ids
        self.org_to_team_ids: Dict[str, Set[str]] = {}
        # Team ID -> set of raw organizations
        self.team_to_orgs: Dict[str, Set[str]] = {}
        self.metadata: Optional[Dict[str, Any]] = None
        self.load_data()

    def load_data(self) -> None:
        """Load all CSVs and metadata into memory and construct lookup indexes."""
        self.metadata = load_metadata(self.metadata_path) or {
            "complete": False,
            "unique_teams": 0,
            "unique_players": 0,
            "unique_organizations": 0,
            "collection_finished_at": None,
        }

        # Clear state
        self.teams_by_id.clear()
        self.teams_list.clear()
        self.players_by_team.clear()
        self.organizations.clear()
        self.org_to_team_ids.clear()
        self.team_to_orgs.clear()

        # 1. Load players
        players_csv = self.processed_dir / "players.csv"
        if players_csv.exists():
            with open(players_csv, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    t_id = row.get("team_id", "").strip()
                    if not t_id:
                        continue
                    if t_id not in self.players_by_team:
                        self.players_by_team[t_id] = []
                    self.players_by_team[t_id].append({
                        "player_name": row.get("player_name", "").strip(),
                        "organization": row.get("organization", "").strip(),
                        "player_index": row.get("player_index", 0),
                    })

        # 2. Load team_organizations
        team_orgs_csv = self.processed_dir / "team_organizations.csv"
        if team_orgs_csv.exists():
            with open(team_orgs_csv, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    t_id = row.get("team_id", "").strip()
                    org = row.get("organization", "").strip()
                    norm_org = row.get("normalized_organization", "").strip()
                    if not t_id or not norm_org:
                        continue

                    if norm_org not in self.org_to_team_ids:
                        self.org_to_team_ids[norm_org] = set()
                    self.org_to_team_ids[norm_org].add(t_id)

                    if t_id not in self.team_to_orgs:
                        self.team_to_orgs[t_id] = set()
                    self.team_to_orgs[t_id].add(org)

        # 3. Load teams
        teams_csv = self.processed_dir / "teams.csv"
        if teams_csv.exists():
            with open(teams_csv, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    t_id = row.get("team_id", "").strip()
                    if not t_id:
                        continue

                    team_players = self.players_by_team.get(t_id, [])
                    team_orgs = sorted(list(self.team_to_orgs.get(t_id, set())))

                    # Try to parse rank for numeric sorting
                    raw_rank = row.get("rank", "")
                    try:
                        sort_rank = int(raw_rank)
                    except (ValueError, TypeError):
                        sort_rank = 999999999

                    team_obj = {
                        "team_id": t_id,
                        "team_name": row.get("team_name", "").strip(),
                        "rank": raw_rank,
                        "sort_rank": sort_rank,
                        "score": row.get("score", "").strip(),
                        "finish_time": row.get("finish_time", "").strip(),
                        "has_played": row.get("has_played", "").strip(),
                        "proctoring_score": row.get("proctoring_score", "").strip(),
                        "is_blacklisted": row.get("is_blacklisted", "").strip(),
                        "players": team_players,
                        "organizations": team_orgs,
                    }
                    self.teams_by_id[t_id] = team_obj
                    self.teams_list.append(team_obj)

            # Sort teams list by rank ascending
            self.teams_list.sort(key=lambda x: (x["sort_rank"], x["team_name"]))

        # 4. Load organizations
        orgs_csv = self.processed_dir / "organizations.csv"
        if orgs_csv.exists():
            with open(orgs_csv, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    self.organizations.append({
                        "organization": row.get("organization", "").strip(),
                        "normalized_organization": row.get("normalized_organization", "").strip(),
                        "team_count": int(row.get("team_count", 0) or 0),
                        "player_count": int(row.get("player_count", 0) or 0),
                    })

        logger.info(
            "LeaderboardDataStore loaded: %d teams, %d unique orgs, %d player groups",
            len(self.teams_list),
            len(self.organizations),
            len(self.players_by_team),
        )

    def search_teams(
        self,
        query: str = "",
        exact: bool = False,
        page: int = 1,
        per_page: int = 30,
    ) -> Tuple[List[Dict[str, Any]], int, int]:
        """
        Search for teams by organization substring or exact match.
        Scans complete dataset across all players and teams.

        :return: (paginated_teams, total_matching_count, total_pages)
        """
        query_norm = normalize_organization(query)

        if not query_norm:
            matching_teams = self.teams_list
        else:
            matching_team_ids: Set[str] = set()
            for norm_org, team_ids in self.org_to_team_ids.items():
                if exact:
                    if norm_org == query_norm:
                        matching_team_ids.update(team_ids)
                else:
                    if query_norm in norm_org:
                        matching_team_ids.update(team_ids)

            matching_teams = [
                self.teams_by_id[tid]
                for tid in matching_team_ids
                if tid in self.teams_by_id
            ]
            matching_teams.sort(key=lambda x: (x["sort_rank"], x["team_name"]))

        total_count = len(matching_teams)
        total_pages = max(1, math.ceil(total_count / per_page)) if per_page > 0 else 1
        page = max(1, min(page, total_pages))

        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_teams = matching_teams[start_idx:end_idx]

        return paginated_teams, total_count, total_pages

    def search_organizations(self, query: str = "", limit: int = 10) -> List[Dict[str, Any]]:
        """Search organizations for autocomplete dropdown."""
        query_norm = normalize_organization(query)
        if not query_norm:
            return self.organizations[:limit]

        results = []
        for org in self.organizations:
            if query_norm in org["normalized_organization"]:
                results.append(org)
                if len(results) >= limit:
                    break
        return results

    def get_team(self, team_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve full details of a specific team."""
        return self.teams_by_id.get(str(team_id).strip())


def create_app(data_store: Optional[LeaderboardDataStore] = None) -> Flask:
    """Create and configure Flask application."""
    app = Flask(__name__)
    store = data_store or LeaderboardDataStore()

    @app.context_processor
    def inject_globals():
        return {
            "meta": store.metadata,
            "total_teams_count": len(store.teams_list),
            "total_orgs_count": len(store.organizations),
        }

    @app.route("/")
    def index():
        query = request.args.get("q", "").strip()
        exact = request.args.get("exact", "0").lower() in ("1", "true", "yes")
        try:
            page = int(request.args.get("page", 1))
        except ValueError:
            page = 1
        try:
            per_page = int(request.args.get("per_page", 30))
        except ValueError:
            per_page = 30

        teams, total_count, total_pages = store.search_teams(
            query=query, exact=exact, page=page, per_page=per_page
        )

        return render_template(
            "index.html",
            teams=teams,
            query=query,
            exact=exact,
            page=page,
            per_page=per_page,
            total_count=total_count,
            total_pages=total_pages,
            top_orgs=store.organizations[:8],
        )

    @app.route("/search")
    def search():
        return index()

    @app.route("/team/<team_id>")
    def team_detail(team_id: str):
        team = store.get_team(team_id)
        if not team:
            abort(404, description=f"Team with ID {team_id} not found.")
        return render_template("team.html", team=team)

    @app.route("/api/organizations")
    def api_organizations():
        q = request.args.get("q", "").strip()
        try:
            limit = int(request.args.get("limit", 15))
        except ValueError:
            limit = 15
        results = store.search_organizations(query=q, limit=limit)
        return jsonify({"organizations": results, "query": q, "count": len(results)})

    @app.route("/api/teams")
    def api_teams():
        q = request.args.get("q", "").strip()
        exact = request.args.get("exact", "0").lower() in ("1", "true", "yes")
        try:
            page = int(request.args.get("page", 1))
        except ValueError:
            page = 1
        try:
            per_page = int(request.args.get("per_page", 30))
        except ValueError:
            per_page = 30

        teams, total_count, total_pages = store.search_teams(
            query=q, exact=exact, page=page, per_page=per_page
        )

        return jsonify({
            "query": q,
            "exact": exact,
            "page": page,
            "per_page": per_page,
            "total_teams": total_count,
            "total_pages": total_pages,
            "teams": teams,
        })

    @app.route("/health")
    def health():
        return jsonify({
            "status": "healthy",
            "teams_indexed": len(store.teams_list),
            "orgs_indexed": len(store.organizations),
            "collection_complete": bool(store.metadata and store.metadata.get("complete")),
            "last_collection": store.metadata.get("collection_finished_at") if store.metadata else None,
        })

    return app


# Global app instance
data_store = LeaderboardDataStore()
app = create_app(data_store)

if __name__ == "__main__":
    app.run(host=config.FLASK_HOST, port=config.FLASK_PORT, debug=config.FLASK_DEBUG)
