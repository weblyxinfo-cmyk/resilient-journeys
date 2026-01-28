-- ===============================================
-- Update Workshops with Photo Galleries and Videos
-- ===============================================

-- Silk Painting Workshop
UPDATE blog_posts
SET
  gallery_images = ARRAY[
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
    'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7',
    'https://images.unsplash.com/photo-1561998338-13ad7883b21f'
  ],
  video_urls = ARRAY[
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/jNQXAC9IVRw'
  ],
  min_membership = 'basic'
WHERE slug = 'silk-painting-emotional-release-workshop';

-- Family Resilience Workshop
UPDATE blog_posts
SET
  gallery_images = ARRAY[
    'https://images.unsplash.com/photo-1511895426328-dc8714191300',
    'https://images.unsplash.com/photo-1475503572774-15a45e5d60b9',
    'https://images.unsplash.com/photo-1609220136736-443140cffec6',
    'https://images.unsplash.com/photo-1516627145497-ae6968895b74',
    'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a'
  ],
  video_urls = ARRAY[
    'https://www.youtube.com/embed/dQw4w9WgXcQ'
  ],
  min_membership = 'basic'
WHERE slug = 'resilience-expat-families-workshop';

-- Money Mindset Intensive
UPDATE blog_posts
SET
  gallery_images = ARRAY[
    'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf',
    'https://images.unsplash.com/photo-1554224311-beee460ae6ba',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e',
    'https://images.unsplash.com/photo-1580519542036-c47de6196ba5',
    'https://images.unsplash.com/photo-1621981386829-9b458a2cddde'
  ],
  video_urls = ARRAY[
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/jNQXAC9IVRw'
  ],
  min_membership = 'premium'
WHERE slug = 'money-mindset-intensive-workshop';

-- Career Transitions Workshop
UPDATE blog_posts
SET
  gallery_images = ARRAY[
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902'
  ],
  video_urls = ARRAY[
    'https://www.youtube.com/embed/dQw4w9WgXcQ'
  ],
  min_membership = 'basic'
WHERE slug = 'career-transition-abroad-workshop';

-- Inner Home Weekend Retreat
UPDATE blog_posts
SET
  gallery_images = ARRAY[
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    'https://images.unsplash.com/photo-1545389336-cf090694435e',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d',
    'https://images.unsplash.com/photo-1499209974431-9dddcece7f88',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
    'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5'
  ],
  video_urls = ARRAY[
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/jNQXAC9IVRw',
    'https://www.youtube.com/embed/9bZkp7q19f0'
  ],
  min_membership = 'premium'
WHERE slug = 'inner-home-weekend-retreat';
