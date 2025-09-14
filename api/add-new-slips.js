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
      const { action, slipData } = req.body;

      if (action === 'add-new-slips') {
        // Add new slip to Supabase
        const { data, error } = await supabase
          .from('slips')
          .insert([{
            name: slipData.name,
            max_length: slipData.maxLength,
            width: slipData.width,
            depth: slipData.depth,
            price_per_night: slipData.pricePerNight,
            amenities: slipData.amenities || [],
            description: slipData.description,
            dock_etiquette: slipData.dockEtiquette || '',
            available: slipData.available !== undefined ? slipData.available : true,
            images: slipData.images || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center'
          }])
          .select();

        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ 
            success: false,
            error: 'Failed to add new slip: ' + error.message 
          });
        }

        res.status(200).json({ 
          success: true, 
          message: 'New slip added successfully',
          slip: data[0]
        });
      } else {
        res.status(400).json({ 
          success: false,
          error: 'Invalid action' 
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
