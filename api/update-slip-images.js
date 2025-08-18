import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Update all slips with the provided image URL
    const { data: updatedSlips, error } = await supabase
      .from('slips')
      .update({ 
        images: [imageUrl]
      })
      .select();

    if (error) {
      console.error('Update images error:', error);
      return res.status(500).json({ error: 'Failed to update images', details: error.message });
    }

    console.log('Updated slips:', updatedSlips.length);
    return res.status(200).json({ 
      success: true, 
      message: 'All slip images updated successfully',
      imageUrl: imageUrl,
      updatedCount: updatedSlips.length
    });

  } catch (error) {
    console.error('Error updating images:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
