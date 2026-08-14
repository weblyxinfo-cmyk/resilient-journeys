-- Auto-generated seed for CMS phase 2 (docs/cms-final-seed.md).
-- BlogPost.tsx.
-- value/default_value copied verbatim from the t("key", "fallback") call in the source file
-- named in each row's trailing comment (TypeScript compiler API, not regex -- see
-- scripts/cms-seed.mjs). page/section/field_type/label/sort_order come from the metadata the
-- CMS agents collected while wiring this page (docs/cms-keys-*.json), not guessed.
-- ON CONFLICT (key) DO NOTHING: production already has rows a client may have edited through
-- the admin -- this migration must never overwrite them.

INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type, label, sort_order) VALUES
  ('blogpost_loading_text', 'Loading article...', 'Loading article...', 'Načítání článku — Text během načítání článku', 'blog-post', 'loading', 'text', 'Text během načítání článku', 10), -- from src/pages/BlogPost.tsx:91
  ('blogpost_back_link', 'Back to Blog', 'Back to Blog', 'Navigace — Text odkazu zpět na blog', 'blog-post', 'navigace', 'text', 'Text odkazu zpět na blog', 20), -- from src/pages/BlogPost.tsx:135
  ('blogpost_membership_free', 'Free', 'Free', 'Placená zeď (nedostatečné členství) — Název úrovně členství – Free', 'blog-post', 'paywall', 'text', 'Název úrovně členství – Free', 30), -- from src/pages/BlogPost.tsx:29
  ('blogpost_membership_basic', 'Basic Membership', 'Basic Membership', 'Placená zeď (nedostatečné členství) — Název úrovně členství – Basic', 'blog-post', 'paywall', 'text', 'Název úrovně členství – Basic', 40), -- from src/pages/BlogPost.tsx:30
  ('blogpost_membership_premium', 'Premium Membership', 'Premium Membership', 'Placená zeď (nedostatečné členství) — Název úrovně členství – Premium', 'blog-post', 'paywall', 'text', 'Název úrovně členství – Premium', 50), -- from src/pages/BlogPost.tsx:31
  ('blogpost_paywall_required_label', 'Required', 'Required', 'Placená zeď (nedostatečné členství) — Text za názvem úrovně členství ("Required")', 'blog-post', 'paywall', 'text', 'Text za názvem úrovně členství ("Required")', 60), -- from src/pages/BlogPost.tsx:187
  ('blogpost_paywall_text_pre', 'This article is exclusive to', 'This article is exclusive to', 'Placená zeď (nedostatečné členství) — Text před názvem úrovně členství', 'blog-post', 'paywall', 'text', 'Text před názvem úrovně členství', 70), -- from src/pages/BlogPost.tsx:190
  ('blogpost_paywall_text_post', 'members. Upgrade your membership to unlock this content and access our full library.', 'members. Upgrade your membership to unlock this content and access our full library.', 'Placená zeď (nedostatečné členství) — Text za názvem úrovně členství (vysvětlení a výzva k upgradu)', 'blog-post', 'paywall', 'textarea', 'Text za názvem úrovně členství (vysvětlení a výzva k upgradu)', 80), -- from src/pages/BlogPost.tsx:190
  ('blogpost_paywall_button_upgrade', 'Upgrade Membership', 'Upgrade Membership', 'Placená zeď (nedostatečné členství) — Text tlačítka – upgradovat členství (přihlášený uživatel)', 'blog-post', 'paywall', 'text', 'Text tlačítka – upgradovat členství (přihlášený uživatel)', 90), -- from src/pages/BlogPost.tsx:196
  ('blogpost_paywall_button_signin', 'Sign In to Continue', 'Sign In to Continue', 'Placená zeď (nedostatečné členství) — Text tlačítka – přihlásit se (nepřihlášený uživatel)', 'blog-post', 'paywall', 'text', 'Text tlačítka – přihlásit se (nepřihlášený uživatel)', 100) -- from src/pages/BlogPost.tsx:196
ON CONFLICT (key) DO NOTHING;
