-- Seed data for PrecisionFlow development
-- Populates the database with realistic test data for local development
-- Run with: pnpm db:seed  (or via Supabase Studio)

-- ────────────────────────────────────────────────────────────────
-- 1. CLEAR EXISTING SEED DATA
-- ────────────────────────────────────────────────────────────────
TRUNCATE TABLE public.content_artifacts CASCADE;
TRUNCATE TABLE public.content_tasks CASCADE;
TRUNCATE TABLE public.campaign_shortlists CASCADE;
TRUNCATE TABLE public.campaign_members CASCADE;
TRUNCATE TABLE public.approvals CASCADE;
TRUNCATE TABLE public.briefs CASCADE;
TRUNCATE TABLE public.campaigns CASCADE;
TRUNCATE TABLE public.creators CASCADE;
TRUNCATE TABLE public.clients CASCADE;
-- Note: users are managed via Supabase Auth; do NOT truncate here

-- ────────────────────────────────────────────────────────────────
-- 2. CLIENTS  (3 initial clients from different industries)
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.clients (id, name, company_name, email, industry, tier, phone, website, tags) VALUES
  ('c1111111-1111-1111-1111-111111111111',
   'Nike Marketing', 'Nike Inc.', 'marketing@nike.com',
   'Sports & Fitness', 'platinum', '+1-503-555-0101',
   'https://nike.com', ARRAY['sportswear','global','tier-1']),

  ('c2222222-2222-2222-2222-222222222222',
   'Tesla Motors', 'Tesla Inc.', 'campaigns@tesla.com',
   'Automotive', 'gold', '+1-650-555-0202',
   'https://tesla.com', ARRAY['ev','tech','sustainability']),

  ('c3333333-3333-3333-3333-333333333333',
   'Apple', 'Apple Inc.', 'marketing@apple.com',
   'Technology', 'platinum', '+1-408-555-0303',
   'https://apple.com', ARRAY['tech','lifestyle','premium']);

-- ────────────────────────────────────────────────────────────────
-- 3. CREATORS  (6 influencer profiles across platforms)
-- ────────────────────────────────────────────────────────────────
INSERT INTO public.creators (
  id, name, email, bio, primary_platform,
  instagram_handle, tiktok_handle, youtube_handle,
  instagram_followers, tiktok_followers, youtube_subscribers,
  avg_engagement_rate, niche, content_types,
  rate_card, country, city, status, verified
) VALUES
  ('d1111111-1111-1111-1111-111111111111',
   'Sarah Fitness', 'sarah@creators.example', 'Certified PT & lifestyle content creator',
   'instagram', '@sarahfitness', '@sarah.fit', NULL,
   520000, 380000, 0,
   4.2, ARRAY['fitness','health','lifestyle'], ARRAY['reel','story','post'],
   '{"instagram_reel": 2500, "instagram_post": 1500, "instagram_story": 800}'::jsonb,
   'US', 'Los Angeles', 'active', true),

  ('d2222222-2222-2222-2222-222222222222',
   'TechTom', 'tom@creators.example', 'Tech reviewer & gadget unboxer',
   'youtube', '@techtom_ig', '@techtom', 'TechTomReviews',
   150000, 90000, 1200000,
   3.8, ARRAY['tech','gadgets','reviews'], ARRAY['video','short'],
   '{"youtube_video": 8000, "youtube_short": 3000, "instagram_post": 1000}'::jsonb,
   'US', 'San Francisco', 'active', true),

  ('d3333333-3333-3333-3333-333333333333',
   'Mia Drives', 'mia@creators.example', 'Auto enthusiast & EV advocate',
   'tiktok', '@miadrives', '@mia.drives', 'MiaDrivesChannel',
   280000, 900000, 200000,
   5.1, ARRAY['automotive','ev','lifestyle'], ARRAY['video','reel'],
   '{"tiktok_video": 3500, "instagram_reel": 2000, "youtube_video": 6000}'::jsonb,
   'UK', 'London', 'active', true),

  ('d4444444-4444-4444-4444-444444444444',
   'Chef Marco', 'marco@creators.example', 'Michelin-trained chef sharing quick recipes',
   'instagram', '@chefmarco', '@chef.marco', NULL,
   410000, 620000, 0,
   6.3, ARRAY['food','cooking','lifestyle'], ARRAY['reel','story','post'],
   '{"instagram_reel": 2200, "tiktok_video": 2800, "instagram_post": 1200}'::jsonb,
   'US', 'New York', 'active', false),

  ('d5555555-5555-5555-5555-555555555555',
   'Ava Style', 'ava@creators.example', 'Fashion & beauty influencer',
   'instagram', '@avastyle', '@ava.style', NULL,
   750000, 420000, 0,
   4.8, ARRAY['fashion','beauty','luxury'], ARRAY['reel','post','story'],
   '{"instagram_reel": 3500, "instagram_post": 2000, "instagram_story": 1000}'::jsonb,
   'US', 'Miami', 'active', true),

  ('d6666666-6666-6666-6666-666666666666',
   'GamePro Jay', 'jay@creators.example', 'Pro gamer & streamer',
   'youtube', '@gameprojay_ig', '@gameprojay', 'GameProJay',
   200000, 350000, 800000,
   3.5, ARRAY['gaming','tech','entertainment'], ARRAY['video','short','post'],
   '{"youtube_video": 5000, "youtube_short": 2000, "tiktok_video": 2500}'::jsonb,
   'CA', 'Toronto', 'active', false);

