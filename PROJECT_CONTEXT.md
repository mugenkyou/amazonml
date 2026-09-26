# UNSTOP ML CHALLENGE LEADERBOARD EXPLORER & DATA PLATFORM
## Comprehensive Project Context & Architectural Documentation

---

### Executive Summary

The **Unstop ML Challenge Leaderboard Explorer** (Challenge ID: `290344` / `CodeContest` — Amazon ML Challenge) is an end-to-end data collection, normalization, offline indexing, analytics, and web exploration platform. 

It solves the problem of exploring, filtering, analyzing, and searching thousands of teams, participants, and academic institutions participating in the national-scale machine learning challenge hosted on the Unstop platform. The system operates on a **zero-live-traffic architecture** for search queries: data is harvested sequentially through a fault-tolerant batch crawler, archived deterministically in raw JSON format, transformed into relational CSVs and pre-indexed JSON models, and served through two complementary frontends (a lightweight local **Flask** application and a modern **Next.js 15 + TypeScript + Tailwind CSS** application).

---

## 1. Project High-Level Architecture

```
                                  [ Unstop Public API ]
                     https://unstop.com/api/public/live-leaderboard/290344/CodeContest
                                            │
                                            ▼
                           ┌─────────────────────────────────┐
                           │   Python Collector Engine       │
                           │   (collector/client.py,         │
                           │    collector/fetch_all.py)      │
                           │   - Bounded Exponential Backoff │
                           │   - Rate Limit (429) Handling   │
                           │   - Resumable Batch Paging      │
                           └────────────────┬────────────────┘
                                            │
                                            ▼
                           ┌─────────────────────────────────┐
                           │   Raw Data Tier (JSON)          │
                           │   data/raw/page_0001.json ...   │
                           │   data/raw/page_0114.json       │
                           └────────────────┬────────────────┘
                                            │
                                            ▼
                           ┌─────────────────────────────────┐
                           │   Parsing & Normalization       │
                           │   (collector/parser.py,         │
                           │    collector/normalizer.py)     │
                           │   - String Canonicalization     │
                           │   - Multi-Institution Extraction│
                           │   - Entity Relational Modeling  │
                           └────────────────┬────────────────┘
                                            │
                                            ▼
                           ┌─────────────────────────────────┐
                           │   Processed Relational CSVs     │
                           │   data/processed/teams.csv      │
                           │   data/processed/players.csv    │
                           │   data/processed/orgs.csv       │
                           │   data/processed/team_orgs.csv  │
                           │   data/processed/metadata.json  │
                           └────────┬───────────────┬────────┘
                                    │               │
            ┌───────────────────────┘               └────────────────────────┐
            ▼                                                                ▼
┌───────────────────────────────┐                        ┌───────────────────────────────────────┐
│   Flask Web Application       │                        │   Next.js 15 Web Application (web/)   │
│   (app.py, templates/, static/)│                       │   (web/app/, web/components/, etc.)   │
│   - In-Memory Python Index    │                        │   - `npm run prepare-data` Ingestion  │
│   - Jinja2 Server-Side Render │                        │   - web/data/generated/*.json         │
│   - Real-time Substring Filter│                        │   - React 19 Server & Client Comps    │
│   - Autocomplete API          │                        │   - Institution Deep Dives & Compare  │
│   - Port 5000                 │                        │   - Port 3000                         │
└───────────────────────────────┘                        └───────────────────────────────────────┘
```

---

## 2. Complete Repository File Tree & Directory Structure

