-- Migration: Create creators table
-- Description: Influencer/creator profiles with performance tracking
-- Date: 2026-02-07

-- Create creators table
CREATE TABLE IF NOT EXISTS public.creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    bio TEXT,
    profile_image_url TEXT,
    
    -- Social Media Handles
    instagram_handle TEXT,
    tiktok_handle TEXT,
    youtube_handle TEXT,
    twitter_handle TEXT,
    facebook_handle TEXT,
    
    -- Platform Statistics
    instagram_followers INTEGER DEFAULT 0,
    tiktok_followers INTEGER DEFAULT 0,
    youtube_subscribers INTEGER DEFAULT 0,
    twitter_followers INTEGER DEFAULT 0,
    
    -- Engagement Metrics
    avg_engagement_rate DECIMAL(5,2), -- Percentage (0.00-100.00)
    avg_views INTEGER DEFAULT 0,
    avg_likes INTEGER DEFAULT 0,
    avg_comments INTEGER DEFAULT 0,
    
    -- Classification
    primary_platform TEXT CHECK (primary_platform IN ('instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'other')),
    niche TEXT[], -- Array of niches (e.g., ['fashion', 'beauty', 'lifestyle'])
    content_types TEXT[], -- Array of content types (e.g., ['video', 'reel', 'story'])
    
    -- Business Information
    rate_card JSONB, -- Flexible pricing structure
    preferred_collaboration_types TEXT[], -- e.g., ['sponsored_post', 'brand_ambassador', 'affiliate']
    
    -- Performance Tracking
    total_campaigns_completed INTEGER DEFAULT 0,
    avg_campaign_performance DECIMAL(5,2), -- Average success rating
    last_campaign_date TIMESTAMPTZ,
    
    -- Location
    country TEXT,
    city TEXT,
    timezone TEXT,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
    verified BOOLEAN DEFAULT false,
    
    -- Additional Info
    notes TEXT,
    tags TEXT[],
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX idx_creators_name ON public.creators(name);
CREATE INDEX idx_creators_email ON public.creators(email);
CREATE INDEX idx_creators_primary_platform ON public.creators(primary_platform);
CREATE INDEX idx_creators_status ON public.creators(status);
CREATE INDEX idx_creators_niche ON public.creators USING GIN(niche);
CREATE INDEX idx_creators_tags ON public.creators USING GIN(tags);
CREATE INDEX idx_creators_deleted_at ON public.creators(deleted_at) WHERE deleted_at IS NULL;

-- Full-text search index
CREATE INDEX idx_creators_search ON public.creators USING GIN(
    to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(bio, '') || ' ' || COALESCE(array_to_string(niche, ' '), ''))
);

-- Add updated_at trigger
CREATE TRIGGER set_creators_updated_at
    BEFORE UPDATE ON public.creators
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Add audit trail trigger
CREATE TRIGGER creators_audit_trail
    AFTER INSERT OR UPDATE OR DELETE ON public.creators
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

-- Row Level Security
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

-- Policy: Campaign managers and directors can view all creators
CREATE POLICY creators_select_policy ON public.creators
    FOR SELECT
    USING (
        deleted_at IS NULL
        AND (
            EXISTS (
                SELECT 1 FROM public.users
                WHERE users.id = auth.uid()
                AND users.role IN ('campaign_manager', 'director', 'admin')
            )
        )
    );

-- Policy: Campaign managers and directors can insert creators
CREATE POLICY creators_insert_policy ON public.creators
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('campaign_manager', 'director', 'admin')
        )
    );

-- Policy: Campaign managers and directors can update creators
CREATE POLICY creators_update_policy ON public.creators
    FOR UPDATE
    USING (
        deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('campaign_manager', 'director', 'admin')
        )
    );

-- Policy: Only admins can delete (soft delete) creators
CREATE POLICY creators_delete_policy ON public.creators
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Add comments
COMMENT ON TABLE public.creators IS 'Influencer/creator profiles with performance tracking and social media statistics';
COMMENT ON COLUMN public.creators.rate_card IS 'JSONB structure for flexible pricing: { "instagram_post": 500, "tiktok_video": 750, etc. }';
COMMENT ON COLUMN public.creators.niche IS 'Array of niches the creator operates in';
COMMENT ON COLUMN public.creators.avg_engagement_rate IS 'Average engagement rate as percentage (likes+comments)/followers * 100';
