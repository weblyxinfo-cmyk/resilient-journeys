-- Add paid workshop fields to blog_posts
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS is_paid_workshop BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS workshop_price INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS workshop_currency TEXT DEFAULT 'CZK',
ADD COLUMN IF NOT EXISTS payment_iban TEXT,
ADD COLUMN IF NOT EXISTS payment_message TEXT;

-- Workshop registrations table
CREATE TABLE workshop_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES blog_posts(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workshop_registrations_workshop ON workshop_registrations(workshop_id);
CREATE INDEX idx_workshop_registrations_created_at ON workshop_registrations(created_at DESC);

-- RLS
ALTER TABLE workshop_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register for workshops"
  ON workshop_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view workshop registrations"
  ON workshop_registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update workshop registrations"
  ON workshop_registrations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
