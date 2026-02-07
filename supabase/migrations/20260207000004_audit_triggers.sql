-- TiKiT OS - Audit Triggers
-- Automatic audit logging for all critical tables
-- Migration: 20260207000004

-- =============================================================================
-- CREATE AUDIT TRIGGERS FOR ALL TABLES
-- =============================================================================

-- Users table audit
CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Clients table audit
CREATE TRIGGER audit_clients
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Campaigns table audit (CRITICAL)
CREATE TRIGGER audit_campaigns
  AFTER INSERT OR UPDATE OR DELETE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Campaign members table audit
CREATE TRIGGER audit_campaign_members
  AFTER INSERT OR UPDATE OR DELETE ON campaign_members
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Influencers table audit
CREATE TRIGGER audit_influencers
  AFTER INSERT OR UPDATE OR DELETE ON influencers
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Campaign influencers table audit
CREATE TRIGGER audit_campaign_influencers
  AFTER INSERT OR UPDATE OR DELETE ON campaign_influencers
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Briefs table audit (CRITICAL)
CREATE TRIGGER audit_briefs
  AFTER INSERT OR UPDATE OR DELETE ON briefs
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Strategies table audit
CREATE TRIGGER audit_strategies
  AFTER INSERT OR UPDATE OR DELETE ON strategies
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Content tasks table audit
CREATE TRIGGER audit_content_tasks
  AFTER INSERT OR UPDATE OR DELETE ON content_tasks
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Content artifacts table audit (CRITICAL)
CREATE TRIGGER audit_content_artifacts
  AFTER INSERT OR UPDATE OR DELETE ON content_artifacts
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Approvals table audit (CRITICAL)
CREATE TRIGGER audit_approvals
  AFTER INSERT OR UPDATE OR DELETE ON approvals
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Financial objects table audit (CRITICAL)
CREATE TRIGGER audit_financial_objects
  AFTER INSERT OR UPDATE OR DELETE ON financial_objects
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Risk flags table audit
CREATE TRIGGER audit_risk_flags
  AFTER INSERT OR UPDATE OR DELETE ON risk_flags
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- =============================================================================
-- CAMPAIGN STATE CHANGE LOGGING
-- =============================================================================

