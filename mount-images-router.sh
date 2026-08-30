#!/usr/bin/env bash
set -euo pipefail

TARGET_FILE="artifacts/api-server/src/app.ts"
if [ ! -f "$TARGET_FILE" ]; then
  TARGET_FILE="artifacts/api-server/src/index.ts"
fi

echo "==> Patching routes in $TARGET_FILE..."

# Check if already imported
if grep -q "imagesRouter" "$TARGET_FILE"; then
  echo "imagesRouter is already mounted."
else
  node -e "
    const fs = require('fs');
    const path = '$TARGET_FILE';
    let code = fs.readFileSync(path, 'utf8');

    // 1. Add import at the top
    code = \"import { imagesRouter } from './routes/images';\n\" + code;

    // 2. Mount before export or app.listen
    if (code.includes('export default app') || code.includes('export { app }')) {
      code = code.replace(/(export (default app|\{ app \}))/, 'app.use(\"/api\", imagesRouter);\n\n\$1');
    } else if (code.includes('app.listen')) {
      code = code.replace(/(app\.listen)/, 'app.use(\"/api\", imagesRouter);\n\n\$1');
    } else {
      code += '\napp.use(\"/api\", imagesRouter);\n';
    }

    fs.writeFileSync(path, code, 'utf8');
    console.log('Successfully inserted imagesRouter import and mount.');
  "
fi

cd artifacts/api-server
npm run build
echo "==> Build complete. API server ready with imagesRouter."
