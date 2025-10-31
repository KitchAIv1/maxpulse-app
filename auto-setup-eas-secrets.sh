#!/bin/bash

# MaxPulse EAS Secrets Auto-Setup Script
# This script reads your .env file and creates EAS Secrets automatically

set -e  # Exit on error

echo "🔐 MaxPulse EAS Secrets Auto-Setup"
echo "=================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please make sure you're in the MaxPulse project directory."
    exit 1
fi

# Load environment variables from .env
export $(grep -v '^#' .env | xargs)

# Check if required variables are set
if [ -z "$EXPO_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: EXPO_PUBLIC_SUPABASE_URL not found in .env"
    exit 1
fi

if [ -z "$EXPO_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: EXPO_PUBLIC_SUPABASE_ANON_KEY not found in .env"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY not found in .env"
    exit 1
fi

echo "✅ Found all required environment variables"
echo ""
echo "📋 Creating EAS Secrets..."
echo ""

# Create Supabase URL secret
echo "1️⃣  Creating EXPO_PUBLIC_SUPABASE_URL..."
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "$EXPO_PUBLIC_SUPABASE_URL" --type string --force

# Create Supabase Anon Key secret
echo ""
echo "2️⃣  Creating EXPO_PUBLIC_SUPABASE_ANON_KEY..."
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "$EXPO_PUBLIC_SUPABASE_ANON_KEY" --type string --force

# Create OpenAI API Key secret
echo ""
echo "3️⃣  Creating OPENAI_API_KEY..."
eas secret:create --scope project --name OPENAI_API_KEY --value "$OPENAI_API_KEY" --type string --force

echo ""
echo "=================================="
echo "✅ All EAS Secrets created successfully!"
echo "=================================="
echo ""
echo "🔍 Verifying secrets..."
echo ""
eas secret:list

echo ""
echo "=================================="
echo "🚀 Next Steps:"
echo "=================================="
echo ""
echo "1. Build for TestFlight:"
echo "   eas build --platform ios --profile preview"
echo ""
echo "2. Build for App Store:"
echo "   eas build --platform ios --profile production"
echo ""
echo "3. Submit to App Store:"
echo "   eas submit --platform ios --latest"
echo ""

