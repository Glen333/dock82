const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Debug: Check if Resend API key is loaded
console.log('🔑 Resend API Key present:', process.env.RESEND_API_KEY ? 'Yes ✅' : 'No ❌');
console.log('🔑 Resend API Key (first 10 chars):', process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 10) + '...' : 'Missing');

const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Local API server is running' });
});

// Create payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', booking } = req.body;
    
    console.log('Creating payment intent for amount:', amount);
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert dollars to cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        slip_id: String(booking?.slip_id || ''),
        slip_name: String(booking?.slip_name || ''),
        guest_email: booking?.guest_email || '',
        guest_name: booking?.guest_name || '',
        guest_phone: booking?.guest_phone || '',
        check_in: booking?.check_in || '',
        check_out: booking?.check_out || '',
        boat_length: String(booking?.boat_length || ''),
        boat_make_model: booking?.boat_make_model || '',
        user_type: booking?.user_type || '',
        nights: String(booking?.nights || ''),
        rental_property: booking?.rental_property || '',
        rental_start_date: booking?.rental_start_date || '',
        rental_end_date: booking?.rental_end_date || ''
      }
    });

    console.log('Payment intent created:', intent.id);
    
    res.json({ 
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id 
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: error.message 
    });
  }
});

// Email notification endpoint
app.post('/api/send-notification', async (req, res) => {
  try {
    const { type, email, data } = req.body;
    
    console.log('Email notification request:', { type, email });
    
    if (!type || !email || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate email content based on type
    let emailSubject = '';
    let emailContent = '';
    
    switch (type) {
      case 'paymentReceipt':
        emailSubject = `Payment Receipt - Dock82 Booking`;
        emailContent = generatePaymentReceiptEmail(data);
        break;
        
      case 'bookingConfirmation':
        emailSubject = `Booking Confirmed - ${data.slipName} at Dock82`;
        emailContent = generateBookingConfirmationEmail(data);
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid email type' });
    }
    
    console.log('📧 Sending email to:', email);
    console.log('📧 Subject:', emailSubject);
    
    // Send email using Resend (if API key is available)
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
      console.log('⚠️  Resend API key not configured. Email logged to console instead.');
      console.log('📧 Email Subject:', emailSubject);
      console.log('📧 Email To:', email);
      console.log('📧 Email Content Preview:', emailContent.substring(0, 200) + '...');
      
      return res.json({ 
        success: true, 
        message: 'Email logged (API key not configured - see EMAIL_SETUP_INSTRUCTIONS.md)',
        note: 'Configure RESEND_API_KEY in .env.local to send real emails'
      });
    }

    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'Dock82 <onboarding@resend.dev>', // Use Resend test domain
        to: email,
        subject: emailSubject,
        html: emailContent,
      });

      if (emailError) {
        console.error('Resend error:', emailError);
        return res.status(500).json({ 
          error: 'Failed to send email',
          details: emailError 
        });
      }

      console.log('✅ Email sent successfully:', emailData?.id);
      
      res.json({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: emailData?.id
      });
    } catch (error) {
      console.error('Email sending error:', error);
      res.status(500).json({ 
        error: 'Failed to send email',
        details: error.message 
      });
    }
    
  } catch (error) {
    console.error('Email notification error:', error);
    res.status(500).json({ 
      error: 'Failed to process email notification',
      details: error.message 
    });
  }
});

// Email generation functions
function generatePaymentReceiptEmail(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { background: #e5e7eb; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
        .receipt-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .receipt-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        .amount { font-size: 24px; font-weight: bold; color: #059669; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🛥️ Dock82 Payment Receipt</h1>
      </div>
      <div class="content">
        <p>Dear ${data.guestName},</p>
        <p>Thank you for your payment! Your dock booking at <strong>${data.slipName}</strong> has been confirmed.</p>
        
        <table class="receipt-table">
          <tr>
            <td><strong>Payment Amount:</strong></td>
            <td class="amount">$${data.amount}</td>
          </tr>
          <tr>
            <td><strong>Payment Method:</strong></td>
            <td>${data.paymentMethod}</td>
          </tr>
          <tr>
            <td><strong>Transaction ID:</strong></td>
            <td>${data.paymentIntentId}</td>
          </tr>
        </table>
        
        <p>Your booking confirmation and permit will be sent shortly.</p>
        <p>If you have any questions, please contact us.</p>
      </div>
      <div class="footer">
        <p>Best regards,<br>The Dock82 Team</p>
      </div>
    </body>
    </html>
  `;
}

function generateBookingConfirmationEmail(data) {
  const checkIn = new Date(data.checkIn).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const checkOut = new Date(data.checkOut).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .permit { background: white; border: 3px solid #059669; padding: 20px; margin: 20px 0; text-align: center; }
        .permit-title { font-size: 24px; font-weight: bold; color: #059669; margin-bottom: 10px; }
        .permit-info { font-size: 18px; margin: 10px 0; }
        .footer { background: #e5e7eb; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
        .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .info-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        .print-instruction { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🛥️ Dock82 Booking Confirmation</h1>
      </div>
      <div class="content">
        <p>Dear ${data.guestName},</p>
        <p>Your dock booking has been confirmed! We're excited to welcome you to Dock82.</p>
        
        <div class="permit">
          <div class="permit-title">DOCK PERMIT</div>
          <div class="permit-info">Slip: ${data.slipName}</div>
          <div class="permit-info">${data.guestName}</div>
          <div class="permit-info">Check-in: ${checkIn}</div>
          <div class="permit-info">Check-out: ${checkOut}</div>
          <div class="permit-info">Boat: ${data.boatMakeModel} (${data.boatLength} ft)</div>
        </div>
        
        <table class="info-table">
          <tr>
            <td><strong>Guest Name:</strong></td>
            <td>${data.guestName}</td>
          </tr>
          <tr>
            <td><strong>Slip:</strong></td>
            <td>${data.slipName}</td>
          </tr>
          <tr>
            <td><strong>Check-in:</strong></td>
            <td>${checkIn}</td>
          </tr>
          <tr>
            <td><strong>Check-out:</strong></td>
            <td>${checkOut}</td>
          </tr>
          <tr>
            <td><strong>Boat:</strong></td>
            <td>${data.boatMakeModel} (${data.boatLength} ft)</td>
          </tr>
          <tr>
            <td><strong>Total Amount:</strong></td>
            <td>$${data.totalAmount}</td>
          </tr>
        </table>
        
        <div class="print-instruction">
          <strong>📄 PRINT THIS EMAIL</strong>
          <p>Please print this permit and place it in your vehicle's windshield during your stay.</p>
        </div>
        
        <p><strong>Important Information:</strong></p>
        <ul>
          <li>Please arrive at your designated check-in time</li>
          <li>Keep this permit visible in your vehicle at all times</li>
          <li>Follow all dock etiquette guidelines</li>
          <li>In case of emergency, contact dock management immediately</li>
        </ul>
      </div>
      <div class="footer">
        <p>Best regards,<br>The Dock82 Team</p>
        <p style="font-size: 12px; color: #6b7280;">If you need to modify or cancel your booking, please contact us as soon as possible.</p>
      </div>
    </body>
    </html>
  `;
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to handle payment intents`);
  console.log(`📧 Ready to handle email notifications`);
  console.log(`💳 Stripe configured: ${process.env.STRIPE_SECRET_KEY ? 'Yes ✅' : 'No ❌'}\n`);
});

