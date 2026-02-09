-- Migration: Create campaign shortlists table
-- Description: Creator shortlists for campaigns with approval workflow
-- Date: 2026-02-07

-- Create campaign_shortlists table
CREATE TABLE IF NOT EXISTS public.campaign_shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
    
    -- Shortlist Details
    position INTEGER, -- Order in shortlist (1, 2, 3...)
    proposed_rate DECIMAL(10,2), -- Proposed payment for this creator
    proposed_deliverables TEXT[], -- What they'll deliver
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'removed')),
    
    -- Client Feedback
    client_feedback TEXT,
    rejection_reason TEXT,
    
    -- Approval
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id),
    submitted_at TIMESTAMPTZ,
    submitted_by UUID REFERENCES auth.users(id),
    
    -- Notes
    internal_notes TEXT, -- CM/DIR notes not visible to client
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ,
    
    -- Unique constraint: one creator can only appear once per campaign
    UNIQUE(campaign_id, creator_id)
);

-- Add indexes
CREATE INDEX idx_campaign_shortlists_campaign ON public.campaign_shortlists(campaign_id);
CREATE INDEX idx_campaign_shortlists_creator ON public.campaign_shortlists(creator_id);
CREATE INDEX idx_campaign_shortlists_status ON public.campaign_shortlists(status);
CREATE INDEX idx_campaign_shortlists_position ON public.campaign_shortlists(campaign_id, position);

-- Add updated_at trigger
CREATE TRIGGER set_campaign_shortlists_updated_at
    BEFORE UPDATE ON public.campaign_shortlists
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Add audit trail trigger
CREATE TRIGGER campaign_shortlists_audit_trail
    AFTER INSERT OR UPDATE OR DELETE ON public.campaign_shortlists
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

-- Row Level Security
ALTER TABLE public.campaign_shortlists ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view shortlists for campaigns they have access to
CREATE POLICY campaign_shortlists_select_policy ON public.campaign_shortlists
    FOR SELECT
    USING (
        deleted_at IS NULL
        AND (
            -- Campaign team members
            EXISTS (
                SELECT 1 FROM public.campaign_members cm
                WHERE cm.campaign_id = campaign_shortlists.campaign_id
                AND cm.user_id = auth.uid()
            )
            OR
            -- Directors and admins
            EXISTS (
                SELECT 1 FROM public.users
                WHERE users.id = auth.uid()
                AND users.role IN ('director', 'admin')
            )
            OR
            -- Campaign manager for this campaign
            EXISTS (
                SELECT 1 FROM public.campaigns c
                WHERE c.id = campaign_shortlists.campaign_id
                AND c.campaign_manager_id = auth.uid()
            )
        )
    );

-- Policy: Campaign managers and directors can add to shortlists
CREATE POLICY campaign_shortlists_insert_policy ON public.campaign_shortlists
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
                    AND users.role IN ('director', 'admin')
                )
            )
        )
    );

-- Policy: Campaign managers and directors can update shortlists
CREATE POLICY campaign_shortlists_update_policy ON public.campaign_shortlists
    FOR UPDATE
    USING (
        deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_id
            AND (
                c.campaign_manager_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.users
                    WHERE users.id = auth.uid()
                    AND users.role IN ('director', 'admin')
                )
            )
        )
    );

-- Add comments
COMMENT ON TABLE public.campaign_shortlists IS 'Creator shortlists for campaigns with client approval workflow';
COMMENT ON COLUMN public.campaign_shortlists.position IS 'Order in shortlist for presentation to client';
COMMENT ON COLUMN public.campaign_shortlists.proposed_rate IS 'Proposed payment amount for this creator';
COMMENT ON COLUMN public.campaign_shortlists.internal_notes IS 'Internal notes not visible to client';
