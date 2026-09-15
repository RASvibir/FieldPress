# Architecture

FieldPress is a **single web app**: a Vite + React client deployed to Vercel, backed by Vercel serverless functions and a Neon (Postgres) database via Drizzle. There is no monorepo, no separate API server, and no shipped desktop client. This doc reflects what is actually wired into the build as of 2026-09-15 — see "History" below for what was tried and reverted.

## Layers (live)

| Layer | Location | Job |
| --- | --- | --- |
| Web client | `src/` (`App.tsx`, `main.tsx`) — Vite + React, single file client, direct `fetch` calls, no generated API client | Newsroom UI: dispatches, cohorts, notifications, admin |
| API | `api/*.mjs` — Vercel serverless functions | Auth, dispatches, cohorts, blocks, reports, admin, notifications, uploads |
| Database | `lib/db/src/schema/*` — Drizzle schema, Neon Postgres | Source of truth for all app data |
| Build config | `vite.config.ts`, `tsconfig.json`, `vercel.json` | `vercel.json` builds via `vite build` → `dist/`; rewrites all non-`/api` routes to `index.html` (SPA) |

That's the whole live system. `npm run dev` runs Vite locally; `npm run build` runs `tsc && vite build`.

## Not live — orphaned scaffolding from past pivots

These exist or existed in the repo but are **not referenced by any build config, tsconfig, or import** and should not be treated as part of the architecture:

- **`packages/domain`, `packages/audio`, `packages/archive`, `packages/config`, `lib/api-zod`, `lib/api-client-react`, `lib/fieldpress-pro`** — introduced in the `v2.4.0 modularization` commit (2026-09-12 14:59) as an attempt at a proper monorepo split. Reverted ~70 minutes later in `e4b0e7e` ("lock in clean web client..."), which stripped the `tsconfig.json` project references but left the directories behind. Removed from the tree in the 2026-09-15 cleanup; source is recoverable from git tag `archive/pre-dead-code-removal-20260915-0903` if ever needed.
- **`src-tauri/`** — a Tauri desktop shell, last touched 2026-08-30. Not referenced by `package.json` or any script. No desktop build is currently shipped.
- **`apps/`, `infra/docker/`** — placeholder directories (each containing only a `README.md`) from a planned-but-never-executed physical reorg. Contain no code.
- **`artifacts/api-server`, `artifacts/fieldpress-desktop`** — referenced in older docs but deleted from the repo in `e4b0e7e`. If you see these paths mentioned anywhere (including old docs, memory, or prior chat sessions), they no longer exist.

If you're starting a new session and see any of the above imported or referenced, treat that as a regression, not the intended architecture — re-check this file's date against `git log -1 -- docs/architecture.md` before trusting it.

## Deployment

- **Production:** `fieldpress.studio`, deployed via Vercel on push to `main`. `DATABASE_URL` in Vercel's Production environment is the single source of truth for which Neon database is live — verify directly in the Vercel dashboard if ever in doubt, do not infer it from a pasted connection string.
- **Preview:** standard Vercel preview URLs per branch/PR.
- Local Postgres via `docker-compose.yml` / `Dockerfile` at repo root (not yet moved into `infra/docker/`, despite that folder existing).

## History

- **2026-09-02** — "Establish web-first workspace packages" commit added `packages/`, `apps/`, `infra/` scaffolding for a planned monorepo split. Never fully wired in.
- **2026-09-12 14:59** — `v2.4.0 modularization` commit added `lib/api-zod`, `lib/api-client-react`, and wired everything into `tsconfig.json` project references, plus an `artifacts/api-server` split.
- **2026-09-12 16:10** — `e4b0e7e` reverted the split ~70 min later: deleted `artifacts/api-server`, stripped the tsconfig references, returned to a single web client. Left orphaned package directories in place.
- **2026-09-15** — Orphaned directories removed from the tree; this doc rewritten to match actual current state.
