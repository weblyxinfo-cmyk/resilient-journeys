-- Create blog-images storage bucket (if not already created via Dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies — use DO block to skip if already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for blog-images' AND tablename = 'objects') THEN
    CREATE POLICY "Public read access for blog-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'blog-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload blog images' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can upload blog images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'blog-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update blog images' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can update blog images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'blog-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete blog images' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can delete blog images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'blog-images');
  END IF;
END $$;
