-- Migration: Create content artifacts table
-- Description: Content uploads with version control and approval workflow
-- Date: 2026-02-07

-- Create content_artifacts table
CREATE TABLE IF NOT EXISTS public.content_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    content_task_id UUID NOT NULL REFERENCES public.content_tasks(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES auth.users(id),
    
    -- Artifact Details
    artifact_type TEXT NOT NULL CHECK (artifact_type IN (
        'script',      -- Written script
        'draft',       -- Draft content (video, image, etc.)
        'final',       -- Final content
        'thumbnail',   -- Thumbnail image
        'caption',     -- Caption/description
        'other'        -- Other supporting materials
    )),
    
    -- File Information
    file_url TEXT, -- Supabase Storage URL
    file_name TEXT,
    file_size INTEGER, -- Bytes
    file_type TEXT, -- MIME type
    
    -- Text Content (for scripts, captions)
    text_content TEXT,
    
    -- Metadata
    version INTEGER DEFAULT 1,
    is_latest BOOLEAN DEFAULT true,
    
    -- Media Details (for video/image content)
    duration_seconds INTEGER,
    width INTEGER,
    height INTEGER,
    format TEXT,
    
    -- Approval Status
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending',           -- Awaiting review
        'approved',          -- Approved
        'changes_requested', -- Revisions needed
        'rejected'           -- Rejected
    )),
    
    -- Approval Details
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    review_comments TEXT,
    
    -- Revision Tracking
    previous_version_id UUID REFERENCES public.content_artifacts(id),
    revision_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX idx_content_artifacts_task ON public.content_artifacts(content_task_id);
CREATE INDEX idx_content_artifacts_type ON public.content_artifacts(artifact_type);
CREATE INDEX idx_content_artifacts_status ON public.content_artifacts(status);
CREATE INDEX idx_content_artifacts_latest ON public.content_artifacts(content_task_id, is_latest) WHERE is_latest = true;
CREATE INDEX idx_content_artifacts_version ON public.content_artifacts(content_task_id, version);

-- Add updated_at trigger
CREATE TRIGGER set_content_artifacts_updated_at
    BEFORE UPDATE ON public.content_artifacts
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Add audit trail trigger
CREATE TRIGGER content_artifacts_audit_trail
    AFTER INSERT OR UPDATE OR DELETE ON public.content_artifacts
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

-- Trigger to update is_latest when new version uploaded
CREATE OR REPLACE FUNCTION update_artifact_latest()
RETURNS TRIGGER AS $$
BEGIN
    -- Set all previous versions to not latest
    UPDATE public.content_artifacts
    SET is_latest = false
    WHERE content_task_id = NEW.content_task_id
      AND artifact_type = NEW.artifact_type
      AND id != NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_artifacts_update_latest
    AFTER INSERT ON public.content_artifacts
    FOR EACH ROW
    EXECUTE FUNCTION update_artifact_latest();

-- Row Level Security
ALTER TABLE public.content_artifacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view artifacts for tasks they have access to
CREATE POLICY content_artifacts_select_policy ON public.content_artifacts
    FOR SELECT
    USING (
        deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM public.content_tasks ct
            JOIN public.campaigns c ON c.id = ct.campaign_id
            WHERE ct.id = content_artifacts.content_task_id
            AND (
                -- Campaign team
                c.campaign_manager_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.campaign_members cm
                    WHERE cm.campaign_id = c.id
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
                -- The assigned creator
                ct.creator_id IN (
                    SELECT cr.id FROM public.creators cr
                    WHERE cr.email = (SELECT email FROM auth.users WHERE id = auth.uid())
                )
            )
        )
    );

-- Policy: Creators and campaign team can upload artifacts
CREATE POLICY content_artifacts_insert_policy ON public.content_artifacts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.content_tasks ct
            JOIN public.campaigns c ON c.id = ct.campaign_id
            WHERE ct.id = content_task_id
            AND (
                -- Campaign manager
                c.campaign_manager_id = auth.uid()
                OR
                -- Directors and admins
                EXISTS (
                    SELECT 1 FROM public.users
                    WHERE users.id = auth.uid()
                    AND (users.director = true OR users.admin = true)
                )
                OR
                -- The assigned creator
                ct.creator_id IN (
                    SELECT cr.id FROM public.creators cr
                    WHERE cr.email = (SELECT email FROM auth.users WHERE id = auth.uid())
                )
            )
        )
    );

-- Policy: Campaign team can update artifacts (for approval)
CREATE POLICY content_artifacts_update_policy ON public.content_artifacts
    FOR UPDATE
    USING (
        deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM public.content_tasks ct
            JOIN public.campaigns c ON c.id = ct.campaign_id
            WHERE ct.id = content_task_id
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

-- Add comments
COMMENT ON TABLE public.content_artifacts IS 'Content uploads with version control and approval workflow';
COMMENT ON COLUMN public.content_artifacts.is_latest IS 'Automatically set to true for newest version of same artifact type';
COMMENT ON COLUMN public.content_artifacts.artifact_type IS 'Type of content: script, draft, final, thumbnail, caption, etc.';
COMMENT ON COLUMN public.content_artifacts.previous_version_id IS 'Links to previous version for revision tracking';
