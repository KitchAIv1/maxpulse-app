-- ============================================
-- VERIFY AI_ANALYSIS_RESULTS TABLE (FIXED)
-- No session_id column - need to link via input_hash or assessment_type
-- ============================================

-- 1. Get all ai_analysis_results records (no session_id)
SELECT 
    id,
    assessment_type,
    input_hash,
    created_at,
    jsonb_object_keys(analysis_data) as analysis_keys
FROM ai_analysis_results
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check if transformationRoadmap is in analysis_data
SELECT 
    id,
    assessment_type,
    input_hash,
    created_at,
    analysis_data ? 'transformationRoadmap' as has_roadmap,
    jsonb_typeof(analysis_data->'transformationRoadmap') as roadmap_type
FROM ai_analysis_results
WHERE analysis_data IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 3. Get the actual transformation roadmap data
SELECT 
    id,
    assessment_type,
    input_hash,
    created_at,
    jsonb_pretty(analysis_data->'transformationRoadmap') as transformation_roadmap
FROM ai_analysis_results
WHERE analysis_data ? 'transformationRoadmap'
ORDER BY created_at DESC
LIMIT 3;

-- 4. Check all keys in analysis_data to understand structure
SELECT DISTINCT
    jsonb_object_keys(analysis_data) as data_keys
FROM ai_analysis_results
ORDER BY data_keys;

-- 5. Get sample of full analysis_data structure
SELECT 
    id,
    assessment_type,
    created_at,
    jsonb_pretty(analysis_data) as full_analysis_data
FROM ai_analysis_results
ORDER BY created_at DESC
LIMIT 1;

-- 6. Check if there's a link table between users and ai_analysis_results
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    column_name LIKE '%analysis%' 
    OR column_name LIKE '%ai_%'
    OR table_name LIKE '%analysis%'
  )
ORDER BY table_name, ordinal_position;

-- 7. Check app_user_profiles for any AI analysis reference
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'app_user_profiles'
ORDER BY ordinal_position;

-- 8. Check activation_codes for any AI analysis reference
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'activation_codes'
ORDER BY ordinal_position;

-- 9. Look for any table that might link users to ai_analysis_results
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (tc.table_name = 'ai_analysis_results' 
       OR ccu.table_name = 'ai_analysis_results')
ORDER BY tc.table_name;

-- 10. Check if onboarding_data in activation_codes has any AI analysis reference
SELECT 
    id,
    code,
    distributor_id,
    session_id,
    jsonb_object_keys(onboarding_data) as onboarding_keys
FROM activation_codes
WHERE onboarding_data IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- 11. Get full onboarding_data structure
SELECT 
    id,
    code,
    session_id,
    jsonb_pretty(onboarding_data) as onboarding_data_full
FROM activation_codes
WHERE onboarding_data IS NOT NULL
ORDER BY created_at DESC
LIMIT 1;

