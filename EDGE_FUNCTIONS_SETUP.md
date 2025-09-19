# Supabase Edge Functions Setup Guide

This guide covers the deployment and configuration of Supabase Edge Functions for the Dock Rental Platform.

## Edge Functions Overview

### 1. create-payment-intent
- **Purpose**: Create Stripe payment intents for dock bookings
- **Location**: `supabase/functions/create-payment-intent/index.ts`
- **Dependencies**: Stripe SDK for Deno

### 2. confirm-payment
- **Purpose**: Confirm payments and update booking status in database
- **Location**: `supabase/functions/confirm-payment/index.ts`
- **Dependencies**: Supabase client for Deno

## Deployment Steps

### Prerequisites
1. Supabase CLI installed: `npm install -g supabase`
2. Supabase project linked: `supabase link --project-ref YOUR_PROJECT_REF`
3. Environment variables configured in Supabase dashboard

### Deploy Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy individual functions
supabase functions deploy create-payment-intent
supabase functions deploy confirm-payment
```

### Set Environment Variables

```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_live_...

# Verify secrets are set
supabase secrets list
```

## Function Endpoints

### Create Payment Intent
- **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-payment-intent`
- **Method**: POST
- **Body**:
```json
{
  "amount": 150.00,
  "currency": "usd",
  "booking": {
    "slip_id": 1,
    "slip_name": "Dock A1",
    "guest_email": "user@example.com",
    "guest_name": "John Doe",
    "guest_phone": "555-1234",
    "check_in": "2024-01-15",
    "check_out": "2024-01-18",
    "boat_length": 25,
    "boat_make_model": "Sea Ray 250",
    "user_type": "renter",
    "nights": 3,
    "rental_property": "Beach House 123",
    "rental_start_date": "2024-01-15",
    "rental_end_date": "2024-01-22"
  }
}
```

### Confirm Payment
- **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/confirm-payment`
- **Method**: POST
- **Body**:
```json
{
  "payment_intent_id": "pi_1234567890"
}
```

## Frontend Integration

### Update Payment Page
Replace the current API endpoint calls with Edge Function calls:

```javascript
// In PaymentPage.js or similar
const createPaymentIntent = async () => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-payment-intent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'usd',
          booking: {
            slip_id: selectedSlip.id,
            slip_name: selectedSlip.name,
            guest_email: bookingData.guestEmail,
            guest_name: bookingData.guestName,
            guest_phone: bookingData.guestPhone,
            check_in: bookingData.checkIn,
            check_out: bookingData.checkOut,
            boat_length: bookingData.boatLength,
            boat_make_model: bookingData.boatMakeModel,
            user_type: bookingData.userType,
            nights: calculateNights(bookingData.checkIn, bookingData.checkOut),
            rental_property: bookingData.rentalProperty,
            rental_start_date: bookingData.rentalStartDate,
            rental_end_date: bookingData.rentalEndDate
          }
        })
      }
    );

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    setClientSecret(data.clientSecret);
  } catch (error) {
    console.error('Error creating payment intent:', error);
    setPaymentError('Failed to initialize payment. Please try again.');
  }
};
```

## Benefits of Edge Functions

### Performance
- **Global Edge Network**: Functions run close to users worldwide
- **Low Latency**: Faster response times compared to traditional API endpoints
- **Automatic Scaling**: Handles traffic spikes automatically

### Security
- **Server-Side Execution**: Sensitive operations run on secure infrastructure
- **Environment Variables**: Secure secret management
- **CORS Handling**: Built-in cross-origin request support

### Integration
- **Direct Database Access**: Functions can directly access Supabase database
- **Real-time Capabilities**: Can leverage Supabase real-time features
- **Unified Platform**: Everything runs within Supabase ecosystem

## Monitoring and Debugging

### View Logs
```bash
# View function logs
supabase functions logs create-payment-intent
supabase functions logs confirm-payment

# Follow logs in real-time
supabase functions logs create-payment-intent --follow
```

### Test Functions Locally
```bash
# Start local development
supabase start

# Test function locally
curl -X POST http://localhost:54321/functions/v1/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "usd", "booking": {...}}'
```

## Environment Variables

### Required in Supabase Dashboard
- `STRIPE_SECRET_KEY`: Stripe secret key for payment processing
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access

### Frontend Environment Variables
- `REACT_APP_SUPABASE_URL`: Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anonymous key

## Migration from API Endpoints

### Phase 1: Deploy Edge Functions
1. Deploy both Edge Functions
2. Test functions independently
3. Verify Stripe integration works

### Phase 2: Update Frontend
1. Update payment flow to use Edge Functions
2. Update payment confirmation flow
3. Test end-to-end payment process

### Phase 3: Cleanup (Optional)
1. Remove old API endpoints (`api/create-payment-intent.js`, `api/confirm-payment.js`)
2. Update documentation
3. Monitor performance improvements

## Troubleshooting

### Common Issues
1. **Function Not Found**: Ensure functions are deployed with correct names
2. **Environment Variables**: Verify secrets are set in Supabase dashboard
3. **CORS Errors**: Check CORS headers in function responses
4. **Stripe Errors**: Verify Stripe secret key is correct and active

### Debug Steps
1. Check function logs for errors
2. Verify environment variables are set
3. Test with simple requests first
4. Validate JSON payload structure

## Performance Optimization

### Best Practices
1. **Minimize Dependencies**: Only import what you need
2. **Efficient Database Queries**: Use specific select statements
3. **Error Handling**: Provide meaningful error messages
4. **Response Size**: Keep response payloads minimal

### Monitoring
- Monitor function execution times
- Track error rates and types
- Set up alerts for critical failures
- Regular performance reviews
