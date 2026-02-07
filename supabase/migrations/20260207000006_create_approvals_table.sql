-- Migration: 00006_create_approvals_table
-- Description: Create approvals table for multi-stage approval workflows
-- Created: 2026-02-07

CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  
  -- Approval Type
  approval_type TEXT NOT NULL CHECK (approval_type IN (
    'brief',
    'strategy',
    'shortlist',
    'content',
    'budget_revision'
  )),
  
  -- Related entity (depends on type)
  related_entity_id UUID, -- Could reference briefs, content_artifacts, etc.
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'approved',
    'rejected',
    'overridden'
  )),
  
  -- Approver
  approver_id UUID NOT NULL REFERENCES public.users(id),
  approver_role TEXT NOT NULL,
  
  -- Request
  requested_by UUID NOT NULL REFERENCES public.users(id),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Decision
  comments TEXT,
  decided_at TIMESTAMPTZ,
  
  -- Override tracking (when a Director overrides)
  override_reason TEXT,
  overridden_by UUID REFERENCES public.users(id),
  overridden_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_approvals_campaign ON public.approvals(campaign_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_approvals_type ON public.approvals(approval_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_approvals_status ON public.approvals(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_approvals_approver ON public.approvals(approver_id) WHERE decided_at IS NULL AND deleted_at IS NULL;
CREATE INDEX idx_approvals_requested_by ON public.approvals(requested_by) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view approvals for their campaigns"
  ON public.approvals FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM public.campaigns
      WHERE campaign_manager_id = auth.uid()
        OR id IN (
          SELECT campaign_id FROM public.campaign_members
          WHERE user_id = auth.uid()
        )
    )
    OR approver_id = auth.uid()
    OR requested_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'director')
    )
  );

CREATE POLICY "Campaign managers can create approval requests"
  ON public.approvals FOR INSERT
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

CREATE POLICY "Approvers can update their approval decisions"
  ON public.approvals FOR UPDATE
  USING (
    approver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'director')
    )
  );

-- Triggers
CREATE TRIGGER set_approvals_updated_at
  BEFORE UPDATE ON public.approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Comments
COMMENT ON TABLE public.approvals IS 'Multi-stage approval workflows for campaigns';
COMMENT ON COLUMN public.approvals.approval_type IS 'Type of approval: brief, strategy, shortlist, content, or budget_revision';
COMMENT ON COLUMN public.approvals.status IS 'Approval status: pending, approved, rejected, or overridden';
COMMENT ON COLUMN public.approvals.override_reason IS 'Reason provided when a Director overrides an approval';
