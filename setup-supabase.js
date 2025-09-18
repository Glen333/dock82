#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple password hashing function
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function setupSupabase() {
  console.log('🚀 Setting up Supabase database...');
  console.log('=====================================');

  try {
    // Create users table
    console.log('📋 Creating users table...');
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (usersError) {
      console.error('❌ Error creating users table:', usersError);
      return;
    }
    console.log('✅ Users table created');

    // Create slips table
    console.log('📋 Creating slips table...');
    const { error: slipsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (slipsError) {
      console.error('❌ Error creating slips table:', slipsError);
      return;
    }
    console.log('✅ Slips table created');

    // Create bookings table
    console.log('📋 Creating bookings table...');
    const { error: bookingsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (bookingsError) {
      console.error('❌ Error creating bookings table:', bookingsError);
      return;
    }
    console.log('✅ Bookings table created');

    // Insert sample data
    console.log('📋 Inserting sample data...');
    await insertSampleData();

    console.log('🎉 Supabase database setup completed successfully!');
    console.log('=====================================');
    console.log('🔑 Login Credentials:');
    console.log('   Superadmin: Glen@centriclearning.net / Dock82Admin2024!');
    console.log('   Admin: admin@dock82.com / Dock82Admin2024!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

async function insertSampleData() {
  try {
    // Check if sample data already exists
    const { data: existingSlips, error: checkError } = await supabase
      .from('slips')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking existing data:', checkError);
      return;
    }

    if (existingSlips && existingSlips.length > 0) {
      console.log('ℹ️  Sample data already exists');
      return;
    }

    // Create superadmin user
    console.log('👑 Creating superadmin user...');
    const superadminPasswordHash = await hashPassword('Dock82Admin2024!');
    const { data: superadmin, error: superadminError } = await supabase
      .from('users')
      .insert({
        name: 'Super Admin',
        email: 'Glen@centriclearning.net',
        password_hash: superadminPasswordHash,
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
      })
      .select()
      .single();

    if (superadminError) {
      console.error('❌ Error creating superadmin:', superadminError);
    } else {
      console.log('✅ Superadmin user created');
    }

    // Create regular admin user
    console.log('🔧 Creating regular admin user...');
    const adminPasswordHash = await hashPassword('Dock82Admin2024!');
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .insert({
        name: 'Regular Admin',
        email: 'admin@dock82.com',
        password_hash: adminPasswordHash,
        user_type: 'admin',
        phone: '555-0124',
        permissions: {
          manage_slips: true,
          manage_bookings: true,
          view_analytics: true
        }
      })
      .select()
      .single();

    if (adminError) {
      console.error('❌ Error creating admin:', adminError);
    } else {
      console.log('✅ Regular admin user created');
    }

    // Insert sample slips
    console.log('🚤 Creating sample dock slips...');
    const sampleSlips = [
      {
        name: 'Dockmaster Slip',
        max_length: 26.0,
        width: 10.0,
        depth: 6.0,
        price_per_night: 60.00,
        amenities: ['Water', 'Electric (120V)'],
        description: 'Prime waterfront slip with easy access to main channel',
        dock_etiquette: 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We\'re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon\'t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don\'t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
        available: true,
        images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center']
      },
      {
        name: 'Slip 2',
        max_length: 26.0,
        width: 10.0,
        depth: 6.0,
        price_per_night: 60.00,
        amenities: ['Water', 'Electric (120V)'],
        description: 'Convenient slip close to parking area',
        dock_etiquette: 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We\'re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon\'t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don\'t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
        available: false,
        images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center']
      }
    ];

    // Add more slips
    for (let i = 3; i <= 12; i++) {
      sampleSlips.push({
        name: `Slip ${i}`,
        max_length: 26.0,
        width: 10.0,
        depth: 6.0,
        price_per_night: 60.00,
        amenities: ['Water', 'Electric (120V)'],
        description: `Slip ${i} - Spacious slip with great views`,
        dock_etiquette: 'Dock Slip Rental Rules\n\n1. Be courteous to our neighborhood\nRespect fellow boaters and the dock community. We\'re all here to enjoy the water together.\n\n2. Mind the tides when tying up\nDon\'t tie your boat too tight. Boats may be damaged or damage the dock if tied too tight. Leave enough slack for extreme water level changes.\n\n3. Pack it in, pack it out\nTake everything you brought with you when you leave. Don\'t leave trash, gear, or personal items behind.\n\n4. Clean up after yourself\nClean the fish cleaning table after use. Leave shared facilities ready for the next person.\n\n5. Use only your assigned slip\nStay in your designated slip number.',
        available: true,
        images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center']
      });
    }

    const { data: slips, error: slipsError } = await supabase
      .from('slips')
      .insert(sampleSlips)
      .select();

    if (slipsError) {
      console.error('❌ Error creating sample slips:', slipsError);
    } else {
      console.log(`✅ ${slips.length} sample slips created`);
    }

    console.log('✅ Sample data inserted successfully');

  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  }
}

// Run the setup
setupSupabase();




