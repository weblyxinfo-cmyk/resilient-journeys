-- Seeds faq_items with the text that was hardcoded in Membership.tsx /
-- Membership2.tsx (group 'membership') and ResilientHubs.tsx (group 'hubs')
-- before those pages were wired to useFaqItems(). Values are copied verbatim
-- so this is a no-op for what the pages render.
--
-- ON CONFLICT (group_key, question) DO NOTHING: safe to re-run, and never
-- overwrites a question a client has since edited in the admin.

INSERT INTO public.faq_items (group_key, question, answer, sort_order) VALUES
  ('membership', 'Who is this program for?', 'Expat women navigating new cultures while staying connected to who they truly are. Women living abroad who feel emotionally stretched or unsupported, seeking grounded tools they can rely on anywhere. Globally mobile women facing constant change and wanting deeper inner stability, confidence, and clarity.', 0),
  ('membership', 'How much time do I need?', 'Around 15–30 minutes a day. Video lessons are 10–15 minutes and the workbook exercises are designed to fit into a busy expat life. Everything is on-demand — no live schedules to worry about.', 1),
  ('membership', 'What''s the difference between Basic and Premium?', 'The Basic Monthly Membership includes one video each week and four weekly workbooks/exercises. The Premium Membership includes everything from the Basic Membership, plus access to the Additional Hub: The Transformed Self and Endometriosis & Chronic Pain, as well as access to the private Skool community.', 2),
  ('membership', 'Is this a subscription?', 'No — every purchase is a one-time payment. Monthly plans give you access for 1 month with no auto-renewal. Yearly plans give you full access for 12 months with a 14-day money-back guarantee. You decide when and if you want to continue.', 3),
  ('membership', 'Do I need any prior experience with counselling or expressive art?', 'Not at all. These techniques are gentle and beginner-friendly. EFT tapping, expressive creative art practices, and guided meditations are explained step-by-step. You don''t need to be "artistic" — this is about expression, not perfection.', 4),
  ('membership', 'What if I''m not sure it''s right for me?', 'You can start with the Basic Monthly plan — it''s a one-time payment with no auto-renewal, so you can simply try it for a month and decide if you want to continue. There''s no pressure and no commitment.', 5),
  ('hubs', 'Who is this program for?', 'Expat women navigating new cultures while staying connected to who they truly are. Women living abroad who feel emotionally stretched or unsupported, seeking grounded tools they can rely on anywhere. Globally mobile women facing constant change and wanting deeper inner stability, confidence, and clarity.', 0),
  ('hubs', 'How much time do I need per week?', 'Each weekly session takes about 15–30 minutes. The video lessons are 10–15 minutes, and the workbook exercises can be done at your own pace. Everything is on-demand — no live schedules to worry about.', 1),
  ('hubs', 'What''s the difference between Basic and Premium?', 'The Basic Monthly Membership includes one video each week and four weekly workbooks/exercises. The Premium Membership includes everything from the Basic Membership, plus access to the Additional Hub: The Transformed Self and Endometriosis & Chronic Pain, as well as access to the private Skool community.', 2),
  ('hubs', 'Is this a subscription?', 'No — every purchase is a one-time payment. Monthly plans give you access for 1 month with no auto-renewal. Yearly plans give you full access for 12 months with a 14-day money-back guarantee. You decide when and if you want to continue.', 3),
  ('hubs', 'Do I need any prior experience with counselling or expressive art?', 'Not at all. These techniques are gentle and beginner-friendly. EFT tapping, expressive creative art practices, and guided meditations are explained step-by-step. You don''t need to be "artistic" — this is about expression, not perfection.', 4),
  ('hubs', 'What if I''m not sure it''s right for me?', 'Download our free guide first — it includes 3 of our core techniques so you can experience the approach before committing. You''ll know within minutes if this resonates with you.', 5)
ON CONFLICT (group_key, question) DO NOTHING;