```
unstop-top/
├── .env.example                          # Template for environment configuration
├── .gitignore                            # Git ignore patterns (caches, env, data ignores)
├── config.py                             # Central configuration for paths, delays, retries & endpoints
├── requirements.txt                      # Python dependencies (flask, requests, python-dotenv, pytest)
├── README.md                             # Top-level overview and run instructions
├── PROJECT_CONTEXT.md                    # (This file) Complete technical documentation
├── app.py                                # Flask application & LeaderboardDataStore in-memory index
│
├── collector/                            # Python Batch Ingestion & ETL Package
│   ├── __init__.py                       # Package exports
│   ├── client.py                         # HTTP client with exponential backoff & rate-limiting logic
│   ├── parser.py                         # JSON response parsing & record extraction
│   ├── normalizer.py                     # Institutional name normalizer & relational builder
│   ├── storage.py                        # Disk I/O for raw page JSONs, processed CSVs & metadata
│   └── fetch_all.py                      # CLI runner for harvesting and dataset regeneration
│
├── data/                                 # Storage Tier
│   ├── raw/                              # Deterministic raw JSON snapshots (page_0001.json -> page_0114.json)
│   └── processed/                        # Relational CSV dataset & collection metadata
│       ├── teams.csv                     # 3,398 unique teams (ID, name, rank, score, finish time, etc.)
│       ├── players.csv                   # 11,394 player records (name, affiliation, player index)
│       ├── organizations.csv             # 1,350 unique organizations (canonical name, counts)
│       ├── team_organizations.csv        # Relational junction table mapping teams to institutions
│       └── collection_metadata.json      # Snapshot status, timestamps, record counts, error logs
│
├── templates/                            # Flask Jinja2 UI Templates
│   ├── base.html                         # Base HTML skeleton with Google Fonts & global layout
│   ├── index.html                        # Dashboard with metrics, search bar, chips & rankings table
│   └── team.html                         # Team profile with roster table & institution badges
│
├── static/                               # Flask Static Assets
│   ├── css/
│   │   └── style.css                     # Custom responsive dark/orange modern design system
│   └── js/
│       └── app.js                        # Debounced autocomplete search and keyboard navigation
│
├── tests/                                # Python Pytest Test Suite
│   ├── test_collector.py                 # Tests for HTTP client, retries, 429 backoff, and storage
│   ├── test_normalizer.py                # Tests for text canonicalization & entity relationship building
│   ├── test_parser.py                    # Tests for diverse payload structures & schema handling
│   └── test_routes.py                    # Flask route & search endpoint integration tests
│
└── web/                                  # Next.js 15 Production Frontend
    ├── package.json                      # Next.js, React 19, Lucide React, Tailwind dependencies
    ├── tsconfig.json                     # TypeScript strict configuration & path aliases (@/*)
    ├── next.config.ts                    # Next.js build configuration
    ├── tailwind.config.ts                # Tailwind CSS theme extension & design tokens
    ├── postcss.config.mjs                # PostCSS configuration
    ├── README.md                         # Documentation for the Next.js application
    │
    ├── data/generated/                   # Build-time JSON snapshots compiled from CSVs
    │   ├── metadata.json                 # Collection timestamp, total counts
    │   ├── teams.json                    # Array of all team records with embedded player arrays
    │   ├── organizations.json            # Array of all organizations with slug, counts & ranks
    │   └── organization-index.json       # Inverted index: normalized org slug -> array of team IDs
    │
    ├── scripts/
    │   └── prepare-data.ts               # Ingestion script converting CSVs -> data/generated/*.json
    │
    ├── lib/                              # Shared TypeScript Utilities & Business Logic
    │   ├── types.ts                      # Core interfaces (Team, Player, Organization, SearchResult)
    │   ├── normalize.ts                  # String canonicalization & URL slug generator
    │   ├── data.ts                       # Server-side cached data loader
    │   └── search.ts                     # In-memory search engine with exact/substring scoring
    │
    ├── components/                       # Reusable UI Components
    │   ├── header.tsx                    # Site header with active navigation tabs
    │   ├── footer.tsx                    # Footer with dataset stats & metadata
    │   ├── stat-card.tsx                 # Metric KPI cards
    │   ├── search-bar.tsx                # Debounced search bar with autocomplete dropdown
    │   ├── team-card.tsx                 # Mobile-first card view for team entries
    │   ├── team-table.tsx                # High-density desktop leaderboard table
    │   ├── team-members.tsx              # Player roster display with affiliation tags
    │   └── organization-results.tsx      # Paginated result view with table/card toggle
    │
    ├── app/                              # Next.js App Router
    │   ├── layout.tsx                    # Root HTML layout with Inter font, header, footer
    │   ├── page.tsx                      # Main dashboard explorer
    │   ├── leaderboard/page.tsx          # Full ranked leaderboard with pagination
    │   ├── organizations/page.tsx        # Directory of all 1,350+ institutions
    │   ├── organizations/[slug]/page.tsx # Institution deep dive (team rosters, stats, avg rank)
    │   ├── teams/[teamId]/page.tsx       # Individual team profile & submission audit
    │   ├── compare/page.tsx              # College comparison tool (side-by-side performance)
    │   ├── cross-college/page.tsx        # Cross-institutional team collaborations breakdown
    │   ├── api/search/route.ts           # Serverless search & autocomplete API
    │   ├── api/teams/[teamId]/route.ts   # Serverless team profile retrieval API
    │   ├── robots.ts                     # SEO robots rules
    │   └── sitemap.ts                    # Dynamic XML sitemap generator
    │
    └── tests/                            # TypeScript Jest / Vitest Suite
        ├── normalize.test.ts             # Normalization & slug verification
        └── search.test.ts                # Search accuracy & ranking logic tests
```

