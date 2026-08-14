-- Auto-generated seed for CMS phase 2 (docs/cms-final-seed.md).
-- New homepage section (Pricing.tsx component, the 1:1 Session pricing teaser embedded on the
-- homepage) -- distinct from the 18 pre-existing homepage_hero_*/services_*/etc. rows seeded in
-- 20260806130000/20260807110000, which this migration does not touch. Price stays out of the CMS.
-- value/default_value copied verbatim from the t("key", "fallback") call in the source file
-- named in each row's trailing comment (TypeScript compiler API, not regex -- see
-- scripts/cms-seed.mjs). page/section/field_type/label/sort_order come from the metadata the
-- CMS agents collected while wiring this page (docs/cms-keys-*.json), not guessed.
-- ON CONFLICT (key) DO NOTHING: production already has rows a client may have edited through
-- the admin -- this migration must never overwrite them.

INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type, label, sort_order) VALUES
  ('homepage_session_badge', 'Simple Pricing', 'Simple Pricing', 'Sekce ceníku na homepage — nadpis — Odznak nad nadpisem', 'homepage', 'session_header', 'text', 'Odznak nad nadpisem', 10), -- from src/components/Pricing.tsx:43
  ('homepage_session_title_prefix', 'From Navigating Life Abroad to Truly', 'From Navigating Life Abroad to Truly', 'Sekce ceníku na homepage — nadpis — Nadpis — první část', 'homepage', 'session_header', 'text', 'Nadpis — první část', 20), -- from src/components/Pricing.tsx:47
  ('homepage_session_title_highlight', 'Thriving', 'Thriving', 'Sekce ceníku na homepage — nadpis — Nadpis — zvýrazněné slovo', 'homepage', 'session_header', 'text', 'Nadpis — zvýrazněné slovo', 30), -- from src/components/Pricing.tsx:47
  ('homepage_session_subtitle', 'A 12-month guided membership program that transforms the loneliness, uncertainty, and cultural stress of expat life into your greatest strengths.', 'A 12-month guided membership program that transforms the loneliness, uncertainty, and cultural stress of expat life into your greatest strengths.', 'Sekce ceníku na homepage — nadpis — Podnadpis', 'homepage', 'session_header', 'textarea', 'Podnadpis', 40), -- from src/components/Pricing.tsx:50
  ('homepage_session_card_name', '1:1 Session', '1:1 Session', 'Karta „1:1 Session" (cena zůstává mimo CMS) — Název karty', 'homepage', 'session_karta', 'text', 'Název karty', 110), -- from src/components/Pricing.tsx:13
  ('homepage_session_card_period', '/session', '/session', 'Karta „1:1 Session" (cena zůstává mimo CMS) — Perioda za cenou (např. „/session")', 'homepage', 'session_karta', 'text', 'Perioda za cenou (např. „/session")', 120), -- from src/components/Pricing.tsx:15
  ('homepage_session_card_feature_1', '60-minute private session', '60-minute private session', 'Karta „1:1 Session" (cena zůstává mimo CMS) — Vlastnost 1', 'homepage', 'session_karta', 'text', 'Vlastnost 1', 130), -- from src/components/Pricing.tsx:17
  ('homepage_session_card_feature_2', 'Personalized action plan', 'Personalized action plan', 'Karta „1:1 Session" (cena zůstává mimo CMS) — Vlastnost 2', 'homepage', 'session_karta', 'text', 'Vlastnost 2', 140), -- from src/components/Pricing.tsx:18
  ('homepage_session_card_feature_3', 'Follow-up resources', 'Follow-up resources', 'Karta „1:1 Session" (cena zůstává mimo CMS) — Vlastnost 3', 'homepage', 'session_karta', 'text', 'Vlastnost 3', 150), -- from src/components/Pricing.tsx:19
  ('homepage_session_card_feature_4', 'Online or in-person (Spain)', 'Online or in-person (Spain)', 'Karta „1:1 Session" (cena zůstává mimo CMS) — Vlastnost 4', 'homepage', 'session_karta', 'text', 'Vlastnost 4', 160), -- from src/components/Pricing.tsx:20
  ('homepage_session_card_feature_5', 'Flexible scheduling', 'Flexible scheduling', 'Karta „1:1 Session" (cena zůstává mimo CMS) — Vlastnost 5', 'homepage', 'session_karta', 'text', 'Vlastnost 5', 170), -- from src/components/Pricing.tsx:21
  ('homepage_session_card_button', 'Book Session', 'Book Session', 'Karta „1:1 Session" (cena zůstává mimo CMS) — Text tlačítka', 'homepage', 'session_karta', 'text', 'Text tlačítka', 180), -- from src/components/Pricing.tsx:23
  ('homepage_session_steps_title', 'How to Get Started', 'How to Get Started', 'Jak začít (4 kroky) — Nadpis boxu', 'homepage', 'session_kroky', 'text', 'Nadpis boxu', 50), -- from src/components/Pricing.tsx:67
  ('homepage_session_steps_1', 'Choose the membership that suits you.', 'Choose the membership that suits you.', 'Jak začít (4 kroky) — Krok 1', 'homepage', 'session_kroky', 'text', 'Krok 1', 60), -- from src/components/Pricing.tsx:71
  ('homepage_session_steps_2', 'Click Sign Up to create your personal account.', 'Click Sign Up to create your personal account.', 'Jak začít (4 kroky) — Krok 2', 'homepage', 'session_kroky', 'text', 'Krok 2', 70), -- from src/components/Pricing.tsx:72
  ('homepage_session_steps_3', 'Complete your secure payment via Stripe.', 'Complete your secure payment via Stripe.', 'Jak začít (4 kroky) — Krok 3', 'homepage', 'session_kroky', 'text', 'Krok 3', 80), -- from src/components/Pricing.tsx:73
  ('homepage_session_steps_4', 'You''ll receive a welcome email and instant access to your private Dashboard with the full 12-month programme.', 'You''ll receive a welcome email and instant access to your private Dashboard with the full 12-month programme.', 'Jak začít (4 kroky) — Krok 4', 'homepage', 'session_kroky', 'textarea', 'Krok 4', 90), -- from src/components/Pricing.tsx:76
  ('homepage_session_description', 'Through Resilient Mind Membership Program, you will explore personal beliefs that may be limiting your progress, develop greater self-awareness, and create space to enjoy the simple, meaningful moments of your life with clarity and presence.', 'Through Resilient Mind Membership Program, you will explore personal beliefs that may be limiting your progress, develop greater self-awareness, and create space to enjoy the simple, meaningful moments of your life with clarity and presence.', 'Popisný odstavec o programu — Text', 'homepage', 'session_popis', 'textarea', 'Text', 100) -- from src/components/Pricing.tsx:94
ON CONFLICT (key) DO NOTHING;
