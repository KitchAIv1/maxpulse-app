-- Database Verification Queries
-- Use these queries to verify database operations and data integrity

-- ============================================================================
-- DAILY METRICS VERIFICATION
-- ============================================================================

-- Check today's metrics for a specific user
SELECT 
    user_id,
    date,
    steps_actual,
    steps_target,
    water_oz_actual,
    water_oz_target,
    sleep_hr_actual,
    sleep_hr_target,
    mood_checkins_actual,
    mood_checkins_target,
    life_score,
    finalized
FROM daily_metrics 
WHERE user_id = 'USER_ID_HERE' 
AND date = CURRENT_DATE;

-- Check if daily metrics are being created properly
SELECT 
    date,
    COUNT(*) as user_count,
    AVG(life_score) as avg_life_score,
    AVG(steps_actual) as avg_steps,
    AVG(water_oz_actual) as avg_hydration
FROM daily_metrics 
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY date
ORDER BY date DESC;

-- ============================================================================
-- HYDRATION LOGS VERIFICATION
-- ============================================================================

-- Check today's hydration logs for a user
SELECT 
    ts,
    amount_oz,
    source,
    created_at
FROM hydration_logs 
WHERE user_id = 'USER_ID_HERE' 
AND DATE(ts) = CURRENT_DATE
ORDER BY ts DESC;

-- Verify hydration totals match daily metrics
SELECT 
    dm.user_id,
    dm.date,
    dm.water_oz_actual as metrics_total,
    COALESCE(SUM(hl.amount_oz), 0) as logs_total,
    dm.water_oz_actual - COALESCE(SUM(hl.amount_oz), 0) as difference
FROM daily_metrics dm
LEFT JOIN hydration_logs hl ON dm.user_id = hl.user_id 
    AND dm.date = DATE(hl.ts)
WHERE dm.date = CURRENT_DATE
GROUP BY dm.user_id, dm.date, dm.water_oz_actual
HAVING dm.water_oz_actual != COALESCE(SUM(hl.amount_oz), 0);

-- ============================================================================
-- MOOD CHECK-INS VERIFICATION
-- ============================================================================

-- Check recent mood check-ins for a user
SELECT 
    timestamp,
    mood_level,
    notes,
    journal_entry,
    health_context,
    created_at
FROM mood_checkins 
WHERE user_id = 'USER_ID_HERE' 
AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY timestamp DESC;

-- Verify mood check-in counts
SELECT 
    user_id,
    DATE(timestamp) as check_date,
    COUNT(*) as checkin_count
FROM mood_checkins 
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY user_id, DATE(timestamp)
ORDER BY check_date DESC;

-- ============================================================================
-- STEP TRACKING VERIFICATION
-- ============================================================================

-- Check recent step snapshots
SELECT 
    ts,
    steps,
    source,
    created_at
FROM pedometer_snapshots 
WHERE user_id = 'USER_ID_HERE' 
AND DATE(ts) = CURRENT_DATE
ORDER BY ts DESC
LIMIT 10;

-- Check for step tracking gaps (more than 1 hour between snapshots)
SELECT 
    user_id,
    ts as snapshot_time,
    LAG(ts) OVER (ORDER BY ts) as previous_time,
    EXTRACT(EPOCH FROM (ts - LAG(ts) OVER (ORDER BY ts)))/3600 as hours_gap
FROM pedometer_snapshots 
WHERE user_id = 'USER_ID_HERE' 
AND DATE(ts) = CURRENT_DATE
HAVING EXTRACT(EPOCH FROM (ts - LAG(ts) OVER (ORDER BY ts)))/3600 > 1
ORDER BY ts;

-- ============================================================================
-- USER PROFILE VERIFICATION
-- ============================================================================

-- Check user profile completeness
SELECT 
    user_id,
    email,
    name,
    age,
    gender,
    activation_code_id,
    distributor_id,
    plan_type,
    created_at
FROM app_user_profiles 
WHERE user_id = 'USER_ID_HERE';

-- Check activation code linkage
SELECT 
    aup.user_id,
    aup.email,
    aup.name,
    ac.code,
    ac.status,
    ac.activated_at,
    ac.plan_type
FROM app_user_profiles aup
JOIN activation_codes ac ON aup.activation_code_id = ac.id
WHERE aup.user_id = 'USER_ID_HERE';

-- ============================================================================
-- DATA INTEGRITY CHECKS
-- ============================================================================

-- Check for orphaned records
SELECT 'hydration_logs' as table_name, COUNT(*) as orphaned_count
FROM hydration_logs hl
LEFT JOIN app_user_profiles aup ON hl.user_id = aup.user_id
WHERE aup.user_id IS NULL

UNION ALL

SELECT 'mood_checkins' as table_name, COUNT(*) as orphaned_count
FROM mood_checkins mc
LEFT JOIN app_user_profiles aup ON mc.user_id = aup.user_id
WHERE aup.user_id IS NULL

UNION ALL

SELECT 'pedometer_snapshots' as table_name, COUNT(*) as orphaned_count
FROM pedometer_snapshots ps
LEFT JOIN app_user_profiles aup ON ps.user_id = aup.user_id
WHERE aup.user_id IS NULL;

-- Check for missing daily metrics
SELECT 
    aup.user_id,
    aup.email,
    generate_series(
        CURRENT_DATE - INTERVAL '7 days',
        CURRENT_DATE,
        INTERVAL '1 day'
    )::date as expected_date
FROM app_user_profiles aup
EXCEPT
SELECT 
    dm.user_id,
    dm.date
FROM daily_metrics dm;

-- ============================================================================
-- PERFORMANCE MONITORING
-- ============================================================================

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
AND tablename IN ('daily_metrics', 'hydration_logs', 'mood_checkins', 'pedometer_snapshots')
ORDER BY tablename, attname;

-- Check recent activity
SELECT 
    'daily_metrics' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_rows,
    MAX(created_at) as last_insert
FROM daily_metrics

UNION ALL

SELECT 
    'hydration_logs' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_rows,
    MAX(created_at) as last_insert
FROM hydration_logs

UNION ALL

SELECT 
    'mood_checkins' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_rows,
    MAX(created_at) as last_insert
FROM mood_checkins;

-- ============================================================================
-- USAGE INSTRUCTIONS
-- ============================================================================

/*
To use these queries:

1. Replace 'USER_ID_HERE' with actual user IDs from your auth.users table
2. Run individual sections based on what you want to verify
3. For automated testing, create a script that runs these queries and checks expected results

Example usage:
-- Get a real user ID first
SELECT id, email FROM auth.users LIMIT 1;

-- Then use that ID in the verification queries above
*/
