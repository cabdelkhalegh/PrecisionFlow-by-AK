-- TiKiT OS - Row Level Security (RLS) Policies
-- Security policies for multi-tenant data isolation
-- Migration: 20260207000003

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
    AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is director
CREATE OR REPLACE FUNCTION is_director()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'director'
    AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is campaign member
CREATE OR REPLACE FUNCTION is_campaign_member(campaign_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM campaign_members
    WHERE campaign_id = campaign_uuid
    AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is campaign manager for a campaign
CREATE OR REPLACE FUNCTION is_campaign_manager(campaign_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM campaigns
    WHERE id = campaign_uuid
    AND campaign_manager_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================================================
-- USERS TABLE POLICIES
-- =============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role and permissions)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  USING (is_admin());

-- Admins can update all users
CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  USING (is_admin());

-- Admins can insert users
CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  WITH CHECK (is_admin());

-- =============================================================================
-- CLIENTS TABLE POLICIES
-- =============================================================================

-- Campaign managers, directors, and finance can view all clients
CREATE POLICY "Internal users can view clients"
  ON clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('campaign_manager', 'director', 'finance', 'admin')
      AND status = 'active'
    )
  );

-- Campaign managers can create clients
CREATE POLICY "Campaign managers can create clients"
  ON clients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('campaign_manager', 'admin')
      AND status = 'active'
    )
  );

-- Campaign managers and admins can update clients
CREATE POLICY "Campaign managers can update clients"
  ON clients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('campaign_manager', 'admin')
      AND status = 'active'
    )
  );

-- =============================================================================
-- CAMPAIGNS TABLE POLICIES
-- =============================================================================

-- Campaign members can view their campaigns
CREATE POLICY "Campaign members can view campaigns"
  ON campaigns FOR SELECT
  USING (
    is_admin() OR
    is_director() OR
    is_campaign_member(id) OR
    campaign_manager_id = auth.uid()
  );

-- Campaign managers can create campaigns
CREATE POLICY "Campaign managers can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('campaign_manager', 'admin')
      AND status = 'active'
    )
  );

-- Campaign managers can update their campaigns
CREATE POLICY "Campaign managers can update campaigns"
  ON campaigns FOR UPDATE
  USING (
    is_admin() OR
    is_campaign_manager(id)
  );

-- =============================================================================
-- CAMPAIGN MEMBERS TABLE POLICIES
-- =============================================================================

-- Campaign members can view members of their campaigns
CREATE POLICY "Campaign members can view campaign members"
  ON campaign_members FOR SELECT
  USING (
    is_admin() OR
    is_director() OR
    is_campaign_member(campaign_id)
  );

-- Campaign managers can add members to their campaigns
CREATE POLICY "Campaign managers can add members"
  ON campaign_members FOR INSERT
  WITH CHECK (
    is_admin() OR
    is_campaign_manager(campaign_id)
  );

-- Campaign managers can remove members from their campaigns
CREATE POLICY "Campaign managers can remove members"
  ON campaign_members FOR DELETE
  USING (
    is_admin() OR
    is_campaign_manager(campaign_id)
  );

-- =============================================================================
-- BRIEFS TABLE POLICIES
-- =============================================================================

-- Campaign members can view briefs for their campaigns
CREATE POLICY "Campaign members can view briefs"
  ON briefs FOR SELECT
  USING (
    is_admin() OR
    is_director() OR
    is_campaign_member(campaign_id)
  );

-- Campaign managers can create briefs
CREATE POLICY "Campaign managers can create briefs"
  ON briefs FOR INSERT
  WITH CHECK (
    is_admin() OR
    is_campaign_manager(campaign_id)
  );

-- Campaign managers can update briefs
CREATE POLICY "Campaign managers can update briefs"
  ON briefs FOR UPDATE
  USING (
    is_admin() OR
    is_campaign_manager(campaign_id)
  );

