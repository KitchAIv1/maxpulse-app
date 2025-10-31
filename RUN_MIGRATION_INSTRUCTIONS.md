# 🚀 Run Health Conversations Migration

## The Problem
The database tables for conversation storage don't exist yet. You're seeing:
```
ERROR: 42P01: relation "health_conversations" does not exist
```

## The Solution
Run the migration file `migrations/012_health_conversations_schema.sql` in your Supabase database.

---

## Option 1: Supabase Dashboard (Recommended - Easiest)

### Steps:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **MaxPulse** (pdgpktwmqxrljtdbnvyu)
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `migrations/012_health_conversations_schema.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Cmd+Enter)

### Expected Result:
```
Success. No rows returned
```

### What Gets Created:
- ✅ 6 new tables (health_conversations, symptom_reports, health_recommendations, product_recommendations, user_consent_preferences, health_data_audit_log)
- ✅ 15 indexes for performance
- ✅ RLS policies for security
- ✅ Audit trail triggers for HIPAA compliance
- ✅ Automatic timestamp updates

---

## Option 2: Supabase CLI (Advanced)

### Prerequisites:
```bash
npm install -g supabase
supabase login
```

### Link to Project:
```bash
cd /Users/willis/Downloads/MaxApp
supabase link --project-ref pdgpktwmqxrljtdbnvyu
```

### Run Migration:
```bash
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.pdgpktwmqxrljtdbnvyu.supabase.co:5432/postgres"
```

Or manually:
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.pdgpktwmqxrljtdbnvyu.supabase.co:5432/postgres" \
  -f migrations/012_health_conversations_schema.sql
```

---

## Option 3: Direct SQL Execution (Quick)

### Using psql:
```bash
# Replace [YOUR-PASSWORD] with your Supabase database password
psql "postgresql://postgres:[YOUR-PASSWORD]@db.pdgpktwmqxrljtdbnvyu.supabase.co:5432/postgres" \
  -f /Users/willis/Downloads/MaxApp/migrations/012_health_conversations_schema.sql
```

### Using Supabase REST API:
```bash
curl -X POST 'https://pdgpktwmqxrljtdbnvyu.supabase.co/rest/v1/rpc/exec_sql' \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$(cat migrations/012_health_conversations_schema.sql)\"}"
```

---

## Verification After Running Migration

### 1. Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'health_conversations',
  'symptom_reports', 
  'health_recommendations',
  'product_recommendations',
  'user_consent_preferences',
  'health_data_audit_log'
);
```

**Expected:** 6 rows returned

### 2. Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'health_%' OR tablename LIKE '%_recommendations';
```

**Expected:** All should show `rowsecurity = true`

### 3. Check Policies Exist
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN (
  'health_conversations',
  'symptom_reports',
  'health_recommendations',
  'product_recommendations',
  'user_consent_preferences',
  'health_data_audit_log'
);
```

**Expected:** 18 policies (3 per table for most tables)

### 4. Test Insert (Should Work Now!)
```sql
-- This should work after migration
INSERT INTO health_conversations (
  user_id,
  session_id,
  conversation_type,
  summary
) VALUES (
  auth.uid(),
  'test-session-123',
  'general',
  'Test conversation'
) RETURNING id;
```

---

## Troubleshooting

### Issue: "function update_updated_at_column() does not exist"
**Solution:** Create the function first:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Issue: "permission denied for schema public"
**Solution:** Run as service role or grant permissions:
```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

### Issue: "relation already exists"
**Solution:** The tables are already created! You're good to go. Just verify with the queries above.

### Issue: RLS policies blocking inserts
**Solution:** Make sure you're authenticated when testing:
```sql
-- Check current user
SELECT auth.uid();

-- If NULL, you need to authenticate first
```

---

## What Happens After Migration

### In Your App:
1. ✅ Conversations will save to database on chat close
2. ✅ Symptom reports will save immediately
3. ✅ Recommendations will save with symptoms
4. ✅ All data will persist across app restarts
5. ✅ Offline queue will sync when back online

### In Supabase:
1. ✅ Data visible in Table Editor
2. ✅ RLS policies protect user data
3. ✅ Audit trail logs all access
4. ✅ Automatic timestamps on updates
5. ✅ HIPAA-compliant storage

---

## Quick Start (Copy-Paste Ready)

**For Supabase Dashboard:**
1. Open [https://supabase.com/dashboard/project/pdgpktwmqxrljtdbnvyu/editor](https://supabase.com/dashboard/project/pdgpktwmqxrljtdbnvyu/editor)
2. Click "SQL Editor" → "New Query"
3. Copy entire `migrations/012_health_conversations_schema.sql` file
4. Paste and click "Run"
5. Done! ✅

---

## After Migration - Test in App

1. Open AI Coach in your app
2. Send a few messages
3. Close the chat
4. Check Supabase Table Editor:
   - Go to `health_conversations` table
   - You should see your conversation!

---

**Status:** Ready to run  
**Risk Level:** Low (uses `CREATE TABLE IF NOT EXISTS`)  
**Reversible:** Yes (can drop tables if needed)  
**Time:** ~5 seconds to run  

---

*Run this migration and your conversation storage will be fully operational!* 🎉

