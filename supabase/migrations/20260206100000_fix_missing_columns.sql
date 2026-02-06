-- ===============================================
-- Fix missing columns and tables
-- Run in Supabase SQL Editor if not using CLI migrations
-- ===============================================

-- 1. blog_posts: missing columns for admin scheduling & SEO
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS author_id UUID;

-- 2. cms_content: entire table missing
CREATE TABLE IF NOT EXISTS public.cms_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  page TEXT,
  section TEXT,
  field_type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cms_content' AND policyname = 'Anyone can read cms_content'
  ) THEN
    CREATE POLICY "Anyone can read cms_content"
      ON public.cms_content FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cms_content' AND policyname = 'Admins can manage cms_content'
  ) THEN
    CREATE POLICY "Admins can manage cms_content"
      ON public.cms_content FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.user_id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;
