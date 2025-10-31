# ⚡ Quick EAS Setup - Run These Commands Now

**Copy and paste these commands into your Mac terminal (outside of Cursor):**

---

## Step 1: Navigate to Project
```bash
cd /Users/willis/Downloads/MaxApp
```

---

## Step 2: Initialize EAS Project
```bash
eas project:init
```
**When prompted:** Press `Y` to create a project for @chieftitan/maxpulse

---

## Step 3: Create Environment Secrets

### 3a. Create Supabase URL
```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://pdgpktwmqxrljtdbnvyu.supabase.co" --environment production --visibility plaintext
```

### 3b. Create Supabase Anon Key
```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZ3BrdHdtcXhybGp0ZGJudnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDI0ODEsImV4cCI6MjA3NDQ3ODQ4MX0.3O7t2WpOvZxvU2r1eH0K2KPSDjIUhfg-XpxU7KQRuX8" --environment production --visibility sensitive
```

### 3c. Create OpenAI API Key
```bash
eas env:create --name OPENAI_API_KEY --value "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" --environment production --visibility sensitive
```

---

## Step 4: Verify Secrets
```bash
eas env:list
```

You should see:
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY  
- OPENAI_API_KEY

---

## ✅ Done!

After running these commands, your EAS project will be configured and ready to build!

**Next step:** Build for TestFlight
```bash
eas build --platform ios --profile preview
```

---

**Estimated time:** 2-3 minutes  
**Status:** Ready to run! 🚀

