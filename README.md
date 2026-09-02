# FieldPress

Offline-aware field reporting and audio production for independent journalists. The product is a **responsive web app** at **https://fieldpress.studio**, with an optional Tauri desktop companion. Expo and React Native are not part of this stack.

## How to open it

- Production: **https://fieldpress.studio**
- Local: `pnpm start` then http://localhost:3000

| What | Where |
| --- | --- |
| Newsroom | http://localhost:3000 |
| API health | http://localhost:3000/api/healthz |

Create a story, add notes, then produce drafts. On a phone, use the browser (or install the PWA). Do not use Expo Go.

## First-time setup

Needs Node 24+ and pnpm.

```bash
corepack enable
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:push
pnpm dev
```

Postgres can be Docker (`heliumdb` on localhost:5432) or Neon (`DATABASE_URL` in `.env`).

## Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm audit:secrets
```

## Ship

**Web + API (Vercel):** project already builds `@workspace/fieldpress-desktop` and `@workspace/api-server`. Point the production domain **fieldpress.studio** at that deployment (Cloudflare DNS → Vercel). Preview URLs remain on Vercel until you cut over.

**Docker:**

```bash
docker build -t fieldpress .
docker run --rm -p 3000:3000 --env-file .env fieldpress
```

Long FFmpeg / transcription jobs stay out of serverless request handlers; run them in workers when that pipeline lands.

## Layout (current → target)

| Role | Today | Target |
| --- | --- | --- |
| Web client | `artifacts/fieldpress-desktop` | `apps/web` |
| API | `artifacts/api-server` | `apps/api` |
| Tauri | `src-tauri` | `apps/desktop/src-tauri` |
| Domain types | `packages/domain` | same |
| Database | `lib/db` | `packages/database` |

Shared packages already live under `packages/`. The Expo tree in `artifacts/fieldpress` is **retired** and is not a workspace package.
