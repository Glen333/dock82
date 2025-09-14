#!/usr/bin/env node

/**
 * LINE-BY-LINE FUNCTION TESTING SUITE
 * Tests every function individually with detailed logging
 * Run with: node test-line-by-line.js
 */

const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'https://dock82-app.vercel.app',
  verbose: true
};

// Test data
const TEST_DATA = {
  user: {
    name: 'Line Test User',
    email: `linetest${Date.now()}@dock82.com`,
    password: 'LineTest123!',
    phone: '(555) 999-8888'
  },
  slip: {
    name: `Line Test Slip ${Date.now()}`,
    maxLength: 40,
    width: 15,
    depth: 10,
    pricePerNight: 95,
    amenities: ['Water', 'Electric (240V)', 'WiFi', 'Pump-out', 'Ice'],
    description: 'Line-by-line testing slip for comprehensive validation',
    dockEtiquette: 'Line testing dock etiquette rules'
  },
  images: {
    base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&crop=center',
    placeholder: 'https://via.placeholder.com/600x400/0066cc/ffffff?text=Line+Test+Image'
  }
};

// Test results
const results = {
  functions: {},
  summary: { total: 0, passed: 0, failed: 0 }
};

// Utility functions
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    debug: '🔍'
  }[level];
  
  if (TEST_CONFIG.verbose || level === 'error' || level === 'success') {
    console.log(`${prefix} [${timestamp}] ${message}`);
  }
}

function recordFunctionTest(functionName, testName, passed, details = '') {
  if (!results.functions[functionName]) {
    results.functions[functionName] = { tests: [], passed: 0, failed: 0 };
  }
  
  results.functions[functionName].tests.push({ testName, passed, details });
  results.summary.total++;
  
  if (passed) {
    results.functions[functionName].passed++;
    results.summary.passed++;
    log(`  ✓ ${testName}`, 'success');
  } else {
    results.functions[functionName].failed++;
    results.summary.failed++;
    log(`  ✗ ${testName}: ${details}`, 'error');
  }
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
    return { 
      success: response.ok, 
      status: response.status, 
      data,
      headers: response.headers
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Individual function tests
async function testUserRegistrationFunction() {
  log('Testing User Registration Function', 'info');
  
  const functionName = 'User Registration';
  
  // Test 1: Valid user registration
  const validResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/users`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'register',
      name: TEST_DATA.user.name,
      email: TEST_DATA.user.email,
      password: TEST_DATA.user.password,
      phone: TEST_DATA.user.phone
    })
  });
  
  recordFunctionTest(functionName, 'Valid user registration', 
    validResult.success && (validResult.data.success || validResult.data.message),
    validResult.success ? 'User registered successfully' : validResult.error || validResult.data.error
  );
  
  // Test 2: Duplicate email registration
  const duplicateResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/users`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'register',
      name: 'Duplicate User',
      email: TEST_DATA.user.email, // Same email
      password: 'DifferentPassword123!',
      phone: '(555) 111-2222'
    })
  });
  
  recordFunctionTest(functionName, 'Duplicate email handling', 
    !duplicateResult.success || duplicateResult.data.error,
    'Duplicate email properly rejected'
  );
  
  // Test 3: Invalid email format
  const invalidEmailResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/users`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'register',
      name: 'Invalid User',
      email: 'invalid-email-format',
      password: 'ValidPassword123!',
      phone: '(555) 333-4444'
    })
  });
  
  recordFunctionTest(functionName, 'Invalid email validation', 
    !invalidEmailResult.success || invalidEmailResult.data.error,
    'Invalid email format properly rejected'
  );
  
  // Test 4: Missing required fields
  const missingFieldsResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/users`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'register',
      name: 'Incomplete User'
      // Missing email, password, phone
    })
  });
  
  recordFunctionTest(functionName, 'Missing required fields validation', 
    !missingFieldsResult.success || missingFieldsResult.data.error,
    'Missing required fields properly rejected'
  );
}

