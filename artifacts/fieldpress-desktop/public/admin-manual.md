# FieldPress operator manual

Private desk book for the owner. Not public help copy. Do not link this from the launch screen, the user guide, social posts, or README. Print it or keep this file next to `.env`.

Public user guide (reporters): `/guide` and `/user-manual.html`  
This operator book (unlisted): `/admin`, `/admin-manual.html`, `/admin-manual.md`  
Live newsroom: https://fieldpress-dusky.vercel.app

## Contents

1. What this product is
2. Map of surfaces
3. First-run setup
4. Daily desk
5. How to write notes that produce
6. Trend desk and AI Produce
7. Edit, templates, and distribute
8. Phone / Expo field app
9. API map
10. Data model
11. Environment variables
12. Local, Docker, Vercel
13. When it breaks
14. Before you publish
15. Do not

## 1. What this product is

FieldPress is a pocket newsroom. Capture in the field, then produce three outputs with Gemini: article, social, podcast. Produce pulls live public headlines (related, national, global, plus what the public is looking up) so drafts can land. Field notes remain the only source of original facts.

- Public surface: Open / Install / Copy link / QR, plus `/guide`.
- Newsroom: `/app` — stories, produce, edit, distribute. Public **GUIDE** only.
- This operator manual: unlisted. Bookmark it. Search engines are told to skip it.

## 2. Map of surfaces

| Place | URL | Job |
| --- | --- | --- |
| Launch | `/` | Open app, install PWA, copy link, QR. |
| User guide | `/guide` · `/user-manual.html` | Public. How reporters use the newsroom. |
| Newsroom | `/app` | Story list, new story, import. |
| Story | `/story/:id` | Notes, AI Produce, Trend Desk, drafts, distribute. |
| Editor | `/story/:id/editor/:draftId` | Autosave, insert notes or hooks, distribute one draft. |
| Operator manual | `/admin` · `/admin-manual.html` | Unlisted. Keys, env, API, deploy. Download HTML or Markdown. |
| Health | `/api/healthz` | Must return 200. |

Local UI: Vite `http://localhost:5173` (proxies `/api` to 3000). Packaged: `http://localhost:3000`.

## 3. First-run setup

1. Node 24+ and pnpm. `pnpm install`.
2. Copy `.env.example` to `.env`. Fill Neon URLs and `GEMINI_API_KEY`. Never commit `.env`.
3. `pnpm db:push` if tables are missing.
4. `pnpm dev` or `pnpm start`.
5. Confirm `GET /api/healthz` and `GET /api/dashboard`.
6. On Vercel, set the same env names, then redeploy.
7. Deploy: `vercel deploy --prod --yes --scope tuffputer`.

## 4. Daily desk

1. Open the newsroom.
2. **NEW STORY** with a specific headline (search seed for public trends).
3. Add notes: scenes, attributable quotes, times, places, unknowns.
4. Optional **IMPORT**: first line title, later lines notes.
5. **AI PRODUCE** (10–40s). Overwrites article / social / podcast drafts.
6. Read **Trend Desk** (Why now, audience, three-scale hooks). Assignment notes, not witnessed facts. Browser-local only.
7. Edit. Autosave. Insert source or trend hooks from the sidebar.
8. Distribute: copy, markdown, native share, or compose targets.

## 5. How to write notes that produce

One visible scene. Quotes in quotation marks. Numbers with who gave them. Time and place. What you do not know. Do not dump a national recap into notes and expect an exclusive.

## 6. Trend desk and AI Produce

| Layer | Job | Where |
| --- | --- | --- |
| Field notes | Only original facts | Postgres `story_items` |
| Live headlines | Google News related (7d), US national, world, Wikipedia most-read | Fetched at produce; fail-soft |
| Optional Gemini search | `GEMINI_TREND_SEARCH=1` extra briefing | Extra quota; off by default |
| Trend Desk | Why now, audience, 3–6 hooks | `localStorage` `fieldpress.trendDesk.<storyId>` |
| Drafts | Article, social, podcast | Postgres `drafts`; upserted per mode |

