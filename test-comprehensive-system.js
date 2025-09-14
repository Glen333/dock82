#!/usr/bin/env node

/**
 * COMPREHENSIVE SYSTEM TESTING SUITE
 * Tests every function with real user data and picture storage
 * Run with: node test-comprehensive-system.js
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'https://dock82-app.vercel.app',
  testUser: {
    name: 'Test User',
    email: `testuser${Date.now()}@dock82.com`,
    password: 'TestPassword123!',
    phone: '(555) 123-4567'
  },
  testSlip: {
    name: `Test Slip ${Date.now()}`,
    maxLength: 35,
    width: 12,
    depth: 8,
    pricePerNight: 85,
    amenities: ['Water', 'Electric (120V)', 'WiFi', 'Pump-out'],
    description: 'Comprehensive test slip for system validation',
    dockEtiquette: 'Test dock etiquette rules for comprehensive testing'
  },
  testImage: {
    // Base64 encoded test image (1x1 pixel PNG)
    data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&crop=center'
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function recordTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`PASSED: ${testName}`, 'success');
  } else {
    testResults.failed++;
    log(`FAILED: ${testName} - ${details}`, 'error');
  }
  testResults.details.push({ testName, passed, details });
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test functions
async function testUserRegistration() {
  log('Testing user registration...');
  
  const result = await makeRequest(`${TEST_CONFIG.baseUrl}/api/users`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'register',
      name: TEST_CONFIG.testUser.name,
      email: TEST_CONFIG.testUser.email,
      password: TEST_CONFIG.testUser.password,
      phone: TEST_CONFIG.testUser.phone
    })
  });
  
  const passed = result.success && (result.data.success || result.data.message);
  recordTest('User Registration', passed, result.success ? 'User registered successfully' : result.error || result.data.error);
  return passed;
}

async function testUserLogin() {
  log('Testing user login...');
  
  const result = await makeRequest(`${TEST_CONFIG.baseUrl}/api/users`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'login',
      email: TEST_CONFIG.testUser.email,
      password: TEST_CONFIG.testUser.password
    })
  });
  
  const passed = result.success && result.data.success;
  recordTest('User Login', passed, result.success ? 'User logged in successfully' : result.error || result.data.error);
  return passed;
}

async function testSlipCreation() {
  log('Testing slip creation...');
  
  const result = await makeRequest(`${TEST_CONFIG.baseUrl}/api/add-new-slips`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'add-new-slips',
      slipData: TEST_CONFIG.testSlip
    })
  });
  
  const passed = result.success && result.data.success;
  recordTest('Slip Creation', passed, result.success ? 'Slip created successfully' : result.error || result.data.error);
  return passed;
}

async function testSlipRetrieval() {
  log('Testing slip retrieval...');
  
  const result = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`);
  
  const passed = result.success && result.data.slips && Array.isArray(result.data.slips);
  recordTest('Slip Retrieval', passed, result.success ? `Retrieved ${result.data.slips.length} slips` : result.error || result.data.error);
  return passed;
}

async function testSlipUpdate() {
  log('Testing slip update...');
  
  // First get a slip to update
  const slipsResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`);
  if (!slipsResult.success || !slipsResult.data.slips.length) {
    recordTest('Slip Update', false, 'No slips available to update');
    return false;
  }
  
  const slipToUpdate = slipsResult.data.slips[0];
  const updatedData = {
    ...slipToUpdate,
    description: 'Updated description for comprehensive testing',
    pricePerNight: slipToUpdate.pricePerNight + 5
  };
  
  const result = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'update-slip',
      slipId: slipToUpdate.id,
      slipData: updatedData
    })
  });
  
  const passed = result.success && result.data.success;
  recordTest('Slip Update', passed, result.success ? 'Slip updated successfully' : result.error || result.data.error);
  return passed;
}

async function testImageUpload() {
  log('Testing image upload...');
  
  // First get a slip to update with image
  const slipsResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`);
  if (!slipsResult.success || !slipsResult.data.slips.length) {
    recordTest('Image Upload', false, 'No slips available to update with image');
    return false;
  }
  
  const slipToUpdate = slipsResult.data.slips[0];
  
  const result = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'update-slip',
      slipId: slipToUpdate.id,
      slipData: {
        ...slipToUpdate,
        images: TEST_CONFIG.testImage.url
      }
    })
  });
  
  const passed = result.success && result.data.success;
  recordTest('Image Upload', passed, result.success ? 'Image uploaded successfully' : result.error || result.data.error);
  return passed;
}

async function testBookingCreation() {
  log('Testing booking creation...');
  
  // First get a slip to book
  const slipsResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`);
  if (!slipsResult.success || !slipsResult.data.slips.length) {
    recordTest('Booking Creation', false, 'No slips available to book');
    return false;
  }
  
  const slipToBook = slipsResult.data.slips.find(slip => slip.available) || slipsResult.data.slips[0];
  
  const bookingData = {
    slipId: slipToBook.id,
    guestName: TEST_CONFIG.testUser.name,
    guestEmail: TEST_CONFIG.testUser.email,
    guestPhone: TEST_CONFIG.testUser.phone,
    checkIn: '2025-06-25',
    checkOut: '2025-06-27',
    boatLength: '28',
    boatMakeModel: 'Test Boat Model',
    userType: 'renter',
    nights: 2,
    totalCost: slipToBook.pricePerNight * 2,
    status: 'pending',
    bookingDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'pending'
  };
  
  const result = await makeRequest(`${TEST_CONFIG.baseUrl}/api/bookings`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'create-booking',
      bookingData: bookingData
    })
  });
  
  const passed = result.success && result.data.success;
  recordTest('Booking Creation', passed, result.success ? 'Booking created successfully' : result.error || result.data.error);
  return passed;
}

async function testBookingRetrieval() {
  log('Testing booking retrieval...');
  
  const result = await makeRequest(`${TEST_CONFIG.baseUrl}/api/bookings`);
  
  const passed = result.success && result.data.bookings && Array.isArray(result.data.bookings);
  recordTest('Booking Retrieval', passed, result.success ? `Retrieved ${result.data.bookings.length} bookings` : result.error || result.data.error);
  return passed;
}

async function testPaymentIntentCreation() {
  log('Testing payment intent creation...');
  
  const result = await makeRequest(`${TEST_CONFIG.baseUrl}/api/create-payment-intent`, {
    method: 'POST',
    body: JSON.stringify({
      amount: 2000, // $20.00
      currency: 'usd'
    })
  });
  
  const passed = result.success && (result.data.client_secret || result.data.success);
  recordTest('Payment Intent Creation', passed, result.success ? 'Payment intent created successfully' : result.error || result.data.error);
  return passed;
}

async function testNotificationSystem() {
  log('Testing notification system...');
  
  const result = await makeRequest(`${TEST_CONFIG.baseUrl}/api/send-notification`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'booking-confirmation',
      email: TEST_CONFIG.testUser.email,
      data: {
        bookingId: 'test-123',
        slipName: 'Test Slip',
        checkIn: '2025-06-25',
        checkOut: '2025-06-27'
      }
    })
  });
  
  const passed = result.success && result.data.success;
  recordTest('Notification System', passed, result.success ? 'Notification sent successfully' : result.error || result.data.error);
  return passed;
}

async function testAdminFunctions() {
  log('Testing admin functions...');
  
  // Test getting all users
  const usersResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/admin?action=users`);
  const usersPassed = usersResult.success && (usersResult.data.users || usersResult.data.message);
  
  // Test getting all admins
  const adminsResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/admin?action=admins`);
  const adminsPassed = adminsResult.success && (adminsResult.data.admins || adminsResult.data.message);
  
  const passed = usersPassed && adminsPassed;
  recordTest('Admin Functions', passed, passed ? 'Admin functions working' : 'Admin functions failed');
  return passed;
}

async function testDatabaseConnectivity() {
  log('Testing database connectivity...');
  
  // Test multiple endpoints to ensure database is working
  const endpoints = [
    '/api/slips',
    '/api/bookings',
    '/api/users'
  ];
  
  let allPassed = true;
  for (const endpoint of endpoints) {
    const result = await makeRequest(`${TEST_CONFIG.baseUrl}${endpoint}`);
    if (!result.success) {
      allPassed = false;
      break;
    }
  }
  
  recordTest('Database Connectivity', allPassed, allPassed ? 'All database endpoints responding' : 'Database connectivity issues');
  return allPassed;
}

async function testImageStorageAndRetrieval() {
  log('Testing image storage and retrieval...');
  
  // Test with base64 image
  const slipsResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`);
  if (!slipsResult.success || !slipsResult.data.slips.length) {
    recordTest('Image Storage', false, 'No slips available for image testing');
    return false;
  }
  
  const slipToUpdate = slipsResult.data.slips[0];
  
  // Test base64 image storage
  const base64Result = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'update-slip',
      slipId: slipToUpdate.id,
      slipData: {
        ...slipToUpdate,
        images: TEST_CONFIG.testImage.data
      }
    })
  });
  
  // Test URL image storage
  const urlResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'update-slip',
      slipId: slipToUpdate.id,
      slipData: {
        ...slipToUpdate,
        images: TEST_CONFIG.testImage.url
      }
    })
  });
  
  const passed = base64Result.success && urlResult.success;
  recordTest('Image Storage and Retrieval', passed, passed ? 'Both base64 and URL images stored successfully' : 'Image storage failed');
  return passed;
}

async function testErrorHandling() {
  log('Testing error handling...');
  
  // Test invalid slip ID
  const invalidSlipResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'update-slip',
      slipId: 'invalid-uuid',
      slipData: { name: 'Test' }
    })
  });
  
  // Test invalid user data
  const invalidUserResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/users`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'register',
      email: 'invalid-email'
    })
  });
  
  // Both should return errors (which is expected)
  const passed = !invalidSlipResult.success && !invalidUserResult.success;
  recordTest('Error Handling', passed, passed ? 'Error handling working correctly' : 'Error handling issues');
  return passed;
}

// Main test runner
async function runComprehensiveTests() {
  log('🚀 Starting Comprehensive System Testing Suite');
  log('===============================================');
  log(`Testing against: ${TEST_CONFIG.baseUrl}`);
  log('');
  
  const tests = [
    { name: 'Database Connectivity', fn: testDatabaseConnectivity },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Slip Creation', fn: testSlipCreation },
    { name: 'Slip Retrieval', fn: testSlipRetrieval },
    { name: 'Slip Update', fn: testSlipUpdate },
    { name: 'Image Upload', fn: testImageUpload },
    { name: 'Image Storage and Retrieval', fn: testImageStorageAndRetrieval },
    { name: 'Booking Creation', fn: testBookingCreation },
    { name: 'Booking Retrieval', fn: testBookingRetrieval },
    { name: 'Payment Intent Creation', fn: testPaymentIntentCreation },
    { name: 'Notification System', fn: testNotificationSystem },
    { name: 'Admin Functions', fn: testAdminFunctions },
    { name: 'Error Handling', fn: testErrorHandling }
  ];
  
  for (const test of tests) {
    try {
      await test.fn();
      // Add small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      recordTest(test.name, false, `Test execution error: ${error.message}`);
    }
  }
  
  // Generate report
  log('');
  log('📊 COMPREHENSIVE TEST RESULTS');
  log('=============================');
  log(`Total Tests: ${testResults.total}`);
  log(`Passed: ${testResults.passed}`, 'success');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    log('');
    log('❌ FAILED TESTS:');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => log(`  - ${test.testName}: ${test.details}`));
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: TEST_CONFIG.baseUrl,
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / testResults.total) * 100).toFixed(1)
    },
    details: testResults.details
  };
  
  fs.writeFileSync('test-results.json', JSON.stringify(report, null, 2));
  log('');
  log('📄 Detailed report saved to: test-results.json');
  
  return testResults.failed === 0;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runComprehensiveTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`Test suite failed: ${error.message}`, 'error');
      process.exit(1);
    });
}

module.exports = { runComprehensiveTests, testResults };
