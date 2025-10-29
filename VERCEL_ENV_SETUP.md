# ⚙️ Vercel Environment Variables Setup

## Required Environment Variables

Add these in your Vercel dashboard:
https://vercel.com/dashboard -> Your Project -> Settings -> Environment Variables

### 🎯 **Required Variables:**

```
STRIPE_SECRET_KEY=<your_stripe_secret_key>

RESEND_API_KEY=<your_resend_api_key>
```

### 📝 **How to Add:**

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Get from your Stripe dashboard
   - **Environment**: Production, Preview, Development
   
4. Repeat for `RESEND_API_KEY`

### ⚠️ **Important:**

- These keys are already in the code (test keys are safe to expose)
- In production, you should use real live keys and keep them secure
- Never commit live keys to GitHub

### ✅ **Current Status:**

- ✅ All Stripe publishable keys are in `vercel.json` (test keys)
- ⚠️ Stripe secret key must be added to Vercel environment variables
- ⚠️ Resend API key must be added to Vercel environment variables
- ✅ All other keys are configured

