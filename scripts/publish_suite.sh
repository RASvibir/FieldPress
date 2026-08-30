#!/usr/bin/env bash
set -euo pipefail

APP_NAME="FieldPress"
APP_DESCRIPTION="Cross-Platform AI-Powered Content Creation Suite"
VERSION="${1:-1.0.0}"
PROD_API_URL="${2:-https://api.fieldpress.space}"

echo "==========================================="
echo " Building & Publishing ${APP_NAME} v${VERSION}"
echo "==========================================="

# Cross-platform in-place sed helper (macOS vs Linux)
sedi() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

# 1. Update Version in package.json
echo "--> Updating version to ${VERSION}..."
sedi 's|"version": "[^"]*"|"version": "'"${VERSION}"'"|' package.json

# 2. Inject Mobile PWA Manifest & Viewport for Pencil/Touch into index.html
echo "--> Configuring mobile / PWA metadata..."
HTML_FILE="artifacts/fieldpress-desktop/index.html"
if [ ! -f "$HTML_FILE" ]; then
  HTML_FILE="index.html"
fi

if [ -f "$HTML_FILE" ]; then
  # Ensure responsive & viewport-fit=cover for mobile devices
  sedi 's|<meta name="viewport".*|<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />|' "$HTML_FILE"
  
  # Ensure app title
  sedi 's|<title>.*</title>|<title>FieldPress — Content Creation Suite</title>|' "$HTML_FILE"
fi

# 3. Generate Web App Manifest (PWA) for Mobile & Desktop Installability
echo "--> Generating webmanifest..."
PUBLIC_DIR="artifacts/fieldpress-desktop/public"
mkdir -p "$PUBLIC_DIR"

cat << MANIFEST > "${PUBLIC_DIR}/manifest.json"
{
  "name": "FieldPress Content Creation Suite",
  "short_name": "FieldPress",
  "description": "${APP_DESCRIPTION}",
  "start_url": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#0f172a",
  "theme_color": "#6366f1",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
MANIFEST

# 4. Build Production Web & Desktop UI Bundles
echo "--> Compiling production workspace assets..."
pnpm install --frozen-lockfile
pnpm run build

# 5. Package Docker Container (for Cloud / Self-Hosted Distribution)
if command -v docker &> /dev/null; then
  echo "--> Building Docker release image..."
  docker build -t "fieldpress:${VERSION}" -t "fieldpress:latest" .
  echo "--> Docker image built: fieldpress:${VERSION}"
fi

echo "==========================================="
echo " Build completed for ${APP_NAME} v${VERSION}"
echo " Web dist: ready for Vercel/Cloudflare"
echo "==========================================="
