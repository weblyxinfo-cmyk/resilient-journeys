-- Membership tiers as editable content — the last major piece of pricing that
-- lived hardcoded in src/lib/pricing.ts (MEMBERSHIP_TIERS). create-checkout
-- reads this table for the amount it actually charges (see loadPlanConfig),
-- so a bad row here is a bad Stripe charge. Kept deliberately narrow: no
-- price above/below sane bounds, and tier_key is never editable once seeded
-- (enforced in the admin UI, not here — Postgres has no easy "immutable
-- column" constraint, and the admin is the only writer besides this seed).
--
-- price_eur >= 5: the dangerous typo is downward (37 -> 3.7 or 0.37), not
-- upward — an upward typo just means nobody pays. See docs/cms-review.md §B3.

CREATE TABLE IF NOT EXISTS public.membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Sent by the client and matched by create-checkout. Legacy aliases
  -- (monthly_basic, yearly_premium, ...) are mapped to this in the edge
  -- function code, not duplicated here as rows.
  tier_key TEXT NOT NULL UNIQUE,

  name TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,

  price_eur NUMERIC(10,2) NOT NULL CHECK (price_eur >= 5 AND price_eur <= 2000),
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('month', 'year')),
  membership_type TEXT NOT NULL CHECK (membership_type IN ('basic', 'premium')),
  period_label TEXT,

  button_text TEXT,
  badge TEXT,
  quote TEXT,
  savings_note TEXT,

  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  ideal_for JSONB NOT NULL DEFAULT '[]'::jsonb,

  highlighted BOOLEAN NOT NULL DEFAULT false,
  -- Basic/Premium Yearly ship with hidden = true today (not offered on the
  -- pricing page yet); editable in the admin so the client can turn a tier
  -- on without a developer.
  hidden BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT membership_tiers_features_is_array CHECK (jsonb_typeof(features) = 'array'),
  CONSTRAINT membership_tiers_ideal_for_is_array CHECK (jsonb_typeof(ideal_for) = 'array')
);

ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;

-- is_active, not hidden: a hidden-but-active tier (e.g. yearly plans) must
-- still be readable by create-checkout for anonymous... actually all callers
-- are authenticated, but the pricing page itself is public, so anon SELECT
-- is required for the price to render before login.
DROP POLICY IF EXISTS "Anyone can view active membership tiers" ON public.membership_tiers;
CREATE POLICY "Anyone can view active membership tiers"
  ON public.membership_tiers FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage membership tiers" ON public.membership_tiers;
CREATE POLICY "Admins can manage membership tiers"
  ON public.membership_tiers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_membership_tiers_updated_at ON public.membership_tiers;
CREATE TRIGGER update_membership_tiers_updated_at
  BEFORE UPDATE ON public.membership_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS membership_tiers_active_sort_idx
  ON public.membership_tiers (is_active, sort_order);
