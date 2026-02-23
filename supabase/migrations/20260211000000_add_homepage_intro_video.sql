-- Extend cms_content field_type check to include 'video_url' and 'image_url'
DO $$
BEGIN
  -- Drop existing check constraint if it exists
  ALTER TABLE public.cms_content DROP CONSTRAINT IF EXISTS cms_content_field_type_check;
  -- Re-create with all needed types
  ALTER TABLE public.cms_content ADD CONSTRAINT cms_content_field_type_check
    CHECK (field_type IN ('text', 'textarea', 'html', 'image_url', 'video_url'));
EXCEPTION WHEN OTHERS THEN
  NULL; -- ignore if constraint doesn't exist
END $$;

-- Add homepage intro video CMS field
INSERT INTO cms_content (key, value, description, page, section, field_type)
VALUES (
  'homepage_intro_video',
  '',
  'YouTube or Vimeo URL for the homepage intro video. Leave empty to hide the section.',
  'homepage',
  'intro_video',
  'video_url'
)
ON CONFLICT (key) DO NOTHING;
