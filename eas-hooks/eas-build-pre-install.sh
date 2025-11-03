#!/bin/bash

# EAS Build Pre-Install Hook
# This runs BEFORE installing dependencies

echo "🔧 Running pre-install hook..."

# This hook will run after expo prebuild generates the ios folder
# We'll handle the duplicate PrivacyInfo.xcprivacy issue in post-install instead

echo "✅ Pre-install hook complete"
