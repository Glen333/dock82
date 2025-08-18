import { sql } from '@vercel/postgres';

// Utility function for password hashing
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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
      console.log('Setting up database tables...');
      
      // Create users table
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          user_type VARCHAR(50) DEFAULT 'renter',
          permissions JSONB DEFAULT '{}',
          reset_token VARCHAR(255),
          reset_token_expires TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      console.log('Users table created');

      // Create slips table
      await sql`
        CREATE TABLE IF NOT EXISTS slips (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          max_length DECIMAL(5,2) NOT NULL,
          width DECIMAL(5,2) NOT NULL,
          depth DECIMAL(5,2) NOT NULL,
          price_per_night DECIMAL(10,2) NOT NULL,
          amenities JSONB,
          description TEXT,
          dock_etiquette TEXT,
          available BOOLEAN DEFAULT TRUE,
          images JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      console.log('Slips table created');

      // Create bookings table
      await sql`
        CREATE TABLE IF NOT EXISTS bookings (
          id SERIAL PRIMARY KEY,
          slip_id INTEGER REFERENCES slips(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          guest_name VARCHAR(255) NOT NULL,
          guest_email VARCHAR(255) NOT NULL,
          guest_phone VARCHAR(50),
          check_in TIMESTAMP NOT NULL,
          check_out TIMESTAMP NOT NULL,
          boat_length DECIMAL(5,2),
          boat_make_model VARCHAR(255),
          user_type VARCHAR(50) DEFAULT 'renter',
          nights INTEGER NOT NULL,
          total_cost DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          payment_status VARCHAR(50) DEFAULT 'pending',
          payment_method VARCHAR(50) DEFAULT 'stripe',
          payment_date TIMESTAMP,
          rental_agreement_name VARCHAR(255),
          insurance_proof_name VARCHAR(255),
          rental_property VARCHAR(255),
          rental_start_date TIMESTAMP,
          rental_end_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      console.log('Bookings table created');

      // Create indexes
      await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_bookings_slip_id ON bookings(slip_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);`;
      console.log('Indexes created');

      // Create superadmin user
      const superadminPasswordHash = await hashPassword('Dock82Admin2024!');
      await sql`
        INSERT INTO users (name, email, password_hash, user_type, phone, permissions)
        VALUES (
          'Super Admin',
          'Glen@centriclearning.net',
          ${superadminPasswordHash},
          'superadmin',
          '555-0123',
          '{"manage_users": true, "manage_admins": true, "manage_slips": true, "manage_bookings": true, "view_analytics": true, "system_settings": true}'
        )
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          user_type = EXCLUDED.user_type,
          permissions = EXCLUDED.permissions
      `;
      console.log('Superadmin user created');

      // Create regular admin user
      const adminPasswordHash = await hashPassword('Dock82Admin2024!');
      await sql`
        INSERT INTO users (name, email, password_hash, user_type, phone, permissions)
        VALUES (
          'Regular Admin',
          'admin@dock82.com',
          ${adminPasswordHash},
          'admin',
          '555-0124',
          '{"manage_slips": true, "manage_bookings": true, "view_analytics": true}'
        )
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          user_type = EXCLUDED.user_type,
          permissions = EXCLUDED.permissions
      `;
      console.log('Admin user created');

      // Insert sample slips
      await sql`
        INSERT INTO slips (name, max_length, width, depth, price_per_night, amenities, description, dock_etiquette, available, images)
        VALUES 
          ('Dockmaster Slip', 26.0, 10.0, 6.0, 60.00, 
           '["Water", "Electric (120V)"]', 
           'Prime waterfront slip with easy access to main channel',
           'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
           true,
           '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
          ('Slip 2', 26.0, 10.0, 6.0, 60.00,
           '["Water", "Electric (120V)"]',
           'Convenient slip close to parking area',
           'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
           false,
           '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
          ('Slip 3', 26.0, 10.0, 6.0, 60.00,
           '["Water", "Electric (120V)"]',
           'Spacious slip with great views',
           'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
           true,
           '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]')
        ON CONFLICT (name) DO NOTHING
      `;
      console.log('Sample slips created');

      // Verify setup
      const userCount = await sql`SELECT COUNT(*) FROM users`;
      const slipCount = await sql`SELECT COUNT(*) FROM slips`;
      
      res.status(200).json({
        success: true,
        message: 'Database setup completed successfully',
        summary: {
          users: userCount.rows[0].count,
          slips: slipCount.rows[0].count,
          tables: ['users', 'slips', 'bookings']
        }
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database setup error:', error);
    res.status(500).json({ 
      error: 'Database setup failed',
      details: error.message 
    });
  }
}