Relatable = everyday stakes. National = institutions / power. Global = overseas parallel. Never present a headline as something the reporter observed. Gemini 429/503 retried twice.

## 7. Edit, templates, and distribute

Autosave 1.5s. Article: lede / body / nut graf / kicker. Social: `---` between thread posts. Podcast: cold open, segments, show notes.

Distribute: copy; save markdown; native share; X / Threads / Bluesky (first ~270 chars); LinkedIn / email longer; Facebook / Instagram paste; WhatsApp first chunk; package = notes + all drafts.

## 8. Phone / Expo field app

```
pnpm dev:mobile
```

On a real device set `EXPO_PUBLIC_API_URL` to the LAN IP, not localhost. Export a dispatch, paste into desktop IMPORT.

## 9. API map

Base `/api`.

- `GET /healthz`
- `GET /dashboard`
- `GET /stories?status=active|archived`
- `POST /stories` — title required
- `GET` / `DELETE /stories/:id`
- `POST /stories/import`
- `POST /stories/:id/items` — note|audio|photo
- `DELETE /stories/:id/items/:itemId`
- `GET` / `POST /stories/:id/drafts` — article|social|podcast
- `GET` / `PATCH` / `DELETE /stories/:id/drafts/:draftId`
- `POST /produce` — ephemeral title + notes[]
- `POST /stories/:id/produce` — saves three drafts + Trend Desk fields

## 10. Data model

`stories` (title 255, status active|archived). `story_items` cascade. `drafts` cascade, upserted per mode. **There is no login.** Treat production as a desk tool until you add auth.

## 11. Environment variables

| Name | Role |
| --- | --- |
| `DATABASE_URL` | Neon pooled Postgres |
| `DATABASE_URL_UNPOOLED` | Drizzle push |
| `GEMINI_API_KEY` | Required for produce |
| `GEMINI_MODEL` | Default `gemini-3.5-flash` |
| `GEMINI_TREND_SEARCH` | `1` enables extra search briefing |
| `PORT` | Default 3000 |
| `API_URL` | Vite proxy target |
| `EXPO_PUBLIC_API_URL` | Phone API base |
| `STATIC_DIR` | Optional desktop build path |

## 12. Local, Docker, Vercel

```
pnpm install
pnpm db:push
pnpm dev
pnpm start
pnpm dev:mobile
```

```
docker build -t fieldpress .
docker run --rm -p 3000:3000 --env-file .env fieldpress
```

```
vercel deploy --prod --yes --scope tuffputer
```

`/admin-manual.html` must be the paper page, not the React shell. `/user-manual.html` is the public guide.

## 13. When it breaks

- Empty `/app` → Neon / `DATABASE_URL`
- Produce 502 key not set → `.env` or Vercel env
- 429 quota → Gemini billing; leave trend search off
- 503 → wait; server retries twice
- Empty Trend Desk, drafts exist → desk is browser-local
- Phone fail → LAN IP, same Wi-Fi
- Install fail → Safari home screen / Add to Dock / Chrome install icon
- Download opens in tab → DOWNLOAD HTML / MD buttons (blob save) or Print → Save as PDF
- Stale installed app → bump/unregister service worker
- Vercel not authorized → `--scope tuffputer`
- Overwrote a draft → no history; keep a markdown copy

## 14. Before you publish

Names, titles, counts checked. Quotes accurate. Why-now framed as public context. You would read it aloud to the people in the notes.

## 15. Do not

- Do not publish unverified names, counts, or quotes.
- Do not treat Trend Desk headlines as reporting from the scene.
- Do not put this operator book, keys, or `/admin` URLs on the launch page, user guide, or README.
- Do not commit `.env`, `.vercel`, or API keys.
- Do not brand FieldPress as another studio’s product.
- Do not assume the newsroom is private. There is no login yet.

## Cheat sheet

Specific headline → notes with a scene and attributable quotes → AI PRODUCE → read Why now / three-scale hooks → edit article, social, podcast → verify → Distribute → keep a markdown copy.

*— End of operator manual · 25 Aug 2026 · keep offline —*
