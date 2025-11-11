-- Fix Critical Security Issue: Security Definer Views
-- Drop views that were implicitly using SECURITY DEFINER behavior
-- These views are not used in the application code - the app uses
-- proper SECURITY DEFINER functions instead (get_monthly_proposta_trends, get_proposta_status_breakdown)

DROP VIEW IF EXISTS public.proposta_stats_by_month CASCADE;
DROP VIEW IF EXISTS public.proposta_stats_by_status CASCADE;

-- Note: The application already uses secure SECURITY DEFINER functions 
-- for this functionality:
-- - get_monthly_proposta_trends(_empresa_id uuid)
-- - get_proposta_status_breakdown(_empresa_id uuid)
-- These functions properly enforce empresa_id isolation and are safe.