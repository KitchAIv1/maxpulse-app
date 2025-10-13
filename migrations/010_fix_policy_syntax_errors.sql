-- Migration: Fix RLS policy syntax errors
-- Date: October 13, 2025
-- Purpose: Fix the two policies that had syntax errors

-- Fix product_bundles admin write policy (separate policies for each operation)
DROP POLICY IF EXISTS product_bundles_admin_write ON product_bundles;

CREATE POLICY product_bundles_admin_insert ON product_bundles
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY product_bundles_admin_update ON product_bundles
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY product_bundles_admin_delete ON product_bundles
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Fix lifestyle_messaging admin write policy (separate policies for each operation)
DROP POLICY IF EXISTS lifestyle_messaging_admin_write ON lifestyle_messaging_templates;

CREATE POLICY lifestyle_messaging_admin_insert ON lifestyle_messaging_templates
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY lifestyle_messaging_admin_update ON lifestyle_messaging_templates
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY lifestyle_messaging_admin_delete ON lifestyle_messaging_templates
  FOR DELETE
  USING (auth.jwt() ->> 'role' = 'service_role');
