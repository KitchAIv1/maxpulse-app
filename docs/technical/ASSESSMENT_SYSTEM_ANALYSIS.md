# Weekly Assessment System Analysis & Fixes

**Date**: October 2025  
**Status**: 🔧 **Issues Identified - Fixes Required**

## 🔍 Issues Identified

### 1. **Missing `start_date` Column**

**Problem**: `plan_progress` table doesn't have a `start_date` column, causing incorrect week date calculations.

**Location**: `WeeklyAssessmentOrchestrator.getWeekDateRange()` (line 127-163)

**Current Behavior**:
```typescript
// Tries to read start_date from plan_progress
const { data, error } = await supabase
  .from('plan_progress')
  .select('start_date')
  .eq('user_id', userId)
  .single();

// Falls back to wrong calculation
if (error || !data?.start_date) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - ((weekNumber - 1) * 7));
  // This calculates dates relative to TODAY, not plan start date!
}
```

**Result**: Shows wrong dates like "2025-01-20" for Week 1.

**Fix Required**: Add `start_date` column to `plan_progress` table.

---

### 2. **Assessment Recalculating on Every Load**

**Problem**: Assessment results are recalculated every time user opens the modal, instead of showing cached results until next Sunday.

**Location**: `WeeklyAssessmentOrchestrator.getExistingAssessment()` (line 98-122)

**Current Behavior**:
```typescript
private static async getExistingAssessment(...): Promise<WeeklyAssessmentData | null> {
  // ...
  return null; // For MVP, always recalculate ← THIS IS THE PROBLEM
}
```

**Result**: Assessment changes every time user reloads the app.

**Fix Required**: Implement proper caching logic to return stored assessment results.

---

## 🎯 How The System SHOULD Work

### Sunday Evening Trigger Flow:
```
1. Sunday Evening (automatic trigger)
   ├─ Calculate Week N Performance
   │  ├─ Get all daily_metrics for Week N date range
   │  ├─ Calculate pillar breakdowns, consistency, trends
   │  └─ Generate progression recommendation
   │
   ├─ Store Results in weekly_performance_history
   │  ├─ week_number: N
   │  ├─ all_metrics: calculated values
   │  ├─ progression_recommendation: advance/extend/reset
   │  └─ assessed_at: timestamp
   │
   └─ Show Assessment Modal to User
```

### Monday-Saturday Flow:
```
User Opens Assessment Modal
  ├─ Check if assessment exists for current_week
  │  ├─ YES: Display cached assessment from weekly_performance_history
  │  │        (Same output all week, no recalculation)
  │  │
  │  └─ NO: Calculate and store new assessment
  │
  └─ User Makes Decision (accept/override/consult)
```

### Next Sunday:
```
Next Sunday Evening
  ├─ Week N+1 Assessment Triggered
  ├─ Calculate Week N+1 Performance (new date range)
  ├─ Store new results in weekly_performance_history
  └─ Show updated assessment to user
```

---

## 🔧 Required Fixes

### Fix 1: Add `start_date` Column

**Migration**: `009_add_start_date_to_plan_progress.sql`
```sql
-- Add start_date column to plan_progress
ALTER TABLE plan_progress 
ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;

-- Create index for date range queries
CREATE INDEX IF NOT EXISTS idx_plan_progress_start_date 
    ON plan_progress(user_id, start_date);

-- Update existing rows with a reasonable default
-- Calculate start_date as (current_week - 1) weeks ago
UPDATE plan_progress 
SET start_date = CURRENT_DATE - ((current_week - 1) * 7) * INTERVAL '1 day'
WHERE start_date IS NULL;
```

### Fix 2: Implement Assessment Caching

**File**: `src/services/assessment/WeeklyAssessmentOrchestrator.ts`

**Change `getExistingAssessment` method** (line 98):
```typescript
private static async getExistingAssessment(
  userId: string,
  weekNumber: number
): Promise<WeeklyAssessmentData | null> {
  try {
    // Get stored assessment from weekly_performance_history
    const { data, error } = await supabase
      .from('weekly_performance_history')
      .select('*')
      .eq('user_id', userId)
      .eq('week_number', weekNumber)
      .single();

    if (error || !data) {
      return null; // No cached assessment exists
    }

    // Convert stored data back to WeeklyAssessmentData format
    return this.reconstructAssessmentFromStorage(data);
  } catch (error) {
    console.warn('⚠️ Could not check existing assessment');
    return null;
  }
}
```

### Fix 3: Update Logic to Use `forceReassessment` Properly

**Current Issue**: `useRealTimeAssessment` always passes `forceReassessment: true`

**File**: `src/hooks/assessment/useRealTimeAssessment.ts` (line 42)
```typescript
const data = await WeeklyAssessmentOrchestrator.conductWeeklyAssessment(
  userId,
  targetWeek,
  false // Change to false - don't force reassessment if cached data exists
);
```

---

## 📊 Expected Behavior After Fixes

### Scenario: User on Week 2, Today is Wednesday

**Before Fixes**:
- User opens assessment → Recalculates → Might show Week 1 or Week 2 or wrong dates
- User reloads app → Recalculates again → Different results

**After Fixes**:
- User opens assessment → Loads cached Week 2 data → Same results every time
- User reloads app → Loads cached Week 2 data → Same results (no recalculation)
- Next Sunday → New assessment runs → Week 3 data cached → Shows Week 3 all week

---

## 🧪 Testing Checklist

- [ ] Run migration 009 to add `start_date` column
- [ ] Verify `plan_progress` has `start_date` populated for existing users
- [ ] Test assessment caching: Open modal, close, reopen - should show same data
- [ ] Test assessment persistence: Reload app, check assessment - should be same
- [ ] Test date ranges: Verify Week 1 shows correct dates (e.g., if started Jan 6, Week 1 = Jan 6-12)
- [ ] Test Sunday trigger: Wait for Sunday evening, verify new assessment runs
- [ ] Test week transition: Advance to Week 2, verify new assessment shows Week 2 data

---

## 📝 Related Files

- `src/services/assessment/WeeklyAssessmentOrchestrator.ts` - Main orchestrator
- `src/hooks/assessment/useRealTimeAssessment.ts` - Real-time data hook
- `src/services/assessment/WeeklyPerformanceCalculator.ts` - Performance calculations
- `migrations/009_add_start_date_to_plan_progress.sql` - New migration needed
- `App.tsx` - UI integration

