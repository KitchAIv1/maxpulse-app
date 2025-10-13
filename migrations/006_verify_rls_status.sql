-- Migration: Verify and enable Row Level Security
-- Date: October 13, 2025
-- Purpose: Ensure RLS is enabled on all user tables

-- Check current RLS status (run this first to see current state)
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN 'RLS Enabled'
    ELSE 'RLS DISABLED - SECURITY RISK'
  END as status
FROM pg_tables 
WHERE tablename IN (
  'app_user_profiles', 
  'plan_progress', 
  'daily_metrics', 
  'hydration_logs', 
  'sleep_sessions', 
  'mood_checkins',
  'pedometer_snapshots'
)
ORDER BY rowsecurity, tablename;

-- Enable RLS on all user tables (uncomment if needed)
-- ALTER TABLE app_user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plan_progress ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sleep_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mood_checkins ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pedometer_snapshots ENABLE ROW LEVEL SECURITY;
