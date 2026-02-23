-- Create resources storage bucket for PDF workbooks, audio files etc.
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Policies — use DO block to skip if already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for resources' AND tablename = 'objects') THEN
    CREATE POLICY "Public read access for resources"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resources');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload resources' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can upload resources"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'resources');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update resources' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can update resources"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'resources');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete resources' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can delete resources"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'resources');
  END IF;
END $$;
