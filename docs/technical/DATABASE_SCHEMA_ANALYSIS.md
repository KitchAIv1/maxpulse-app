# Database Schema Analysis - MaxPulse Calendar & Tracking System

**Date:** October 12, 2025  
**Status:** 🚨 **CRITICAL ISSUES IDENTIFIED**

---

## 🔍 Executive Summary

After analyzing the MaxPulse app's calendar tracking feature and database integration, **2 CRITICAL ISSUES** have been identified that prevent proper historical data tracking and personalized target storage:

### **Issue #1: Previous Dates Not Showing Tracking Data** ❌
**Root Cause:** Daily metrics rows are **NOT being created automatically** for each day. The app only creates a `daily_metrics` row for **TODAY** when the user first launches the app. Past dates never get rows created unless explicitly initialized.

### **Issue #2: Wrong Targets (8000, 80, 8) in Database** ❌
**Root Cause:** Database schema has **hardcoded DEFAULT values** (8000 steps, 80oz water, 8hr sleep) that override personalized targets from V2 Engine when no explicit value is provided.

---

## 📊 Current Database Schema

### `daily_metrics` Table Structure
```sql
CREATE TABLE daily_metrics (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    date DATE NOT NULL,
    steps_target INTEGER NOT NULL DEFAULT 8000,      -- ❌ HARDCODED DEFAULT
    steps_actual INTEGER NOT NULL DEFAULT 0,
    water_oz_target INTEGER NOT NULL DEFAULT 80,     -- ❌ HARDCODED DEFAULT
    water_oz_actual INTEGER NOT NULL DEFAULT 0,
    sleep_hr_target DECIMAL(3,1) NOT NULL DEFAULT 8.0, -- ❌ HARDCODED DEFAULT
    sleep_hr_actual DECIMAL(3,1) NOT NULL DEFAULT 0,
    mood_checkins_target INTEGER NOT NULL DEFAULT 7,
    mood_checkins_actual INTEGER NOT NULL DEFAULT 0,
    life_score INTEGER GENERATED ALWAYS AS (...) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)  -- ✅ Composite unique constraint
);
```

---

## 🔄 Current Data Flow

### **Frontend → Database Write Flow**

#### **Today's Tracking (Oct 12)**
```
User Action (e.g., +8oz Water)
    ↓
1. Update AsyncStorage (@todayState_2025-10-12)
    ↓
2. Update UI (optimistic)
    ↓
3. Queue database sync (background)
    ↓
4. Insert into `hydration_logs` table
    ↓
5. Update `daily_metrics.water_oz_actual` (for today only!)
```

**✅ WORKS** for today  
**❌ FAILS** for past dates (no rows exist!)

---

#### **Past Date Tracking (Oct 11)**
```
User navigates to Oct 11
    ↓
1. Query: SELECT * FROM daily_metrics WHERE user_id = ? AND date = '2025-10-11'
    ↓
2. Result: NULL (no row exists for Oct 11)
    ↓
3. App displays: 0 steps, 0 water, 0 sleep
    ↓
4. User thinks: "I didn't track anything on Oct 11"
    ↓
BUT ACTUALLY: The row was never created!
```

**❌ PROBLEM:** Past dates show 0 because rows don't exist, NOT because user didn't track!

---

## 🧪 Database Verification Queries

### **Check if daily_metrics rows exist for past 7 days:**
```sql
SELECT 
    user_id,
    date,
    steps_target,
    steps_actual,
    water_oz_target,
    water_oz_actual,
    sleep_hr_target,
    sleep_hr_actual
FROM daily_metrics
WHERE user_id = '7c7548a4-012a-4680-aa0f-c0fe60c2b4d1'
    AND date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC;
```

**Expected Result (if working correctly):**
```
| date       | steps_target | water_oz_target | sleep_hr_target |
|------------|--------------|-----------------|-----------------|
| 2025-10-12 | 6250         | 51              | 6.6             | ← V2 Engine
| 2025-10-11 | 6250         | 51              | 6.6             | ← Should exist
| 2025-10-10 | 6250         | 51              | 6.6             | ← Should exist
```

**Actual Result (current broken state):**
```
| date       | steps_target | water_oz_target | sleep_hr_target |
|------------|--------------|-----------------|-----------------|
| 2025-10-12 | 6250         | 51              | 6.6             | ← Only today exists!
```

