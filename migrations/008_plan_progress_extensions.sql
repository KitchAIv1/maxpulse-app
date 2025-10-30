-- Extend plan_progress table with assessment tracking columns
-- Add minimal columns needed for weekly assessment scheduling and tracking

-- Add new columns to existing plan_progress table
ALTER TABLE plan_progress 
ADD COLUMN IF NOT EXISTS last_assessment_date DATE,
ADD COLUMN IF NOT EXISTS week_extensions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS assessment_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS progression_decisions JSONB DEFAULT '[]'::jsonb;

-- Add constraints for data integrity
ALTER TABLE plan_progress 
ADD CONSTRAINT check_week_extensions_positive 
    CHECK (week_extensions >= 0 AND week_extensions <= 5);

-- Add comment for documentation
COMMENT ON COLUMN plan_progress.last_assessment_date IS 'Date of the most recent weekly assessment';
COMMENT ON COLUMN plan_progress.week_extensions IS 'Number of times current week has been extended (max 5)';
COMMENT ON COLUMN plan_progress.assessment_history IS 'Array of assessment summary objects for tracking';
COMMENT ON COLUMN plan_progress.progression_decisions IS 'Array of user progression decisions for analytics';

-- Create index for assessment date queries
CREATE INDEX IF NOT EXISTS idx_plan_progress_last_assessment 
    ON plan_progress(user_id, last_assessment_date);

-- Update existing rows to have default values
UPDATE plan_progress 
SET 
    last_assessment_date = NULL,
    week_extensions = 0,
    assessment_history = '[]'::jsonb,
    progression_decisions = '[]'::jsonb
WHERE 
    last_assessment_date IS NULL 
    OR week_extensions IS NULL 
    OR assessment_history IS NULL 
    OR progression_decisions IS NULL;
