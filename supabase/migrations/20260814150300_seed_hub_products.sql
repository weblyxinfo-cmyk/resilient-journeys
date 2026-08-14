-- Seed hub_products from the values create-checkout actually charges today
-- (hubConfigs in supabase/functions/create-checkout/index.ts), since that is
-- the amount that has been real money so far — not the display-only
-- hubInfo map in Checkout.tsx, which already agreed with it.
-- ON CONFLICT DO NOTHING so re-running never overwrites an admin edit.

INSERT INTO public.hub_products (hub_slug, name, description, price_eur) VALUES
  ('transformed_self', 'The Transformed Self Hub', 'Carrying Your Strength Across Borders', 127),
  ('endometriosis', 'Endometriosis Management Hub', 'Managing chronic pain while living abroad', 147)
ON CONFLICT (hub_slug) DO NOTHING;
