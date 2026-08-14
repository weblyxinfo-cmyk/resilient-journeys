-- Backfills the EPC QR beneficiary name (added in the previous migration)
-- for existing paid workshops. Only fills rows that have an IBAN but no
-- name yet, so it never overwrites a value someone already entered.
UPDATE public.blog_posts
SET payment_beneficiary_name = 'Silvie Bogdánová'
WHERE payment_iban IS NOT NULL
  AND payment_beneficiary_name IS NULL;
