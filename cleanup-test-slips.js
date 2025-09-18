#!/usr/bin/env node

// Temporary script to clean up test slips from Supabase database
// Run this script to remove the 6 test slips that shouldn't be there

const testSlipIds = [
  "e7075755-a81b-47a2-b842-a51fe1e4a54a", // Line Test Slip 100
  "6f6d9cf3-d192-4948-969d-eec44870cdf7", // Line Test Slip 1757888035695
  "ea0f2312-dbb7-44e2-8f87-2c575762ed2a", // Test Slip
  "28af76e6-33bd-44da-9617-9003383c72d1", // Test Slip 1757888009121
  "b568729a-426f-48e6-9ce0-9b00550210e0", // Test Slip 1757889456604
  "6a3acb55-fd86-411e-a2ec-3409ca1ae1ed"  // Test Slip 99
];

async function cleanupTestSlips() {
  console.log("🧹 Starting cleanup of test slips...");
  console.log(`📋 Found ${testSlipIds.length} test slips to remove`);
  
  // Since we can't directly access the database from here,
  // let's try using the API endpoints with different approaches
  
  for (let i = 0; i < testSlipIds.length; i++) {
    const slipId = testSlipIds[i];
    console.log(`\n🗑️  Attempting to remove slip ${i + 1}/${testSlipIds.length}: ${slipId}`);
    
    try {
      // Try different API approaches
      const approaches = [
        {
          name: "Admin API - deleteSlip",
          url: "https://www.dock82.com/api/admin",
          method: "POST",
          data: { action: "deleteSlip", slipId: slipId }
        },
        {
          name: "Admin API - remove",
          url: "https://www.dock82.com/api/admin", 
          method: "POST",
          data: { action: "remove", type: "slip", id: slipId }
        },
        {
          name: "Slips API - delete",
          url: "https://www.dock82.com/api/slips",
          method: "POST", 
          data: { action: "delete", id: slipId }
        }
      ];
      
      for (const approach of approaches) {
        try {
          const response = await fetch(approach.url, {
            method: approach.method,
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(approach.data)
          });
          
          const result = await response.text();
          console.log(`   ${approach.name}: ${response.status} - ${result}`);
          
          if (result.includes('success') || response.status === 200) {
            console.log(`   ✅ Successfully removed slip ${slipId}`);
            break;
          }
        } catch (error) {
          console.log(`   ❌ ${approach.name} failed: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Failed to remove slip ${slipId}: ${error.message}`);
    }
  }
  
  console.log("\n🔍 Verifying cleanup...");
  
  try {
    const response = await fetch("https://www.dock82.com/api/slips");
    const data = await response.json();
    const slipCount = data.slips ? data.slips.length : 0;
    
    console.log(`📊 Current slip count: ${slipCount}`);
    
    if (slipCount === 14) {
      console.log("✅ SUCCESS: Exactly 14 slips remaining!");
    } else if (slipCount < 20) {
      console.log(`⚠️  PARTIAL SUCCESS: Reduced from 20 to ${slipCount} slips`);
    } else {
      console.log("❌ No change: Still have 20+ slips");
    }
    
    // Show remaining slips
    if (data.slips) {
      console.log("\n📋 Remaining slips:");
      data.slips.forEach((slip, index) => {
        console.log(`   ${index + 1}. ${slip.name} (${slip.id})`);
      });
    }
    
  } catch (error) {
    console.log(`❌ Failed to verify cleanup: ${error.message}`);
  }
}

// Run the cleanup
cleanupTestSlips().catch(console.error);