async function testUserLoginFunction() {
  log('Testing User Login Function', 'info');
  
  const functionName = 'User Login';
  
  // Test 1: Valid login
  const validLoginResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/users`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'login',
      email: TEST_DATA.user.email,
      password: TEST_DATA.user.password
    })
  });
  
  recordFunctionTest(functionName, 'Valid user login', 
    validLoginResult.success && validLoginResult.data.success,
    validLoginResult.success ? 'User logged in successfully' : validLoginResult.error || validLoginResult.data.error
  );
  
  // Test 2: Invalid password
  const invalidPasswordResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/users`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'login',
      email: TEST_DATA.user.email,
      password: 'WrongPassword123!'
    })
  });
  
  recordFunctionTest(functionName, 'Invalid password handling', 
    !invalidPasswordResult.success || !invalidPasswordResult.data.success,
    'Invalid password properly rejected'
  );
  
  // Test 3: Non-existent user
  const nonExistentUserResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/users`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'login',
      email: 'nonexistent@dock82.com',
      password: 'SomePassword123!'
    })
  });
  
  recordFunctionTest(functionName, 'Non-existent user handling', 
    !nonExistentUserResult.success || !nonExistentUserResult.data.success,
    'Non-existent user properly rejected'
  );
}

async function testSlipManagementFunctions() {
  log('Testing Slip Management Functions', 'info');
  
  const functionName = 'Slip Management';
  
  // Test 1: Create new slip
  const createResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/add-new-slips`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'add-new-slips',
      slipData: TEST_DATA.slip
    })
  });
  
  recordFunctionTest(functionName, 'Create new slip', 
    createResult.success && createResult.data.success,
    createResult.success ? 'Slip created successfully' : createResult.error || createResult.data.error
  );
  
  // Test 2: Retrieve all slips
  const retrieveResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`);
  
  recordFunctionTest(functionName, 'Retrieve all slips', 
    retrieveResult.success && retrieveResult.data.slips && Array.isArray(retrieveResult.data.slips),
    retrieveResult.success ? `Retrieved ${retrieveResult.data.slips.length} slips` : retrieveResult.error || retrieveResult.data.error
  );
  
  // Test 3: Update slip (if we have slips)
  if (retrieveResult.success && retrieveResult.data.slips.length > 0) {
    const slipToUpdate = retrieveResult.data.slips[0];
    const updateResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'update-slip',
        slipId: slipToUpdate.id,
        slipData: {
          ...slipToUpdate,
          description: 'Updated description for line-by-line testing',
          pricePerNight: slipToUpdate.pricePerNight + 10
        }
      })
    });
    
    recordFunctionTest(functionName, 'Update slip', 
      updateResult.success && updateResult.data.success,
      updateResult.success ? 'Slip updated successfully' : updateResult.error || updateResult.data.error
    );
  }
  
  // Test 4: Invalid slip ID update
  const invalidUpdateResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'update-slip',
      slipId: 'invalid-uuid-format',
      slipData: { name: 'Test Update' }
    })
  });
  
  recordFunctionTest(functionName, 'Invalid slip ID handling', 
    !invalidUpdateResult.success || invalidUpdateResult.data.error,
    'Invalid slip ID properly rejected'
  );
}

async function testImageHandlingFunctions() {
  log('Testing Image Handling Functions', 'info');
  
  const functionName = 'Image Handling';
  
  // Get a slip to test image updates
  const slipsResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`);
  if (!slipsResult.success || !slipsResult.data.slips.length) {
    recordFunctionTest(functionName, 'Image handling setup', false, 'No slips available for image testing');
    return;
  }
  
  const slipToUpdate = slipsResult.data.slips[0];
  
  // Test 1: Base64 image upload
  const base64Result = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'update-slip',
      slipId: slipToUpdate.id,
      slipData: {
        ...slipToUpdate,
        images: TEST_DATA.images.base64
      }
    })
  });
  
  recordFunctionTest(functionName, 'Base64 image upload', 
    base64Result.success && base64Result.data.success,
    base64Result.success ? 'Base64 image uploaded successfully' : base64Result.error || base64Result.data.error
  );
  
  // Test 2: URL image upload
  const urlResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'update-slip',
      slipId: slipToUpdate.id,
      slipData: {
        ...slipToUpdate,
        images: TEST_DATA.images.url
      }
    })
  });
  
  recordFunctionTest(functionName, 'URL image upload', 
    urlResult.success && urlResult.data.success,
    urlResult.success ? 'URL image uploaded successfully' : urlResult.error || urlResult.data.error
  );
  
  // Test 3: Placeholder image upload
  const placeholderResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'update-slip',
      slipId: slipToUpdate.id,
      slipData: {
        ...slipToUpdate,
        images: TEST_DATA.images.placeholder
      }
    })
  });
  
  recordFunctionTest(functionName, 'Placeholder image upload', 
    placeholderResult.success && placeholderResult.data.success,
    placeholderResult.success ? 'Placeholder image uploaded successfully' : placeholderResult.error || placeholderResult.data.error
  );
  
  // Test 4: Invalid image URL
  const invalidImageResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'update-slip',
      slipId: slipToUpdate.id,
      slipData: {
        ...slipToUpdate,
        images: 'not-a-valid-url'
      }
    })
  });
  
  recordFunctionTest(functionName, 'Invalid image URL handling', 
    invalidImageResult.success, // Should still succeed as we don't validate URLs server-side
    'Invalid image URL handled appropriately'
  );
}

