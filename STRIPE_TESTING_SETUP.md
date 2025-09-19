# Stripe Testing Setup Guide

This guide covers setting up Stripe test keys for development and testing of the dock rental platform.

## Test Keys Setup

### 1. Supabase Edge Functions
Set the test secret key in Supabase for Edge Functions:

```bash
# Set Stripe test secret key for Edge Functions
supabase secrets set STRIPE_SECRET_KEY=sk_test_...

# Verify the secret is set
supabase secrets list
```

### 2. Vercel Environment Variables
Add the test keys to your Vercel deployment:

```bash
# Add Stripe test keys to Vercel
vercel env add STRIPE_SECRET_KEY
# Enter: sk_test_...

vercel env add STRIPE_PUBLISHABLE_KEY  
# Enter: pk_test_...
```

### 3. Local Development
Create a `.env.local` file for local development:

```bash
# .env.local
REACT_APP_SUPABASE_URL=https://phstdzlniugqbxtfgktb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## Testing Payment Flow

### Test Cards
Use Stripe's test card numbers:

```
# Successful payments
4242424242424242 - Visa
4000056655665556 - Visa (debit)
5555555555554444 - Mastercard

# Declined payments  
4000000000000002 - Card declined
4000000000009995 - Insufficient funds
4000000000009987 - Lost card
```

### Test Scenarios
1. **Successful Payment**: Use `4242424242424242`
2. **Declined Payment**: Use `4000000000000002`
3. **3D Secure**: Use `4000002500003155`
4. **Requires Authentication**: Use `4000002760003184`

## Edge Function Testing

### Test Create Payment Intent
```bash
curl -X POST https://phstdzlniugqbxtfgktb.supabase.co/functions/v1/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "amount": 150.00,
    "currency": "usd",
    "booking": {
      "slip_id": 1,
      "slip_name": "Dock A1",
      "guest_email": "test@example.com",
      "guest_name": "Test User",
      "check_in": "2024-01-15",
      "check_out": "2024-01-18",
      "boat_length": 25,
      "user_type": "renter"
    }
  }'
```

### Test Confirm Payment
```bash
curl -X POST https://phstdzlniugqbxtfgktb.supabase.co/functions/v1/confirm-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "payment_intent_id": "pi_test_..."
  }'
```

## Frontend Testing

### Update Payment Page
Ensure the frontend uses test keys:

```javascript
// In your payment component
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');
```

### Test the Complete Flow
1. **Create Booking**: Fill out booking form
2. **Payment Page**: Use test card `4242424242424242`
3. **Confirm Payment**: Verify booking status updates
4. **Check Database**: Confirm payment data is stored

## Monitoring Test Payments

### Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/payments)
2. View test payments and events
3. Check webhook deliveries
4. Monitor API logs

### Supabase Dashboard
1. Check function logs: `supabase functions logs create-payment-intent`
2. Verify database updates in bookings table
3. Check for any error logs

## Production Migration

### When Ready for Live Payments
1. **Update Keys**: Replace test keys with live keys
2. **Update Environment**: Set live keys in production
3. **Test Live Mode**: Verify with small test amount
4. **Monitor**: Watch for any issues

### Key Rotation
```bash
# Update to live keys
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
vercel env add STRIPE_SECRET_KEY
# Enter live key
```

## Troubleshooting

### Common Issues
1. **Invalid API Key**: Ensure test keys start with `sk_test_` or `pk_test_`
2. **CORS Errors**: Check Edge Function CORS headers
3. **Payment Declined**: Use valid test card numbers
4. **Function Timeout**: Check function logs for errors

### Debug Steps
1. Check Stripe dashboard for payment attempts
2. Review Supabase function logs
3. Verify environment variables are set
4. Test with simple curl commands first

## Security Notes

### Test vs Live Keys
- **Test Keys**: Safe to use in development, won't process real payments
- **Live Keys**: Only use in production, process real money
- **Never Mix**: Don't use test keys in production or vice versa

### Key Storage
- Store keys in environment variables
- Never commit keys to version control
- Use Supabase secrets for Edge Functions
- Use Vercel env vars for frontend
