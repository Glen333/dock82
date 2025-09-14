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
      const { type, email, data, slipName, dockEtiquette } = req.body;

      if (type === 'booking-confirmation') {
        // Log booking confirmation email
        console.log('Booking confirmation email would be sent to:', email);
        console.log('Booking data:', data);
        
        res.status(200).json({ 
          success: true, 
          message: 'Booking confirmation email logged successfully' 
        });
      } else if (type === 'dock-etiquette') {
        // Log dock etiquette email
        console.log('Dock etiquette email would be sent to:', email);
        console.log('Slip name:', slipName);
        console.log('Dock etiquette:', dockEtiquette);
        
        res.status(200).json({ 
          success: true, 
          message: 'Dock etiquette email logged successfully' 
        });
      } else {
        res.status(400).json({ 
          success: false,
          error: 'Invalid notification type' 
        });
      }
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