---

### **Check hydration_logs for past dates:**
```sql
SELECT 
    DATE(ts) as log_date,
    COUNT(*) as log_count,
    SUM(oz) as total_oz
FROM hydration_logs
WHERE user_id = '7c7548a4-012a-4680-aa0f-c0fe60c2b4d1'
    AND ts >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(ts)
ORDER BY log_date DESC;
```

**This will show if user DID track water on past dates, even though daily_metrics shows 0!**

---

## 🐛 Root Cause Analysis

### **Problem #1: No Automatic Daily Metrics Row Creation**

#### **Current Behavior:**
- `daily_metrics` row is ONLY created when:
  1. User signs up (via `DatabaseInitializer.initializeUserData()`)
  2. App launches and calls `HealthDataService.initializeDailyMetrics()` for **TODAY only**

#### **Missing:**
- **No daily CRON job or scheduled task** to create rows for each new day
- **No retroactive row creation** when user navigates to a past date
- **No row creation** when granular logs (hydration_logs, sleep_sessions) are inserted

#### **Impact:**
```
Oct 11: User tracked 72oz water → hydration_logs has data ✅
Oct 11: daily_metrics has no row ❌
Oct 11: Calendar shows 0oz water ❌ WRONG!

Oct 12: App creates row on startup ✅
Oct 12: User tracks 48oz water → daily_metrics updated ✅
Oct 12: Calendar shows 48oz water ✅ CORRECT!
```

---

### **Problem #2: Hardcoded DEFAULT Values Override Personalized Targets**

#### **Current Schema:**
```sql
steps_target INTEGER NOT NULL DEFAULT 8000,
water_oz_target INTEGER NOT NULL DEFAULT 80,
sleep_hr_target DECIMAL(3,1) NOT NULL DEFAULT 8.0,
```

#### **What Happens:**
1. V2 Engine calculates personalized targets: `{steps: 6250, waterOz: 51, sleepHr: 6.6}`
2. Frontend initializes daily_metrics for Oct 12 with these values ✅
3. Oct 11 row doesn't exist, so calendar reads from database query
4. Database returns `NULL` because no row exists
5. Frontend shows 0 (NULL handling)

BUT if we create a row without explicit target values:
```sql
INSERT INTO daily_metrics (user_id, date, steps_actual, water_oz_actual)
VALUES ('user_id', '2025-10-11', 0, 72);
-- steps_target will be 8000 (DEFAULT) ❌ WRONG!
-- water_oz_target will be 80 (DEFAULT) ❌ WRONG!
```

#### **Impact:**
- If we auto-create rows for past dates, they'll have wrong targets (8000, 80, 8)
- Life score calculations will be incorrect
- Progress percentages will be wrong
- User sees: "72oz / 80oz = 90%" instead of "72oz / 51oz = 141%" (exceeds target!)

---

## 🛠️ Required Backend Fixes

### **Fix #1: Remove Hardcoded DEFAULT Values**

#### **Option A: Make Targets Optional (Recommended)**
```sql
ALTER TABLE daily_metrics
ALTER COLUMN steps_target DROP NOT NULL,
ALTER COLUMN water_oz_target DROP NOT NULL,
ALTER COLUMN sleep_hr_target DROP NOT NULL,
ALTER COLUMN steps_target DROP DEFAULT,
ALTER COLUMN water_oz_target DROP DEFAULT,
ALTER COLUMN sleep_hr_target DROP DEFAULT;
```

**Benefits:**
- No more wrong default targets
- Frontend must explicitly provide targets
- NULL targets clearly indicate "not initialized"

**Drawbacks:**
- Requires NULL handling in queries
- Life score formula needs adjustment for NULL targets

---

#### **Option B: Use Personalized Defaults from Activation Code**
```sql
-- Keep NOT NULL, but remove hardcoded defaults
-- Frontend MUST provide targets on every insert
ALTER TABLE daily_metrics
ALTER COLUMN steps_target DROP DEFAULT,
ALTER COLUMN water_oz_target DROP DEFAULT,
ALTER COLUMN sleep_hr_target DROP DEFAULT;
```

