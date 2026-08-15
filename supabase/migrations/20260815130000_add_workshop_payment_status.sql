-- Workshops move from manual bank transfer (QR code) to Stripe Checkout.
-- `status` stays the admin's own logistics field (pending/confirmed/paid/
-- cancelled — see AdminInquiries.tsx); `payment_status` is the new field
-- that reflects Stripe truth only, so an unpaid registration can never look
-- the same as a paid one. Written by workshop-registration-create (pending)
-- and flipped to paid/expired by stripe-webhook — never by the client.
ALTER TABLE public.workshop_registrations
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

ALTER TABLE public.workshop_registrations
  DROP CONSTRAINT IF EXISTS workshop_registrations_payment_status_check;
ALTER TABLE public.workshop_registrations
  ADD CONSTRAINT workshop_registrations_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'expired'));

-- Historical rows predate Stripe and were paid by bank transfer — Silvie
-- already tracked those manually via `status`. Best-effort label so old
-- confirmed/paid registrations don't show up as "awaiting payment"; rows she
-- never marked paid stay 'pending', same as before this migration.
UPDATE public.workshop_registrations
SET payment_status = 'paid'
WHERE status IN ('paid', 'confirmed');

CREATE UNIQUE INDEX IF NOT EXISTS idx_workshop_registrations_stripe_session_id
  ON public.workshop_registrations(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_workshop_registrations_payment_status
  ON public.workshop_registrations(payment_status);

-- The success page is anonymous (no login for workshop registration), so it
-- reads the row directly from the client the same way BookingSuccess.tsx
-- does for session_bookings: readable once it carries a stripe_session_id,
-- which only exists because the visitor was just redirected back from
-- Stripe with that exact id in the URL. See 20260128000000_booking_system.sql.
DROP POLICY IF EXISTS "Anyone can view registration by stripe session" ON public.workshop_registrations;
CREATE POLICY "Anyone can view registration by stripe session"
  ON public.workshop_registrations
  FOR SELECT
  TO anon, authenticated
  USING (stripe_session_id IS NOT NULL);
