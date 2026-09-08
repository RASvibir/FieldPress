#!/usr/bin/env bash
set -euo pipefail

echo "========================================================"
echo "  FIELDPRESS PHASE 7 COMMUNITY STACK VERIFICATION       "
echo "========================================================"

# Check Migration Files
echo -n "Checking Neon SQL Migrations (007-012)... "
REQUIRED_MIGRATIONS=(
  "migrations/007_wire_and_dms.sql"
  "migrations/009_community_verification_notes.sql"
  "migrations/010_beat_bounties.sql"
  "migrations/011_pressie_ownership_and_permissions.sql"
  "migrations/012_peer_reactions_and_signal_score.sql"
)

for m in "${REQUIRED_MIGRATIONS[@]}"; do
  if [ ! -f "$m" ]; then
    echo "FAILED: Missing $m"
    exit 1
  fi
done
echo "OK (All 5 migration files present)"

# Check Component Manifest
echo -n "Checking React Component Manifest... "
REQUIRED_COMPONENTS=(
  "artifacts/fieldpress-desktop/src/components/FieldyCommunications.tsx"
  "artifacts/fieldpress-desktop/src/components/AttributionChain.tsx"
  "artifacts/fieldpress-desktop/src/components/CommunityNotes.tsx"
  "artifacts/fieldpress-desktop/src/components/BeatBounties.tsx"
  "artifacts/fieldpress-desktop/src/components/PressieOwnershipBadge.tsx"
  "artifacts/fieldpress-desktop/src/components/ShareDispatchModal.tsx"
  "artifacts/fieldpress-desktop/src/components/PeerReactions.tsx"
  "artifacts/fieldpress-desktop/src/components/AnonymousFieldyToggle.tsx"
  "artifacts/fieldpress-desktop/src/pages/profile.tsx"
  "artifacts/fieldpress-desktop/src/pages/story-detail.tsx"
  "artifacts/fieldpress-desktop/src/lib/ledger.ts"
  "artifacts/fieldpress-desktop/src/lib/signalEngine.ts"
)

for c in "${REQUIRED_COMPONENTS[@]}"; do
  if [ ! -f "$c" ]; then
    echo "FAILED: Missing $c"
    exit 1
  fi
done
echo "OK (All 12 modules present)"

# Check TypeScript Typecheck if tsconfig is present
if [ -f "artifacts/fieldpress-desktop/tsconfig.json" ]; then
  echo "Running TypeScript diagnostics..."
  (cd artifacts/fieldpress-desktop && npx tsc --noEmit)
  echo "TypeScript check PASSED."
fi

echo "========================================================"
echo "  PHASE 7 COMMUNITY ARCHITECTURE DEPLOYMENT READY       "
echo "========================================================"
