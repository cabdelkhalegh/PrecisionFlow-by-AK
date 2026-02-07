-- TiKiT OS - Core Tables
-- Users, Clients, Campaigns, and supporting tables
-- Migration: 20260207000001

-- =============================================================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Role and permissions
  role user_role NOT NULL,
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
  deleted_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_organization ON users(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_users_status ON users(status);

-- Trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- CLIENTS TABLE
-- =============================================================================

CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic information
  name TEXT NOT NULL,
  industry TEXT,
  logo_url TEXT,
  website TEXT,
  
  -- Contact information
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  
  -- Metadata
  preferences JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for clients
CREATE INDEX idx_clients_name ON clients USING gin(name gin_trgm_ops);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_industry ON clients(industry);
CREATE INDEX idx_clients_tags ON clients USING gin(tags);

-- Trigger for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- CAMPAIGNS TABLE (Root Entity)
-- =============================================================================

CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic information
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  
  -- State and risk
  state campaign_state NOT NULL DEFAULT 'brief_upload',
  risk_level risk_level NOT NULL DEFAULT 'medium',
  risk_score INTEGER DEFAULT 0,
  
  -- Campaign manager
  campaign_manager_id UUID REFERENCES users(id),
  
  -- Timeline
  start_date DATE,
  end_date DATE,
  brief_deadline DATE,
  content_deadline DATE,
  publishing_deadline DATE,
  
  -- Budget
  budget_total DECIMAL(12, 2),
  budget_currency TEXT DEFAULT 'USD',
  
  -- Objectives and KPIs
  objectives JSONB DEFAULT '[]'::jsonb,
  target_audience JSONB DEFAULT '{}'::jsonb,
  kpis JSONB DEFAULT '[]'::jsonb,
  
  -- Tags and metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Indexes for campaigns
CREATE INDEX idx_campaigns_client ON campaigns(client_id);
CREATE INDEX idx_campaigns_state ON campaigns(state);
CREATE INDEX idx_campaigns_risk_level ON campaigns(risk_level);
CREATE INDEX idx_campaigns_manager ON campaigns(campaign_manager_id);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_tags ON campaigns USING gin(tags);
CREATE INDEX idx_campaigns_name ON campaigns USING gin(name gin_trgm_ops);

-- Trigger for updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- CAMPAIGN MEMBERS TABLE (Team assignments)
-- =============================================================================

CREATE TABLE public.campaign_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Ensure unique user per campaign
  UNIQUE(campaign_id, user_id)
);

-- Indexes for campaign_members
CREATE INDEX idx_campaign_members_campaign ON campaign_members(campaign_id);
CREATE INDEX idx_campaign_members_user ON campaign_members(user_id);

-- =============================================================================
-- INFLUENCERS TABLE
-- =============================================================================

CREATE TABLE public.influencers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic information
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  
  -- Social media profiles
  instagram_handle TEXT,
  tiktok_handle TEXT,
  youtube_handle TEXT,
  twitter_handle TEXT,
  
  -- Metrics
  total_followers INTEGER,
  avg_engagement_rate DECIMAL(5, 2),
  
  -- Categories and tags
  categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Performance data
  past_campaigns JSONB DEFAULT '[]'::jsonb,
  ratings JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMPTZ
);

-- Indexes for influencers
CREATE INDEX idx_influencers_name ON influencers USING gin(name gin_trgm_ops);
CREATE INDEX idx_influencers_instagram ON influencers(instagram_handle);
CREATE INDEX idx_influencers_tiktok ON influencers(tiktok_handle);
CREATE INDEX idx_influencers_categories ON influencers USING gin(categories);
CREATE INDEX idx_influencers_tags ON influencers USING gin(tags);
CREATE INDEX idx_influencers_status ON influencers(status);

-- Trigger for updated_at
CREATE TRIGGER update_influencers_updated_at
  BEFORE UPDATE ON influencers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- CAMPAIGN INFLUENCERS TABLE (Many-to-many relationship)
-- =============================================================================

CREATE TABLE public.campaign_influencers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'shortlisted' CHECK (status IN (
    'shortlisted',
    'client_approved',
    'contracted',
    'active',
    'completed',
    'cancelled'
  )),
  
  -- Contract details
  contract_url TEXT,
  agreed_rate DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  
  -- Performance
  deliverables_count INTEGER DEFAULT 0,
  performance_score DECIMAL(3, 2),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  -- Ensure unique influencer per campaign
  UNIQUE(campaign_id, influencer_id)
);

-- Indexes for campaign_influencers
CREATE INDEX idx_campaign_influencers_campaign ON campaign_influencers(campaign_id);
CREATE INDEX idx_campaign_influencers_influencer ON campaign_influencers(influencer_id);
CREATE INDEX idx_campaign_influencers_status ON campaign_influencers(status);

-- Trigger for updated_at
CREATE TRIGGER update_campaign_influencers_updated_at
  BEFORE UPDATE ON campaign_influencers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- AUDIT LOGS TABLE (Immutable audit trail)
-- =============================================================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- What was changed
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  
  -- Change data
  old_data JSONB,
  new_data JSONB,
  
  -- Who and when
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for audit_logs (partitioned by month for performance)
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Note: In production, consider partitioning audit_logs by month
-- Example: CREATE TABLE audit_logs_2026_02 PARTITION OF audit_logs FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- =============================================================================
-- CORE TABLES COMPLETE
-- =============================================================================
-- Next migrations will add:
-- - Briefs, Strategies, Content, Approvals, Financial objects, Risk flags
-- =============================================================================
