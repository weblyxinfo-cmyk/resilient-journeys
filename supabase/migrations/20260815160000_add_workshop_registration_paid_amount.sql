-- Captures what a Payment-Link-paid workshop registration actually
-- charged, straight from the Stripe webhook event
-- (session.amount_total / session.currency), because a pasted Payment
-- Link's price lives entirely in Stripe's own configuration and can drift
-- from blog_posts.workshop_price — see docs/workshop-payment-link.md.
--
-- Only ever written by stripe-webhook's client_reference_id branch, and
-- only for registrations paid that way. Stays NULL for every registration
-- paid through the built-in Checkout: there the charged amount is already
-- guaranteed to match workshop_price by workshop-registration-create's own
-- expectedPriceEur check at submission time, so there is nothing new to
-- record. AdminInquiries.tsx uses a non-NULL value here as the signal to
-- show Silvie the actual-vs-listed price, and shows it whenever it's set —
-- not only on mismatch — so an external-link payment stays visibly
-- identifiable even after payment_status flips from 'external' to 'paid'.
ALTER TABLE public.workshop_registrations
  ADD COLUMN IF NOT EXISTS paid_amount_cents INTEGER,
  ADD COLUMN IF NOT EXISTS paid_currency TEXT;
