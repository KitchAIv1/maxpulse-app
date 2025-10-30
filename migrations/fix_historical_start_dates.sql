-- ============================================
-- FIX HISTORICAL START_DATES
-- Manually calculate correct start_date for each user
-- ============================================

-- For users with current_week > 1, calculate their actual start date
-- start_date = today - (current_week - 1) weeks

UPDATE plan_progress 
SET start_date = CURRENT_DATE - ((current_week - 1) * 7) * INTERVAL '1 day'
WHERE current_week > 1;

-- Verify the fix
SELECT 
    user_id,
    current_week,
    current_phase,
    start_date,
    updated_at
FROM plan_progress
ORDER BY current_week DESC, updated_at DESC;

