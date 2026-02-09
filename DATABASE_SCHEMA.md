# 🗄️ PrecisionFlow - Database Schema

**Product:** PrecisionFlow — Campaign Execution & Intelligence  
**Database:** PostgreSQL 15+ (Supabase)  
**Version:** 1.0  
**Date:** February 2026

---

## 📋 Overview

This document defines the complete database schema for PrecisionFlow, designed for PostgreSQL with Supabase. The schema implements the canonical data model from PRD.md with:

- ✅ Row Level Security (RLS) for multi-tenant isolation
- ✅ Complete audit trails with triggers
- ✅ State machines for campaign and content lifecycles
- ✅ JSONB for flexible metadata
- ✅ Optimized indexes for performance
- ✅ Partitioning for large tables (audit logs)
- ✅ Real-time subscriptions support

---

## 🎯 Core Principles

1. **Campaign as Root Entity** - All data links back to campaign_id
2. **Immutable Audit Trails** - Append-only, never delete
3. **Type Safety** - Enums for all state fields
4. **Soft Deletes** - Use deleted_at instead of hard deletes
5. **Timestamps** - created_at, updated_at on all tables
6. **UUID Primary Keys** - For distributed systems and security

---

## 📊 Entity Relationship Diagram

```
┌─────────────┐
│   users     │
└──────┬──────┘
       │
       ├──────────────────────┬──────────────────┐
       │                      │                  │
┌──────▼──────┐         ┌────▼────┐      ┌─────▼─────┐
│   clients   │         │campaigns│      │influencers│
└──────┬──────┘         └────┬────┘      └─────┬─────┘
       │                     │                  │
       │              ┌──────┼──────┬──────────┼─────────┐
       │              │      │      │          │         │
       │         ┌────▼────┐ │ ┌───▼────┐┌────▼────┐┌──▼──────┐
       │         │ briefs  │ │ │strategy││content_ ││financial_│
       │         └─────────┘ │ └────────┘│tasks    ││objects   │
       │                     │            └────┬────┘└──────────┘
       │                     │                 │
       │              ┌──────▼──────┐    ┌────▼──────┐
       │              │campaign_    │    │content_   │
       │              │members      │    │artifacts  │
       │              └─────────────┘    └───────────┘
       │
       └──────────────┐
                      │
               ┌──────▼──────┐
               │  approvals  │
               └─────────────┘
```

---

## 📐 Schema Definitions

### 1. Core Tables

#### 1.1 users (Supabase Auth Extended)

```sql
-- Extends Supabase auth.users with custom fields
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
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_organization ON users(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Trigger function to prevent privilege escalation
CREATE OR REPLACE FUNCTION prevent_user_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If the row is being updated by its owner and the owner is not an admin,
  -- prevent changes to privileged fields that could affect authorization.
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
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_user_privilege_escalation();

-- Trigger for updated_at
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

#### 1.2 clients

```sql
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
  account_manager_id UUID REFERENCES users(id),
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
CREATE INDEX idx_clients_account_manager ON clients(account_manager_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_name ON clients USING gin(to_tsvector('english', name));
CREATE INDEX idx_clients_tags ON clients USING gin(tags);

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign managers can view their clients"
  ON clients FOR SELECT
  USING (
    account_manager_id = auth.uid()
    OR auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'director'))
  );

-- Trigger
CREATE TRIGGER set_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

#### 1.3 campaigns

```sql
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id),
  
  -- Status and Lifecycle
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'pending_internal_approval',
    'pending_client_approval',
    'approved',
    'executing',
    'closing',
    'closed_and_locked'
  )),
  
  -- Risk Assessment
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
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
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  -- Closure
  closed_at TIMESTAMPTZ,
  locked_at TIMESTAMPTZ,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_campaigns_client ON campaigns(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_status ON campaigns(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_risk_level ON campaigns(risk_level) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_tags ON campaigns USING gin(tags);

-- RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view campaigns they're members of"
  ON campaigns FOR SELECT
  USING (
    id IN (
      SELECT campaign_id FROM campaign_members 
      WHERE user_id = auth.uid()
    )
    OR auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'director'))
  );

-- Trigger
CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER audit_campaign_changes
  AFTER INSERT OR UPDATE OR DELETE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_trigger();
```

