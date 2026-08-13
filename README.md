# FieldPress

Pocket newsroom and podcast studio for indie journalists. Capture in the field on mobile, then edit articles, social posts, and podcast scripts on desktop.

This repo left Replit. Local development and GitHub are the source of truth.

## Apps

| Package | What it is |
| --- | --- |
| `artifacts/fieldpress` | Expo / React Native — field capture, audio, archive, travel assistant |
| `artifacts/fieldpress-desktop` | Vite + React — desktop editor with CRT / cyberpunk theme |
| `artifacts/api-server` | Express API (`/api/stories`, drafts, dashboard) |
| `lib/db` | PostgreSQL + Drizzle (`stories`, `story_items`, `drafts`) |

## Setup

Needs **Node 24**, **pnpm**, and **Postgres**.

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:push
```

Run in separate terminals:

```bash
pnpm dev:api       # API on http://localhost:3000
pnpm dev:desktop   # editor on http://localhost:5173
pnpm dev:mobile    # Expo
```

`DATABASE_URL` in `.env` should point at your Postgres. The Replit host `helium` only worked inside Replit. Use local Docker, or a Neon URL.

## Stack

pnpm workspace, TypeScript 5.9, Express 5, Drizzle, Zod, Orval-generated React Query client, Expo 54, Vite.

See `replit.md` for the original package map and API routes.
