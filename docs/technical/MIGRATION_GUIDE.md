# Database Migration Guide
## Running Adaptive Mastery Progression Migrations

**Last Updated**: January 2025  
**Status**: Ready for deployment

---

## 📋 Overview

This guide provides step-by-step instructions for running the database migrations required for the **Adaptive Mastery Progression** feature.

### Migrations to Run
1. **007_weekly_performance_history.sql** - Creates weekly performance tracking table
2. **008_plan_progress_extensions.sql** - Extends plan_progress with assessment columns

### Safety Status
✅ **Both migrations are safe** - See [Migration Safety Analysis](MIGRATION_SAFETY_ANALYSIS.md) for detailed verification.

---

## 🚀 Quick Start

### Option 1: Supabase Dashboard (Recommended)

1. **Login to Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your MaxPulse project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migration 007**
   - Copy the contents of `migrations/007_weekly_performance_history.sql`
   - Paste into the SQL Editor
   - Click "Run" button
   - ✅ Verify: "Success. No rows returned"

4. **Run Migration 008**
   - Copy the contents of `migrations/008_plan_progress_extensions.sql`
   - Paste into the SQL Editor
   - Click "Run" button
   - ✅ Verify: "Success. No rows returned"

5. **Verify Migrations**
   ```sql
   -- Check weekly_performance_history table exists
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_name = 'weekly_performance_history';
   
   -- Check plan_progress new columns exist
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'plan_progress' 
   AND column_name IN ('last_assessment_date', 'week_extensions', 'assessment_history', 'progression_decisions');
   ```

### Option 2: Command Line (psql)

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run migrations
\i migrations/007_weekly_performance_history.sql
\i migrations/008_plan_progress_extensions.sql

# Verify
\dt weekly_performance_history
\d plan_progress
```

---

## 📊 Migration Details

### Migration 007: Weekly Performance History

**Purpose**: Creates a new table to store weekly assessment data.

**What it creates**:
- New table: `weekly_performance_history`
- Columns: Performance metrics, consistency data, progression decisions
- Indexes: For efficient querying
- RLS Policies: User-scoped security

**Impact**: None on existing functionality (new table)

**File**: `migrations/007_weekly_performance_history.sql`

### Migration 008: Plan Progress Extensions

**Purpose**: Adds assessment tracking columns to existing `plan_progress` table.

**What it adds**:
- `last_assessment_date` - Date of most recent assessment
- `week_extensions` - Number of times current week extended (0-5)
- `assessment_history` - Array of assessment summaries
- `progression_decisions` - Array of user decisions

**Impact**: None on existing functionality (additive only)

**File**: `migrations/008_plan_progress_extensions.sql`

---

## ✅ Verification Steps

### 1. Check Table Creation

```sql
-- Verify weekly_performance_history table
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name = 'weekly_performance_history';

-- Expected: 1 row showing BASE TABLE
```

### 2. Check New Columns

```sql
-- Verify plan_progress extensions
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'plan_progress'
AND column_name IN (
    'last_assessment_date',
    'week_extensions',
    'assessment_history',
    'progression_decisions'
);

-- Expected: 4 rows showing the new columns
```

### 3. Check RLS Policies

```sql
-- Verify RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('weekly_performance_history', 'plan_progress');

-- Expected: Both tables should have rowsecurity = true
```

### 4. Check Indexes

```sql
-- Verify indexes were created
SELECT 
    indexname,
    tablename
FROM pg_indexes
WHERE tablename IN ('weekly_performance_history', 'plan_progress')
AND indexname LIKE '%assessment%' OR indexname LIKE '%weekly_performance%';

-- Expected: Multiple indexes for performance optimization
```

---

## 🔄 Rollback Instructions

If you need to rollback these migrations (unlikely):

### Rollback Migration 008

```sql
-- Remove new columns from plan_progress
ALTER TABLE plan_progress 
DROP COLUMN IF EXISTS last_assessment_date,
DROP COLUMN IF EXISTS week_extensions,
DROP COLUMN IF EXISTS assessment_history,
DROP COLUMN IF EXISTS progression_decisions;

-- Remove constraint
ALTER TABLE plan_progress 
DROP CONSTRAINT IF EXISTS check_week_extensions_positive;

-- Remove index
DROP INDEX IF EXISTS idx_plan_progress_last_assessment;
```

### Rollback Migration 007

```sql
-- Drop the entire table (this will also drop indexes and policies)
DROP TABLE IF EXISTS weekly_performance_history CASCADE;
```

---

## 🐛 Troubleshooting

### Error: "relation already exists"

**Cause**: Migration was already run.

**Solution**: This is safe! The migrations use `IF NOT EXISTS` and `IF NOT EXISTS` clauses. The error can be ignored, or you can verify the tables/columns exist using the verification steps above.

### Error: "permission denied"

**Cause**: Insufficient database permissions.

**Solution**: 
1. Ensure you're connected as the `postgres` user or a superuser
2. Check your Supabase project settings for the correct credentials
3. Verify RLS is not blocking the operation (shouldn't be an issue for DDL)

### Error: "constraint violation"

**Cause**: Existing data doesn't meet new constraints.

**Solution**: This shouldn't happen with these migrations as:
- Migration 007 creates a new empty table
- Migration 008 adds columns with safe defaults

If it does occur, check for any manual database modifications.

---

## 📝 Post-Migration Checklist

After running migrations:

- [ ] Verify both migrations completed successfully
- [ ] Run verification queries to confirm tables/columns exist
- [ ] Check RLS policies are in place
- [ ] Test existing app functionality (should work unchanged)
- [ ] Deploy new application code with assessment features
- [ ] Monitor application logs for any issues
- [ ] Test new assessment features with a test user

---

## 🔗 Related Documentation

- **[Migration Safety Analysis](MIGRATION_SAFETY_ANALYSIS.md)** - Detailed safety verification
- **[Database Schema](supabase_schema.sql)** - Complete database structure
- **[Activation Code System](ACTIVATION_CODE_SYSTEM.md)** - User onboarding system
- **[Project README](../../README.md)** - Main project documentation

---

## 📞 Support

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review the **[Migration Safety Analysis](MIGRATION_SAFETY_ANALYSIS.md)**
3. Verify your Supabase connection and permissions
4. Check Supabase logs for detailed error messages

---

## 🎉 Success!

Once migrations are complete, your database is ready for the Adaptive Mastery Progression feature. The app will automatically start using the new tables and columns when the updated code is deployed.

**Next Steps**:
1. Deploy the updated application code
2. Test the weekly assessment flow
3. Monitor user progression through the 90-day plan
4. Enjoy the new adaptive features! 🚀