**Benefits:**
- Enforces frontend to always provide correct targets
- No NULL handling needed

**Drawbacks:**
- Frontend MUST fetch V2 Engine targets for EVERY date (past, present, future)
- More complex frontend logic

---

### **Fix #2: Implement Automatic Daily Metrics Row Creation**

#### **Option A: Database CRON Job (Recommended)**
Create a Supabase Edge Function that runs daily at midnight:

```sql
-- Create function to initialize daily metrics for all active users
CREATE OR REPLACE FUNCTION create_daily_metrics_for_all_users()
RETURNS void AS $$
BEGIN
    INSERT INTO daily_metrics (
        user_id,
        date,
        steps_target,
        water_oz_target,
        sleep_hr_target,
        steps_actual,
        water_oz_actual,
        sleep_hr_actual,
        mood_checkins_target,
        mood_checkins_actual
    )
    SELECT 
        aup.user_id,
        CURRENT_DATE,
        -- Get targets from activation code or plan_progress
        COALESCE(ac.personalized_targets->>'steps', '6250')::INTEGER,
        COALESCE(ac.personalized_targets->>'waterOz', '51')::INTEGER,
        COALESCE(ac.personalized_targets->>'sleepHr', '6.6')::DECIMAL,
        0, -- steps_actual
        0, -- water_oz_actual
        0, -- sleep_hr_actual
        7, -- mood_checkins_target
        0  -- mood_checkins_actual
    FROM app_user_profiles aup
    LEFT JOIN activation_codes ac ON aup.activation_code_id = ac.code
    WHERE NOT EXISTS (
        SELECT 1 FROM daily_metrics dm
        WHERE dm.user_id = aup.user_id
        AND dm.date = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

-- Schedule to run daily at midnight UTC
-- (Use pg_cron extension or Supabase scheduled functions)
```

**Benefits:**
- All users get daily_metrics rows automatically
- Personalized targets from activation code
- No frontend changes needed

**Drawbacks:**
- Requires Supabase pg_cron extension or Edge Functions
- Doesn't handle retroactive dates (historical data)

---

#### **Option B: Lazy Row Creation on Frontend (Quick Fix)**
Update `HealthDataService.getMetricsByDate()` to auto-create missing rows:

```typescript
async getMetricsByDate(userId: string, date: string): Promise<DailyMetrics | null> {
  try {
    // First, try to fetch existing row
    const { data, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (data) return data; // Row exists ✅

    // If row doesn't exist, create it with V2 Engine targets
    console.log(`No row for ${date}, creating with V2 targets...`);
    
    // Get V2 Engine targets for this date
    const targets = await this.getV2EngineTargetsForDate(userId, date);
    
    const newMetrics = {
      user_id: userId,
      date: date,
      steps_target: targets.steps,
      steps_actual: 0,
      water_oz_target: targets.waterOz,
      water_oz_actual: 0,
      sleep_hr_target: targets.sleepHr,
      sleep_hr_actual: 0,
      mood_checkins_target: 7,
      mood_checkins_actual: 0,
    };

    const { data: created, error: createError } = await supabase
      .from('daily_metrics')
      .insert(newMetrics)
      .select()
      .single();

    if (createError) {
      console.error('Failed to create daily metrics:', createError);
      return null;
    }

    return created;
  } catch (error) {
    console.error('Failed to get metrics by date:', error);
    return null;
  }
}
```

**Benefits:**
- Works immediately without backend changes
- Creates rows on-demand when user navigates to past dates
- Uses correct V2 Engine targets

**Drawbacks:**
- Requires V2 Engine calculation for EVERY past date
- Slower performance (extra query for targets)
- Doesn't populate rows for dates user never visits

---

### **Fix #3: Aggregate Granular Logs into Daily Metrics**

#### **Problem:**
User tracked water on Oct 11 → `hydration_logs` has data  
But `daily_metrics` has no row → Calendar shows 0

#### **Solution: Database Trigger**
Auto-update `daily_metrics` when granular logs are inserted:

