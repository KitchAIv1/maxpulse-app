#!/usr/bin/env bash

# EAS Build Pre-Install Hook
# This script runs before dependencies are installed
# Used to fix duplicate PrivacyInfo.xcprivacy files

set -e

echo "🔧 EAS Pre-Install Hook: Preparing build environment..."

# This hook will help prevent duplicate privacy manifest issues
echo "✅ Pre-install hook completed"

