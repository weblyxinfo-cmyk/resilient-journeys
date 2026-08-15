-- New page: WorkshopRegistrationSuccess.tsx (/workshopy/success), the
-- anonymous return page after Stripe Checkout for a paid workshop. Mirrors
-- BookingSuccess.tsx's section layout for session_bookings.
-- value/default_value copied verbatim from the t("key", "fallback") call.
-- ON CONFLICT (key) DO NOTHING — see 20260815140000 for why.

INSERT INTO public.cms_sections (page, section_key, title, description, anchor, route, sort_order) VALUES
  ('workshop-registration-success', 'nacitani', 'Načítání registrace', NULL, 'cms-workshop-success-loading', '/workshopy/success', 10),
  ('workshop-registration-success', 'chyba', 'Stav: registrace nenalezena', NULL, 'cms-workshop-success-error', '/workshopy/success', 20),
  ('workshop-registration-success', 'hlavicka', 'Hlavička — čeká na platbu / zaplaceno / vypršelo', NULL, 'cms-workshop-success-header', '/workshopy/success', 110),
  ('workshop-registration-success', 'detaily', 'Karta „Detaily registrace"', NULL, 'cms-workshop-success-details', '/workshopy/success', 150),
  ('workshop-registration-success', 'kontakt', 'Kontaktní informace úplně dole', NULL, 'cms-workshop-success-contact', '/workshopy/success', 300)
ON CONFLICT (page, section_key) DO NOTHING;

INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type, label, sort_order) VALUES
  ('workshop_success_loading_text', 'Loading your registration...', 'Loading your registration...', 'Stav: načítání registrace — Text', 'workshop-registration-success', 'nacitani', 'text', 'Text', 10), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_error_title', 'Something went wrong', 'Something went wrong', 'Stav: registrace nenalezena — Nadpis', 'workshop-registration-success', 'chyba', 'text', 'Nadpis', 20), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_error_fallback', 'Registration not found', 'Registration not found', 'Stav: registrace nenalezena — Výchozí chybová hláška', 'workshop-registration-success', 'chyba', 'text', 'Výchozí chybová hláška', 30), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_error_no_session', 'No payment session found.', 'No payment session found.', 'Stav: registrace nenalezena — Chybí session_id v URL', 'workshop-registration-success', 'chyba', 'text', 'Chybí session_id v URL', 40), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_error_not_found', 'We couldn''t find your registration.', 'We couldn''t find your registration.', 'Stav: registrace nenalezena — Registrace nenalezena v databázi', 'workshop-registration-success', 'chyba', 'text', 'Registrace nenalezena v databázi', 50), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_error_button', 'Back to Workshops', 'Back to Workshops', 'Stav: registrace nenalezena — Text tlačítka zpět', 'workshop-registration-success', 'chyba', 'text', 'Text tlačítka zpět', 60), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_seo_title', 'Registration Confirmed | Resilient Mind', 'Registration Confirmed | Resilient Mind', 'SEO — Titulek stránky', 'workshop-registration-success', 'hlavicka', 'text', 'SEO titulek', 100), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_seo_description', 'Your workshop registration has been confirmed.', 'Your workshop registration has been confirmed.', 'SEO — Popis stránky', 'workshop-registration-success', 'hlavicka', 'textarea', 'SEO popis', 105), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_title_paid', 'You''re Registered!', 'You''re Registered!', 'Hlavička — Nadpis, platba proběhla', 'workshop-registration-success', 'hlavicka', 'text', 'Nadpis — platba proběhla', 110), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_title_pending', 'Confirming Your Payment...', 'Confirming Your Payment...', 'Hlavička — Nadpis, čeká se na potvrzení', 'workshop-registration-success', 'hlavicka', 'text', 'Nadpis — čeká se na potvrzení', 120), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_title_expired', 'Payment Link Expired', 'Payment Link Expired', 'Hlavička — Nadpis, platební odkaz vypršel', 'workshop-registration-success', 'hlavicka', 'text', 'Nadpis — platební odkaz vypršel', 130), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_subtitle_paid', 'Thank you for registering. A confirmation email is on its way to you.', 'Thank you for registering. A confirmation email is on its way to you.', 'Hlavička — Podnadpis, platba proběhla', 'workshop-registration-success', 'hlavicka', 'textarea', 'Podnadpis — platba proběhla', 140), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_subtitle_pending', 'This can take a few seconds. This page will update automatically.', 'This can take a few seconds. This page will update automatically.', 'Hlavička — Podnadpis, čeká se na potvrzení', 'workshop-registration-success', 'hlavicka', 'textarea', 'Podnadpis — čeká se na potvrzení', 150), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_subtitle_expired', 'This payment link is no longer valid. Please register again to get a new one.', 'This payment link is no longer valid. Please register again to get a new one.', 'Hlavička — Podnadpis, platební odkaz vypršel', 'workshop-registration-success', 'hlavicka', 'textarea', 'Podnadpis — platební odkaz vypršel', 160), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_details_title', 'Registration Details', 'Registration Details', 'Karta „Detaily registrace" — Nadpis karty', 'workshop-registration-success', 'detaily', 'text', 'Nadpis karty', 150), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_label_name', 'Name', 'Name', 'Karta „Detaily registrace" — Popisek „Jméno"', 'workshop-registration-success', 'detaily', 'text', 'Popisek „Jméno"', 160), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_label_email', 'Email', 'Email', 'Karta „Detaily registrace" — Popisek „E-mail"', 'workshop-registration-success', 'detaily', 'text', 'Popisek „E-mail"', 170), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_label_workshop', 'Workshop:', 'Workshop:', 'Karta „Detaily registrace" — Popisek „Workshop:"', 'workshop-registration-success', 'detaily', 'text', 'Popisek „Workshop:"', 180), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_retry_button', 'Back to Workshops', 'Back to Workshops', 'Tlačítka — Text tlačítka „Zpět na workshopy" (platba vypršela)', 'workshop-registration-success', 'detaily', 'text', 'Text tlačítka „Zpět na workshopy"', 190), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_home_button', 'Back to Homepage', 'Back to Homepage', 'Tlačítka — Text tlačítka „Zpět na hlavní stránku"', 'workshop-registration-success', 'detaily', 'text', 'Text tlačítka „Zpět na hlavní stránku"', 200), -- from src/pages/WorkshopRegistrationSuccess.tsx
  ('workshop_success_contact_text', 'Have questions? Contact us at', 'Have questions? Contact us at', 'Kontaktní informace úplně dole — Text „Máte otázky? Kontaktujte nás na"', 'workshop-registration-success', 'kontakt', 'text', 'Text „Máte otázky? Kontaktujte nás na"', 300) -- from src/pages/WorkshopRegistrationSuccess.tsx
ON CONFLICT (key) DO NOTHING;
