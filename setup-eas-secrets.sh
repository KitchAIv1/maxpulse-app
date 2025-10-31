#!/bin/bash

# MaxPulse EAS Secrets Setup Script
# Run this script to set up your EAS Secrets for production builds

echo "🔐 Setting up EAS Secrets for MaxPulse MVP1..."
echo ""
echo "⚠️  IMPORTANT: You need to provide your actual credentials!"
echo ""
echo "📋 Instructions:"
echo "1. Open your .env file: cat .env"
echo "2. Copy your EXPO_PUBLIC_SUPABASE_URL"
echo "3. Copy your EXPO_PUBLIC_SUPABASE_ANON_KEY"
echo "4. Copy your OPENAI_API_KEY"
echo "5. Run the commands below with your actual values"
echo ""
echo "================================================"
echo "COMMANDS TO RUN:"
echo "================================================"
echo ""
echo "# 1. Set Supabase URL"
echo 'eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "YOUR_SUPABASE_URL_HERE" --type string'
echo ""
echo "# 2. Set Supabase Anon Key"
echo 'eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_SUPABASE_ANON_KEY_HERE" --type string'
echo ""
echo "# 3. Set OpenAI API Key"
echo 'eas secret:create --scope project --name OPENAI_API_KEY --value "YOUR_OPENAI_KEY_HERE" --type string'
echo ""
echo "================================================"
echo "VERIFY SECRETS:"
echo "================================================"
echo ""
echo "After creating all secrets, verify with:"
echo "eas secret:list"
echo ""
echo "You should see:"
echo "  - EXPO_PUBLIC_SUPABASE_URL"
echo "  - EXPO_PUBLIC_SUPABASE_ANON_KEY"
echo "  - OPENAI_API_KEY"
echo ""
echo "================================================"
echo ""
echo "🚀 After secrets are set up, you can build with:"
echo "eas build --platform ios --profile production"
echo ""

