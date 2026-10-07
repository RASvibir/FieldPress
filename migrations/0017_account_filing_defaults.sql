-- Optional per-account default filing desk (additive; app falls back to client config).
ALTER TABLE fieldpress_accounts
  ADD COLUMN IF NOT EXISTS default_filing_location varchar(200),
  ADD COLUMN IF NOT EXISTS default_filing_longitude real,
  ADD COLUMN IF NOT EXISTS default_filing_latitude real;
