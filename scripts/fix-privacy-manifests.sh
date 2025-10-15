#!/bin/bash

# Fix duplicate PrivacyInfo.xcprivacy files
echo "🔧 Fixing duplicate PrivacyInfo.xcprivacy files..."

# Remove all PrivacyInfo.xcprivacy files from node_modules except React core
find node_modules -name "PrivacyInfo.xcprivacy" -not -path "*/react-native/React/*" -delete

# Remove from iOS Pods if they exist
if [ -d "ios/Pods" ]; then
    find ios/Pods -name "PrivacyInfo.xcprivacy" -not -path "*/React.framework/*" -delete
fi

# Remove from main iOS app
rm -f ios/MaxPulse/PrivacyInfo.xcprivacy

echo "✅ Privacy manifest cleanup complete"
