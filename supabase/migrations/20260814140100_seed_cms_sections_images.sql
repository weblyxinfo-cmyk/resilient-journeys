-- Two new cms_content sections introduced by 20260814140000_seed_cms_images.sql
-- that don't map onto any existing cms_sections row (docs/cms-images.md).
INSERT INTO public.cms_sections (page, section_key, title, description, anchor, route, sort_order) VALUES
  ('shared', 'hero_background', 'Podkladová fotka za úvodní obrazovkou', 'Fotka na pozadí — sdílená mezi hlavní stránkou a hlavičkou (PageHero) všech dalších stránek. Náhled ukazuje hlavní stránku, ale změna se projeví všude.', 'cms-homepage-hero', '/', 200),
  ('shared', 'logo', 'Logo webu', 'Logo v navigaci a patičce, zobrazuje se na všech stránkách.', NULL, '/', 210)
ON CONFLICT (page, section_key) DO NOTHING;
