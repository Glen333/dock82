#!/bin/bash

# Quick Fix for React Scripts Compatibility
# Run: bash QUICK_FIX_APP.sh

echo "🔧 Fixing React Scripts Compatibility Issue"
echo "=============================================="
echo ""

# Check if NVM is installed
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    echo "✅ NVM found, loading..."
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
else
    echo "❌ NVM not found. Installing NVM first..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

echo ""
echo "📥 Installing Node.js 16 (compatible with react-scripts 5.0.1)..."
nvm install 16
nvm use 16
nvm alias default 16

echo ""
echo "🗑️  Cleaning old dependencies..."
rm -rf node_modules package-lock.json

echo ""
echo "📦 Installing fresh dependencies..."
npm install

echo ""
echo "✅ Everything is ready!"
echo ""
echo "=============================================="
echo "🚀 Starting the development server..."
echo "=============================================="
echo ""

npm start


