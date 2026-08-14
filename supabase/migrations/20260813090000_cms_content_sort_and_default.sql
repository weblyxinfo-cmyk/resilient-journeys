-- Phase 0 of the CMS project: add the columns the rebuilt admin (AdminCMS.tsx)
-- needs but that the table has never had.
--
-- sort_order: lets a page/section be listed in a stable, deliberate order
-- instead of alphabetically by key. Defaults to 0, same as booking_cards.
--
-- default_value: snapshot of the fallback text a key was seeded with, so the
-- admin can offer "revert to original" instead of only "delete forever".
-- Backfilled from the current value for existing rows — every row seeded so
-- far was seeded as bit-identical to its fallback, so value *is* the default
-- at this point in time.

ALTER TABLE public.cms_content
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_value TEXT;

UPDATE public.cms_content
SET default_value = value
WHERE default_value IS NULL;
