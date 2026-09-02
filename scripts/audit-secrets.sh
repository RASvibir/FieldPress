#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if git ls-files '*.log' | grep -q .; then
  echo "Tracked log files must not be committed:" >&2
  git ls-files '*.log' >&2
  exit 1
fi

if git grep -I -nE 'BEGIN (RSA |OPENSSH )?PRIVATE KEY|AKIA[0-9A-Z]{16}|sk_live_|ghp_[A-Za-z0-9]{20,}' -- . ':!pnpm-lock.yaml' ':!.fieldpress-backups/**' ':!scripts/audit-secrets.sh' >/dev/null; then
  echo "Possible secret material found in the working tree." >&2
  git grep -I -nE 'BEGIN (RSA |OPENSSH )?PRIVATE KEY|AKIA[0-9A-Z]{16}|sk_live_|ghp_[A-Za-z0-9]{20,}' -- . ':!pnpm-lock.yaml' ':!.fieldpress-backups/**' ':!scripts/audit-secrets.sh' >&2
  exit 1
fi

echo "audit:secrets ok"
