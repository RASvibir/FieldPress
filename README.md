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
1. **Photos via imbrgr** — FieldPress does not generate or filter images in-app. Use **imbrgr** for visuals, then paste a direct HTTPS image URL or return via the compose deep link below.
2. **Media tray** — native upload/camera capture, image URL linking, multi-image evidence tray with thumbnails, cover selection, download, removal.
3. **Core dispatch controls** — headline, filing location (default from `AUTHOR_DEFAULT_FILING` in `src/config/site.ts`), category, story copy, stage to Press Roll / publish to live feed.
4. **Pressy'O** — journalism assistant (draft, headline, lede, tighten, structure, attribution, AP polish). No in-app image prompts.

## imbrgr ↔ FieldPress link contract

Config: `IMBRGR_URL` in `src/config/site.ts` (default `https://imbrgr.vercel.app`).

**FieldPress → imbrgr** (prefill generate tab from dispatch copy):

```
https://imbrgr.vercel.app/studio?tab=generate&prompt=<url-encoded text>
```

Built in-app via `buildImbrgrStudioUrl()` (`src/lib/composeLinks.ts`).

**imbrgr → FieldPress** (resume compose with image by URL — no re-upload, render with `<img>` only):

```
https://fieldpress.studio/?compose=1&image=<url-encoded https URL>&title=<url-encoded title>
```

- `image` must be HTTPS on allowed hosts (e.g. `imbrgr.vercel.app`, or imbrgr `/api/media/file/...` URLs).
- FieldPress does **not** fetch the image into canvas (avoids CORS/taint). If the user is signed out, params are stored in `sessionStorage` and applied after login.

Parsed by `parseComposeImageParam()` / `parseComposeTitleParam()` in `src/lib/composeLinks.ts`.
