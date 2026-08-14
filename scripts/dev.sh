#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec bash "$ROOT/scripts/with-env.sh" pnpm exec concurrently -k -n api,web -c cyan,magenta \
  "pnpm --filter @workspace/api-server run dev" \
  "PORT=5173 pnpm --filter @workspace/fieldpress-desktop run dev"
