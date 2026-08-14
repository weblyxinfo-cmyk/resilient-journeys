-- Auto-generated seed for CMS phase 2 (docs/cms-final-seed.md).
-- Navbar.tsx: menu links + account/auth button labels.
-- value/default_value copied verbatim from the t("key", "fallback") call in the source file
-- named in each row's trailing comment (TypeScript compiler API, not regex -- see
-- scripts/cms-seed.mjs). page/section/field_type/label/sort_order come from the metadata the
-- CMS agents collected while wiring this page (docs/cms-keys-*.json), not guessed.
-- ON CONFLICT (key) DO NOTHING: production already has rows a client may have edited through
-- the admin -- this migration must never overwrite them.

INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type, label, sort_order) VALUES
  ('navbar_account_fallback_label', 'Account', 'Account', 'Účet a přihlášení — Tlačítko účtu — náhradní text bez jména', 'navbar', 'account', 'text', 'Tlačítko účtu — náhradní text bez jména', 10), -- from src/components/Navbar.tsx:77
  ('navbar_account_admin_panel', 'Admin Panel', 'Admin Panel', 'Účet a přihlášení — Položka menu — Admin Panel', 'navbar', 'account', 'text', 'Položka menu — Admin Panel', 20), -- from src/components/Navbar.tsx:86
  ('navbar_account_dashboard', 'Dashboard', 'Dashboard', 'Účet a přihlášení — Položka menu — Dashboard', 'navbar', 'account', 'text', 'Položka menu — Dashboard', 30), -- from src/components/Navbar.tsx:94
  ('navbar_account_profile_settings', 'Profile Settings', 'Profile Settings', 'Účet a přihlášení — Položka menu — Nastavení profilu', 'navbar', 'account', 'text', 'Položka menu — Nastavení profilu', 40), -- from src/components/Navbar.tsx:99
  ('navbar_account_sign_out', 'Sign Out', 'Sign Out', 'Účet a přihlášení — Položka menu — Odhlásit se', 'navbar', 'account', 'text', 'Položka menu — Odhlásit se', 50), -- from src/components/Navbar.tsx:106
  ('navbar_account_sign_in', 'Sign In', 'Sign In', 'Účet a přihlášení — Tlačítko — Přihlásit se', 'navbar', 'account', 'text', 'Tlačítko — Přihlásit se', 60), -- from src/components/Navbar.tsx:115
  ('navbar_account_get_started', 'Get Started', 'Get Started', 'Účet a přihlášení — Tlačítko CTA — Get Started', 'navbar', 'account', 'text', 'Tlačítko CTA — Get Started', 70), -- from src/components/Navbar.tsx:122
  ('navbar_link_home', 'Home', 'Home', 'Hlavní menu — Odkaz — Domů', 'navbar', 'menu', 'text', 'Odkaz — Domů', 10), -- from src/components/Navbar.tsx:18
  ('navbar_link_about', 'About', 'About', 'Hlavní menu — Odkaz — O mně', 'navbar', 'menu', 'text', 'Odkaz — O mně', 20), -- from src/components/Navbar.tsx:19
  ('navbar_link_resilient_hub', 'Resilient Hub', 'Resilient Hub', 'Hlavní menu — Odkaz — Resilient Hub', 'navbar', 'menu', 'text', 'Odkaz — Resilient Hub', 30), -- from src/components/Navbar.tsx:20
  ('navbar_link_membership', 'Membership', 'Membership', 'Hlavní menu — Odkaz — Membership', 'navbar', 'menu', 'text', 'Odkaz — Membership', 40), -- from src/components/Navbar.tsx:21
  ('navbar_link_blog', 'Blog', 'Blog', 'Hlavní menu — Odkaz — Blog', 'navbar', 'menu', 'text', 'Odkaz — Blog', 50), -- from src/components/Navbar.tsx:22
  ('navbar_link_workshops', 'Workshops', 'Workshops', 'Hlavní menu — Odkaz — Workshopy', 'navbar', 'menu', 'text', 'Odkaz — Workshopy', 60), -- from src/components/Navbar.tsx:23
  ('navbar_link_booking', 'Booking', 'Booking', 'Hlavní menu — Odkaz — Booking', 'navbar', 'menu', 'text', 'Odkaz — Booking', 70) -- from src/components/Navbar.tsx:24
ON CONFLICT (key) DO NOTHING;
