-- Workshop Inquiries table for contact/booking requests
CREATE TABLE workshop_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES blog_posts(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  group_size TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for admin queries ordered by date
CREATE INDEX idx_workshop_inquiries_created_at ON workshop_inquiries(created_at DESC);

-- RLS: anyone can INSERT, only admins can SELECT
ALTER TABLE workshop_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert workshop inquiries"
  ON workshop_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view workshop inquiries"
  ON workshop_inquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
