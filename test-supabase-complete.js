#!/usr/bin/env node

console.log('🧪 Comprehensive Supabase Test');
console.log('==============================');

// Test the Supabase setup step by step
async function testSupabaseComplete() {
  try {
    // Test 1: Check environment variables
    console.log('📋 Test 1: Checking environment variables...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log(`✅ SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Missing'}`);
    console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? 'Set' : 'Missing'}`);
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Environment variables not set. Please set them first.');
      return;
    }
    
    // Test 2: Test Supabase connection
    console.log('\n📋 Test 2: Testing Supabase connection...');
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
      // Test connection by trying to query a table
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log('❌ Supabase connection failed:', error.message);
        console.log('   This might mean:');
        console.log('   - Tables don\'t exist yet');
        console.log('   - Environment variables are incorrect');
        console.log('   - Supabase project is not accessible');
      } else {
        console.log('✅ Supabase connection successful');
      }
    } catch (error) {
      console.log('❌ Supabase connection error:', error.message);
    }
    
    // Test 3: Check API endpoint structure
    console.log('\n📋 Test 3: Checking API endpoint structure...');
    
    const fs = require('fs');
    
    const apiFiles = [
      'api/upload-image.js',
      'api/slips.js', 
      'api/bookings.js',
      'api/users.js',
      'api/init-supabase.js'
    ];
    
    let allFilesExist = true;
    apiFiles.forEach(file => {
      const exists = fs.existsSync(file);
      console.log(`${exists ? '✅' : '❌'} ${file}`);
      if (!exists) allFilesExist = false;
    });
    
    if (!allFilesExist) {
      console.log('❌ Some API files are missing');
      return;
    }
    
    // Test 4: Check for Supabase imports
    console.log('\n📋 Test 4: Checking Supabase imports...');
    
    let allImportsCorrect = true;
    apiFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const hasImport = content.includes("import { createClient } from '@supabase/supabase-js'");
      const hasClient = content.includes('createClient(supabaseUrl, supabaseServiceKey)');
      
      console.log(`${hasImport ? '✅' : '❌'} ${file} - Import statement`);
      console.log(`${hasClient ? '✅' : '❌'} ${file} - Client creation`);
      
      if (!hasImport || !hasClient) allImportsCorrect = false;
    });
    
    if (!allImportsCorrect) {
      console.log('❌ Some files have incorrect Supabase setup');
      return;
    }
    
    // Test 5: Check frontend integration
    console.log('\n📋 Test 5: Checking frontend integration...');
    
    const frontendFile = 'src/DockRentalPlatform.js';
    if (fs.existsSync(frontendFile)) {
      const content = fs.readFileSync(frontendFile, 'utf8');
      const hasUploadFunction = content.includes('handleSaveImage');
      const hasApiCall = content.includes('/api/upload-image');
      const hasErrorHandling = content.includes('console.error');
      
      console.log(`${hasUploadFunction ? '✅' : '❌'} Upload function exists`);
      console.log(`${hasApiCall ? '✅' : '❌'} API call configured`);
      console.log(`${hasErrorHandling ? '✅' : '❌'} Error handling implemented`);
      
      if (!hasUploadFunction || !hasApiCall) {
        console.log('❌ Frontend integration incomplete');
        return;
      }
    } else {
      console.log('❌ Frontend file not found');
      return;
    }
    
    // Test 6: Check package.json
    console.log('\n📋 Test 6: Checking dependencies...');
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasSupabase = packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js'];
    
    console.log(`${hasSupabase ? '✅' : '❌'} Supabase dependency installed`);
    
    if (!hasSupabase) {
      console.log('❌ Supabase dependency missing');
      return;
    }
    
    // Summary
    console.log('\n🎉 Supabase Setup Analysis Complete');
    console.log('===================================');
    console.log('✅ Environment variables checked');
    console.log('✅ Supabase connection tested');
    console.log('✅ API files verified');
    console.log('✅ Supabase imports confirmed');
    console.log('✅ Frontend integration checked');
    console.log('✅ Dependencies verified');
    
    console.log('\n📝 Next Steps:');
    console.log('1. Create Supabase project at https://supabase.com');
    console.log('2. Create tables manually in Supabase dashboard:');
    console.log('   - users (id, name, email, password_hash, user_type, permissions, etc.)');
    console.log('   - slips (id, name, max_length, width, depth, price_per_night, images, etc.)');
    console.log('   - bookings (id, slip_id, user_id, guest_name, guest_email, etc.)');
    console.log('3. Set environment variables in Vercel');
    console.log('4. Deploy and test image uploads');
    
    console.log('\n🔧 If tables don\'t exist, you can create them manually in Supabase SQL editor:');
    console.log(`
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  user_type VARCHAR(50) DEFAULT 'renter',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Slips table
CREATE TABLE slips (
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

-- Bookings table
CREATE TABLE bookings (
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
    `);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSupabaseComplete();


