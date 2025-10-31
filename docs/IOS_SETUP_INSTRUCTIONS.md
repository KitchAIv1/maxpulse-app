# iOS App Store Setup Instructions - MaxPulse MVP1

**Target Release Date:** December 6, 2025  
**Testing Period:** November 22 - December 5, 2025

---

## ✅ Completed Tasks

- [x] Update app.json to v2.0.0
- [x] Create eas.json for build configuration
- [x] Create Privacy Policy template
- [x] Create Terms of Service template
- [x] Create .env.production template
- [x] Remove activation code references from documentation
- [x] Create App Store submission notes

---

## 🚨 CRITICAL TASKS (Do These IMMEDIATELY)

### 1. Fix Database Security (DONE ✅)
You mentioned this is complete.

### 2. Set OpenAI API Spending Limits (DONE ✅)
You mentioned this is complete.

### 3. Create Production Supabase Project
**Time:** 30 minutes

**Steps:**
1. Go to https://app.supabase.com
2. Click "New Project"
3. Name: `maxpulse-production`
4. Choose region closest to your users
5. Set strong database password (save in password manager)
6. Wait for project to be created (5-10 minutes)

**After Creation:**
1. Go to Settings → API
2. Copy `EXPO_PUBLIC_SUPABASE_URL`
3. Copy `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. Run all database migrations from `migrations/` folder
5. **CRITICAL:** Enable RLS on all tables
6. Test with a test user account

---

## ⚠️ HIGH PRIORITY (This Week)

### 4. Host Privacy Policy & Terms of Service
**Time:** 1-2 hours

**Option A: Host on Your Website (Recommended)**
1. Upload `docs/legal/PRIVACY_POLICY.md` to your website
2. Convert Markdown to HTML
3. Host at: `https://maxpulse.com/privacy`
4. Upload `docs/legal/TERMS_OF_SERVICE.md`
5. Host at: `https://maxpulse.com/terms`

**Option B: Use GitHub Pages (Quick Solution)**
1. Create a GitHub repo: `maxpulse-legal`
2. Enable GitHub Pages
3. Upload HTML versions of privacy policy and terms
4. URL will be: `https://YOUR_USERNAME.github.io/maxpulse-legal/privacy`

**Option C: Use Third-Party Service**
- Termly.io
- Privacy Policies.com
- iubenda.com

**⚠️ IMPORTANT:** Update these URLs in:
- `docs/APP_STORE_SUBMISSION_NOTES.md`
- App Store Connect listing (when you create it)

### 5. Sign Up for Apple Developer Program
**Time:** 30 minutes + 24-48 hours approval  
**Cost:** $99/year

**Steps:**
1. Go to https://developer.apple.com/programs/enroll/
2. Click "Start Your Enrollment"
3. Sign in with your Apple ID (or create one)
4. Choose "Individual" or "Organization"
   - **Individual:** Faster approval, your personal name
   - **Organization:** Requires D-U-N-S number, company name
5. Pay $99 fee
6. Wait for approval (usually 24-48 hours)

**After Approval:**
1. Go to https://appstoreconnect.apple.com
2. Accept agreements
3. Set up banking information (for paid apps - not needed for MVP1)
4. Set up tax information

### 6. Set Up EAS Secrets
**Time:** 15 minutes

**Steps:**
```bash
# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Create secrets (use your PRODUCTION values)
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR_PROD_PROJECT.supabase.co" --type string

eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your_production_anon_key" --type string

eas secret:create --scope project --name OPENAI_API_KEY --value "your_openai_key" --type string

# Verify secrets
eas secret:list
```

**⚠️ NEVER commit secrets to git!**

### 7. Create Test Accounts
**Time:** 15 minutes

**Create 2 test accounts in your PRODUCTION Supabase:**

**Test Account #1:**
- Email: `reviewer@maximum88.com`
- Password: `TestMaxPulse2025!` (or your secure password)
- Add sample health data (steps, water, mood check-ins)
- Complete at least 1 weekly assessment

**Test Account #2:**
- Email: `tester@maximum88.com`
- Password: `TestMaxPulse2025!` (or your secure password)
- Add sample health data

**Document these credentials securely** - you'll need them for App Store Connect.

---

## 📱 MEDIUM PRIORITY (Before Nov 22)

### 8. Take Screenshots
**Time:** 2 hours

**Required:** 6.7" iPhone 15 Pro Max screenshots

**Screenshots Needed (4-10 total):**
1. **Sign-In Screen**
   - Show "Welcome to MaxPulse" branding
   - Show "Maximum 88 Exclusive" badge

2. **Main Dashboard**
   - Show health tracking rings
   - Show Life Score in center
   - Show calendar bar

3. **Step Tracking**
   - Show step ring with progress
   - Show today's step count

4. **Mood Check-In**
   - Show mood selection interface
   - Show mood rings

5. **Life Score Dashboard**
   - Show battery gauge
   - Show breakdown of metrics

6. **Weekly Assessment**
   - Show assessment interface
   - Show performance grades

**How to Take Screenshots:**
1. Open Xcode
2. Run app on iPhone 15 Pro Max simulator
3. Navigate to each screen
4. Press Cmd+S to save screenshot
5. Screenshots saved to Desktop

**Alternative:** Use `xcrun simctl io booted screenshot screenshot.png`

### 9. Create App Store Connect Listing
**Time:** 1 hour

**Prerequisites:**
- Apple Developer Account approved
- Screenshots ready
- Privacy Policy URL live
- Test credentials documented

