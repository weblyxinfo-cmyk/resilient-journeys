-- ===============================================
-- Add Media Gallery Fields to Blog Posts/Workshops
-- ===============================================

-- Add gallery and video fields
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS min_membership membership_type DEFAULT 'free',
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_min_membership ON public.blog_posts(min_membership);
CREATE INDEX IF NOT EXISTS idx_blog_posts_view_count ON public.blog_posts(view_count DESC);
