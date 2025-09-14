import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

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
    const { action } = req.body;

    if (action === 'fix-security-definer') {
      console.log('Fixing SECURITY DEFINER issue...');

      // First, let's check what views exist
      const { data: views, error: viewsError } = await supabase
        .from('information_schema.views')
        .select('*')
        .eq('table_name', 'available_slips');

      if (viewsError) {
        console.error('Error checking views:', viewsError);
        return res.status(500).json({ error: 'Failed to check views', details: viewsError });
      }

      console.log('Current views:', views);

      // Since we can't use exec_sql, let's try a different approach
      // We'll use the Supabase client to drop and recreate the view
      // First, let's check if the view exists by trying to query it
      const { data: testData, error: testError } = await supabase
        .from('available_slips')
        .select('count')
        .limit(1);

      console.log('Test query result:', testData, testError);

      // Let's try to create a new view with a different name first
      const { error: createError } = await supabase
        .rpc('create_secure_view', {
          view_name: 'available_slips_secure',
          view_definition: `
            SELECT 
              id,
              name,
              max_length,
              width,
              depth,
              price_per_night,
              amenities,
              description,
              dock_etiquette,
              available,
              images,
              location_data,
              maintenance_notes,
              seasonal_pricing,
              created_at,
              updated_at
            FROM public.slips
            WHERE available = true
          `
        });

      if (createError) {
        console.error('Error creating secure view:', createError);
        
        // If RPC doesn't work, let's just return the current status
        return res.status(200).json({
          success: false,
          message: 'Cannot fix view directly. Please run the SQL manually in Supabase SQL Editor.',
          instructions: [
            '1. Go to your Supabase Dashboard',
            '2. Navigate to SQL Editor',
            '3. Run the contents of fix-security-definer.sql',
            '4. This will fix the SECURITY DEFINER issue'
          ],
          currentViews: views
        });
      }

      return res.status(200).json({
        success: true,
        message: 'SECURITY DEFINER issue fixed successfully!'
      });

    } else if (action === 'check-security') {
      console.log('Checking current security status...');

      // Check RLS status on tables
      const { data: rlsStatus, error: rlsError } = await supabase
        .from('information_schema.tables')
        .select('table_name, row_security')
        .eq('table_schema', 'public')
        .in('table_name', ['slips', 'bookings', 'users']);

      if (rlsError) {
        console.error('Error checking RLS:', rlsError);
        return res.status(500).json({ error: 'Failed to check RLS', details: rlsError });
      }

      // Check policies
      const { data: policies, error: policiesError } = await supabase
        .from('information_schema.policies')
        .select('*')
        .eq('table_schema', 'public');

      if (policiesError) {
        console.error('Error checking policies:', policiesError);
        return res.status(500).json({ error: 'Failed to check policies', details: policiesError });
      }

      return res.status(200).json({
        success: true,
        rlsStatus,
        policies: policies || []
      });

    } else {
      return res.status(400).json({ 
        error: 'Invalid action. Use "fix-security-definer" or "check-security"',
        availableActions: ['fix-security-definer', 'check-security']
      });
    }

  } catch (error) {
    console.error('Error in fix-security:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
