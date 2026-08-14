-- Human-readable field label for the visual admin rebuild (docs/cms-visual-admin.md).
--
-- `description` already exists but is written for a developer ("Homepage —
-- services 1 title"), not for a non-technical client. `label` is the short
-- name shown directly above the input in the new admin ("Nadpis", "Text
-- tlačítka") — the technical `key` moves to small print below the field.
-- Nullable and additive: existing rows keep working (fall back to `key`)
-- until the next migration backfills every row.

ALTER TABLE public.cms_content
  ADD COLUMN IF NOT EXISTS label TEXT;
