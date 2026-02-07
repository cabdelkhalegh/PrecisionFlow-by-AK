-- Seed data for TiKiT OS development
-- This file populates the database with test data for local development

-- Clear existing seed data (for reset)
TRUNCATE TABLE public.campaign_members CASCADE;
TRUNCATE TABLE public.approvals CASCADE;
TRUNCATE TABLE public.briefs CASCADE;
TRUNCATE TABLE public.campaigns CASCADE;
TRUNCATE TABLE public.clients CASCADE;
TRUNCATE TABLE public.users CASCADE;

-- Note: We'll add actual seed users via Supabase Auth in the application
-- This seed file will be updated once we have the authentication flow working

-- Insert sample clients
INSERT INTO public.clients (id, name, company_name, email, industry, tier) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Nike Marketing', 'Nike Inc.', 'marketing@nike.com', 'Sports & Fitness', 'platinum'),
  ('c2222222-2222-2222-2222-222222222222', 'Tesla Motors', 'Tesla Inc.', 'campaigns@tesla.com', 'Automotive', 'gold'),
  ('c3333333-3333-3333-3333-333333333333', 'Apple', 'Apple Inc.', 'marketing@apple.com', 'Technology', 'platinum');

-- Note: Sample campaigns and other data will be added after user authentication is set up
-- The actual seed data will be created through the application interface

COMMENT ON EXTENSION plpgsql IS 'Seed data loaded for development environment';