async function testBookingFunctions() {
  log('Testing Booking Functions', 'info');
  
  const functionName = 'Booking Management';
  
  // Get a slip to book
  const slipsResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`);
  if (!slipsResult.success || !slipsResult.data.slips.length) {
    recordFunctionTest(functionName, 'Booking setup', false, 'No slips available for booking');
    return;
  }
  
  const slipToBook = slipsResult.data.slips.find(slip => slip.available) || slipsResult.data.slips[0];
  
  // Test 1: Create booking
  const bookingData = {
    slipId: slipToBook.id,
    guestName: TEST_DATA.user.name,
    guestEmail: TEST_DATA.user.email,
    guestPhone: TEST_DATA.user.phone,
    checkIn: '2025-07-01',
    checkOut: '2025-07-03',
    boatLength: '32',
    boatMakeModel: 'Line Test Boat Model',
    userType: 'renter',
    nights: 2,
    totalCost: slipToBook.pricePerNight * 2,
    status: 'pending',
    bookingDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'pending'
  };
  
  const createBookingResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/bookings`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'create-booking',
      bookingData: bookingData
    })
  });
  
  recordFunctionTest(functionName, 'Create booking', 
    createBookingResult.success && createBookingResult.data.success,
    createBookingResult.success ? 'Booking created successfully' : createBookingResult.error || createBookingResult.data.error
  );
  
  // Test 2: Retrieve bookings
  const retrieveBookingsResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/bookings`);
  
  recordFunctionTest(functionName, 'Retrieve bookings', 
    retrieveBookingsResult.success && retrieveBookingsResult.data.bookings && Array.isArray(retrieveBookingsResult.data.bookings),
    retrieveBookingsResult.success ? `Retrieved ${retrieveBookingsResult.data.bookings.length} bookings` : retrieveBookingsResult.error || retrieveBookingsResult.data.error
  );
  
  // Test 3: Invalid booking data
  const invalidBookingResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/bookings`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'create-booking',
      bookingData: {
        slipId: 'invalid-uuid',
        guestName: 'Test Guest'
        // Missing required fields
      }
    })
  });
  
  recordFunctionTest(functionName, 'Invalid booking data handling', 
    !invalidBookingResult.success || invalidBookingResult.data.error,
    'Invalid booking data properly rejected'
  );
}

