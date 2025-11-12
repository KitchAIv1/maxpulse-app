-- Achievement Verification Test Queries
-- Copy and paste these into Supabase SQL Editor
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from auth.users

-- ============================================
-- STEP 1: Get Your User ID
-- ============================================
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- ============================================
-- STEP 2: Replace USER_ID in queries below
-- ============================================

-- ============================================
-- Achievement 1: Hydration Hero (7 Days Streak)
-- ============================================
WITH daily_hydration AS (
  SELECT 
    date,
    water_oz_actual,
    water_oz_target,
    CASE 
      WHEN water_oz_actual >= water_oz_target THEN 1 
      ELSE 0 
    END as met_target
  FROM daily_metrics
  WHERE user_id = 'YOUR_USER_ID_HERE'
    AND date >= CURRENT_DATE - INTERVAL '30 days'
  ORDER BY date DESC
),
streak_calc AS (
  SELECT 
    date,
    met_target,
    SUM(CASE WHEN met_target = 0 THEN 1 ELSE 0 END) 
      OVER (ORDER BY date DESC ROWS UNBOUNDED PRECEDING) as streak_group
  FROM daily_hydration
),
streaks AS (
  SELECT 
    streak_group,
    COUNT(*) as streak_length,
    MIN(date) as streak_start,
    MAX(date) as streak_end
  FROM streak_calc
  WHERE met_target = 1
  GROUP BY streak_group
)
SELECT 
  MAX(streak_length) as max_hydration_streak,
  ROUND(MAX(streak_length)::numeric / 7.0, 4) as progress_ratio,
  CASE 
    WHEN MAX(streak_length) >= 7 THEN 'EARNED' 
    WHEN MAX(streak_length) > 0 THEN 'IN_PROGRESS' 
    ELSE 'LOCKED' 
  END as badge_status
FROM streaks;

-- ============================================
-- Achievement 2: Early Bird (5 Nights Sleep Streak)
-- ============================================
WITH daily_sleep AS (
  SELECT 
    date,
    sleep_hr_actual,
    sleep_hr_target,
    CASE 
      WHEN sleep_hr_actual >= 8.0 THEN 1 
      ELSE 0 
    END as met_target
  FROM daily_metrics
  WHERE user_id = 'YOUR_USER_ID_HERE'
    AND date >= CURRENT_DATE - INTERVAL '30 days'
  ORDER BY date DESC
),
streak_calc AS (
  SELECT 
    date,
    met_target,
    SUM(CASE WHEN met_target = 0 THEN 1 ELSE 0 END) 
      OVER (ORDER BY date DESC ROWS UNBOUNDED PRECEDING) as streak_group
  FROM daily_sleep
),
streaks AS (
  SELECT 
    streak_group,
    COUNT(*) as streak_length,
    MIN(date) as streak_start,
    MAX(date) as streak_end
  FROM streak_calc
  WHERE met_target = 1
  GROUP BY streak_group
)
SELECT 
  MAX(streak_length) as max_sleep_streak,
  ROUND(MAX(streak_length)::numeric / 5.0, 4) as progress_ratio,
  CASE 
    WHEN MAX(streak_length) >= 5 THEN 'EARNED' 
    WHEN MAX(streak_length) > 0 THEN 'IN_PROGRESS' 
    ELSE 'LOCKED' 
  END as badge_status
FROM streaks;

-- ============================================
-- Achievement 3: Step Master (10,000 Steps Today)
-- ============================================
SELECT 
  date,
  steps_actual,
  steps_target,
  CASE 
    WHEN steps_actual >= 10000 THEN 'EARNED' 
    WHEN steps_actual > 0 THEN 'IN_PROGRESS' 
    ELSE 'LOCKED' 
  END as badge_status,
  CASE 
    WHEN steps_actual >= 10000 THEN 1.0
    WHEN steps_actual > 0 THEN ROUND(steps_actual::numeric / 10000.0, 4)
    ELSE 0.0
  END as progress_ratio
FROM daily_metrics
WHERE user_id = 'YOUR_USER_ID_HERE'
  AND date = CURRENT_DATE
ORDER BY date DESC
LIMIT 1;

-- ============================================
-- Achievement 4: Balanced Life (All Targets Today)
-- ============================================
SELECT 
  date,
  steps_actual >= steps_target as steps_met,
  water_oz_actual >= water_oz_target as water_met,
  sleep_hr_actual >= sleep_hr_target as sleep_met,
  mood_checkins_actual >= mood_checkins_target as mood_met,
  CASE 
    WHEN steps_actual >= steps_target 
      AND water_oz_actual >= water_oz_target 
      AND sleep_hr_actual >= sleep_hr_target 
      AND mood_checkins_actual >= mood_checkins_target 
    THEN 'EARNED'
    ELSE 'IN_PROGRESS'
  END as badge_status,
  CASE 
    WHEN steps_actual >= steps_target 
      AND water_oz_actual >= water_oz_target 
      AND sleep_hr_actual >= sleep_hr_target 
      AND mood_checkins_actual >= mood_checkins_target 
    THEN 1.0
    ELSE 0.0
  END as progress_ratio
