-- ============================================
-- FIX: Premium members get access to Additional Hubs
-- Previously, hub content was only accessible via purchased_hubs.
-- Now, Premium members automatically get access to all hubs.
-- ============================================

-- 1. UPDATE VIDEOS RLS POLICY
DROP POLICY IF EXISTS "Members can view videos based on membership" ON public.videos;

CREATE POLICY "Members can view videos based on membership"
  ON public.videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      LEFT JOIN public.video_categories vc ON videos.category_id = vc.id
      WHERE p.user_id = auth.uid()
      AND (
        -- Option 1: Premium members get access to ALL content (including hubs)
        (
          p.membership_type = 'premium'
          AND (p.membership_expires_at IS NULL OR p.membership_expires_at > now())
        )
        -- Option 2: Basic membership (access to basic non-hub content only)
        OR (
          videos.min_membership = 'basic'
          AND p.membership_type IN ('basic', 'premium')
          AND (vc.is_additional_hub IS NULL OR vc.is_additional_hub = false)
          AND (p.membership_expires_at IS NULL OR p.membership_expires_at > now())
        )
        -- Option 3: Video is from additional hub that user purchased
        OR (
          vc.is_additional_hub = true
          AND vc.hub_slug IS NOT NULL
          AND p.purchased_hubs ? vc.hub_slug
        )
      )
    )
  );

-- 2. UPDATE RESOURCES RLS POLICY
DROP POLICY IF EXISTS "Members can view resources based on membership" ON public.resources;

CREATE POLICY "Members can view resources based on membership"
  ON public.resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      LEFT JOIN public.video_categories vc ON resources.category_id = vc.id
      WHERE p.user_id = auth.uid()
      AND (
        -- Option 1: Premium members get access to ALL content (including hubs)
        (
          p.membership_type = 'premium'
          AND (p.membership_expires_at IS NULL OR p.membership_expires_at > now())
        )
        -- Option 2: Basic membership (access to basic non-hub content only)
        OR (
          resources.min_membership = 'basic'
          AND p.membership_type IN ('basic', 'premium')
          AND (vc.is_additional_hub IS NULL OR vc.is_additional_hub = false)
          AND (p.membership_expires_at IS NULL OR p.membership_expires_at > now())
        )
        -- Option 3: Resource is from additional hub that user purchased
        OR (
          vc.is_additional_hub = true
          AND vc.hub_slug IS NOT NULL
          AND p.purchased_hubs ? vc.hub_slug
        )
      )
    )
  );
