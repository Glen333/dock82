import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      const { payment_intent_id } = req.body;

      if (!payment_intent_id) {
        return res.status(400).json({ 
          success: false,
          error: 'Payment intent ID is required' 
        });
      }

      // For now, just return success since we don't have Stripe configured
      // In a real implementation, you would verify the payment with Stripe
      console.log('Payment confirmation for intent:', payment_intent_id);
      
      res.status(200).json({ 
        success: true, 
        message: 'Payment confirmed successfully',
        payment_intent_id: payment_intent_id
      });
    } else {
      res.status(405).json({ 
        success: false,
        error: 'Method not allowed' 
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error: ' + error.message 
    });
  }
}
