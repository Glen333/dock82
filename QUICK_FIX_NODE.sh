#!/bin/bash

# Quick Node.js Fix Using NVM
# Run: bash QUICK_FIX_NODE.sh

echo "🚀 Installing Node.js with NVM (Fast Method)"
echo "=============================================="
echo ""

# Install NVM
echo "📥 Installing NVM..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js LTS
echo ""
echo "📥 Installing Node.js LTS..."
nvm install --lts
nvm use --lts
nvm alias default node

# Verify
echo ""
echo "✅ Verification:"
node --version
npm --version

echo ""
echo "=============================================="
echo "✅ Node.js installed successfully!"
echo ""
echo "Next steps:"
echo "1. cd /Users/centriclearning/Desktop/glen/dock82"
echo "2. npm install"
echo "3. cp env.example .env.local"
echo "4. nano .env.local (add Stripe keys)"
echo "5. npm start"
echo ""
echo "Get Stripe keys from: https://dashboard.stripe.com (TEST MODE)"
echo "=============================================="


