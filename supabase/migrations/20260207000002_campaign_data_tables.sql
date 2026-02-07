-- TiKiT OS - Campaign Data Tables
-- Briefs, Strategies, Content, Approvals, Financial objects, Risk flags
-- Migration: 20260207000002

-- =============================================================================
-- BRIEFS TABLE
-- =============================================================================

CREATE TABLE public.briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Brief versions
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Status
  status brief_status NOT NULL DEFAULT 'uploaded',
  
  -- Raw brief
  raw_brief_url TEXT,  -- Link to uploaded file in Supabase Storage
  raw_brief_text TEXT, -- Extracted text
  
  -- Structured brief (AI-processed)
  structured_data JSONB DEFAULT '{}'::jsonb,  -- AI-extracted fields
  
  -- AI processing
  ai_processing_status TEXT CHECK (ai_processing_status IN ('pending', 'processing', 'complete', 'failed')),
  ai_confidence_score DECIMAL(3, 2),
  ai_processing_error TEXT,
  
  -- Review
  review_notes TEXT,
  missing_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Ensure unique version per campaign
  UNIQUE(campaign_id, version)
);

-- Indexes for briefs
CREATE INDEX idx_briefs_campaign ON briefs(campaign_id);
CREATE INDEX idx_briefs_status ON briefs(status);
CREATE INDEX idx_briefs_version ON briefs(campaign_id, version DESC);

-- Trigger for updated_at
CREATE TRIGGER update_briefs_updated_at
  BEFORE UPDATE ON briefs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STRATEGIES TABLE
-- =============================================================================

CREATE TABLE public.strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Strategy versions
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Status
  status strategy_status NOT NULL DEFAULT 'draft',
  
  -- Strategy content
  strategy_data JSONB DEFAULT '{}'::jsonb,  -- AI-generated or manual
  
  -- AI generation
  ai_generated BOOLEAN DEFAULT false,
  ai_model_used TEXT,
  ai_generation_prompt TEXT,
  
  -- Review
  review_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Ensure unique version per campaign
  UNIQUE(campaign_id, version)
);

-- Indexes for strategies
CREATE INDEX idx_strategies_campaign ON strategies(campaign_id);
CREATE INDEX idx_strategies_status ON strategies(status);
CREATE INDEX idx_strategies_version ON strategies(campaign_id, version DESC);

-- Trigger for updated_at
CREATE TRIGGER update_strategies_updated_at
  BEFORE UPDATE ON strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- CONTENT TASKS TABLE
-- =============================================================================

CREATE TABLE public.content_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES influencers(id) ON DELETE SET NULL,
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  deliverable_type TEXT NOT NULL CHECK (deliverable_type IN (
    'instagram_post',
    'instagram_story',
    'instagram_reel',
    'tiktok_video',
    'youtube_video',
    'youtube_short',
    'twitter_post',
    'blog_post'
  )),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN (
    'assigned',
    'script_draft',
    'script_approval',
    'filming',
    'video_draft',
    'video_approval',
    'revisions',
    'final_approval',
    'approved',
    'scheduled',
    'published',
    'completed',
    'cancelled'
  )),
  
  -- Timeline
  due_date DATE,
  script_deadline DATE,
  filming_deadline DATE,
  final_deadline DATE,
  publish_date DATE,
  published_at TIMESTAMPTZ,
  
  -- Publishing details
  publish_url TEXT,
  
  -- Performance metrics (collected post-publish)
  metrics JSONB DEFAULT '{}'::jsonb,  -- views, likes, comments, shares, etc.
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for content_tasks
CREATE INDEX idx_content_tasks_campaign ON content_tasks(campaign_id);
CREATE INDEX idx_content_tasks_influencer ON content_tasks(influencer_id);
CREATE INDEX idx_content_tasks_status ON content_tasks(status);
CREATE INDEX idx_content_tasks_dates ON content_tasks(due_date, publish_date);

-- Trigger for updated_at
CREATE TRIGGER update_content_tasks_updated_at
  BEFORE UPDATE ON content_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- CONTENT ARTIFACTS TABLE (Script → Video Draft → Final Content)
-- =============================================================================

CREATE TABLE public.content_artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_task_id UUID NOT NULL REFERENCES content_tasks(id) ON DELETE CASCADE,
  
  -- Artifact type and version
  artifact_type content_artifact_type NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  
  -- State
  state content_artifact_state NOT NULL DEFAULT 'draft',
  
  -- Content
  file_url TEXT,  -- URL in Supabase Storage
  file_type TEXT,  -- e.g., 'video/mp4', 'text/plain'
  file_size BIGINT,  -- Size in bytes
  
  -- For scripts
  script_text TEXT,
  
  -- Review
  review_notes TEXT,
  revisions_requested TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Ensure unique artifact type + version per task
  UNIQUE(content_task_id, artifact_type, version)
);

