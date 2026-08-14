#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
bash "$ROOT/scripts/with-env.sh" pnpm --filter @workspace/fieldpress-desktop run build
bash "$ROOT/scripts/with-env.sh" pnpm --filter @workspace/api-server run build
exec bash "$ROOT/scripts/with-env.sh" pnpm --filter @workspace/api-server run start
