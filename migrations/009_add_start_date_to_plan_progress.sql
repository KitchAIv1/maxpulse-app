-- ============================================
-- ADD START_DATE COLUMN TO PLAN_PROGRESS
-- This fixes week date range calculations for assessments
-- ============================================

-- Add start_date column to plan_progress
ALTER TABLE plan_progress 
ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;

-- Create index for date range queries
CREATE INDEX IF NOT EXISTS idx_plan_progress_start_date 
    ON plan_progress(user_id, start_date);

-- Update existing rows with a reasonable default
-- Calculate start_date as (current_week - 1) weeks ago
UPDATE plan_progress 
SET start_date = CURRENT_DATE - ((current_week - 1) * 7) * INTERVAL '1 day'
WHERE start_date IS NULL;

-- Verify the update
SELECT 
    user_id,
    current_week,
    current_phase,
    start_date,
    updated_at
FROM plan_progress
ORDER BY updated_at DESC
LIMIT 10;

