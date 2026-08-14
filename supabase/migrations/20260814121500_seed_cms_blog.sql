-- Auto-generated seed for CMS phase 2 (docs/cms-final-seed.md).
-- Blog.tsx.
-- value/default_value copied verbatim from the t("key", "fallback") call in the source file
-- named in each row's trailing comment (TypeScript compiler API, not regex -- see
-- scripts/cms-seed.mjs). page/section/field_type/label/sort_order come from the metadata the
-- CMS agents collected while wiring this page (docs/cms-keys-*.json), not guessed.
-- ON CONFLICT (key) DO NOTHING: production already has rows a client may have edited through
-- the admin -- this migration must never overwrite them.

INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type, label, sort_order) VALUES
  ('blog_hero_badge', 'Insights & Resources', 'Insights & Resources', 'Úvodní hlavička — Odznak nad hlavním nadpisem', 'blog', 'hero', 'text', 'Odznak nad hlavním nadpisem', 10), -- from src/pages/Blog.tsx:105
  ('blog_hero_title_pre', 'The Resilient Mind', 'The Resilient Mind', 'Úvodní hlavička — Nadpis – první část', 'blog', 'hero', 'text', 'Nadpis – první část', 20), -- from src/pages/Blog.tsx:110
  ('blog_hero_title_highlight', 'Blog', 'Blog', 'Úvodní hlavička — Nadpis – zvýrazněné slovo', 'blog', 'hero', 'text', 'Nadpis – zvýrazněné slovo', 30), -- from src/pages/Blog.tsx:110
  ('blog_hero_subtitle', 'Practical wisdom, creative techniques, and stories of transformation for expat families building their resilient minds.', 'Practical wisdom, creative techniques, and stories of transformation for expat families building their resilient minds.', 'Úvodní hlavička — Podnadpis pod hlavním nadpisem', 'blog', 'hero', 'textarea', 'Podnadpis pod hlavním nadpisem', 40), -- from src/pages/Blog.tsx:114
  ('blog_empty_state_text', 'Articles coming soon. Subscribe below to be notified!', 'Articles coming soon. Subscribe below to be notified!', 'Prázdný stav a přihlášení k odběru — Hláška, když ještě nejsou publikované žádné články', 'blog', 'newsletter', 'text', 'Hláška, když ještě nejsou publikované žádné články', 60), -- from src/pages/Blog.tsx:186
  ('blog_newsletter_title', 'Never Miss an Article', 'Never Miss an Article', 'Prázdný stav a přihlášení k odběru — Nadpis boxu s přihlášením k odběru', 'blog', 'newsletter', 'text', 'Nadpis boxu s přihlášením k odběru', 70), -- from src/pages/Blog.tsx:193
  ('blog_newsletter_subtitle', 'Subscribe to receive new articles, resources, and exclusive content directly in your inbox.', 'Subscribe to receive new articles, resources, and exclusive content directly in your inbox.', 'Prázdný stav a přihlášení k odběru — Podnadpis boxu s přihlášením k odběru', 'blog', 'newsletter', 'text', 'Podnadpis boxu s přihlášením k odběru', 80), -- from src/pages/Blog.tsx:196
  ('blog_newsletter_placeholder', 'Your email address', 'Your email address', 'Prázdný stav a přihlášení k odběru — Placeholder pole e-mailu', 'blog', 'newsletter', 'text', 'Placeholder pole e-mailu', 90), -- from src/pages/Blog.tsx:201
  ('blog_newsletter_button_label', 'Subscribe', 'Subscribe', 'Prázdný stav a přihlášení k odběru — Text tlačítka Odebírat', 'blog', 'newsletter', 'text', 'Text tlačítka Odebírat', 100), -- from src/pages/Blog.tsx:212
  ('blog_newsletter_button_subscribing', 'Subscribing...', 'Subscribing...', 'Prázdný stav a přihlášení k odběru — Text tlačítka během odesílání', 'blog', 'newsletter', 'text', 'Text tlačítka během odesílání', 110), -- from src/pages/Blog.tsx:212
  ('blog_read_article_label', 'Read Article', 'Read Article', 'Seznam článků — Text odkazu na detail článku', 'blog', 'seznam_clanku', 'text', 'Text odkazu na detail článku', 50) -- from src/pages/Blog.tsx:169
ON CONFLICT (key) DO NOTHING;