---

## 3. Dataset Specifications & Live Snapshot Status

The dataset captures the entire public leaderboard of the **Amazon ML Challenge 2024** (Unstop Challenge ID: `290344`).

### Current Snapshot Metrics (`data/processed/collection_metadata.json`):
- **Challenge ID**: `290344`
- **Competition Endpoint**: `https://unstop.com/api/public/live-leaderboard/290344/CodeContest`
- **Total API Pages**: 114 pages (30 items per page)
- **Harvesting Success Rate**: 114 / 114 pages (100%, 0 failed pages)
- **Total Submissions / Teams Indexed**: **3,398**
- **Total Individual Participants Indexed**: **11,394**
- **Unique Academic Organizations / Colleges**: **1,350**
- **Snapshot Status**: `COMPLETE`
- **Average Team Size**: ~3.35 members per team

---

## 4. Data Pipeline & Collector Engine Details

### 4.1. Network Client (`collector/client.py`)
- **Target URL**: `https://unstop.com/api/public/live-leaderboard/290344/CodeContest`
- **Query Parameters**:
  - `page`: 1-indexed page integer
  - `per_page`: Default `30`
  - `filterName`: `"timestamp"`
  - `filterValue`: `0`
  - `undefined`: `"true"`
- **Browser-Emulated Headers**: Custom `User-Agent`, `Referer: https://unstop.com/`, `Origin: https://unstop.com`, `Accept: application/json`.
- **Fault-Tolerance Mechanism**:
  - Catches HTTP `429 (Too Many Requests)`: Reads `Retry-After` header if provided, otherwise applies exponential backoff: `(backoff_factor ** attempt) + 1.0` seconds.
  - Catches HTTP `5xx` server errors & network timeouts: Retries up to `MAX_RETRIES` (default 3) with exponential backoff delay.
  - Custom exceptions: `UnstopAPIError`, `UnstopRateLimitError`.

### 4.2. Response Parser (`collector/parser.py`)
- Accommodates multiple Unstop response schemas (e.g., `{"data": [...]}` or nested `{"data": {"data": [...], "last_page": 114}}`).
- Extracts both top-level and nested pagination metadata (`current_page`, `last_page`, `total`, `per_page`).
- Normalizes team fields (`team_id`, `team_name`, `rank`, `score`, `finish_time`, `has_played`, `proctoring_score`, `is_blacklisted`).
- Robust player extraction: Handles both `"organisation"`, `"organization"`, and `"college"` key variations.

### 4.3. Normalizer & Relational Schema Builder (`collector/normalizer.py`)
- **Organization Canonicalization (`normalize_organization`)**:
  - Lowercases string and trims whitespace.
  - Standardizes Unicode quotes (`’`, `‘` -> `'`) and dashes (`–`, `—` -> `-`).
  - Collapses multiple whitespace characters to single spaces.
  - Strips trailing punctuation (`.`, `,`, `;`).
- **Relational Modeling**:
  - Splits single raw team objects with nested player arrays into 4 normalized relations:
    1. `teams`: Master team records with competitive scores and ranks.
    2. `players`: Individual participants linked to `team_id`.
    3. `organizations`: Unique institutions with aggregate team and player counts.
    4. `team_organizations`: Junction table mapping each team to every institution represented by its members.
  - **Cross-College Support**: A team composed of students from College A and College B will generate two junction entries, enabling the team to be discovered whether querying for College A or College B.

