# Local API shim

`vercel dev` currently hangs indefinitely at "Creating initial build" on
this machine (isolated to something about how it verifies/spawns pnpm
inside its own build sandbox — plain `pnpm install` and a corepack-pinned
`pnpm@10.0.0` both work fine outside of it). Filed for follow-up; not
fixed here.

Until that's resolved, `server.mjs` is a small Express server that
imports the real handlers from `api/_lib/handlers/*.mjs` directly and
routes `/api/:resource/:action` to them — same dispatch shape as
`api/[resource]/[action].mjs`, so this is not reimplemented logic, just a
different way of invoking the exact same code locally.

## Usage

Terminal 1:
    cd scripts/local-api && npm install   # first time only
    cd ../.. 
    set -a; source .env; set +a
    node scripts/local-api/server.mjs

Terminal 2:
    pnpm dev

`vite.config.ts` proxies `/api/*` to `localhost:4000` (the shim), so the
app at `localhost:5173` works exactly as it will in production.

## Not covered

The standalone media/blob endpoints (`upload-avatar`, `upload-share-card`,
`pressyo`, `dispatches`, `sync-dispatch`, `dispatch/:id`) aren't wired
into this shim — only the six-resource dispatcher (auth, cohorts,
messenger, admin, notifications, reports). Add them to `RESOURCES` /
write a route for them in `server.mjs` if you need those locally too.

## Once `vercel dev` is fixed

Delete this folder and the proxy block in `vite.config.ts`; go back to
`vercel dev` as the single source of truth for local dev.
