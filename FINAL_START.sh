#!/bin/bash

# Final Fix - Downgrade webpack-dev-server
# Run: bash FINAL_START.sh

echo "🔧 Installing Compatible webpack-dev-server"
echo "============================================="
echo ""

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node 18
nvm use 18 2>/dev/null

echo "Current versions:"
node --version
npm --version

echo ""
echo "🗑️  Cleaning..."
rm -rf node_modules package-lock.json

echo ""
echo "📦 Installing dependencies with compatible webpack-dev-server..."
npm install --force

echo ""
echo "✅ Installation complete!"
echo ""
echo "============================================="
echo "🚀 Starting the application..."
echo "============================================="
echo ""

npm start


