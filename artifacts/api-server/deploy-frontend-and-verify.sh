#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/ras.ip/FieldPress"
DESKTOP_DIR="$ROOT_DIR/artifacts/fieldpress-desktop"

echo "========================================================"
echo "==> [Phase 2/4] Building & Deploying Frontend to Pages"
echo "========================================================"
cd "$DESKTOP_DIR"

# 1. Build desktop production bundle
npm run build

# 2. Deploy bundle to Cloudflare Pages
npx wrangler pages deploy dist/public \
  --project-name=fieldpress-desktop \
  --branch=main \
  --commit-dirty=true

# 3. Ensure custom domains are mapped
npx wrangler pages domain set fieldpress-desktop fieldpress.studio || true
npx wrangler pages domain set fieldpress-desktop app.fieldpress.studio || true

echo "========================================================"
echo "==> [Phase 3/4] Background Service & Tunnel Persistence"
echo "========================================================"
# Ensure cloudflared runs as a system daemon
if ! launchctl list | grep -q "com.cloudflare.cloudflared"; then
  echo "Installing and starting cloudflared background service..."
  sudo cloudflared service install || true
  sudo launchctl start com.cloudflare.cloudflared || true
else
  echo "cloudflared service is already registered in launchctl."
fi

echo "========================================================"
echo "==> [Phase 4/4] Production Live Verification"
echo "========================================================"
# Allow a brief moment for edge routing propagation
sleep 3

echo -n "1. API Gateway Health (api.fieldpress.studio): "
curl -s -o /dev/null -w "%{http_code}\n" https://api.fieldpress.studio/health || true

echo "2. Archival Search Edge Endpoint:"
curl -s -X POST https://api.fieldpress.studio/api/stories/search-preview/images/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Journalism Press"}' | head -c 250
echo -e "\n"

echo "3. AI Prompt Generation Edge Endpoint:"
curl -s -X POST https://api.fieldpress.studio/api/stories/search-preview/images/generate-prompt \
  -H "Content-Type: application/json" \
  -d '{"format": "article_hero", "headline": "Local Energy Grid Resilience", "fieldNotes": "Substation maintenance logs."}'
echo -e "\n"

echo -n "4. Primary Domain (fieldpress.studio): "
curl -s -o /dev/null -w "%{http_code}\n" https://fieldpress.studio || true

echo -n "5. App Domain (app.fieldpress.studio): "
curl -s -o /dev/null -w "%{http_code}\n" https://app.fieldpress.studio || true

echo "========================================================"
echo "==> FieldPress Production Go-Live Complete."
echo "========================================================"