-- ────────────────────────────────────────────────────────────────
-- NOTE ON USER-DEPENDENT DATA
-- ────────────────────────────────────────────────────────────────
-- Campaigns, briefs, approvals, shortlists, and content tasks
-- require a valid user reference (campaign_manager_id, uploaded_by, etc.)
-- tied to Supabase Auth. These rows will be created automatically the
-- first time a signed-in user runs the application and performs actions
-- like "Create Campaign" or "Upload Brief".
--
-- For fully automated seeding after a user signs up, run the companion
-- function below, passing the user's auth UUID as the single argument:
--
--   SELECT seed_demo_data('<USER_UUID>');
--
-- ────────────────────────────────────────────────────────────────

-- Helper function: seed demo campaigns + briefs + approvals for a user
CREATE OR REPLACE FUNCTION public.seed_demo_data(p_user_id UUID)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_campaign1_id UUID := 'a1111111-1111-1111-1111-111111111111';
  v_campaign2_id UUID := 'a2222222-2222-2222-2222-222222222222';
  v_campaign3_id UUID := 'a3333333-3333-3333-3333-333333333333';
  v_brief1_id    UUID := 'b1111111-1111-1111-1111-111111111111';
  v_brief2_id    UUID := 'b2222222-2222-2222-2222-222222222222';
