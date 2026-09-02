# Threat model (v1)

FieldPress stores field notes, recordings, consent, and unpublished source material.

## Assets

- Account credentials and session cookies
- Organization membership and role changes
- Original media objects and checksums
- Transcripts (including redacted ranges)
- Consent records and export packages
- Signed upload/download URLs

## Trust boundaries

- Browser / PWA vs API vs object storage vs worker vs desktop OS
- Public publish prefix vs private archive prefix
- Preview deployments vs `fieldpress.studio`

## Controls (required as features land)

- Organization- and project-scoped queries, not client routing alone
- Short-lived signed URLs; storage keys never returned as world-readable URLs
- Audit events for permission changes, restricted downloads, publish, export, consent
- Redacted transcript text excluded from public exports, search, and embeddings
- Fail closed in production if `AUTH_SECRET` or storage credentials are missing
- No secrets, source PII, or API logs in Git
