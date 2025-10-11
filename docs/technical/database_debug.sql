-- Database Debug Queries
-- Run these in Supabase SQL Editor to verify data structure and content

-- ============================================================================
-- 1. CHECK ACTIVATION CODES TABLE STRUCTURE AND DATA
-- ============================================================================

-- Check if activation_codes table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'activation_codes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check activation codes data (first 3 records)
SELECT 
    id,
    code,
    customer_name,
    customer_email,
    status,
    plan_type,
    activated_at,
    expires_at,
    -- Show first 200 chars of onboarding_data to see structure
    LEFT(onboarding_data::text, 200) as onboarding_data_preview
FROM activation_codes 
ORDER BY created_at DESC 
LIMIT 3;

-- Check if onboarding_data contains personalizedTargets
SELECT 
    code,
    customer_email,
    status,
    -- Extract personalizedTargets from onboarding_data
    onboarding_data->'personalizedTargets' as personalized_targets,
    -- Check if it has the expected structure
    onboarding_data->'personalizedTargets'->'steps'->'targetDaily' as steps_target,
    onboarding_data->'personalizedTargets'->'hydration'->'targetLiters' as hydration_target,
    onboarding_data->'personalizedTargets'->'sleep'->'targetMinHours' as sleep_min,
    onboarding_data->'personalizedTargets'->'sleep'->'targetMaxHours' as sleep_max
FROM activation_codes 
WHERE status = 'activated'
ORDER BY activated_at DESC 
LIMIT 5;

-- ============================================================================
-- 2. CHECK APP USER PROFILES TABLE
-- ============================================================================

-- Check app_user_profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'app_user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check user profiles data
SELECT 
    user_id,
    email,
    name,
    activation_code_id,
    distributor_id,
    plan_type,
    created_at
FROM app_user_profiles 
ORDER BY created_at DESC;

-- ============================================================================
-- 3. CHECK DAILY METRICS TABLE
-- ============================================================================

-- Check daily_metrics table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'daily_metrics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if daily_metrics table has any data
SELECT 
    user_id,
    date,
    steps_target,
    water_oz_target,
    sleep_hr_target,
    steps_actual,
    water_oz_actual,
    sleep_hr_actual,
    life_score,
    created_at
FROM daily_metrics 
ORDER BY date DESC, created_at DESC
LIMIT 10;

-- Check today's metrics specifically
SELECT 
    user_id,
    date,
    steps_target,
    water_oz_target,
    sleep_hr_target,
    steps_actual,
    water_oz_actual,
    sleep_hr_actual,
    life_score
FROM daily_metrics 
WHERE date = CURRENT_DATE;

-- ============================================================================
-- 4. CHECK PLAN PROGRESS TABLE
-- ============================================================================

-- Check plan_progress table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'plan_progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check plan progress data
SELECT 
    user_id,
    current_week,
    current_phase,
    weekly_scores,
    updated_at
FROM plan_progress 
ORDER BY updated_at DESC;

-- ============================================================================
-- 5. CHECK AUTH USERS
-- ============================================================================

-- Check current authenticated users
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- ============================================================================
-- 6. VERIFY DATA RELATIONSHIPS
-- ============================================================================

-- Check user profile to activation code relationship
SELECT 
    aup.user_id,
    aup.email as profile_email,
    aup.activation_code_id,
    ac.code,
    ac.customer_email as activation_email,
    ac.status,
    -- Check if emails match
    CASE 
        WHEN aup.email = ac.customer_email THEN 'MATCH' 
        ELSE 'MISMATCH' 
    END as email_match
FROM app_user_profiles aup
LEFT JOIN activation_codes ac ON aup.activation_code_id = ac.id;

-- Check for missing daily_metrics for existing users
SELECT 
    aup.user_id,
    aup.email,
    aup.created_at as profile_created,
    dm.date as metrics_date,
    dm.steps_target,
    dm.water_oz_target,
    dm.sleep_hr_target
FROM app_user_profiles aup
LEFT JOIN daily_metrics dm ON aup.user_id = dm.user_id AND dm.date = CURRENT_DATE;

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================

/*
If everything is working correctly, you should see:

1. activation_codes table with onboarding_data containing personalizedTargets
2. app_user_profiles records linked to activation codes
3. daily_metrics records with proper targets for today
4. plan_progress records for 90-day tracking
5. Matching emails between profiles and activation codes

If any of these are missing or malformed, that explains the "N/A" values.
*/
