-- Storage bucket for photos uploaded through CmsImageField (docs/cms-images.md)
-- — CMS-managed images (field_type='image_url' rows in cms_content), kept
-- separate from blog-images/resources so a content editor can't accidentally
-- overwrite a blog post's featured image (or vice versa) by reusing a
-- filename in the same bucket.
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-images', 'cms-images', true)
ON CONFLICT (id) DO NOTHING;

-- Unlike blog-images/resources (any authenticated user can upload), writes
-- here are admin-only — this bucket backs site-wide content (hero
-- background, logo, page photos), not per-post assets, so the bar for who
-- can change it is the same as for cms_content itself (public.has_role(...,
-- 'admin'), see 20260814110100_create_cms_sections.sql).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for cms-images' AND tablename = 'objects') THEN
    CREATE POLICY "Public read access for cms-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'cms-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can upload cms images' AND tablename = 'objects') THEN
    CREATE POLICY "Admins can upload cms images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update cms images' AND tablename = 'objects') THEN
    CREATE POLICY "Admins can update cms images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete cms images' AND tablename = 'objects') THEN
    CREATE POLICY "Admins can delete cms images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
