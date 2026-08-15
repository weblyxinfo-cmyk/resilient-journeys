-- The manual-transfer wording shown when a workshop has no beneficiary name
-- yet was wired to t() but never seeded, so it rendered from its fallback and
-- was invisible in the admin — editable in the code only. Found by auditing
-- every t() key in the source against cms_content.
--
-- Values are identical to the fallbacks in WorkshopRegistration.tsx.

INSERT INTO public.cms_content (key, value, default_value, label, description, page, section, field_type, sort_order)
VALUES
  ('workshopform_reg_qr_missing_name_title', 'QR payment code isn''t ready yet', 'QR payment code isn''t ready yet',
   'Nadpis — QR kód není připravený',
   'Zobrazí se místo QR kódu, když u workshopu chybí jméno majitele účtu.',
   'workshop-registration', 'qr', 'text', 210),
  ('workshopform_reg_qr_missing_name_text', 'Please transfer the payment manually using the details below:', 'Please transfer the payment manually using the details below:',
   'Text — QR kód není připravený', NULL,
   'workshop-registration', 'qr', 'textarea', 220),
  ('workshopform_reg_qr_iban_label', 'IBAN', 'IBAN',
   'Popisek — číslo účtu', NULL,
   'workshop-registration', 'qr', 'text', 230),
  ('workshopform_reg_qr_amount_label', 'Amount', 'Amount',
   'Popisek — částka', NULL,
   'workshop-registration', 'qr', 'text', 240),
  ('workshopform_reg_qr_message_label', 'Payment reference', 'Payment reference',
   'Popisek — zpráva pro příjemce', NULL,
   'workshop-registration', 'qr', 'text', 250)
ON CONFLICT (key) DO NOTHING;

-- The section itself was missing too, so these five would have landed in the
-- catch-all "Ostatní" card at the bottom of the page.
INSERT INTO public.cms_sections (page, section_key, title, description, anchor, route, sort_order)
VALUES ('workshop-registration', 'qr', 'Platba QR kódem',
        'Texty u platebního QR kódu, včetně náhradního znění, když kód nejde zobrazit.',
        NULL, '/workshopy', 40)
ON CONFLICT (page, section_key) DO NOTHING;
