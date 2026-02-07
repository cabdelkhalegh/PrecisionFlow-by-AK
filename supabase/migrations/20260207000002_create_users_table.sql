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
