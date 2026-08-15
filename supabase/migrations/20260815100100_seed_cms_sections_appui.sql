-- CMS app-UI phase: cms_sections rows for every (page, section) introduced by
-- 20260815100000_seed_cms_appui.sql (docs/cms-keys-appui.json, docs/cms-appui.md).
-- One row per section actually rendered on the logged-in member pages
-- (Dashboard.tsx, Profile.tsx, VideoPlayer.tsx, Auth.tsx). title/anchor/route come
-- from the same metadata used to generate the cms_content rows above.
-- ON CONFLICT (page, section_key) DO NOTHING, same reasoning as cms_content:
-- never overwrite a row a client may already be seeing/editing.

INSERT INTO public.cms_sections (page, section_key, title, description, anchor, route, sort_order) VALUES
  ('dashboard', 'loading', 'Nástěnka — Načítání stránky', NULL, 'cms-dashboard-loading', '/dashboard', 10),
  ('dashboard', 'header', 'Nástěnka — Hlavička', NULL, 'cms-dashboard-header', '/dashboard', 20),
  ('dashboard', 'stats', 'Nástěnka — Přehled statistik', NULL, 'cms-dashboard-stats', '/dashboard', 30),
  ('dashboard', 'premium_community', 'Nástěnka — Prémiová komunita', NULL, 'cms-dashboard-premium_community', '/dashboard', 40),
  ('dashboard', 'tabs', 'Nástěnka — Záložky obsahu', NULL, 'cms-dashboard-tabs', '/dashboard', 50),
  ('dashboard', 'program_tab', 'Nástěnka — Záložka Program (prázdné/načítací stavy)', NULL, 'cms-dashboard-program_tab', '/dashboard', 60),
  ('dashboard', 'category_card', 'Nástěnka — Karty programových kategorií', NULL, 'cms-dashboard-category_card', '/dashboard', 70),
  ('dashboard', 'category_detail', 'Nástěnka — Detail kategorie (týdny, video karta)', NULL, 'cms-dashboard-category_detail', '/dashboard', 80),
  ('dashboard', 'resources_tab', 'Nástěnka — Záložka Materiály', NULL, 'cms-dashboard-resources_tab', '/dashboard', 90),
  ('dashboard', 'sessions_tab', 'Nástěnka — Záložka Konzultace', NULL, 'cms-dashboard-sessions_tab', '/dashboard', 100),
  ('profile', 'loading', 'Profil — Načítání stránky', NULL, 'cms-profile-loading', '/profile', 10),
  ('profile', 'header', 'Profil — Hlavička', NULL, 'cms-profile-header', '/profile', 20),
  ('profile', 'personal_info', 'Profil — Osobní údaje', NULL, 'cms-profile-personal_info', '/profile', 30),
  ('profile', 'change_password', 'Profil — Změna hesla', NULL, 'cms-profile-change_password', '/profile', 40),
  ('profile', 'membership', 'Profil — Členství', NULL, 'cms-profile-membership', '/profile', 50),
  ('profile', 'messages', 'Profil — Systémová oznámení', NULL, 'cms-profile-personal_info', '/profile', 60),
  ('videoplayer', 'membership', 'Video — Štítky úrovní členství', NULL, 'cms-videoplayer-player', '/video/:videoId', 10),
  ('videoplayer', 'signup_prompt', 'Video — Výzva k registraci (nepřihlášená návštěvnice)', NULL, 'cms-videoplayer-signup_prompt', '/video/:videoId', 20),
  ('videoplayer', 'access_denied', 'Video — Zablokovaný obsah', NULL, 'cms-videoplayer-access_denied', '/video/:videoId', 30),
  ('videoplayer', 'not_found', 'Video — Video nenalezeno', NULL, 'cms-videoplayer-not_found', '/video/:videoId', 40),
  ('videoplayer', 'player', 'Video — Přehrávač', NULL, 'cms-videoplayer-player', '/video/:videoId', 50),
  ('videoplayer', 'messages', 'Video — Systémová oznámení', NULL, 'cms-videoplayer-player', '/video/:videoId', 60),
  ('auth', 'loading', 'Přihlášení — Načítání stránky', NULL, 'cms-auth-loading', '/auth', 10),
  ('auth', 'shared', 'Přihlášení — Sdílené texty (více formulářů)', NULL, 'cms-auth-default_header', '/auth', 20),
  ('auth', 'forgot_password', 'Přihlášení — Zapomenuté heslo', NULL, 'cms-auth-forgot_password', '/auth', 30),
  ('auth', 'reset_sent', 'Přihlášení — Potvrzení odeslání emailu', NULL, 'cms-auth-reset_sent', '/auth', 40),
  ('auth', 'reset_password', 'Přihlášení — Nastavení nového hesla', NULL, 'cms-auth-reset_password', '/auth', 50),
  ('auth', 'tabs', 'Přihlášení — Záložky', NULL, 'cms-auth-tabs', '/auth', 60),
  ('auth', 'login', 'Přihlášení — Formulář přihlášení', NULL, 'cms-auth-login', '/auth', 70),
  ('auth', 'register', 'Přihlášení — Formulář registrace', NULL, 'cms-auth-register', '/auth', 80),
  ('auth', 'terms', 'Přihlášení — Souhlas s podmínkami', NULL, 'cms-auth-terms', '/auth', 90),
  ('auth', 'messages', 'Přihlášení — Systémová oznámení', NULL, 'cms-auth-login', '/auth', 100)
ON CONFLICT (page, section_key) DO NOTHING;
