-- New CMS keys introduced when WorkshopRegistration.tsx switched from a
-- manual bank-transfer QR code to Stripe Checkout (docs/workshop-stripe.md).
-- value/default_value copied verbatim from the t("key", "fallback") call.
-- ON CONFLICT (key) DO NOTHING: production may already have a client-edited
-- row — this migration must never overwrite it.
--
-- Not touched here: the workshopform_reg_qr_* / workshopform_reg_success_*
-- keys already seeded (20260814122000, 20260815120000) are no longer
-- rendered by the component but are left in place per docs/workshop-stripe.md
-- — orphaned CMS content, not deleted.

INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type, label, sort_order) VALUES
  ('workshopform_reg_security_note', 'Payment is secured by Stripe. You''ll be redirected to complete your purchase by card.', 'Payment is secured by Stripe. You''ll be redirected to complete your purchase by card.', 'Úvodní text a platba — Poznámka o platbě kartou přes Stripe', 'workshop-registration', 'uvod', 'text', 'Poznámka o platbě kartou přes Stripe', 125), -- from src/components/WorkshopRegistration.tsx
  ('workshopform_reg_payment_cancelled_notice', 'Payment was cancelled. You can try again below.', 'Payment was cancelled. You can try again below.', 'Registrační formulář — Hláška po návratu ze zrušené platby', 'workshop-registration', 'formular', 'text', 'Hláška po návratu ze zrušené platby', 225), -- from src/components/WorkshopRegistration.tsx
  ('workshopform_reg_payment_error', 'Payment is temporarily unavailable. Please try again in a moment.', 'Payment is temporarily unavailable. Please try again in a moment.', 'Registrační formulář — Chybová hláška, když platbu nejde spustit', 'workshop-registration', 'formular', 'text', 'Chybová hláška, když platbu nejde spustit', 230) -- from src/components/WorkshopRegistration.tsx
ON CONFLICT (key) DO NOTHING;
