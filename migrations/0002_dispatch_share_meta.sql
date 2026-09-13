-- Migration: 0002_dispatch_share_meta
-- Creates dispatch_share_meta, required by api/sync-dispatch.mjs and
-- api/dispatch/[id].mjs for Open Graph / Twitter Card link previews.
--
-- This table was referenced by both handlers but never actually created,
-- so every share-preview sync has been silently failing (caught client-side)
-- and every crawler request has been served the generic fallback card.

CREATE TABLE IF NOT EXISTS dispatch_share_meta (
  id TEXT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  content_snippet VARCHAR(500) NOT NULL,
  location VARCHAR(200),
  category VARCHAR(100),
  author VARCHAR(200),
  callsign VARCHAR(100),
  edition_style VARCHAR(50) NOT NULL DEFAULT 'newspaper',
  image_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dispatch_share_meta_updated_at ON dispatch_share_meta(updated_at);
