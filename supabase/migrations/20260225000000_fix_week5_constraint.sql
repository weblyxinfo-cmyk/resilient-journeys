-- ============================================
-- FIX: Allow week_number 5 (Free Bonus week)
-- The UI allows Week 5 as "Bonus (Free)" but the DB constraint only allows 1-4
-- ============================================

-- Drop old constraint and recreate with 1-5 range
ALTER TABLE public.videos DROP CONSTRAINT IF EXISTS check_week_number_range;
ALTER TABLE public.videos ADD CONSTRAINT check_week_number_range
    CHECK (week_number IS NULL OR (week_number >= 1 AND week_number <= 5));

ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS check_resources_week_number_range;
ALTER TABLE public.resources ADD CONSTRAINT check_resources_week_number_range
    CHECK (week_number IS NULL OR (week_number >= 1 AND week_number <= 5));
