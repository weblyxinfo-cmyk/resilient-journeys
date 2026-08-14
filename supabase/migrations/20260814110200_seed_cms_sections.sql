-- Seed cms_sections for every section that currently has cms_content rows,
-- in the order it actually renders on the page (verified against
-- src/pages/Index.tsx, src/components/Hero.tsx, IntroVideo.tsx,
-- Services.tsx, src/pages/About.tsx, src/components/Footer.tsx).
--
-- Homepage renders Hero → IntroVideo → Services (which itself renders, in
-- this order, the "why join" list, the "approach" cards, the "who it's for"
-- box, the "ways to work" list, then the services grid) → AboutPreview →
-- Testimonials → Pricing → LeadMagnet. Only the sections with cms_content
-- rows today get a row here; AboutPreview/Testimonials/Pricing/LeadMagnet
-- have no CMS keys yet and are left out on purpose (§7 of the admin spec:
-- an orphan cms_content row falls back to "Other", not the other way
-- around — an empty section would just be a dead tab).
--
-- Titles/descriptions are written for the client (Czech), not the
-- developer — this is what she sees as the page structure in the admin.

INSERT INTO public.cms_sections (page, section_key, title, description, anchor, route, sort_order) VALUES
  ('homepage', 'hero', 'Úvodní obrazovka', 'První, co návštěvník uvidí po otevření webu.', 'cms-homepage-hero', '/', 10),
  ('homepage', 'intro_video', 'Úvodní video', 'Krátké video pod úvodní obrazovkou.', 'cms-homepage-intro_video', '/', 20),
  ('homepage', 'why_join', 'Proč se připojit', 'Pět bodů s výhodami připojení k Resilient Mind.', 'cms-homepage-why_join', '/', 30),
  ('homepage', 'approach', 'Proč náš přístup funguje', 'Tři karty vysvětlující metodiku.', 'cms-homepage-approach', '/', 40),
  ('homepage', 'who_its_for', 'Pro koho to je', 'Seznam typů klientek, pro které je program určený.', 'cms-homepage-who_its_for', '/', 50),
  ('homepage', 'ways_to_work', 'Způsoby spolupráce', 'Tři možnosti, jak lze s Resilient Mind spolupracovat.', 'cms-homepage-ways_to_work', '/', 60),
  ('homepage', 'services', 'Karty služeb', 'Tři klikací karty na konci stránky — Resilient Hubs, konzultace, workshopy.', 'cms-homepage-services', '/', 70),
  ('about', 'intro', 'Úvodní sekce (Kdo jsem)', 'Fotka, nadpis, text a video hned pod navigací na stránce O mně.', 'cms-about-intro', '/about', 10),
  ('shared', 'contact', 'Patička webu — kontakt', 'Kontaktní e-mail v patičce, zobrazuje se na všech stránkách.', 'cms-shared-contact', '/', 10)
ON CONFLICT (page, section_key) DO NOTHING;
