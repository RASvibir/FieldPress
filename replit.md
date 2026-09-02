# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   ├── fieldpress/         # Expo mobile app
│   └── fieldpress-desktop/ # React+Vite desktop editor
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers
  - `health.ts` — `GET /api/healthz`
  - `stories.ts` — `GET/POST /api/stories`, `GET/DELETE /api/stories/:storyId`, `POST /api/stories/import`
  - `items.ts` — `POST /api/stories/:storyId/items`, `DELETE /api/stories/:storyId/items/:itemId`
  - `drafts.ts` — CRUD for `/api/stories/:storyId/drafts` and `/api/stories/:storyId/drafts/:draftId`
  - `dashboard.ts` — `GET /api/dashboard` (aggregated stats)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/stories.ts` — `storiesTable`, `storyItemsTable`, `draftsTable` with insert schemas
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`, `CreateStoryBody`, `ListStoriesQueryParams`). Used by `api-server` for request validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useListStories`, `useGetStory`, `useCreateStory`, `useImportStory`, `useGetDashboard`, `useCreateDraft`, `useUpdateDraft`).

### `artifacts/fieldpress`

Retired. Not a workspace package. The product client is `artifacts/fieldpress-desktop`.

### `artifacts/fieldpress-desktop` (`@workspace/fieldpress-desktop`)

React+Vite desktop editing platform for journalists. CRT/cyberpunk theme matching the mobile app.

- **Preview path:** `/fieldpress-desktop/`
- **Pages (wouter routing):**
  - `/` — Dashboard: stats overview, active story cards, NEW STORY + IMPORT buttons
  - `/story/:storyId` — Story detail: source material (notes/audio/photos) + production outputs (drafts)
  - `/story/:storyId/editor/:draftId` — Full editor with left source panel, title, content textarea, auto-save
- **Three output modes:**
  - Article: publication-ready journalism (headline/byline/dateline/lede/body/kicker template)
  - Social: threads/captions/TikTok scripts (thread format and caption format templates)
  - Podcast: scripts/show notes/timestamps (cold open/intro/segments/outro/show notes template)
- **Import:** Paste-based import dialog parses mobile dispatch text (first line = title, rest = notes)
- **Cloud sync:** All data persisted in PostgreSQL via API server
- **Auto-save:** Editor auto-saves drafts 1.5s after last keystroke
- **Theme:** CRT scanlines, neon green glow, VT323 font, black background — matches mobile app identity
- **Depends on:** `@workspace/api-client-react` for API hooks

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
