# iOS App Store Submission Notes - MaxPulse MVP1

**Version:** 2.0.0  
**Release Date:** December 6, 2025  
**Testing Period:** November 22 - December 5, 2025  

---

## 📱 App Store Connect Configuration

### App Information
- **App Name:** MaxPulse
- **Subtitle:** Health Transformation Tracker
- **Bundle ID:** `com.maximum88.maxpulse` (or `com.maxpulse.app` if already in use)
- **Category:** Health & Fitness
- **Secondary Category:** Lifestyle
- **Age Rating:** 12+ (due to health/medical content in AI Coach)

### App Description (170 characters)
```
Transform your health in 90 days with MaxPulse. Track steps, hydration, sleep, and mood with personalized AI coaching. Exclusive to Maximum 88 verified customers and distributors.
```

### Keywords (100 characters)
```
health,wellness,fitness,steps,sleep,water,mood,tracker,AI coach,transformation,habit,goals
```

### Support Information
- **Support URL:** https://maxpulse.com/support (or your support page)
- **Marketing URL:** https://maxpulse.com (or your marketing page)
- **Privacy Policy URL:** https://maxpulse.com/privacy (**REQUIRED**)

---

## 🔐 Test Credentials for App Review

**⚠️ IMPORTANT:** Provide these credentials in App Store Connect under "App Review Information" → "Sign-in required"

### Test Account #1 (Primary)
```
Email: reviewer@maximum88.com
Password: [Provided securely in App Store Connect notes]

Notes: Full access test account with sample health data
```

### Test Account #2 (Backup)
```
Email: tester@maximum88.com  
Password: [Provided securely in App Store Connect notes]

Notes: Secondary test account for review validation
```

### App Review Instructions
```
MaxPulse is exclusive to verified Maximum 88 members. Use the credentials provided above to access the app. Public registration is not available - users must be pre-verified through our partner system.

Key Features to Test:
1. Sign in with provided credentials
2. View main dashboard with health tracking rings
3. Test step tracking (automatic via CoreMotion)
4. Log hydration (+8oz button)
5. Check mood (tap mood ring → mood check-in modal)
6. View Life Score (tap center battery gauge)
7. Access AI Coach (tap chat icon in bottom nav)
8. View weekly assessment (tap Assessment button)

Note: The app requires motion permissions for step tracking. Please grant permissions when prompted for full functionality testing.
```

---

## 🏥 Health Data Permissions Explanation

### Motion Data (NSMotionUsageDescription)
**Reason:** MaxPulse uses Core Motion to automatically track daily steps as part of our 90-day health transformation program. This provides users with real-time feedback on their activity levels without manual entry.

**Data Usage:** Steps are tracked locally and synced to the user's private secure account. We do not share step data with third parties.

### HealthKit (NSHealthShareUsageDescription)
**Reason:** MaxPulse reads step count, sleep data, and hydration data from HealthKit to provide users with a unified wellness dashboard and personalized health insights.

**Data Usage:** All data stays on the user's device or in their private secure cloud account. We do not share health data with third parties.

---

## 📋 App Review Notes for Apple

### Authentication Method
**Question:** How does user authentication work?

**Answer:** 
MaxPulse is exclusive to verified Maximum 88 members. Users sign in with their email and password credentials that have been pre-verified through our partner system. The app does not have public registration - access is restricted to authorized users only. User accounts are created through our separate web platform and then users can access the mobile app with those credentials.

### Health Data Collection
**Question:** What health data do you collect and why?

**Answer:**
We collect the following health data with explicit user permission:
- **Steps:** Automatic tracking via CoreMotion/HealthKit for daily activity goals
- **Hydration:** Manual logging with one-tap entry
- **Sleep:** Manual entry with HealthKit integration option
- **Mood:** Daily check-ins via 5-point scale with optional journaling

All data is stored securely in Supabase with Row Level Security (RLS) policies ensuring only the user can access their own data. Data is used solely for:
1. Personal health insights and progress tracking
2. Personalized AI Coach recommendations
3. Weekly performance assessments
4. 90-day transformation plan progression

We do NOT:
- Sell health data
- Share data with third parties for marketing
- Use data for advertising
- Collect location data

### AI Coach Feature
**Question:** What is the AI Coach and how does it work?

**Answer:**
The AI Coach is a conversational health assistant powered by OpenAI's GPT models. It:
- Provides general wellness advice and encouragement
- Answers questions about health habits
- Offers personalized recommendations based on current health metrics
- Is NOT a medical diagnosis tool
- Includes clear disclaimers that it's not a substitute for professional medical care

All conversations are stored securely with HIPAA-compliant practices. The AI Coach is clearly labeled as a wellness assistant, not a medical tool.

### Data Privacy & Security
**Question:** How do you protect user health data?

**Answer:**
- All data encrypted in transit (TLS/SSL)
- Stored securely in Supabase (SOC 2 Type II compliant)
- Row Level Security (RLS) prevents unauthorized access
- Only authenticated users can access their own data
- Secure token storage using Expo SecureStore
- No health data logged or exposed in analytics
- Users can export or delete their data at any time

---

## 🚫 What NOT to Mention

**DO NOT mention:**
- ❌ Activation codes (deprecated system)
- ❌ Sign-up process (handled in separate repo)
- ❌ Public registration
- ❌ Open enrollment

**DO mention:**
- ✅ Exclusive to Maximum 88 verified members
- ✅ Secure email/password authentication
- ✅ Pre-verified user accounts
- ✅ Partner system integration

---

## ✅ Pre-Submission Checklist

- [ ] Test accounts created and credentials documented
- [ ] Privacy Policy published and URL verified
- [ ] Terms of Service published (if required)
- [ ] Support page live and accessible
- [ ] All screenshots prepared (6.7" iPhone)
- [ ] App preview video prepared (optional)
- [ ] Health permissions descriptions finalized
- [ ] App Review notes prepared in App Store Connect
- [ ] Test credentials added to App Store Connect
- [ ] Bundle ID configured
- [ ] Version number set to 2.0.0
- [ ] Build number set to 1 (increment for each submission)
- [ ] Age rating confirmed (12+)
- [ ] Export compliance completed
- [ ] All legal agreements accepted

---

## 📞 Support Contact

**For App Review Issues:**
- Email: support@maxpulse.com (or your support email)
- Response Time: Within 24 hours

**For Technical Issues:**
- Check documentation: https://maxpulse.com/docs
- Contact: technical@maxpulse.com (if different from support)

---

## 📝 Version History

- **v2.0.0** (December 6, 2025): MVP1 Release
  - Initial App Store submission
  - Exclusive sign-in for Maximum 88 members
  - Complete health tracking features
  - AI Coach integration
  - Life Score assessment system

---

**Last Updated:** November 22, 2025  
**Prepared By:** MaxPulse Development Team  
**Status:** Ready for App Store Submission ✅

