-- Migration: 0015_wire_edition
-- Adds inbound "wire" pressie support and generic link-embed metadata.
--
-- Wire pressies are normal fieldpress_dispatches rows (edition_style = 'wire')
-- owned by a single system account, with source_url for link-out.
-- embed_type/embed_data support rich link previews for wire AND regular
-- pressies alike (YouTube/Reddit oEmbed, generic OG link-card fallback).
-- Applied to production 2026-09-22 via Neon MCP prepare/complete_database_migration.

ALTER TABLE fieldpress_dispatches
  ADD COLUMN IF NOT EXISTS source_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS embed_type VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS embed_data JSONB NULL;

INSERT INTO fieldpress_accounts (id, email, password_hash, callsign, name, bureau, role, created_at)
SELECT 'wire-system-account', 'wire@fieldpress.studio', 'no-login-system-account', '@wire', 'FieldPress Wire', 'External Wire', 'wire', now()
WHERE NOT EXISTS (SELECT 1 FROM fieldpress_accounts WHERE callsign = '@wire');
