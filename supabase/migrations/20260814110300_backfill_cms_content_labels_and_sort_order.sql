-- Backfill label + sort_order for all 53 existing cms_content rows.
--
-- sort_order already exists (20260813090000) but was never set — every row
-- still defaults to 0, so today's admin falls back to alphabetical-by-key
-- order within a section, which does not match the page (e.g.
-- "homepage_hero_description" sorts before "homepage_hero_title" even
-- though the title renders first). Values below are per (page, section),
-- in steps of 10, in the order each field actually renders — verified
-- against Hero.tsx, IntroVideo.tsx, Services.tsx, About.tsx — with gaps
-- left for inserting a field later without renumbering everything.
--
-- label is new (previous migration) and always NULL until now. It is the
-- short, client-facing name shown above the field in the admin; `key` and
-- `description` (written for a developer) move to small print below it.
--
-- Plain UPDATE, not a guarded one: unlike the value-correcting UPDATEs in
-- 20260806130000, label/sort_order are never edited by the client through
-- the admin (only `value` is), so there is no risk of this clobbering a
-- real edit on re-run.

UPDATE public.cms_content AS c
SET label = v.label,
    sort_order = v.sort_order
FROM (VALUES
  -- homepage / hero
  ('homepage_hero_badge',             'Badge nad nadpisem',                          10),
  ('homepage_hero_title_prefix',      'Nadpis — úvodní slovo',                       20),
  ('homepage_hero_title_highlight',   'Nadpis — zvýrazněná část (zlatě)',            30),
  ('homepage_hero_title',             'Nadpis — druhý řádek',                        40),
  ('homepage_hero_subtitle',          'Podnadpis',                                   50),
  ('homepage_hero_description',       'Popisný text 1',                              60),
  ('homepage_hero_description_2',     'Popisný text 2',                              70),

  -- homepage / intro_video
  ('homepage_intro_video_badge',      'Badge nad nadpisem',                          10),
  ('homepage_intro_video_title',      'Nadpis sekce',                                20),
  ('homepage_intro_video',            'URL videa (YouTube/Vimeo)',                   30),

  -- homepage / why_join
  ('homepage_whyjoin_1_title',        'Bod 1 — nadpis',                              10),
  ('homepage_whyjoin_1_description',  'Bod 1 — text',                                20),
  ('homepage_whyjoin_2_title',        'Bod 2 — nadpis',                              30),
  ('homepage_whyjoin_2_description',  'Bod 2 — text',                                40),
  ('homepage_whyjoin_3_title',        'Bod 3 — nadpis',                              50),
  ('homepage_whyjoin_3_description',  'Bod 3 — text',                                60),
  ('homepage_whyjoin_4_title',        'Bod 4 — nadpis',                              70),
  ('homepage_whyjoin_4_description',  'Bod 4 — text',                                80),
  ('homepage_whyjoin_5_title',        'Bod 5 — nadpis',                              90),
  ('homepage_whyjoin_5_description',  'Bod 5 — text',                               100),

  -- homepage / approach
  ('homepage_approach_1_title',       'Důvod 1 — nadpis',                            10),
  ('homepage_approach_1_description', 'Důvod 1 — text',                              20),
  ('homepage_approach_2_title',       'Důvod 2 — nadpis',                            30),
  ('homepage_approach_2_description', 'Důvod 2 — text',                              40),
  ('homepage_approach_3_title',       'Důvod 3 — nadpis',                            50),
  ('homepage_approach_3_description', 'Důvod 3 — text',                              60),

  -- homepage / who_its_for
  ('homepage_who_1',                  'Řádek 1',                                     10),
  ('homepage_who_2',                  'Řádek 2',                                     20),
  ('homepage_who_3',                  'Řádek 3',                                     30),

  -- homepage / ways_to_work
  ('homepage_ways_1_title',           'Možnost 1 — nadpis',                          10),
  ('homepage_ways_1_description',     'Možnost 1 — text',                            20),
  ('homepage_ways_2_title',           'Možnost 2 — nadpis',                          30),
  ('homepage_ways_2_description',     'Možnost 2 — text',                            40),
  ('homepage_ways_3_title',           'Možnost 3 — nadpis',                          50),
  ('homepage_ways_3_description',     'Možnost 3 — text',                            60),

  -- homepage / services
  ('homepage_services_1_title',       'Karta 1 — nadpis',                            10),
  ('homepage_services_1_subtitle',    'Karta 1 — podnadpis',                         20),
  ('homepage_services_1_description', 'Karta 1 — popis',                             30),
  ('homepage_services_1_price',       'Karta 1 — cena',                              40),
  ('homepage_services_2_title',       'Karta 2 — nadpis',                            50),
  ('homepage_services_2_subtitle',    'Karta 2 — podnadpis',                         60),
  ('homepage_services_2_description', 'Karta 2 — popis',                             70),
  ('homepage_services_2_price',       'Karta 2 — cena',                              80),
  ('homepage_services_3_title',       'Karta 3 — nadpis',                            90),
  ('homepage_services_3_subtitle',    'Karta 3 — podnadpis',                        100),
  ('homepage_services_3_description', 'Karta 3 — popis',                            110),
  ('homepage_services_3_price',       'Karta 3 — cena',                             120),

  -- about / intro
  ('about_intro_badge',               'Badge nad nadpisem',                          10),
  ('about_intro_title',               'Nadpis — úvodní slovo',                       20),
  ('about_intro_title_highlight',     'Nadpis — zvýrazněné jméno (zlatě)',           30),
  ('about_intro_text',                'Úvodní text',                                 40),
  ('about_intro_video',               'URL videa (YouTube/Vimeo)',                   50),

  -- shared / contact
  ('shared_contact_email',            'Kontaktní e-mail',                            10)
) AS v(key, label, sort_order)
WHERE c.key = v.key;
