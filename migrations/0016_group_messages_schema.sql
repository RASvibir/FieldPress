-- Backfill migration: fieldpress_group_messages was created directly on
-- production out-of-band (same as this PR's 0015_wire_edition columns)
-- but never captured as a migration file, meaning a fresh dev/staging DB
-- built from migrations/ would be missing this table entirely. This file
-- brings the already-applied production schema into version control.
--
-- Backs the "Everyone" group channel (see api/_lib/handlers/messenger.mjs
-- handleGroup/handleGroupSend) - not cohort-gated, any authenticated
-- account can read and post.

CREATE TABLE IF NOT EXISTS fieldpress_group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id text NOT NULL DEFAULT 'midwest-bureau',
  sender_id text NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  body text,
  image_url text,
  link_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fieldpress_group_messages_has_content
    CHECK (
      (body IS NOT NULL AND btrim(body) <> '')
      OR image_url IS NOT NULL
      OR link_url IS NOT NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_group_messages_chat_created
  ON fieldpress_group_messages (chat_id, created_at);
