# Operations

## Local

```bash
docker compose up -d
pnpm install
cp .env.example .env
pnpm db:push
pnpm dev
```

Docker Compose runs Postgres 17 as `fieldpress-db`, database name `heliumdb`.

## Production DNS

Canonical site: **fieldpress.studio**

Recommended:

1. Cloudflare zone for `fieldpress.studio` (DNS, TLS, WAF).
2. Apex + `www` CNAME/ALIAS to the Vercel project.
3. Optional `api.fieldpress.studio` when the API is split from the static app.
4. Keep Vercel preview hostnames for pull requests only.

Set production `APP_URL` and `PUBLIC_ORIGIN` to `https://fieldpress.studio`. Never put storage secrets in `VITE_*`.

## Vercel

`vercel.json` builds the desktop Vite app into `artifacts/fieldpress-desktop/dist/public` and the API into `api/index.mjs` with `includeFiles` for `artifacts/api-server/dist/**`. `/api/*` rewrites to that function. SPA fallback is `index.html`.

Do not run unbounded transcription or FFmpeg inside that function.

## Docker image

`Dockerfile` installs the workspace, builds web + API, and starts `@workspace/api-server`. Copy includes `packages/` so domain/config stay in the image.
