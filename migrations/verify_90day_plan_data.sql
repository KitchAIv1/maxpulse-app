-- ============================================
-- VERIFY 90-DAY PLAN DATA FOR USER
-- Run this to check what transformation roadmap data exists
-- ============================================

-- 1. Check if user has an activation code with onboarding data
SELECT 
    ac.code,
    ac.distributor_id,
    ac.session_id,
    ac.created_at,
    ac.onboarding_data->>'transformationRoadmap' as has_roadmap,
    jsonb_pretty(ac.onboarding_data->'transformationRoadmap'->'phases') as phases_data
FROM activation_codes ac
WHERE ac.session_id IS NOT NULL
ORDER BY ac.created_at DESC
LIMIT 5;

-- 2. Check specific user's activation code (replace with actual user_id if known)
-- Note: activation_codes doesn't have user_id, but we can check via session_id
SELECT 
    ac.code,
    ac.distributor_id,
    ac.session_id,
    ac.onboarding_data->'transformationRoadmap'->'phases' as roadmap_phases,
    ac.onboarding_data->'transformationRoadmap'->'overallTimeline' as timeline
FROM activation_codes ac
WHERE ac.session_id = 'YOUR_SESSION_ID_HERE'
LIMIT 1;

-- 3. Check if there's a link between users and activation codes
-- (via app_user_profiles or another table)
SELECT 
    aup.user_id,
    aup.activation_code,
    ac.onboarding_data->>'transformationRoadmap' as has_roadmap
FROM app_user_profiles aup
LEFT JOIN activation_codes ac ON ac.code = aup.activation_code
WHERE aup.user_id = '7c7548a4-012a-4680-aa0f-c0fe60c2b4d1'
LIMIT 1;

-- 4. Get detailed week-by-week targets from the roadmap
SELECT 
    ac.code,
    phase->>'name' as phase_name,
    phase->>'phase' as phase_number,
    phase->>'weeks' as weeks_range,
    jsonb_array_length(phase->'weeklyMilestones') as milestone_count,
    phase->'weeklyMilestones' as weekly_milestones
FROM activation_codes ac,
     jsonb_array_elements(ac.onboarding_data->'transformationRoadmap'->'phases') as phase
WHERE ac.session_id IS NOT NULL
ORDER BY ac.created_at DESC, (phase->>'phase')::int
LIMIT 20;

-- 5. Check plan_progress for the specific user
SELECT 
    pp.user_id,
    pp.current_week,
    pp.current_phase,
    pp.week_extensions,
    pp.last_assessment_date,
    pp.updated_at
FROM plan_progress pp
WHERE pp.user_id = '7c7548a4-012a-4680-aa0f-c0fe60c2b4d1';

-- 6. Get the actual weekly targets being used by V2 Engine
-- This shows what the V2EngineConnector is reading
SELECT 
    aup.user_id,
    pp.current_week,
    pp.current_phase,
    ac.onboarding_data->'transformationRoadmap'->'phases'->((pp.current_phase - 1))->'weeklyMilestones'->((pp.current_week - 1)) as current_week_milestone
FROM app_user_profiles aup
JOIN activation_codes ac ON ac.code = aup.activation_code
JOIN plan_progress pp ON pp.user_id = aup.user_id
WHERE aup.user_id = '7c7548a4-012a-4680-aa0f-c0fe60c2b4d1';

-- 7. Verify the structure of onboarding_data
SELECT 
    ac.code,
    jsonb_object_keys(ac.onboarding_data) as top_level_keys
FROM activation_codes ac
WHERE ac.onboarding_data IS NOT NULL
LIMIT 1;

-- 8. Check if transformationRoadmap exists and its structure
SELECT 
    ac.code,
    ac.onboarding_data ? 'transformationRoadmap' as has_roadmap_key,
    jsonb_typeof(ac.onboarding_data->'transformationRoadmap') as roadmap_type,
    jsonb_object_keys(ac.onboarding_data->'transformationRoadmap') as roadmap_keys
FROM activation_codes ac
WHERE ac.onboarding_data IS NOT NULL
  AND ac.onboarding_data ? 'transformationRoadmap'
LIMIT 1;

