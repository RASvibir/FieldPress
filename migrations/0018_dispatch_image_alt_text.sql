-- Additive: optional accessibility alt text for the cover/lead image on dispatches.
ALTER TABLE fieldpress_dispatches
  ADD COLUMN IF NOT EXISTS image_alt_text text;