### 4.4. CLI Orchestrator (`collector/fetch_all.py`)
Command-line options:
- `python -m collector.fetch_all`: Standard full collection run.
- `--start-page <N>`: Resume collection from page N.
- `--max-pages <N>`: Limit harvesting to N pages for quick smoke testing.
- `--force`: Re-download existing raw pages from disk.
- `--regenerate-only`: Re-parse and recreate CSVs from local `data/raw/*.json` without making any network calls.
- `--delay <seconds>`: Set custom throttling delay between page requests (default 0.5s).

---

## 5. Processed Relational Data Schema

### 5.1. `data/processed/teams.csv`
| Column | Type | Description |
|---|---|---|
| `team_id` | String / BigInt | Unique identifier for the team on Unstop |
| `team_name` | String | Display name of the team |
| `rank` | Integer / String | Official ranking on leaderboard (1, 2, 3...) |
| `score` | Decimal / String | Final evaluation score (e.g. `0.812345`) |
| `finish_time` | String / Timestamp | Time of final leaderboard submission |
| `has_played` | Boolean / String | Whether the team made a qualifying submission |
| `proctoring_score`| Decimal / String | Automated proctoring evaluation metric |
| `is_blacklisted` | Boolean / String | Flag indicating disqualification / blacklist |

### 5.2. `data/processed/players.csv`
| Column | Type | Description |
|---|---|---|
| `team_id` | String / BigInt | Foreign key matching `teams.team_id` |
| `team_name` | String | Team name for denormalized reference |
| `player_name` | String | Participant name |
| `organization`| String | Raw registered college / university name |
| `player_index`| Integer | 0-indexed position within the team roster |

### 5.3. `data/processed/organizations.csv`
| Column | Type | Description |
|---|---|---|
| `organization` | String | Primary display name of the institution |
| `normalized_organization` | String | Lowercased canonical search key |
| `team_count` | Integer | Total number of teams representing this org |
| `player_count` | Integer | Total individual participants affiliated |

### 5.4. `data/processed/team_organizations.csv`
| Column | Type | Description |
|---|---|---|
| `team_id` | String / BigInt | Foreign key matching `teams.team_id` |
| `team_name` | String | Team name |
| `organization` | String | Institution name |
| `normalized_organization` | String | Canonical institution key for relational joins |

---

## 6. Flask Web Server (`app.py`)

The Flask application is designed for instant local development and inspection with zero external build steps:

### In-Memory Index Architecture (`LeaderboardDataStore`)
- Initialized on server boot: Reads `teams.csv`, `players.csv`, `organizations.csv`, and `team_organizations.csv` into memory.
- Constructs in-memory lookup hash tables:
  - `self.teams_by_id`: Instant O(1) team retrieval.
  - `self.org_to_team_ids`: Inverted index mapping `normalized_org -> Set[team_id]`.
  - `self.players_by_team`: Grouped rosters for team profiles.
- **Search Complexity**: Sub-millisecond substring scanning over canonical keys, eliminating database overhead.

### Flask Route Catalog
- `GET /`: Explorer home dashboard with metrics, search form, popular organization quick-chips, and paginated leaderboard.
- `GET /search?q=<query>&exact=<0|1>&page=<page>&per_page=<limit>`: Multi-condition organization filter.
- `GET /team/<team_id>`: Detailed team profile, score, status, and player roster.
- `GET /api/organizations?q=<query>&limit=<limit>`: JSON autocomplete endpoint.
- `GET /api/teams?q=<query>&exact=<0|1>&page=<page>&per_page=<limit>`: Headless JSON API for filtered teams.
- `GET /health`: Healthcheck endpoint reporting memory index stats and collection completion.

---

## 7. Next.js 15 Web Application (`web/`)

The Next.js 15 application provides a modern frontend:

### 7.1. Build-Time Data Preprocessing (`web/scripts/prepare-data.ts`)
Run `npm run prepare-data` in the `web/` directory. It reads the CSVs from `../data/processed/` and generates 4 optimized JSON artifacts in `web/data/generated/`:
1. `metadata.json`: High-level counts, timestamps, and challenge metadata.
2. `teams.json`: Array of all teams with embedded player rosters and linked organizations.
3. `organizations.json`: Complete organization directory with computed URL slugs, team counts, player counts, and best team rank.
4. `organization-index.json`: Slug-to-TeamID lookup table.

