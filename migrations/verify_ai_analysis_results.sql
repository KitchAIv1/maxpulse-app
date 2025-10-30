-- ============================================
-- VERIFY AI_ANALYSIS_RESULTS TABLE
-- This is where the 90-day plan from assessment is stored
-- ============================================

-- 1. Check the structure of ai_analysis_results table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'ai_analysis_results'
ORDER BY ordinal_position;

-- 2. Get all ai_analysis_results records
SELECT 
    id,
    session_id,
    distributor_id,
    created_at,
    jsonb_object_keys(analysis_data) as analysis_keys
FROM ai_analysis_results
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check if transformationRoadmap is in analysis_data
SELECT 
    id,
    session_id,
    created_at,
    analysis_data ? 'transformationRoadmap' as has_roadmap,
    jsonb_typeof(analysis_data->'transformationRoadmap') as roadmap_type
FROM ai_analysis_results
WHERE analysis_data IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 4. Get the actual transformation roadmap data
SELECT 
    id,
    session_id,
    created_at,
    jsonb_pretty(analysis_data->'transformationRoadmap') as transformation_roadmap
FROM ai_analysis_results
WHERE analysis_data ? 'transformationRoadmap'
ORDER BY created_at DESC
LIMIT 3;

-- 5. Check phases in the roadmap
SELECT 
    aar.id,
    aar.session_id,
    aar.created_at,
    phase->>'name' as phase_name,
    phase->>'phase' as phase_number,
    phase->>'weeks' as weeks_range,
    jsonb_array_length(phase->'weeklyMilestones') as milestone_count
FROM ai_analysis_results aar,
     jsonb_array_elements(aar.analysis_data->'transformationRoadmap'->'phases') as phase
WHERE aar.analysis_data ? 'transformationRoadmap'
ORDER BY aar.created_at DESC, (phase->>'phase')::int
LIMIT 20;

-- 6. Link user to their ai_analysis_results via activation_code
SELECT 
    aup.user_id,
    aup.activation_code_id,
    ac.code,
    ac.session_id,
    aar.id as analysis_id,
    aar.analysis_data ? 'transformationRoadmap' as has_roadmap
FROM app_user_profiles aup
JOIN activation_codes ac ON ac.id = aup.activation_code_id
LEFT JOIN ai_analysis_results aar ON aar.session_id = ac.session_id
WHERE aup.user_id = '7c7548a4-012a-4680-aa0f-c0fe60c2b4d1';

-- 7. Get the full 90-day plan for specific user
SELECT 
    aup.user_id,
    pp.current_week,
    pp.current_phase,
    jsonb_pretty(aar.analysis_data->'transformationRoadmap') as user_90day_plan
FROM app_user_profiles aup
JOIN activation_codes ac ON ac.id = aup.activation_code_id
JOIN ai_analysis_results aar ON aar.session_id = ac.session_id
JOIN plan_progress pp ON pp.user_id = aup.user_id
WHERE aup.user_id = '7c7548a4-012a-4680-aa0f-c0fe60c2b4d1'
  AND aar.analysis_data ? 'transformationRoadmap';

-- 8. Get specific week targets from the roadmap
SELECT 
    aup.user_id,
    pp.current_week,
    pp.current_phase,
    aar.analysis_data->'transformationRoadmap'->'phases'->((pp.current_phase - 1))->'weeklyMilestones'->((pp.current_week - 1)) as current_week_data
FROM app_user_profiles aup
JOIN activation_codes ac ON ac.id = aup.activation_code_id
JOIN ai_analysis_results aar ON aar.session_id = ac.session_id
JOIN plan_progress pp ON pp.user_id = aup.user_id
WHERE aup.user_id = '7c7548a4-012a-4680-aa0f-c0fe60c2b4d1'
  AND aar.analysis_data ? 'transformationRoadmap';

-- 9. Check all keys in analysis_data to understand structure
SELECT 
    id,
    session_id,
    jsonb_object_keys(analysis_data) as data_keys
FROM ai_analysis_results
ORDER BY created_at DESC
LIMIT 5;

-- 10. Get sample of full analysis_data structure
SELECT 
    id,
    session_id,
    created_at,
    jsonb_pretty(analysis_data) as full_analysis_data
FROM ai_analysis_results
ORDER BY created_at DESC
LIMIT 1;

