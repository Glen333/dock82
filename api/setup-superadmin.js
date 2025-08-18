import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple password hashing function (matches the one in users.js)
function hashPassword(password) {
  return 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create or update the superadmin user
    const superadminData = {
      name: 'Super Admin',
      email: 'Glen@centriclearning.net',
      password_hash: hashPassword('Gt_int42'), // Using the password you provided
      user_type: 'superadmin',
      phone: '555-0123',
      permissions: {
        manage_users: true,
        manage_admins: true,
        manage_slips: true,
        manage_bookings: true,
        view_analytics: true,
        system_settings: true
      },
      email_verified: true
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(superadminData, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create superadmin', details: error.message });
    }

    console.log('Superadmin created/updated successfully:', data);
    return res.status(200).json({ 
      success: true, 
      message: 'Superadmin created successfully',
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        userType: data.user_type,
        permissions: data.permissions
      }
    });

  } catch (error) {
    console.error('Error creating superadmin:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
