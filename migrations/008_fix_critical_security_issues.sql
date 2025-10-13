-- Migration: Fix critical security issues identified by Supabase linter
-- Date: October 13, 2025
-- Purpose: Enable RLS on all public tables and fix security definer views

-- =============================================================================
-- FIX 1: Enable RLS on all public tables that are missing it
-- =============================================================================

-- Enable RLS on badges table (has policies but RLS disabled)
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Enable RLS on other public tables
ALTER TABLE qa_validation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifestyle_messaging_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_performance_tracking ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- FIX 2: Create appropriate RLS policies for tables that need them
-- =============================================================================

-- Badges: Public read access (badges are typically public data)
CREATE POLICY badges_public_read ON badges
  FOR SELECT
  USING (true);

-- QA tables: Admin/service role only access
CREATE POLICY qa_validation_runs_admin_only ON qa_validation_runs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY qa_anomalies_admin_only ON qa_anomalies
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Product bundles: Public read, admin write
CREATE POLICY product_bundles_public_read ON product_bundles
  FOR SELECT
  USING (true);

CREATE POLICY product_bundles_admin_write ON product_bundles
  FOR INSERT, UPDATE, DELETE
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Lifestyle messaging: Public read, admin write
CREATE POLICY lifestyle_messaging_public_read ON lifestyle_messaging_templates
  FOR SELECT
  USING (true);

CREATE POLICY lifestyle_messaging_admin_write ON lifestyle_messaging_templates
  FOR INSERT, UPDATE, DELETE
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Bundle performance: Admin only
CREATE POLICY bundle_performance_admin_only ON bundle_performance_tracking
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================================================
-- FIX 3: Address SECURITY DEFINER views (requires manual review)
-- =============================================================================

-- NOTE: The following views have SECURITY DEFINER and need manual review:
-- - daily_analytics_summary
-- - distributor_performance
--
-- These views bypass RLS and run with creator permissions.
-- To fix, either:
-- 1. DROP and recreate without SECURITY DEFINER, OR
-- 2. Ensure they have proper access controls
--
-- Example fix (uncomment if you want to recreate without SECURITY DEFINER):
-- DROP VIEW IF EXISTS daily_analytics_summary;
-- DROP VIEW IF EXISTS distributor_performance;
--
-- Then recreate the views without SECURITY DEFINER property
