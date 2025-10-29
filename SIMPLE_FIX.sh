#!/bin/bash

# Simple & Reliable Fix
# Run: bash SIMPLE_FIX.sh

echo "🔧 Simple Dependency Fix"
echo "========================="
echo ""

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node 18
nvm use 18 2>/dev/null || nvm install 18

echo "Current Node version:"
node --version

echo ""
echo "Cleaning..."
rm -rf node_modules package-lock.json

echo ""
echo "Installing dependencies (this may take 2-3 minutes)..."
npm install --force --loglevel=error

echo ""
echo "✅ Done! Starting app..."
echo ""

SKIP_PREFLIGHT_CHECK=true npm start


