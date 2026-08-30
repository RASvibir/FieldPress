#!/usr/bin/env bash
set -euo pipefail

echo "==> Running FieldPress sed migration to fieldpress.studio..."

TARGET_DIR="${1:-.}"

sedi() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

# 1. Update API Base URLs in Desktop & Mobile Clients
find "$TARGET_DIR/artifacts/fieldpress-desktop" "$TARGET_DIR/artifacts/fieldpress" \
  -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name ".env*" \) \
  ! -path "*/node_modules/*" ! -path "*/dist/*" 2>/dev/null | while read -r file; do
    sedi 's|http://localhost:3000|https://api.fieldpress.studio|g' "$file"
    sedi 's|ws://localhost:3000|wss://api.fieldpress.studio|g' "$file"
    sedi 's|http://127.0.0.1:3000|https://api.fieldpress.studio|g' "$file"
done

# 2. Update Backend CORS and Domain Settings
find "$TARGET_DIR/artifacts/api-server" \
  -type f \( -name "*.ts" -o -name "*.js" -o -name ".env*" \) \
  ! -path "*/node_modules/*" ! -path "*/dist/*" 2>/dev/null | while read -r file; do
    sedi 's|http://localhost:5173|https://fieldpress.studio|g' "$file"
    sedi 's|http://localhost:3000|https://api.fieldpress.studio|g' "$file"
    sedi 's|localhost:5173|fieldpress.studio|g' "$file"
done

# 3. Create Production Environment Files
mkdir -p "$TARGET_DIR/artifacts/api-server" "$TARGET_DIR/artifacts/fieldpress-desktop"

cat << 'ENVEOF' > "$TARGET_DIR/artifacts/api-server/.env.production"
NODE_ENV=production
PORT=3000
DOMAIN=fieldpress.studio
PUBLIC_API_URL=https://api.fieldpress.studio
CORS_ORIGINS=https://fieldpress.studio,https://app.fieldpress.studio,https://www.fieldpress.studio
COOKIE_DOMAIN=.fieldpress.studio
SECURE_COOKIES=true
ENVEOF

cat << 'ENVEOF' > "$TARGET_DIR/artifacts/fieldpress-desktop/.env.production"
VITE_API_URL=https://api.fieldpress.studio
VITE_WS_URL=wss://api.fieldpress.studio
VITE_APP_DOMAIN=fieldpress.studio
ENVEOF

echo "==> Migration complete. Environment files created."
