# Achievements Verification Test Plan

## 🎯 Objective
Verify that achievement progress calculations match actual database data using SQL queries and console logs.

---

## 📊 Test Queries (Run in Supabase SQL Editor)

### 1. **Hydration Hero** - 7 Days Streak
```sql
-- Get hydration streak for a specific user
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
  MAX(streak_length)::float / 7.0 as progress_ratio,
  CASE 
    WHEN MAX(streak_length) >= 7 THEN 'EARNED' 
    WHEN MAX(streak_length) > 0 THEN 'IN_PROGRESS' 
    ELSE 'LOCKED' 
  END as badge_status
FROM streaks;
```

### 2. **Early Bird** - 5 Nights Sleep Streak
```sql
-- Get sleep streak (8+ hours for 5 nights)
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
  MAX(streak_length)::float / 5.0 as progress_ratio,
  CASE 
    WHEN MAX(streak_length) >= 5 THEN 'EARNED' 
    WHEN MAX(streak_length) > 0 THEN 'IN_PROGRESS' 
    ELSE 'LOCKED' 
  END as badge_status
FROM streaks;
```

### 3. **Step Master** - 10,000 Steps in One Day
```sql
-- Check if user reached 10,000 steps today or any day
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
    WHEN steps_actual > 0 THEN steps_actual::float / 10000.0
    ELSE 0.0
  END as progress_ratio
FROM daily_metrics
WHERE user_id = 'YOUR_USER_ID_HERE'
  AND date = CURRENT_DATE
ORDER BY date DESC
LIMIT 1;
```

### 4. **Balanced Life** - All Targets in One Day
```sql
-- Check if user hit all targets today
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
```

### 5. **Consistency King** - 80%+ Life Score for 14 Days
```sql
-- Calculate Life Score streak
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
      WHEN steps_target > 0 THEN steps_actual::float / steps_target::float ELSE 0 END as steps_pct,
    CASE 
      WHEN water_oz_target > 0 THEN water_oz_actual::float / water_oz_target::float ELSE 0 END as water_pct,
    CASE 
      WHEN sleep_hr_target > 0 THEN sleep_hr_actual::float / sleep_hr_target::float ELSE 0 END as sleep_pct,
    CASE 
      WHEN mood_checkins_target > 0 THEN mood_checkins_actual::float / mood_checkins_target::float ELSE 0 END as mood_pct
  FROM daily_metrics
  WHERE user_id = 'YOUR_USER_ID_HERE'
    AND date >= CURRENT_DATE - INTERVAL '30 days'
),
life_scores AS (
  SELECT 
    date,
    LEAST(100, ((steps_pct + water_pct + sleep_pct + mood_pct) / 4.0 * 100)) as life_score,
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
    AVG(life_score) as avg_life_score
  FROM streak_calc
  WHERE met_threshold = 1
  GROUP BY streak_group
)
SELECT 
  MAX(streak_length) as max_life_score_streak,
  MAX(streak_length)::float / 14.0 as progress_ratio,
  CASE 
    WHEN MAX(streak_length) >= 14 THEN 'EARNED' 
    WHEN MAX(streak_length) > 0 THEN 'IN_PROGRESS' 
    ELSE 'LOCKED' 
  END as badge_status
FROM streaks;
```

### 6. **Wellness Warrior** - 30 Days of Tracking
```sql
-- Count total unique tracking days
SELECT 
  COUNT(DISTINCT date) as total_tracking_days,
  COUNT(DISTINCT date)::float / 30.0 as progress_ratio,
  CASE 
    WHEN COUNT(DISTINCT date) >= 30 THEN 'EARNED' 
    WHEN COUNT(DISTINCT date) > 0 THEN 'IN_PROGRESS' 
    ELSE 'LOCKED' 
  END as badge_status
FROM daily_metrics
WHERE user_id = 'YOUR_USER_ID_HERE';
```

### 7. **Get User ID** (Helper Query)
```sql
-- Get your user ID from auth.users
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🔍 Console Log Verification

The AchievementEngine now logs detailed information. Look for these logs in your console:

### Expected Log Format:
```
🎯 [AchievementEngine] Calculating progress for: hydration_week
📊 [AchievementEngine] Streak calculation:
   - Period: 30 days
   - Date range: 2025-10-04 to 2025-11-03
   - Metrics found: 15
   - Max streak: 3 days
   - Progress: 0.43 (3/7)
   - Status: IN_PROGRESS
```

---

## 📝 Testing Steps

1. **Get Your User ID**
   - Run query #7 in Supabase SQL Editor
   - Copy your user ID

2. **Update Test Queries**
   - Replace `'YOUR_USER_ID_HERE'` with your actual user ID in all queries

3. **Run SQL Queries**
   - Execute each query (1-6) in Supabase SQL Editor
   - Note the results (progress_ratio, badge_status)

4. **Check Console Logs**
   - Open the app
   - Navigate to Wellbeing Dashboard (Life Score modal)
   - Open browser/Expo console
   - Look for `[AchievementEngine]` logs

5. **Compare Results**
   - SQL `progress_ratio` should match console `progress` (within 0.01)
   - SQL `badge_status` should match console `earned` status

---

## ✅ Expected Matches

| Achievement | SQL progress_ratio | Console progress | Match? |
|------------|-------------------|------------------|--------|
| Hydration Hero | 0.43 | 0.43 | ✅ |
| Early Bird | 0.60 | 0.60 | ✅ |
| Step Master | 1.00 | 1.00 | ✅ |
| Balanced Life | 0.00 | 0.00 | ✅ |
| Consistency King | 0.21 | 0.21 | ✅ |
| Wellness Warrior | 0.50 | 0.50 | ✅ |

---

## 🐛 Troubleshooting

### If Progress Doesn't Match:

1. **Check Date Range**
   - SQL uses `CURRENT_DATE - INTERVAL '30 days'`
   - Engine uses JavaScript date calculation
   - Ensure timezone is consistent

2. **Check Data Availability**
   - Verify `daily_metrics` has data for the date range
   - Check if targets are set correctly

3. **Check Calculation Logic**
   - SQL uses same logic as Engine
   - Compare step-by-step calculations

4. **Check Console Logs**
   - Ensure detailed logging is enabled
   - Check for any error messages

---

## 📊 Sample Output Comparison

### SQL Output:
```json
{
  "max_hydration_streak": 3,
  "progress_ratio": 0.42857142857142855,
  "badge_status": "IN_PROGRESS"
}
```

### Console Output:
```
🎯 [AchievementEngine] hydration_week
📊 Max streak: 3 days
📊 Progress: 0.43
✅ Status: IN_PROGRESS
```

### Match: ✅ (0.4285 ≈ 0.43)

---

**Ready to test!** Follow the steps above and compare SQL results with console logs.