BEGIN
  -- ── Campaigns ──
  INSERT INTO public.campaigns (
    id, name, client_id, campaign_manager_id, status, risk_level,
    start_date, end_date, budget_total, tags
  ) VALUES
    (v_campaign1_id, 'Nike Summer Run 2026', 'c1111111-1111-1111-1111-111111111111',
     p_user_id, 'brief_approved', 'low',
     '2026-06-01', '2026-08-31', 75000.00,
     ARRAY['summer','running','fitness']),
    (v_campaign2_id, 'Tesla Model Y Launch', 'c2222222-2222-2222-2222-222222222222',
     p_user_id, 'shortlist_building', 'medium',
     '2026-04-01', '2026-06-30', 120000.00,
     ARRAY['ev','launch','automotive']),
    (v_campaign3_id, 'Apple Back-to-School', 'c3333333-3333-3333-3333-333333333333',
     p_user_id, 'draft', 'high',
     '2026-07-15', '2026-09-15', 200000.00,
     ARRAY['education','tech','back-to-school'])
  ON CONFLICT (id) DO NOTHING;

  -- ── Briefs ──
  INSERT INTO public.briefs (
    id, campaign_id, raw_content, structured_data, version, is_latest,
    is_approved, uploaded_by
  ) VALUES
    (v_brief1_id, v_campaign1_id,
     'Nike wants to promote the new Summer Run collection with 10 creators across Instagram and TikTok. Target: 18-35 fitness enthusiasts. Budget: $75K. Timeline: June-August 2026. KPIs: 5M impressions, 200K engagements.',
     '{
       "objectives": ["Promote Summer Run collection", "Drive online sales", "Build brand buzz"],
       "target_audience": "18-35 fitness enthusiasts, runners, active lifestyle",
       "deliverables": [
         {"type": "Instagram Reel", "quantity": 10, "description": "60s workout/running reels"},
         {"type": "TikTok Video", "quantity": 10, "description": "Trending fitness challenges"},
         {"type": "Instagram Story", "quantity": 20, "description": "Behind-the-scenes + swipe-up"}
       ],
       "timeline": "June 1 – August 31, 2026",
       "budget": "$75,000",
       "kpis": ["5M impressions", "200K engagements", "15K link clicks"]
     }'::jsonb,
     1, true, true, p_user_id),

    (v_brief2_id, v_campaign2_id,
     'Tesla needs content creators to showcase Model Y features across YouTube and Instagram. Target: tech-savvy 25-45 professionals. Budget: $120K. Timeline: April-June 2026.',
     '{
       "objectives": ["Showcase Model Y features", "Drive test-drive bookings"],
       "target_audience": "25-45 tech-savvy professionals, EV enthusiasts",
       "deliverables": [
         {"type": "YouTube Video", "quantity": 5, "description": "In-depth review + test drive"},
         {"type": "Instagram Reel", "quantity": 10, "description": "Feature highlights"},
         {"type": "TikTok Video", "quantity": 8, "description": "Quick feature demos"}
       ],
       "timeline": "April 1 – June 30, 2026",
       "budget": "$120,000",
       "kpis": ["3M video views", "50K test-drive page visits"],
       "missing_info": ["Specific trim level to feature", "Dealer partnership details"]
     }'::jsonb,
     1, true, false, p_user_id)
  ON CONFLICT (id) DO NOTHING;

  -- ── Approvals ──
  INSERT INTO public.approvals (
    id, campaign_id, approval_type, status,
    approver_id, approver_role, requested_by, comments
  ) VALUES
    ('e1111111-1111-1111-1111-111111111111',
     v_campaign1_id, 'brief', 'approved',
     p_user_id, 'director', p_user_id,
     'Brief looks comprehensive. Approved for shortlisting.'),
    ('e2222222-2222-2222-2222-222222222222',
     v_campaign2_id, 'brief', 'pending',
     p_user_id, 'director', p_user_id,
     NULL),
    ('e3333333-3333-3333-3333-333333333333',
     v_campaign1_id, 'shortlist', 'pending',
     p_user_id, 'director', p_user_id,
     NULL)
  ON CONFLICT (id) DO NOTHING;

  -- ── Shortlists ──
  INSERT INTO public.campaign_shortlists (
    campaign_id, creator_id, position, proposed_rate,
    proposed_deliverables, status, internal_notes, created_by
  ) VALUES
    (v_campaign1_id, 'd1111111-1111-1111-1111-111111111111',
     1, 5000.00,
     ARRAY['5 Instagram Reels','10 Stories'], 'submitted',
     'Top pick – perfect fitness niche fit', p_user_id),
    (v_campaign1_id, 'd4444444-4444-4444-4444-444444444444',
     2, 4500.00,
     ARRAY['5 Instagram Reels','5 TikTok Videos'], 'draft',
     'Good engagement rate, food+fitness crossover', p_user_id),
    (v_campaign2_id, 'd3333333-3333-3333-3333-333333333333',
     1, 8000.00,
     ARRAY['3 YouTube Videos','5 TikTok Videos'], 'submitted',
     'EV expert, strong auto audience', p_user_id),
    (v_campaign2_id, 'd2222222-2222-2222-2222-222222222222',
     2, 10000.00,
     ARRAY['2 YouTube Videos','5 Instagram Reels'], 'draft',
     'Large tech following, great production quality', p_user_id)
  ON CONFLICT DO NOTHING;

  -- ── Campaign Members ──
  INSERT INTO public.campaign_members (
    campaign_id, user_id, role, can_edit, can_approve
  ) VALUES
    (v_campaign1_id, p_user_id, 'manager', true, true),
    (v_campaign2_id, p_user_id, 'manager', true, true),
    (v_campaign3_id, p_user_id, 'manager', true, true)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Demo data seeded for user %', p_user_id;
END;
$$;

COMMENT ON FUNCTION public.seed_demo_data IS
  'Seeds demo campaigns, briefs, approvals, and shortlists for a given user. '
  'Call after signing up: SELECT seed_demo_data(auth.uid());';
