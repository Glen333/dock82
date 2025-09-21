#!/usr/bin/env node

/**
 * Email System Test Script for Dock82
 * 
 * This script tests the email notification system by making
 * test calls to the Supabase Edge Function.
 */

const https = require('https');

// Configuration
const SUPABASE_URL = 'https://phstdzlniugqbxtfgktb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoc3RkemxuaXVncWJ4dGZna3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTM0MzUsImV4cCI6MjA3MDUyOTQzNX0.u5A8Loh-pk9FCU68Rs1SWE8qBkxx5LXMhK-eM_EtNwM';

console.log('📧 Testing Dock82 Email System');
console.log('==============================');
console.log('');

// Test email data
const testEmailData = {
  paymentReceipt: {
    type: 'paymentReceipt',
    email: 'test@example.com', // Change this to your email for testing
    data: {
      guestName: 'John Doe',
      slipName: 'Slip A-1',
      paymentIntentId: 'pi_test123456789',
      totalAmount: 180.00,
      paymentMethod: 'stripe'
    }
  },
  bookingConfirmation: {
    type: 'bookingConfirmation',
    email: 'test@example.com', // Change this to your email for testing
    data: {
      guestName: 'John Doe',
      slipName: 'Slip A-1',
      checkIn: '2024-01-15',
      checkOut: '2024-01-18',
      boatMakeModel: 'Sea Ray 240',
      boatLength: 24,
      totalAmount: 180.00
    }
  }
};

// Function to make HTTP request
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test function
async function testEmailSystem() {
  const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/send-notification`;
  
  console.log('🔍 Testing Edge Function availability...');
  console.log(`URL: ${edgeFunctionUrl}`);
  console.log('');

  // Test 1: Payment Receipt Email
  console.log('📧 Test 1: Payment Receipt Email');
  console.log('--------------------------------');
  try {
    const response = await makeRequest(edgeFunctionUrl, testEmailData.paymentReceipt);
    
    if (response.status === 200) {
      console.log('✅ Payment receipt email test PASSED');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } else if (response.status === 500 && response.data.error && response.data.error.includes('RESEND_API_KEY')) {
      console.log('⚠️  Edge Function is deployed but RESEND_API_KEY is not configured');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } else if (response.status === 404) {
      console.log('❌ Edge Function not found - needs to be deployed');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ Payment receipt email test FAILED');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Payment receipt email test ERROR:', error.message);
  }
  
  console.log('');

  // Test 2: Booking Confirmation Email
  console.log('📧 Test 2: Booking Confirmation Email');
  console.log('------------------------------------');
  try {
    const response = await makeRequest(edgeFunctionUrl, testEmailData.bookingConfirmation);
    
    if (response.status === 200) {
      console.log('✅ Booking confirmation email test PASSED');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } else if (response.status === 500 && response.data.error && response.data.error.includes('RESEND_API_KEY')) {
      console.log('⚠️  Edge Function is deployed but RESEND_API_KEY is not configured');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } else if (response.status === 404) {
      console.log('❌ Edge Function not found - needs to be deployed');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ Booking confirmation email test FAILED');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Booking confirmation email test ERROR:', error.message);
  }
  
  console.log('');

  // Test 3: Invalid email type
  console.log('📧 Test 3: Invalid Email Type (should fail gracefully)');
  console.log('-----------------------------------------------------');
  try {
    const invalidData = {
      type: 'invalidType',
      email: 'test@example.com',
      data: { test: 'data' }
    };
    
    const response = await makeRequest(edgeFunctionUrl, invalidData);
    
    if (response.status === 400) {
      console.log('✅ Invalid email type test PASSED (correctly rejected)');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ Invalid email type test FAILED (should have been rejected)');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Invalid email type test ERROR:', error.message);
  }
  
  console.log('');
}

// Run tests
testEmailSystem().then(() => {
  console.log('🎯 TEST SUMMARY:');
  console.log('================');
  console.log('');
  console.log('If you see "RESEND_API_KEY is not configured":');
  console.log('1. Go to Supabase Dashboard > Settings > Edge Functions');
  console.log('2. Add environment variable: RESEND_API_KEY = your_resend_api_key');
  console.log('');
  console.log('If you see "Edge Function not found":');
  console.log('1. Go to Supabase Dashboard > Edge Functions');
  console.log('2. Create new function: "send-notification"');
  console.log('3. Copy code from supabase/functions/send-notification/index.ts');
  console.log('4. Deploy the function');
  console.log('');
  console.log('📖 For complete setup instructions, see: EMAIL_SETUP_GUIDE.md');
}).catch((error) => {
  console.error('Test execution error:', error);
  process.exit(1);
});