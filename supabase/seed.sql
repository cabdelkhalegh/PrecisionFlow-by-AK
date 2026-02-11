-- TiKiT OS seed data (Version B)
-- Run in Supabase SQL editor or via: supabase db seed

-- Sample profiles (brands/influencers)
INSERT INTO public.profiles (id, full_name, role, bio, avatar_url)
VALUES
  (uuid_generate_v4(), 'Tikit Agency', 'brand', 'Flagship agency account', null),
  (uuid_generate_v4(), 'Sara Al Mansouri', 'influencer', 'Lifestyle & luxury creator in Dubai', null),
  (uuid_generate_v4(), 'Omar Al Qasimi', 'influencer', 'Tech & automotive reviewer', null),
  (uuid_generate_v4(), 'Aisha Noor', 'influencer', 'Beauty + wellness', null);

-- Sample campaigns (brand_id needs to reference an existing profile id)
WITH brand AS (
  SELECT id FROM public.profiles WHERE role = 'brand' LIMIT 1
)
INSERT INTO public.campaigns (id, brand_id, title, description, budget, status, start_date, end_date, requirements)
SELECT
  uuid_generate_v4(),
  brand.id,
  'Ramadan Luxury Coffee Experience',
  'Launch for a premium café experience across Dubai and Abu Dhabi.',
  25000,
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  '{"posts":2,"stories":6,"reels":1}'::jsonb
FROM brand;

-- Sample deliverables
WITH inf AS (
  SELECT id FROM public.profiles WHERE role = 'influencer' LIMIT 1
), camp AS (
  SELECT id FROM public.campaigns LIMIT 1
)
INSERT INTO public.deliverables (id, campaign_id, influencer_id, platform, type, status)
SELECT uuid_generate_v4(), camp.id, inf.id, 'instagram', 'reel', 'pending'
FROM inf, camp;

-- Sample proposal
WITH inf AS (
  SELECT id FROM public.profiles WHERE role = 'influencer' LIMIT 1
), camp AS (
  SELECT id FROM public.campaigns LIMIT 1
)
INSERT INTO public.proposals (id, campaign_id, influencer_id, status, pitch, proposed_rate)
SELECT uuid_generate_v4(), camp.id, inf.id, 'pending', 'I can deliver 1 reel + 3 stories with high engagement.', 1500
FROM inf, camp;
