-- TiKiT OS - Initial Database Schema Migration
-- Version: 1.0
-- Description: Creates core tables for Campaign-centric OS

-- ============================================================================
-- 1. ENABLE EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. CREATE ENUMS
-- ============================================================================

-- Campaign status enum
CREATE TYPE campaign_status AS ENUM (
  'draft',
  'planning',
  'brief_review',
  'strategy_approval',
  'creator_selection',
  'content_production',
  'content_approval',
  'publishing',
  'monitoring',
  'reporting',
  'closed'
);

-- Campaign risk level enum
CREATE TYPE risk_level AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- User role enum
CREATE TYPE user_role AS ENUM (
  'campaign_manager',
  'director',
  'finance',
  'admin',
  'client',
  'influencer'
);

-- User status enum
CREATE TYPE user_status AS ENUM (
  'active',
  'inactive',
  'suspended'
);

-- Approval status enum
CREATE TYPE approval_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'revisions_requested'
);

-- ============================================================================
-- 3. CREATE CORE TABLES
-- ============================================================================

-- 3.1 Users (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Role and permissions
  role user_role NOT NULL DEFAULT 'campaign_manager',
  permissions JSONB DEFAULT '[]'::jsonb,
  
  -- Organization
  organization_id UUID,
  
  -- Status
  status user_status NOT NULL DEFAULT 'active',
  
  -- Preferences
  preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for users
CREATE INDEX idx_users_role ON public.users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_organization ON public.users(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON public.users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON public.users(status) WHERE deleted_at IS NULL;

-- 3.2 Clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  
  -- Address
  address JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Relationships
  created_by UUID REFERENCES public.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT clients_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Indexes for clients
CREATE INDEX idx_clients_name ON public.clients(name) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_created_by ON public.clients(created_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_created_at ON public.clients(created_at DESC) WHERE deleted_at IS NULL;

-- 3.3 Campaigns (ROOT ENTITY)
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Relationships
  client_id UUID NOT NULL REFERENCES public.clients(id),
  created_by UUID NOT NULL REFERENCES public.users(id),
  
  -- Status and Risk
  status campaign_status NOT NULL DEFAULT 'draft',
  risk_level risk_level NOT NULL DEFAULT 'low',
  
  -- Timeline
  start_date DATE,
  end_date DATE,
  go_live_date DATE,
  
  -- Financial
  budget_amount DECIMAL(12, 2),
  budget_currency TEXT DEFAULT 'USD',
  actual_spend DECIMAL(12, 2) DEFAULT 0,
  
  -- Metadata
  objectives JSONB DEFAULT '[]'::jsonb,
  target_audience JSONB DEFAULT '{}'::jsonb,
  deliverables JSONB DEFAULT '[]'::jsonb,
  kpis JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Risk and Missing Info
  risk_flags JSONB DEFAULT '[]'::jsonb,
  missing_information JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT campaigns_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT campaigns_dates_logical CHECK (
    (start_date IS NULL OR end_date IS NULL) OR (start_date <= end_date)
  ),
  CONSTRAINT campaigns_budget_positive CHECK (
    budget_amount IS NULL OR budget_amount >= 0
  )
);

-- Indexes for campaigns
CREATE INDEX idx_campaigns_client ON public.campaigns(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_created_by ON public.campaigns(created_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_status ON public.campaigns(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_risk_level ON public.campaigns(risk_level) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_dates ON public.campaigns(start_date, end_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_created_at ON public.campaigns(created_at DESC) WHERE deleted_at IS NULL;

-- 3.4 Campaign Members
CREATE TABLE public.campaign_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Role in campaign
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT campaign_members_unique UNIQUE (campaign_id, user_id),
  CONSTRAINT campaign_members_role_not_empty CHECK (LENGTH(TRIM(role)) > 0)
);

-- Indexes for campaign_members
CREATE INDEX idx_campaign_members_campaign ON public.campaign_members(campaign_id);
CREATE INDEX idx_campaign_members_user ON public.campaign_members(user_id);
CREATE INDEX idx_campaign_members_role ON public.campaign_members(role);

-- 3.5 Audit Logs (Immutable)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- What happened
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Who did it
  user_id UUID REFERENCES public.users(id),
  user_email TEXT,
  user_role TEXT,
  
  -- When
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Details
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Context
  campaign_id UUID REFERENCES public.campaigns(id),
  ip_address INET,
  user_agent TEXT,
  
  -- Constraints
  CONSTRAINT audit_logs_action_not_empty CHECK (LENGTH(TRIM(action)) > 0),
  CONSTRAINT audit_logs_entity_type_not_empty CHECK (LENGTH(TRIM(entity_type)) > 0)
);

-- Indexes for audit_logs (optimized for queries)
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_campaign ON public.audit_logs(campaign_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- ============================================================================
-- 4. CREATE FUNCTIONS AND TRIGGERS
-- ============================================================================

-- 4.1 Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.2 Apply updated_at trigger to relevant tables
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4.3 Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
  current_user_role TEXT;
BEGIN
  -- Get current user info from auth context
  current_user_id := auth.uid();
  
  IF current_user_id IS NOT NULL THEN
    SELECT email, role::TEXT INTO current_user_email, current_user_role
    FROM public.users
    WHERE id = current_user_id;
  END IF;
  
  -- Insert audit log
  INSERT INTO public.audit_logs (
    action,
    entity_type,
    entity_id,
    user_id,
    user_email,
    user_role,
    old_values,
    new_values,
    campaign_id
  ) VALUES (
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    current_user_id,
    current_user_email,
    current_user_role,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    CASE
      WHEN TG_TABLE_NAME = 'campaigns' THEN COALESCE(NEW.id, OLD.id)
      WHEN NEW IS NOT NULL AND NEW.campaign_id IS NOT NULL THEN NEW.campaign_id
      WHEN OLD IS NOT NULL AND OLD.campaign_id IS NOT NULL THEN OLD.campaign_id
      ELSE NULL
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.4 Apply audit triggers to tables
CREATE TRIGGER audit_campaigns
  AFTER INSERT OR UPDATE OR DELETE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_clients
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5.1 Users policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5.2 Clients policies
CREATE POLICY "Users can view clients"
  ON public.clients FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('campaign_manager', 'director', 'admin', 'finance')
    )
  );

CREATE POLICY "Campaign managers can create clients"
  ON public.clients FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('campaign_manager', 'admin')
    )
  );

CREATE POLICY "Campaign managers can update clients"
  ON public.clients FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('campaign_manager', 'admin')
    )
  );

