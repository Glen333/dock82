#!/bin/bash

# Final Fix - Use Node 18 (Perfect Balance)
# Run: bash FINAL_FIX.sh

echo "🔧 Installing Node 18 (Perfect for this project)"
echo "=================================================="
echo ""

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "📥 Installing Node.js 18 LTS..."
nvm install 18
nvm use 18
nvm alias default 18

echo ""
echo "✅ Node 18 installed:"
node --version
npm --version

echo ""
echo "🗑️  Cleaning old dependencies..."
rm -rf node_modules package-lock.json

echo ""
echo "📦 Installing dependencies with --legacy-peer-deps..."
npm install --legacy-peer-deps

echo ""
echo "✅ Setup complete!"
echo ""
echo "=================================================="
echo "🚀 Starting the app..."
echo "=================================================="
echo ""

npm start


