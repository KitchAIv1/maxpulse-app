# EAS Secrets Setup Guide - MaxPulse MVP1

This guide will help you set up EAS Secrets for secure iOS builds.

---

## 🎯 What Are EAS Secrets?

EAS Secrets are encrypted environment variables used during your iOS build process. They keep your sensitive credentials (Supabase URLs, API keys) secure and out of your git repository.

---

## 📋 Prerequisites

1. ✅ EAS CLI installed (already done - you have it at `/opt/homebrew/bin/eas`)
2. ✅ `.env` file with your credentials (already done)
3. ✅ Expo account (you'll need to log in)

---

## 🚀 Quick Setup (Recommended)

### **Option 1: Automatic Setup (Easiest)**

We've created a script that reads your `.env` file and sets up all secrets automatically:

```bash
cd /Users/willis/Downloads/MaxApp
./auto-setup-eas-secrets.sh
```

This will:
1. Read your `.env` file
2. Create 3 EAS Secrets:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
3. Verify they were created successfully

---

### **Option 2: Manual Setup**

If you prefer to do it manually:

**Step 1: Login to EAS**
```bash
eas login
```

**Step 2: Get Your Credentials**
```bash
cat .env
```

**Step 3: Create Secrets** (replace with your actual values)
```bash
# 1. Supabase URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your_actual_supabase_url" --type string

# 2. Supabase Anon Key
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your_actual_anon_key" --type string

# 3. OpenAI API Key
eas secret:create --scope project --name OPENAI_API_KEY --value "your_actual_openai_key" --type string
```

**Step 4: Verify**
```bash
eas secret:list
```

You should see:
```
┌─────────────────────────────────┬──────────────┐
│ Name                            │ Updated at   │
├─────────────────────────────────┼──────────────┤
│ EXPO_PUBLIC_SUPABASE_URL        │ a few sec... │
│ EXPO_PUBLIC_SUPABASE_ANON_KEY   │ a few sec... │
│ OPENAI_API_KEY                  │ a few sec... │
└─────────────────────────────────┴──────────────┘
```

---

## 🔍 Verify Setup

After creating secrets, verify they're configured correctly:

```bash
# List all secrets
eas secret:list

# Check eas.json configuration
cat eas.json | grep -A 10 "production"
```

Your `eas.json` should reference these secrets:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "$(EXPO_PUBLIC_SUPABASE_URL)",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "$(EXPO_PUBLIC_SUPABASE_ANON_KEY)",
        "OPENAI_API_KEY": "$(OPENAI_API_KEY)"
      }
    }
  }
}
```

---

## 🏗️ Build Commands

After secrets are set up:

### **TestFlight Build (Preview)**
```bash
eas build --platform ios --profile preview
```

### **Production Build (App Store)**
```bash
eas build --platform ios --profile production
```

### **Submit to App Store**
```bash
eas submit --platform ios --latest
```

---

## 🔧 Troubleshooting

### **"Not logged in" error**
```bash
eas login
```

### **"Secret already exists" error**
Use `--force` to overwrite:
```bash
eas secret:create --name YOUR_SECRET_NAME --value "new_value" --type string --force
```

### **View secret value** (for debugging)
```bash
# EAS doesn't show values for security
# Check your .env file instead
cat .env
```

### **Delete a secret**
```bash
eas secret:delete --name YOUR_SECRET_NAME
```

### **Update a secret**
```bash
# Delete and recreate
eas secret:delete --name YOUR_SECRET_NAME
eas secret:create --name YOUR_SECRET_NAME --value "new_value" --type string
```

---

## 🔐 Security Best Practices

1. ✅ **Never commit secrets to git**
   - `.env` is already in `.gitignore`
   - Secrets are stored encrypted in EAS

2. ✅ **Use different credentials for dev vs prod**
   - Development: `.env` (local only)
   - Production: EAS Secrets (for builds)

3. ✅ **Rotate secrets regularly**
   - Update secrets every 90 days
   - Update immediately if compromised

4. ✅ **Limit access**
   - Only team members who need access
   - Use Expo organizations for team management

---

## 📊 Secret Usage

When you run `eas build`, EAS will:
1. Use your `eas.json` configuration
2. Inject the secrets as environment variables
3. Build your app with those values
4. **Never expose the secrets in logs or output**

---

## ✅ Verification Checklist

Before building:
- [ ] EAS CLI installed (`which eas`)
- [ ] Logged in to Expo (`eas whoami`)
- [ ] Secrets created (`eas secret:list` shows 3 secrets)
- [ ] `eas.json` references secrets
- [ ] `.env` file not committed to git

---

## 🚀 You're Ready!

Once secrets are set up, you can:
1. Build TestFlight versions for testing (Nov 22)
2. Build production versions for App Store (Dec 6)
3. Submit to App Store with confidence

**Next:** Run the auto-setup script or follow manual steps above!

---

**Last Updated:** November 22, 2025  
**Status:** Ready for EAS Secrets setup ✅

