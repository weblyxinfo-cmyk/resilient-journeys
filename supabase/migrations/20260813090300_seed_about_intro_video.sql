-- Closes a gap the new `cms:check` verifier found: `about_intro_video` is one
-- of the rows that predates any migration (created by hand in the admin
-- before About.tsx read it — see the comment in
-- 20260806130000_seed_homepage_about_cms.sql, which updates its field_type
-- but never recorded a value). ON CONFLICT DO NOTHING makes this a no-op on
-- production, where the row and the client's real video URL already exist;
-- it only matters for a fresh database or for the verifier's static check.

INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type)
VALUES (
  'about_intro_video',
  '',
  '',
  'About page — intro video (YouTube URL)',
  'about', 'intro', 'video_url'
)
ON CONFLICT (key) DO NOTHING;