#### 1.4 campaign_members

```sql
CREATE TABLE public.campaign_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL CHECK (role IN (
    'owner',
    'campaign_manager',
    'collaborator',
    'viewer',
    'client_approver'
  )),
  
  permissions JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by UUID REFERENCES users(id),
  
  UNIQUE(campaign_id, user_id)
);

-- Indexes
CREATE INDEX idx_campaign_members_campaign ON campaign_members(campaign_id);
CREATE INDEX idx_campaign_members_user ON campaign_members(user_id);

-- RLS
ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view campaign memberships"
  ON campaign_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR campaign_id IN (
      SELECT campaign_id FROM campaign_members WHERE user_id = auth.uid()
    )
  );
```

#### 1.5 briefs

```sql
CREATE TABLE public.briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Raw Brief
  raw_content TEXT,
  raw_file_url TEXT,
  raw_file_type TEXT,
  
  -- Structured Brief (AI-extracted)
  structured_data JSONB, -- {objectives, audience, deliverables, budget, timeline, etc.}
  ai_confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  ai_model_version TEXT,
  
  -- Validation
  is_validated BOOLEAN DEFAULT false,
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMPTZ,
  validation_notes TEXT,
  
  -- Version Control
  version INTEGER NOT NULL DEFAULT 1,
  parent_version_id UUID REFERENCES briefs(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  deleted_at TIMESTAMPTZ,
  
  UNIQUE(campaign_id, version)
);

-- Indexes
CREATE INDEX idx_briefs_campaign ON briefs(campaign_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_briefs_version ON briefs(campaign_id, version);
CREATE INDEX idx_briefs_structured ON briefs USING gin(structured_data);

-- RLS
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view briefs for their campaigns"
  ON briefs FOR SELECT
  USING (
    campaign_id IN (
      SELECT campaign_id FROM campaign_members WHERE user_id = auth.uid()
    )
  );

-- Trigger
CREATE TRIGGER set_briefs_updated_at
  BEFORE UPDATE ON briefs
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

#### 1.6 strategies

```sql
CREATE TABLE public.strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Strategy Content
  ai_generated_strategy JSONB, -- AI-generated recommendations
  final_strategy JSONB, -- Human-approved final strategy
  
  -- Components
  content_plan JSONB, -- {deliverable_types, quantities, timeline}
  creator_criteria JSONB, -- {audience_size, engagement_rate, niches}
  budget_allocation JSONB, -- {creator_fees, production, misc}
  
  -- Approval Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'pending_internal_approval',
    'pending_client_approval',
    'approved',
    'rejected'
  )),
  
  -- Version Control
  version INTEGER NOT NULL DEFAULT 1,
  parent_version_id UUID REFERENCES strategies(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  deleted_at TIMESTAMPTZ,
  
  UNIQUE(campaign_id, version)
);

