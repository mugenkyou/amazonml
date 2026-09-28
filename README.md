# Amazon ML Challenge Explorer 🚀

A modern, high-performance web application and historical archive for the **Amazon ML Challenge 2026** competition.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and backed by **Supabase PostgreSQL**.

---

## 🌟 Overview & Architecture

Amazon ML Challenge Explorer provides interactive analytics, historical timeline replays, and deep organizational breakdowns for over 10,900+ teams, 36,000+ participants, and 2,500+ colleges across 35 competition snapshots.

```
                    ┌─────────────────────────┐
                    │  Historical Source Data │
                    │ (data/processed/ & CSV) │
                    └────────────┬────────────┘
                                 │
                     [One-Time Import Script]
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Supabase PostgreSQL   │
                    │  (Relational Database)  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Next.js 15 App Server │
                    │   (Server Components &  │
                    │   Optimized In-Memory)  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Web Browser Client    │
                    │  (Fast, Zero Bloat UI)  │
                    └─────────────────────────┘
```

> **Security Guarantee:** The browser client communicates strictly with the Next.js server layer. Supabase credentials (including the privileged service-role key) never reach client bundles.

---

## ✨ Features

- **🏆 Canonical Leaderboard**: Full final standings across 10,942 teams with search, filtering, and pagination.
- **🏛️ Colleges & Universities Directory**: Dedicated institutional pages (`/colleges/[slug]`) and rankings by medal counts, average team scores, and participation volume.
- **⚡ Historical Timeline & Race Replay**: Dynamic race chart tracking Top 50 rank movement and score progression across all 35 snapshots.
- **🤝 Inter-College Teams Explorer**: Deep analytics on cross-institutional collaborative teams.
- **👩 Women in Tech / All-Women Teams**: Dedicated filtering and spotlights for women-led machine learning teams.
- **📊 Competition Analytics**: In-depth score distributions, submission timelines, and drop-off analytics.
- **🔍 Sub-millisecond Search**: Fast server-side debounced search matching team names, player rosters, and college aliases.

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js >= 18.18.0
- npm or pnpm
- (Optional) Python 3.10+ for diagnostic validation scripts

### 2. Installation

```bash
npm install
```

### 3. Environment Configuration

Copy the sample configuration:

```bash
cp .env.example .env.local
```

Set your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Database Setup & One-Time Migration

The Supabase database schema is defined in `supabase/schema.sql`.

1. Run the SQL schema in the **Supabase SQL Editor**:
   - `supabase/schema.sql` (Creates tables, indexes, constraints, RLS policies, and views)
2. Execute the one-time data import script:

```bash
# TypeScript import:
npx tsx scripts/import_to_supabase.ts

# Or Python import:
python scripts/import_to_supabase.py
```

3. Validate the database integrity:
   - Run `supabase/validation.sql` in the Supabase SQL editor.

### 5. Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Production Build & Verification

```bash
# Prepare dataset snapshots and build optimized Next.js bundle
npm run build

# Run unit and integration tests
npm run test

# Type-check TypeScript
npm run typecheck

# Lint codebase
npm run lint

# Start production server
npm run start
```

---

## 📁 Repository Structure

```
├── app/                  # Next.js App Router pages and API routes
│   ├── colleges/         # College hubs and dynamic [slug] routes
│   ├── leaderboard/      # Standings, inter-college, women-teams
│   ├── teams/[teamId]/   # Team profiles & snapshot timeline
│   ├── statistics/       # Competition analytics & distributions
│   ├── race-test/        # Interactive leaderboard race
│   └── api/              # Server-side API endpoints
├── components/           # UI components (tables, charts, navigation)
├── lib/                  # Server data loaders, normalization, SEO, Supabase client
├── public/               # Static assets, branding, and icons
├── data/                 # Processed dataset and generated JSON snapshots
│   ├── processed/        # Master CSV source data
│   ├── generated/        # Precomputed JSON caches
│   └── history/          # Historical team observation snapshots
├── supabase/             # Database schema, validation queries, and README
├── scripts/              # Data preparation, import, and audit scripts
├── tests/                # Vitest test suites
├── package.json          # Node dependencies & scripts
├── next.config.ts        # Next.js build configuration
└── tailwind.config.ts    # Tailwind styling tokens
```

---

## 🔒 Security & Privacy

- **Row Level Security (RLS)** is enforced across all tables in Supabase.
- **Service Role Key** is restricted to server-side environments and migration utilities.
- **Bulk Data Protection**: No unrestricted public full-database dumps are exposed to clients.

---

## 📄 License

MIT License — Amazon ML Challenge 2026 Historical Archive.
