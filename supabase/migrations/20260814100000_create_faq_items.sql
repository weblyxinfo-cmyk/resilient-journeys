-- FAQ entries as editable content.
--
-- Today the FAQ lives hardcoded in three places: Membership.tsx and
-- Membership2.tsx (bit-identical, 6 questions) and ResilientHubs.tsx (same
-- 6 questions except #2 and the answer to #6). Each has its own `faqs` array
-- feeding both the rendered accordion and the faqPage() JSON-LD, so a wording
-- fix today means editing three files and redeploying.
--
-- group_key lets one table serve both pages: 'membership' for
-- Membership(2).tsx, 'hubs' for ResilientHubs.tsx.

CREATE TABLE IF NOT EXISTS public.faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  group_key TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,

  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevents duplicate rows if a seed migration is accidentally re-applied.
  CONSTRAINT faq_items_group_question_unique UNIQUE (group_key, question)
);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active faq items" ON public.faq_items;
CREATE POLICY "Anyone can view active faq items"
  ON public.faq_items FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage faq items" ON public.faq_items;
CREATE POLICY "Admins can manage faq items"
  ON public.faq_items FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_faq_items_updated_at ON public.faq_items;
CREATE TRIGGER update_faq_items_updated_at
  BEFORE UPDATE ON public.faq_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS faq_items_group_active_sort_idx
  ON public.faq_items (group_key, is_active, sort_order);