-- Indexes
CREATE INDEX idx_strategies_campaign ON strategies(campaign_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_strategies_status ON strategies(status) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view strategies for their campaigns"
  ON strategies FOR SELECT
  USING (
    campaign_id IN (
      SELECT campaign_id FROM campaign_members WHERE user_id = auth.uid()
    )
  );

-- Trigger
CREATE TRIGGER set_strategies_updated_at
  BEFORE UPDATE ON strategies
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

#### 1.7 influencers

```sql
CREATE TABLE public.influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  user_id UUID REFERENCES users(id), -- If they have an account
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  
  -- Social Media
  social_profiles JSONB DEFAULT '[]'::jsonb, -- [{platform, handle, url, followers, engagement_rate}]
  
  -- Demographics
  location JSONB, -- {city, country}
  languages TEXT[] DEFAULT '{}',
  
  -- Categories
  niches TEXT[] DEFAULT '{}',
  content_types TEXT[] DEFAULT '{}',
  
  -- Performance Metrics
  avg_engagement_rate DECIMAL(5,2),
  total_followers INTEGER,
  past_campaign_count INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2),
  
  -- Pricing
  rate_card JSONB, -- {post: {min, max}, story: {min, max}, video: {min, max}}
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  blacklist_reason TEXT,
  
  -- Contract Info
  contract_template_id UUID,
  payment_terms TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_influencers_user ON influencers(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_influencers_status ON influencers(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_influencers_niches ON influencers USING gin(niches);
CREATE INDEX idx_influencers_content_types ON influencers USING gin(content_types);
CREATE INDEX idx_influencers_followers ON influencers(total_followers) WHERE deleted_at IS NULL;
CREATE INDEX idx_influencers_engagement ON influencers(avg_engagement_rate) WHERE deleted_at IS NULL;
CREATE INDEX idx_influencers_name ON influencers USING gin(to_tsvector('english', name));

-- RLS
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign managers can view all influencers"
  ON influencers FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('campaign_manager', 'admin', 'director'))
  );

CREATE POLICY "Influencers can view their own profile"
  ON influencers FOR SELECT
  USING (user_id = auth.uid());

-- Trigger
CREATE TRIGGER set_influencers_updated_at
  BEFORE UPDATE ON influencers
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

#### 1.8 creator_shortlists

```sql
CREATE TABLE public.creator_shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Proposed Creators
  proposed_influencers JSONB DEFAULT '[]'::jsonb, -- [{influencer_id, rationale, proposed_fee}]
  
  -- Client Feedback
  client_approved_influencers UUID[] DEFAULT '{}',
  client_rejected_influencers JSONB DEFAULT '[]'::jsonb, -- [{influencer_id, reason}]
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'pending_client_approval',
    'approved',
    'rejected',
    'partially_approved'
  )),
  
  -- Approval
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  approval_notes TEXT,
  
  -- Version Control
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  deleted_at TIMESTAMPTZ,
  
  UNIQUE(campaign_id, version)
);

-- Indexes
CREATE INDEX idx_shortlists_campaign ON creator_shortlists(campaign_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_shortlists_status ON creator_shortlists(status) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE creator_shortlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shortlists for their campaigns"
  ON creator_shortlists FOR SELECT
  USING (
    campaign_id IN (
      SELECT campaign_id FROM campaign_members WHERE user_id = auth.uid()
    )
  );

-- Trigger
CREATE TRIGGER set_shortlists_updated_at
  BEFORE UPDATE ON creator_shortlists
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

#### 1.9 content_tasks

```sql
CREATE TABLE public.content_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id),
  
  -- Task Details
  title TEXT NOT NULL,
  description TEXT,
  deliverable_type TEXT NOT NULL CHECK (deliverable_type IN (
    'instagram_post',
    'instagram_story',
    'instagram_reel',
    'tiktok_video',
    'youtube_video',
    'youtube_short',
    'facebook_post',
    'twitter_post',
    'blog_post',
    'other'
  )),
  
  -- Requirements
  requirements JSONB, -- {word_count, duration, hashtags, mentions, etc.}
  
  -- Derived Status (from artifacts)
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started',
    'script_in_progress',
    'script_pending_approval',
    'script_approved',
    'production_in_progress',
    'draft_pending_approval',
    'revisions_requested',
    'final_approved',
    'published',
    'archived'
  )),
  
  -- Schedule
  script_deadline DATE,
  filming_deadline DATE,
  publish_deadline DATE,
  actual_publish_date DATE,
  
  -- KPIs
  target_kpis JSONB, -- {reach, engagement, conversions}
  actual_kpis JSONB,
  kpi_collected_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_content_tasks_campaign ON content_tasks(campaign_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_tasks_influencer ON content_tasks(influencer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_tasks_status ON content_tasks(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_content_tasks_deadlines ON content_tasks(publish_deadline) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE content_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks for their campaigns"
  ON content_tasks FOR SELECT
  USING (
    campaign_id IN (
      SELECT campaign_id FROM campaign_members WHERE user_id = auth.uid()
    )
    OR influencer_id IN (
      SELECT id FROM influencers WHERE user_id = auth.uid()
    )
  );

-- Trigger
CREATE TRIGGER set_content_tasks_updated_at
  BEFORE UPDATE ON content_tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

#### 1.10 content_artifacts

```sql
CREATE TABLE public.content_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  content_task_id UUID NOT NULL REFERENCES content_tasks(id) ON DELETE CASCADE,
  
  -- Artifact Type
  artifact_type TEXT NOT NULL CHECK (artifact_type IN (
    'SCRIPT',
    'VIDEO_DRAFT',
    'FINAL_CONTENT'
  )),
  
  -- File Info
  file_url TEXT,
  file_type TEXT,
  file_size_bytes BIGINT,
  thumbnail_url TEXT,
  
  -- Content
  text_content TEXT, -- For scripts
  
  -- Lifecycle Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'pending_approval',
    'approved',
    'revisions_requested',
    'rejected',
    'published',
    'archived'
  )),
  
  -- Approval Flow
  submitted_for_approval_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  approval_notes TEXT,
  
  -- Revision Tracking
  revision_notes TEXT,
  revision_requested_by UUID REFERENCES users(id),
  revision_requested_at TIMESTAMPTZ,
  
  -- Version Control
  version INTEGER NOT NULL DEFAULT 1,
  parent_version_id UUID REFERENCES content_artifacts(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  deleted_at TIMESTAMPTZ,
  
  UNIQUE(content_task_id, artifact_type, version)
);

