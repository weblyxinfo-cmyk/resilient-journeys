-- Hub products (one-time purchases) as editable content. Today the €127 /
-- €147 prices are hardcoded in create-checkout (hubConfigs) and duplicated,
-- not always consistently, in Checkout.tsx's display-only hubInfo map.
-- create-checkout reads this table for the amount it actually charges (see
-- loadHubConfig), so the same price-typo caution as membership_tiers
-- applies — see docs/cms-review.md §B3.

CREATE TABLE IF NOT EXISTS public.hub_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  hub_slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,

  price_eur NUMERIC(10,2) NOT NULL CHECK (price_eur >= 5 AND price_eur <= 2000),

  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hub_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active hub products" ON public.hub_products;
CREATE POLICY "Anyone can view active hub products"
  ON public.hub_products FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage hub products" ON public.hub_products;
CREATE POLICY "Admins can manage hub products"
  ON public.hub_products FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_hub_products_updated_at ON public.hub_products;
CREATE TRIGGER update_hub_products_updated_at
  BEFORE UPDATE ON public.hub_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS hub_products_active_idx
  ON public.hub_products (is_active);
