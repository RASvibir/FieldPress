# Data model

Existing tables (`stories`, `story_items`, `drafts`, visual `media_assets`) remain until a later additive migration retires them.

Newsroom tables in `lib/db/src/schema/newsroom.ts` are additive and use stable text IDs:

- `users`, `organizations`, `memberships` (RBAC: owner, editor, reporter, producer, viewer, external_reviewer)
- `projects` (story / episode / investigation)
- `sources`, `captures` (idempotency per project)
- `capture_media_assets` (storage **key**, sha256, parent/derivative `kind`)
- `transcripts`, `transcript_segments` (versioned; `redacted` flag)
- `annotations`, `consent_records`, `export_packages`
- `audit_events` (append-only)
- `media_jobs`

Raw originals are never overwritten. Derivatives set `parent_asset_id` and a non-`original` `kind`.
