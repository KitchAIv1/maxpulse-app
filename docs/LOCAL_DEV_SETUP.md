# Local Development Setup Guide

## Quick Start: Development Build on Physical Device

### Step 1: Delete TestFlight App
1. On your iPhone, long-press the MaxPulse app icon
2. Tap "Remove App" → "Delete App"
3. This removes the TestFlight version

### Step 2: Connect Your iPhone
1. Connect your iPhone to your Mac via USB cable
2. Unlock your iPhone and trust the computer if prompted
3. Make sure both devices are on the **same WiFi network**

### Step 3: Build & Install Development Client Locally

Run this command in your terminal (from the MaxApp directory):

```bash
npx expo run:ios --device
```

**What this does:**
- Builds a development client with all native modules
- Installs it directly to your connected iPhone
- Opens the Expo dev server automatically

### Step 4: Connect to Dev Server

After the app installs:
1. The app will open automatically
2. It should connect to your local dev server automatically
3. If it doesn't connect, shake your device → "Configure Bundler" → Enter your Mac's IP address

**To find your Mac's IP address:**
```bash
ipconfig getifaddr en0
```

### Step 5: Start Development Server

In a separate terminal, run:
```bash
npm start
```

Or if you want to start fresh:
```bash
npx expo start --clear
```

---

## Alternative: EAS Development Build (If Local Build Fails)

If `npx expo run:ios --device` doesn't work, use EAS:

### Step 1: Build Development Client via EAS

Run this in your terminal (you'll need to enter Apple credentials):
```bash
eas build --platform ios --profile development-device
```

### Step 2: Install via TestFlight or Direct Download

Once build completes:
1. Download the `.ipa` file from EAS dashboard
2. Install via TestFlight (internal testing) or direct install

### Step 3: Start Dev Server

```bash
npm start
```

### Step 4: Connect in App

1. Open the development client app on your phone
2. Scan the QR code from terminal OR
3. Shake device → "Configure Bundler" → Enter your Mac's IP

---

## Troubleshooting

### App Shows "Unable to connect to server"
- Make sure Mac and iPhone are on same WiFi
- Check firewall isn't blocking port 8081
- Try entering IP manually: Shake device → "Configure Bundler"

### Build Fails Locally
- Make sure Xcode is installed and updated
- Run `xcode-select --install` if needed
- Check that your Apple Developer account is set up in Xcode

### Still Having Issues?
- Use the EAS development build option instead
- Check Expo docs: https://docs.expo.dev/development/introduction/

