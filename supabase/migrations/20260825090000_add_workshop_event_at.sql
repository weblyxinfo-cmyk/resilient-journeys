-- When the workshop actually takes place, as opposed to when it was posted.
--
-- The site showed published_at on workshop cards, so a workshop posted in
-- August but held in September advertised the August date. scheduled_at could
-- not stand in for this: it means "publish this later", not "this is when it
-- happens".
--
-- Left NULL on blog articles, which keep showing their publication date.

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS event_at TIMESTAMPTZ;

COMMENT ON COLUMN public.blog_posts.event_at IS
  'Date and time the workshop is held. NULL for ordinary blog posts, which fall back to published_at.';

-- Workshops are listed by the nearest date first, so the ordering column is worth an index.
CREATE INDEX IF NOT EXISTS idx_blog_posts_event_at
  ON public.blog_posts (event_at)
  WHERE event_at IS NOT NULL;
