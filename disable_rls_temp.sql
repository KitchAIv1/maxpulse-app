-- Temporary SQL to disable RLS on app_user_profiles for development
-- Run this in your Supabase SQL Editor to fix the immediate issue

-- Disable RLS on app_user_profiles table
ALTER TABLE app_user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be causing conflicts
DROP POLICY IF EXISTS "App users can view own profile" ON app_user_profiles;
DROP POLICY IF EXISTS "App users can insert own profile" ON app_user_profiles;
DROP POLICY IF EXISTS "App users can insert profile" ON app_user_profiles;
DROP POLICY IF EXISTS "App users can update own profile" ON app_user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON app_user_profiles;

-- Note: This is for development only. In production, you should re-enable RLS with proper policies.
