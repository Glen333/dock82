#!/usr/bin/env node

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

console.log('🔍 Testing Supabase Database Connection...\n');

async function testSupabaseConnection() {
  console.log('1️⃣ Testing Supabase connection...');
  
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable not found');
    }
    
    console.log('   📡 SUPABASE_URL found:', process.env.SUPABASE_URL);
    console.log('   🔑 SUPABASE_SERVICE_ROLE_KEY found:', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...');
    
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Test basic connection by querying users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }
    
    console.log('   ✅ Supabase connection successful!');
    console.log('   📊 Query result:', data);
    return { success: true, data };
    
  } catch (error) {
    console.log('   ❌ Supabase connection failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testDatabaseTables() {
  console.log('\n2️⃣ Testing database tables...');
  
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const tables = ['users', 'slips', 'bookings'];
    const results = {};
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          throw new Error(error.message);
        }
        
        results[table] = { success: true, count: count || 0 };
        console.log(`   ✅ Table '${table}': ${count || 0} records`);
      } catch (error) {
        results[table] = { success: false, error: error.message };
        console.log(`   ❌ Table '${table}': ${error.message}`);
      }
    }
    
    return results;
    
  } catch (error) {
    console.log('   ❌ Database tables test failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testSampleQueries() {
  console.log('\n3️⃣ Testing sample queries...');
  
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Test users query
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, user_type')
      .limit(3);
    
    if (usersError) {
      throw new Error(`Users query error: ${usersError.message}`);
    }
    
    console.log(`   ✅ Users query: Found ${users.length} users`);
    if (users.length > 0) {
      console.log(`   📋 Sample user: ${users[0].name} (${users[0].email})`);
    }
    
    // Test slips query
    const { data: slips, error: slipsError } = await supabase
      .from('slips')
      .select('id, name, location, price_per_night')
      .limit(3);
    
    if (slipsError) {
      console.log(`   ⚠️  Slips query error: ${slipsError.message}`);
    } else {
      console.log(`   ✅ Slips query: Found ${slips.length} slips`);
      if (slips.length > 0) {
        console.log(`   📋 Sample slip: ${slips[0].name} - $${slips[0].price_per_night}/night`);
      }
    }
    
    // Test bookings query
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, guest_name, check_in, check_out, total_cost')
      .limit(3);
    
    if (bookingsError) {
      console.log(`   ⚠️  Bookings query error: ${bookingsError.message}`);
    } else {
      console.log(`   ✅ Bookings query: Found ${bookings.length} bookings`);
      if (bookings.length > 0) {
        console.log(`   📋 Sample booking: ${bookings[0].guest_name} - $${bookings[0].total_cost}`);
      }
    }
    
    return { success: true, users, slips, bookings };
    
  } catch (error) {
    console.log('   ❌ Sample queries test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Supabase-only database tests...\n');
  
  const results = {
    connection: await testSupabaseConnection(),
    tables: await testDatabaseTables(),
    queries: await testSampleQueries()
  };
  
  console.log('\n📋 Test Summary:');
  console.log('================');
  
  const connectionStatus = results.connection.success ? '✅ PASS' : '❌ FAIL';
  const queriesStatus = results.queries.success ? '✅ PASS' : '❌ FAIL';
  
  console.log(`Supabase Connection: ${connectionStatus}`);
  console.log(`Sample Queries: ${queriesStatus}`);
  
  if (results.tables && typeof results.tables === 'object') {
    console.log('\nDatabase Tables:');
    Object.entries(results.tables).forEach(([table, result]) => {
      const status = result.success ? '✅' : '❌';
      const info = result.success ? `${result.count} records` : result.error;
      console.log(`  ${table}: ${status} ${info}`);
    });
  }
  
  // Overall status
  const allPassed = results.connection.success && results.queries.success;
  console.log(`\n🎯 Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Your Supabase database is working perfectly!');
    console.log('   You can now use only Supabase for your dock rental platform.');
  } else {
    console.log('\n🔧 Recommended Actions:');
    if (!results.connection.success) {
      console.log('   - Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      console.log('   - Verify Supabase project is active');
    }
  }
  
  return results;
}

// Run the tests
runTests().catch(console.error);


