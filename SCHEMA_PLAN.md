# TiKiT OS - Database Schema Plan (Version B)

Goal: Replicate core functionality of Lovable version in Supabase (PostgreSQL).

## 1. Core Users (users)
- `id` (UUID, PK) - Links to auth.users
- `email` (Text)
- `full_name` (Text)
- `role` (Enum: 'brand', 'influencer', 'admin')
- `avatar_url` (Text)
- `created_at` (Timestamp)

## 2. Profiles (profiles)
- `id` (UUID, PK, FK -> users.id)
- `bio` (Text)
- `instagram_handle` (Text)
- `tiktok_handle` (Text)
- `niche` (Array of Text: ['Beauty', 'Tech', 'Fitness'])
- `rates` (JSONB: { "post": 500, "story": 200 })
- `location` (Text)

## 3. Campaigns (campaigns)
- `id` (UUID, PK)
- `brand_id` (UUID, FK -> users.id)
- `title` (Text)
- `description` (Text)
- `budget` (Numeric)
- `status` (Enum: 'draft', 'active', 'completed', 'archived')
- `start_date` (Date)
- `end_date` (Date)
- `requirements` (JSONB: { "posts": 1, "stories": 3 })

## 4. Deliverables (deliverables)
- `id` (UUID, PK)
- `campaign_id` (UUID, FK -> campaigns.id)
- `influencer_id` (UUID, FK -> users.id)
- `platform` (Enum: 'instagram', 'tiktok', 'youtube')
- `type` (Enum: 'post', 'story', 'reel', 'video')
- `status` (Enum: 'pending', 'submitted', 'approved', 'rejected', 'published')
- `content_url` (Text)
- `submission_date` (Timestamp)
- `feedback` (Text)

## 5. Applications/Proposals (proposals)
- `id` (UUID, PK)
- `campaign_id` (UUID, FK -> campaigns.id)
- `influencer_id` (UUID, FK -> users.id)
- `status` (Enum: 'pending', 'accepted', 'declined')
- `pitch` (Text)
- `proposed_rate` (Numeric)

## 6. Analytics (analytics) - *Future Phase*
- `id` (UUID, PK)
- `campaign_id` (UUID, FK)
- `views` (Int)
- `likes` (Int)
- `comments` (Int)
- `shares` (Int)
- `roi` (Numeric)

---
*Note: This schema is designed for scalability and Supabase Row Level Security (RLS).*
