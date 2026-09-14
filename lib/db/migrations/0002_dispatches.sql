-- Dispatches (published stories + press-roll drafts), scoped per account.
-- Replaces the localStorage-only fieldpress_dispatches / fieldpress_pressroll
-- state, which was shared across every account on a given browser.

CREATE TABLE IF NOT EXISTS fieldpress_dispatches (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES fieldpress_accounts(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  author VARCHAR(200) NOT NULL,
  callsign VARCHAR(32) NOT NULL,
  bureau VARCHAR(200) NOT NULL,
  location VARCHAR(200),
  latitude REAL,
  longitude REAL,
  content TEXT NOT NULL,
  image_url TEXT,
  image_caption TEXT,
  is_lead BOOLEAN NOT NULL DEFAULT false,
  is_press_roll BOOLEAN NOT NULL DEFAULT false,
  edition_style VARCHAR(32),
  sharing_option VARCHAR(16) NOT NULL DEFAULT 'fork',
  parent_dispatch_id TEXT REFERENCES fieldpress_dispatches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fieldpress_dispatches_account ON fieldpress_dispatches(account_id);
CREATE INDEX IF NOT EXISTS idx_fieldpress_dispatches_published
  ON fieldpress_dispatches(created_at DESC) WHERE is_press_roll = false;
