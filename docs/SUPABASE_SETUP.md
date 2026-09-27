# Supabase Live Data Architecture Setup Guide

This guide details how to configure, migrate, and operate the **Amazon ML Challenge 2026 Explorer** with **Supabase PostgreSQL** as the persistent live-data layer.

---

## 🎯 Architecture Overview

```
Amazon Leaderboard API
        ↓
 Python collector (sync_data.py / run_sync_loop.py)
        ↓
 Validation & Safety Thresholds
        ↓
 Supabase PostgreSQL (teams, players, organizations, snapshots)
        ↓
 Next.js Server Components & Data Access Layer
        ↓
 Live Vercel Website (Zero Redeployments Needed for Data Updates!)
```

---

## 🚀 Step-by-Step Setup

### Step 1: Create a Supabase Project
1. Log in to [Supabase Dashboard](https://database.new) and create a new project (e.g., `amazonml-leaderboard`).
2. Select your closest region (e.g. `ap-south-1` Mumbai / `us-east-1`).
3. Note your database password.

---

### Step 2: Retrieve API Keys & Connection URL
In your Supabase project dashboard, navigate to **Project Settings** → **API**:
- **Project URL**: `https://<project-ref>.supabase.co`
- **`anon` `public` key**: Used for public client/browser requests.
- **`service_role` `secret` key**: **CRITICAL PRIVILEGED KEY** used ONLY by the Python collector and trusted server environments. **NEVER expose this key to browser bundles or public git repos!**

---

### Step 3: Run Database Migrations
In the Supabase Dashboard, go to **SQL Editor** → **New Query**, and execute the migration files in numerical order:

1. **`supabase/migrations/001_initial_schema.sql`**: Creates tables (`teams`, `organizations`, `players`, `team_organizations`, `leaderboard_snapshots`, `team_snapshot_scores`, `sync_runs`).
2. **`supabase/migrations/002_indexes.sql`**: Builds high-performance indexes for ranking, searching, and delta queries.
3. **`supabase/migrations/003_rls.sql`**: Configures Row Level Security (RLS) permitting public `SELECT` and restricting `INSERT/UPDATE/DELETE` strictly to `service_role`.

*(Or use Supabase CLI: `supabase db push`)*

---

### Step 4: Configure Local Environment Variables
Create or update `.env` in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Collector Settings
CHALLENGE_ID=290344
COMPETITION_TYPE=CodeContest
DEFAULT_PER_PAGE=30
REQUEST_DELAY_SECONDS=0.5
```

And in `web/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Step 5: Run Data Migration (Local -> Supabase)
To import all existing historical records, organizations, participants, and standings into Supabase:

```bash
# 1. Validate data first (dry-run mode)
python scripts/migrate_to_supabase.py --dry-run

# 2. Execute live migration to Supabase
python scripts/migrate_to_supabase.py
```

---

### Step 6: Test Single Live Fetch & Sync
Run a live collection cycle from Unstop API directly into Supabase:

```bash
python sync_data.py
```

---

### Step 7: Start Next.js Development Server
```bash
cd web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to verify live standings, team profiles, and college leaderboards.

---

### Step 8: Operational Mode — Run 6-Hour Background Sync Loop
To keep the leaderboard updated continuously for 6 hours (syncing every 10 minutes without making Git commits or triggering Vercel rebuilds):

```bash
python scripts/run_sync_loop.py --interval 600 --duration 21600
```

* To stop at any time: Press `Ctrl+C`.
* To run for 1 hour with 5-minute intervals: `python scripts/run_sync_loop.py --interval 300 --duration 3600`.

---

## 🔒 Security Best Practices

1. **`SUPABASE_SERVICE_ROLE_KEY`** has full admin access to bypass RLS.
   - ONLY use it in Python collector scripts or server-side API routes.
   - NEVER prefix with `NEXT_PUBLIC_`.
   - Ensure `.env` and `.env.local` are listed in `.gitignore`.
2. **Browser Client**:
   - `web/lib/supabase/client.ts` strictly uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` which is safe for client components.

---

## ⚙️ Automated GitHub Actions Syncing (Optional)

To enable scheduled background syncing directly on GitHub Actions:
1. In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions**.
2. Add repository secrets:
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
3. The workflow runs the collector on a schedule without committing JSON files or triggering Vercel redeployments.
