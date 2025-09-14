#!/bin/bash

echo "🚀 Setting up GitHub repository for Dock82"
echo "=========================================="

# Check if git is configured
if ! git config --global user.name > /dev/null 2>&1; then
    echo "❌ Git user name not configured"
    echo "Please run: git config --global user.name 'Your Name'"
    exit 1
fi

if ! git config --global user.email > /dev/null 2>&1; then
    echo "❌ Git user email not configured"
    echo "Please run: git config --global user.email 'your.email@example.com'"
    exit 1
fi

echo "✅ Git is properly configured"

# Instructions for creating GitHub repository
echo ""
echo "📋 Manual Steps to Create GitHub Repository:"
echo "============================================="
echo ""
echo "1. Go to https://github.com/new"
echo "2. Repository name: dock82"
echo "3. Description: Professional Dock Rental Management Platform"
echo "4. Make it Public (recommended for sharing)"
echo "5. Do NOT initialize with README (we already have one)"
echo "6. Click 'Create repository'"
echo ""
echo "After creating the repository, run these commands:"
echo "=================================================="
echo ""
echo "git remote add origin https://github.com/YOUR_USERNAME/dock82.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "Replace YOUR_USERNAME with your actual GitHub username"
echo ""
echo "🎉 Your repository will then be available at:"
echo "https://github.com/YOUR_USERNAME/dock82"
echo ""
echo "📚 Additional Setup:"
echo "==================="
echo "1. Add topics to your repository:"
echo "   - dock-rental"
echo "   - react"
echo "   - supabase"
echo "   - stripe"
echo "   - vercel"
echo "   - nodejs"
echo "   - python"
echo ""
echo "2. Enable GitHub Pages (optional):"
echo "   - Go to Settings > Pages"
echo "   - Source: Deploy from a branch"
echo "   - Branch: main, folder: /docs"
echo ""
echo "3. Set up branch protection (recommended):"
echo "   - Go to Settings > Branches"
echo "   - Add rule for main branch"
echo "   - Require pull request reviews"
echo ""
echo "✅ Setup complete! Your Dock82 project is ready for GitHub!"

