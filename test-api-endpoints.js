#!/usr/bin/env node

console.log('🧪 Testing API Endpoint Code Structure...');
console.log('==========================================');

// Test the API endpoint code structure
function testAPIEndpoints() {
  try {
    // Test 1: Check upload-image.js structure
    console.log('📋 Test 1: Checking upload-image.js structure...');
    
    const fs = require('fs');
    const uploadImageCode = fs.readFileSync('./api/upload-image.js', 'utf8');
    
    const requiredElements = [
      'import { createClient } from \'@supabase/supabase-js\'',
      'const supabaseUrl = process.env.SUPABASE_URL',
      'const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY',
      'export default async function handler(req, res)',
      'if (req.method !== \'POST\')',
      'action === \'upload-image\'',
      'imageData.startsWith(\'data:image/\')',
      'supabase.from(\'slips\')',
      'return res.status(200).json'
    ];
    
    let allElementsFound = true;
    requiredElements.forEach(element => {
      const found = uploadImageCode.includes(element);
      console.log(`${found ? '✅' : '❌'} ${element.substring(0, 50)}...`);
      if (!found) allElementsFound = false;
    });
    
    console.log(`\n${allElementsFound ? '✅' : '❌'} Upload image API structure: ${allElementsFound ? 'CORRECT' : 'MISSING ELEMENTS'}`);
    
    // Test 2: Check slips.js structure
    console.log('\n📋 Test 2: Checking slips.js structure...');
    
    const slipsCode = fs.readFileSync('./api/slips.js', 'utf8');
    
    const slipsElements = [
      'import { createClient } from \'@supabase/supabase-js\'',
      'export default async function handler(req, res)',
      'req.method === \'GET\'',
      'supabase.from(\'slips\')',
      'action === \'update-images\'',
      'action === \'update-slip\''
    ];
    
    let allSlipsElementsFound = true;
    slipsElements.forEach(element => {
      const found = slipsCode.includes(element);
      console.log(`${found ? '✅' : '❌'} ${element.substring(0, 50)}...`);
      if (!found) allSlipsElementsFound = false;
    });
    
    console.log(`\n${allSlipsElementsFound ? '✅' : '❌'} Slips API structure: ${allSlipsElementsFound ? 'CORRECT' : 'MISSING ELEMENTS'}`);
    
    // Test 3: Check bookings.js structure
    console.log('\n📋 Test 3: Checking bookings.js structure...');
    
    const bookingsCode = fs.readFileSync('./api/bookings.js', 'utf8');
    
    const bookingsElements = [
      'import { createClient } from \'@supabase/supabase-js\'',
      'export default async function handler(req, res)',
      'supabase.from(\'bookings\')',
      'action === \'create-booking\'',
      'action === \'update-booking\'',
      'action === \'delete-booking\''
    ];
    
    let allBookingsElementsFound = true;
    bookingsElements.forEach(element => {
      const found = bookingsCode.includes(element);
      console.log(`${found ? '✅' : '❌'} ${element.substring(0, 50)}...`);
      if (!found) allBookingsElementsFound = false;
    });
    
    console.log(`\n${allBookingsElementsFound ? '✅' : '❌'} Bookings API structure: ${allBookingsElementsFound ? 'CORRECT' : 'MISSING ELEMENTS'}`);
    
    // Test 4: Check users.js structure
    console.log('\n📋 Test 4: Checking users.js structure...');
    
    const usersCode = fs.readFileSync('./api/users.js', 'utf8');
    
    const usersElements = [
      'import { createClient } from \'@supabase/supabase-js\'',
      'export default async function handler(req, res)',
      'supabase.from(\'users\')',
      'action === \'login\'',
      'action === \'register\'',
      'action === \'create-admin\'',
      'action === \'delete-user\''
    ];
    
    let allUsersElementsFound = true;
    usersElements.forEach(element => {
      const found = usersCode.includes(element);
      console.log(`${found ? '✅' : '❌'} ${element.substring(0, 50)}...`);
      if (!found) allUsersElementsFound = false;
    });
    
    console.log(`\n${allUsersElementsFound ? '✅' : '❌'} Users API structure: ${allUsersElementsFound ? 'CORRECT' : 'MISSING ELEMENTS'}`);
    
    // Test 5: Check frontend integration
    console.log('\n📋 Test 5: Checking frontend integration...');
    
    const frontendCode = fs.readFileSync('./src/DockRentalPlatform.js', 'utf8');
    
    const frontendElements = [
      'handleSaveImage',
      'fetch(`${process.env.REACT_APP_API_URL || \'\'}/api/upload-image`',
      'action: \'upload-image\'',
      'slipId: editingSlip.id',
      'imageData: editingImage',
      'console.log(\'Starting image upload for slip:\'',
      'console.log(\'Upload response status:\'',
      'console.log(\'Upload response:\'',
      'alert(\'✅ Image uploaded and saved to database successfully!\')'
    ];
    
    let allFrontendElementsFound = true;
    frontendElements.forEach(element => {
      const found = frontendCode.includes(element);
      console.log(`${found ? '✅' : '❌'} ${element.substring(0, 50)}...`);
      if (!found) allFrontendElementsFound = false;
    });
    
    console.log(`\n${allFrontendElementsFound ? '✅' : '❌'} Frontend integration: ${allFrontendElementsFound ? 'CORRECT' : 'MISSING ELEMENTS'}`);
    
    // Test 6: Check for specific Supabase operations
    console.log('\n📋 Test 6: Checking Supabase operations...');
    
    const supabaseOperations = [
      'supabase.from(\'slips\').update',
      'supabase.from(\'slips\').select',
      'supabase.from(\'bookings\').select',
      'supabase.from(\'users\').select',
      'supabase.from(\'users\').insert',
      'supabase.from(\'users\').delete'
    ];
    
    let allOperationsFound = true;
    supabaseOperations.forEach(operation => {
      const found = uploadImageCode.includes(operation) || 
                   slipsCode.includes(operation) || 
                   bookingsCode.includes(operation) || 
                   usersCode.includes(operation);
      console.log(`${found ? '✅' : '❌'} ${operation}`);
      if (!found) allOperationsFound = false;
    });
    
    console.log(`\n${allOperationsFound ? '✅' : '❌'} Supabase operations: ${allOperationsFound ? 'CORRECT' : 'MISSING ELEMENTS'}`);
    
    // Summary
    console.log('\n🎉 API Endpoint Test Summary');
    console.log('============================');
    console.log(`✅ Upload Image API: ${allElementsFound ? 'READY' : 'NEEDS FIXES'}`);
    console.log(`✅ Slips API: ${allSlipsElementsFound ? 'READY' : 'NEEDS FIXES'}`);
    console.log(`✅ Bookings API: ${allBookingsElementsFound ? 'READY' : 'NEEDS FIXES'}`);
    console.log(`✅ Users API: ${allUsersElementsFound ? 'READY' : 'NEEDS FIXES'}`);
    console.log(`✅ Frontend Integration: ${allFrontendElementsFound ? 'READY' : 'NEEDS FIXES'}`);
    console.log(`✅ Supabase Operations: ${allOperationsFound ? 'READY' : 'NEEDS FIXES'}`);
    
    const overallSuccess = allElementsFound && allSlipsElementsFound && allBookingsElementsFound && allUsersElementsFound && allFrontendElementsFound && allOperationsFound;
    
    console.log(`\n${overallSuccess ? '🎉' : '⚠️'} Overall Status: ${overallSuccess ? 'ALL SYSTEMS READY' : 'SOME ISSUES DETECTED'}`);
    
    if (overallSuccess) {
      console.log('\n🚀 Ready for Supabase deployment!');
      console.log('📝 Next steps:');
      console.log('1. Create Supabase project');
      console.log('2. Set environment variables');
      console.log('3. Deploy to Vercel');
      console.log('4. Initialize database');
      console.log('5. Test image uploads');
    } else {
      console.log('\n🔧 Issues detected. Please check the failed elements above.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAPIEndpoints();
