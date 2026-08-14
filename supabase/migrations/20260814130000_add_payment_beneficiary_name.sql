-- EPC (Girocode) QR payments require the beneficiary's name; SPAYD does not
-- carry it, so blog_posts had no column for it until now.
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS payment_beneficiary_name TEXT;
