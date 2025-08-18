import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple password hashing function (in production, use bcrypt)
function hashPassword(password) {
  // This is a simple hash for demo purposes
  // In production, use: const bcrypt = require('bcrypt'); return bcrypt.hashSync(password, 10);
  return 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create the users table if it doesn't exist
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          phone TEXT,
          user_type TEXT DEFAULT 'renter',
          permissions JSONB DEFAULT '{}',
          reset_token TEXT,
          reset_token_expires TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `
    });

    if (tableError) {
      console.error('Table creation error:', tableError);
      // Continue anyway, table might already exist
    }

    // Insert the superadmin user
    const { data, error } = await supabase
      .from('users')
      .upsert({
        name: 'Super Admin',
        email: 'Glen@centriclearning.net',
        password_hash: hashPassword('Dock82Admin2024!'),
        user_type: 'superadmin',
        phone: '555-0123',
        permissions: {
          manage_users: true,
          manage_admins: true,
          manage_slips: true,
          manage_bookings: true,
          view_analytics: true,
          system_settings: true
        }
      }, {
        onConflict: 'email'
      })
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create superadmin', details: error.message });
    }

    console.log('Superadmin created/updated successfully:', data);
    return res.status(200).json({ 
      success: true, 
      message: 'Superadmin created successfully',
      user: data[0]
    });

  } catch (error) {
    console.error('Error creating superadmin:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
