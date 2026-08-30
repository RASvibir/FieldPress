#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/ras.ip/FieldPress"
cd "$ROOT_DIR"

echo "==> [Phase 1/4] Patching Router & Building Backend API..."

# Detect router file
if [ -f "artifacts/api-server/src/routes.ts" ]; then
  ROUTER_FILE="artifacts/api-server/src/routes.ts"
elif [ -f "artifacts/api-server/src/app.ts" ]; then
  ROUTER_FILE="artifacts/api-server/src/app.ts"
else
  echo "Error: Router file not found in artifacts/api-server/src/"
  exit 1
fi

# Idempotent sed injection (macOS BSD sed compatible)
if ! grep -q "imagesRouter" "$ROUTER_FILE"; then
  echo "Injecting imagesRouter into $ROUTER_FILE..."
  
  # 1. Insert import at line 1
  sed -i '' '1s|^|import { imagesRouter } from "./routes/images";\'$'\n|' "$ROUTER_FILE"
  
  # 2. Mount route before first app.use(
  sed -i '' '1,/app\.use(/s/app\.use(/app.use("\/api", imagesRouter);\'$'\napp.use(/' "$ROUTER_FILE"
  
  echo "Mounted imagesRouter successfully."
else
  echo "imagesRouter already present in $ROUTER_FILE. Skipping patch."
fi

# Build API server
cd "$ROOT_DIR/artifacts/api-server"
npm run build

echo "==> [Phase 2/4] Building & Deploying Frontend to Cloudflare Pages..."
cd "$ROOT_DIR/artifacts/fieldpress-desktop"
npm run build

npx wrangler pages deploy dist/public \
  --project-name=fieldpress-desktop \
  --branch=main \
  --commit-dirty=true

npx wrangler pages domain set fieldpress-desktop fieldpress.studio
npx wrangler pages domain set fieldpress-desktop app.fieldpress.studio

echo "==> [Phase 3/4] Background Service & Tunnel Configuration..."
if ! launchctl list | grep -q "com.cloudflare.cloudflared"; then
  sudo cloudflared service install || true
  sudo launchctl start com.cloudflare.cloudflared || true
fi

echo "==> [Phase 4/4] Starting API Server in Production Mode..."
cd "$ROOT_DIR/artifacts/api-server"
# Note: For background persistence, wrap in pm2 or nohup
node --env-file=.env.production dist/index.mjs &
SERVER_PID=$!
echo "Backend API running (PID: $SERVER_PID)"

# Allow 2 seconds for cold start
sleep 2

echo "==> Running Smoke Tests..."
echo -n "Health Check: "
curl -s -o /dev/null -w "%{http_code}\n" https://api.fieldpress.studio/health || true

echo -n "Archival Search: "
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://api.fieldpress.studio/api/stories/preview/images/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Journalism Press"}' || true

echo -n "AI Prompt Generation: "
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://api.fieldpress.studio/api/stories/preview/images/generate-prompt \
  -H "Content-Type: application/json" \
  -d '{"format": "article_hero", "headline": "Local Energy Grid Resilience"}' || true

echo -n "Frontend App: "
curl -s -o /dev/null -w "%{http_code}\n" https://fieldpress.studio || true

echo "==> Deployment Sequence Completed."
