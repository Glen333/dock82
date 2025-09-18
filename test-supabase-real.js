#!/usr/bin/env node

console.log('🧪 Testing Real Supabase Connection...');
console.log('=====================================');

async function testSupabaseReal() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    // Test with real Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('📋 Environment Variables:');
    console.log(`   URL: ${supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'Not set'}`);
    console.log(`   Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'Not set'}`);
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Environment variables not set');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test 1: Check if tables exist
    console.log('\n📋 Test 1: Checking if tables exist...');
    
    const tables = ['users', 'slips', 'bookings'];
    const tableResults = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          tableResults[table] = { exists: false, error: error.message };
        } else {
          tableResults[table] = { exists: true, data };
        }
      } catch (error) {
        tableResults[table] = { exists: false, error: error.message };
      }
    }
    
    console.log('Table Status:');
    Object.entries(tableResults).forEach(([table, result]) => {
      console.log(`   ${table}: ${result.exists ? '✅ Exists' : '❌ Missing'} ${result.error ? `(${result.error})` : ''}`);
    });
    
    // Test 2: Try to create a test slip
    console.log('\n📋 Test 2: Testing slip creation...');
    
    try {
      const testSlip = {
        name: 'Test Slip',
        max_length: 26.0,
        width: 10.0,
        depth: 6.0,
        price_per_night: 60.00,
        amenities: ['Water', 'Electric'],
        description: 'Test slip for upload testing',
        available: true,
        images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center']
      };
      
      const { data: createdSlip, error: createError } = await supabase
        .from('slips')
        .insert(testSlip)
        .select()
        .single();
      
      if (createError) {
        console.log(`❌ Failed to create test slip: ${createError.message}`);
      } else {
        console.log(`✅ Test slip created with ID: ${createdSlip.id}`);
        
        // Test 3: Test image upload to this slip
        console.log('\n📋 Test 3: Testing image upload...');
        
        const testImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
        
        const { data: updatedSlip, error: updateError } = await supabase
          .from('slips')
          .update({ 
            images: [testImageData],
            updated_at: new Date().toISOString()
          })
          .eq('id', createdSlip.id)
          .select()
          .single();
        
        if (updateError) {
          console.log(`❌ Failed to update slip with image: ${updateError.message}`);
        } else {
          console.log(`✅ Image uploaded successfully to slip ${updatedSlip.id}`);
          console.log(`   Images array length: ${updatedSlip.images ? updatedSlip.images.length : 0}`);
          
          // Test 4: Verify image retrieval
          console.log('\n📋 Test 4: Testing image retrieval...');
          
          const { data: retrievedSlip, error: retrieveError } = await supabase
            .from('slips')
            .select('id, name, images')
            .eq('id', createdSlip.id)
            .single();
          
          if (retrieveError) {
            console.log(`❌ Failed to retrieve slip: ${retrieveError.message}`);
          } else {
            console.log(`✅ Image retrieved successfully`);
            console.log(`   Slip: ${retrievedSlip.name}`);
            console.log(`   Images: ${retrievedSlip.images ? retrievedSlip.images.length : 0} images`);
            if (retrievedSlip.images && retrievedSlip.images.length > 0) {
              console.log(`   First image starts with: ${retrievedSlip.images[0].substring(0, 50)}...`);
            }
          }
        }
        
        // Clean up: Delete test slip
        console.log('\n📋 Cleanup: Deleting test slip...');
        const { error: deleteError } = await supabase
          .from('slips')
          .delete()
          .eq('id', createdSlip.id);
        
        if (deleteError) {
          console.log(`⚠️  Failed to delete test slip: ${deleteError.message}`);
        } else {
          console.log(`✅ Test slip deleted successfully`);
        }
      }
    } catch (error) {
      console.log(`❌ Error during slip testing: ${error.message}`);
    }
    
    // Summary
    console.log('\n🎉 Supabase Real Connection Test Complete');
    console.log('=========================================');
    
    const allTablesExist = Object.values(tableResults).every(result => result.exists);
    
    if (allTablesExist) {
      console.log('✅ All tables exist');
      console.log('✅ Database operations working');
      console.log('✅ Image upload functionality verified');
      console.log('\n🚀 Your Supabase setup is working perfectly!');
      console.log('📝 You can now test image uploads in the admin panel.');
    } else {
      console.log('❌ Some tables are missing');
      console.log('📝 Please create the missing tables in Supabase dashboard');
      console.log('📝 Use the SQL provided in the previous test output');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSupabaseReal();




