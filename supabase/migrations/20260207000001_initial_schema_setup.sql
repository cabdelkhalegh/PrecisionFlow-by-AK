-- Migration: 00001_initial_schema_setup
-- Description: Create base functions and triggers for TiKiT OS
-- Created: 2026-02-07

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log audit trail
CREATE OR REPLACE FUNCTION public.log_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  changed_fields JSONB;
BEGIN
  -- Convert OLD and NEW to JSONB
  IF TG_OP = 'DELETE' THEN
    old_data = to_jsonb(OLD);
    new_data = NULL;
  ELSIF TG_OP = 'INSERT' THEN
    old_data = NULL;
    new_data = to_jsonb(NEW);
  ELSE
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
  END IF;

  -- Calculate changed fields for UPDATE operations
  IF TG_OP = 'UPDATE' THEN
    SELECT jsonb_object_agg(key, value)
    INTO changed_fields
    FROM jsonb_each(new_data)
    WHERE value IS DISTINCT FROM old_data->key;
  END IF;

  -- Insert audit log
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    operation,
    old_data,
    new_data,
    changed_fields,
    user_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    old_data,
    new_data,
    changed_fields,
    auth.uid()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.set_updated_at() IS 'Automatically updates the updated_at timestamp';
COMMENT ON FUNCTION public.log_audit_trail() IS 'Logs all database mutations to audit_logs table';