### 7.2. Next.js App Router Structure
1. `/` (`web/app/page.tsx`): Main dashboard featuring KPI metric cards, debounced live search, popular college pills, and leaderboard preview.
2. `/leaderboard` (`web/app/leaderboard/page.tsx`): Comprehensive paginated view of all 3,398 teams with ranking badges (Gold, Silver, Bronze for Top 3) and score formatting.
3. `/organizations` (`web/app/organizations/page.tsx`): Searchable directory of all 1,350+ institutions with sorting by team count, player count, or highest rank achieved.
4. `/organizations/[slug]` (`web/app/organizations/[slug]/page.tsx`): Dedicated institution profile page displaying college stats, average team score, best rank, and all associated team rosters.
5. `/teams/[teamId]` (`web/app/teams/[teamId]/page.tsx`): Detailed team profile showcasing rank, final score, submission finish time, disqualification status, and member roster with cross-college badges.
6. `/compare` (`web/app/compare/page.tsx`): Side-by-side college performance comparison matrix.
7. `/cross-college` (`web/app/cross-college/page.tsx`): Analytical report highlighting inter-institutional collaborative teams.
8. `/api/search` (`web/app/api/search/route.ts`): Serverless REST endpoint for instant queries.
9. `/api/teams/[teamId]` (`web/app/api/teams/[teamId]/route.ts`): Serverless REST endpoint for team profile data.

---

## 8. Configuration & Environment Variables (`config.py` & `.env`)

| Variable Name | Default Value | Description |
|---|---|---|
| `CHALLENGE_ID` | `290344` | Unstop competition challenge numeric ID |
| `COMPETITION_TYPE` | `CodeContest` | Unstop competition endpoint slug |
| `UNSTOP_API_URL` | `https://unstop.com/api/public/live-leaderboard/290344/CodeContest` | Base public API target |
| `DEFAULT_PER_PAGE` | `30` | API items per page during collection |
| `REQUEST_DELAY_SECONDS` | `0.5` | Throttling sleep duration between API calls |
| `MAX_RETRIES` | `3` | Maximum retry attempts per failed request |
| `BACKOFF_FACTOR` | `1.5` | Exponential backoff multiplier (`factor ** attempt`) |
| `TIMEOUT_SECONDS` | `15` | Network request timeout threshold |
| `HOST` | `127.0.0.1` | Host interface for the Flask server |
| `PORT` | `5000` | Port for the Flask server |
| `FLASK_DEBUG` | `False` | Flask debug/reloader flag |

---

## 9. Installation, Setup & Execution Commands

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm (for Next.js app)

### Step 1: Python Environment Setup & Dependencies
```bash
# In repository root:
python -m venv .venv
source .venv/bin/activate    # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Data Collection & ETL
```bash
# Run full batch collection from Unstop API:
python -m collector.fetch_all

# Re-generate CSVs from existing raw JSONs (offline):
python -m collector.fetch_all --regenerate-only
```

### Step 3: Run the Flask Web Application
```bash
python app.py
# Server running at: http://127.0.0.1:5000
```

### Step 4: Run the Next.js 15 Web Application
```bash
cd web
npm install
npm run prepare-data    # Compile CSVs to web/data/generated/*.json
npm run dev             # Start Next.js dev server at http://localhost:3000
```

### Step 5: Running Tests
```bash
# Run Python unit & integration test suite (22 tests):
python -m pytest -v

# Run Next.js test suite:
cd web
npm test
```

---

## 10. Key Insights & Competition Analytics

Based on the 3,398 collected submissions:
1. **Scale**: 11,394 participating engineers and students across 1,350 unique academic institutions across India and globally.
2. **Team Dynamics**: The vast majority of teams formed as trios or quads, with significant inter-college cross-collaboration occurring in the top percentiles.
3. **Institutional Distribution**: Leading engineering institutions (IITs, NITs, BITS, IIITs, state technical universities) represent substantial proportions of the top 100 leaderboard ranks.
4. **Offline Resilience**: The pipeline snapshots and normalizes the full dataset so analyses and institutional comparisons require zero live API dependency or network bandwidth.
