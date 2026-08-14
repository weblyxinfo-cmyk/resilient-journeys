-- Wires every hardcoded <img>/background-image in src/ (excluding blog,
-- workshops-from-DB, videos, booking_cards — those already have their own
-- admin) to cms_content as field_type='image_url', so they're editable from
-- the visual admin (docs/cms-images.md).
--
-- value/default_value are the exact path already rendered on the site
-- today — this migration is a no-op for what the page renders until an
-- admin actually replaces a photo.
--
-- Two keys (shared_hero_background_image, homepage_why_join_image) are
-- called in code as t(key, importedAsset) — a Vite-imported src/assets/
-- file, not a string literal — so scripts/cms-seed.mjs can't auto-generate
-- their seed (see its collectTCalls skip warning) and this migration's
-- `value` is NOT the same string as the code fallback. It points at a byte
-- identical copy of the same image duplicated into public/ (see
-- docs/cms-images.md) so the DB can hold a stable URL; the src/assets/
-- import stays as the code fallback for when this row is missing/empty.
-- Every other row below is a plain public/ path already, so its value is
-- the same string as the t() fallback, like any other CMS field.
INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type, label, sort_order) VALUES
  ('shared_hero_background_image', '/hero-bg.jpg', '/hero-bg.jpg', 'Podkladová fotka za úvodní obrazovkou — používá se na hlavní stránce (Hero, sekce Ceník a Proč se připojit) a v hlavičce každé další stránky přes komponentu PageHero (O mně, Ceník, Rezervace, Členství, Workshopy, Resilient Hub/Huby, Zdarma průvodce a další).', 'shared', 'hero_background', 'image_url', 'Podkladová fotka za úvodní obrazovkou', 10), -- from src/components/Hero.tsx:14, src/components/PageHero.tsx:14, src/components/Pricing.tsx:31, src/components/Services.tsx:164
  ('homepage_why_join_image', '/why-join.jpg', '/why-join.jpg', 'Fotka vedle seznamu výhod v sekci „Proč se připojit" na hlavní stránce.', 'homepage', 'why_join', 'image_url', 'Fotka vedle seznamu výhod', 110), -- from src/components/Services.tsx:202
  ('shared_about_preview_photo', '/silvie.jpg', '/silvie.jpg', 'Fotka v náhledu sekce O mně na hlavní stránce.', 'shared', 'about_preview', 'image_url', 'Fotka v náhledu sekce O mně', 5), -- from src/components/AboutPreview.tsx:23
  ('about_intro_photo', '/silvie.jpg', '/silvie.jpg', 'Fotka v úvodní sekci stránky O mně.', 'about', 'intro', 'image_url', 'Fotka v úvodní sekci', 5), -- from src/pages/About.tsx:52
  ('membership_hero_photo', '/membership-hero-photo.jpg', '/membership-hero-photo.jpg', 'Fotka v pravém sloupci úvodní obrazovky členství.', 'membership', 'hero', 'image_url', 'Fotka v úvodní sekci', 149), -- from src/pages/Membership.tsx:163
  ('membership_transformation_photo', '/membership-transformation.jpg', '/membership-transformation.jpg', 'Fotka proměny „před/po“ nad popiskem.', 'membership', 'transformation', 'image_url', 'Fotka proměny „před/po“', 5), -- from src/pages/Membership.tsx:313
  ('workshops_silk_photo_1', '/workshops/workshop-1.jpg', '/workshops/workshop-1.jpg', 'Sekce – Malby na hedvábí — Fotka 1 ze 3.', 'workshopy', 'silk_paintings', 'image_url', 'Fotka 1 — malby na hedvábí', 90), -- from src/pages/Workshopy.tsx:110
  ('workshops_silk_photo_2', '/workshops/workshop-2.jpg', '/workshops/workshop-2.jpg', 'Sekce – Malby na hedvábí — Fotka 2 ze 3.', 'workshopy', 'silk_paintings', 'image_url', 'Fotka 2 — malby na hedvábí', 100), -- from src/pages/Workshopy.tsx:117
  ('workshops_silk_photo_3', '/workshops/workshop-3.jpg', '/workshops/workshop-3.jpg', 'Sekce – Malby na hedvábí — Fotka 3 ze 3.', 'workshopy', 'silk_paintings', 'image_url', 'Fotka 3 — malby na hedvábí', 110), -- from src/pages/Workshopy.tsx:124
  ('workshops_kids_photo_1', '/workshops/workshop-4.jpg', '/workshops/workshop-4.jpg', 'Sekce – Workshopy pro děti a rodiče — Fotka 1 ze 2.', 'workshopy', 'kids_parents', 'image_url', 'Fotka 1 — workshopy pro děti a rodiče', 130), -- from src/pages/Workshopy.tsx:157
  ('workshops_kids_photo_2', '/workshops/workshop-5.jpg', '/workshops/workshop-5.jpg', 'Sekce – Workshopy pro děti a rodiče — Fotka 2 ze 2.', 'workshopy', 'kids_parents', 'image_url', 'Fotka 2 — workshopy pro děti a rodiče', 140), -- from src/pages/Workshopy.tsx:164
  ('workshops_adults_photo_1', '/workshops/workshop-6.jpg', '/workshops/workshop-6.jpg', 'Sekce – Workshopy pro dospělé — Fotka 1 ze 4.', 'workshopy', 'adults', 'image_url', 'Fotka 1 — workshopy pro dospělé', 170), -- from src/pages/Workshopy.tsx:197
  ('workshops_adults_photo_2', '/workshops/workshop-7.jpg', '/workshops/workshop-7.jpg', 'Sekce – Workshopy pro dospělé — Fotka 2 ze 4.', 'workshopy', 'adults', 'image_url', 'Fotka 2 — workshopy pro dospělé', 180), -- from src/pages/Workshopy.tsx:204
  ('workshops_adults_photo_3', '/workshops/workshop-8.jpg', '/workshops/workshop-8.jpg', 'Sekce – Workshopy pro dospělé — Fotka 3 ze 4.', 'workshopy', 'adults', 'image_url', 'Fotka 3 — workshopy pro dospělé', 190), -- from src/pages/Workshopy.tsx:211
  ('workshops_adults_photo_4', '/workshops/workshop-9.jpg', '/workshops/workshop-9.jpg', 'Sekce – Workshopy pro dospělé — Fotka 4 ze 4.', 'workshopy', 'adults', 'image_url', 'Fotka 4 — workshopy pro dospělé', 200), -- from src/pages/Workshopy.tsx:218
  ('shared_logo_image', '/assets/resilient-mind-logo.png', '/assets/resilient-mind-logo.png', 'Logo v navigaci a patičce, zobrazuje se na všech stránkách.', 'shared', 'logo', 'image_url', 'Logo webu', 10) -- from src/components/Logo.tsx:7
ON CONFLICT (key) DO NOTHING;
