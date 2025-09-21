#!/usr/bin/env node

/**
 * Email System Setup Script for Dock82
 * 
 * This script helps set up the complete email notification system
 * including Resend API integration and Supabase Edge Function deployment.
 */

const fs = require('fs');
const path = require('path');

console.log('📧 Dock82 Email System Setup');
console.log('============================');
console.log('');

// Check if we're in the right directory
if (!fs.existsSync('supabase/functions/send-notification/index.ts')) {
  console.error('❌ Error: Please run this script from the project root directory');
  console.error('   The supabase/functions/send-notification/index.ts file should exist');
  process.exit(1);
}

console.log('✅ Found Supabase Edge Function: supabase/functions/send-notification/index.ts');
console.log('');

// Display setup instructions
console.log('🚀 EMAIL SYSTEM SETUP INSTRUCTIONS');
console.log('===================================');
console.log('');
console.log('To complete the email system setup, you need to:');
console.log('');
console.log('1️⃣  SET UP RESEND ACCOUNT');
console.log('   • Go to https://resend.com and create an account');
console.log('   • Navigate to API Keys section');
console.log('   • Create a new API key');
console.log('   • Copy the API key (starts with "re_")');
console.log('');
console.log('2️⃣  ADD API KEY TO SUPABASE');
console.log('   • Go to https://supabase.com/dashboard/project/phstdzlniugqbxtfgktb');
console.log('   • Navigate to Settings > Edge Functions');
console.log('   • Add environment variable:');
console.log('     Key: RESEND_API_KEY');
console.log('     Value: [your_resend_api_key]');
console.log('');
console.log('3️⃣  DEPLOY EDGE FUNCTION');
console.log('   • In Supabase Dashboard, go to Edge Functions');
console.log('   • Create new function: "send-notification"');
console.log('   • Copy the code from supabase/functions/send-notification/index.ts');
console.log('   • Deploy the function');
console.log('');
console.log('4️⃣  TEST EMAIL SYSTEM');
console.log('   • Make a test booking on your site');
console.log('   • Complete the payment process');
console.log('   • Check that confirmation emails are sent');
console.log('');

// Check if Supabase CLI is available
const { execSync } = require('child_process');
let supabaseCliAvailable = false;

try {
  execSync('supabase --version', { stdio: 'ignore' });
  supabaseCliAvailable = true;
  console.log('✅ Supabase CLI is available');
} catch (error) {
  console.log('⚠️  Supabase CLI not found - you can still set up manually');
}

console.log('');
console.log('📋 EMAIL TYPES THAT WILL BE SENT:');
console.log('==================================');
console.log('');
console.log('✅ Payment Receipt Email');
console.log('   • Sent immediately after payment processing');
console.log('   • Includes transaction details and receipt');
console.log('');
console.log('✅ Booking Confirmation Email');
console.log('   • Sent after successful booking creation');
console.log('   • Includes complete booking details');
console.log('   • Contains check-in instructions and safety guidelines');
console.log('');
console.log('✅ Booking Cancellation Email');
console.log('   • Sent when bookings are cancelled');
console.log('   • Includes cancellation details and refund info');
console.log('');
console.log('✅ Dock Etiquette Email');
console.log('   • Sent with slip-specific guidelines');
console.log('   • Contains marina rules and safety information');
console.log('');

// Display email template preview
console.log('🎨 EMAIL TEMPLATE PREVIEW:');
console.log('===========================');
console.log('');
console.log('The emails include:');
console.log('• Professional HTML design with Dock82 branding');
console.log('• Responsive layout that works on all devices');
console.log('• Complete booking and payment details');
console.log('• Clear instructions for check-in and safety');
console.log('• Professional styling with blue gradient theme');
console.log('');

// Check current implementation status
console.log('🔍 CURRENT IMPLEMENTATION STATUS:');
console.log('==================================');
console.log('');

// Check if email function is being called in the frontend
const frontendCode = fs.readFileSync('src/DockRentalPlatform.js', 'utf8');
if (frontendCode.includes('sendEmailNotification')) {
  console.log('✅ Email notifications are integrated in the frontend');
} else {
  console.log('❌ Email notifications not found in frontend');
}

if (frontendCode.includes('await sendEmailNotification')) {
  console.log('✅ Email sending is called after payment completion');
} else {
  console.log('❌ Email sending not found after payment');
}

// Check Edge Function
if (fs.existsSync('supabase/functions/send-notification/index.ts')) {
  console.log('✅ Edge Function code exists');
  
  const edgeFunctionCode = fs.readFileSync('supabase/functions/send-notification/index.ts', 'utf8');
  if (edgeFunctionCode.includes('RESEND_API_KEY')) {
    console.log('✅ Edge Function is configured for Resend API');
  } else {
    console.log('❌ Edge Function not configured for Resend API');
  }
  
  if (edgeFunctionCode.includes('generateBookingConfirmationEmail')) {
    console.log('✅ Booking confirmation email template exists');
  } else {
    console.log('❌ Booking confirmation email template missing');
  }
  
  if (edgeFunctionCode.includes('generatePaymentReceiptEmail')) {
    console.log('✅ Payment receipt email template exists');
  } else {
    console.log('❌ Payment receipt email template missing');
  }
} else {
  console.log('❌ Edge Function code not found');
}

console.log('');
console.log('🎯 NEXT STEPS:');
console.log('==============');
console.log('');
console.log('1. Set up Resend account and get API key');
console.log('2. Add RESEND_API_KEY to Supabase environment variables');
console.log('3. Deploy the send-notification Edge Function');
console.log('4. Test with a real booking');
console.log('');
console.log('📖 For detailed instructions, see: EMAIL_SETUP_GUIDE.md');
console.log('');
console.log('🎉 Once set up, your customers will receive professional');
console.log('   email confirmations after every booking!');
