-- ============================================
-- SCHEMA VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to check your database state
-- ============================================

-- 1. Check if weekly_performance_history table exists
SELECT 
    'weekly_performance_history table' AS check_name,
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'weekly_performance_history'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status;

-- 2. Check all columns in weekly_performance_history
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'weekly_performance_history'
ORDER BY ordinal_position;

-- 3. Check if plan_progress extensions exist
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'plan_progress'
AND column_name IN ('last_assessment_date', 'week_extensions', 'assessment_history', 'progression_decisions')
ORDER BY column_name;

-- 4. Check RLS policies on weekly_performance_history
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'weekly_performance_history';

-- 5. Check table permissions
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' 
AND table_name = 'weekly_performance_history'
AND grantee = 'authenticated';

-- 6. Check if there's a mismatch in column names (case sensitivity or typos)
SELECT 
    table_name,
    column_name
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'weekly_performance_history'
AND column_name LIKE '%consistency%';

-- 7. Try to describe the exact error by checking schema cache
SELECT 
    n.nspname AS schema_name,
    c.relname AS table_name,
    a.attname AS column_name,
    t.typname AS data_type
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_attribute a ON a.attrelid = c.oid
JOIN pg_type t ON t.oid = a.atttypid
WHERE n.nspname = 'public'
AND c.relname = 'weekly_performance_history'
AND a.attnum > 0
AND NOT a.attisdropped
ORDER BY a.attnum;

-- 8. Check if PostgREST schema cache needs refresh
-- (This is informational - you may need to refresh the API)
SELECT 
    'PostgREST Schema Cache' AS info,
    'If columns exist but API says they dont, go to Supabase Dashboard > Settings > API > Reload schema cache' AS action;

-- 9. Test insert to see exact error
-- (Commented out - uncomment to test with your user_id)
/*
INSERT INTO weekly_performance_history (
    user_id,
    week_number,
    phase_number,
    start_date,
    end_date,
    steps_achievement_avg,
    water_achievement_avg,
    sleep_achievement_avg,
    mood_achievement_avg,
    overall_achievement_avg,
    consistency_days,
    total_tracking_days,
    progression_recommendation
) VALUES (
    'YOUR_USER_ID_HERE'::uuid,
    1,
    1,
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE,
    75.5,
    80.0,
    70.0,
    85.0,
    77.5,
    5,
    7,
    'advance'
);
*/

-- 10. Check for any conflicting table definitions
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename LIKE '%weekly%performance%'
OR tablename LIKE '%plan%progress%';

