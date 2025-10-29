const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Testing local environment slip data...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSlipData() {
  console.log('📊 Fetching slip data...');
  
  const { data: slips, error } = await supabase
    .from('slips')
    .select('id, name, image_url')
    .order('id');
    
  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }
  
  console.log('✅ Found', slips.length, 'slips:');
  slips.forEach(slip => {
    console.log(`Slip ${slip.id}: ${slip.name}`);
    console.log(`  - image_url: ${slip.image_url || 'NULL'}`);
    if (slip.image_url && slip.image_url.includes('photo-1544551763')) {
      console.log('  ✅ This is the Unsplash placeholder image!');
    }
    console.log('');
  });
  
  // Test if we can access the image
  if (slips.length > 0 && slips[0].image_url) {
    console.log('🖼️  Testing image accessibility...');
    try {
      const response = await fetch(slips[0].image_url);
      console.log(`Image status: ${response.status} ${response.statusText}`);
      if (response.ok) {
        console.log('✅ Image is accessible');
      } else {
        console.log('❌ Image is not accessible');
      }
    } catch (error) {
      console.log('❌ Error accessing image:', error.message);
    }
  }
}

testSlipData().catch(console.error);
