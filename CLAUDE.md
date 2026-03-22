# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A family score management system (成长积分宝) - a web app for parents to track children's behavior through a points-based reward system. Built with React + TypeScript + Supabase, deployed to GitHub Pages.

**Project URL**: https://github.com/2415104901/grow-score
**Live Site**: https://2415104901.github.io/grow-score/
**Language**: Primary UI and documentation are in Chinese

## Development Commands

```bash
# Install dependencies
cd frontend && npm install

# Start dev server (runs on http://localhost:5173/grow-score/)
# NOTE: Routes use /grow-score/ basename - access via http://localhost:5173/grow-score/
npm run dev

# Build for production
npm run build

# Preview production build (serves dist/ at http://localhost:4173/grow-score/)
npm run preview

# Lint code
npm run lint

# Direct database queries (requires Supabase CLI linked to project)
npx -y supabase db query --linked "SELECT * FROM rules;"
```

**Note**: This project has no test suite currently. When adding tests, add test scripts to `package.json`.

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
├── openspec/              # OpenSpec change management
│   ├── changes/           # Active changes (proposal, specs, design, tasks)
│   ├── archive/           # Completed changes (YYYY-MM-DD--name format)
│   └── config.yaml        # OpenSpec configuration
├── .github/
│   ├── workflows/         # CI/CD (GitHub Pages deployment)
│   ├── skills/            # OpenSpec skills (opsx:* commands)
│   └── prompts/           # OpenSpec prompt templates
├── docs/                  # Project documentation
│   ├── REQUIREMENTS.md    # Frozen requirements (Chinese)
│   └── PRP.md             # Product Requirements Plan (Chinese)
└── dist/                  # Build output (not committed)
```

### OpenSpec Workflow

This project uses OpenSpec for change management. Key commands:
- `/opsx:new <name>` - Start a new change (step-by-step)
- `/opsx:ff <name>` - Fast-forward: create all artifacts at once
- `/opsx:continue <name>` - Continue working on existing change
- `/opsx:apply <name>` - Implement tasks from a change
- `/opsx:verify <name>` - Verify implementation matches artifacts
- `/opsx:archive <name>` - Archive completed change
- `/opsx:explore` - Think through problems before implementing

Changes live in `openspec/changes/<name>/` with artifacts:
- `proposal.md` - Why we're making the change
- `specs/` - What we're building (requirements/scenarios)
- `design.md` - How we'll build it
- `tasks.md` - Implementation checklist

See `.github/skills/openspec-onboard/SKILL.md` for guided onboarding.

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

**Base URL**: `/grow-score/` (configured in both `vite.config.ts` and `main.tsx` BrowserRouter)

**Local development**: Access at `http://localhost:5173/grow-score/` - the basename is required locally too.

### Version Management

Update version in `frontend/src/version.ts` only:
```typescript
export const APP_VERSION = '0.1.1'
```

This automatically updates:
- Page title (set in `main.tsx`)
- Header display (in `AppLayout.tsx`)

## Documentation

- `docs/REQUIREMENTS.md` - Frozen requirements document (需求文档) with functional specs, security requirements, and acceptance criteria
- `docs/PRP.md` - Product Requirements Plan (产品需求规划) with feature definitions, technical architecture, and MVP scope

Both documents are in Chinese and serve as the source of truth for feature requirements.

## Important Notes

- **AI-generated code**: When AI generates code that is committed, add `// AI Generated` marker at the beginning of the file or significant code blocks for tracking purposes.
- **Git commits**: All commits created by AI MUST include `[AI Generated]` prefix in the commit message for tracking purposes.
- **Environment variables**: Never commit `.env.local` files. Use `VITE_` prefix for client-side vars.
- **Records immutability**: Never add UPDATE/DELETE policies on `records`. Use `correction_of` field for corrections (planned for Phase 2).
- **Date handling**: Records use local dates (yyyy-MM-dd format), not timestamps. `date <= CURRENT_DATE` is enforced at DB level.
- **Client-side aggregation**: Monthly score aggregation happens in `fetchMonthlyScores()` client-side.
- **Routing basename**: All routes use `/grow-score/` basename - this is critical for both local dev and production.

## GitHub Skills and Prompts

The `.github/skills/` and `.github/prompts/` directories contain OpenSpec workflow automation:
- Skills are invoked via `/opsx:*` commands (e.g., `/opsx:new`, `/opsx:apply`)
- Prompts provide templates for different workflow phases
- These integrate with the OpenSpec CLI for change management
