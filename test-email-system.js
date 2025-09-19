// Test script for the email notification system
// Run this in your browser console on your live site to test emails

async function testEmailSystem() {
  try {
    console.log('🧪 Testing email notification system...');
    
    // Test booking confirmation email
    const testBookingData = {
      guestName: 'Test User',
      slipName: 'Test Slip A-1',
      checkIn: '2024-01-15',
      checkOut: '2024-01-18',
      boatMakeModel: 'Test Boat Model',
      boatLength: 24,
      totalAmount: 180.00
    };
    
    const testPaymentData = {
      guestName: 'Test User',
      slipName: 'Test Slip A-1',
      paymentIntentId: 'pi_test_1234567890',
      totalAmount: 180.00,
      paymentMethod: 'stripe'
    };
    
    // Test booking confirmation
    console.log('📧 Testing booking confirmation email...');
    const bookingResponse = await fetch(`${supabase.functions.url}/send-notification`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
      },
      body: JSON.stringify({
        type: 'bookingConfirmation',
        email: 'your-test-email@example.com', // Replace with your email
        data: testBookingData
      })
    });
    
    if (bookingResponse.ok) {
      console.log('✅ Booking confirmation email sent successfully!');
    } else {
      const error = await bookingResponse.json();
      console.error('❌ Booking confirmation failed:', error);
    }
    
    // Test payment receipt
    console.log('💰 Testing payment receipt email...');
    const paymentResponse = await fetch(`${supabase.functions.url}/send-notification`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`
      },
      body: JSON.stringify({
        type: 'paymentReceipt',
        email: 'your-test-email@example.com', // Replace with your email
        data: testPaymentData
      })
    });
    
    if (paymentResponse.ok) {
      console.log('✅ Payment receipt email sent successfully!');
    } else {
      const error = await paymentResponse.json();
      console.error('❌ Payment receipt failed:', error);
    }
    
    console.log('🎉 Email system test completed!');
    console.log('📬 Check your email inbox for the test messages.');
    
  } catch (error) {
    console.error('❌ Email system test failed:', error);
  }
}

// Instructions for use:
console.log(`
🧪 EMAIL SYSTEM TEST SCRIPT

To test your email system:

1. Replace 'your-test-email@example.com' with your actual email address
2. Make sure you're logged into your site (for authentication)
3. Run: testEmailSystem()
4. Check your email inbox for test messages

Expected results:
✅ Booking confirmation email with test booking details
✅ Payment receipt email with test payment details

If emails don't arrive:
- Check spam folder
- Verify RESEND_API_KEY is set in Supabase
- Check Supabase Edge Function logs
- Ensure send-notification function is deployed
`);

// Export for use
window.testEmailSystem = testEmailSystem;
