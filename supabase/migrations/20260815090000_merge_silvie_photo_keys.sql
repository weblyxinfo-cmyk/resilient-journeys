-- Silvie's photo appears on the homepage and on the About page, and each had
-- its own CMS field. She replaced it in one of them, the other kept the old
-- picture, and from the admin there was no way to tell — it read as "I
-- uploaded a photo and nothing happened".
--
-- AboutPreview now reads the About page's key, so the two places share one
-- field. The now-unused row is removed so it can't be edited to no effect.
-- Its label is widened first, since it no longer belongs to one page.

UPDATE public.cms_content
SET label = 'Fotka Silvie (úvodní stránka i O mně)',
    description = 'Zobrazuje se na dvou místech: v sekci O mně na úvodní stránce a na stránce O mně.'
WHERE key = 'about_intro_photo';

DELETE FROM public.cms_content
WHERE key = 'shared_about_preview_photo';
