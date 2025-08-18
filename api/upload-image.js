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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, slipId, imageData, imageName } = req.body;

    if (action === 'upload-image') {
      if (!slipId || !imageData) {
        return res.status(400).json({ error: 'Missing slipId or imageData' });
      }

      // Validate that imageData is a base64 string
      if (!imageData.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid image data format' });
      }

      // Store the base64 image data directly in the database
      const { data: updateData, error: updateError } = await supabase
        .from('slips')
        .update({ 
          images: [imageData], // Store the full base64 data URL
          updated_at: new Date().toISOString()
        })
        .eq('id', slipId)
        .select();

      if (updateError) {
        console.error('Database update error:', updateError);
        return res.status(500).json({ error: 'Failed to update slip with image data' });
      }

      console.log('Image uploaded successfully for slip:', slipId);
      
      return res.status(200).json({
        success: true,
        message: 'JPEG image uploaded and saved to database successfully!',
        imageUrl: imageData, // Return the base64 data as the URL
        slip: updateData[0]
      });

    } else if (action === 'get-image') {
      if (!slipId) {
        return res.status(400).json({ error: 'Missing slipId' });
      }

      // Get the slip's image from the database
      const { data: slip, error: slipError } = await supabase
        .from('slips')
        .select('images')
        .eq('id', slipId)
        .single();

      if (slipError) {
        console.error('Database query error:', slipError);
        return res.status(500).json({ error: 'Failed to retrieve slip image' });
      }

      return res.status(200).json({
        success: true,
        images: slip.images || []
      });

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Upload image error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
