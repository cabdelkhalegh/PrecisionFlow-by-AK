-- Migration: 00005_create_briefs_table
-- Description: Create briefs table for campaign briefs (raw and structured)
-- Created: 2026-02-07

CREATE TABLE public.briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  
  -- Brief Content
  raw_content TEXT,
  raw_file_url TEXT,
  structured_data JSONB, -- AI-parsed structured data
  
  -- Version tracking
  version INTEGER NOT NULL DEFAULT 1,
  is_latest BOOLEAN DEFAULT true,
  
  -- Approval
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  approval_comments TEXT,
  
  -- Uploaded by
  uploaded_by UUID NOT NULL REFERENCES public.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Ensure only one latest version per campaign
  UNIQUE(campaign_id, is_latest) WHERE is_latest = true
);

-- Indexes
CREATE INDEX idx_briefs_campaign ON public.briefs(campaign_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_briefs_version ON public.briefs(campaign_id, version) WHERE deleted_at IS NULL;
CREATE INDEX idx_briefs_approved ON public.briefs(is_approved) WHERE deleted_at IS NULL;
CREATE INDEX idx_briefs_uploaded_by ON public.briefs(uploaded_by) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view briefs for their campaigns"
  ON public.briefs FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM public.campaigns
      WHERE campaign_manager_id = auth.uid()
        OR id IN (
          SELECT campaign_id FROM public.campaign_members
          WHERE user_id = auth.uid()
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'director')
    )
  );

CREATE POLICY "Campaign managers can create briefs"
  ON public.briefs FOR INSERT
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM public.campaigns
      WHERE campaign_manager_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'director')
    )
  );

CREATE POLICY "Campaign managers can update briefs"
  ON public.briefs FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM public.campaigns
      WHERE campaign_manager_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'director')
    )
  );

-- Triggers
CREATE TRIGGER set_briefs_updated_at
  BEFORE UPDATE ON public.briefs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Comments
COMMENT ON TABLE public.briefs IS 'Campaign briefs with raw and AI-structured data';
COMMENT ON COLUMN public.briefs.raw_content IS 'Original brief text content';
COMMENT ON COLUMN public.briefs.raw_file_url IS 'URL to uploaded brief file in storage';
COMMENT ON COLUMN public.briefs.structured_data IS 'AI-parsed structured brief data (objectives, audience, deliverables, etc.)';
COMMENT ON COLUMN public.briefs.version IS 'Brief version number (increments on updates)';
