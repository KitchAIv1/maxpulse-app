-- Migration: Add critical performance indexes (Supabase compatible)
-- Date: October 13, 2025
-- Purpose: Add foreign key and composite indexes for query performance
-- Note: Removed CONCURRENTLY for Supabase SQL Editor compatibility

-- Foreign key indexes (CRITICAL for JOIN performance)
CREATE INDEX IF NOT EXISTS idx_app_user_profiles_user_id 
  ON app_user_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_plan_progress_user_id 
  ON plan_progress(user_id);
  
CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_id 
  ON daily_metrics(user_id);
  
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_id 
  ON hydration_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_sleep_sessions_user_id 
  ON sleep_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_mood_checkins_user_id 
  ON mood_checkins(user_id);

CREATE INDEX IF NOT EXISTS idx_pedometer_snapshots_user_id 
  ON pedometer_snapshots(user_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_date 
  ON daily_metrics(user_id, date DESC);
  
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_date 
  ON hydration_logs(user_id, DATE(ts));

CREATE INDEX IF NOT EXISTS idx_sleep_sessions_user_date 
  ON sleep_sessions(user_id, DATE(start_ts));

CREATE INDEX IF NOT EXISTS idx_mood_checkins_user_date 
  ON mood_checkins(user_id, DATE(timestamp));

CREATE INDEX IF NOT EXISTS idx_pedometer_snapshots_user_ts 
  ON pedometer_snapshots(user_id, ts DESC);

-- Sorting indexes for common ORDER BY patterns
CREATE INDEX IF NOT EXISTS idx_hydration_logs_created_at 
  ON hydration_logs(created_at DESC);
  
CREATE INDEX IF NOT EXISTS idx_mood_checkins_timestamp 
  ON mood_checkins(timestamp DESC);

-- Activation code lookup optimization
CREATE INDEX IF NOT EXISTS idx_app_user_profiles_activation_code 
  ON app_user_profiles(activation_code_id);
