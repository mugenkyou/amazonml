"""
Configuration management for the Unstop Leaderboard Collector and Flask Web Application.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present
load_dotenv()

# Base paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"

# Processed CSV and metadata file paths
TEAMS_CSV = PROCESSED_DATA_DIR / "teams.csv"
PLAYERS_CSV = PROCESSED_DATA_DIR / "players.csv"
ORGANIZATIONS_CSV = PROCESSED_DATA_DIR / "organizations.csv"
TEAM_ORGANIZATIONS_CSV = PROCESSED_DATA_DIR / "team_organizations.csv"
COLLECTION_METADATA_JSON = PROCESSED_DATA_DIR / "collection_metadata.json"

# Unstop API Target Settings
CHALLENGE_ID = os.getenv("CHALLENGE_ID", "290344")
COMPETITION_TYPE = os.getenv("COMPETITION_TYPE", "CodeContest")
BASE_API_URL = os.getenv(
    "UNSTOP_API_URL",
    f"https://unstop.com/api/public/live-leaderboard/{CHALLENGE_ID}/{COMPETITION_TYPE}"
)

# Collector Engine Settings
DEFAULT_PER_PAGE = int(os.getenv("DEFAULT_PER_PAGE", "30"))
REQUEST_DELAY_SECONDS = float(os.getenv("REQUEST_DELAY_SECONDS", "0.5"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
BACKOFF_FACTOR = float(os.getenv("BACKOFF_FACTOR", "1.5"))
TIMEOUT_SECONDS = int(os.getenv("TIMEOUT_SECONDS", "15"))

# Flask Web Server Settings
FLASK_PORT = int(os.getenv("PORT", "5000"))
FLASK_HOST = os.getenv("HOST", "127.0.0.1")
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1", "yes")

# Ensure required runtime directories exist
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
