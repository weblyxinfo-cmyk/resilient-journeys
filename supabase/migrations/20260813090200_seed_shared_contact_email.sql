-- Move the contact email out of site_settings (a table nothing on the site
-- reads — see docs/cms-mapa.md §2.4) and into cms_content, which Footer.tsx
-- now actually reads through useCms(). Value matches the hardcoded email
-- Footer.tsx used before this change, so this is a no-op for visitors.

INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type)
VALUES (
  'shared_contact_email',
  'contact@resilientmind.io',
  'contact@resilientmind.io',
  'Shared — contact email shown in the footer and used for the mailto link',
  'shared',
  'contact',
  'text'
)
ON CONFLICT (key) DO NOTHING;
