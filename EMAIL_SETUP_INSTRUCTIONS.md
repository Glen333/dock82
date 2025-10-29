# 📧 Email Setup Instructions - Dock82

## ✅ **What's Been Done:**

1. ✅ Installed Resend package (`npm install resend`)
2. ✅ Updated `server.js` with Resend integration
3. ✅ Created beautiful HTML email templates with printable permits
4. ✅ Added email generation functions

## 📝 **What You Need to Do:**

### Step 1: Get Resend API Key

1. Go to https://resend.com and sign up (it's free!)
2. Verify your email address
3. Go to **API Keys** section: https://resend.com/api-keys
4. Click **"Create API Key"**
5. Copy the API key (starts with `re_...`)

### Step 2: Update `.env.local`

Open `.env.local` file and add your Resend API key:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
```

### Step 3: Verify Domain (Optional but Recommended)

For professional emails from `noreply@dock82.com`:

1. Go to **Domains** in Resend dashboard
2. Add your domain `dock82.com`
3. Add the DNS records they provide to your domain registrar
4. Wait for verification (can take a few minutes)

**Alternative for Testing:**
For now, emails will be sent from a Resend test domain, which is perfect for development!

### Step 4: Restart the Server

```bash
# Restart the server to load the new API key
pkill -f "node server.js"
sleep 1
node server.js > /tmp/server.log 2>&1 &
```

### Step 5: Test It!

Try making a booking and you should receive:
1. **Payment Receipt** email with transaction details
2. **Booking Confirmation** email with printable permit

## 🎨 **Email Features:**

✅ **Professional HTML design**
✅ **Payment receipt** with transaction details
✅ **Booking confirmation** with all details
✅ **Printable permit** for windshield
✅ **Responsive design** works on mobile and desktop
✅ **Clear instructions** for renters

## 📊 **Current Configuration:**

- **From Email**: `Dock82 <noreply@dock82.com>` (will use Resend domain for testing)
- **To Email**: Renter's email from booking form
- **Payment Receipt**: Sent after successful payment
- **Booking Confirmation**: Sent after booking is saved to database

## 🧪 **Testing:**

Test the email sending by running:

```bash
curl -X POST http://localhost:5001/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bookingConfirmation",
    "email": "your-email@example.com",
    "data": {
      "guestName": "Test User",
      "slipName": "Slip 1",
      "checkIn": "2025-06-01",
      "checkOut": "2025-06-05",
      "boatMakeModel": "Test Boat",
      "boatLength": "25",
      "totalAmount": "100"
    }
  }'
```

## 🚨 **Troubleshooting:**

If emails don't send, check the server logs:
```bash
tail -f /tmp/server.log | grep -i email
```

Common issues:
- **No API key**: Make sure `RESEND_API_KEY` is in `.env.local`
- **Invalid API key**: Verify the key in Resend dashboard
- **Rate limit**: Free tier allows 100 emails/day

## 💰 **Pricing:**

- **Free Tier**: 100 emails/day, 3,000 emails/month
- **Paid Plans**: Start at $20/month for more emails
- Perfect for testing and small deployments!

## 📞 **Need Help?**

1. Check Resend dashboard: https://resend.com/emails
2. View email logs in Resend for debugging
3. Check server logs in `/tmp/server.log`

