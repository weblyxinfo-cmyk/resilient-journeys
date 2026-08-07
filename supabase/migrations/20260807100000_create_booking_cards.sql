-- Booking cards as editable content.
--
-- The /booking cards have always lived in a hardcoded SESSION_TYPES array in
-- src/pages/Booking.tsx, so every copy or price change needed a developer and a
-- deploy — which is how the EFT offer sat expired and unbookable.
--
-- session_type_config (from the old coach_availability migration) is not usable
-- for this: it is keyed on the session_type enum, carries only title/description/
-- duration/price, and its only reader (SessionTypeSelector via BookingForm) is
-- dead code that nothing imports.
--
-- Variable-length content (bullets, extra sections) is JSONB rather than child
-- tables — it is always read and written as a whole card, never queried into.

CREATE TABLE IF NOT EXISTS public.booking_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- UI key. Two cards may share one bookable session (see booking_type), so this
  -- is not the session_type enum.
  card_key TEXT NOT NULL UNIQUE,
  -- Session type sent to booking-create. NULL means "same as card_key".
  booking_type TEXT,

  title TEXT NOT NULL,
  badge TEXT,
  image TEXT,

  duration_minutes INTEGER NOT NULL DEFAULT 60,
  duration_label TEXT,
  price_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_note TEXT,

  description TEXT NOT NULL DEFAULT '',
  features_heading TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  extra_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  note TEXT,

  contact_heading TEXT,
  phone TEXT,
  email TEXT,

  -- Time-limited offers hide themselves after this date. NULL = always visible.
  valid_until DATE,
  highlight BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT booking_cards_features_is_array CHECK (jsonb_typeof(features) = 'array'),
  CONSTRAINT booking_cards_extra_sections_is_array CHECK (jsonb_typeof(extra_sections) = 'array'),
  CONSTRAINT booking_cards_price_non_negative CHECK (price_eur >= 0),
  CONSTRAINT booking_cards_duration_positive CHECK (duration_minutes > 0)
);

ALTER TABLE public.booking_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active booking cards" ON public.booking_cards;
CREATE POLICY "Anyone can view active booking cards"
  ON public.booking_cards FOR SELECT
  USING (is_active = true);

-- Explicit WITH CHECK: cms_content was left out of the earlier RLS insert fix
-- and its admin policy still relies on USING standing in for it.
DROP POLICY IF EXISTS "Admins can manage booking cards" ON public.booking_cards;
CREATE POLICY "Admins can manage booking cards"
  ON public.booking_cards FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_booking_cards_updated_at ON public.booking_cards;
CREATE TRIGGER update_booking_cards_updated_at
  BEFORE UPDATE ON public.booking_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS booking_cards_active_sort_idx
  ON public.booking_cards (is_active, sort_order);
