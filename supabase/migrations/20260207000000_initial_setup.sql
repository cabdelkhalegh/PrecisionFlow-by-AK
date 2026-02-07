-- TiKiT OS - Initial Database Setup
-- Extensions, Enums, and Base Configuration
-- Migration: 20260207000000

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram matching for fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gin";      -- GIN indexes for better performance

-- =============================================================================
-- ENUMS - Type definitions for state machines and roles
-- =============================================================================

-- User Roles
CREATE TYPE user_role AS ENUM (
  'campaign_manager',   -- CM: Campaign ownership and execution
  'director',           -- DIR: Governance and exceptions
  'finance',            -- FIN: Financial tracking and closure
  'admin',              -- ADM: System configuration
  'client',             -- CLIENT: Brief, shortlist, and content approvals
  'influencer'          -- INF: Content creation and publishing
);

-- User Status
CREATE TYPE user_status AS ENUM (
  'active',
  'inactive',
  'suspended'
);

-- Campaign Lifecycle States
CREATE TYPE campaign_state AS ENUM (
  'brief_upload',               -- Initial state
  'brief_ai_processing',        -- AI parsing raw brief
  'brief_review',               -- CM reviewing structured brief
  'brief_internal_approval',    -- DIR approval
  'brief_client_approval',      -- CLIENT approval
  'strategy_generation',        -- AI generating strategy
  'strategy_review',            -- CM reviewing strategy
  'creator_sourcing',           -- Building influencer shortlist
  'creator_client_approval',    -- CLIENT approving shortlist
  'creator_contracting',        -- Negotiating and signing contracts
  'content_production',         -- Creating content
  'content_approval',           -- Internal + client approval
  'publishing',                 -- Content going live
  'live_monitoring',            -- Tracking KPIs
  'closeout_prep',              -- Preparing closure
  'closeout_complete',          -- Post-mortem and learning
  'archived'                    -- Campaign completed and locked
);

-- Campaign Risk Level
CREATE TYPE risk_level AS ENUM (
  'low',      -- 0-3 missing items
  'medium',   -- 4-7 missing items
  'high',     -- 8+ missing items or critical gaps
  'critical'  -- Blocking issues
);

-- Brief Status
CREATE TYPE brief_status AS ENUM (
  'uploaded',
  'ai_processing',
  'ai_complete',
  'review',
  'approved',
  'rejected'
);

-- Strategy Status
CREATE TYPE strategy_status AS ENUM (
  'draft',
  'ai_generated',
  'review',
  'approved',
  'rejected'
);

-- Content Artifact Type
CREATE TYPE content_artifact_type AS ENUM (
  'script',
  'video_draft',
  'final_content'
);

-- Content Artifact State
CREATE TYPE content_artifact_state AS ENUM (
  'draft',
  'pending_approval',
  'revisions_requested',
  'approved',
  'published',
  'archived'
);

-- Approval Type
CREATE TYPE approval_type AS ENUM (
  'brief_internal',
  'brief_client',
  'strategy',
  'creator_shortlist',
  'content_script',
  'content_draft',
  'content_final',
  'budget_revision'
);

-- Approval Status
CREATE TYPE approval_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'overridden'
);

-- Financial Object Type
CREATE TYPE financial_object_type AS ENUM (
  'budget',
  'budget_revision',
  'expense',
  'invoice',
  'payment'
);

-- Financial Object Status
CREATE TYPE financial_object_status AS ENUM (
  'draft',
  'pending_approval',
  'approved',
  'paid',
  'cancelled'
);

-- Risk Flag Severity
CREATE TYPE risk_severity AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- Risk Flag Status
CREATE TYPE risk_flag_status AS ENUM (
  'open',
  'acknowledged',
  'mitigated',
  'resolved',
  'accepted'
);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    user_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    COALESCE(NEW.updated_by, OLD.updated_by, auth.uid())
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- BASE CONFIGURATION COMPLETE
-- =============================================================================
-- Next migrations will create:
-- - Core tables (users, clients, campaigns, etc.)
-- - Indexes for performance
-- - Row Level Security (RLS) policies
-- - Triggers for audit trails
-- =============================================================================
