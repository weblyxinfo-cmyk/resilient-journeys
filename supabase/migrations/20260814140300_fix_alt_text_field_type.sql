-- The seed generator's heuristic typed the two Membership alt-text keys as
-- image_url because their names end in a word it associates with images.
-- They hold sentences describing a photo for screen readers, not URLs, so the
-- admin would have offered an upload button for a piece of prose.
UPDATE public.cms_content
SET field_type = 'text'
WHERE field_type = 'image_url'
  AND key LIKE '%_alt';
