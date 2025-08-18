import Stripe from 'stripe';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    console.log('Testing Stripe key...');
    console.log('Key exists:', !!secretKey);
    console.log('Key length:', secretKey?.length);
    console.log('Key starts with:', secretKey?.substring(0, 10));
    console.log('Key ends with:', secretKey?.substring(-10));
    
    // Check if key has newlines or extra characters
    const cleanKey = secretKey?.trim();
    console.log('Clean key length:', cleanKey?.length);
    console.log('Has newlines:', cleanKey?.includes('\n'));
    
    if (!cleanKey) {
      return res.status(500).json({ error: 'No Stripe secret key found' });
    }
    
    // Test the key by creating a test Stripe instance
    const stripe = new Stripe(cleanKey);
    
    // Try a simple API call
    const account = await stripe.accounts.retrieve();
    
    res.status(200).json({
      success: true,
      account_id: account.id,
      key_valid: true,
      key_length: cleanKey.length,
      key_starts_with: cleanKey.substring(0, 10)
    });
    
  } catch (error) {
    console.error('Stripe test error:', error);
    
    res.status(500).json({
      error: 'Stripe key test failed',
      message: error.message,
      type: error.type,
      code: error.code,
      key_exists: !!process.env.STRIPE_SECRET_KEY,
      key_length: process.env.STRIPE_SECRET_KEY?.length
    });
  }
}
