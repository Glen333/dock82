# Local Development Setup - Payment Form

## ✅ Setup Complete!

Your local backend server is now running and ready to handle payment requests.

## Current Status

- ✅ Local API server running on http://localhost:5001
- ✅ Stripe configured with test key
- ✅ React app configured to use local API
- ✅ CORS enabled for localhost:3000

## How to Restart Everything (if needed)

### Terminal 1: Backend Server
```bash
cd /Users/centriclearning/Desktop/glen/dock82
node server.js
```

### Terminal 2: React App
```bash
cd /Users/centriclearning/Desktop/glen/dock82
npm start
```

## Testing the Payment Form

1. **Open your browser**: http://localhost:3000
2. **Click "Book this slip"** on any slip
3. **Fill in the booking form**
4. **Submit the form** (as a "renter")
5. **You should now see**:
   - The Stripe payment form with all credit card fields
   - Card number input
   - Expiry date input
   - CVC input
   - Postal code input
   - Form validation

## Test Card Numbers

Use these Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires Auth**: `4000 0027 6000 3184`

Use any future date, any 3-digit CVC, any zip code.

## Console Logs

You should see in the browser console:
- "Creating payment intent for amount: 120"
- "Using local API URL: http://localhost:5001"
- "Calling function URL: http://localhost:5001/api/create-payment-intent"
- "Payment intent created: pi_xxxxx"

## Stop the Server

Press `Ctrl+C` in the terminal running `node server.js`, or run:
```bash
pkill -f "node server.js"
```

## Troubleshooting

- **If payment form still shows "Initializing payment...":** 
  - Check if server is running: `curl http://localhost:5001/api/health`
  - Restart React app with `npm start`

- **If you see CORS errors:**
  - Make sure server.js is running
  - Check .env.local has REACT_APP_API_URL=http://localhost:5001

- **If connection refused:**
  - The server might have crashed
  - Check /tmp/server.log for errors
  - Restart with `node server.js`

## Files Changed

- `server.js` - New local backend server
- `.env.local` - Added REACT_APP_API_URL
- `src/PaymentPage.js` - Updated to use local API

