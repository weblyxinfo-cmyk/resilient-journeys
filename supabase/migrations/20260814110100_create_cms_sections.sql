-- Sections of a page, for the visual admin rebuild (docs/cms-visual-admin.md).
--
-- cms_content.section is just a free-text grouping key today (e.g. "hero",
-- "why_join") with no human title, no page route, and no defined order
-- across sections — the admin can sort rows within a section but has no way
-- to know that "hero" comes before "why_join" on the actual page, or what
-- to call either one for a non-technical client. This table is that missing
-- layer: one row per (page, section) pair the site actually renders, with a
-- client-facing title/description, the DOM anchor the live preview scrolls
-- to, and a sort_order for the section's position on the page.
--
-- Deliberately a separate table rather than columns on cms_content: a
-- section (e.g. "services") groups many cms_content rows, and its title/
-- order is a property of the section, not of any one field in it.

CREATE TABLE IF NOT EXISTS public.cms_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  page TEXT NOT NULL,
  -- Matches cms_content.section for the same page. Not a foreign key —
  -- cms_content.section is free text with no uniqueness constraint, and a
  -- section can exist here before any content row references it.
  section_key TEXT NOT NULL,

  title TEXT NOT NULL,
  description TEXT,

  -- DOM id on the page (e.g. "cms-homepage-hero") that the admin's iframe
  -- preview scrolls to via #anchor in its src URL. NULL means no live
  -- preview is available for this section (falls back to a plain form).
  anchor TEXT,
  -- Route the section lives on, e.g. "/" or "/about". Needed because
  -- cms_content.page values like "shared" span every route — the section
  -- itself still renders on one concrete page (Footer's contact section
  -- shows the same content everywhere, so any route with a Footer works).
  route TEXT NOT NULL,

  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (page, section_key)
);

ALTER TABLE public.cms_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view cms sections" ON public.cms_sections;
CREATE POLICY "Anyone can view cms sections"
  ON public.cms_sections FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage cms sections" ON public.cms_sections;
CREATE POLICY "Admins can manage cms sections"
  ON public.cms_sections FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_cms_sections_updated_at ON public.cms_sections;
CREATE TRIGGER update_cms_sections_updated_at
  BEFORE UPDATE ON public.cms_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS cms_sections_page_sort_idx
  ON public.cms_sections (page, sort_order);
