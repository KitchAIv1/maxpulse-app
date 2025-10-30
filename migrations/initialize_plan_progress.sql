-- ============================================
-- INITIALIZE PLAN PROGRESS FOR EXISTING USERS
-- Run this to set up plan_progress for users who don't have it yet
-- ============================================

-- Option 1: Insert for ALL authenticated users who don't have plan_progress
-- Uses column defaults where possible for simplicity
INSERT INTO plan_progress (user_id)
SELECT au.id
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM plan_progress pp WHERE pp.user_id = au.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Option 2: Or insert for a specific user (uses defaults)
-- INSERT INTO plan_progress (user_id)
-- VALUES ('7c7548a4-012a-4680-aa0f-c0fe60c2b4d1')
-- ON CONFLICT (user_id) DO NOTHING;

-- Verify the insert
SELECT 
    user_id,
    current_week,
    current_phase,
    week_extensions,
    updated_at
FROM plan_progress
ORDER BY updated_at DESC
LIMIT 10;

