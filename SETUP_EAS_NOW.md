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
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_SUPABASE_ANON_KEY_HERE" --environment production --visibility sensitive
```
**Replace `YOUR_SUPABASE_ANON_KEY_HERE` with your actual key from `.env` file**

### 3c. Create OpenAI API Key
```bash
eas env:create --name OPENAI_API_KEY --value "YOUR_OPENAI_API_KEY_HERE" --environment production --visibility sensitive
```
**Replace `YOUR_OPENAI_API_KEY_HERE` with your actual key from `.env` file**

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

