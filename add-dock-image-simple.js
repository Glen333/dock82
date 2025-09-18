#!/usr/bin/env node

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

console.log('🖼️  Adding dock image to all slips using API...\n');

async function addDockImageToAllSlips() {
  try {
    // Replace this URL with your actual dock image URL
    const dockImageUrl = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center";
    
    console.log('📡 Sending request to update all slip images...');
    console.log(`🖼️  Image URL: ${dockImageUrl}`);
    
    // Use your existing API endpoint
    const response = await fetch('https://dock82-app.vercel.app/api/slips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update-images',
        imageUrl: dockImageUrl
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Success!');
      console.log(`📊 Updated ${result.updatedCount} slips`);
      console.log(`🖼️  Image URL: ${result.imageUrl}`);
    } else {
      console.log('❌ Failed to update images');
      console.log(`Error: ${result.error}`);
    }
    
    return result;
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Run the update
addDockImageToAllSlips().catch(console.error);


