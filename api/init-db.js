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
      console.log('Initializing database...');
      
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
      
      console.log('Superadmin user created/updated');

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
      
      console.log('Admin user created/updated');

      // Verify users were created
      const users = await sql`
        SELECT id, name, email, user_type, created_at
        FROM users
        WHERE email IN ('Glen@centriclearning.net', 'admin@dock82.com')
        ORDER BY user_type DESC
      `;

      res.status(200).json({
        success: true,
        message: 'Database initialized successfully',
        users: users.rows
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
      error: 'Database initialization failed',
      details: error.message 
    });
  }
}
