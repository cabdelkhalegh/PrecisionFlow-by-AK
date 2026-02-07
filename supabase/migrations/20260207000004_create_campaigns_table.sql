-- Migration: 00004_create_campaigns_table
-- Description: Create campaigns table (root entity for TiKiT OS)
-- Created: 2026-02-07

CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  
  -- Ownership
  campaign_manager_id UUID NOT NULL REFERENCES public.users(id),
  
  -- Status and Lifecycle
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'brief_uploaded',
    'brief_structured',
    'brief_approved',
    'shortlist_building',
    'shortlist_approved',
    'in_production',
    'published',
    'closed',
    'cancelled'
  )),
  
  -- Risk Assessment
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  missing_info JSONB DEFAULT '[]'::jsonb, -- [{field, severity, description}]
  
  -- Policy Flags
  client_content_approval_required BOOLEAN DEFAULT true,
  publishing_grace_window_hours INTEGER DEFAULT 24,
  payments_required_for_lock BOOLEAN DEFAULT true,
  allow_execution_with_high_risk BOOLEAN DEFAULT false,
  
  -- Dates
  start_date DATE,
  end_date DATE,
  
  -- Financial Summary (derived)
  budget_total DECIMAL(12,2),
  actual_spent DECIMAL(12,2) DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_campaigns_client ON public.campaigns(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_manager ON public.campaigns(campaign_manager_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_status ON public.campaigns(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_risk ON public.campaigns(risk_level) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_dates ON public.campaigns(start_date, end_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_name ON public.campaigns USING gin(to_tsvector('english', name));
CREATE INDEX idx_campaigns_tags ON public.campaigns USING gin(tags);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Campaign managers can view their campaigns"
  ON public.campaigns FOR SELECT
  USING (
    campaign_manager_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'director', 'finance')
    )
    OR id IN (
      SELECT campaign_id FROM public.campaign_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Campaign managers can create campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (
    campaign_manager_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'director')
    )
  );

CREATE POLICY "Campaign managers can update their campaigns"
  ON public.campaigns FOR UPDATE
  USING (
    (campaign_manager_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'director')
    ))
    AND locked_at IS NULL  -- Cannot update locked campaigns
  );

-- Triggers
CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Comments
COMMENT ON TABLE public.campaigns IS 'Campaigns - root entity for all campaign operations';
COMMENT ON COLUMN public.campaigns.status IS 'Campaign lifecycle status';
COMMENT ON COLUMN public.campaigns.risk_level IS 'Calculated risk level based on missing information';
COMMENT ON COLUMN public.campaigns.missing_info IS 'Array of missing information items with severity';
COMMENT ON COLUMN public.campaigns.locked_at IS 'When the campaign was locked (closed and finalized)';
