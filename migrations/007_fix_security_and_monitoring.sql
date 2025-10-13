-- Migration: Fix critical security issue and enable monitoring
-- Date: October 13, 2025
-- Purpose: Enable RLS on app_user_profiles and add query monitoring

-- CRITICAL SECURITY FIX: Enable RLS on app_user_profiles
ALTER TABLE app_user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for app_user_profiles (users can only see their own profile)
CREATE POLICY user_profile_isolation ON app_user_profiles
  FOR ALL
  USING (user_id = auth.uid());

-- Enable pg_stat_statements extension for query monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Note: ALTER SYSTEM commands cannot run in Supabase SQL Editor
-- These need to be configured in Supabase Dashboard > Settings > Database
-- Recommended settings:
-- statement_timeout = 30s
-- idle_in_transaction_session_timeout = 60s
