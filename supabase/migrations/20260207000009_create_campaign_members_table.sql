-- Migration: 00009_create_campaign_members_table
-- Description: Create campaign_members table for team collaboration
-- Created: 2026-02-07

CREATE TABLE public.campaign_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Role in this campaign
  campaign_role TEXT NOT NULL CHECK (campaign_role IN (
    'manager',
    'contributor',
    'reviewer',
    'viewer'
  )),
  
  -- Permissions
  can_edit BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  
  -- Timestamps
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by UUID REFERENCES public.users(id),
  removed_at TIMESTAMPTZ,
  
  -- Unique constraint: one user per campaign
  UNIQUE(campaign_id, user_id)
);

-- Indexes
CREATE INDEX idx_campaign_members_campaign ON public.campaign_members(campaign_id) WHERE removed_at IS NULL;
CREATE INDEX idx_campaign_members_user ON public.campaign_members(user_id) WHERE removed_at IS NULL;

-- Enable RLS
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view members of their campaigns"
  ON public.campaign_members FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM public.campaigns
      WHERE campaign_manager_id = auth.uid()
    )
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'director')
    )
  );

CREATE POLICY "Campaign managers can add members"
  ON public.campaign_members FOR INSERT
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

CREATE POLICY "Campaign managers can remove members"
  ON public.campaign_members FOR UPDATE
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

-- Audit trigger
CREATE TRIGGER audit_campaign_members
  AFTER INSERT OR UPDATE OR DELETE ON public.campaign_members
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_trail();

-- Comments
COMMENT ON TABLE public.campaign_members IS 'Campaign team members and their roles';
COMMENT ON COLUMN public.campaign_members.campaign_role IS 'Role in campaign: manager, contributor, reviewer, or viewer';