```sql
-- Trigger function to update daily_metrics when hydration is logged
CREATE OR REPLACE FUNCTION update_daily_metrics_on_hydration()
RETURNS TRIGGER AS $$
BEGIN
    -- Upsert daily_metrics for this user and date
    INSERT INTO daily_metrics (
        user_id,
        date,
        water_oz_actual,
        steps_target,
        water_oz_target,
        sleep_hr_target
    ) VALUES (
        NEW.user_id,
        DATE(NEW.ts),
        NEW.oz,
        -- Get personalized targets (placeholder - needs actual logic)
        6250,
        51,
        6.6
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        water_oz_actual = daily_metrics.water_oz_actual + EXCLUDED.water_oz_actual;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER hydration_log_trigger
    AFTER INSERT ON hydration_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_metrics_on_hydration();
```

**Similar triggers needed for:**
- `sleep_sessions` → Update `sleep_hr_actual`
- `pedometer_snapshots` → Update `steps_actual`
- `mood_checkins` → Increment `mood_checkins_actual`

**Benefits:**
- Automatic aggregation
- No frontend changes
- Historical data automatically populated

**Drawbacks:**
- Still needs correct targets (see Fix #1)
- Complex trigger logic
- Harder to debug

---

## 📋 Recommended Implementation Plan

### **Phase 1: Immediate Fixes (Frontend Only)**

1. **Lazy Row Creation in `getMetricsByDate()`**
   - Auto-create missing `daily_metrics` rows when user navigates to past dates
   - Use V2 Engine targets for that date's week
   - File: `src/services/HealthDataService.ts`

2. **Update Hydration/Sleep/Mood Services**
   - Before logging to granular tables, ensure `daily_metrics` row exists for that date
   - If missing, create with V2 targets
   - Files: `src/services/AppStoreActions.ts`, `src/services/HealthDataService.ts`

**Timeline:** 1-2 hours  
**Risk:** Low (no backend changes)  
**Impact:** Fixes calendar display immediately

---

### **Phase 2: Backend Schema Updates**

1. **Remove Hardcoded Defaults**
   ```sql
   ALTER TABLE daily_metrics
   ALTER COLUMN steps_target DROP DEFAULT,
   ALTER COLUMN water_oz_target DROP DEFAULT,
   ALTER COLUMN sleep_hr_target DROP DEFAULT;
   ```

2. **Add Validation Constraint**
   ```sql
   ALTER TABLE daily_metrics
   ADD CONSTRAINT check_valid_targets
   CHECK (
       steps_target > 0 AND steps_target <= 50000 AND
       water_oz_target > 0 AND water_oz_target <= 500 AND
       sleep_hr_target > 0 AND sleep_hr_target <= 24
   );
   ```

**Timeline:** 30 minutes  
**Risk:** Medium (requires backend team coordination)  
**Impact:** Prevents wrong targets in future rows

---

### **Phase 3: Automated Row Creation (Long-term)**

1. **Supabase Edge Function**
   - Runs daily at midnight
   - Creates `daily_metrics` rows for all active users
   - Fetches V2 Engine targets from activation code

2. **Retroactive Population Script**
   - One-time script to populate missing past dates (Oct 1 - Oct 11)
   - Aggregate data from granular logs
   - Use V2 Engine targets for each week

**Timeline:** 1 week  
**Risk:** High (requires testing, monitoring)  
**Impact:** Full automation, no frontend dependency

---

## 🎯 Success Criteria

### **After Fixes:**

✅ User navigates to Oct 11 → Shows actual tracked data (72oz water, 0.8hr sleep)  
✅ Targets in database match V2 Engine (6250 steps, 51oz, 6.6hr)  
✅ New users get daily_metrics rows automatically each day  
✅ Past dates show 0 only if user truly didn't track (not because row is missing)  
✅ Life score calculated correctly based on personalized targets  

---

## 📞 Next Steps

### **For Backend Team:**
1. Run database verification queries (see above)
2. Share results (how many rows exist per user?)
3. Confirm: Are hydration_logs/sleep_sessions populated for past dates?
4. Decide: Remove DEFAULT values or implement CRON job?

### **For Frontend Team:**
1. Implement lazy row creation in `getMetricsByDate()`
2. Add V2 Engine target lookup for past dates
3. Test calendar navigation with missing database rows
4. Add error handling for failed row creation

---

**Document Status:** Ready for Review  
**Requires Action:** Backend Team + Frontend Team  
**Priority:** 🔴 **CRITICAL** - Blocks accurate historical tracking

