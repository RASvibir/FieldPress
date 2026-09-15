-- Real, server-backed direct messages (Field Comms / messenger), replacing
-- the previous client-only-fake system where messengerMessages lived
-- purely in React state + localStorage with no other real account
-- involved on the other end.
--
-- Scope: 1:1 DMs between cohorts only (matches the product intent that
-- messaging is cohort-gated -- see api/cohorts/[action].mjs). Group/
-- bureau channels (e.g. the existing "midwest-bureau" chat) remain
-- client-side for now and are intentionally excluded from this table.
--
-- A thread is identified by its two participants, stored in a stable
-- sorted order (participant_a_id < participant_b_id) so there's exactly
-- one thread per pair regardless of who messages whom first, rather than
-- needing a separate threads table to look up or create.

CREATE TABLE IF NOT EXISTS fieldpress_messenger_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a_id TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  participant_b_id TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fieldpress_messenger_messages_no_self CHECK (participant_a_id != participant_b_id),
  CONSTRAINT fieldpress_messenger_messages_sorted_pair CHECK (participant_a_id < participant_b_id),
  CONSTRAINT fieldpress_messenger_messages_sender_is_participant
    CHECK (sender_id = participant_a_id OR sender_id = participant_b_id)
);

CREATE INDEX IF NOT EXISTS idx_fieldpress_messenger_thread
  ON fieldpress_messenger_messages (participant_a_id, participant_b_id, created_at);

-- Unread lookups filter by sender_id != me across whichever slot the
-- other person occupies, so a single read_at partial index (not scoped
-- to one participant column) covers both directions.
CREATE INDEX IF NOT EXISTS idx_fieldpress_messenger_unread
  ON fieldpress_messenger_messages (participant_a_id, participant_b_id, sender_id)
  WHERE read_at IS NULL;