-- Indexes
CREATE INDEX idx_artifacts_task ON content_artifacts(content_task_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_artifacts_type ON content_artifacts(artifact_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_artifacts_status ON content_artifacts(status) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE content_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view artifacts for their tasks"
  ON content_artifacts FOR SELECT
  USING (
    content_task_id IN (
      SELECT id FROM content_tasks
      WHERE campaign_id IN (
        SELECT campaign_id FROM campaign_members WHERE user_id = auth.uid()
      )
    )
  );

-- Trigger
CREATE TRIGGER set_artifacts_updated_at
  BEFORE UPDATE ON content_artifacts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

#### 1.11 approvals

```sql
CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What is being approved
  approval_type TEXT NOT NULL CHECK (approval_type IN (
    'brief',
    'strategy',
    'creator_shortlist',
    'content_script',
    'content_draft',
    'content_final',
    'budget_revision',
    'exception'
  )),
  
  -- References
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  related_entity_type TEXT NOT NULL,
  related_entity_id UUID NOT NULL,
  
  -- Approval Level
  approval_level TEXT NOT NULL CHECK (approval_level IN (
    'internal',
    'client'
  )),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'approved',
    'rejected',
    'cancelled'
  )),
  
  -- Approver
  approver_id UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Override (for Directors)
  is_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  override_by UUID REFERENCES users(id),
  
  -- Request Info
  requested_by UUID NOT NULL REFERENCES users(id),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_approvals_campaign ON approvals(campaign_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_approvals_type ON approvals(approval_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_approvals_status ON approvals(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_approvals_approver ON approvals(approver_id) WHERE deleted_at IS NULL AND status = 'pending';
CREATE INDEX idx_approvals_entity ON approvals(related_entity_type, related_entity_id) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view approvals for their campaigns"
  ON approvals FOR SELECT
  USING (
    campaign_id IN (
      SELECT campaign_id FROM campaign_members WHERE user_id = auth.uid()
    )
    OR approver_id = auth.uid()
  );

-- Trigger
CREATE TRIGGER set_approvals_updated_at
  BEFORE UPDATE ON approvals
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER audit_approvals
  AFTER INSERT OR UPDATE ON approvals
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_trigger();
```

#### 1.12 financial_objects

```sql
CREATE TABLE public.financial_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Object Type
  object_type TEXT NOT NULL CHECK (object_type IN (
    'budget',
    'budget_revision',
    'expense',
    'invoice',
    'payment'
  )),
  
  -- Financial Details
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT NOT NULL,
  
  -- References
  related_entity_type TEXT,
  related_entity_id UUID, -- Could be influencer_id, content_task_id, etc.
  
  -- Budget Revision
  previous_budget_amount DECIMAL(12,2),
  new_budget_amount DECIMAL(12,2),
  revision_reason TEXT,
  
  -- Invoice/Payment
  invoice_number TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'pending_approval',
    'approved',
    'paid',
    'cancelled'
  )),
  
  -- Approval
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  -- Dates
  due_date DATE,
  paid_date DATE,
  
  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb, -- [{url, type, name}]
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_financial_campaign ON financial_objects(campaign_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_financial_type ON financial_objects(object_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_financial_status ON financial_objects(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_financial_dates ON financial_objects(due_date, paid_date) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE financial_objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance users can view financial objects"
  ON financial_objects FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('finance', 'admin', 'director'))
    OR campaign_id IN (
      SELECT campaign_id FROM campaign_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'campaign_manager')
    )
  );

-- Trigger
CREATE TRIGGER set_financial_updated_at
  BEFORE UPDATE ON financial_objects
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER audit_financial_objects
  AFTER INSERT OR UPDATE OR DELETE ON financial_objects
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_trigger();
```

#### 1.13 risk_flags

```sql
CREATE TABLE public.risk_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Flag Details
  flag_type TEXT NOT NULL CHECK (flag_type IN (
    'missing_info',
    'budget_overrun',
    'schedule_delay',
    'approval_pending',
    'content_quality',
    'compliance',
    'other'
  )),
  
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Resolution
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'ignored')),
  
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_risk_flags_campaign ON risk_flags(campaign_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_risk_flags_severity ON risk_flags(severity) WHERE deleted_at IS NULL AND status = 'open';
CREATE INDEX idx_risk_flags_status ON risk_flags(status) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE risk_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view risk flags for their campaigns"
  ON risk_flags FOR SELECT
  USING (
    campaign_id IN (
      SELECT campaign_id FROM campaign_members WHERE user_id = auth.uid()
    )
  );

-- Trigger
CREATE TRIGGER set_risk_flags_updated_at
  BEFORE UPDATE ON risk_flags
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

#### 1.14 campaign_closure

```sql
CREATE TABLE public.campaign_closure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  campaign_id UUID NOT NULL UNIQUE REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Closeout Meeting
  closeout_meeting_date DATE,
  closeout_meeting_notes TEXT,
  closeout_attendees UUID[] DEFAULT '{}',
  
  -- CX Survey
  cx_survey_sent_at TIMESTAMPTZ,
  cx_survey_completed_at TIMESTAMPTZ,
  cx_survey_responses JSONB,
  cx_score DECIMAL(3,2), -- 0.00 to 5.00
  
  -- Post-Mortem
  post_mortem_completed_at TIMESTAMPTZ,
  post_mortem_document_url TEXT,
  lessons_learned JSONB DEFAULT '[]'::jsonb, -- [{category, lesson, impact}]
  
  -- AI Learnings
  ai_analysis_completed_at TIMESTAMPTZ,
  ai_identified_patterns JSONB,
  ai_recommendations JSONB,
  
  -- Final Intelligence Document
  final_intelligence_document_url TEXT,
  final_intelligence_generated_at TIMESTAMPTZ,
  
  -- Best Practices
  best_practices JSONB DEFAULT '[]'::jsonb, -- [{title, description, category}]
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_closure_campaign ON campaign_closure(campaign_id) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE campaign_closure ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view closure for their campaigns"
  ON campaign_closure FOR SELECT
  USING (
    campaign_id IN (
      SELECT campaign_id FROM campaign_members WHERE user_id = auth.uid()
    )
  );

-- Trigger
CREATE TRIGGER set_closure_updated_at
  BEFORE UPDATE ON campaign_closure
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
```

#### 1.15 audit_logs (Partitioned)

```sql
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid(),
  
  -- What was changed
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  
  -- Action
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  
  -- Who and When
  user_id UUID REFERENCES users(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- What changed
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  PRIMARY KEY (id, performed_at)
) PARTITION BY RANGE (performed_at);

-- Create partitions (automate this in production)
CREATE TABLE audit_logs_2026_02 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Indexes
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_performed ON audit_logs(performed_at);

-- RLS (Read-only for admins)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'director'))
  );
