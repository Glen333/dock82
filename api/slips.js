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
    if (req.method === 'GET') {
      // Get all slips from Supabase
      try {
        const { data: slips, error } = await supabase
          .from('slips')
          .select('*')
          .order('name');

        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: 'Failed to fetch slips' });
        }

        // Transform data to match frontend expectations
        const transformedSlips = slips.map(slip => ({
          id: slip.id,
          name: slip.name,
          maxLength: parseFloat(slip.max_length),
          width: parseFloat(slip.width),
          depth: parseFloat(slip.depth),
          pricePerNight: parseFloat(slip.price_per_night),
          amenities: slip.amenities || [],
          description: slip.description,
          dockEtiquette: slip.dock_etiquette,
          available: slip.available,
          images: slip.images || [],
          bookings: []
        }));

        res.status(200).json({ slips: transformedSlips });
      } catch (error) {
        console.error('Error fetching slips:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else if (req.method === 'POST') {
      const { action, ...data } = req.body;

      if (action === 'update-images') {
        // Update all slip images
        try {
          // First get all slip IDs
          const { data: allSlips, error: fetchError } = await supabase
            .from('slips')
            .select('id');

          if (fetchError) {
            console.error('Fetch slips error:', fetchError);
            return res.status(500).json({ error: 'Failed to fetch slips: ' + fetchError.message });
          }

          // Update each slip individually
          const updatePromises = allSlips.map(slip => 
            supabase
              .from('slips')
              .update({ images: [data.imageUrl] })
              .eq('id', slip.id)
          );

          const results = await Promise.all(updatePromises);
          const errors = results.filter(result => result.error);
          
          if (errors.length > 0) {
            console.error('Update errors:', errors);
            return res.status(500).json({ error: 'Failed to update some slips: ' + errors[0].error.message });
          }

          res.status(200).json({
            success: true,
            message: 'All slip images updated successfully',
            imageUrl: data.imageUrl,
            updatedCount: allSlips.length
          });
        } catch (error) {
          console.error('Error updating images:', error);
          res.status(500).json({ error: 'Internal server error: ' + error.message });
        }
      } else if (action === 'update-slip') {
        // Update individual slip
        try {
          const { slipId, slipData } = data;
          
          // Transform the data to match Supabase column names
          const updateData = {
            name: slipData.name,
            description: slipData.description,
            price_per_night: slipData.pricePerNight,
            images: slipData.images,
            dock_etiquette: slipData.dock_etiquette,
            available: slipData.available !== undefined ? slipData.available : undefined
          };
          
          const { data: updatedSlip, error } = await supabase
            .from('slips')
            .update(updateData)
            .eq('id', slipId)
            .select()
            .single();

          if (error) {
            console.error('Update slip error:', error);
            return res.status(400).json({ error: 'Failed to update slip: ' + error.message });
          }

          res.status(200).json({
            success: true,
            message: 'Slip updated successfully',
            slip: updatedSlip
          });
        } catch (error) {
          console.error('Error updating slip:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      } else {
        res.status(400).json({ error: 'Invalid action' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
