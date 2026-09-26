# Unstop ML Challenge Leaderboard Explorer (Next.js Application)

A modern, high-performance Next.js 15 web application with Tailwind CSS and TypeScript that presents the offline processed Unstop ML Challenge Leaderboard dataset.

The application operates completely offline without making any live scraping or batch collection requests to Unstop. It consumes pre-generated JSON snapshots generated from `../data/processed/*.csv`.

---

## Key Features

- **Blazing Fast In-Memory Search**: Search across 3,300+ teams and 1,300+ colleges instantly without external API calls.
- **Server Components by Default**: Zero bloated dataset payloads shipped to the client; search runs efficiently on the server.
- **Dynamic Organization Pages**: Shareable SEO-optimized routes for every institution (`/organizations/[slug]`).
- **Detailed Team Profiles**: View rank, score precision, submission finish times, and team member rosters (`/teams/[teamId]`).
- **Exact & Substring Matching**: Filter teams by broad institution keywords or exact college titles.
- **Multi-Institution Teams**: Teams with members from multiple universities correctly match searches for any of those institutions.
- **Responsive Layout**: Desktop table view and modern mobile-first card view with ranking badges.

---

## Directory Structure

```
web/
├── app/
│   ├── layout.tsx                    # Root layout with fonts, header, and footer
│   ├── page.tsx                      # Main explorer dashboard
│   ├── organizations/[slug]/page.tsx # SEO organization profile page
│   ├── teams/[teamId]/page.tsx       # Detailed team profile page
│   ├── api/search/route.ts           # Search & autocomplete API route
│   ├── api/teams/[teamId]/route.ts   # Team profile JSON API route
│   ├── robots.ts                     # SEO robots configuration
│   ├── sitemap.ts                    # Dynamic sitemap generator
│   └── globals.css                   # Global styles & theme tokens
│
├── components/
│   ├── header.tsx                    # Top navigation bar
│   ├── footer.tsx                    # Footer with dataset metadata
│   ├── stat-card.tsx                 # Metric KPI cards
│   ├── search-bar.tsx                # Debounced autocomplete search input
│   ├── team-card.tsx                 # Responsive team card
│   ├── team-table.tsx                # Data-dense leaderboard table
│   ├── team-members.tsx              # Player roster cards
│   └── organization-results.tsx      # Results container with view toggle & pagination
│
├── lib/
│   ├── types.ts                      # TypeScript data models
│   ├── normalize.ts                  # String normalization & slug generation
│   ├── data.ts                       # Server data loader
│   └── search.ts                     # Search engine & matching logic
│
├── scripts/
│   └── prepare-data.ts               # Ingests CSVs and builds generated JSON snapshots
│
├── tests/
│   ├── normalize.test.ts             # Normalization & slug tests
│   └── search.test.ts                # Search engine & data access tests
│
├── data/
│   └── generated/                    # Build-time JSON snapshots
│       ├── metadata.json
│       ├── organizations.json
│       ├── teams.json
│       └── organization-index.json
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Prepare Web Data Snapshot
When new batch data is collected via the Python collector, update the web data snapshot:
```bash
npm run prepare-data
```
This reads `../data/processed/*.csv` and generates optimized JSON files in `web/data/generated/`.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Unit Tests
```bash
npm test
```

### 5. Production Build
```bash
npm run build
npm start
```