async function testPaymentFunctions() {
  log('Testing Payment Functions', 'info');
  
  const functionName = 'Payment Processing';
  
  // Test 1: Create payment intent
  const paymentIntentResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/create-payment-intent`, {
    method: 'POST',
    body: JSON.stringify({
      amount: 2500, // $25.00
      currency: 'usd'
    })
  });
  
  recordFunctionTest(functionName, 'Create payment intent', 
    paymentIntentResult.success && (paymentIntentResult.data.client_secret || paymentIntentResult.data.success),
    paymentIntentResult.success ? 'Payment intent created successfully' : paymentIntentResult.error || paymentIntentResult.data.error
  );
  
  // Test 2: Confirm payment
  const confirmPaymentResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/confirm-payment`, {
    method: 'POST',
    body: JSON.stringify({
      payment_intent_id: 'test_payment_intent_123'
    })
  });
  
  recordFunctionTest(functionName, 'Confirm payment', 
    confirmPaymentResult.success && confirmPaymentResult.data.success,
    confirmPaymentResult.success ? 'Payment confirmed successfully' : confirmPaymentResult.error || confirmPaymentResult.data.error
  );
  
  // Test 3: Invalid payment intent
  const invalidPaymentResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/confirm-payment`, {
    method: 'POST',
    body: JSON.stringify({
      payment_intent_id: ''
    })
  });
  
  recordFunctionTest(functionName, 'Invalid payment intent handling', 
    !invalidPaymentResult.success || invalidPaymentResult.data.error,
    'Invalid payment intent properly rejected'
  );
}

async function testNotificationFunctions() {
  log('Testing Notification Functions', 'info');
  
  const functionName = 'Notification System';
  
  // Test 1: Booking confirmation notification
  const bookingNotificationResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/send-notification`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'booking-confirmation',
      email: TEST_DATA.user.email,
      data: {
        bookingId: 'line-test-123',
        slipName: 'Line Test Slip',
        checkIn: '2025-07-01',
        checkOut: '2025-07-03'
      }
    })
  });
  
  recordFunctionTest(functionName, 'Booking confirmation notification', 
    bookingNotificationResult.success && bookingNotificationResult.data.success,
    bookingNotificationResult.success ? 'Booking notification sent successfully' : bookingNotificationResult.error || bookingNotificationResult.data.error
  );
  
  // Test 2: Dock etiquette notification
  const etiquetteNotificationResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/send-notification`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'dock-etiquette',
      email: TEST_DATA.user.email,
      slipName: 'Line Test Slip',
      dockEtiquette: 'Line testing dock etiquette rules'
    })
  });
  
  recordFunctionTest(functionName, 'Dock etiquette notification', 
    etiquetteNotificationResult.success && etiquetteNotificationResult.data.success,
    etiquetteNotificationResult.success ? 'Etiquette notification sent successfully' : etiquetteNotificationResult.error || etiquetteNotificationResult.data.error
  );
  
  // Test 3: Invalid notification type
  const invalidNotificationResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/send-notification`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'invalid-type',
      email: TEST_DATA.user.email
    })
  });
  
  recordFunctionTest(functionName, 'Invalid notification type handling', 
    !invalidNotificationResult.success || invalidNotificationResult.data.error,
    'Invalid notification type properly rejected'
  );
}

async function testAdminFunctions() {
  log('Testing Admin Functions', 'info');
  
  const functionName = 'Admin Management';
  
  // Test 1: Get all users
  const getUsersResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/admin?action=users`);
  
  recordFunctionTest(functionName, 'Get all users', 
    getUsersResult.success && (getUsersResult.data.users || getUsersResult.data.message),
    getUsersResult.success ? 'Users retrieved successfully' : getUsersResult.error || getUsersResult.data.error
  );
  
  // Test 2: Get all admins
  const getAdminsResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/admin?action=admins`);
  
  recordFunctionTest(functionName, 'Get all admins', 
    getAdminsResult.success && (getAdminsResult.data.admins || getAdminsResult.data.message),
    getAdminsResult.success ? 'Admins retrieved successfully' : getAdminsResult.error || getAdminsResult.data.error
  );
  
  // Test 3: Create admin
  const createAdminResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/admin`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'create-admin',
      name: 'Line Test Admin',
      email: 'linetestadmin@dock82.com',
      password: 'AdminPassword123!'
    })
  });
  
  recordFunctionTest(functionName, 'Create admin', 
    createAdminResult.success && createAdminResult.data.success,
    createAdminResult.success ? 'Admin created successfully' : createAdminResult.error || createAdminResult.data.error
  );
  
  // Test 4: Invalid admin action
  const invalidAdminResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/admin`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'invalid-action',
      data: 'test'
    })
  });
  
  recordFunctionTest(functionName, 'Invalid admin action handling', 
    !invalidAdminResult.success || invalidAdminResult.data.error,
    'Invalid admin action properly rejected'
  );
}