```

---

## 🔧 Database Functions & Triggers

### Helper Functions

```sql
-- Update timestamp function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Audit log trigger function
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  changed_fields TEXT[];
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data = to_jsonb(OLD);
    INSERT INTO audit_logs (table_name, record_id, action, user_id, old_values)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', auth.uid(), old_data);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
    SELECT array_agg(key) INTO changed_fields
    FROM jsonb_each(old_data)
    WHERE value != (new_data -> key);
    
    INSERT INTO audit_logs (table_name, record_id, action, user_id, old_values, new_values, changed_fields)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', auth.uid(), old_data, new_data, changed_fields);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    new_data = to_jsonb(NEW);
    INSERT INTO audit_logs (table_name, record_id, action, user_id, new_values)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', auth.uid(), new_data);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update campaign status based on content tasks
CREATE OR REPLACE FUNCTION update_campaign_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically update campaign status based on content task statuses
  -- This is a derived status calculation
  -- Implementation depends on business rules
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 📈 Views for Reporting

```sql
-- Campaign Dashboard View
CREATE VIEW campaign_dashboard AS
SELECT 
  c.id,
  c.name,
  c.status,
  c.risk_level,
  cl.name as client_name,
  c.budget_total,
  c.actual_spent,
  (c.budget_total - c.actual_spent) as budget_remaining,
  c.start_date,
  c.end_date,
  COUNT(DISTINCT ct.id) as total_tasks,
  COUNT(DISTINCT ct.id) FILTER (WHERE ct.status = 'published') as completed_tasks,
  COUNT(DISTINCT rf.id) FILTER (WHERE rf.status = 'open' AND rf.severity IN ('high', 'critical')) as open_critical_risks
FROM campaigns c
LEFT JOIN clients cl ON c.client_id = cl.id
LEFT JOIN content_tasks ct ON c.id = ct.campaign_id AND ct.deleted_at IS NULL
LEFT JOIN risk_flags rf ON c.id = rf.campaign_id AND rf.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, cl.name;

-- Influencer Performance View
CREATE VIEW influencer_performance AS
SELECT
  i.id,
  i.name,
  i.total_followers,
  i.avg_engagement_rate,
  COUNT(DISTINCT ct.id) as total_tasks_completed,
  AVG((ct.actual_kpis->>'reach')::numeric) as avg_reach,
  AVG((ct.actual_kpis->>'engagement')::numeric) as avg_engagement,
  i.avg_rating
FROM influencers i
LEFT JOIN content_tasks ct ON i.id = ct.influencer_id 
  AND ct.status = 'published' 
  AND ct.deleted_at IS NULL
WHERE i.deleted_at IS NULL
GROUP BY i.id;
```

