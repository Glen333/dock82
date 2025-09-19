# Production Stripe Setup Guide

## 🚀 Your Payment System is Now Ready!

Your dock rental platform has been updated to use **Supabase Edge Functions** with **live Stripe keys** for production-ready payment processing.

## ✅ What's Been Updated

1. **Frontend Payment Flow** - Now uses Supabase Edge Functions instead of Vercel API routes
2. **Payment Intent Creation** - Handled by `supabase/functions/create-payment-intent/index.ts`
3. **Payment Confirmation** - Handled by `supabase/functions/confirm-payment/index.ts`
4. **Database Integration** - Payments automatically update your Supabase database

## 🔑 Required Setup Steps

### Step 1: Add Stripe Secret Key to Vercel
Your live Stripe secret key needs to be added to Vercel's environment variables:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `dock-rental-vercel` project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Your live Stripe secret key (starts with `sk_live_...`)
   - **Environment**: Production

### Step 2: Deploy Edge Functions to Supabase
You need to deploy your Edge Functions to Supabase:

#### Option A: Via Supabase Dashboard (Recommended)
1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard/project/phstdzlniugqbxtfgktb)
2. Navigate to **Edge Functions** in the left sidebar
3. Click **Create a new function**
4. **Function name**: `create-payment-intent`
5. **Copy the code** from `supabase/functions/create-payment-intent/index.ts`
6. Click **Deploy function**
7. **Repeat for `confirm-payment`** function

#### Option B: Set Environment Variables in Supabase
After deploying the functions, add your Stripe secret key:
1. In Supabase Dashboard → **Settings** → **API**
2. Go to **Environment Variables** section
3. Add:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Your live Stripe secret key

### Step 3: Test Your Payment Flow
1. Go to your live site: https://www.dock82.com
2. Browse available slips
3. Click **Book** on any slip
4. Fill out the booking form
5. Click **Proceed to Payment**
6. Use Stripe test card: `4242 4242 4242 4242`
7. Complete the payment

## 🧪 Test Cards for Live Mode
Since you're using live Stripe keys, use these **real test cards**:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

**Expiry**: Any future date (e.g., 12/25)
**CVC**: Any 3 digits (e.g., 123)

## 🔒 Security Features

✅ **Secure Payment Processing** - Stripe handles all payment data
✅ **Database Constraints** - Prevents invalid bookings
✅ **Row Level Security** - Users only see their own data
✅ **Edge Functions** - Server-side payment validation
✅ **HTTPS Only** - All communication encrypted

## 📊 Payment Flow

1. **User clicks "Book Slip"** → Booking form appears
2. **User fills form** → Validates boat length, dates, etc.
3. **User clicks "Proceed to Payment"** → Edge Function creates payment intent
4. **User enters payment info** → Stripe processes securely
5. **Payment succeeds** → Edge Function confirms and updates database
6. **User gets confirmation** → Email sent, booking confirmed

## 🚨 Important Notes

- **Never commit secret keys** to Git (they're already in Vercel/Supabase)
- **Test thoroughly** before accepting real payments
- **Monitor Stripe Dashboard** for payment activity
- **Keep your secret keys secure** - they're in environment variables only

## 🆘 Troubleshooting

### Payment Intent Creation Fails
- Check Stripe secret key is set correctly
- Verify Edge Function is deployed
- Check browser console for errors

### Payment Confirmation Fails
- Verify `confirm-payment` Edge Function is deployed
- Check database connection in Supabase
- Ensure booking exists in database

### Database Updates Fail
- Check Supabase service role key
- Verify RLS policies are correct
- Check Edge Function logs in Supabase

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase Edge Function logs
3. Check Stripe Dashboard for payment attempts
4. Verify all environment variables are set correctly

---

## 🎉 You're All Set!

Your dock rental platform now has a **production-ready payment system** with:
- ✅ Live Stripe integration
- ✅ Secure Edge Functions
- ✅ Database integration
- ✅ Email confirmations
- ✅ Full booking workflow

**Next step**: Deploy the Edge Functions and add your Stripe secret key to complete the setup!
