-- ============================================================================
-- PrecisionFlow Full Migration (Combined)
-- Generated from 14 individual migration files
-- ============================================================================


-- ============================================================================
-- Migration 1: 20260207000001_initial_schema_setup.sql
-- ============================================================================

-- Migration: 00001_initial_schema_setup
-- Description: Create base functions and triggers for PrecisionFlow
-- Created: 2026-02-07

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log audit trail
CREATE OR REPLACE FUNCTION public.log_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  changed_fields JSONB;
BEGIN
  -- Convert OLD and NEW to JSONB
  IF TG_OP = 'DELETE' THEN
    old_data = to_jsonb(OLD);
    new_data = NULL;
  ELSIF TG_OP = 'INSERT' THEN
    old_data = NULL;
    new_data = to_jsonb(NEW);
  ELSE
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
  END IF;

  -- Calculate changed fields for UPDATE operations
  IF TG_OP = 'UPDATE' THEN
    SELECT jsonb_object_agg(key, value)
    INTO changed_fields
    FROM jsonb_each(new_data)
    WHERE value IS DISTINCT FROM old_data->key;
  END IF;

  -- Insert audit log
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    operation,
    old_data,
    new_data,
    changed_fields,
    user_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    old_data,
    new_data,
    changed_fields,
    auth.uid()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.set_updated_at() IS 'Automatically updates the updated_at timestamp';
COMMENT ON FUNCTION public.log_audit_trail() IS 'Logs all database mutations to audit_logs table';


-- ============================================================================
-- Migration 2: 20260207000002_create_users_table.sql
-- ============================================================================

-- Migration: 00002_create_users_table
-- Description: Create users table extending Supabase auth.users
-- Created: 2026-02-07

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,

  -- Role and permissions
  role TEXT NOT NULL CHECK (role IN ('campaign_manager', 'director', 'finance', 'admin', 'client', 'influencer')),
  permissions JSONB DEFAULT '[]'::jsonb,

  -- Organization
  organization_id UUID,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),

  -- Preferences
  preferences JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_users_role ON public.users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_organization ON public.users(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON public.users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON public.users(status) WHERE deleted_at IS NULL;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert new users"
  ON public.users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger function to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.prevent_user_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If the row is being updated by its owner and the owner is not an admin,
  -- prevent changes to privileged fields
  IF auth.uid() = OLD.id AND OLD.role <> 'admin' THEN
    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.permissions IS DISTINCT FROM OLD.permissions
       OR NEW.organization_id IS DISTINCT FROM OLD.organization_id
       OR NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'You are not allowed to change privileged user fields (role, permissions, organization, status).';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to enforce privileged field protection
CREATE TRIGGER prevent_user_privilege_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_user_privilege_escalation();

-- Trigger for updated_at
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Comments
COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth.users with role-based access control';
COMMENT ON COLUMN public.users.role IS 'User role: campaign_manager, director, finance, admin, client, or influencer';
COMMENT ON COLUMN public.users.permissions IS 'Additional granular permissions as JSON array';
COMMENT ON COLUMN public.users.organization_id IS 'Organization the user belongs to (for multi-tenancy)';


-- ============================================================================
-- Migration 3: 20260207000003_create_clients_table.sql
-- ============================================================================

-- Migration: 00003_create_clients_table
-- Description: Create clients table for managing client information
-- Created: 2026-02-07

CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  company_name TEXT,
  industry TEXT,
  website TEXT,

  -- Contact
  email TEXT NOT NULL,
  phone TEXT,
  address JSONB, -- {street, city, country, postal_code}

  -- Business
  account_manager_id UUID REFERENCES public.users(id),
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_clients_account_manager ON public.clients(account_manager_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_name ON public.clients USING gin(to_tsvector('english', name));
CREATE INDEX idx_clients_company ON public.clients USING gin(to_tsvector('english', company_name));
CREATE INDEX idx_clients_tags ON public.clients USING gin(tags);
CREATE INDEX idx_clients_tier ON public.clients(tier) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Campaign managers can view their clients"
  ON public.clients FOR SELECT
  USING (
    account_manager_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'director', 'finance')
    )
  );