-- Function to log campaign state changes with extra context
CREATE OR REPLACE FUNCTION log_campaign_state_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if state actually changed
  IF (TG_OP = 'UPDATE' AND OLD.state IS DISTINCT FROM NEW.state) THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      user_id,
      metadata
    ) VALUES (
      'campaigns',
      NEW.id,
      'STATE_CHANGE',
      jsonb_build_object('state', OLD.state),
      jsonb_build_object('state', NEW.state),
      auth.uid(),
      jsonb_build_object(
        'old_state', OLD.state,
        'new_state', NEW.state,
        'campaign_name', NEW.name,
        'campaign_manager_id', NEW.campaign_manager_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for campaign state changes
CREATE TRIGGER log_campaign_state_changes
  AFTER UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION log_campaign_state_change();

-- =============================================================================
-- APPROVAL DECISION LOGGING
-- =============================================================================

-- Function to log approval decisions
CREATE OR REPLACE FUNCTION log_approval_decision()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status changed
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      user_id,
      metadata
    ) VALUES (
      'approvals',
      NEW.id,
      'APPROVAL_DECISION',
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      auth.uid(),
      jsonb_build_object(
        'approval_type', NEW.approval_type,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'entity_type', NEW.entity_type,
        'entity_id', NEW.entity_id,
        'overridden', NEW.overridden
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for approval decisions
CREATE TRIGGER log_approval_decisions
  AFTER UPDATE ON approvals
  FOR EACH ROW
  EXECUTE FUNCTION log_approval_decision();

-- =============================================================================
-- FINANCIAL TRANSACTION LOGGING
-- =============================================================================

-- Function to log financial changes
CREATE OR REPLACE FUNCTION log_financial_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    user_id,
    metadata
  ) VALUES (
    'financial_objects',
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('DELETE', 'UPDATE') THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    auth.uid(),
    jsonb_build_object(
      'campaign_id', COALESCE(NEW.campaign_id, OLD.campaign_id),
      'object_type', COALESCE(NEW.object_type, OLD.object_type),
      'amount', COALESCE(NEW.amount, OLD.amount),
      'currency', COALESCE(NEW.currency, OLD.currency),
      'status', COALESCE(NEW.status, OLD.status)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: financial_objects already has generic audit trigger,
-- this adds extra context for financial tracking

-- =============================================================================
-- BUDGET TRACKING
-- =============================================================================

-- Function to update campaign budget totals when financial objects change
CREATE OR REPLACE FUNCTION update_campaign_budget()
RETURNS TRIGGER AS $$
DECLARE
  total_spent DECIMAL(12, 2);
BEGIN
  -- Calculate total expenses for the campaign
  SELECT COALESCE(SUM(amount), 0)
  INTO total_spent
  FROM financial_objects
  WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id)
  AND object_type IN ('expense', 'payment')
  AND status != 'cancelled';
  
  -- Update campaign metadata with spending
  UPDATE campaigns
  SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{total_spent}',
    to_jsonb(total_spent)
  )
  WHERE id = COALESCE(NEW.campaign_id, OLD.campaign_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update campaign budget
CREATE TRIGGER update_campaign_budget_on_financial_change
  AFTER INSERT OR UPDATE OR DELETE ON financial_objects
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_budget();

-- =============================================================================
-- RISK SCORE CALCULATION
-- =============================================================================

-- Function to recalculate campaign risk score
CREATE OR REPLACE FUNCTION update_campaign_risk_score()
RETURNS TRIGGER AS $$
DECLARE
  high_count INTEGER;
  critical_count INTEGER;
  total_count INTEGER;
  new_risk_level risk_level;
  new_risk_score INTEGER;
BEGIN
  -- Count risk flags by severity for the campaign
  SELECT
    COUNT(*) FILTER (WHERE severity = 'high'),
    COUNT(*) FILTER (WHERE severity = 'critical'),
    COUNT(*)
  INTO high_count, critical_count, total_count
  FROM risk_flags
  WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id)
  AND status = 'open';
  
  -- Calculate risk score
  new_risk_score := total_count + (high_count * 2) + (critical_count * 5);
  
  -- Determine risk level
  IF critical_count > 0 THEN
    new_risk_level := 'critical';
  ELSIF total_count >= 8 OR high_count >= 3 THEN
    new_risk_level := 'high';
  ELSIF total_count >= 4 THEN
    new_risk_level := 'medium';
  ELSE
    new_risk_level := 'low';
  END IF;
  
  -- Update campaign
  UPDATE campaigns
  SET 
    risk_level = new_risk_level,
    risk_score = new_risk_score
  WHERE id = COALESCE(NEW.campaign_id, OLD.campaign_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update risk score when risk flags change
CREATE TRIGGER update_campaign_risk_on_flag_change
  AFTER INSERT OR UPDATE OR DELETE ON risk_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_risk_score();

-- =============================================================================
-- CONTENT TASK STATUS TRACKING
-- =============================================================================

-- Function to update content task status based on artifacts
CREATE OR REPLACE FUNCTION update_content_task_status()
RETURNS TRIGGER AS $$
DECLARE
  has_approved_script BOOLEAN;
  has_approved_final BOOLEAN;
  task_status TEXT;
BEGIN
  -- Check for approved artifacts
  SELECT
    EXISTS (
      SELECT 1 FROM content_artifacts
      WHERE content_task_id = COALESCE(NEW.content_task_id, OLD.content_task_id)
      AND artifact_type = 'script'
      AND state = 'approved'
    ),
    EXISTS (
      SELECT 1 FROM content_artifacts
      WHERE content_task_id = COALESCE(NEW.content_task_id, OLD.content_task_id)
      AND artifact_type = 'final_content'
      AND state = 'approved'
    )
  INTO has_approved_script, has_approved_final;
  
  -- Determine task status
  IF has_approved_final THEN
    task_status := 'approved';
  ELSIF has_approved_script THEN
    task_status := 'filming';
  END IF;
  
  -- Update content task if status should change
  IF task_status IS NOT NULL THEN
    UPDATE content_tasks
    SET status = task_status
    WHERE id = COALESCE(NEW.content_task_id, OLD.content_task_id)
    AND status != task_status;  -- Only update if different
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update content task status
CREATE TRIGGER update_task_status_on_artifact_change
  AFTER INSERT OR UPDATE ON content_artifacts
  FOR EACH ROW
  EXECUTE FUNCTION update_content_task_status();

-- =============================================================================
-- AUDIT TRIGGERS COMPLETE
-- =============================================================================
-- All tables now have automatic audit logging
-- Campaign state changes, approvals, and financial transactions are tracked
-- Risk scores and task statuses are automatically calculated
-- =============================================================================
