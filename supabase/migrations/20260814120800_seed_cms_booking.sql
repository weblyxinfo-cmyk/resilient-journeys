-- Auto-generated seed for CMS phase 2 (docs/cms-final-seed.md).
-- Booking.tsx.
-- value/default_value copied verbatim from the t("key", "fallback") call in the source file
-- named in each row's trailing comment (TypeScript compiler API, not regex -- see
-- scripts/cms-seed.mjs). page/section/field_type/label/sort_order come from the metadata the
-- CMS agents collected while wiring this page (docs/cms-keys-*.json), not guessed.
-- ON CONFLICT (key) DO NOTHING: production already has rows a client may have edited through
-- the admin -- this migration must never overwrite them.

INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type, label, sort_order) VALUES
  ('booking_hero_badge', 'Session Booking', 'Session Booking', 'Úvodní hlavička — Odznak nad hlavním nadpisem', 'booking', 'hero', 'text', 'Odznak nad hlavním nadpisem', 10), -- from src/pages/Booking.tsx:393
  ('booking_hero_title', 'Let''s Work Together', 'Let''s Work Together', 'Úvodní hlavička — Hlavní nadpis', 'booking', 'hero', 'text', 'Hlavní nadpis', 20), -- from src/pages/Booking.tsx:398
  ('booking_hero_subtitle', 'Select session type and schedule a time that works for you', 'Select session type and schedule a time that works for you', 'Úvodní hlavička — Podnadpis pod hlavním nadpisem', 'booking', 'hero', 'text', 'Podnadpis pod hlavním nadpisem', 30), -- from src/pages/Booking.tsx:402
  ('booking_step1_title', 'Select Session Type', 'Select Session Type', 'Krok 1 – výběr typu sezení — Nadpis kroku', 'booking', 'krok1', 'text', 'Nadpis kroku', 40), -- from src/pages/Booking.tsx:437
  ('booking_selected_badge', 'Selected', 'Selected', 'Krok 1 – výběr typu sezení — Štítek na vybrané kartě sezení', 'booking', 'krok1', 'text', 'Štítek na vybrané kartě sezení', 50), -- from src/pages/Booking.tsx:461
  ('booking_price_free', 'Free', 'Free', 'Krok 1 – výběr typu sezení — Text u nulové ceny (zdarma sezení)', 'booking', 'krok1', 'text', 'Text u nulové ceny (zdarma sezení)', 60), -- from src/pages/Booking.tsx:495
  ('booking_card_questions_label', 'Questions? ', 'Questions? ', 'Krok 1 – výběr typu sezení — Popisek "Dotazy?" u karty s telefonním kontaktem', 'booking', 'krok1', 'text', 'Popisek "Dotazy?" u karty s telefonním kontaktem', 70), -- from src/pages/Booking.tsx:586
  ('booking_card_call_label', 'Call', 'Call', 'Krok 1 – výběr typu sezení — Text odkazu Zavolat', 'booking', 'krok1', 'text', 'Text odkazu Zavolat', 80), -- from src/pages/Booking.tsx:592
  ('booking_card_whatsapp_label', 'WhatsApp', 'WhatsApp', 'Krok 1 – výběr typu sezení — Text odkazu WhatsApp', 'booking', 'krok1', 'text', 'Text odkazu WhatsApp', 90), -- from src/pages/Booking.tsx:602
  ('booking_card_agent_prefix', ' Silvie: ', ' Silvie: ', 'Krok 1 – výběr typu sezení — Text před jménem a telefonním číslem', 'booking', 'krok1', 'text', 'Text před jménem a telefonním číslem', 100), -- from src/pages/Booking.tsx:604
  ('booking_button_continue', 'Continue', 'Continue', 'Krok 1 – výběr typu sezení — Text tlačítka Pokračovat (používá se ve všech krocích)', 'booking', 'krok1', 'text', 'Text tlačítka Pokračovat (používá se ve všech krocích)', 110), -- from src/pages/Booking.tsx:619
  ('booking_button_back', 'Back', 'Back', 'Krok 2 – výběr data — Text tlačítka Zpět (používá se ve všech krocích)', 'booking', 'krok2', 'text', 'Text tlačítka Zpět (používá se ve všech krocích)', 120), -- from src/pages/Booking.tsx:630
  ('booking_step2_title', 'Select Date', 'Select Date', 'Krok 2 – výběr data — Nadpis kroku', 'booking', 'krok2', 'text', 'Nadpis kroku', 130), -- from src/pages/Booking.tsx:638
  ('booking_calendar_day_mon', 'Mon', 'Mon', 'Krok 2 – výběr data — Zkratka dne v kalendáři – pondělí', 'booking', 'krok2', 'text', 'Zkratka dne v kalendáři – pondělí', 140), -- from src/pages/Booking.tsx:368
  ('booking_calendar_day_tue', 'Tue', 'Tue', 'Krok 2 – výběr data — Zkratka dne v kalendáři – úterý', 'booking', 'krok2', 'text', 'Zkratka dne v kalendáři – úterý', 150), -- from src/pages/Booking.tsx:369
  ('booking_calendar_day_wed', 'Wed', 'Wed', 'Krok 2 – výběr data — Zkratka dne v kalendáři – středa', 'booking', 'krok2', 'text', 'Zkratka dne v kalendáři – středa', 160), -- from src/pages/Booking.tsx:370
  ('booking_calendar_day_thu', 'Thu', 'Thu', 'Krok 2 – výběr data — Zkratka dne v kalendáři – čtvrtek', 'booking', 'krok2', 'text', 'Zkratka dne v kalendáři – čtvrtek', 170), -- from src/pages/Booking.tsx:371
  ('booking_calendar_day_fri', 'Fri', 'Fri', 'Krok 2 – výběr data — Zkratka dne v kalendáři – pátek', 'booking', 'krok2', 'text', 'Zkratka dne v kalendáři – pátek', 180), -- from src/pages/Booking.tsx:372
  ('booking_calendar_day_sat', 'Sat', 'Sat', 'Krok 2 – výběr data — Zkratka dne v kalendáři – sobota', 'booking', 'krok2', 'text', 'Zkratka dne v kalendáři – sobota', 190), -- from src/pages/Booking.tsx:373
  ('booking_calendar_day_sun', 'Sun', 'Sun', 'Krok 2 – výběr data — Zkratka dne v kalendáři – neděle', 'booking', 'krok2', 'text', 'Zkratka dne v kalendáři – neděle', 200), -- from src/pages/Booking.tsx:374
  ('booking_calendar_empty', 'There are no available dates this month', 'There are no available dates this month', 'Krok 2 – výběr data — Hláška, když nejsou v měsíci volné žádné termíny', 'booking', 'krok2', 'text', 'Hláška, když nejsou v měsíci volné žádné termíny', 210), -- from src/pages/Booking.tsx:706
  ('booking_step3_title', 'Select Time', 'Select Time', 'Krok 3 – výběr času — Nadpis kroku', 'booking', 'krok3', 'text', 'Nadpis kroku', 220), -- from src/pages/Booking.tsx:740
  ('booking_no_slots', 'No available times for this day', 'No available times for this day', 'Krok 3 – výběr času — Hláška, když nejsou pro daný den volné žádné časy', 'booking', 'krok3', 'text', 'Hláška, když nejsou pro daný den volné žádné časy', 230), -- from src/pages/Booking.tsx:768
  ('booking_step4_title', 'Your Information', 'Your Information', 'Krok 4 – kontaktní údaje a shrnutí — Nadpis kroku', 'booking', 'krok4', 'text', 'Nadpis kroku', 240), -- from src/pages/Booking.tsx:794
  ('booking_summary_title', 'Booking Summary', 'Booking Summary', 'Krok 4 – kontaktní údaje a shrnutí — Nadpis souhrnu rezervace', 'booking', 'krok4', 'text', 'Nadpis souhrnu rezervace', 250), -- from src/pages/Booking.tsx:800
  ('booking_summary_type_label', 'Session type:', 'Session type:', 'Krok 4 – kontaktní údaje a shrnutí — Popisek řádku – typ sezení', 'booking', 'krok4', 'text', 'Popisek řádku – typ sezení', 260), -- from src/pages/Booking.tsx:804
  ('booking_summary_date_label', 'Date:', 'Date:', 'Krok 4 – kontaktní údaje a shrnutí — Popisek řádku – datum', 'booking', 'krok4', 'text', 'Popisek řádku – datum', 270), -- from src/pages/Booking.tsx:808
  ('booking_summary_time_label', 'Time:', 'Time:', 'Krok 4 – kontaktní údaje a shrnutí — Popisek řádku – čas', 'booking', 'krok4', 'text', 'Popisek řádku – čas', 280), -- from src/pages/Booking.tsx:814
  ('booking_summary_duration_label', 'Duration:', 'Duration:', 'Krok 4 – kontaktní údaje a shrnutí — Popisek řádku – délka trvání', 'booking', 'krok4', 'text', 'Popisek řádku – délka trvání', 290), -- from src/pages/Booking.tsx:818
  ('booking_summary_price_label', 'Price:', 'Price:', 'Krok 4 – kontaktní údaje a shrnutí — Popisek řádku – cena', 'booking', 'krok4', 'text', 'Popisek řádku – cena', 300), -- from src/pages/Booking.tsx:822
  ('booking_form_name_label', 'Full Name *', 'Full Name *', 'Krok 4 – kontaktní údaje a shrnutí — Popisek pole Celé jméno', 'booking', 'krok4', 'text', 'Popisek pole Celé jméno', 310), -- from src/pages/Booking.tsx:833
  ('booking_form_name_placeholder', 'John Smith', 'John Smith', 'Krok 4 – kontaktní údaje a shrnutí — Placeholder pole Celé jméno', 'booking', 'krok4', 'text', 'Placeholder pole Celé jméno', 320), -- from src/pages/Booking.tsx:840
  ('booking_form_email_label', 'Email *', 'Email *', 'Krok 4 – kontaktní údaje a shrnutí — Popisek pole E-mail', 'booking', 'krok4', 'text', 'Popisek pole E-mail', 330), -- from src/pages/Booking.tsx:845
  ('booking_form_email_placeholder', 'john@example.com', 'john@example.com', 'Krok 4 – kontaktní údaje a shrnutí — Placeholder pole E-mail', 'booking', 'krok4', 'text', 'Placeholder pole E-mail', 340), -- from src/pages/Booking.tsx:852
  ('booking_form_notes_label', 'Note (optional)', 'Note (optional)', 'Krok 4 – kontaktní údaje a shrnutí — Popisek pole Poznámka', 'booking', 'krok4', 'text', 'Popisek pole Poznámka', 350), -- from src/pages/Booking.tsx:857
  ('booking_form_notes_placeholder', 'Tell us something about yourself or what you need help with...', 'Tell us something about yourself or what you need help with...', 'Krok 4 – kontaktní údaje a shrnutí — Placeholder pole Poznámka', 'booking', 'krok4', 'textarea', 'Placeholder pole Poznámka', 360), -- from src/pages/Booking.tsx:862
  ('booking_form_notes_counter_suffix', 'characters', 'characters', 'Krok 4 – kontaktní údaje a shrnutí — Text za počítadlem znaků poznámky ("characters")', 'booking', 'krok4', 'text', 'Text za počítadlem znaků poznámky ("characters")', 370), -- from src/pages/Booking.tsx:867
  ('booking_button_processing', 'Processing...', 'Processing...', 'Krok 4 – kontaktní údaje a shrnutí — Text tlačítka během odesílání rezervace', 'booking', 'krok4', 'text', 'Text tlačítka během odesílání rezervace', 380), -- from src/pages/Booking.tsx:876
  ('booking_button_confirm', 'Confirm Booking', 'Confirm Booking', 'Krok 4 – kontaktní údaje a shrnutí — Text tlačítka – potvrdit rezervaci zdarma', 'booking', 'krok4', 'text', 'Text tlačítka – potvrdit rezervaci zdarma', 390), -- from src/pages/Booking.tsx:879
  ('booking_button_pay_prefix', 'Go to Payment', 'Go to Payment', 'Krok 4 – kontaktní údaje a shrnutí — Text tlačítka před částkou k platbě ("Go to Payment")', 'booking', 'krok4', 'text', 'Text tlačítka před částkou k platbě ("Go to Payment")', 400) -- from src/pages/Booking.tsx:881
ON CONFLICT (key) DO NOTHING;
