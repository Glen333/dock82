# 🚀 Install Node.js with NVM (Recommended - Faster!)

## Why NVM?
- ✅ **Much faster** - Uses pre-built binaries, no compilation
- ✅ **Easy version switching** - Manage multiple Node.js versions
- ✅ **No library conflicts** - Avoids ICU issues
- ✅ **Takes 2 minutes** instead of 30+ minutes

---

## Step 1: Install NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
```

## Step 2: Load NVM (Choose your shell)

### If using Zsh (default on macOS):
```bash
source ~/.zshrc
```

### If using Bash:
```bash
source ~/.bashrc
```

## Step 3: Install Node.js LTS

```bash
nvm install --lts
nvm use --lts
```

## Step 4: Verify Installation

```bash
node --version   # Should show v20.x.x or v22.x.x
npm --version    # Should show v10.x.x
```

## Step 5: Set as Default

```bash
nvm alias default node
```

---

## ✅ After Node.js is Installed

Go back to your project directory and run:

```bash
cd /Users/centriclearning/Desktop/glen/dock82

# Install project dependencies
npm install

# Create environment file
cp env.example .env.local

# Edit and add Stripe keys
nano .env.local

# Start the app
npm start
```

---

## 🔑 Don't Forget Stripe Keys!

Add to `.env.local`:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
```

Get them from: https://dashboard.stripe.com (TEST MODE)

---

## ⚡ This is MUCH faster than Homebrew!

NVM downloads ready-to-use Node.js in ~2 minutes vs Homebrew compiling for 30+ minutes.