CREATE POLICY "Campaign managers can create clients"
  ON public.clients FOR INSERT
  WITH CHECK (
    account_manager_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'director')
    )
  );

CREATE POLICY "Campaign managers can update their clients"
  ON public.clients FOR UPDATE
  USING (
    account_manager_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'director')
    )
  );

-- Triggers
CREATE TRIGGER set_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Comments
COMMENT ON TABLE public.clients IS 'Client companies and contact information';
COMMENT ON COLUMN public.clients.tier IS 'Client tier: bronze, silver, gold, or platinum';
COMMENT ON COLUMN public.clients.tags IS 'Tags for categorizing clients';


-- ============================================================================
-- Migration 4: 20260207000004_create_campaigns_table.sql
-- ============================================================================

-- Migration: 00004_create_campaigns_table
-- Description: Create campaigns table (root entity for PrecisionFlow)
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


-- ============================================================================
-- Migration 5: 20260207000005_create_briefs_table.sql
-- ============================================================================

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


-- ============================================================================
-- Migration 6: 20260207000006_create_approvals_table.sql
-- ============================================================================

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


-- ============================================================================
-- Migration 7: 20260207000007_create_audit_logs_table.sql
-- ============================================================================

-- Migration: 00007_create_audit_logs_table
-- Description: Create audit_logs table for immutable audit trail
-- Created: 2026-02-07

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What table and record
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,

  -- What operation
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),

  -- What changed
  old_data JSONB,
  new_data JSONB,
  changed_fields JSONB, -- Only fields that changed (for UPDATE)

  -- Who made the change
  user_id UUID REFERENCES auth.users(id),

  -- When
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partition by date for performance (monthly partitions)
-- This improves query performance for large audit log tables
-- Note: Partitioning requires manual partition creation or automated scripts

-- Indexes
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_operation ON public.audit_logs(operation);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Audit logs are read-only for authorized users
CREATE POLICY "Admins and directors can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'director', 'finance')
    )
  );

-- Prevent any updates or deletes to audit logs (immutable)
CREATE POLICY "Audit logs cannot be updated"
  ON public.audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "Audit logs cannot be deleted"
  ON public.audit_logs FOR DELETE
  USING (false);

-- Function to prevent direct inserts (only via triggers)
CREATE OR REPLACE FUNCTION public.prevent_direct_audit_log_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow inserts from the log_audit_trail function
  IF current_setting('application_name', true) NOT LIKE 'audit_trail%' THEN
    RAISE EXCEPTION 'Direct inserts into audit_logs are not allowed. Use triggers.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: We'll add audit triggers to each table in the next migration

-- Comments
COMMENT ON TABLE public.audit_logs IS 'Immutable audit trail of all database changes';
COMMENT ON COLUMN public.audit_logs.operation IS 'Database operation: INSERT, UPDATE, or DELETE';
COMMENT ON COLUMN public.audit_logs.changed_fields IS 'Fields that changed in UPDATE operations';


-- ============================================================================
-- Migration 8: 20260207000008_enable_audit_triggers.sql
-- ============================================================================

-- Migration: 00008_enable_audit_triggers
-- Description: Enable audit trail triggers on all tables
-- Created: 2026-02-07

-- Add audit trail triggers to all main tables

CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_clients
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_campaigns
  AFTER INSERT OR UPDATE OR DELETE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_briefs
  AFTER INSERT OR UPDATE OR DELETE ON public.briefs
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_approvals
  AFTER INSERT OR UPDATE OR DELETE ON public.approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_trail();

-- Note: Add more audit triggers as new tables are created

