-- Dock Rental Platform Database Setup for Supabase

-- 1. Create users table
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

-- 2. Create slips table
CREATE TABLE IF NOT EXISTS slips (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
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

-- 3. Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slip_id BIGINT REFERENCES slips(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  check_in TIMESTAMP NOT NULL,
  check_out TIMESTAMP NOT NULL,
  boat_length DECIMAL(5,2),
  boat_make_model TEXT,
  user_type TEXT DEFAULT 'renter',
  nights INTEGER NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'stripe',
  payment_date TIMESTAMP,
  rental_agreement_name TEXT,
  insurance_proof_name TEXT,
  rental_property TEXT,
  rental_start_date TIMESTAMP,
  rental_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_slip_id ON bookings(slip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);

-- 5. Insert sample data

-- Insert admin users (password hash for 'Dock82Admin2024!')
INSERT INTO users (name, email, password_hash, user_type, phone, permissions) VALUES
  ('Super Admin', 'Glen@centriclearning.net', 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6', 'superadmin', '555-0123', '{"manage_users": true, "manage_admins": true, "manage_slips": true, "manage_bookings": true, "view_analytics": true, "system_settings": true}'),
  ('Regular Admin', 'admin@dock82.com', 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6', 'admin', '555-0124', '{"manage_slips": true, "manage_bookings": true, "view_analytics": true}')
ON CONFLICT (email) DO NOTHING;

-- Insert sample slips
INSERT INTO slips (name, max_length, width, depth, price_per_night, amenities, description, dock_etiquette, available, images) VALUES
  ('Dockmaster Slip', 26.0, 10.0, 6.0, 60.00, '["Water", "Electric (120V)"]', 'Prime waterfront slip with easy access to main channel', 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.', true, '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
  ('Slip 2', 26.0, 10.0, 6.0, 60.00, '["Water", "Electric (120V)"]', 'Convenient slip close to parking area', 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.', false, '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
  ('Slip 3', 26.0, 10.0, 6.0, 60.00, '["Water", "Electric (120V)"]', 'Spacious slip with great views', 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.', true, '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
  ('Slip 4', 26.0, 10.0, 6.0, 60.00, '["Water", "Electric (120V)"]', 'Premium slip with easy access', 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.', true, '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
  ('Slip 5', 26.0, 10.0, 6.0, 60.00, '["Water", "Electric (120V)"]', 'Quiet slip perfect for relaxation', 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.', true, '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
  ('Slip 6', 26.0, 10.0, 6.0, 60.00, '["Water", "Electric (120V)"]', 'Family-friendly slip with amenities', 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.', true, '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
  ('Slip 7', 26.0, 10.0, 6.0, 60.00, '["Water", "Electric (120V)"]', 'Convenient slip near facilities', 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.', true, '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
  ('Slip 8', 26.0, 10.0, 6.0, 60.00, '["Water", "Electric (120V)"]', 'Premium waterfront location', 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.', true, '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
  ('Slip 9', 26.0, 10.0, 6.0, 60.00, '["Water", "Electric (120V)"]', 'Peaceful slip with great views', 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.', true, '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
  ('Slip 10', 26.0, 10.0, 6.0, 60.00, '["Water", "Electric (120V)"]', 'Spacious slip for larger boats', 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.', true, '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
  ('Slip 11', 26.0, 10.0, 6.0, 60.00, '["Water", "Electric (120V)"]', 'Convenient slip near parking', 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.', true, '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]'),
  ('Slip 12', 26.0, 10.0, 6.0, 60.00, '["Water", "Electric (120V)"]', 'Premium slip with amenities', 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We''re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon''t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don''t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.', true, '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"]')
ON CONFLICT (name) DO NOTHING;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for public read access
CREATE POLICY "public can read users" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "public can read slips" ON slips FOR SELECT TO anon USING (true);
CREATE POLICY "public can read bookings" ON bookings FOR SELECT TO anon USING (true);

-- 8. Create policies for authenticated users
CREATE POLICY "authenticated users can insert bookings" ON bookings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated users can update own bookings" ON bookings FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "authenticated users can delete own bookings" ON bookings FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 9. Create policies for admin users
CREATE POLICY "admin users can manage all data" ON users FOR ALL TO authenticated USING (user_type IN ('admin', 'superadmin'));
CREATE POLICY "admin users can manage all slips" ON slips FOR ALL TO authenticated USING (user_type IN ('admin', 'superadmin'));
CREATE POLICY "admin users can manage all bookings" ON bookings FOR ALL TO authenticated USING (user_type IN ('admin', 'superadmin'));

