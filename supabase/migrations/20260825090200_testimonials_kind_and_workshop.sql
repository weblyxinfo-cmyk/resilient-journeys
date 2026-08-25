-- Separate the testimonials people leave after a workshop from the rest.
--
-- They are shown in different places: the general ones under "Stories of
-- Transformation", the workshop ones on the workshop's own page. Existing rows
-- are all general, which is what they were written for.

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS workshop_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL;

ALTER TABLE public.testimonials
  DROP CONSTRAINT IF EXISTS testimonials_kind_check;
ALTER TABLE public.testimonials
  ADD CONSTRAINT testimonials_kind_check CHECK (kind IN ('general', 'workshop'));

-- A general testimonial has no workshop to point at; leaving one attached
-- would quietly hide it from the page it belongs to.
ALTER TABLE public.testimonials
  DROP CONSTRAINT IF EXISTS testimonials_workshop_only_when_workshop_kind;
ALTER TABLE public.testimonials
  ADD CONSTRAINT testimonials_workshop_only_when_workshop_kind CHECK (
    kind = 'workshop' OR workshop_post_id IS NULL
  );

CREATE INDEX IF NOT EXISTS idx_testimonials_kind_workshop
  ON public.testimonials (kind, workshop_post_id);

COMMENT ON COLUMN public.testimonials.kind IS
  'general = shown in Stories of Transformation; workshop = shown on workshop pages.';
COMMENT ON COLUMN public.testimonials.workshop_post_id IS
  'Which workshop this testimonial is about. NULL on a workshop testimonial means it is shown on every workshop page.';
