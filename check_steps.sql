-- Check current steps in database for today
SELECT 
  date,
  steps_actual,
  steps_target,
  updated_at
FROM daily_metrics
WHERE user_id = '7c7548a4-012a-4680-aa0f-c0fe60c2b4d1'
  AND date = '2025-10-23'
ORDER BY date DESC;