---

## 🔐 Security Policies Summary

All tables have Row Level Security (RLS) enabled with policies ensuring:

1. **Users** can only access data for campaigns they're members of
2. **Clients** can only see their own campaigns and related data
3. **Influencers** can only see tasks assigned to them
4. **Admins/Directors** have broader access for governance
5. **Finance** users can access financial objects
6. **Audit logs** are read-only and admin-only

---

## 📊 Indexes Strategy

Indexes are created for:
- **Primary access patterns** (campaign_id, user_id)
- **Filtering** (status, dates, risk_level)
- **Search** (GIN indexes for JSONB, text search)
- **Joins** (foreign keys)
- **Partial indexes** (WHERE deleted_at IS NULL)

---

## 🚀 Migration Strategy

```sql
-- migrations/001_initial_schema.sql
-- Create all tables, indexes, functions, triggers

-- migrations/002_seed_data.sql  
-- Insert default roles, statuses, etc.

-- migrations/003_rls_policies.sql
-- Enable RLS and create policies

-- Future migrations
-- migrations/004_add_xyz_feature.sql
```

---

## 📝 Next Steps

1. Run migrations in Supabase
2. Test RLS policies
3. Create seed data for development
4. Generate TypeScript types from schema
5. Set up database backup strategy

---

**Version:** 1.0  
**Last Updated:** February 2026  
**Review Date:** After Phase 1 MVP
