#!/bin/bash

# ============================================
# Dock82 - Local Development Setup Script
# ============================================
# This script helps you set up the application locally
# Run: chmod +x setup-local.sh && ./setup-local.sh
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ============================================
# Welcome Message
# ============================================
clear
print_header "🚢 DOCK82 - LOCAL DEVELOPMENT SETUP"
echo "This script will help you set up the Dock82 application locally."
echo "Please make sure you have the required dependencies installed."
echo ""

# ============================================
# Step 1: Check System Requirements
# ============================================
print_header "📋 Step 1: Checking System Requirements"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is NOT installed"
    echo "Please install Node.js v16 or higher from https://nodejs.org"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm is installed: v$NPM_VERSION"
else
    print_error "npm is NOT installed"
    exit 1
fi

# Check Python (optional but recommended)
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python is installed: $PYTHON_VERSION"
    HAS_PYTHON=true
else
    print_warning "Python is NOT installed (optional for Python API endpoints)"
    HAS_PYTHON=false
fi

# Check PostgreSQL (optional)
if command_exists psql; then
    POSTGRES_VERSION=$(psql --version)
    print_success "PostgreSQL is installed: $POSTGRES_VERSION"
    HAS_POSTGRES=true
else
    print_warning "PostgreSQL is NOT installed (you can use Supabase cloud database instead)"
    HAS_POSTGRES=false
fi

# Check Git
if command_exists git; then
    GIT_VERSION=$(git --version)
    print_success "Git is installed: $GIT_VERSION"
else
    print_warning "Git is NOT installed"
fi

# ============================================
# Step 2: Install Dependencies
# ============================================
print_header "📦 Step 2: Installing Dependencies"

print_info "Installing Node.js dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Node.js dependencies installed successfully"
else
    print_error "Failed to install Node.js dependencies"
    exit 1
fi

# Install Python dependencies (if Python is available)
if [ "$HAS_PYTHON" = true ]; then
    print_info "Installing Python dependencies..."
    if [ -f "api/requirements.txt" ]; then
        pip3 install -r api/requirements.txt
        if [ $? -eq 0 ]; then
            print_success "Python dependencies installed successfully"
        else
            print_warning "Some Python dependencies may have failed to install"
        fi
    fi
fi

# ============================================
# Step 3: Environment Variables Setup
# ============================================
print_header "🔐 Step 3: Setting Up Environment Variables"

if [ -f ".env.local" ]; then
    print_warning ".env.local already exists. Skipping creation."
    echo "If you need to update it, please edit .env.local manually or delete it and run this script again."
else
    if [ -f "env.example" ]; then
        print_info "Creating .env.local from env.example..."
        cp env.example .env.local
        print_success ".env.local created successfully"
        echo ""
        print_warning "IMPORTANT: You need to edit .env.local and add your actual credentials!"
        echo ""
        echo "You need to add:"
        echo "  1. Supabase URL and Keys (from https://app.supabase.com)"
        echo "  2. Stripe Keys (from https://dashboard.stripe.com)"
        echo "  3. Database connection string (if using local PostgreSQL)"
        echo ""
        read -p "Press Enter to continue..."
    else
        print_error "env.example file not found!"
        exit 1
    fi
fi

# ============================================
# Step 4: Database Setup (Optional)
# ============================================
print_header "🗄️  Step 4: Database Setup"

echo "You have two options for the database:"
echo "  1. Use Supabase Cloud Database (Recommended for quick start)"
echo "  2. Use Local PostgreSQL Database"
echo ""
read -p "Do you want to set up a local PostgreSQL database? (y/N): " setup_db

if [[ $setup_db =~ ^[Yy]$ ]]; then
    if [ "$HAS_POSTGRES" = true ]; then
        print_info "Setting up local PostgreSQL database..."
        
        # Create database
        createdb dock_rental 2>/dev/null || print_warning "Database 'dock_rental' may already exist"
        
        # Run SQL setup (if available)
        if [ -f "supabase-setup.sql" ]; then
            print_info "Running database schema setup..."
            psql dock_rental -f supabase-setup.sql
            print_success "Database schema created successfully"
        fi
        
        print_success "Local database setup complete"
        print_info "Update POSTGRES_URL in .env.local with: postgresql://localhost:5432/dock_rental"
    else
        print_error "PostgreSQL is not installed. Please install it first or use Supabase cloud database."
    fi
else
    print_info "Skipping local database setup. Make sure to configure Supabase in .env.local"
fi

# ============================================
# Step 5: Verify Setup
# ============================================
print_header "✅ Step 5: Verifying Setup"

# Check if required env vars are set
if [ -f ".env.local" ]; then
    if grep -q "your_supabase_anon_key_here" .env.local; then
        print_warning "Environment variables still contain placeholder values"
        print_info "Please edit .env.local and add your actual credentials"
    else
        print_success "Environment variables appear to be configured"
    fi
fi

# Check if build directory exists
if [ -d "build" ]; then
    print_info "Build directory exists (may contain old build)"
fi

# ============================================
# Step 6: Final Instructions
# ============================================
print_header "🎉 Setup Complete!"

echo "Next steps:"
echo ""
echo "1. Edit your environment variables:"
echo "   ${GREEN}nano .env.local${NC}"
echo ""
echo "2. Start the development server:"
echo "   ${GREEN}npm start${NC}"
echo ""
echo "3. (Optional) Run tests:"
echo "   ${GREEN}npm test${NC}"
echo ""
echo "4. (Optional) Build for production:"
echo "   ${GREEN}npm run build${NC}"
echo ""
echo "📚 For more information, see:"
echo "   - LOCAL_SETUP.md - Detailed setup guide"
echo "   - README.md - Project overview"
echo "   - DATABASE_SETUP.md - Database configuration"
echo ""

print_header "🚀 Ready to Start Development!"

# Ask if user wants to start dev server
read -p "Do you want to start the development server now? (y/N): " start_dev

if [[ $start_dev =~ ^[Yy]$ ]]; then
    print_info "Starting development server..."
    npm start
else
    print_success "Setup complete! Run 'npm start' when you're ready."
fi

