-- ============================================
-- Lead Magnets Table
-- For storing email subscribers from free guide downloads
-- ============================================

CREATE TABLE IF NOT EXISTS public.lead_magnets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for free guide signup)
CREATE POLICY "Anyone can subscribe to lead magnet"
  ON public.lead_magnets FOR INSERT
  WITH CHECK (true);

-- Only admins can view all leads
CREATE POLICY "Admins can view all leads"
  ON public.lead_magnets FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_lead_magnets_updated_at
  BEFORE UPDATE ON public.lead_magnets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lead_magnets_email
  ON public.lead_magnets(email);
CREATE INDEX IF NOT EXISTS idx_lead_magnets_created_at
  ON public.lead_magnets(created_at DESC);
