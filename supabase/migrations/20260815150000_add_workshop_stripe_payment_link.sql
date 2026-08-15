-- Optional "bring your own Stripe Payment Link" escape hatch for workshops.
-- Silvie can paste a Payment Link created directly in the Stripe Dashboard
-- (https://buy.stripe.com/...) instead of relying on the built-in Checkout
-- flow (docs/workshop-stripe.md). Empty/NULL = no change, existing
-- workshop-registration-create → Stripe Checkout path runs exactly as
-- before. See docs/workshop-payment-link.md for the full design.
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS stripe_payment_link TEXT;

-- 'external' marks a registration paid through a Payment Link rather than
-- our own Checkout session. Set by workshop-registration-create at
-- insert time (instead of 'pending') when the workshop has a payment link,
-- and — same as 'pending' → 'paid' — only ever flipped onward by
-- stripe-webhook, never by the client or by AdminInquiries. It exists so an
-- external-link registration can never look identical to a normal
-- confirmed-by-us 'pending' row: Silvie can tell at a glance which
-- registrations came through a payment path Stripe's price/webhook
-- guarantees don't fully cover, in case she ever needs to double check one
-- by hand.
ALTER TABLE public.workshop_registrations
  DROP CONSTRAINT IF EXISTS workshop_registrations_payment_status_check;
ALTER TABLE public.workshop_registrations
  ADD CONSTRAINT workshop_registrations_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'expired', 'external'));
