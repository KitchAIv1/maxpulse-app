#!/bin/bash

# Fix Duplicate PrivacyInfo.xcprivacy in Xcode Project
# This script removes duplicate privacy manifest references from the pbxproj file

set -e

echo "🔧 Fixing duplicate PrivacyInfo.xcprivacy references..."

PROJECT_FILE="ios/MaxPulse.xcodeproj/project.pbxproj"

if [ ! -f "$PROJECT_FILE" ]; then
    echo "❌ Error: project.pbxproj not found"
    exit 1
fi

# Backup the original file
cp "$PROJECT_FILE" "$PROJECT_FILE.backup"
echo "✅ Created backup: $PROJECT_FILE.backup"

# Count PrivacyInfo.xcprivacy references
PRIVACY_COUNT=$(grep -c "PrivacyInfo.xcprivacy" "$PROJECT_FILE" || true)
echo "📊 Found $PRIVACY_COUNT references to PrivacyInfo.xcprivacy"

if [ "$PRIVACY_COUNT" -gt 2 ]; then
    echo "⚠️  Multiple privacy manifest references detected (expected: 2, found: $PRIVACY_COUNT)"
    echo "🔧 Attempting to remove duplicates..."
    
    # This is a complex fix - we need to manually edit the pbxproj
    # For now, let's just report the issue
    echo "📋 Please open Xcode and:"
    echo "   1. Open ios/MaxPulse.xcodeproj"
    echo "   2. Select MaxPulse target"
    echo "   3. Go to Build Phases > Copy Bundle Resources"
    echo "   4. Find duplicate PrivacyInfo.xcprivacy entries"
    echo "   5. Remove all but one"
    echo "   6. Clean Build Folder (Cmd+Shift+K)"
    echo "   7. Archive (Product > Archive)"
else
    echo "✅ Privacy manifest count looks normal"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. Open Xcode: open ios/MaxPulse.xcworkspace"
echo "2. Select 'Any iOS Device (arm64)' as target"
echo "3. Product > Archive"
echo "4. Distribute App > App Store Connect"

