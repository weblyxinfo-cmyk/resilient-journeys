-- Seed membership_tiers verbatim from src/lib/pricing.ts (MEMBERSHIP_TIERS),
-- character for character, so the DB starts out identical to what the site
-- already shows. ON CONFLICT DO NOTHING so re-running never overwrites an
-- edit made in the admin.

INSERT INTO public.membership_tiers (
  tier_key, name, subtitle, description,
  price_eur, billing_interval, membership_type, period_label,
  button_text, badge, quote, savings_note,
  features, ideal_for,
  highlighted, hidden, sort_order
) VALUES
  (
    'basic_monthly', 'Basic Monthly',
    'For when you want to begin gently — without pressure or long-term commitment',
    'Access for 1 month (pay-as-you-go). Unlocks one month at a time.',
    37, 'month', 'basic', '/month',
    'Start Basic Monthly', NULL, '"I don''t have to decide everything right now."', NULL,
    '["4 weekly videos","4 weekly workbooks & reflective exercises","Guided meditations","Unlocks one month at a time"]'::jsonb,
    '["Want to try the program first","Need flexibility month by month","Not sure how much space you currently have"]'::jsonb,
    false, false, 10
  ),
  (
    'basic_yearly', 'Basic Yearly',
    'For those who want spaciousness, continuity, and fewer decisions',
    'Full 12-month program access from day one. Self-paced — move in your own rhythm. The program stays open until you finish.',
    370, 'year', 'basic', '/year',
    'Save with Yearly', 'Save €74', '"I don''t want to keep deciding every month — I want space to actually go deeper."', 'Save €74 compared to monthly',
    '["Full 12-month program access from day one","48 core videos","48 workbooks & exercises","Guided meditations","Self-paced access — move in your own rhythm","The program stays open until you finish","14-day money-back guarantee"]'::jsonb,
    '["Already know this kind of inner work matters","Want a stable anchor for the year","Like knowing everything is already there when you need it"]'::jsonb,
    false, true, 20
  ),
  (
    'premium_monthly', 'Premium Monthly',
    'For when you want deeper understanding and shared space — without long-term commitment',
    'Everything from the Basic Membership plus community and additional hubs.',
    47, 'month', 'premium', '/month',
    'Go Premium Monthly', 'Most Popular', '"I don''t want to do this completely alone."', NULL,
    '["Everything from Basic Membership","Access to the Premium Community (Skool)","Additional Hub: The Transformed Self","Additional Hub: Navigating Expat Life with Chronic Pain"]'::jsonb,
    '["Community support helps you stay connected","Want to explore deeper identity shifts","Value reflection, sharing, and belonging"]'::jsonb,
    true, false, 30
  ),
  (
    'premium_yearly', 'Premium Yearly',
    'For those ready for full support, integration, and real transformation',
    'The most supported way to walk the journey. Self-paced access — the program stays open until you finish.',
    470, 'year', 'premium', '/year',
    'Get Full Access', 'Save €94', '"I want guidance, not just content."', 'Save €94 compared to monthly',
    '["Full 12-month program access","All Basic content (48 videos, workbooks & meditations)","Premium Community access (Skool)","Additional Hubs: The Transformed Self + Chronic Pain","Live Zoom calls (group support & integration)","1-hour individual session included","The program stays open until you finish","14-day money-back guarantee"]'::jsonb,
    '["Want to be seen and supported","Value live connection and real-time reflection","Ready to integrate emotional, physical, and identity healing"]'::jsonb,
    true, true, 40
  )
ON CONFLICT (tier_key) DO NOTHING;