async function testDatabaseOperations() {
  log('Testing Database Operations', 'info');
  
  const functionName = 'Database Operations';
  
  // Test 1: Database connectivity
  const connectivityResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`);
  
  recordFunctionTest(functionName, 'Database connectivity', 
    connectivityResult.success,
    connectivityResult.success ? 'Database connection successful' : connectivityResult.error || 'Database connection failed'
  );
  
  // Test 2: Data integrity
  if (connectivityResult.success && connectivityResult.data.slips) {
    const slips = connectivityResult.data.slips;
    const hasValidData = slips.every(slip => 
      slip.id && slip.name && typeof slip.pricePerNight === 'number'
    );
    
    recordFunctionTest(functionName, 'Data integrity', 
      hasValidData,
      hasValidData ? 'All slip data is valid' : 'Some slip data is invalid'
    );
  }
  
  // Test 3: Error handling
  const errorHandlingResult = await makeRequest(`${TEST_CONFIG.baseUrl}/api/slips`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'invalid-action'
    })
  });
  
  recordFunctionTest(functionName, 'Error handling', 
    !errorHandlingResult.success || errorHandlingResult.data.error,
    'Database error handling working correctly'
  );
}

// Main test runner
async function runLineByLineTests() {
  log('🔍 Starting Line-by-Line Function Testing Suite');
  log('===============================================');
  log(`Testing against: ${TEST_CONFIG.baseUrl}`);
  log('');
  
  const testFunctions = [
    testDatabaseOperations,
    testUserRegistrationFunction,
    testUserLoginFunction,
    testSlipManagementFunctions,
    testImageHandlingFunctions,
    testBookingFunctions,
    testPaymentFunctions,
    testNotificationFunctions,
    testAdminFunctions
  ];
  
  for (const testFunction of testFunctions) {
    try {
      await testFunction();
      log(''); // Add spacing between function tests
      await new Promise(resolve => setTimeout(resolve, 2000)); // Delay between functions
    } catch (error) {
      log(`Function test failed: ${error.message}`, 'error');
    }
  }
  
  // Generate detailed report
  log('📊 LINE-BY-LINE TEST RESULTS');
  log('============================');
  log(`Total Tests: ${results.summary.total}`);
  log(`Passed: ${results.summary.passed}`, 'success');
  log(`Failed: ${results.summary.failed}`, results.summary.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
  
  // Function-by-function breakdown
  log('');
  log('📋 FUNCTION BREAKDOWN:');
  Object.entries(results.functions).forEach(([functionName, functionResults]) => {
    const successRate = ((functionResults.passed / (functionResults.passed + functionResults.failed)) * 100).toFixed(1);
    log(`  ${functionName}: ${functionResults.passed}/${functionResults.passed + functionResults.failed} (${successRate}%)`);
  });
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: TEST_CONFIG.baseUrl,
    summary: results.summary,
    functions: results.functions
  };
  
  fs.writeFileSync('line-by-line-test-results.json', JSON.stringify(report, null, 2));
  log('');
  log('📄 Detailed report saved to: line-by-line-test-results.json');
  
  return results.summary.failed === 0;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runLineByLineTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`Line-by-line test suite failed: ${error.message}`, 'error');
      process.exit(1);
    });
}

module.exports = { runLineByLineTests, results };
