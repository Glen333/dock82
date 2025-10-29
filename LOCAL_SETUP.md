# 🚀 Dock82 - Local Development Setup Guide

Complete guide to setting up and running the Dock82 application on your local machine.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Manual Setup](#manual-setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)
7. [Development Workflow](#development-workflow)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required

- **Node.js** (v16 or higher)
  ```bash
  node --version  # Should be v16.x or higher
  ```
  Download from: https://nodejs.org

- **npm** (comes with Node.js)
  ```bash
  npm --version
  ```

### Optional (but recommended)

- **Git** - For version control
  ```bash
  git --version
  ```

- **Python 3** - For Python API endpoints (optional)
  ```bash
  python3 --version
  ```

- **PostgreSQL** - For local database (can use Supabase cloud instead)
  ```bash
  psql --version
  ```

---

## ⚡ Quick Start

### Automated Setup (Recommended)

Run the automated setup script:

```bash
# Make the script executable
chmod +x setup-local.sh

# Run the setup script
./setup-local.sh
```

The script will:
- ✅ Check system requirements
- ✅ Install dependencies
- ✅ Create environment configuration
- ✅ Guide you through database setup
- ✅ Verify the setup

---

## 🔨 Manual Setup

If you prefer manual setup or the script didn't work:

### Step 1: Clone the Repository

```bash
# If you haven't already
git clone https://github.com/yourusername/dock82.git
cd dock82
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (optional)
pip3 install -r api/requirements.txt
```

### Step 3: Set Up Environment Variables

```bash
# Copy the example environment file
cp env.example .env.local

# Edit the file and add your actual credentials
nano .env.local  # or use your preferred editor
```

### Step 4: Configure Your Credentials

Edit `.env.local` and replace the placeholder values:

#### **A. Supabase Setup**

1. Go to https://app.supabase.com
2. Create a new project (or use existing)
3. Go to Settings → API
4. Copy the following:
   - Project URL → `REACT_APP_SUPABASE_URL`
   - `anon` `public` key → `REACT_APP_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...your_actual_key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_actual_service_key
```

#### **B. Stripe Setup**

1. Go to https://dashboard.stripe.com
2. Get your **Test** API keys (for development)
3. Dashboard → Developers → API keys
4. Copy:
   - Publishable key → `REACT_APP_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...your_actual_key
STRIPE_SECRET_KEY=sk_test_...your_actual_key
```

**⚠️ IMPORTANT**: Use **TEST** keys for development, not live keys!

#### **C. Database Setup (Optional)**

If using local PostgreSQL:

```bash
# Create the database
createdb dock_rental

# Update .env.local
POSTGRES_URL=postgresql://localhost:5432/dock_rental
```

If using Supabase cloud database (easier):
- Just keep your Supabase credentials configured
- No additional database setup needed!

### Step 5: Initialize the Database

#### Option A: Using Supabase (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL files in order:
   ```sql
   -- Copy and paste contents from:
   1. supabase-setup.sql
   2. create-superadmin.sql
   3. setup-storage.sql
   ```

#### Option B: Using Local PostgreSQL

```bash
# Run the setup SQL scripts
psql dock_rental -f supabase-setup.sql
psql dock_rental -f create-superadmin.sql
psql dock_rental -f setup-storage.sql
```

---

## ▶️ Running the Application

### Development Mode

```bash
# Start the React development server
npm start
```

The application will open at: http://localhost:3000

### What You Should See

- ✅ Browser opens automatically
- ✅ Application loads without errors
- ✅ You can browse dock slips
- ✅ Login/Register forms work

### Common Start-Up Issues

**Issue: "Module not found" errors**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Issue: "Failed to compile" with Supabase errors**
```bash
# Solution: Check your .env.local file
cat .env.local  # Verify credentials are correct
```

**Issue: Port 3000 already in use**
```bash
# Solution: Use a different port
PORT=3001 npm start
```

---

## 🔐 Configuration Details

### Environment Variables Breakdown

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `REACT_APP_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `REACT_APP_SUPABASE_ANON_KEY` | Public Supabase key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin Supabase key | Supabase Dashboard → Settings → API |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Stripe public key | Stripe Dashboard → Developers → API keys |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe Dashboard → Developers → API keys |
| `POSTGRES_URL` | Database connection | Local PostgreSQL or Supabase |

### Using Vercel's Values Locally

The project already has Supabase configured. You can use the existing values from `vercel.json`:

```env
REACT_APP_SUPABASE_URL=https://phstdzlniugqbxtfgktb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoc3RkemxuaXVncWJ4dGZna3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTM0MzUsImV4cCI6MjA3MDUyOTQzNX0.u5A8Loh-pk9FCU68Rs1SWE8qBkxx5LXMhK-eM_EtNwM
```

**Note**: For Stripe, you need to get your own test keys.

---

## 🧪 Testing the Setup

### 1. Test the Frontend

```bash
npm start
```

Visit http://localhost:3000 and verify:
- ✅ Page loads without errors
- ✅ Dock slips are visible
- ✅ Images load correctly

### 2. Test Authentication

1. Click "Login" or "Register"
2. Try creating a new account
3. Verify email verification works (check Supabase Auth)

### 3. Test Stripe (with test mode)

1. Try to book a slip
2. Use Stripe test card: `4242 4242 4242 4242`
3. Expiry: Any future date
4. CVC: Any 3 digits
5. Verify payment goes through

### 4. Test Admin Features

Login with superadmin credentials:
- Email: `Glen@centriclearning.net`
- Password: `Dock82Admin2024!`

Verify admin panel loads.

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. **Blank page or white screen**

**Symptoms**: Browser shows blank page, no errors in console

**Solutions**:
```bash
# Clear cache and rebuild
rm -rf build
npm start

# Check browser console for errors (F12 → Console)
```

#### 2. **Supabase connection errors**

**Symptoms**: "Invalid API key" or "Failed to fetch"

**Solutions**:
```bash
# Verify environment variables are loaded
echo $REACT_APP_SUPABASE_URL

# If empty, restart the dev server
# Kill the server (Ctrl+C) and restart
npm start

# Check .env.local file exists and has correct values
cat .env.local
```

#### 3. **Stripe payment failing**

**Symptoms**: Payment doesn't complete, shows error

**Solutions**:
- Verify you're using **test** keys (pk_test_... and sk_test_...)
- Use Stripe test card: `4242 4242 4242 4242`
- Check Stripe Dashboard → Developers → Logs for errors

#### 4. **Database errors**

**Symptoms**: "relation does not exist" or "table not found"

**Solutions**:
```bash
# Reinitialize the database
psql dock_rental -f supabase-setup.sql

# Or in Supabase dashboard, run the SQL scripts manually
```

#### 5. **Module not found errors**

**Symptoms**: `Cannot find module '@supabase/supabase-js'`

**Solutions**:
```bash
# Reinstall dependencies
npm install

# If using Python APIs
pip3 install -r api/requirements.txt
```

#### 6. **Port already in use**

**Symptoms**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm start
```

---

## 💻 Development Workflow

### Making Changes

1. **Edit files** in `src/` directory
2. **Save** - Changes auto-reload in browser
3. **Test** - Verify functionality works
4. **Commit** - Save your changes to git

### Project Structure

```
dock82/
├── src/                          # Frontend React code
│   ├── DockRentalPlatform.js    # Main application
│   ├── PaymentPage.js           # Stripe integration
│   └── supabase.js              # Supabase client
├── api/                         # Backend API endpoints
│   ├── *.js                     # Node.js APIs
│   └── *.py                     # Python APIs
├── public/                      # Static files
├── .env.local                   # Your local config (DON'T commit!)
└── package.json                 # Dependencies
```

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests (if configured)
npm test

# Serve production build locally
npx serve -s build
```

### Hot Reload

The app uses React's hot reload:
- ✅ CSS changes apply instantly
- ✅ JS changes reload the page
- ✅ No need to restart the server

### Debugging

```bash
# Enable debug mode
echo "REACT_APP_DEBUG_MODE=true" >> .env.local

# View detailed logs in browser console (F12)
```

---

## 🚀 Building for Production

### Local Production Build

```bash
# Create optimized production build
npm run build

# Test the production build locally
npx serve -s build
```

### Deploying to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

---

## 📚 Additional Resources

### Documentation

- [README.md](README.md) - Project overview
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database configuration
- [COMPREHENSIVE_TEST_PLAN.md](COMPREHENSIVE_TEST_PLAN.md) - Testing guide
- [STRIPE_TESTING_SETUP.md](STRIPE_TESTING_SETUP.md) - Stripe testing

### External Resources

- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Getting Help

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review existing documentation files
3. Check browser console for errors (F12)
4. Review Supabase logs in dashboard
5. Check Stripe dashboard for payment issues

---

## ✅ Setup Checklist

Before you start development, verify:

- [ ] Node.js v16+ installed
- [ ] npm installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file created and configured
- [ ] Supabase credentials added
- [ ] Stripe test keys added
- [ ] Database initialized (Supabase or local)
- [ ] Development server starts without errors (`npm start`)
- [ ] Application loads in browser
- [ ] Can browse dock slips
- [ ] Can register/login
- [ ] Admin access works (if needed)

---

## 🎉 You're All Set!

You should now have a fully functional local development environment.

**Next Steps**:
1. Explore the application
2. Read through the codebase
3. Make your first change
4. Test thoroughly
5. Have fun building! 🚢

**Need help?** Review the documentation files or check the troubleshooting section above.

---

**Happy Coding! 🚀**

