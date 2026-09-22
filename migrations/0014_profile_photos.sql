-- Adds cover-photo persistence for press passes, server-side. Previously
-- cover photo (distinct from avatar_url) had no column at all and lived
-- only in a stashed, never-shipped local-only implementation.
--
-- Nullable with no default: unlike accent_color/verified_local, a missing
-- cover photo should render as "no cover" in the UI, not a fake default
-- value baked into every existing row.
ALTER TABLE fieldpress_accounts
  ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;
