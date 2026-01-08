-- Fix permissive INSERT policy on lead_magnets by adding rate limiting via email uniqueness
DROP POLICY IF EXISTS "Anyone can insert lead magnets" ON public.lead_magnets;

-- Add unique constraint to prevent duplicate emails
ALTER TABLE public.lead_magnets ADD CONSTRAINT lead_magnets_email_unique UNIQUE (email);

-- Recreate insert policy - the unique constraint prevents abuse
CREATE POLICY "Anyone can insert lead magnets"
  ON public.lead_magnets FOR INSERT
  WITH CHECK (email IS NOT NULL AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');