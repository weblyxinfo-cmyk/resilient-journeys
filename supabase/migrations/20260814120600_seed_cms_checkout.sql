-- Auto-generated seed for CMS phase 2 (docs/cms-final-seed.md).
-- Checkout.tsx.
-- value/default_value copied verbatim from the t("key", "fallback") call in the source file
-- named in each row's trailing comment (TypeScript compiler API, not regex -- see
-- scripts/cms-seed.mjs). page/section/field_type/label/sort_order come from the metadata the
-- CMS agents collected while wiring this page (docs/cms-keys-*.json), not guessed.
-- ON CONFLICT (key) DO NOTHING: production already has rows a client may have edited through
-- the admin -- this migration must never overwrite them.

INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type, label, sort_order) VALUES
  ('checkout_signed_in_as', 'Signed in as:', 'Signed in as:', 'Akce a doplňkové texty — Text „Přihlášen(a) jako:"', 'checkout', 'akce', 'text', 'Text „Přihlášen(a) jako:"', 160), -- from src/pages/Checkout.tsx:239
  ('checkout_button_processing', 'Processing...', 'Processing...', 'Akce a doplňkové texty — Text tlačítka během zpracování', 'checkout', 'akce', 'text', 'Text tlačítka během zpracování', 170), -- from src/pages/Checkout.tsx:252
  ('checkout_pay_button_prefix', 'Pay', 'Pay', 'Akce a doplňkové texty — Text tlačítka „Zaplatit" (před částkou)', 'checkout', 'akce', 'text', 'Text tlačítka „Zaplatit" (před částkou)', 180), -- from src/pages/Checkout.tsx:257
  ('checkout_no_account_text', 'Don''t have an account?', 'Don''t have an account?', 'Akce a doplňkové texty — Text „Nemáte účet?"', 'checkout', 'akce', 'text', 'Text „Nemáte účet?"', 190), -- from src/pages/Checkout.tsx:265
  ('checkout_signup_link', 'Sign up', 'Sign up', 'Akce a doplňkové texty — Odkaz „Zaregistrovat se"', 'checkout', 'akce', 'text', 'Odkaz „Zaregistrovat se"', 200), -- from src/pages/Checkout.tsx:267
  ('checkout_security_note', 'Payment is secured by Stripe. Your data is encrypted.', 'Payment is secured by Stripe. Your data is encrypted.', 'Akce a doplňkové texty — Poznámka o bezpečnosti platby', 'checkout', 'akce', 'textarea', 'Poznámka o bezpečnosti platby', 210), -- from src/pages/Checkout.tsx:274
  ('checkout_different_plan_text', 'Different plan?', 'Different plan?', 'Akce a doplňkové texty — Text „Jiný tarif?"', 'checkout', 'akce', 'text', 'Text „Jiný tarif?"', 220), -- from src/pages/Checkout.tsx:282
  ('checkout_error_timeout', 'Request timed out. Please try again.', 'Request timed out. Please try again.', 'Chybové hlášky — Vypršel časový limit', 'checkout', 'chyby', 'text', 'Vypršel časový limit', 120), -- from src/pages/Checkout.tsx:105
  ('checkout_error_generic', 'Error creating payment', 'Error creating payment', 'Chybové hlášky — Obecná chyba při platbě', 'checkout', 'chyby', 'text', 'Obecná chyba při platbě', 130), -- from src/pages/Checkout.tsx:133
  ('checkout_error_no_link', 'Could not get payment link', 'Could not get payment link', 'Chybové hlášky — Nepodařilo se získat platební odkaz', 'checkout', 'chyby', 'text', 'Nepodařilo se získat platební odkaz', 140), -- from src/pages/Checkout.tsx:141
  ('checkout_error_processing', 'An error occurred while processing payment', 'An error occurred while processing payment', 'Chybové hlášky — Chyba při zpracování platby', 'checkout', 'chyby', 'text', 'Chyba při zpracování platby', 150), -- from src/pages/Checkout.tsx:144
  ('checkout_back_button', 'Back to program', 'Back to program', 'Navigace — Text tlačítka zpět', 'checkout', 'navigace', 'text', 'Text tlačítka zpět', 10), -- from src/pages/Checkout.tsx:175
  ('checkout_title', 'Complete Your Order', 'Complete Your Order', 'Shrnutí objednávky — Nadpis karty', 'checkout', 'shrnuti', 'text', 'Nadpis karty', 20), -- from src/pages/Checkout.tsx:181
  ('checkout_hub_endometriosis_name', 'Endometriosis Management Hub', 'Endometriosis Management Hub', 'Shrnutí objednávky — Název – Endometriosis Hub (cena zůstává mimo CMS)', 'checkout', 'shrnuti', 'text', 'Název – Endometriosis Hub (cena zůstává mimo CMS)', 30), -- from src/pages/Checkout.tsx:75
  ('checkout_hub_endometriosis_description', 'Managing chronic pain while living abroad', 'Managing chronic pain while living abroad', 'Shrnutí objednávky — Popis – Endometriosis Hub', 'checkout', 'shrnuti', 'text', 'Popis – Endometriosis Hub', 40), -- from src/pages/Checkout.tsx:77
  ('checkout_hub_transformed_self_name', 'The Transformed Self Hub', 'The Transformed Self Hub', 'Shrnutí objednávky — Název – The Transformed Self Hub (cena zůstává mimo CMS)', 'checkout', 'shrnuti', 'text', 'Název – The Transformed Self Hub (cena zůstává mimo CMS)', 50), -- from src/pages/Checkout.tsx:80
  ('checkout_hub_transformed_self_description', 'Carrying Your Strength Across Borders', 'Carrying Your Strength Across Borders', 'Shrnutí objednávky — Popis – The Transformed Self Hub', 'checkout', 'shrnuti', 'text', 'Popis – The Transformed Self Hub', 60), -- from src/pages/Checkout.tsx:82
  ('checkout_hub_one_time_label', 'one-time', 'one-time', 'Shrnutí objednávky — Popisek „jednorázová platba"', 'checkout', 'shrnuti', 'text', 'Popisek „jednorázová platba"', 70), -- from src/pages/Checkout.tsx:196
  ('checkout_plan_type_basic', 'Basic', 'Basic', 'Shrnutí objednávky — Název tarifu „Basic"', 'checkout', 'shrnuti', 'text', 'Název tarifu „Basic"', 80), -- from src/pages/Checkout.tsx:64
  ('checkout_plan_type_premium', 'Premium', 'Premium', 'Shrnutí objednávky — Název tarifu „Premium"', 'checkout', 'shrnuti', 'text', 'Název tarifu „Premium"', 90), -- from src/pages/Checkout.tsx:65
  ('checkout_plan_interval_monthly', 'Monthly', 'Monthly', 'Shrnutí objednávky — Perioda „Měsíčně"', 'checkout', 'shrnuti', 'text', 'Perioda „Měsíčně"', 100), -- from src/pages/Checkout.tsx:68
  ('checkout_plan_interval_yearly', 'Yearly', 'Yearly', 'Shrnutí objednávky — Perioda „Ročně"', 'checkout', 'shrnuti', 'text', 'Perioda „Ročně"', 110) -- from src/pages/Checkout.tsx:69
ON CONFLICT (key) DO NOTHING;