-- 5.3 Campaigns policies
CREATE POLICY "Users can view campaigns they're members of"
  ON public.campaigns FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.campaign_members WHERE campaign_id = id
    )
    OR
    auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('admin', 'director')
    )
  );

CREATE POLICY "Campaign managers can create campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('campaign_manager', 'admin')
    )
  );

CREATE POLICY "Campaign members can update campaigns"
  ON public.campaigns FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.campaign_members WHERE campaign_id = id
    )
  );

-- 5.4 Campaign members policies
CREATE POLICY "Users can view campaign members for their campaigns"
  ON public.campaign_members FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.campaign_members cm WHERE cm.campaign_id = campaign_id
    )
    OR
    auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('admin', 'director')
    )
  );

-- 5.5 Audit logs policies
CREATE POLICY "Users can view audit logs for their campaigns"
  ON public.audit_logs FOR SELECT
  USING (
    campaign_id IN (
      SELECT campaign_id FROM public.campaign_members WHERE user_id = auth.uid()
    )
    OR
    auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('admin', 'director')
    )
    OR
    user_id = auth.uid()
  );

-- ============================================================================
-- 6. COMMENTS
-- ============================================================================

COMMENT ON TABLE public.users IS 'Extends Supabase auth.users with custom fields';
COMMENT ON TABLE public.clients IS 'Client organizations and contacts';
COMMENT ON TABLE public.campaigns IS 'Root entity - all campaign data';
COMMENT ON TABLE public.campaign_members IS 'Users assigned to campaigns';
COMMENT ON TABLE public.audit_logs IS 'Immutable audit trail of all actions';

-- ============================================================================
-- 7. GRANTS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.campaigns TO authenticated;
GRANT SELECT, INSERT ON public.campaign_members TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
