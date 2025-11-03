#!/bin/bash

# EAS Build Post-Install Hook
# This runs AFTER pod install, BEFORE Xcode build

echo "🔧 Running post-install hook to fix duplicate PrivacyInfo.xcprivacy..."

# Remove duplicate PrivacyInfo.xcprivacy from IQKeyboardManagerSwift pod
PRIVACY_FILE="ios/Pods/IQKeyboardManagerSwift/IQKeyboardManagerSwift/PrivacyInfo.xcprivacy"

if [ -f "$PRIVACY_FILE" ]; then
  echo "📄 Found duplicate PrivacyInfo.xcprivacy in IQKeyboardManagerSwift pod"
  rm -f "$PRIVACY_FILE"
  echo "✅ Removed duplicate PrivacyInfo.xcprivacy"
else
  echo "ℹ️ No duplicate PrivacyInfo.xcprivacy found (already handled or not present)"
fi

echo "✅ Post-install hook complete"