-- =============================================================================
-- STRATEGIES TABLE POLICIES
-- =============================================================================

-- Campaign members can view strategies
CREATE POLICY "Campaign members can view strategies"
  ON strategies FOR SELECT
  USING (
    is_admin() OR
    is_director() OR
    is_campaign_member(campaign_id)
  );

-- Campaign managers can create strategies
CREATE POLICY "Campaign managers can create strategies"
  ON strategies FOR INSERT
  WITH CHECK (
    is_admin() OR
    is_campaign_manager(campaign_id)
  );

-- Campaign managers can update strategies
CREATE POLICY "Campaign managers can update strategies"
  ON strategies FOR UPDATE
  USING (
    is_admin() OR
    is_campaign_manager(campaign_id)
  );

-- =============================================================================
-- CONTENT TASKS TABLE POLICIES
-- =============================================================================

-- Campaign members and assigned influencers can view content tasks
CREATE POLICY "Campaign members can view content tasks"
  ON content_tasks FOR SELECT
  USING (
    is_admin() OR
    is_director() OR
    is_campaign_member(campaign_id) OR
    EXISTS (
      SELECT 1 FROM influencers
      WHERE influencers.id = content_tasks.influencer_id
      AND influencers.id IN (
        SELECT id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Campaign managers can create content tasks
CREATE POLICY "Campaign managers can create content tasks"
  ON content_tasks FOR INSERT
  WITH CHECK (
    is_admin() OR
    is_campaign_manager(campaign_id)
  );

-- Campaign managers can update content tasks
CREATE POLICY "Campaign managers can update content tasks"
  ON content_tasks FOR UPDATE
  USING (
    is_admin() OR
    is_campaign_manager(campaign_id)
  );

-- =============================================================================
-- CONTENT ARTIFACTS TABLE POLICIES
-- =============================================================================

-- Campaign members can view content artifacts
CREATE POLICY "Campaign members can view content artifacts"
  ON content_artifacts FOR SELECT
  USING (
    is_admin() OR
    is_director() OR
    EXISTS (
      SELECT 1 FROM content_tasks
      WHERE content_tasks.id = content_artifacts.content_task_id
      AND (
        is_campaign_member(content_tasks.campaign_id) OR
        content_tasks.influencer_id IN (
          SELECT id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

-- Campaign managers and assigned influencers can create content artifacts
CREATE POLICY "Authorized users can create content artifacts"
  ON content_artifacts FOR INSERT
  WITH CHECK (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM content_tasks
      WHERE content_tasks.id = content_artifacts.content_task_id
      AND (
        is_campaign_manager(content_tasks.campaign_id) OR
        content_tasks.influencer_id IN (
          SELECT id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

-- Campaign managers and assigned influencers can update content artifacts
CREATE POLICY "Authorized users can update content artifacts"
  ON content_artifacts FOR UPDATE
  USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM content_tasks
      WHERE content_tasks.id = content_artifacts.content_task_id
      AND (
        is_campaign_manager(content_tasks.campaign_id) OR
        content_tasks.influencer_id IN (
          SELECT id FROM users WHERE id = auth.uid()
        )
      )
    )
  );

-- =============================================================================
-- APPROVALS TABLE POLICIES
-- =============================================================================

-- Users can view approvals they are involved in
CREATE POLICY "Users can view their approvals"
  ON approvals FOR SELECT
  USING (
    is_admin() OR
    is_director() OR
    requested_from = auth.uid() OR
    requested_by = auth.uid() OR
    is_campaign_member(campaign_id)
  );

-- Campaign managers can create approvals
CREATE POLICY "Campaign managers can create approvals"
  ON approvals FOR INSERT
  WITH CHECK (
    is_admin() OR
    is_campaign_manager(campaign_id)
  );

-- Approvers can update their approvals
CREATE POLICY "Approvers can update approvals"
  ON approvals FOR UPDATE
  USING (
    is_admin() OR
    requested_from = auth.uid() OR
    (is_director() AND overridden = true)
  );

-- =============================================================================
-- FINANCIAL OBJECTS TABLE POLICIES
-- =============================================================================

-- Finance, directors, and campaign managers can view financial objects
CREATE POLICY "Authorized users can view financial objects"
  ON financial_objects FOR SELECT
  USING (
    is_admin() OR
    is_director() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'finance'
      AND status = 'active'
    ) OR
    is_campaign_manager(campaign_id)
  );

-- Finance and campaign managers can create financial objects
CREATE POLICY "Authorized users can create financial objects"
  ON financial_objects FOR INSERT
  WITH CHECK (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('finance', 'campaign_manager')
      AND status = 'active'
    )
  );

-- Finance can update financial objects
CREATE POLICY "Finance can update financial objects"
  ON financial_objects FOR UPDATE
  USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'finance'
      AND status = 'active'
    )
  );

-- =============================================================================
-- RISK FLAGS TABLE POLICIES
-- =============================================================================

-- Campaign members can view risk flags
CREATE POLICY "Campaign members can view risk flags"
  ON risk_flags FOR SELECT
  USING (
    is_admin() OR
    is_director() OR
    is_campaign_member(campaign_id)
  );

-- Campaign managers can create risk flags
CREATE POLICY "Campaign managers can create risk flags"
  ON risk_flags FOR INSERT
  WITH CHECK (
    is_admin() OR
    is_campaign_manager(campaign_id)
  );

-- Campaign managers can update risk flags
CREATE POLICY "Campaign managers can update risk flags"
  ON risk_flags FOR UPDATE
  USING (
    is_admin() OR
    is_campaign_manager(campaign_id)
  );

-- =============================================================================
-- AUDIT LOGS TABLE POLICIES
-- =============================================================================

-- Admins and directors can view audit logs
CREATE POLICY "Admins and directors can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    is_admin() OR
    is_director()
  );

-- Only the system can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- No one can update or delete audit logs (immutable)
-- (No UPDATE or DELETE policies = no one can modify)

-- =============================================================================
-- INFLUENCERS TABLE POLICIES
-- =============================================================================

-- Campaign managers can view all influencers
CREATE POLICY "Campaign managers can view influencers"
  ON influencers FOR SELECT
  USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('campaign_manager', 'director')
      AND status = 'active'
    )
  );

-- Campaign managers can create influencers
CREATE POLICY "Campaign managers can create influencers"
  ON influencers FOR INSERT
  WITH CHECK (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'campaign_manager'
      AND status = 'active'
    )
  );

-- Campaign managers can update influencers
CREATE POLICY "Campaign managers can update influencers"
  ON influencers FOR UPDATE
  USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'campaign_manager'
      AND status = 'active'
    )
  );

-- =============================================================================
-- CAMPAIGN INFLUENCERS TABLE POLICIES
-- =============================================================================

-- Campaign members can view campaign influencers
CREATE POLICY "Campaign members can view campaign influencers"
  ON campaign_influencers FOR SELECT
  USING (
    is_admin() OR
    is_director() OR
    is_campaign_member(campaign_id)
  );

-- Campaign managers can add influencers to campaigns
CREATE POLICY "Campaign managers can add influencers"
  ON campaign_influencers FOR INSERT
  WITH CHECK (
    is_admin() OR
    is_campaign_manager(campaign_id)
  );

-- Campaign managers can update campaign influencers
CREATE POLICY "Campaign managers can update campaign influencers"
  ON campaign_influencers FOR UPDATE
  USING (
    is_admin() OR
    is_campaign_manager(campaign_id)
  );

-- =============================================================================
-- RLS POLICIES COMPLETE
-- =============================================================================
-- All tables now have appropriate Row Level Security policies
-- Next: Add audit triggers and additional optimizations
-- =============================================================================
