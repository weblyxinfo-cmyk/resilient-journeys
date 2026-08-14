-- Auto-generated seed for CMS phase 2 (docs/cms-final-seed.md).
-- CheckoutSuccess.tsx.
-- value/default_value copied verbatim from the t("key", "fallback") call in the source file
-- named in each row's trailing comment (TypeScript compiler API, not regex -- see
-- scripts/cms-seed.mjs). page/section/field_type/label/sort_order come from the metadata the
-- CMS agents collected while wiring this page (docs/cms-keys-*.json), not guessed.
-- ON CONFLICT (key) DO NOTHING: production already has rows a client may have edited through
-- the admin -- this migration must never overwrite them.

INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type, label, sort_order) VALUES
  ('checkout_success_no_session_title', 'No Payment Session Found', 'No Payment Session Found', 'Stav: platba nenalezena — Nadpis', 'checkout-success', 'bez_session', 'text', 'Nadpis', 40), -- from src/pages/CheckoutSuccess.tsx:164
  ('checkout_success_no_session_text', 'If you completed a purchase, check your email or contact support.', 'If you completed a purchase, check your email or contact support.', 'Stav: platba nenalezena — Text', 'checkout-success', 'bez_session', 'textarea', 'Text', 50), -- from src/pages/CheckoutSuccess.tsx:167
  ('checkout_success_no_session_button', 'Go to Dashboard', 'Go to Dashboard', 'Stav: platba nenalezena — Text tlačítka', 'checkout-success', 'bez_session', 'text', 'Text tlačítka', 60), -- from src/pages/CheckoutSuccess.tsx:171
  ('checkout_success_pending_title', 'Payment Processing', 'Payment Processing', 'Stav: platba prošla, členství se ještě aktivuje — Nadpis', 'checkout-success', 'cekani_na_aktivaci', 'text', 'Nadpis', 90), -- from src/pages/CheckoutSuccess.tsx:208
  ('checkout_success_pending_text', 'We''re still processing your payment. If your membership isn''t active within a few minutes, please contact support at', 'We''re still processing your payment. If your membership isn''t active within a few minutes, please contact support at', 'Stav: platba prošla, členství se ještě aktivuje — Text (před e-mailem podpory)', 'checkout-success', 'cekani_na_aktivaci', 'textarea', 'Text (před e-mailem podpory)', 100), -- from src/pages/CheckoutSuccess.tsx:211
  ('checkout_success_pending_badge', 'Activation Pending', 'Activation Pending', 'Stav: platba prošla, členství se ještě aktivuje — Odznak „Čeká se na aktivaci"', 'checkout-success', 'cekani_na_aktivaci', 'text', 'Odznak „Čeká se na aktivaci"', 110), -- from src/pages/CheckoutSuccess.tsx:222
  ('checkout_success_pending_button', 'Go to Dashboard', 'Go to Dashboard', 'Stav: platba prošla, členství se ještě aktivuje — Text tlačítka', 'checkout-success', 'cekani_na_aktivaci', 'text', 'Text tlačítka', 120), -- from src/pages/CheckoutSuccess.tsx:227
  ('checkout_success_login_title', 'Please Log In', 'Please Log In', 'Stav: nutné přihlášení — Nadpis', 'checkout-success', 'prihlaseni', 'text', 'Nadpis', 10), -- from src/pages/CheckoutSuccess.tsx:139
  ('checkout_success_login_text', 'You need to be logged in so we can activate your membership.', 'You need to be logged in so we can activate your membership.', 'Stav: nutné přihlášení — Text', 'checkout-success', 'prihlaseni', 'textarea', 'Text', 20), -- from src/pages/CheckoutSuccess.tsx:142
  ('checkout_success_login_button', 'Log In', 'Log In', 'Stav: nutné přihlášení — Text tlačítka', 'checkout-success', 'prihlaseni', 'text', 'Text tlačítka', 30), -- from src/pages/CheckoutSuccess.tsx:146
  ('checkout_success_thank_you', 'Thank you!', 'Thank you!', 'Stav: úspěšná platba a aktivace — Text „Děkujeme!"', 'checkout-success', 'uspech', 'text', 'Text „Děkujeme!"', 130), -- from src/pages/CheckoutSuccess.tsx:246
  ('checkout_success_title', 'Payment Successful', 'Payment Successful', 'Stav: úspěšná platba a aktivace — Nadpis', 'checkout-success', 'uspech', 'text', 'Nadpis', 140), -- from src/pages/CheckoutSuccess.tsx:250
  ('checkout_success_text', 'Your membership has been activated. You now have access to all content based on your membership level.', 'Your membership has been activated. You now have access to all content based on your membership level.', 'Stav: úspěšná platba a aktivace — Text', 'checkout-success', 'uspech', 'textarea', 'Text', 150), -- from src/pages/CheckoutSuccess.tsx:254
  ('checkout_success_membership_label', 'Your membership', 'Your membership', 'Stav: úspěšná platba a aktivace — Popisek nad názvem tarifu', 'checkout-success', 'uspech', 'text', 'Popisek nad názvem tarifu', 160), -- from src/pages/CheckoutSuccess.tsx:262
  ('checkout_success_dashboard_button', 'Go to Dashboard', 'Go to Dashboard', 'Stav: úspěšná platba a aktivace — Text tlačítka „Do nástěnky"', 'checkout-success', 'uspech', 'text', 'Text tlačítka „Do nástěnky"', 170), -- from src/pages/CheckoutSuccess.tsx:271
  ('checkout_success_explore_button', 'Explore Program', 'Explore Program', 'Stav: úspěšná platba a aktivace — Text tlačítka „Prozkoumat program"', 'checkout-success', 'uspech', 'text', 'Text tlačítka „Prozkoumat program"', 180), -- from src/pages/CheckoutSuccess.tsx:274
  ('checkout_success_processing_title', 'Processing Your Payment...', 'Processing Your Payment...', 'Stav: zpracování platby — Nadpis', 'checkout-success', 'zpracovani', 'text', 'Nadpis', 70), -- from src/pages/CheckoutSuccess.tsx:189
  ('checkout_success_processing_text', 'Please wait while we activate your membership.', 'Please wait while we activate your membership.', 'Stav: zpracování platby — Text', 'checkout-success', 'zpracovani', 'text', 'Text', 80) -- from src/pages/CheckoutSuccess.tsx:192
ON CONFLICT (key) DO NOTHING;
