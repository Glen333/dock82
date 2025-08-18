#!/bin/bash

echo "🔑 Adding Environment Variables to Vercel"
echo "=========================================="
echo ""

echo "⚠️  IMPORTANT: You need your actual Stripe keys for this to work!"
echo ""

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "   npm i -g vercel"
    exit 1
fi

echo "📝 Please provide your Stripe keys when prompted:"
echo ""

# Add STRIPE_SECRET_KEY
echo "🔐 Adding STRIPE_SECRET_KEY..."
echo "Enter your Stripe Secret Key (starts with 'sk_live_' or 'sk_test_'):"
read -s STRIPE_SECRET_KEY

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "❌ No secret key provided. Skipping..."
else
    echo "$STRIPE_SECRET_KEY" | vercel env add STRIPE_SECRET_KEY production
    echo "✅ STRIPE_SECRET_KEY added to production environment"
fi

echo ""

# Add STRIPE_PUBLISHABLE_KEY
echo "🔑 Adding STRIPE_PUBLISHABLE_KEY..."
echo "Enter your Stripe Publishable Key (starts with 'pk_live_' or 'pk_test_'):"
read -s STRIPE_PUBLISHABLE_KEY

if [ -z "$STRIPE_PUBLISHABLE_KEY" ]; then
    echo "❌ No publishable key provided. Skipping..."
else
    echo "$STRIPE_PUBLISHABLE_KEY" | vercel env add STRIPE_PUBLISHABLE_KEY production
    echo "✅ STRIPE_PUBLISHABLE_KEY added to production environment"
fi

echo ""

# Add API URL
echo "🌐 Adding REACT_APP_API_URL..."
echo "Enter your API URL (or press Enter to use default):"
read API_URL

if [ -z "$API_URL" ]; then
    API_URL="https://dock-rental-backend.vercel.app"
    echo "Using default API URL: $API_URL"
fi

echo "$API_URL" | vercel env add REACT_APP_API_URL production
echo "✅ REACT_APP_API_URL added to production environment"

echo ""
echo "🎉 Environment variables added successfully!"
echo ""
echo "📋 Summary:"
echo "- STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:0:10}..."
echo "- STRIPE_PUBLISHABLE_KEY: ${STRIPE_PUBLISHABLE_KEY:0:10}..."
echo "- REACT_APP_API_URL: $API_URL"
echo ""
echo "🚀 Next steps:"
echo "1. Deploy your app: vercel --prod"
echo "2. Test the payment integration"
echo "3. Check that everything works correctly"
echo ""
echo "🔒 Security reminder:"
echo "- Keys are now stored securely in Vercel"
echo "- Never commit keys to version control"
echo "- Keys are encrypted and secure"
