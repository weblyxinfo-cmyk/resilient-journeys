-- Auto-generated seed for CMS phase 2 (docs/cms-final-seed.md).
-- WorkshopPost.tsx.
-- value/default_value copied verbatim from the t("key", "fallback") call in the source file
-- named in each row's trailing comment (TypeScript compiler API, not regex -- see
-- scripts/cms-seed.mjs). page/section/field_type/label/sort_order come from the metadata the
-- CMS agents collected while wiring this page (docs/cms-keys-*.json), not guessed.
-- ON CONFLICT (key) DO NOTHING: production already has rows a client may have edited through
-- the admin -- this migration must never overwrite them.

INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type, label, sort_order) VALUES
  ('workshoppost_loading_text', 'Loading workshop...', 'Loading workshop...', 'Načítání workshopu — Text během načítání workshopu', 'workshop-post', 'loading', 'text', 'Text během načítání workshopu', 10), -- from src/pages/WorkshopPost.tsx:98
  ('workshoppost_back_link', 'Back to Workshops', 'Back to Workshops', 'Navigace — Text odkazu zpět na workshopy', 'workshop-post', 'navigace', 'text', 'Text odkazu zpět na workshopy', 20), -- from src/pages/WorkshopPost.tsx:137
  ('workshoppost_membership_free', 'Free', 'Free', 'Placená zeď (nedostatečné členství) — Název úrovně členství – Free', 'workshop-post', 'paywall', 'text', 'Název úrovně členství – Free', 40), -- from src/pages/WorkshopPost.tsx:38
  ('workshoppost_membership_basic', 'Basic Membership', 'Basic Membership', 'Placená zeď (nedostatečné členství) — Název úrovně členství – Basic', 'workshop-post', 'paywall', 'text', 'Název úrovně členství – Basic', 50), -- from src/pages/WorkshopPost.tsx:39
  ('workshoppost_membership_premium', 'Premium Membership', 'Premium Membership', 'Placená zeď (nedostatečné členství) — Název úrovně členství – Premium', 'workshop-post', 'paywall', 'text', 'Název úrovně členství – Premium', 60), -- from src/pages/WorkshopPost.tsx:40
  ('workshoppost_paywall_required_label', 'Required', 'Required', 'Placená zeď (nedostatečné členství) — Text za názvem úrovně členství ("Required")', 'workshop-post', 'paywall', 'text', 'Text za názvem úrovně členství ("Required")', 70), -- from src/pages/WorkshopPost.tsx:212
  ('workshoppost_paywall_text_pre', 'This workshop is exclusive to', 'This workshop is exclusive to', 'Placená zeď (nedostatečné členství) — Text před názvem úrovně členství', 'workshop-post', 'paywall', 'text', 'Text před názvem úrovně členství', 80), -- from src/pages/WorkshopPost.tsx:215
  ('workshoppost_paywall_text_post', 'members. Upgrade your membership to unlock this content and access our full library.', 'members. Upgrade your membership to unlock this content and access our full library.', 'Placená zeď (nedostatečné členství) — Text za názvem úrovně členství (vysvětlení a výzva k upgradu)', 'workshop-post', 'paywall', 'textarea', 'Text za názvem úrovně členství (vysvětlení a výzva k upgradu)', 90), -- from src/pages/WorkshopPost.tsx:215
  ('workshoppost_paywall_button_upgrade', 'Upgrade Membership', 'Upgrade Membership', 'Placená zeď (nedostatečné členství) — Text tlačítka – upgradovat členství (přihlášený uživatel)', 'workshop-post', 'paywall', 'text', 'Text tlačítka – upgradovat členství (přihlášený uživatel)', 100), -- from src/pages/WorkshopPost.tsx:221
  ('workshoppost_paywall_button_signin', 'Sign In to Continue', 'Sign In to Continue', 'Placená zeď (nedostatečné členství) — Text tlačítka – přihlásit se (nepřihlášený uživatel)', 'workshop-post', 'paywall', 'text', 'Text tlačítka – přihlásit se (nepřihlášený uživatel)', 110), -- from src/pages/WorkshopPost.tsx:221
  ('workshoppost_videos_title', 'Workshop Videos', 'Workshop Videos', 'Videa workshopu — Nadpis sekce s videi', 'workshop-post', 'videa', 'text', 'Nadpis sekce s videi', 30) -- from src/pages/WorkshopPost.tsx:182
ON CONFLICT (key) DO NOTHING;
