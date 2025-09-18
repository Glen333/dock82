#!/usr/bin/env node

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

console.log('🔍 Verifying slip images...\n');

async function verifySlipImages() {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    console.log('1️⃣ Fetching all slips with their images...');
    
    const { data: slips, error } = await supabase
      .from('slips')
      .select('id, name, images')
      .order('name');
    
    if (error) {
      throw new Error(`Failed to fetch slips: ${error.message}`);
    }
    
    console.log(`📋 Found ${slips.length} slips:\n`);
    
    let totalImages = 0;
    let slipsWithImages = 0;
    
    slips.forEach((slip, index) => {
      const imageCount = slip.images ? slip.images.length : 0;
      totalImages += imageCount;
      
      if (imageCount > 0) {
        slipsWithImages++;
        console.log(`${index + 1}. ${slip.name}`);
        console.log(`   📊 Images: ${imageCount}`);
        console.log(`   🖼️  First image: ${slip.images[0].substring(0, 60)}...`);
        console.log('');
      } else {
        console.log(`${index + 1}. ${slip.name} - ❌ No images`);
      }
    });
    
    console.log('📊 Summary:');
    console.log('===========');
    console.log(`Total slips: ${slips.length}`);
    console.log(`Slips with images: ${slipsWithImages}`);
    console.log(`Total images: ${totalImages}`);
    console.log(`Average images per slip: ${(totalImages / slips.length).toFixed(1)}`);
    
    if (slipsWithImages === slips.length) {
      console.log('\n✅ All slips have images!');
    } else {
      console.log(`\n⚠️  ${slips.length - slipsWithImages} slips are missing images`);
    }
    
    return {
      totalSlips: slips.length,
      slipsWithImages,
      totalImages,
      averageImages: totalImages / slips.length
    };
    
  } catch (error) {
    console.log(`❌ Error verifying slip images: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Run the verification
verifySlipImages().catch(console.error);