**Steps:**
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in app information:
   - **Platform:** iOS
   - **Name:** MaxPulse
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** com.maxpulse.app
   - **SKU:** maxpulse-2024 (unique identifier)
   - **User Access:** Full Access

4. Fill in App Information:
   - **Subtitle:** Health Transformation Tracker
   - **Category:** Health & Fitness
   - **Secondary Category:** Lifestyle

5. Fill in Pricing and Availability:
   - **Price:** Free
   - **Availability:** All countries (or select specific ones)

6. Fill in App Privacy:
   - **Privacy Policy URL:** https://maxpulse.com/privacy
   - Answer privacy questions (see `docs/APP_STORE_SUBMISSION_NOTES.md`)

7. Add Version Information:
   - **Version:** 2.0.0
   - **Copyright:** © 2025 Maximum 88 (or your company)
   - **Description:** (Use the 170-char description from submission notes)
   - **Keywords:** (Use the 100-char keywords from submission notes)
   - **Support URL:** https://maxpulse.com/support
   - **Marketing URL:** https://maxpulse.com

8. Upload Screenshots (for 6.7" display)

9. Add App Review Information:
   - **First Name:** App
   - **Last Name:** Reviewer
   - **Phone:** Your support phone
   - **Email:** support@maxpulse.com
   - **Sign-in required:** YES
   - **Demo Account:** 
     - Username: reviewer@maximum88.com
     - Password: [Your test password]
   - **Notes:** (Copy from `docs/APP_STORE_SUBMISSION_NOTES.md`)

10. Age Rating:
    - Answer questionnaire
    - Expected rating: 12+

11. Save as Draft

### 10. Build TestFlight Version
**Time:** 1 hour (first time), 30 minutes (subsequent builds)

**Steps:**
```bash
# Make sure you're in the project directory
cd /Users/willis/Downloads/MaxApp

# Install dependencies (if not already)
npm install

# Login to EAS
eas login

# Build for iOS (preview profile for TestFlight)
eas build --platform ios --profile preview

# This will:
# 1. Upload your project to Expo servers
# 2. Build your app in the cloud
# 3. Take 10-20 minutes
# 4. Give you a download link when complete
```

**After Build Completes:**
```bash
# Submit to TestFlight
eas submit --platform ios --latest

# Or manually:
# 1. Download the .ipa file from EAS dashboard
# 2. Upload to App Store Connect using Transporter app
```

**First Build Troubleshooting:**
- Missing credentials? Run: `eas credentials`
- Need provisioning profile? EAS will generate automatically
- Need push notification certificate? Skip for MVP1

---

## 📊 OPTIONAL (Nice to Have)

### 11. Set Up Crash Reporting (Sentry)
**Time:** 30 minutes

```bash
# Install Sentry
npm install @sentry/react-native

# Initialize
npx @sentry/wizard@latest -i reactNative

# Update app.json
# (Wizard will do this automatically)

# Test crash reporting
# Sentry.nativeCrash() // Don't leave this in production!
```

### 12. Set Up Firebase Analytics (Optional)
**Time:** 1 hour

Currently in fallback mode. Enable if you want detailed analytics.

---

## 📅 TIMELINE

### **Week of November 15-21**

**Monday (Nov 18):**
- [ ] ✅ Fix RLS security (DONE)
- [ ] ✅ Set OpenAI limits (DONE)
- [ ] Create production Supabase project
- [ ] Set up EAS Secrets

**Tuesday (Nov 19):**
- [ ] Host Privacy Policy & Terms of Service
- [ ] Sign up for Apple Developer Program (wait for approval)

**Wednesday (Nov 20):**
- [ ] Create test accounts
- [ ] Take screenshots
- [ ] Update eas.json with Apple Team ID (after approval)

**Thursday (Nov 21):**
- [ ] Create App Store Connect listing
- [ ] Build first TestFlight version

**Friday (Nov 22):**
- [ ] Submit to TestFlight
- [ ] Invite internal testers
- [ ] **START 2-WEEK TESTING PERIOD**

### **November 22 - December 5 (Testing)**
- Daily monitoring
- Bug fixes
- User feedback collection
- TestFlight updates as needed

### **December 2-4 (Pre-Launch)**
- [ ] Final TestFlight build
- [ ] Submit to App Store Review (allow 24-48 hours)
- [ ] Prepare launch materials

### **December 6 (Launch Day)**
- [ ] App goes live
- [ ] Monitor analytics
- [ ] Support team ready

---

## 📞 NEED HELP?

### Resources
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **App Store Connect Guide:** https://developer.apple.com/app-store-connect/
- **Supabase Docs:** https://supabase.com/docs
- **OpenAI Limits:** https://platform.openai.com/account/limits

### Support
- **Expo Discord:** https://chat.expo.dev
- **Apple Developer Support:** https://developer.apple.com/support/
- **Supabase Discord:** https://discord.supabase.com

---

## ✅ FINAL CHECKLIST

Before submitting to App Store:
- [ ] RLS enabled on all database tables
- [ ] OpenAI spending limits set
- [ ] Production Supabase project created
- [ ] EAS Secrets configured
- [ ] Privacy Policy live and accessible
- [ ] Terms of Service live and accessible
- [ ] Test accounts created with sample data
- [ ] Screenshots taken (6.7" iPhone)
- [ ] App Store Connect listing created
- [ ] TestFlight build tested by team
- [ ] All critical bugs fixed
- [ ] App Review notes documented
- [ ] Test credentials provided
- [ ] Support email monitored

---

**You're doing great! MVP1 launch on track for December 6, 2025! 🚀**

