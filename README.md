# FieldPress 📰

> Autonomous Field Bureau, Dispatches, and Telemetry Platform for Independent Correspondents.

## What this is

FieldPress is a single-page web app (Vite + React) backed by Vercel serverless functions and a Neon Postgres database (via Drizzle). No monorepo, no separate API server, no shipped desktop client — see [`docs/architecture.md`](./docs/architecture.md) for the full breakdown, including what's been tried and reverted.

```
src/         React client (App.tsx, main.tsx) — no generated API client, direct fetch calls
api/         Vercel serverless functions (auth, dispatches, cohorts, blocks, reports, admin...)
lib/db/      Drizzle schema — source of truth for all app data
```

## Running FieldPress

```bash
cd ~/FieldPress
npm run dev        # Vite dev server
npm run build       # tsc && vite build
npm run typecheck   # tsc --noEmit
```

Requires a `DATABASE_URL` pointed at your Neon Postgres instance — see `.env.example`. **Never assume which database is live from a pasted connection string** — for production, confirm `DATABASE_URL` directly in the Vercel dashboard (Settings → Environment Variables).

---

## UI reference: Pressie Builder vs. Press Pass

Notes on a naming/endpoint fix so it doesn't regress:

### Endpoint separation
- **The issue** (historical): "Create Pressie" used to open the Press Pass Credential Editor by mistake — crossed endpoints, since a "Pressie" is a dispatch/news item, not the reporter ID badge.
- **The fix**:
  - **Create Pressie** (`openCreatePressie()`) → opens the **Pressie Builder** (`New Field Dispatch or Press Roll`).
  - **Press Pass** (`openPressPassEditor()`) → opened only via the **PRESS PASS: [callsign]** badge button (top-right utility bar) or Settings → Profile. Labeled **"Press Pass Credential & ID Studio"**, button **"Save Press Pass Credentials"**.

### Pressie Builder (Dispatch Composer) features
1. **Image Generation Prompt Box** — visual framing brief input, "Gen Visual" button with live rendering spinner, "Prompt from Title" shortcut, thematic preset tags (Rail Corridor, Power Grid, Dark Fiber, River Basin).
2. **Hybrid Generated Image Preview** — live cover preview with source tag (`AI Gen` vs `Field Upload`), "Active Cover" badge, "Detach Cover" button, verification caption input.
3. **Add Local / Capture Image Tray** — native upload/camera capture, image URL linking, multi-image evidence tray with thumbnails, cover selection, download, removal.
4. **Core Dispatch Controls** — headline + Beat Location with regional quick-snap (Danville, Lafayette, Covington, Catlin, Champaign-Urbana), category selector (Field Dispatch, Breaking Wire, Infrastructure, Civic Wire, Transit, Telecom, Editorial), story copy textarea with live counters, "Stage to Press Roll" (draft) / "Publish to Live Feed" (live).
