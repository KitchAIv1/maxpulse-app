-- ============================================
-- CHECK ACTUAL COLUMNS IN plan_progress TABLE
-- Run this first to see what columns exist
-- ============================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'plan_progress'
ORDER BY ordinal_position;

