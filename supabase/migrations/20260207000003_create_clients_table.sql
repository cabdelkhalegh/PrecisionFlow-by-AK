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
