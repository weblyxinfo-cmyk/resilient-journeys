-- Align cms_content with what the website actually renders, and seed the keys
-- the hero/about intro now read through useCms().
--
-- Background: five rows existed but nothing on the site read them, so their
-- values drifted far from the live copy (homepage_hero_title still said
-- "Building Inner Strength & Resilience"; about_intro_text still contained the
-- literal "[Your Name]" placeholder). Wiring the frontend to those keys without
-- correcting them first would have published stale copy and a placeholder.
--
-- The UPDATEs below are guarded on the stale value, so re-running this never
-- clobbers a text the client has since edited in the admin.

-- 1. Correct the drifted rows -------------------------------------------------

UPDATE public.cms_content
SET value = 'You Transform Uncertainty Into Your Greatest Strength',
    description = 'Homepage hero — main headline (second line)'
WHERE key = 'homepage_hero_title'
  AND value = 'Building Inner Strength & Resilience';

UPDATE public.cms_content
SET value = 'Living between worlds changes everything—your identity, relationships, and sense of belonging.',
    description = 'Homepage hero — opening line under the headline'
WHERE key = 'homepage_hero_subtitle'
  AND value = 'Art Therapy & Psychology for Expat Families';

UPDATE public.cms_content
SET value = 'At Resilient Mind, we support expatriate women through the emotional and nervous-system challenges of living abroad. We help you gently transform cultural stress, loneliness, and constant change into emotional stability, self-trust, and a deep sense of inner safety.',
    description = 'Homepage hero — second paragraph'
WHERE key = 'homepage_hero_description'
  AND value LIKE 'Supporting expats in adapting to new countries%';

UPDATE public.cms_content
SET value = 'Hi, I''m',
    description = 'About page — headline, text before the highlighted name'
WHERE key = 'about_intro_title'
  AND value = 'Your Guide to Resilience';

UPDATE public.cms_content
SET value = 'I help expatriates and globally mobile individuals build mental resilience, blending proven personal development techniques with insights from my own 13 years of living and thriving abroad.',
    description = 'About page — intro paragraph'
WHERE key = 'about_intro_text'
  AND value LIKE '%[Your Name]%';

-- about_intro_video is stored as 'text', so the admin gives it a plain input and
-- no video preview. About.tsx already treats it as a video URL.
UPDATE public.cms_content
SET field_type = 'video_url',
    description = 'About page — intro video (YouTube URL)'
WHERE key = 'about_intro_video'
  AND field_type = 'text';

-- 2. Seed the keys added alongside the useCms() wiring ------------------------

INSERT INTO public.cms_content (key, value, description, page, section, field_type)
VALUES
  ('homepage_hero_badge',
   'For Expats Ready to Thrive',
   'Homepage hero — small gold badge above the headline',
   'homepage', 'hero', 'text'),

  ('homepage_hero_title_prefix',
   'With',
   'Homepage hero — word before the gold brand name',
   'homepage', 'hero', 'text'),

  ('homepage_hero_title_highlight',
   'Resilient Mind',
   'Homepage hero — the brand name shown in gold',
   'homepage', 'hero', 'text'),

  ('homepage_hero_description_2',
   'Through our signature blend of evidence-based techniques, EFT, expressive creative practices, and integrative mind–body approaches, you develop an unshakable "inner home" — a steady inner foundation you can carry with you wherever life takes you.',
   'Homepage hero — third paragraph',
   'homepage', 'hero', 'textarea'),

  ('about_intro_badge',
   'About Me',
   'About page — small badge above the headline',
   'about', 'intro', 'text'),

  ('about_intro_title_highlight',
   'Silvie',
   'About page — the name shown in gold in the headline',
   'about', 'intro', 'text')
ON CONFLICT (key) DO NOTHING;

-- 3. Make updated_at truthful -------------------------------------------------
-- The column has always defaulted to now() on insert but was never maintained,
-- so every row reports the time it was created rather than last edited.

DROP TRIGGER IF EXISTS update_cms_content_updated_at ON public.cms_content;
CREATE TRIGGER update_cms_content_updated_at
  BEFORE UPDATE ON public.cms_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
