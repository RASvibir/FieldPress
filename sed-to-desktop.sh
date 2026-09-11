#!/usr/bin/env bash
set -euo pipefail

echo "==> Preparing FieldPress for Desktop Suite build..."

TARGET_DIR="${1:-.}"

sedi() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

DESKTOP_DIR="$TARGET_DIR/artifacts/fieldpress-desktop"
API_DIR="$TARGET_DIR/artifacts/api-server"

# 1. Ensure Client Points to Live Production API & WebSockets
echo "==> 1. Updating API endpoints to fieldpress.studio..."
find "$DESKTOP_DIR/src" \
  -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  ! -path "*/node_modules/*" ! -path "*/dist/*" 2>/dev/null | while read -r file; do
    sedi 's|http://localhost:3000|https://api.fieldpress.studio|g' "$file"
    sedi 's|ws://localhost:3000|wss://api.fieldpress.studio|g' "$file"
    sedi 's|http://127.0.0.1:3000|https://api.fieldpress.studio|g' "$file"
    sedi 's|ws://127.0.0.1:3000|wss://api.fieldpress.studio|g' "$file"
done

# 2. Adjust Vite Base for Desktop Packaging (Relative paths for WebViews)
if [[ -f "$DESKTOP_DIR/vite.config.ts" ]]; then
  echo "==> 2. Ensuring relative base in vite.config.ts..."
  if ! grep -q "base:" "$DESKTOP_DIR/vite.config.ts"; then
    sedi 's|defineConfig({|defineConfig({\n  base: "./",|g' "$DESKTOP_DIR/vite.config.ts"
  fi
fi

# 3. Add Desktop/Tauri Webview Origins to Backend CORS
if [[ -f "$API_DIR/.env.production" ]]; then
  echo "==> 3. Adding desktop origins to API CORS..."
  sedi 's|CORS_ORIGINS=.*|CORS_ORIGINS=https://fieldpress.studio,https://app.fieldpress.studio,https://www.fieldpress.studio,tauri://localhost,http://tauri.localhost,https://tauri.localhost|g' "$API_DIR/.env.production"
fi

# 4. Generate Desktop Production Environment
echo "==> 4. Writing desktop .env.production..."
cat << 'ENVEOF' > "$DESKTOP_DIR/.env.production"
VITE_API_URL=https://api.fieldpress.studio
VITE_WS_URL=wss://api.fieldpress.studio
VITE_APP_DOMAIN=fieldpress.studio
VITE_DESKTOP_MODE=true
VITE_BUILD_TARGET=desktop
ENVEOF

# 5. Check and align Tauri config if src-tauri exists
if [[ -f "$TARGET_DIR/src-tauri/tauri.conf.json" ]]; then
  echo "==> 5. Verifying tauri.conf.json distDir..."
  sedi 's|"distDir": ".*"|"distDir": "../artifacts/fieldpress-desktop/dist"|g' "$TARGET_DIR/src-tauri/tauri.conf.json"
fi

echo "==> Desktop build readiness complete."
