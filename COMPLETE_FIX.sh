#!/bin/bash

# Complete Fix - Resolve All Dependency Issues
# Run: bash COMPLETE_FIX.sh

echo "🔧 Complete Dependency Fix"
echo "=================================================="
echo ""

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "📥 Using Node 18..."
nvm use 18 2>/dev/null || nvm install 18
nvm alias default 18

echo ""
echo "✅ Node version:"
node --version
npm --version

echo ""
echo "🗑️  Complete cleanup..."
rm -rf node_modules package-lock.json

echo ""
echo "📦 Installing with npm 8 (more compatible)..."
# Downgrade to npm 8 for better compatibility with react-scripts 5
npm install -g npm@8

echo ""
echo "📦 Installing project dependencies..."
# Install with force to resolve conflicts
npm install --force

echo ""
echo "🔧 Installing specific ajv version to fix module error..."
npm install ajv@8.12.0 --save-dev --force

echo ""
echo "✅ Setup complete!"
echo ""
echo "=================================================="
echo "🚀 Starting the app..."
echo "=================================================="
echo ""

npm start


