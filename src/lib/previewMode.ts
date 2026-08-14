// CMS section previews (src/components/admin/AdminCMS.tsx) render as
// same-origin iframes, so a preview instance boots the whole app. This
// detects that case so auth (useAuth.tsx) and the Supabase client
// (integrations/supabase/client.ts) can both skip session handling —
// shared here so the two don't drift into separate detection logic.
export const isPreviewFrame = () =>
  new URLSearchParams(window.location.search).has('cmsPreview') ||
  (typeof window !== 'undefined' && window.self !== window.top);
