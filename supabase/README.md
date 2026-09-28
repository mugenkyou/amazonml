# Supabase PostgreSQL Architecture & One-Time Migration

This directory contains the database schema, validation checks, and operational documentation for the Amazon ML Challenge 2026 Historical Archive.

---

## 1. Overview & Architecture

The historical competition dataset is stored permanently in Supabase PostgreSQL as an immutable archive. 

```
Historical Dataset Snapshot (Raw & Normalized)
                   ↓
   One-Time Migration Script (import_to_supabase)
                   ↓
        Supabase PostgreSQL Database
                   ↓
 Next.js Server Components / Data Layer (Server-Side)
                   ↓
           Final Web Application
```

### Key Security Principles:
- **No Direct Browser Access**: The client browser never communicates directly with Supabase. All data requests flow through server-side Next.js components and route handlers.
- **Service-Role Key Isolation**: The privileged `SUPABASE_SERVICE_ROLE_KEY` is restricted strictly to server-side code and is NEVER bundled or exposed in client JavaScript.
- **Row Level Security (RLS)**: Enabled on all tables with explicit read-only policies.
- **No Recurring Sync**: There are no background collectors, hourly sync tasks, cron jobs, or GitHub Actions sync workflows. The dataset is final and permanent.

---

## 2. Database Tables & Entity Relationships

| Table | Description | Primary Key | Unique Constraints |
| :--- | :--- | :--- | :--- |
| **`organizations`** | Academic institutions and colleges | `id` (BIGSERIAL) | `organization_key`, `slug` |
| **`teams`** | Participating teams (`record.team.id`) | `id` (BIGSERIAL) | `team_id` (Canonical) |
| **`players`** | Registered students & participants | `id` (BIGSERIAL) | `player_key` (`team_id:index:name`) |
| **`team_organizations`** | Team-to-Institution affiliations | `id` (BIGSERIAL) | `(team_id, organization_id)` |
| **`leaderboard_snapshots`** | Preserved snapshot timeline captures | `id` (BIGSERIAL) | `snapshot_key` |
| **`team_snapshot_scores`** | Historical rank & score observations | `id` (BIGSERIAL) | `(team_id, snapshot_id)` |

---

## 3. Environment Variables Configuration

Configure your environment variables in `.env.local` (or server environment settings):

```env
# Supabase Project Credentials
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-secret-key>

# Competition Metadata
CHALLENGE_ID=290344
COMPETITION_TYPE=CodeContest
```

> **IMPORTANT**: Never commit `.env.local` or include real secret keys in version control.

---

## 4. Setup & Migration Guide

### Step 1: Initialize Database Schema
Execute [`schema.sql`](file:///c:/Users/Sachi/Documents/GITHUB/mugenkyou/unstop-top/Final/supabase/schema.sql) in the Supabase SQL Editor:
- Creates tables, primary keys, foreign keys, and indexes.
- Configures Row Level Security (RLS) policies.

### Step 2: Run One-Time Dataset Import
Run the migration script to populate all historical tables:

```bash
# Using TypeScript runner:
npx tsx scripts/import_to_supabase.ts

# Or using Python:
python scripts/import_to_supabase.py
```

### Step 3: Run Database Integrity Validations
Execute [`validation.sql`](file:///c:/Users/Sachi/Documents/GITHUB/mugenkyou/unstop-top/Final/supabase/validation.sql) to confirm all 10 integrity checks pass with 0 errors.

---

## 5. Database Backup & Disaster Recovery

To generate a full SQL dump backup of the database:

```bash
# Using Supabase CLI:
supabase db dump -f supabase_backup_$(date +%Y%m%d).sql

# Or using pg_dump:
pg_dump "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" > backup.sql
```
