# ⚡ Dock82 - Quick Start Guide

Get Dock82 running on your local machine in 5 minutes!

---

## 🚀 Option 1: Automated Setup (Easiest)

```bash
# 1. Run the setup script
chmod +x setup-local.sh && ./setup-local.sh

# 2. Edit your environment variables
nano .env.local

# 3. Add your credentials (see below)

# 4. Start the app
npm start
```

**Done!** The app will open at http://localhost:3000

---

## 🔧 Option 2: Manual Setup (5 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Environment File

```bash
cp env.example .env.local
```

### Step 3: Add Your Credentials

Edit `.env.local` and add:

**Supabase** (Get from https://app.supabase.com → Settings → API):
```env
REACT_APP_SUPABASE_URL=https://phstdzlniugqbxtfgktb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoc3RkemxuaXVncWJ4dGZna3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTM0MzUsImV4cCI6MjA3MDUyOTQzNX0.u5A8Loh-pk9FCU68Rs1SWE8qBkxx5LXMhK-eM_EtNwM
```

**Stripe Test Keys** (Get from https://dashboard.stripe.com → Developers → API keys):
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### Step 4: Initialize Database (One-Time)

Go to https://app.supabase.com → SQL Editor

Run these SQL files in order:
1. `supabase-setup.sql`
2. `create-superadmin.sql`
3. `setup-storage.sql`

### Step 5: Start the App

```bash
npm start
```

**Done!** Visit http://localhost:3000

---

## 📝 Get Your API Keys

### Supabase Keys (Already Configured!)

The project uses an existing Supabase project. You can use the values above or get your own:

1. Go to https://app.supabase.com
2. Create/select your project
3. Settings → API
4. Copy URL and `anon` key

### Stripe Test Keys (Required)

1. Go to https://dashboard.stripe.com
2. Switch to **Test Mode** (toggle in top right)
3. Developers → API keys
4. Copy **Publishable key** and **Secret key**

**⚠️ Use TEST keys only!** (pk_test_... and sk_test_...)

---

## 🧪 Test Your Setup

### 1. Check the App Loads

```bash
npm start
```

- ✅ Browser opens to http://localhost:3000
- ✅ Dock slips are visible
- ✅ No errors in console (F12)

### 2. Test Registration

1. Click "Register"
2. Create an account
3. Verify you can login

### 3. Test Payments (Stripe Test Mode)

1. Book a slip
2. Use test card: `4242 4242 4242 4242`
3. Expiry: `12/34`, CVC: `123`
4. Payment should succeed

### 4. Test Admin Access

Login as superadmin:
- Email: `Glen@centriclearning.net`
- Password: `Dock82Admin2024!`

---

## 🐛 Common Issues

### "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
```

### "Supabase not connecting"

```bash
# Verify .env.local exists and has values
cat .env.local

# Restart dev server
npm start
```

### "Port 3000 already in use"

```bash
# Use different port
PORT=3001 npm start
```

### "Stripe payment fails"

- Make sure you're using **TEST** keys (pk_test_...)
- Use test card: `4242 4242 4242 4242`
- Check Stripe Dashboard for errors

---

## 📚 Need More Help?

See the detailed guides:
- **[LOCAL_SETUP.md](LOCAL_SETUP.md)** - Complete setup guide
- **[README.md](README.md)** - Project overview
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Database details
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues

---

## ✅ Quick Checklist

- [ ] Node.js installed (v16+)
- [ ] Ran `npm install`
- [ ] Created `.env.local`
- [ ] Added Supabase credentials
- [ ] Added Stripe test keys
- [ ] Ran `npm start`
- [ ] App loads at http://localhost:3000
- [ ] Can browse slips
- [ ] Can register/login

---

## 🎉 You're Ready!

**Start developing:**
```bash
npm start
```

**Happy coding! 🚢**

