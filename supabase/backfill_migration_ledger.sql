-- NOT a migration — do not put this in supabase/migrations/, it must never run
-- through `supabase db push`. Run manually, once, directly against production
-- (Supabase SQL editor or the Management API), after independently confirming
-- the ledger is actually missing these 6 rows.
--
-- Background (docs/cms-mapa.md §1.6): 6 migrations already in supabase/migrations/
-- were applied to production by hand via the Management API, so their effects
-- exist on the DB (booking_cards table, all 52 cms_content seed rows) but they
-- were never recorded in supabase_migrations.schema_migrations. Until this is
-- backfilled, `supabase db push` will try to re-run them and may fail or, worse,
-- re-apply a non-idempotent statement.
--
-- Verify first:
--   SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 10;
-- Confirm none of the 6 versions below are already present before running this.

INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES
  ('20260806120000', 'add_eft_reiki_session_type'),
  ('20260806130000', 'seed_homepage_about_cms'),
  ('20260807090000', 'seed_intro_video_texts'),
  ('20260807100000', 'create_booking_cards'),
  ('20260807100100', 'seed_booking_cards'),
  ('20260807110000', 'seed_homepage_services')
ON CONFLICT (version) DO NOTHING;
