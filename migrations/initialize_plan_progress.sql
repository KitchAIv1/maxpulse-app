-- ============================================
-- INITIALIZE PLAN PROGRESS FOR EXISTING USERS
-- Run this to set up plan_progress for users who don't have it yet
-- ============================================

-- Insert plan_progress for users who have activation codes but no plan_progress
INSERT INTO plan_progress (
    user_id,
    current_week,
    current_phase,
    start_date,
    weekly_scores,
    last_assessment_date,
    week_extensions,
    assessment_history,
    progression_decisions,
    updated_at
)
SELECT 
    ac.user_id,
    1 AS current_week,  -- Start at week 1
    1 AS current_phase, -- Start at phase 1
    CURRENT_DATE AS start_date,
    '{}'::jsonb AS weekly_scores,
    NULL AS last_assessment_date,
    0 AS week_extensions,
    '[]'::jsonb AS assessment_history,
    '[]'::jsonb AS progression_decisions,
    NOW() AS updated_at
FROM activation_codes ac
WHERE ac.user_id IS NOT NULL
AND ac.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM plan_progress pp WHERE pp.user_id = ac.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- Verify the insert
SELECT 
    user_id,
    current_week,
    current_phase,
    start_date,
    week_extensions
FROM plan_progress
ORDER BY created_at DESC
LIMIT 10;

