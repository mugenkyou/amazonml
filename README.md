# Unstop ML Challenge Leaderboard Explorer & Data Pipeline

A high-performance local Flask web application and resilient batch data collector for the Unstop ML Challenge (`290344` / `CodeContest`). 

The pipeline sequentially collects all available leaderboard pages via Unstop's public JSON API endpoint, snapshots the raw JSON responses deterministically in `data/raw/`, normalizes the data into relational CSV models in `data/processed/`, and indexes the dataset in memory to provide fast organization and college filtering.

---

## Key Features

- **Batch Collector with Resumability**: Sequentially fetches all leaderboard pages from `https://unstop.com/api/public/live-leaderboard/290344/CodeContest`, automatically discovering total pages or paginating until empty.
- **Fault-Tolerant Network Client**: Bounded exponential backoff retries for transient HTTP errors (429 Rate Limit, 5xx server errors, timeouts).
- **Two-Tier Storage Architecture**:
  - `data/raw/page_XXXX.json`: Reproducible raw JSON API response snapshots.
  - `data/processed/*.csv`: Clean relational CSV datasets (`teams.csv`, `players.csv`, `organizations.csv`, `team_organizations.csv`).
- **Complete Dataset Search & Normalization**:
  - Full-text substring search across normalized organization names.
  - Optional exact-match mode.
  - Multi-member and cross-institutional team support (teams with members from multiple colleges appear when searching for any of those institutions).
- **Zero Live Requests on Search**: Search queries scan the local in-memory dataset, never making live outbound requests to Unstop during user interactions.
- **Metadata Tracking**: `data/processed/collection_metadata.json` records collection status, timestamps, record counts, and failed pages.

---

## Project Structure

```
unstop-top/
├── app.py                     # Flask application & in-memory search index
├── config.py                  # Global configuration & environment settings
├── requirements.txt           # Python dependencies
├── .env.example               # Template environment configuration
├── .gitignore                 # Git ignore rules
├── README.md                  # Documentation & usage guide
│
├── collector/                 # Batch data collection package
│   ├── __init__.py
│   ├── client.py              # HTTP client with retry & backoff logic
│   ├── parser.py              # API payload & metadata extraction
│   ├── normalizer.py          # Organization & relational normalization
│   ├── storage.py             # Raw JSON & CSV persistence
│   └── fetch_all.py           # CLI orchestrator for batch collection
│
├── data/
│   ├── raw/                   # Raw API page snapshots (page_0001.json, ...)
│   └── processed/             # Normalized relational CSVs & metadata
│       ├── teams.csv
│       ├── players.csv
│       ├── organizations.csv
│       ├── team_organizations.csv
│       └── collection_metadata.json
│
├── static/
│   ├── css/
│   │   └── style.css          # Responsive styling & design system
│   └── js/
│       └── app.js             # Debounced autocomplete & search UX
│
├── templates/
│   ├── base.html              # Base HTML layout
│   ├── index.html             # Dashboard & organization search table
│   └── team.html              # Team profile & member roster
│
└── tests/                     # Test suite
    ├── test_collector.py      # HTTP client, storage & collector tests
    ├── test_normalizer.py     # Entity normalization tests
    ├── test_parser.py         # Response parsing & schema validation
    └── test_routes.py         # Flask route & search integration tests
```

---

## Installation & Setup

### 1. Prerequisites
- Python 3.10+ installed

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration (Optional)
Copy `.env.example` to `.env` to override defaults if desired:
```bash
cp .env.example .env
```

---

## Synchronizing & Collecting Data

### 1. Full End-to-End Sync (Recommended)
Fetches the latest live leaderboard data from Unstop, updates raw snapshots in `data/raw/`, rebuilds relational CSVs in `data/processed/`, and compiles Next.js web JSON datasets in `web/data/generated/`:

```bash
# Full live fetch & compile web JSONs
python sync_data.py

# Force re-fetch all pages from the Unstop API
python sync_data.py --force
```

### 2. Fast Offline Rebuild (No Network Calls)
Regenerates all relational CSVs and web JSON artifacts from your local raw JSON snapshots:

```bash
python sync_data.py --regenerate-only
```

### 3. Quick Test Sync
Fetch and sync only the first *N* pages to quickly verify pipeline health:

```bash
python sync_data.py --max-pages 5
```

---

## Granular Data Collection Commands

If you need to run specific low-level collector modules independently:

### 1. Collect Raw Snapshots & Build CSVs
```bash
# Sequentially fetch all leaderboard pages
python -m collector.fetch_all

# Start from a specific page
python -m collector.fetch_all --start-page 1

# Force re-download of existing raw JSON snapshots
python -m collector.fetch_all --force

# Custom per-page size
python -m collector.fetch_all --per-page 30

# Regenerate CSVs only (offline)
python -m collector.fetch_all --regenerate-only
```

### 2. Sync Web Application Datasets (TypeScript)
From the `web/` directory:
```bash
cd web
npm run prepare-data
```

---

## Starting the Flask Web Application

Start the local server:
```bash
python app.py
```

Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## API Endpoints

- `GET /` — Leaderboard dashboard and interactive organization search.
- `GET /search?q=<query>&exact=<0|1>&page=<page>` — Filter teams by organization query.
- `GET /team/<team_id>` — View team details, ranking, score, and all player members.
- `GET /api/organizations?q=<query>` — Autocomplete endpoint for matching organizations.
- `GET /api/teams?q=<query>&exact=<0|1>&page=<page>&per_page=<limit>` — JSON API for filtered teams.
- `GET /health` — Health check reporting status, index sizes, and collection completion.

---

## Running Unit & Integration Tests

Run the full pytest suite (all 22 unit tests with mocked API endpoints):
```bash
python -m pytest -v
```
