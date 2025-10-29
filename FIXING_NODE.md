# 🔧 Fixing Node.js Library Issue

## Problem

You're getting this error:
```
dyld: Library not loaded: /usr/local/opt/icu4c/lib/libicui18n.63.dylib
Referenced from: /usr/local/Cellar/node/11.6.0/bin/node
```

**Root Cause**: Your Node.js version (11.6.0) is very old and requires an outdated ICU library that's no longer available.

---

## ✅ Solution: Upgrade Node.js

We're upgrading from Node.js 11.6.0 → 24.9.0

### Command Running Now:

```bash
brew upgrade node
```

This will:
1. Download Node.js 24.9.0
2. Install all required dependencies
3. Fix the ICU library issue
4. Give you a modern, supported Node.js version

**⏱️ Estimated Time**: 5-10 minutes

---

## After Node.js Upgrade Completes

### 1. Verify Node.js Works

```bash
node --version
# Should show: v24.9.0 or similar

npm --version
# Should show: 10.x.x or similar
```

### 2. Install Project Dependencies

```bash
cd /Users/centriclearning/Desktop/glen/dock82
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the template
cp env.example .env.local

# Edit and add your credentials
nano .env.local
```

### 4. Start the Application

```bash
npm start
```

---

## 🔐 Required Credentials for .env.local

### Supabase (Already Configured)
```env
REACT_APP_SUPABASE_URL=https://phstdzlniugqbxtfgktb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoc3RkemxuaXVncWJ4dGZna3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTM0MzUsImV4cCI6MjA3MDUyOTQzNX0.u5A8Loh-pk9FCU68Rs1SWE8qBkxx5LXMhK-eM_EtNwM
```

### Stripe (You Need to Add)
1. Go to https://dashboard.stripe.com
2. Switch to **TEST MODE** (top right toggle)
3. Developers → API keys
4. Add to .env.local:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
```

---

## Alternative: Use NVM (Node Version Manager)

If you want more control over Node.js versions:

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or source profile
source ~/.zshrc

# Install Node.js LTS
nvm install --lts

# Use it
nvm use --lts

# Verify
node --version
```

---

## ✅ Checklist After Fix

- [ ] `node --version` shows v24.x.x
- [ ] `npm --version` works
- [ ] `npm install` completes successfully
- [ ] `.env.local` file created
- [ ] Stripe keys added to `.env.local`
- [ ] `npm start` runs without errors
- [ ] Browser opens to http://localhost:3000
- [ ] App loads successfully

---

## 🚀 Quick Start After Node.js Fix

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp env.example .env.local

# 3. Add Stripe keys to .env.local
nano .env.local

# 4. Start the app
npm start
```

---

## 📚 Next Steps

Once the app is running:
1. Read [START_HERE.md](START_HERE.md)
2. Follow [QUICKSTART.md](QUICKSTART.md)
3. Test with Stripe test card: `4242 4242 4242 4242`

---

**You're on the right track! Once Node.js finishes upgrading, you'll be all set! 🎉**

