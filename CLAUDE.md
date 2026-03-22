# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A family score management system (成长积分宝) - a web app for parents to track children's behavior through a points-based reward system. Built with React + TypeScript + Supabase, deployed to GitHub Pages.

**Project URL**: https://github.com/2415104901/grow-score
**Live Site**: https://2415104901.github.io/grow-score/

## Development Commands

```bash
# Install dependencies
cd frontend && npm install

# Start dev server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Database operations (via npx)
npx -y supabase db query --linked "SELECT * FROM rules;"
npx -y supabase db query --linked -f path/to/file.sql
```

## Architecture

### Tech Stack
- **Frontend**: React 19, TypeScript, React Router v7, Vite
- **UI**: TailwindCSS v4
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **State**: TanStack Query v5 for server state
- **Deployment**: GitHub Pages via GitHub Actions

### Project Structure

```
grow-score/
├── frontend/              # React frontend
│   └── src/
│       ├── components/    # UI components organized by domain
│       │   ├── auth/      # Auth guards, login form
│       │   ├── calendar/  # Month calendar, day cells
│       │   ├── children/  # Child cards, forms
│       │   ├── layout/    # AppLayout (header, nav)
│       │   ├── records/   # Timeline, quick score panel
│       │   └── rules/     # Rule list, form
│       ├── hooks/         # useAuth, useChildren, useRecords, useRules
│       ├── pages/         # Route components
│       ├── services/      # Supabase API calls (auth, children, records, rules)
│       ├── types/         # TypeScript types (mirrors DB schema)
│       ├── lib/           # Supabase client
│       ├── version.ts     # App version (single source of truth)
│       └── main.tsx       # Entry point
├── supabase/
│   └── migrations/        # Database schema migrations
├── .github/workflows/     # CI/CD (GitHub Pages deployment)
└── dist/                  # Build output (not committed)
```

### Data Model

**Tables**:
- `children` - Child profiles (name, is_active)
- `profiles` - Extends Supabase Auth with role (parent/child) and child_id binding
- `rules` - Point rules (name, score: ±int, is_active)
- `records` - Immutable score events with snapshots (rule_name_snapshot, score_snapshot, date)

**Key Constraints**:
- `records` is immutable (no UPDATE/DELETE policies)
- `records.date` cannot be in the future
- Child role requires child_id; parent role must have null child_id
- RLS policies enforce: parents read all, children read only their bound data

### Authentication & Authorization

Two roles via `profiles.role`:
- **parent** - Can manage children, rules, and records
- **child** - Read-only access to own data (bound via `profiles.child_id`)

Auth flow:
1. Supabase Auth (`auth.users`) stores credentials
2. `profiles` table extends auth with role and child binding
3. `useAuth()` hook provides current user + role
4. `AuthGuard` component wraps protected routes
5. `ParentOnlyGuard` restricts parent-only pages

**Important**: Creating new users requires Supabase Admin API (no INSERT policy on `profiles`). Profiles are created manually via Dashboard or service_role.

### Route Structure

```
/login                  - Public login page
/                       - RoleRedirect (parent→/home, child→/child/:id/calendar)
/home                   - Parent dashboard (child cards with total scores)
/child/:id/calendar     - Monthly calendar view (parent + child)
/child/:id/day/:date    - Daily records detail
/rules                  - Manage rules (parent only)
/children               - Manage children (parent only)
```

### Services Layer

All database calls go through `services/*.ts`:
- `auth.ts` - signIn, signOut
- `children.ts` - fetchChildren, fetchChildWithScore
- `rules.ts` - fetchRules, createRule, updateRule, deleteRule
- `records.ts` - insertRecords, fetchDayRecords, fetchMonthlyScores

Services throw `PermissionError` (from `types/index.ts`) when RLS rejects access.

### State Management

TanStack Query caches server state:
- `useAuth()` - Auth state + user profile
- `useChildren()` - All children with scores
- `useRules()` - Active rules
- `useRecords()` - Records for specific date/month

Queries automatically refetch on relevant mutations (via `queryClient.invalidateQueries`).

## Deployment

### GitHub Pages

Builds on push to `main` or `001-family-score-system` branches.

**Required Secrets** (Repository secrets):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon/public key

**Build process**:
1. GitHub Actions runs `.github/workflows/deploy.yml`
2. Installs dependencies in `frontend/`
3. Builds with `npm run build` (outputs to `../dist`)
4. Deploys `dist/` to GitHub Pages

**Base URL**: `/grow-score/` (configured in `vite.config.ts`)

### Version Management

Update version in `frontend/src/version.ts` only:
```typescript
export const APP_VERSION = '0.1.1'
```

This automatically updates:
- Page title (set in `main.tsx`)
- Header display (in `AppLayout.tsx`)

## Database Migrations

Place new migrations in `supabase/migrations/` with sequential numbering:
```
001_initial_schema.sql
002_rls_policies.sql
003_insert_rules.sql
```

Apply migration:
```bash
npx -y supabase db query --linked -f supabase/migrations/003_xxx.sql
```

## Important Notes

- **AI-generated code**: When AI generates code that is committed, add `// AI Generated` at the beginning of the file or significant code blocks for tracking purposes.
- **Environment variables**: Never commit `.env.local` files. Use `VITE_` prefix for client-side vars.
- **RLS debugging**: If queries return empty data, check `supabase/migrations/002_rls_policies.sql` for policy conditions.
- **Records immutability**: Never add UPDATE/DELETE policies on `records`. Use `correction_of` field for Phase 2 corrections.
- **Date handling**: Records use local dates (yyyy-MM-dd format), not timestamps. `date <= CURRENT_DATE` is enforced at DB level.
- **Client-side aggregation**: Monthly score aggregation happens in `fetchMonthlyScores()` (client-side) to avoid PostgreSQL RPC complexity.
