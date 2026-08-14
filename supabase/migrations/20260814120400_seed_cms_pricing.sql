-- Auto-generated seed for CMS phase 2 (docs/cms-final-seed.md).
-- Pricing.tsx page.
-- value/default_value copied verbatim from the t("key", "fallback") call in the source file
-- named in each row's trailing comment (TypeScript compiler API, not regex -- see
-- scripts/cms-seed.mjs). page/section/field_type/label/sort_order come from the metadata the
-- CMS agents collected while wiring this page (docs/cms-keys-*.json), not guessed.
-- ON CONFLICT (key) DO NOTHING: production already has rows a client may have edited through
-- the admin -- this migration must never overwrite them.

INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type, label, sort_order) VALUES
  ('pricing_hero_badge', 'Membership Pricing', 'Membership Pricing', 'Úvodní obrazovka — Odznak nad nadpisem', 'pricing', 'hero', 'text', 'Odznak nad nadpisem', 10), -- from src/pages/Pricing.tsx:62
  ('pricing_hero_title', 'From Navigating Life Abroad to Truly Thriving', 'From Navigating Life Abroad to Truly Thriving', 'Úvodní obrazovka — Hlavní nadpis', 'pricing', 'hero', 'text', 'Hlavní nadpis', 20), -- from src/pages/Pricing.tsx:67
  ('pricing_hero_subtitle', 'A 12-month guided membership program that transforms the loneliness, uncertainty, and cultural stress of expat life into your greatest strengths.', 'A 12-month guided membership program that transforms the loneliness, uncertainty, and cultural stress of expat life into your greatest strengths.', 'Úvodní obrazovka — Podnadpis', 'pricing', 'hero', 'textarea', 'Podnadpis', 30), -- from src/pages/Pricing.tsx:71
  ('pricing_included_title', 'What''s Included in the Membership', 'What''s Included in the Membership', 'Co je součástí členství — Nadpis sekce', 'pricing', 'obsah_clenstvi', 'text', 'Nadpis sekce', 70), -- from src/pages/Pricing.tsx:115
  ('pricing_included_subtitle', 'Every month you receive:', 'Every month you receive:', 'Co je součástí členství — Podnadpis sekce', 'pricing', 'obsah_clenstvi', 'text', 'Podnadpis sekce', 80), -- from src/pages/Pricing.tsx:118
  ('pricing_included_1_title', 'Guided EFT Sessions', 'Guided EFT Sessions', 'Co je součástí členství — Bod 1 – název (EFT sezení)', 'pricing', 'obsah_clenstvi', 'text', 'Bod 1 – název (EFT sezení)', 90), -- from src/pages/Pricing.tsx:125
  ('pricing_included_1_desc', 'Stress, anxiety, emotional regulation, self-safety', 'Stress, anxiety, emotional regulation, self-safety', 'Co je součástí členství — Bod 1 – popis', 'pricing', 'obsah_clenstvi', 'textarea', 'Bod 1 – popis', 100), -- from src/pages/Pricing.tsx:126
  ('pricing_included_2_title', 'One Monthly Theme', 'One Monthly Theme', 'Co je součástí členství — Bod 2 – název (měsíční téma)', 'pricing', 'obsah_clenstvi', 'text', 'Bod 2 – název (měsíční téma)', 110), -- from src/pages/Pricing.tsx:130
  ('pricing_included_2_desc', 'e.g. stress abroad, loneliness, health challenges, boundaries, stability', 'e.g. stress abroad, loneliness, health challenges, boundaries, stability', 'Co je součástí členství — Bod 2 – popis', 'pricing', 'obsah_clenstvi', 'textarea', 'Bod 2 – popis', 120), -- from src/pages/Pricing.tsx:131
  ('pricing_included_3_title', 'Community Support (Skool)', 'Community Support (Skool)', 'Co je součástí členství — Bod 3 – název (komunita Skool)', 'pricing', 'obsah_clenstvi', 'text', 'Bod 3 – název (komunita Skool)', 130), -- from src/pages/Pricing.tsx:138
  ('pricing_included_3_desc', 'For Premium Membership', 'For Premium Membership', 'Co je součástí členství — Bod 3 – popis', 'pricing', 'obsah_clenstvi', 'textarea', 'Bod 3 – popis', 140), -- from src/pages/Pricing.tsx:139
  ('pricing_included_4_title', 'Practical Tools', 'Practical Tools', 'Co je součástí členství — Bod 4 – název (praktické nástroje)', 'pricing', 'obsah_clenstvi', 'text', 'Bod 4 – název (praktické nástroje)', 150), -- from src/pages/Pricing.tsx:143
  ('pricing_included_4_desc', 'Worksheets, journaling prompts, integration practices', 'Worksheets, journaling prompts, integration practices', 'Co je součástí členství — Bod 4 – popis', 'pricing', 'obsah_clenstvi', 'textarea', 'Bod 4 – popis', 160), -- from src/pages/Pricing.tsx:144
  ('pricing_included_5_title', 'Safe Members-Only Space', 'Safe Members-Only Space', 'Co je součástí členství — Bod 5 – název (bezpečný prostor)', 'pricing', 'obsah_clenstvi', 'text', 'Bod 5 – název (bezpečný prostor)', 170), -- from src/pages/Pricing.tsx:148
  ('pricing_included_5_desc', 'Connection without pressure, sharing is always optional', 'Connection without pressure, sharing is always optional', 'Co je součástí členství — Bod 5 – popis', 'pricing', 'obsah_clenstvi', 'textarea', 'Bod 5 – popis', 180), -- from src/pages/Pricing.tsx:149
  ('pricing_tiers_title', 'Resilient Mind Membership', 'Resilient Mind Membership', 'Členské programy — Nadpis sekce', 'pricing', 'programy', 'text', 'Nadpis sekce', 50), -- from src/pages/Pricing.tsx:95
  ('pricing_tiers_subtitle', 'An online membership with guided practical tools and video support. Pay as you go — no auto-renewal.', 'An online membership with guided practical tools and video support. Pay as you go — no auto-renewal.', 'Členské programy — Podnadpis sekce', 'pricing', 'programy', 'textarea', 'Podnadpis sekce', 60), -- from src/pages/Pricing.tsx:98
  ('pricing_intro_text', 'Ongoing emotional support and nervous system regulation for expat women.', 'Ongoing emotional support and nervous system regulation for expat women.', 'Úvodní text pod hero sekcí — Text', 'pricing', 'uvod', 'textarea', 'Text', 40), -- from src/pages/Pricing.tsx:84
  ('pricing_cta_title', 'Ready to Begin Your Journey?', 'Ready to Begin Your Journey?', 'Výzva k akci (dole na stránce) — Nadpis', 'pricing', 'vyzva', 'text', 'Nadpis', 190), -- from src/pages/Pricing.tsx:177
  ('pricing_cta_text', 'Choose the plan that resonates with you. You can upgrade or change your membership at any time.', 'Choose the plan that resonates with you. You can upgrade or change your membership at any time.', 'Výzva k akci (dole na stránce) — Text', 'pricing', 'vyzva', 'textarea', 'Text', 200), -- from src/pages/Pricing.tsx:180
  ('pricing_cta_button_start', 'Get Started', 'Get Started', 'Výzva k akci (dole na stránce) — Text tlačítka „Začít"', 'pricing', 'vyzva', 'text', 'Text tlačítka „Začít"', 210), -- from src/pages/Pricing.tsx:199
  ('pricing_cta_button_learn_more', 'Learn More', 'Learn More', 'Výzva k akci (dole na stránce) — Text tlačítka „Zjistit více"', 'pricing', 'vyzva', 'text', 'Text tlačítka „Zjistit více"', 220) -- from src/pages/Pricing.tsx:207
ON CONFLICT (key) DO NOTHING;
