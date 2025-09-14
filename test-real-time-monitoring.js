#!/usr/bin/env node

/**
 * REAL-TIME SYSTEM MONITORING
 * Continuously monitors all functions with real user data and pictures
 * Run with: node test-real-time-monitoring.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'https://dock82-app.vercel.app',
  monitoringInterval: 30000, // 30 seconds
  maxRetries: 3,
  alertThreshold: 0.8, // Alert if success rate drops below 80%
  logFile: 'monitoring.log',
  statusFile: 'system-status.json'
};

// Real test data with actual user scenarios
const REAL_TEST_DATA = {
  users: [
    {
      name: 'Captain John Smith',
      email: 'captain.john@dock82.com',
      password: 'Captain123!',
      phone: '(305) 555-0101'
    },
    {
      name: 'Marina Rodriguez',
      email: 'marina.rodriguez@dock82.com',
      password: 'Marina456!',
      phone: '(305) 555-0102'
    },
    {
      name: 'Boat Owner Mike',
      email: 'mike.boatowner@dock82.com',
      password: 'Mike789!',
      phone: '(305) 555-0103'
    }
  ],
  slips: [
    {
      name: 'Premium Slip A1',
      maxLength: 45,
      width: 16,
      depth: 12,
      pricePerNight: 120,
      amenities: ['Water', 'Electric (240V)', 'WiFi', 'Pump-out', 'Ice', 'Security'],
      description: 'Premium waterfront slip with full amenities',
      dockEtiquette: 'Premium slip etiquette rules'
    },
    {
      name: 'Standard Slip B2',
      maxLength: 35,
      width: 12,
      depth: 8,
      pricePerNight: 85,
      amenities: ['Water', 'Electric (120V)', 'WiFi'],
      description: 'Standard slip with essential amenities',
      dockEtiquette: 'Standard slip etiquette rules'
    }
  ],
  realImages: [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center'
  ]
};

// Monitoring state
const monitoringState = {
  startTime: new Date(),
  totalTests: 0,
  successfulTests: 0,
  failedTests: 0,
  lastAlert: null,
  systemHealth: 'healthy',
  functionStatus: {},
  alerts: []
};

// Utility functions
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    alert: '🚨',
    debug: '🔍'
  }[level];
  
  const logMessage = `${prefix} [${timestamp}] ${message}`;
  console.log(logMessage);
  
  // Write to log file
  fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
}

function calculateSystemHealth() {
  const successRate = monitoringState.totalTests > 0 ? 
    monitoringState.successfulTests / monitoringState.totalTests : 1;
  
  if (successRate >= 0.95) {
    monitoringState.systemHealth = 'excellent';
  } else if (successRate >= 0.85) {
    monitoringState.systemHealth = 'good';
  } else if (successRate >= CONFIG.alertThreshold) {
    monitoringState.systemHealth = 'warning';
  } else {
    monitoringState.systemHealth = 'critical';
  }
  
  return successRate;
}

function checkForAlerts() {
  const successRate = calculateSystemHealth();
  
  if (successRate < CONFIG.alertThreshold) {
    const alert = {
      timestamp: new Date().toISOString(),
      type: 'low_success_rate',
      message: `System success rate dropped to ${(successRate * 100).toFixed(1)}%`,
      successRate: successRate
    };
    
    monitoringState.alerts.push(alert);
    log(`🚨 ALERT: ${alert.message}`, 'alert');
    
    // Send alert (in real implementation, this would send email/SMS)
    sendAlert(alert);
  }
}

function sendAlert(alert) {
  // In a real implementation, this would send alerts via:
  // - Email notifications
  // - SMS alerts
  // - Slack/Discord webhooks
  // - PagerDuty integration
  
  log(`Alert sent: ${alert.message}`, 'alert');
}

async function makeRequest(url, options = {}) {
  let retries = 0;
  
  while (retries < CONFIG.maxRetries) {
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
        responseTime: Date.now() - (options.startTime || Date.now())
      };
    } catch (error) {
      retries++;
      if (retries >= CONFIG.maxRetries) {
        return { success: false, error: error.message, retries };
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
}

// Real-world test scenarios
async function testUserRegistrationFlow() {
  const user = REAL_TEST_DATA.users[Math.floor(Math.random() * REAL_TEST_DATA.users.length)];
  const testEmail = `test.${Date.now()}@dock82.com`;
  
  const result = await makeRequest(`${CONFIG.baseUrl}/api/users`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'register',
      name: user.name,
      email: testEmail,
      password: user.password,
      phone: user.phone
    })
  });
  
  return {
    function: 'User Registration',
    success: result.success && (result.data.success || result.data.message),
    details: result.success ? 'User registered successfully' : result.error || result.data.error,
    responseTime: result.responseTime
  };
}

async function testSlipManagementFlow() {
  const slip = REAL_TEST_DATA.slips[Math.floor(Math.random() * REAL_TEST_DATA.slips.length)];
  const testSlipName = `Test Slip ${Date.now()}`;
  
  // Create slip
  const createResult = await makeRequest(`${CONFIG.baseUrl}/api/add-new-slips`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'add-new-slips',
      slipData: { ...slip, name: testSlipName }
    })
  });
  
  if (!createResult.success) {
    return {
      function: 'Slip Management',
      success: false,
      details: 'Failed to create slip: ' + (createResult.error || createResult.data.error),
      responseTime: createResult.responseTime
    };
  }
  
  // Retrieve slips
  const retrieveResult = await makeRequest(`${CONFIG.baseUrl}/api/slips`);
  
  return {
    function: 'Slip Management',
    success: retrieveResult.success && retrieveResult.data.slips && Array.isArray(retrieveResult.data.slips),
    details: retrieveResult.success ? `Retrieved ${retrieveResult.data.slips.length} slips` : retrieveResult.error || retrieveResult.data.error,
    responseTime: retrieveResult.responseTime
  };
}

async function testImageUploadFlow() {
  // Get a slip to update
  const slipsResult = await makeRequest(`${CONFIG.baseUrl}/api/slips`);
  if (!slipsResult.success || !slipsResult.data.slips.length) {
    return {
      function: 'Image Upload',
      success: false,
      details: 'No slips available for image testing',
      responseTime: 0
    };
  }
  
  const slipToUpdate = slipsResult.data.slips[0];
  const imageUrl = REAL_TEST_DATA.realImages[Math.floor(Math.random() * REAL_TEST_DATA.realImages.length)];
  
  const result = await makeRequest(`${CONFIG.baseUrl}/api/slips`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'update-slip',
      slipId: slipToUpdate.id,
      slipData: {
        ...slipToUpdate,
        images: imageUrl
      }
    })
  });
  
  return {
    function: 'Image Upload',
    success: result.success && result.data.success,
    details: result.success ? 'Image uploaded successfully' : result.error || result.data.error,
    responseTime: result.responseTime
  };
}

async function testBookingFlow() {
  // Get a slip to book
  const slipsResult = await makeRequest(`${CONFIG.baseUrl}/api/slips`);
  if (!slipsResult.success || !slipsResult.data.slips.length) {
    return {
      function: 'Booking System',
      success: false,
      details: 'No slips available for booking',
      responseTime: 0
    };
  }
  
  const slipToBook = slipsResult.data.slips.find(slip => slip.available) || slipsResult.data.slips[0];
  const user = REAL_TEST_DATA.users[Math.floor(Math.random() * REAL_TEST_DATA.users.length)];
  
  const bookingData = {
    slipId: slipToBook.id,
    guestName: user.name,
    guestEmail: user.email,
    guestPhone: user.phone,
    checkIn: '2025-08-01',
    checkOut: '2025-08-03',
    boatLength: '30',
    boatMakeModel: 'Test Boat Model',
    userType: 'renter',
    nights: 2,
    totalCost: slipToBook.pricePerNight * 2,
    status: 'pending',
    bookingDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'pending'
  };
  
  const result = await makeRequest(`${CONFIG.baseUrl}/api/bookings`, {
    method: 'POST',
    body: JSON.stringify({
      action: 'create-booking',
      bookingData: bookingData
    })
  });
  
  return {
    function: 'Booking System',
    success: result.success && result.data.success,
    details: result.success ? 'Booking created successfully' : result.error || result.data.error,
    responseTime: result.responseTime
  };
}

async function testPaymentFlow() {
  const result = await makeRequest(`${CONFIG.baseUrl}/api/create-payment-intent`, {
    method: 'POST',
    body: JSON.stringify({
      amount: 3000, // $30.00
      currency: 'usd'
    })
  });
  
  return {
    function: 'Payment Processing',
    success: result.success && (result.data.client_secret || result.data.success),
    details: result.success ? 'Payment intent created successfully' : result.error || result.data.error,
    responseTime: result.responseTime
  };
}

async function testNotificationFlow() {
  const user = REAL_TEST_DATA.users[Math.floor(Math.random() * REAL_TEST_DATA.users.length)];
  
  const result = await makeRequest(`${CONFIG.baseUrl}/api/send-notification`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'booking-confirmation',
      email: user.email,
      data: {
        bookingId: `monitor-${Date.now()}`,
        slipName: 'Monitor Test Slip',
        checkIn: '2025-08-01',
        checkOut: '2025-08-03'
      }
    })
  });
  
  return {
    function: 'Notification System',
    success: result.success && result.data.success,
    details: result.success ? 'Notification sent successfully' : result.error || result.data.error,
    responseTime: result.responseTime
  };
}

async function testDatabaseHealth() {
  const result = await makeRequest(`${CONFIG.baseUrl}/api/slips`);
  
  return {
    function: 'Database Health',
    success: result.success,
    details: result.success ? 'Database responding normally' : result.error || 'Database connection failed',
    responseTime: result.responseTime
  };
}

// Main monitoring loop
async function runMonitoringCycle() {
  const testFunctions = [
    testDatabaseHealth,
    testUserRegistrationFlow,
    testSlipManagementFlow,
    testImageUploadFlow,
    testBookingFlow,
    testPaymentFlow,
    testNotificationFlow
  ];
  
  const cycleResults = [];
  
  for (const testFunction of testFunctions) {
    try {
      const result = await testFunction();
      cycleResults.push(result);
      
      monitoringState.totalTests++;
      if (result.success) {
        monitoringState.successfulTests++;
        log(`✓ ${result.function}: ${result.details} (${result.responseTime}ms)`, 'success');
      } else {
        monitoringState.failedTests++;
        log(`✗ ${result.function}: ${result.details}`, 'error');
      }
      
      // Update function status
      if (!monitoringState.functionStatus[result.function]) {
        monitoringState.functionStatus[result.function] = {
          totalTests: 0,
          successfulTests: 0,
          lastSuccess: null,
          lastFailure: null
        };
      }
      
      const functionStatus = monitoringState.functionStatus[result.function];
      functionStatus.totalTests++;
      if (result.success) {
        functionStatus.successfulTests++;
        functionStatus.lastSuccess = new Date().toISOString();
      } else {
        functionStatus.lastFailure = new Date().toISOString();
      }
      
    } catch (error) {
      log(`Test function error: ${error.message}`, 'error');
      monitoringState.totalTests++;
      monitoringState.failedTests++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return cycleResults;
}

function saveSystemStatus() {
  const status = {
    timestamp: new Date().toISOString(),
    uptime: Date.now() - monitoringState.startTime.getTime(),
    systemHealth: monitoringState.systemHealth,
    successRate: calculateSystemHealth(),
    totalTests: monitoringState.totalTests,
    successfulTests: monitoringState.successfulTests,
    failedTests: monitoringState.failedTests,
    functionStatus: monitoringState.functionStatus,
    recentAlerts: monitoringState.alerts.slice(-10) // Last 10 alerts
  };
  
  fs.writeFileSync(CONFIG.statusFile, JSON.stringify(status, null, 2));
}

function displaySystemStatus() {
  const successRate = calculateSystemHealth();
  const uptime = Date.now() - monitoringState.startTime.getTime();
  const uptimeHours = (uptime / (1000 * 60 * 60)).toFixed(1);
  
  log('');
  log('📊 SYSTEM STATUS');
  log('================');
  log(`Uptime: ${uptimeHours} hours`);
  log(`System Health: ${monitoringState.systemHealth.toUpperCase()}`);
  log(`Success Rate: ${(successRate * 100).toFixed(1)}%`);
  log(`Total Tests: ${monitoringState.totalTests}`);
  log(`Successful: ${monitoringState.successfulTests}`);
  log(`Failed: ${monitoringState.failedTests}`);
  
  if (monitoringState.alerts.length > 0) {
    log(`Recent Alerts: ${monitoringState.alerts.length}`);
  }
  
  log('');
}

// Main monitoring function
async function startRealTimeMonitoring() {
  log('🚀 Starting Real-Time System Monitoring');
  log('=======================================');
  log(`Monitoring URL: ${CONFIG.baseUrl}`);
  log(`Monitoring Interval: ${CONFIG.monitoringInterval / 1000} seconds`);
  log(`Alert Threshold: ${CONFIG.alertThreshold * 100}%`);
  log('');
  
  // Initial system check
  await runMonitoringCycle();
  displaySystemStatus();
  
  // Start monitoring loop
  const monitoringInterval = setInterval(async () => {
    log(`🔄 Running monitoring cycle...`);
    await runMonitoringCycle();
    checkForAlerts();
    saveSystemStatus();
    displaySystemStatus();
  }, CONFIG.monitoringInterval);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('🛑 Stopping monitoring...');
    clearInterval(monitoringInterval);
    saveSystemStatus();
    log('✅ Monitoring stopped. Final status saved.');
    process.exit(0);
  });
  
  // Keep the process running
  process.on('uncaughtException', (error) => {
    log(`💥 Uncaught exception: ${error.message}`, 'error');
    saveSystemStatus();
    process.exit(1);
  });
}

// Run monitoring if this file is executed directly
if (require.main === module) {
  startRealTimeMonitoring()
    .catch(error => {
      log(`Monitoring failed to start: ${error.message}`, 'error');
      process.exit(1);
    });
}

module.exports = { startRealTimeMonitoring, monitoringState };
