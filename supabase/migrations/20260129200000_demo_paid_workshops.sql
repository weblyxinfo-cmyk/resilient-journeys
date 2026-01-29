-- ===============================================
-- PAID WORKSHOPS - Demo Content
-- ===============================================

-- Paid workshop: Silk Painting in Prague (CZK)
INSERT INTO blog_posts (title, slug, excerpt, content, category, featured_image_url, tags, is_published, published_at, is_paid_workshop, workshop_price, workshop_currency, payment_iban, payment_message)
VALUES
('Silk Painting & Emotional Release — Prague',
 'silk-painting-prague',
 'A transformative 3-hour hands-on workshop in Prague. Use silk painting to process complex emotions and discover your inner creative voice.',
 'Join me for an intimate, in-person workshop in the heart of Prague where art becomes a gateway to emotional healing.

What You Will Experience
• Learn silk painting techniques as a form of meditation
• Use color, movement, and texture to express what words cannot
• Process emotions related to cultural displacement, grief, or transition
• Take home your own silk artwork as a symbol of your journey

Workshop Details
Duration: 3 hours (10:00–13:00)
Date: Saturday, March 15, 2026
Location: Art Studio, Vinohrady, Prague 2
Language: English & Czech
Group Size: Maximum 8 participants

What Is Included
All art supplies (silk, dyes, brushes), light refreshments, and a digital workbook for continued practice at home.

Who Is This For
Anyone feeling emotionally overwhelmed, stuck in transition, or looking for a creative way to reconnect with themselves. No art experience needed.',
 'workshop',
 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
 ARRAY['art therapy', 'silk painting', 'prague', 'in-person', 'workshop'],
 true,
 NOW() - INTERVAL '2 days',
 true,
 1800,
 'CZK',
 'CZ6508000000192000145399',
 'Workshop Silk Painting Prague');

-- Paid workshop: Resilience Intensive Online (EUR)
INSERT INTO blog_posts (title, slug, excerpt, content, category, featured_image_url, tags, is_published, published_at, is_paid_workshop, workshop_price, workshop_currency, payment_iban, payment_message)
VALUES
('Resilience Reset: Online Weekend Intensive',
 'resilience-reset-online-intensive',
 'A deep 2-day online intensive combining somatic practices, journaling, and guided meditations to rebuild your emotional foundation.',
 'This weekend intensive is designed for expats who feel depleted, disconnected, or stuck in survival mode. Over two days, we will rebuild your resilience from the ground up.

Day 1 — Saturday: Unraveling
09:00–12:00  Mapping your stress patterns & nervous system responses
13:00–16:00  Somatic release practices & breathwork
16:00–17:00  Guided journaling: Your resilience story so far

Day 2 — Sunday: Rebuilding
09:00–12:00  Creating your personal resilience toolkit
13:00–16:00  Energy anchoring & inner home meditation
16:00–17:00  Integration circle & 30-day action plan

What Is Included
• Comprehensive digital workbook (60+ pages)
• 4 recorded meditations for continued practice
• Access to a private support group for 30 days
• 1 follow-up individual session (30 min)

Workshop Details
Date: April 5–6, 2026
Format: Live online via Zoom
Language: English
Group Size: Maximum 10 participants
Price: €220',
 'workshop',
 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
 ARRAY['resilience', 'intensive', 'online', 'somatic', 'workshop'],
 true,
 NOW() - INTERVAL '3 days',
 true,
 220,
 'EUR',
 'CZ6508000000192000145399',
 'Workshop Resilience Reset');

-- Paid workshop: Corporate Team Resilience (CZK, higher price)
INSERT INTO blog_posts (title, slug, excerpt, content, category, featured_image_url, tags, is_published, published_at, is_paid_workshop, workshop_price, workshop_currency, payment_iban, payment_message)
VALUES
('Team Resilience: Corporate Workshop for International Teams',
 'team-resilience-corporate-workshop',
 'A half-day workshop for multicultural teams. Build psychological safety, improve communication, and strengthen team resilience.',
 'Designed for companies with international or multicultural teams, this workshop addresses the unique challenges of cross-cultural collaboration.

Workshop Modules
1. Cultural Intelligence & Communication Styles (90 min)
   Understanding how different cultural backgrounds shape work expectations, conflict styles, and communication patterns.

2. Building Psychological Safety Across Cultures (90 min)
   Interactive exercises to create an environment where every team member feels safe to contribute, regardless of cultural background.

3. Team Resilience Action Plan (60 min)
   Collaborative session to create practical rituals and practices your team can implement immediately.

Format Options
• In-person (Prague or travel to your location)
• Online via Zoom/Teams
• Hybrid format available

What Is Included
• Pre-workshop team assessment questionnaire
• Comprehensive facilitator slides & materials
• Team resilience workbook (digital, one per participant)
• Post-workshop summary report with recommendations
• 1-month follow-up check-in call

Details
Duration: 4 hours
Language: English (Czech available on request)
Team Size: 6–25 participants
Price: Per-person rate for individual registration',
 'workshop',
 'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
 ARRAY['corporate', 'team building', 'multicultural', 'leadership', 'workshop'],
 true,
 NOW() - INTERVAL '1 day',
 true,
 3500,
 'CZK',
 'CZ6508000000192000145399',
 'Workshop Team Resilience');

-- Free inquiry workshop (no payment, just inquiry form)
INSERT INTO blog_posts (title, slug, excerpt, content, category, featured_image_url, tags, is_published, published_at, is_paid_workshop, workshop_price, workshop_currency)
VALUES
('Custom Workshop: Designed for Your Community',
 'custom-workshop-your-community',
 'Looking for a tailored workshop for your expat group, school, or organization? Let us create something unique together.',
 'Every community is different, and cookie-cutter workshops rarely address your specific needs. That is why I offer fully customized workshops designed around your group.

How It Works
1. Discovery Call — We discuss your group, their challenges, and your goals
2. Custom Design — I create a workshop tailored specifically to your needs
3. Delivery — Interactive, engaging, and transformative experience
4. Follow-Up — Post-workshop resources and optional ongoing support

Popular Themes
• Expat spouse resilience & identity
• Cultural adjustment for newly arrived families
• Stress management for international school staff
• Creative expression for processing change
• Building community in a new country

Available Formats
• In-person (Prague, or I can travel)
• Online via Zoom
• Half-day (3 hours) or full-day (6 hours)
• One-time session or multi-week series

Languages: English, Czech, Spanish

Use the inquiry form below to tell me about your group and I will create a proposal for you.',
 'workshop',
 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac',
 ARRAY['custom', 'tailored', 'community', 'organizations', 'workshop'],
 true,
 NOW(),
 false,
 0,
 'CZK');
