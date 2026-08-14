-- Consolidate cms_content RLS policies.
--
-- Production has accumulated duplicate policies from two rounds of manual
-- fixes: two SELECT policies ("Anyone can read cms_content" from the
-- 20260206100000 migration, and "Anyone can view cms content" applied
-- directly against prod) and two ALL policies ("Admins can manage
-- cms_content" / "Admins can manage cms content"), neither of which has an
-- explicit WITH CHECK — booking_cards got that fix (20260807100000) but
-- cms_content was missed. Functionally harmless (Postgres falls back to
-- USING for the check when WITH CHECK is absent), but drop down to one of
-- each, matching the booking_cards pattern, with an explicit WITH CHECK.

-- Each DROP is immediately followed by its replacement CREATE (rather than
-- dropping all four first) so that, on any execution path that does not
-- wrap this whole file in one transaction, the window during which anon
-- SELECT has no matching policy is as short as a single statement pair,
-- not the whole file. (When applied as one multi-statement query — e.g. via
-- the Supabase Management API /database/query endpoint per docs/cms-mapa.md
-- §1.6 — Postgres's simple query protocol runs the whole batch as one
-- implicit transaction anyway, so there is no externally visible gap at all.)
DROP POLICY IF EXISTS "Anyone can read cms_content" ON public.cms_content;
DROP POLICY IF EXISTS "Anyone can view cms content" ON public.cms_content;
CREATE POLICY "Anyone can read cms_content"
  ON public.cms_content FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage cms_content" ON public.cms_content;
DROP POLICY IF EXISTS "Admins can manage cms content" ON public.cms_content;
CREATE POLICY "Admins can manage cms_content"
  ON public.cms_content FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