COMMENT ON TRIGGER audit_users ON public.users IS 'Logs all changes to users table';
COMMENT ON TRIGGER audit_clients ON public.clients IS 'Logs all changes to clients table';
COMMENT ON TRIGGER audit_campaigns ON public.campaigns IS 'Logs all changes to campaigns table';
COMMENT ON TRIGGER audit_briefs ON public.briefs IS 'Logs all changes to briefs table';
COMMENT ON TRIGGER audit_approvals ON public.approvals IS 'Logs all changes to approvals table';


-- ============================================================================
-- Migration 9: 20260207000009_create_campaign_members_table.sql
-- ============================================================================

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


-- ============================================================================
-- Migration 10: 20260207000010_create_creators_table.sql
-- ============================================================================

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
                AND (users.campaign_manager = true OR users.director = true OR users.admin = true)
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
            AND (users.campaign_manager = true OR users.director = true OR users.admin = true)
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
            AND (users.campaign_manager = true OR users.director = true OR users.admin = true)
        )
    );

-- Policy: Only admins can delete (soft delete) creators
CREATE POLICY creators_delete_policy ON public.creators
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.admin = true
        )
    );

-- Add comments
COMMENT ON TABLE public.creators IS 'Influencer/creator profiles with performance tracking and social media statistics';
COMMENT ON COLUMN public.creators.rate_card IS 'JSONB structure for flexible pricing: { "instagram_post": 500, "tiktok_video": 750, etc. }';
COMMENT ON COLUMN public.creators.niche IS 'Array of niches the creator operates in';
COMMENT ON COLUMN public.creators.avg_engagement_rate IS 'Average engagement rate as percentage (likes+comments)/followers * 100';


-- ============================================================================
-- Migration 11: 20260207000011_create_campaign_shortlists_table.sql
-- ============================================================================

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
                AND (users.director = true OR users.admin = true)
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
                    AND (users.director = true OR users.admin = true)
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
                    AND (users.director = true OR users.admin = true)
                )
            )
        )
    );

-- Add comments
COMMENT ON TABLE public.campaign_shortlists IS 'Creator shortlists for campaigns with client approval workflow';
COMMENT ON COLUMN public.campaign_shortlists.position IS 'Order in shortlist for presentation to client';
COMMENT ON COLUMN public.campaign_shortlists.proposed_rate IS 'Proposed payment amount for this creator';
COMMENT ON COLUMN public.campaign_shortlists.internal_notes IS 'Internal notes not visible to client';


-- ============================================================================
-- Migration 12: 20260207000012_create_content_tasks_table.sql
-- ============================================================================

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


-- ============================================================================
-- Migration 13: 20260207000013_create_content_artifacts_table.sql
-- ============================================================================

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


-- ============================================================================
-- Migration 14: 20260211000000_init_tikit_os.sql
-- ============================================================================

-- Migration: Create TiKiT OS Core Tables (Version B)

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Profiles Table (Public User Info)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('brand', 'influencer', 'admin')) DEFAULT 'brand',
  bio TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Campaigns Table
CREATE TABLE public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget NUMERIC(10, 2), -- Up to 99,999,999.99
  status TEXT CHECK (status IN ('draft', 'active', 'completed', 'archived')) DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  requirements JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Deliverables Table (Posts/Stories)
CREATE TABLE public.deliverables (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  influencer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'ugc')),
  type TEXT CHECK (type IN ('post', 'story', 'reel', 'video')),
  status TEXT CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'published')) DEFAULT 'pending',
  content_url TEXT,
  submission_date TIMESTAMP WITH TIME ZONE,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Proposals Table (Applications)
CREATE TABLE public.proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  influencer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  pitch TEXT,
  proposed_rate NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- 7. Basic RLS Policies (Security)
-- Profiles: Public can read, user can update own
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Campaigns: Brands can create/update own. Everyone can view active campaigns.
CREATE POLICY "Brands can view own campaigns." ON public.campaigns FOR SELECT USING (auth.uid() = brand_id);
CREATE POLICY "Brands can insert campaigns." ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = brand_id);
CREATE POLICY "Brands can update own campaigns." ON public.campaigns FOR UPDATE USING (auth.uid() = brand_id);
