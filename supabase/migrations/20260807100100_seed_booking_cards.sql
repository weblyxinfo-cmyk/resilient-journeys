-- Seed booking_cards from the SESSION_TYPES array that Booking.tsx shipped with,
-- generated from the source array so the live copy transfers verbatim.
-- ON CONFLICT DO NOTHING so re-running never overwrites edits made in the admin.

INSERT INTO public.booking_cards (
  card_key, booking_type, title, badge, image,
  duration_minutes, duration_label, price_eur, price_note,
  description, features_heading, features, extra_sections,
  note, contact_heading, phone, email,
  valid_until, highlight, sort_order
) VALUES
  ('discovery', NULL, 'Discovery Call', NULL, '/booking/discovery.jpg', 30, NULL, 0, NULL, 'A complimentary introductory call to understand your needs, answer your questions, and explore whether we''re the right fit.', NULL, '["Understand your current challenges","Ask any questions you may have","Explore how I can support you","No commitment required"]'::jsonb, '[]'::jsonb, NULL, NULL, NULL, NULL, NULL, false, 10),
  ('one_on_one', NULL, 'Individual Session', NULL, '/booking/individual.jpg', 60, NULL, 107, NULL, 'A personalised 1:1 session designed to support emotional resilience, inner calm, and lasting wellbeing.', NULL, '["Holistic counselling approach","EFT Tapping for emotional regulation","Byron Katie inquiry for clarity and perspective","Expressive creative art (when supportive)","Distance Reiki (optional – available worldwide)"]'::jsonb, '[]'::jsonb, NULL, NULL, '+34 602 413 244', NULL, NULL, false, 20),
  ('family', NULL, 'Family Session', NULL, '/booking/family.jpg', 60, NULL, 127, NULL, 'A supportive family session designed to strengthen emotional resilience, communication, and connection.', NULL, '["Child-led expressive creative activities","Emotional regulation tools for parents and children, including EFT (Emotional Freedom Techniques), where appropriate","Reiki for parents available on request"]'::jsonb, '[]'::jsonb, 'Each session is individually tailored to the unique needs of the child and parent(s), depending on age, goals, and the focus of the session.', NULL, NULL, NULL, NULL, false, 30),
  ('endometriosis_support', NULL, 'Endometriosis & Chronic Pain Support', 'Complete Support Package', '/booking/endometriosis.jpg', 60, '3 × 60 min sessions', 237, '€79 per session', 'A structured three-session support package designed to help you better understand your body, reduce emotional overwhelm, and build resilience while living with endometriosis or chronic pain.', NULL, '["Session 1 – Emotional clarity, support & resilience tools (60 min), including EFT (Emotional Freedom Techniques)","Session 2 – Distance Reiki to promote relaxation and support emotional wellbeing (60 min)","Session 3 – Expressive creative art for self-expression, reflection & integration (60 min)","Personalised support tailored to your unique experience","Available online or in person in Dénia, Spain"]'::jsonb, '[]'::jsonb, '❤️ Complete Support Package – €237 (€79 per session). A valuable way to receive personalised support, guidance, and practical tools across three dedicated sessions.', NULL, NULL, NULL, NULL, false, 40),
  ('individual_eft_reiki_offer', NULL, 'EFT Tapping & Reiki Session', '❤️ Special Welcome Offer – In Person & Online', '/booking/special-offer.jpg', 60, NULL, 50, NULL, 'A gentle 60-minute session designed to help you calm your nervous system, release emotional stress, and reconnect with yourself.

By combining EFT (Emotional Freedom Techniques) with Reiki, each session is tailored to your unique needs, creating a safe and supportive space for emotional wellbeing, relaxation, and inner balance.', 'This session may help you:', '["Calm your nervous system","Release emotional stress and overwhelm","Feel lighter, calmer, and more balanced","Reconnect with yourself","Support emotional wellbeing through EFT & Reiki"]'::jsonb, '[{"heading":"Continued Support After Your Session","intro":"Your healing doesn''t end when the session finishes. To help you continue your practice at home, you''ll also receive:","features":["An Introduction to EFT Guide (printed or PDF) explaining what EFT is, how it works, and how to use it with confidence.","A beginner''s EFT tapping script to help you become familiar with the technique if you''re new to EFT.","A personalised follow-up EFT tapping video, created specifically for your needs after our session, so you can continue practising at home."],"outro":"As your confidence grows, you''ll learn how to listen to your own emotions and body, using EFT in a way that feels natural and supportive for you."}]'::jsonb, '📍 Available online or in person in Dénia, Spain', 'Book your session', '+34 602 413 244', 'contact@resilientmind.io', NULL, true, 50),
  ('eft_reiki_welcome', 'individual_eft_reiki_offer', 'EFT Tapping & Reiki Session', '❤️ Special Welcome Offer – In Person & Online', '/booking/eft-welcome.jpg', 60, NULL, 50, NULL, 'Do you experience…

• Stress, anxiety, or emotional overwhelm?
• Difficulty switching off your mind?
• Feeling disconnected from yourself?
• Constantly putting everyone else first?

Take a moment to pause, breathe, and reconnect.

This personalised 60-minute EFT Tapping & Reiki Session combines two gentle yet powerful techniques to help calm your nervous system, release emotional stress, and restore inner balance.', 'Imagine leaving your session feeling…', '["More relaxed and at ease","More connected with yourself","Emotionally lighter","Calm, grounded, and balanced","Better equipped to navigate life''s challenges"]'::jsonb, '[{"heading":"Your session includes","features":["A personalised 60-minute EFT & Reiki session","An Introduction to EFT Guide (PDF)","Guided EFT tapping videos to help you continue your practice at home"]}]'::jsonb, '📍 In person: Dénia, Spain
💻 Online: Available worldwide

Book your session today and take the first step towards feeling calmer, lighter, and more connected with yourself.', 'Book your session', '+34 602 413 244', 'contact@resilientmind.io', NULL, true, 60)
ON CONFLICT (card_key) DO NOTHING;
