-- Auto-generated seed for CMS phase 2 (docs/cms-final-seed.md).
-- FreeGuideThankYou.tsx.
-- value/default_value copied verbatim from the t("key", "fallback") call in the source file
-- named in each row's trailing comment (TypeScript compiler API, not regex -- see
-- scripts/cms-seed.mjs). page/section/field_type/label/sort_order come from the metadata the
-- CMS agents collected while wiring this page (docs/cms-keys-*.json), not guessed.
-- ON CONFLICT (key) DO NOTHING: production already has rows a client may have edited through
-- the admin -- this migration must never overwrite them.

INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type, label, sort_order) VALUES
  ('freeguide_thanks_title', 'Your Free 7-Day Practice Kit Is Ready!', 'Your Free 7-Day Practice Kit Is Ready!', 'Hlavička poděkování — Hlavní nadpis', 'thank-you', 'hlavicka', 'text', 'Hlavní nadpis', 20), -- from src/pages/FreeGuideThankYou.tsx:56
  ('freeguide_thanks_subtitle', 'We''ve also sent the kit to your email so you can access it anytime.', 'We''ve also sent the kit to your email so you can access it anytime.', 'Hlavička poděkování — Podnadpis', 'thank-you', 'hlavicka', 'text', 'Podnadpis', 30), -- from src/pages/FreeGuideThankYou.tsx:59
  ('freeguide_thanks_back_link', 'Back to home', 'Back to home', 'Navigace — Odkaz zpět na hlavní stránku', 'thank-you', 'navigace', 'text', 'Odkaz zpět na hlavní stránku', 10), -- from src/pages/FreeGuideThankYou.tsx:36
  ('freeguide_thanks_share_text_pre', 'Love to share? Send your friends', 'Love to share? Send your friends', 'Sdílení s přáteli — Text před URL adresou', 'thank-you', 'sdileni', 'text', 'Text před URL adresou', 180), -- from src/pages/FreeGuideThankYou.tsx:119
  ('freeguide_thanks_share_url', 'resilientmind.io/free-guide', 'resilientmind.io/free-guide', 'Sdílení s přáteli — Zvýrazněná URL adresa', 'thank-you', 'sdileni', 'text', 'Zvýrazněná URL adresa', 190), -- from src/pages/FreeGuideThankYou.tsx:120
  ('freeguide_thanks_share_text_post', 'so they can get their own copy.', 'so they can get their own copy.', 'Sdílení s přáteli — Text za URL adresou', 'thank-you', 'sdileni', 'text', 'Text za URL adresou', 200), -- from src/pages/FreeGuideThankYou.tsx:121
  ('freeguide_thanks_download1_title', '7-Day Gratitude Workbook', '7-Day Gratitude Workbook', 'Soubory ke stažení — Název souboru 1 (vděčnost)', 'thank-you', 'soubory_ke_stazeni', 'text', 'Název souboru 1 (vděčnost)', 120), -- from src/pages/FreeGuideThankYou.tsx:82
  ('freeguide_thanks_download1_subtitle', 'Morning practice & evening reflection', 'Morning practice & evening reflection', 'Soubory ke stažení — Popisek souboru 1', 'thank-you', 'soubory_ke_stazeni', 'text', 'Popisek souboru 1', 130), -- from src/pages/FreeGuideThankYou.tsx:83
  ('freeguide_thanks_download2_title', '7-Day EFT Tapping Workbook', '7-Day EFT Tapping Workbook', 'Soubory ke stažení — Název souboru 2 (EFT tapping)', 'thank-you', 'soubory_ke_stazeni', 'text', 'Název souboru 2 (EFT tapping)', 140), -- from src/pages/FreeGuideThankYou.tsx:98
  ('freeguide_thanks_download2_subtitle', 'Release stress & rebuild confidence', 'Release stress & rebuild confidence', 'Soubory ke stažení — Popisek souboru 2', 'thank-you', 'soubory_ke_stazeni', 'text', 'Popisek souboru 2', 150), -- from src/pages/FreeGuideThankYou.tsx:99
  ('freeguide_thanks_video_title', 'Guided EFT Tapping Video', 'Guided EFT Tapping Video', 'Soubory ke stažení — Název položky – video s návodem', 'thank-you', 'soubory_ke_stazeni', 'text', 'Název položky – video s návodem', 160), -- from src/pages/FreeGuideThankYou.tsx:110
  ('freeguide_thanks_video_subtitle', 'Create a free account at resilientmind.io/auth to access', 'Create a free account at resilientmind.io/auth to access', 'Soubory ke stažení — Popisek položky – video s návodem', 'thank-you', 'soubory_ke_stazeni', 'text', 'Popisek položky – video s návodem', 170), -- from src/pages/FreeGuideThankYou.tsx:111
  ('freeguide_thanks_home_button', 'Return to homepage', 'Return to homepage', 'Tlačítko zpět — Text tlačítka Návrat na hlavní stránku', 'thank-you', 'tlacitko', 'text', 'Text tlačítka Návrat na hlavní stránku', 210), -- from src/pages/FreeGuideThankYou.tsx:130
  ('freeguide_thanks_email_notice_title', '📧 Can''t find the email?', '📧 Can''t find the email?', 'Upozornění na e-mail — Nadpis upozornění', 'thank-you', 'upozorneni_email', 'text', 'Nadpis upozornění', 40), -- from src/pages/FreeGuideThankYou.tsx:65
  ('freeguide_thanks_email_notice_text_pre', 'Please check your', 'Please check your', 'Upozornění na e-mail — Text před slovem Promotions', 'thank-you', 'upozorneni_email', 'text', 'Text před slovem Promotions', 50), -- from src/pages/FreeGuideThankYou.tsx:68
  ('freeguide_thanks_email_notice_promotions', 'Promotions', 'Promotions', 'Upozornění na e-mail — Zvýrazněné slovo Promotions', 'thank-you', 'upozorneni_email', 'text', 'Zvýrazněné slovo Promotions', 60), -- from src/pages/FreeGuideThankYou.tsx:68
  ('freeguide_thanks_email_notice_or', 'or', 'or', 'Upozornění na e-mail — Spojka "or"', 'thank-you', 'upozorneni_email', 'text', 'Spojka "or"', 70), -- from src/pages/FreeGuideThankYou.tsx:68
  ('freeguide_thanks_email_notice_spam', 'Spam', 'Spam', 'Upozornění na e-mail — Zvýrazněné slovo Spam', 'thank-you', 'upozorneni_email', 'text', 'Zvýrazněné slovo Spam', 80), -- from src/pages/FreeGuideThankYou.tsx:68
  ('freeguide_thanks_email_notice_text_mid', 'folder, and add', 'folder, and add', 'Upozornění na e-mail — Text mezi slovem Spam a e-mailem', 'thank-you', 'upozorneni_email', 'text', 'Text mezi slovem Spam a e-mailem', 90), -- from src/pages/FreeGuideThankYou.tsx:68
  ('freeguide_thanks_email_notice_email', 'contact@resilientmind.io', 'contact@resilientmind.io', 'Upozornění na e-mail — Zvýrazněná e-mailová adresa', 'thank-you', 'upozorneni_email', 'text', 'Zvýrazněná e-mailová adresa', 100), -- from src/pages/FreeGuideThankYou.tsx:68
  ('freeguide_thanks_email_notice_text_post', 'to your contacts so you don''t miss your materials.', 'to your contacts so you don''t miss your materials.', 'Upozornění na e-mail — Text za e-mailovou adresou', 'thank-you', 'upozorneni_email', 'text', 'Text za e-mailovou adresou', 110) -- from src/pages/FreeGuideThankYou.tsx:68
ON CONFLICT (key) DO NOTHING;
