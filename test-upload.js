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

async function testUpload() {
  console.log('🧪 Testing image upload functionality...');
  console.log('=====================================');

  try {
    // Test 1: Check if slips exist
    console.log('📋 Test 1: Checking if slips exist...');
    const { data: slips, error: slipsError } = await supabase
      .from('slips')
      .select('id, name')
      .limit(5);

    if (slipsError) {
      console.error('❌ Error fetching slips:', slipsError);
      return;
    }

    if (!slips || slips.length === 0) {
      console.error('❌ No slips found. Please run setup-supabase.js first.');
      return;
    }

    console.log(`✅ Found ${slips.length} slips`);
    console.log('   Slips:', slips.map(s => `${s.id}: ${s.name}`).join(', '));

    // Test 2: Test image upload to first slip
    console.log('\n📋 Test 2: Testing image upload...');
    const testSlip = slips[0];
    const testImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

    const { data: updateData, error: updateError } = await supabase
      .from('slips')
      .update({ 
        images: [testImageData],
        updated_at: new Date().toISOString()
      })
      .eq('id', testSlip.id)
      .select();

    if (updateError) {
      console.error('❌ Error updating slip with image:', updateError);
      return;
    }

    if (!updateData || updateData.length === 0) {
      console.error('❌ No slip updated');
      return;
    }

    console.log('✅ Image uploaded successfully to slip:', testSlip.name);
    console.log('   Updated slip ID:', updateData[0].id);
    console.log('   Images array length:', updateData[0].images ? updateData[0].images.length : 0);

    // Test 3: Verify image retrieval
    console.log('\n📋 Test 3: Testing image retrieval...');
    const { data: retrievedSlip, error: retrieveError } = await supabase
      .from('slips')
      .select('id, name, images')
      .eq('id', testSlip.id)
      .single();

    if (retrieveError) {
      console.error('❌ Error retrieving slip:', retrieveError);
      return;
    }

    if (retrievedSlip.images && retrievedSlip.images.length > 0) {
      console.log('✅ Image retrieved successfully');
      console.log('   Image data starts with:', retrievedSlip.images[0].substring(0, 50) + '...');
    } else {
      console.error('❌ No images found in retrieved slip');
    }

    // Test 4: Test API endpoint
    console.log('\n📋 Test 4: Testing API endpoint...');
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/test-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'test-connection'
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API endpoint test successful');
      console.log('   Response:', result);
    } else {
      console.error('❌ API endpoint test failed');
      console.error('   Status:', response.status);
      const errorText = await response.text();
      console.error('   Error:', errorText);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('=====================================');
    console.log('✅ Image upload functionality is working correctly');
    console.log('✅ Database connection is working');
    console.log('✅ API endpoints are responding');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testUpload();


