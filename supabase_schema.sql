-- MaxPulse Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- App User Profiles Table (for MaxPulse app clients, separate from distributor user_profiles)
CREATE TABLE IF NOT EXISTS app_user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    height_cm INTEGER NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    bmi DECIMAL(4,1) NOT NULL,
    medical_conditions TEXT[] DEFAULT '{}',
    medical_allergies TEXT[] DEFAULT '{}',
    medical_medications TEXT[] DEFAULT '{}',
    mental_health_data JSONB,
    activation_code_id TEXT NOT NULL,
    distributor_id TEXT,
    session_id TEXT NOT NULL,
    plan_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan Progress Table (for 90-day transformation tracking)
CREATE TABLE IF NOT EXISTS plan_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    current_week INTEGER DEFAULT 1,
    current_phase INTEGER DEFAULT 1,
    weekly_scores JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Metrics Table (already exists in your schema, but adding for completeness)
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    steps_target INTEGER NOT NULL DEFAULT 8000,
    steps_actual INTEGER NOT NULL DEFAULT 0,
    water_oz_target INTEGER NOT NULL DEFAULT 80,
    water_oz_actual INTEGER NOT NULL DEFAULT 0,
    sleep_hr_target DECIMAL(3,1) NOT NULL DEFAULT 8.0,
    sleep_hr_actual DECIMAL(3,1) NOT NULL DEFAULT 0,
    mood_checkins_target INTEGER NOT NULL DEFAULT 7,
    mood_checkins_actual INTEGER NOT NULL DEFAULT 0,
    life_score INTEGER GENERATED ALWAYS AS (
        ROUND(
            (LEAST(steps_actual::FLOAT / steps_target, 1.0) * 25) +
            (LEAST(water_oz_actual::FLOAT / water_oz_target, 1.0) * 25) +
            (LEAST(sleep_hr_actual::FLOAT / sleep_hr_target, 1.0) * 25) +
            (LEAST(mood_checkins_actual::FLOAT / mood_checkins_target, 1.0) * 25)
        )
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Hydration Logs Table (already exists, but adding for completeness)
CREATE TABLE IF NOT EXISTS hydration_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    oz DECIMAL(4,1) NOT NULL,
    source TEXT DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sleep Sessions Table (already exists, but adding for completeness)
CREATE TABLE IF NOT EXISTS sleep_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    start_ts TIMESTAMPTZ NOT NULL,
    end_ts TIMESTAMPTZ NOT NULL,
    duration_hr DECIMAL(4,2) GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (end_ts - start_ts)) / 3600
    ) STORED,
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    source TEXT DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pedometer Snapshots Table (already exists, but adding for completeness)
CREATE TABLE IF NOT EXISTS pedometer_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    steps INTEGER NOT NULL,
    source TEXT DEFAULT 'device',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mood Check-ins Table
CREATE TABLE IF NOT EXISTS mood_checkins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mood_level INTEGER NOT NULL CHECK (mood_level >= 1 AND mood_level <= 5),
    notes TEXT,
    journal_entry TEXT,
    health_context JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards Ledger Table (already exists, but adding for completeness)
CREATE TABLE IF NOT EXISTS rewards_ledger (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    points INTEGER NOT NULL,
    reason TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges Table (already exists, but adding for completeness)
CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    points_required INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Badges Table (already exists, but adding for completeness)
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Device Connections Table (already exists, but adding for completeness)
CREATE TABLE IF NOT EXISTS device_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL,
    health_source TEXT NOT NULL,
    is_connected BOOLEAN NOT NULL DEFAULT FALSE,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform, health_source)
);

-- Row Level Security (RLS) Policies
ALTER TABLE app_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedometer_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "App users can view own profile" ON app_user_profiles;
DROP POLICY IF EXISTS "App users can insert own profile" ON app_user_profiles;
DROP POLICY IF EXISTS "App users can update own profile" ON app_user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON app_user_profiles;

-- RLS Policies for app_user_profiles
CREATE POLICY "App users can view own profile" ON app_user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "App users can insert profile" ON app_user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "App users can update own profile" ON app_user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for plan_progress
CREATE POLICY "Users can view own plan progress" ON plan_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plan progress" ON plan_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plan progress" ON plan_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for daily_metrics
CREATE POLICY "Users can view own daily metrics" ON daily_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily metrics" ON daily_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily metrics" ON daily_metrics
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for hydration_logs
CREATE POLICY "Users can view own hydration logs" ON hydration_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hydration logs" ON hydration_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for sleep_sessions
CREATE POLICY "Users can view own sleep sessions" ON sleep_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep sessions" ON sleep_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pedometer_snapshots
CREATE POLICY "Users can view own pedometer data" ON pedometer_snapshots
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pedometer data" ON pedometer_snapshots
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mood_checkins
CREATE POLICY "Users can view own mood checkins" ON mood_checkins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood checkins" ON mood_checkins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for rewards_ledger
CREATE POLICY "Users can view own rewards" ON rewards_ledger
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rewards" ON rewards_ledger
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_badges
CREATE POLICY "Users can view own badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for device_connections
CREATE POLICY "Users can view own device connections" ON device_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own device connections" ON device_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own device connections" ON device_connections
    FOR UPDATE USING (auth.uid() = user_id);

-- Badges are public for reading
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_user_profiles_user_id ON app_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_app_user_profiles_activation_code_id ON app_user_profiles(activation_code_id);
CREATE INDEX IF NOT EXISTS idx_plan_progress_user_id ON plan_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_id_date ON daily_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_id_ts ON hydration_logs(user_id, ts);
CREATE INDEX IF NOT EXISTS idx_sleep_sessions_user_id_start_ts ON sleep_sessions(user_id, start_ts);
CREATE INDEX IF NOT EXISTS idx_pedometer_snapshots_user_id_ts ON pedometer_snapshots(user_id, ts);
CREATE INDEX IF NOT EXISTS idx_mood_checkins_user_id_timestamp ON mood_checkins(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_rewards_ledger_user_id_date ON rewards_ledger(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_device_connections_user_id ON device_connections(user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_app_user_profiles_updated_at BEFORE UPDATE ON app_user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_progress_updated_at BEFORE UPDATE ON plan_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_metrics_updated_at BEFORE UPDATE ON daily_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_connections_updated_at BEFORE UPDATE ON device_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
