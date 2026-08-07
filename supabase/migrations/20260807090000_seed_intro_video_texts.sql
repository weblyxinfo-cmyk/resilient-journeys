-- Seed the two headings around the homepage intro video, which moved from
-- hardcoded JSX to useCms() when IntroVideo dropped its own cms_content fetch.

INSERT INTO public.cms_content (key, value, description, page, section, field_type)
VALUES
  ('homepage_intro_video_badge',
   'Watch Introduction',
   'Homepage intro video — small badge above the heading',
   'homepage', 'intro_video', 'text'),

  ('homepage_intro_video_title',
   'See What Resilient Mind Is About',
   'Homepage intro video — heading above the video',
   'homepage', 'intro_video', 'text')
ON CONFLICT (key) DO NOTHING;
