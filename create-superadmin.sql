-- Create Superadmin User for Dock Rental Platform
-- Run this in your Supabase SQL Editor

-- First, create the users table if it doesn't exist
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

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert the superadmin user
-- Email: Glen@centriclearning.net
-- Password: Dock82Admin2024!
INSERT INTO users (name, email, password_hash, user_type, phone, permissions) VALUES
  ('Super Admin', 'Glen@centriclearning.net', 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6', 'superadmin', '555-0123', '{"manage_users": true, "manage_admins": true, "manage_slips": true, "manage_bookings": true, "view_analytics": true, "system_settings": true}')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  user_type = EXCLUDED.user_type,
  phone = EXCLUDED.phone,
  permissions = EXCLUDED.permissions,
  updated_at = CURRENT_TIMESTAMP;

-- Verify the superadmin was created
SELECT id, name, email, user_type, permissions FROM users WHERE email = 'Glen@centriclearning.net';
