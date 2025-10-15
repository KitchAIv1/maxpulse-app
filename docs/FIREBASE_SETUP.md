# Firebase Setup Guide for MaxPulse

## 🔥 Quick Setup (5 minutes)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: **MaxPulse**
4. Enable Google Analytics (recommended)
5. Choose or create Analytics account
6. Click **"Create project"**

### Step 2: Add iOS App
1. In Firebase Console, click the **iOS** icon
2. **iOS bundle ID**: `com.maxpulse.app` (from your app.json)
3. **App nickname**: MaxPulse iOS
4. **App Store ID**: (skip for now)
5. Click **"Register app"**
6. **Download `GoogleService-Info.plist`**
7. Place file in: `/Users/willis/Downloads/MaxApp/ios/MaxPulse/GoogleService-Info.plist`

### Step 3: Add Android App
1. In Firebase Console, click the **Android** icon
2. **Android package name**: `com.maxpulse.app` (from your app.json)
3. **App nickname**: MaxPulse Android
4. **SHA-1**: (optional, get from: `cd android && ./gradlew signingReport`)
5. Click **"Register app"**
6. **Download `google-services.json`**
7. Place file in: `/Users/willis/Downloads/MaxApp/android/app/google-services.json`

### Step 4: Enable Firebase Services
In Firebase Console, enable these services:

#### Analytics (Free)
- Already enabled by default
- Go to **Analytics > Events** to see real-time data

#### Performance Monitoring (Free)
1. Go to **Performance** in left sidebar
2. Click **"Get Started"**
3. Enable Performance Monitoring

#### Crashlytics (Free)
1. Go to **Crashlytics** in left sidebar
2. Click **"Get Started"**
3. Enable Crashlytics

### Step 5: Configure iOS (Xcode)
1. Open Xcode: `xed ios/`
2. In Xcode, right-click **MaxPulse** folder → **Add Files to "MaxPulse"**
3. Select `GoogleService-Info.plist`
4. ✅ Check **"Copy items if needed"**
5. ✅ Check **"Add to targets: MaxPulse"**

### Step 6: Configure Android
The `google-services.json` file should be in `android/app/`

Update `android/build.gradle` (project level):
```gradle
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

Update `android/app/build.gradle`:
```gradle
apply plugin: 'com.android.application'
// Add this line at the bottom
apply plugin: 'com.google.gms.google-services'
```

### Step 7: Rebuild Native Apps
```bash
# iOS
cd ios && pod install && cd ..
npx expo run:ios

# Android
npx expo run:android
```

## 🎯 Verify Installation

After setup, you should see:
```
✅ ios/MaxPulse/GoogleService-Info.plist
✅ android/app/google-services.json
```

Run the app and check Firebase Console:
- **Analytics > Events** - Should show `first_open` event within 24 hours
- **Performance** - Should show automatic traces
- **Crashlytics** - Should show "Waiting for data"

## 📊 What You Get

### Analytics (Automatic)
- Screen views
- User engagement
- Device info
- App opens/backgrounds

### Performance (Automatic)
- App start time
- Screen rendering
- Network requests
- Custom traces

### Crashlytics (Automatic)
- Crash reports
- ANR detection
- Error logs
- User breadcrumbs

## 🔐 Security Notes

### Environment Variables
For sensitive config, use `.env`:
```bash
FIREBASE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id
```

### Privacy
- Firebase is HIPAA compliant (when enabled)
- Analytics can be disabled per-user
- Data retention is configurable

## 📱 Testing

### Debug Mode (iOS)
```bash
# Enable debug logging
npx react-native run-ios --extra-info='firbaseDebugging'
```

### Debug Mode (Android)
```bash
adb shell setprop debug.firebase.analytics.app com.maxpulse.app
```

### Verify Events
```bash
# View Firebase debug logs
npx firebase-tools
```

## 🚀 Next Steps

1. Complete the setup above
2. Let the agent integrate Firebase into WelcomeScreen
3. View data in Firebase Console
4. Scale to other components

## 📚 Resources

- [Firebase React Native Docs](https://rnfirebase.io)
- [Analytics Events](https://firebase.google.com/docs/analytics/events)
- [Performance Monitoring](https://firebase.google.com/docs/perf-mon)
- [Crashlytics](https://firebase.google.com/docs/crashlytics)

---

**⚠️ IMPORTANT**: Don't commit `GoogleService-Info.plist` or `google-services.json` to public repos!
Add to `.gitignore`:
```
ios/MaxPulse/GoogleService-Info.plist
android/app/google-services.json
```