FROM daily_metrics
WHERE user_id = 'YOUR_USER_ID_HERE'
  AND date = CURRENT_DATE
LIMIT 1;

-- ============================================
-- Achievement 5: Consistency King (80%+ Life Score for 14 Days)
-- ============================================
WITH daily_life_scores AS (
  SELECT 
    date,
    steps_actual,
    steps_target,
    water_oz_actual,
    water_oz_target,
    sleep_hr_actual,
    sleep_hr_target,
    mood_checkins_actual,
    mood_checkins_target,
    CASE 
      WHEN steps_target > 0 THEN steps_actual::numeric / steps_target::numeric ELSE 0 END as steps_pct,
    CASE 
      WHEN water_oz_target > 0 THEN water_oz_actual::numeric / water_oz_target::numeric ELSE 0 END as water_pct,
    CASE 
      WHEN sleep_hr_target > 0 THEN sleep_hr_actual::numeric / sleep_hr_target::numeric ELSE 0 END as sleep_pct,
    CASE 
      WHEN mood_checkins_target > 0 THEN mood_checkins_actual::numeric / mood_checkins_target::numeric ELSE 0 END as mood_pct
  FROM daily_metrics
  WHERE user_id = 'YOUR_USER_ID_HERE'
    AND date >= CURRENT_DATE - INTERVAL '30 days'
),
life_scores AS (
  SELECT 
    date,
    LEAST(100, ROUND(((steps_pct + water_pct + sleep_pct + mood_pct) / 4.0 * 100)::numeric, 2)) as life_score,
    CASE 
      WHEN LEAST(100, ((steps_pct + water_pct + sleep_pct + mood_pct) / 4.0 * 100)) >= 80 THEN 1 
      ELSE 0 
    END as met_threshold
  FROM daily_life_scores
  ORDER BY date DESC
),
streak_calc AS (
  SELECT 
    date,
    life_score,
    met_threshold,
    SUM(CASE WHEN met_threshold = 0 THEN 1 ELSE 0 END) 
      OVER (ORDER BY date DESC ROWS UNBOUNDED PRECEDING) as streak_group
  FROM life_scores
),
streaks AS (
  SELECT 
    streak_group,
    COUNT(*) as streak_length,
    MIN(date) as streak_start,
    MAX(date) as streak_end,
    ROUND(AVG(life_score)::numeric, 2) as avg_life_score
  FROM streak_calc
  WHERE met_threshold = 1
  GROUP BY streak_group
)
SELECT 
  MAX(streak_length) as max_life_score_streak,
  ROUND(MAX(streak_length)::numeric / 14.0, 4) as progress_ratio,
  CASE 
    WHEN MAX(streak_length) >= 14 THEN 'EARNED' 
    WHEN MAX(streak_length) > 0 THEN 'IN_PROGRESS' 
    ELSE 'LOCKED' 
  END as badge_status
FROM streaks;

-- ============================================
-- Achievement 6: Wellness Warrior (30 Days Tracking)
-- ============================================
SELECT 
  COUNT(DISTINCT date) as total_tracking_days,
  ROUND(COUNT(DISTINCT date)::numeric / 30.0, 4) as progress_ratio,
  CASE 
    WHEN COUNT(DISTINCT date) >= 30 THEN 'EARNED' 
    WHEN COUNT(DISTINCT date) > 0 THEN 'IN_PROGRESS' 
    ELSE 'LOCKED' 
  END as badge_status
FROM daily_metrics
WHERE user_id = 'YOUR_USER_ID_HERE';

-- ============================================
-- BONUS: View All Recent Metrics (for debugging)
-- ============================================
SELECT 
  date,
  steps_actual,
  steps_target,
  water_oz_actual,
  water_oz_target,
  sleep_hr_actual,
  sleep_hr_target,
  mood_checkins_actual,
  mood_checkins_target,
  ROUND(LEAST(100, (
    (CASE WHEN steps_target > 0 THEN steps_actual::numeric / steps_target::numeric ELSE 0 END +
     CASE WHEN water_oz_target > 0 THEN water_oz_actual::numeric / water_oz_target::numeric ELSE 0 END +
     CASE WHEN sleep_hr_target > 0 THEN sleep_hr_actual::numeric / sleep_hr_target::numeric ELSE 0 END +
     CASE WHEN mood_checkins_target > 0 THEN mood_checkins_actual::numeric / mood_checkins_target::numeric ELSE 0 END
    ) / 4.0 * 100
  ))::numeric, 2) as life_score
FROM daily_metrics
WHERE user_id = 'YOUR_USER_ID_HERE'
  AND date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;

