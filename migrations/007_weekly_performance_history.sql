-- Create weekly_performance_history table for detailed weekly tracking
-- This table stores comprehensive weekly assessment data for the adaptive mastery progression system

CREATE TABLE IF NOT EXISTS weekly_performance_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    week_number INTEGER NOT NULL,
    phase_number INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Performance metrics (0-100 percentages)
    steps_achievement_avg DECIMAL(5,2) NOT NULL DEFAULT 0,
    water_achievement_avg DECIMAL(5,2) NOT NULL DEFAULT 0,
    sleep_achievement_avg DECIMAL(5,2) NOT NULL DEFAULT 0,
    mood_achievement_avg DECIMAL(5,2) NOT NULL DEFAULT 0,
    overall_achievement_avg DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- Consistency metrics
    consistency_days INTEGER NOT NULL DEFAULT 0,
    total_tracking_days INTEGER NOT NULL DEFAULT 0,
    
    -- Assessment results
    progression_recommendation TEXT NOT NULL CHECK (progression_recommendation IN ('advance', 'extend', 'reset')),
    user_decision TEXT CHECK (user_decision IN ('accepted', 'override_advance', 'coach_consultation')),
    decision_reasoning TEXT[],
    
    -- Target information at time of assessment
    targets_at_assessment JSONB,
    
    -- Pillar analysis
    strongest_pillar TEXT CHECK (strongest_pillar IN ('steps', 'water', 'sleep', 'mood')),
    weakest_pillar TEXT CHECK (weakest_pillar IN ('steps', 'water', 'sleep', 'mood')),
    
    -- Metadata
    assessed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, week_number),
    CHECK (week_number >= 1 AND week_number <= 12),
    CHECK (phase_number >= 1 AND phase_number <= 3),
    CHECK (consistency_days <= total_tracking_days),
    CHECK (steps_achievement_avg >= 0 AND steps_achievement_avg <= 100),
    CHECK (water_achievement_avg >= 0 AND water_achievement_avg <= 100),
    CHECK (sleep_achievement_avg >= 0 AND sleep_achievement_avg <= 100),
    CHECK (mood_achievement_avg >= 0 AND mood_achievement_avg <= 100),
    CHECK (overall_achievement_avg >= 0 AND overall_achievement_avg <= 100)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weekly_performance_user_id 
    ON weekly_performance_history(user_id);
    
CREATE INDEX IF NOT EXISTS idx_weekly_performance_week_phase 
    ON weekly_performance_history(user_id, week_number, phase_number);
    
CREATE INDEX IF NOT EXISTS idx_weekly_performance_assessed_at 
    ON weekly_performance_history(assessed_at);

-- Enable Row Level Security
ALTER TABLE weekly_performance_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - users can only access their own data
CREATE POLICY "Users can manage their own weekly performance history" 
    ON weekly_performance_history
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON weekly_performance_history TO authenticated;
GRANT USAGE ON SEQUENCE weekly_performance_history_id_seq TO authenticated;
