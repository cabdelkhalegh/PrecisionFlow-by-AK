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
