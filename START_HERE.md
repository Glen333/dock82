# 🚢 START HERE - Dock82 Local Development

**Welcome!** You've successfully imported the Dock82 project. Follow these steps to get it running locally.

---

## ⚡ Quick Start (Choose One)

### 🤖 Option A: Automated Setup (Recommended)

```bash
./setup-local.sh
```

The script will guide you through everything!

### ✋ Option B: Manual Setup (4 Commands)

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp env.example .env.local

# 3. Edit .env.local with your credentials
nano .env.local

# 4. Start the app
npm start
```

---

## 🔑 Required Credentials

You need to add these to `.env.local`:

### 1. Supabase (Database & Auth)

**Option A: Use Existing Project** (Easiest)
```env
REACT_APP_SUPABASE_URL=https://phstdzlniugqbxtfgktb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoc3RkemxuaXVncWJ4dGZna3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTM0MzUsImV4cCI6MjA3MDUyOTQzNX0.u5A8Loh-pk9FCU68Rs1SWE8qBkxx5LXMhK-eM_EtNwM
```

**Option B: Create Your Own Project**
1. Go to https://app.supabase.com
2. Create new project
3. Settings → API → Copy URL and anon key

### 2. Stripe (Payments)

**You must get your own test keys:**

1. Go to https://dashboard.stripe.com
2. Switch to **TEST MODE** (toggle in top-right)
3. Developers → API keys
4. Copy both keys:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

⚠️ **NEVER use live keys in development!**

---

## 🎯 One-Time Database Setup

### If Using Existing Supabase Project

Database is already set up! Skip this step.

### If Using Your Own Supabase Project

1. Go to https://app.supabase.com
2. Open your project
3. SQL Editor → New Query
4. Run these files in order:
   - `supabase-setup.sql`
   - `create-superadmin.sql`
   - `setup-storage.sql`

---

## 🚀 Start Developing

```bash
npm start
```

The app will open at **http://localhost:3000**

### You Should See:
- ✅ Dock slips displayed
- ✅ Images loaded
- ✅ Can click "Login" or "Register"
- ✅ No errors in browser console (F12)

---

## 🧪 Test Everything Works

### 1. Test Registration
1. Click "Register"
2. Create an account
3. Verify you can login

### 2. Test Payments
1. Book a dock slip
2. Use Stripe test card: **4242 4242 4242 4242**
3. Expiry: **12/34**, CVC: **123**
4. Payment should succeed

### 3. Test Admin Access
Login as superadmin:
- Email: **Glen@centriclearning.net**
- Password: **Dock82Admin2024!**

---

## 🐛 Troubleshooting

### ❌ "Cannot find module" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Blank page / App won't load

```bash
# Check .env.local exists
ls -la .env.local

# Verify it has values (not placeholders)
cat .env.local

# Restart the server
npm start
```

### ❌ "Port 3000 already in use"

```bash
PORT=3001 npm start
```

### ❌ Stripe payment fails

- Use **TEST** keys (pk_test_... and sk_test_...)
- Use test card: **4242 4242 4242 4242**
- Check you're in Stripe **test mode**

### ❌ Node.js library errors

Your Node.js version might be outdated or have issues. Try:

```bash
# Check Node version
node --version

# If you see library errors, try reinstalling Node.js
# Or use nvm to switch versions
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **[QUICKSTART.md](QUICKSTART.md)** | 5-minute setup guide |
| **[LOCAL_SETUP.md](LOCAL_SETUP.md)** | Complete setup guide with troubleshooting |
| **[README.md](README.md)** | Project overview and features |
| **[DATABASE_SETUP.md](DATABASE_SETUP.md)** | Database details |
| **env.example** | Environment variables template |

---

## 🎓 What This App Does

**Dock82** is a dock slip rental platform with:

- 🏠 **For Renters**: Browse and book dock slips
- 💳 **Payments**: Secure Stripe integration
- 👨‍💼 **For Admins**: Manage slips, bookings, and users
- 🔐 **Security**: Role-based access control
- 📧 **Notifications**: Email confirmations

**Tech Stack:**
- Frontend: React + Tailwind CSS
- Backend: Node.js + Supabase
- Payments: Stripe
- Database: PostgreSQL (via Supabase)

---

## ✅ Setup Checklist

Before starting development:

- [ ] Ran `npm install`
- [ ] Created `.env.local` file
- [ ] Added Supabase credentials
- [ ] Added Stripe **TEST** keys
- [ ] Database initialized (if needed)
- [ ] Ran `npm start`
- [ ] App loads without errors
- [ ] Can see dock slips
- [ ] Registration works
- [ ] Payments work (with test card)

---

## 🚨 Important Notes

### 1. Environment Variables
- `.env.local` is in `.gitignore` - **NEVER commit it!**
- Always use **TEST** keys for Stripe in development
- The `env.example` file is your template

### 2. Database
- Supabase project is already configured
- You can use the existing one or create your own
- Database schema is in `supabase-setup.sql`

### 3. Payments
- Always use Stripe **test mode** in development
- Test card: **4242 4242 4242 4242**
- Don't use real payment info while testing!

### 4. Admin Access
- Superadmin: **Glen@centriclearning.net**
- Password: **Dock82Admin2024!**
- Has full system access

---

## 🆘 Need Help?

1. **Read the docs**: Start with [QUICKSTART.md](QUICKSTART.md)
2. **Check troubleshooting**: See [LOCAL_SETUP.md](LOCAL_SETUP.md)
3. **Browser console**: Open DevTools (F12) and check for errors
4. **Supabase logs**: Check your Supabase dashboard
5. **Stripe dashboard**: Review Stripe logs for payment issues

---

## 🎉 You're Ready to Go!

**Run this command to start:**

```bash
npm start
```

**Then visit:** http://localhost:3000

---

**Happy Coding! 🚢**

*Last updated: 2025-10-08*

