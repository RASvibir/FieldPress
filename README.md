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

**FieldPress → imbrgr** (simple link, no draft):

```
https://imbrgr.vercel.app/studio?tab=generate&prompt=<url-encoded text>
```

**FieldPress → imbrgr** (Create image from Post — draft is saved first):

```
https://imbrgr.vercel.app/studio?tab=generate&prompt=<url-encoded>&from=fieldpress&draft=<draftId>
```

Built via `buildImbrgrCreateImageUrl()` / `buildImbrgrStudioUrl()` in `src/lib/composeLinks.ts`.

**imbrgr → FieldPress** (return to the same draft when possible):

```
https://fieldpress.studio/?compose=1&draft=<draftId>&image=<url-encoded https URL>&title=<optional>
```

Legacy (no draft id — opens a new Post prefilled):

```
https://fieldpress.studio/?compose=1&image=<url-encoded https URL>&title=<url-encoded title>
```

- `draft` must match `^[A-Za-z0-9][A-Za-z0-9._-]{7,127}$` and belong to the signed-in user; otherwise FieldPress opens a fresh Post with `image` / `title` only.
- `image` must be HTTPS on allowed hosts (e.g. `imbrgr.vercel.app`, or imbrgr `/api/media/file/...` URLs).
- FieldPress does **not** fetch the image into canvas (avoids CORS/taint). Params are stored in `sessionStorage` through sign-in when needed.
- On success with a valid draft: reopen that draft, set cover if empty else append photo, toast “Image added”.

Parsed by `parseComposeDraftParam()`, `parseComposeImageParam()`, and `parseComposeTitleParam()` in `src/lib/composeLinks.ts`.
