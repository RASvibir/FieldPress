# Architecture

FieldPress is a web-first TypeScript product. The public origin is **https://fieldpress.studio**. Native mobile (Expo / React Native) is out of scope.

## Layers

| Layer | Current location | Job |
| --- | --- | --- |
| Web client | `artifacts/fieldpress-desktop` (Vite + React) | Newsroom UI, PWA, mobile-responsive capture |
| API | `artifacts/api-server` | Auth-ready HTTP, stories, drafts, health |
| Domain | `packages/domain` | Zod entities, ingest adapter types, lineage rules |
| Config | `packages/config` | Boot-time env validation |
| Audio contracts | `packages/audio` | Processing job names and pipeline order |
| Archive | `packages/archive` | Export manifest checksum contract |
| Database | `lib/db` | Drizzle schema including additive newsroom tables |
| Desktop | `src-tauri` | Privileged file/media workflows (after API/media contract) |
| Workers | `workers/` (stubs) | FFmpeg and transcription — not in Vercel functions |

## Public vs preview

- **Production hostname:** `fieldpress.studio` (and `www` if you alias it).
- **API hostname (when split):** `api.fieldpress.studio`.
- **Preview:** Vercel preview URLs. Do not treat `*.vercel.app` as the product identity.

## Ingest adapters

Shared UI must depend on `MediaIngestAdapter` from `@fieldpress/domain`, not Tauri APIs.

- Web: File System Access API when present, otherwise `<input type="file">`, IndexedDB drafts.
- Desktop: Tauri commands for bulk import, checksums, resumable queues.

## Deployment split

Vercel serves the web app and short HTTP routes (`vercel.json`). Docker Compose provides local Postgres. Media processing belongs in a worker container, not the serverless function (`maxDuration` 60s is for API, not FFmpeg).
