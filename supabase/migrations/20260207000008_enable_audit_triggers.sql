-- Migration: 00008_enable_audit_triggers
-- Description: Enable audit trail triggers on all tables
-- Created: 2026-02-07

-- Add audit trail triggers to all main tables

CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_clients
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_campaigns
  AFTER INSERT OR UPDATE OR DELETE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_briefs
  AFTER INSERT OR UPDATE OR DELETE ON public.briefs
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_trail();

CREATE TRIGGER audit_approvals
  AFTER INSERT OR UPDATE OR DELETE ON public.approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_trail();

-- Note: Add more audit triggers as new tables are created

COMMENT ON TRIGGER audit_users ON public.users IS 'Logs all changes to users table';
COMMENT ON TRIGGER audit_clients ON public.clients IS 'Logs all changes to clients table';
COMMENT ON TRIGGER audit_campaigns ON public.campaigns IS 'Logs all changes to campaigns table';
COMMENT ON TRIGGER audit_briefs ON public.briefs IS 'Logs all changes to briefs table';
COMMENT ON TRIGGER audit_approvals ON public.approvals IS 'Logs all changes to approvals table';
