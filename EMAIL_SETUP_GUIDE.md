# Email Notification System Setup Guide

## 🚀 Complete Email System for Dock82

Your dock rental platform now includes a **professional email notification system** powered by Supabase Edge Functions and Resend API.

## ✅ What's Included

### **Email Types:**
1. **Booking Confirmation** - Sent after successful payment
2. **Payment Receipt** - Sent immediately after payment processing
3. **Booking Cancellation** - Sent when bookings are cancelled
4. **Dock Etiquette** - Sent with slip-specific guidelines

### **Professional Email Templates:**
- ✅ **Responsive HTML design** - Looks great on all devices
- ✅ **Dock82 branding** - Consistent with your brand
- ✅ **Complete booking details** - All relevant information included
- ✅ **Clear instructions** - Self check-in and safety guidelines
- ✅ **Professional styling** - Clean, modern design

## 🔧 Setup Requirements

### **1. Resend API Account**
You need a Resend account for sending emails:

1. **Sign up**: Go to [resend.com](https://resend.com) and create an account
2. **Get API Key**: Go to API Keys section and create a new key
3. **Domain Setup** (Optional): Add your domain for better deliverability

### **2. Environment Variables**
Add these to your **Supabase project**:

```bash
RESEND_API_KEY=re_your_resend_api_key_here
```

### **3. Deploy Edge Function**
Deploy the `send-notification` Edge Function to Supabase:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/phstdzlniugqbxtfgktb)
2. Navigate to **Edge Functions**
3. Create new function: `send-notification`
4. Copy the code from `supabase/functions/send-notification/index.ts`
5. Deploy the function

## 📧 Email Templates Preview

### **Booking Confirmation Email:**
```
🚤 Dock82 - Booking Confirmed!

Hello [Guest Name],

Great news! Your dock slip reservation has been confirmed.

📋 Booking Summary:
- Slip: [Slip Name]
- Check-in: [Date]
- Check-out: [Date]
- Duration: [X] nights
- Boat: [Make/Model] ([Length]ft)

💰 Total Cost: $[Amount]

📝 Important Instructions:
- Self Check-in: You'll receive a dock permit via email 24 hours before arrival
- Arrival: Please arrive during daylight hours
- Parking: Use designated boat trailer parking area
- Safety: Always wear life jackets and follow regulations
- Contact: support@dock82.com for assistance

We're excited to welcome you to Dock82!
```

### **Payment Receipt Email:**
```
💳 Payment Receipt - Dock82

Hello [Guest Name],

Thank you for your payment! Here's your receipt:

🧾 Payment Details:
- Slip: [Slip Name]
- Payment Method: Stripe
- Transaction ID: [Payment Intent ID]
- Date: [Payment Date]

💰 Amount Paid: $[Amount]

Your payment has been processed successfully.
```

## 🔄 How It Works

### **Payment Flow with Emails:**
1. **User completes payment** → Stripe processes payment
2. **Payment succeeds** → `confirm-payment` Edge Function updates database
3. **Frontend calls** → `send-notification` Edge Function
4. **Edge Function sends** → Payment receipt email
5. **Edge Function sends** → Booking confirmation email
6. **User receives** → Professional confirmation emails

### **Edge Function Call:**
```javascript
// Payment receipt
await sendEmailNotification('paymentReceipt', guestEmail, {
  guestName: 'John Doe',
  slipName: 'Slip A-1',
  paymentIntentId: 'pi_1234567890',
  totalAmount: 180.00,
  paymentMethod: 'stripe'
});

// Booking confirmation
await sendEmailNotification('bookingConfirmation', guestEmail, {
  guestName: 'John Doe',
  slipName: 'Slip A-1',
  checkIn: '2024-01-15',
  checkOut: '2024-01-18',
  boatMakeModel: 'Sea Ray 240',
  boatLength: 24,
  totalAmount: 180.00
});
```

## 🎨 Email Customization

### **Branding:**
- **Colors**: Currently uses blue gradient (`#1e40af` to `#3b82f6`)
- **Logo**: Text-based "🚤 Dock82" header
- **Font**: Arial, sans-serif (web-safe)

### **Content:**
- **Tone**: Professional but friendly
- **Instructions**: Clear, actionable steps
- **Safety**: Emphasizes boating safety
- **Contact**: Includes support email

### **To Customize:**
1. Edit the HTML templates in `supabase/functions/send-notification/index.ts`
2. Update colors, fonts, or layout as needed
3. Redeploy the Edge Function

## 🧪 Testing

### **Test Email Types:**
```javascript
// Test booking confirmation
await sendEmailNotification('bookingConfirmation', 'test@example.com', {
  guestName: 'Test User',
  slipName: 'Test Slip',
  checkIn: '2024-01-15',
  checkOut: '2024-01-18',
  boatMakeModel: 'Test Boat',
  boatLength: 24,
  totalAmount: 180.00
});

// Test payment receipt
await sendEmailNotification('paymentReceipt', 'test@example.com', {
  guestName: 'Test User',
  slipName: 'Test Slip',
  paymentIntentId: 'pi_test123',
  totalAmount: 180.00,
  paymentMethod: 'stripe'
});
```

## 🚨 Troubleshooting

### **Common Issues:**

1. **Emails not sending:**
   - Check Resend API key is correct
   - Verify Edge Function is deployed
   - Check browser console for errors

2. **Emails going to spam:**
   - Set up domain authentication in Resend
   - Use a custom "from" address
   - Avoid spam trigger words

3. **Template not rendering:**
   - Check HTML syntax in Edge Function
   - Verify all template variables are provided
   - Test with simple HTML first

### **Debug Steps:**
1. Check Supabase Edge Function logs
2. Check Resend dashboard for delivery status
3. Test with a simple email first
4. Verify all environment variables are set

## 📊 Email Analytics

### **Resend Dashboard:**
- **Delivery rates** - See how many emails are delivered
- **Open rates** - Track email engagement
- **Click rates** - Monitor link clicks
- **Bounce rates** - Identify delivery issues

### **Supabase Logs:**
- **Function invocations** - Track when emails are sent
- **Error logs** - Debug any issues
- **Performance metrics** - Monitor function response times

## 🎯 Next Steps

1. **Set up Resend account** and get API key
2. **Add `RESEND_API_KEY`** to Supabase environment variables
3. **Deploy the Edge Function** to Supabase
4. **Test the email flow** with a real booking
5. **Customize templates** to match your brand (optional)

---

## 🎉 You're All Set!

Your dock rental platform now has a **complete email notification system** that will:
- ✅ Send professional booking confirmations
- ✅ Provide payment receipts
- ✅ Handle cancellation notifications
- ✅ Deliver dock etiquette guidelines
- ✅ Maintain consistent branding
- ✅ Scale automatically with your business

**Ready to impress your customers with professional email communications!** 📧✨