-- Indexes for content_artifacts
CREATE INDEX idx_content_artifacts_task ON content_artifacts(content_task_id);
CREATE INDEX idx_content_artifacts_type ON content_artifacts(artifact_type);
CREATE INDEX idx_content_artifacts_state ON content_artifacts(state);

-- Trigger for updated_at
CREATE TRIGGER update_content_artifacts_updated_at
  BEFORE UPDATE ON content_artifacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- APPROVALS TABLE (All approval workflows)
-- =============================================================================

CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Approval type
  approval_type approval_type NOT NULL,
  
  -- What is being approved
  entity_type TEXT NOT NULL,  -- 'brief', 'strategy', 'content_artifact', etc.
  entity_id UUID NOT NULL,
  
  -- Status
  status approval_status NOT NULL DEFAULT 'pending',
  
  -- Approver
  requested_from UUID NOT NULL REFERENCES users(id),
  requested_by UUID NOT NULL REFERENCES users(id),
  
  -- Decision
  decision_notes TEXT,
  decision_at TIMESTAMPTZ,
  
  -- Override (for Directors)
  overridden BOOLEAN DEFAULT false,
  override_reason TEXT,
  override_by UUID REFERENCES users(id),
  override_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for approvals
CREATE INDEX idx_approvals_campaign ON approvals(campaign_id);
CREATE INDEX idx_approvals_type ON approvals(approval_type);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_requested_from ON approvals(requested_from);
CREATE INDEX idx_approvals_entity ON approvals(entity_type, entity_id);

-- Trigger for updated_at
CREATE TRIGGER update_approvals_updated_at
  BEFORE UPDATE ON approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FINANCIAL OBJECTS TABLE (Budgets, Expenses, Invoices, Payments)
-- =============================================================================

CREATE TABLE public.financial_objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
  
  -- Financial object type
  object_type financial_object_type NOT NULL,
  
  -- Status
  status financial_object_status NOT NULL DEFAULT 'draft',
  
  -- Amount
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Description
  description TEXT,
  category TEXT,  -- e.g., 'influencer_payment', 'production_cost', 'ad_spend'
  
  -- Related entities
  influencer_id UUID REFERENCES influencers(id),
  content_task_id UUID REFERENCES content_tasks(id),
  
  -- Payment details
  payment_method TEXT,
  payment_reference TEXT,
  payment_date DATE,
  
  -- Documents
  invoice_url TEXT,
  receipt_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for financial_objects
CREATE INDEX idx_financial_objects_campaign ON financial_objects(campaign_id);
CREATE INDEX idx_financial_objects_type ON financial_objects(object_type);
CREATE INDEX idx_financial_objects_status ON financial_objects(status);
CREATE INDEX idx_financial_objects_influencer ON financial_objects(influencer_id) WHERE influencer_id IS NOT NULL;
CREATE INDEX idx_financial_objects_dates ON financial_objects(payment_date);

-- Trigger for updated_at
CREATE TRIGGER update_financial_objects_updated_at
  BEFORE UPDATE ON financial_objects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- RISK FLAGS TABLE (Missing information and risk tracking)
-- =============================================================================

CREATE TABLE public.risk_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Risk details
  title TEXT NOT NULL,
  description TEXT,
  severity risk_severity NOT NULL,
  category TEXT,  -- e.g., 'missing_info', 'timeline', 'budget', 'quality'
  
  -- Status
  status risk_flag_status NOT NULL DEFAULT 'open',
  
  -- Related entity
  entity_type TEXT,  -- 'brief', 'strategy', 'content_task', etc.
  entity_id UUID,
  
  -- Resolution
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for risk_flags
CREATE INDEX idx_risk_flags_campaign ON risk_flags(campaign_id);
CREATE INDEX idx_risk_flags_severity ON risk_flags(severity);
CREATE INDEX idx_risk_flags_status ON risk_flags(status);
CREATE INDEX idx_risk_flags_entity ON risk_flags(entity_type, entity_id) WHERE entity_type IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER update_risk_flags_updated_at
  BEFORE UPDATE ON risk_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- CAMPAIGN DATA TABLES COMPLETE
-- =============================================================================
-- Next migration will add:
-- - Row Level Security (RLS) policies
-- - Additional indexes and optimizations
-- =============================================================================
