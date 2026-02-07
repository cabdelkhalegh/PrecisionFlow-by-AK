-- Migration: Create content tasks table
-- Description: Content tasks assigned to creators with deadline tracking
-- Date: 2026-02-07

-- Create content_tasks table
CREATE TABLE IF NOT EXISTS public.content_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id),
    
    -- Task Details
    title TEXT NOT NULL,
    description TEXT,
    deliverable_type TEXT NOT NULL CHECK (deliverable_type IN (
        'instagram_post', 'instagram_story', 'instagram_reel',
        'tiktok_video', 'youtube_video', 'youtube_short',
        'twitter_post', 'facebook_post', 'blog_post', 'other'
    )),
    
    -- Requirements
    requirements JSONB, -- Flexible structure for specific requirements
    quantity INTEGER DEFAULT 1, -- Number of deliverables
    duration_seconds INTEGER, -- For video content
    
    -- Timeline
    deadline TIMESTAMPTZ NOT NULL,
    script_deadline TIMESTAMPTZ,
    draft_deadline TIMESTAMPTZ,
    final_deadline TIMESTAMPTZ,
    
    -- Status Tracking
    status TEXT DEFAULT 'assigned' CHECK (status IN (
        'assigned',          -- Task assigned to creator
        'script_submitted',  -- Script submitted for approval
        'script_approved',   -- Script approved, can proceed to filming
        'draft_submitted',   -- Draft content submitted
        'draft_approved',    -- Draft approved
        'changes_requested', -- Revisions requested
        'final_submitted',   -- Final content submitted
        'approved',          -- Final approval
        'published',         -- Content published
        'cancelled'          -- Task cancelled
    )),
    
    -- Approval Gates
    script_approved_at TIMESTAMPTZ,
    script_approved_by UUID REFERENCES auth.users(id),
    draft_approved_at TIMESTAMPTZ,
    draft_approved_by UUID REFERENCES auth.users(id),
    final_approved_at TIMESTAMPTZ,
    final_approved_by UUID REFERENCES auth.users(id),
    
    -- Feedback
    feedback TEXT,
    revision_notes TEXT[],
    
    -- Publishing
    published_at TIMESTAMPTZ,
    published_url TEXT,
    
    -- Performance (after publishing)
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2),
    
    -- Payment
    payment_amount DECIMAL(10,2),
    payment_status TEXT CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed')),
    paid_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX idx_content_tasks_campaign ON public.content_tasks(campaign_id);
CREATE INDEX idx_content_tasks_creator ON public.content_tasks(creator_id);
CREATE INDEX idx_content_tasks_status ON public.content_tasks(status);
CREATE INDEX idx_content_tasks_deadline ON public.content_tasks(deadline);
CREATE INDEX idx_content_tasks_deliverable_type ON public.content_tasks(deliverable_type);

-- Add updated_at trigger
CREATE TRIGGER set_content_tasks_updated_at
    BEFORE UPDATE ON public.content_tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Add audit trail trigger
CREATE TRIGGER content_tasks_audit_trail
    AFTER INSERT OR UPDATE OR DELETE ON public.content_tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

-- Row Level Security
ALTER TABLE public.content_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view tasks for campaigns they have access to
CREATE POLICY content_tasks_select_policy ON public.content_tasks
    FOR SELECT
    USING (
        deleted_at IS NULL
        AND (
            -- Campaign team members
            EXISTS (
                SELECT 1 FROM public.campaign_members cm
                WHERE cm.campaign_id = content_tasks.campaign_id
                AND cm.user_id = auth.uid()
            )
            OR
            -- Directors and admins
            EXISTS (
                SELECT 1 FROM public.users
                WHERE users.id = auth.uid()
                AND (users.director = true OR users.admin = true)
            )
            OR
            -- Campaign manager
            EXISTS (
                SELECT 1 FROM public.campaigns c
                WHERE c.id = content_tasks.campaign_id
                AND c.campaign_manager_id = auth.uid()
            )
            OR
            -- The assigned creator (when we add influencer role)
            creator_id IN (
                SELECT c.id FROM public.creators c
                WHERE c.email = (SELECT email FROM auth.users WHERE id = auth.uid())
            )
        )
    );

-- Policy: Campaign managers and directors can create tasks
CREATE POLICY content_tasks_insert_policy ON public.content_tasks
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_id
            AND (
                c.campaign_manager_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.users
                    WHERE users.id = auth.uid()
                    AND (users.director = true OR users.admin = true)
                )
            )
        )
    );

-- Policy: Campaign team can update tasks
CREATE POLICY content_tasks_update_policy ON public.content_tasks
    FOR UPDATE
    USING (
        deleted_at IS NULL
        AND (
            EXISTS (
                SELECT 1 FROM public.campaigns c
                WHERE c.id = campaign_id
                AND (
                    c.campaign_manager_id = auth.uid()
                    OR EXISTS (
                        SELECT 1 FROM public.users
                        WHERE users.id = auth.uid()
                        AND (users.director = true OR users.admin = true)
                    )
                )
            )
            OR
            -- Creators can update their own tasks (status, etc.)
            creator_id IN (
                SELECT c.id FROM public.creators c
                WHERE c.email = (SELECT email FROM auth.users WHERE id = auth.uid())
            )
        )
    );

-- Add comments
COMMENT ON TABLE public.content_tasks IS 'Content tasks assigned to creators with deadline tracking and approval gates';
COMMENT ON COLUMN public.content_tasks.requirements IS 'JSONB for flexible requirements like hashtags, mentions, angles, etc.';
COMMENT ON COLUMN public.content_tasks.status IS 'Task status with approval gates at script, draft, and final stages';
COMMENT ON COLUMN public.content_tasks.script_approved_at IS 'Script must be approved before creator can proceed to filming';
