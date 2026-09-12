-- FieldPress Cloudflare D1 Database Schema
-- Migration 0001: Initial Dispatches, Reporters, and Editorial Logs

CREATE TABLE IF NOT EXISTS reporters (
  badge_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  callsign TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  bureau TEXT NOT NULL,
  pgp_key TEXT,
  accent_color TEXT DEFAULT 'amber',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dispatches (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  callsign TEXT NOT NULL,
  bureau TEXT NOT NULL,
  badge_id TEXT REFERENCES reporters(badge_id),
  location TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  content TEXT NOT NULL,
  image_url TEXT,
  image_caption TEXT,
  is_lead INTEGER DEFAULT 0,
  editorial_status TEXT DEFAULT 'staged',
  signature TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS editorial_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dispatch_id TEXT NOT NULL REFERENCES dispatches(id),
  editor_badge_id TEXT NOT NULL,
  action TEXT NOT NULL,
  notes TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dispatches_bureau ON dispatches(bureau);
CREATE INDEX IF NOT EXISTS idx_dispatches_status ON dispatches(editorial_status);
CREATE INDEX IF NOT EXISTS idx_dispatches_created ON dispatches(created_at DESC);
