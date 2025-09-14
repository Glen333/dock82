#!/usr/bin/env node

/**
 * COMPREHENSIVE TEST RUNNER
 * Runs all testing suites in sequence
 * Run with: node run-all-tests.js
 */

const { spawn } = require('child_process');
const fs = require('fs');

// Test suites to run
const testSuites = [
  {
    name: 'Comprehensive System Tests',
    file: 'test-comprehensive-system.js',
    description: 'Tests all major system functions with real data'
  },
  {
    name: 'Line-by-Line Function Tests',
    file: 'test-line-by-line.js',
    description: 'Tests every function individually with detailed validation'
  }
];

// Results tracking
const results = {
  startTime: new Date(),
  suites: [],
  totalTests: 0,
  passedSuites: 0,
  failedSuites: 0
};

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[level];
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function runTestSuite(suite) {
  return new Promise((resolve) => {
    log(`Starting ${suite.name}...`);
    log(`Description: ${suite.description}`);
    
    const startTime = Date.now();
    const child = spawn('node', [suite.file], {
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      const success = code === 0;
      
      const suiteResult = {
        name: suite.name,
        file: suite.file,
        success: success,
        duration: duration,
        exitCode: code
      };
      
      results.suites.push(suiteResult);
      
      if (success) {
        results.passedSuites++;
        log(`✅ ${suite.name} completed successfully (${duration}ms)`, 'success');
      } else {
        results.failedSuites++;
        log(`❌ ${suite.name} failed with exit code ${code} (${duration}ms)`, 'error');
      }
      
      resolve(suiteResult);
    });
    
    child.on('error', (error) => {
      const duration = Date.now() - startTime;
      const suiteResult = {
        name: suite.name,
        file: suite.file,
        success: false,
        duration: duration,
        error: error.message
      };
      
      results.suites.push(suiteResult);
      results.failedSuites++;
      
      log(`❌ ${suite.name} failed with error: ${error.message} (${duration}ms)`, 'error');
      resolve(suiteResult);
    });
  });
}

async function runAllTests() {
  log('🚀 Starting Comprehensive Test Suite Runner');
  log('===========================================');
  log(`Total test suites: ${testSuites.length}`);
  log('');
  
  for (const suite of testSuites) {
    await runTestSuite(suite);
    log(''); // Add spacing between suites
  }
  
  // Generate final report
  const totalDuration = Date.now() - results.startTime.getTime();
  const successRate = (results.passedSuites / results.suites.length) * 100;
  
  log('📊 FINAL TEST RESULTS');
  log('=====================');
  log(`Total Duration: ${(totalDuration / 1000).toFixed(1)} seconds`);
  log(`Test Suites: ${results.suites.length}`);
  log(`Passed: ${results.passedSuites}`, 'success');
  log(`Failed: ${results.failedSuites}`, results.failedSuites > 0 ? 'error' : 'success');
  log(`Success Rate: ${successRate.toFixed(1)}%`);
  
  if (results.failedSuites > 0) {
    log('');
    log('❌ FAILED TEST SUITES:');
    results.suites
      .filter(suite => !suite.success)
      .forEach(suite => {
        log(`  - ${suite.name}: ${suite.error || `Exit code ${suite.exitCode}`}`);
      });
  }
  
  // Save results
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalDuration: totalDuration,
      totalSuites: results.suites.length,
      passedSuites: results.passedSuites,
      failedSuites: results.failedSuites,
      successRate: successRate
    },
    suites: results.suites
  };
  
  fs.writeFileSync('test-runner-results.json', JSON.stringify(report, null, 2));
  log('');
  log('📄 Test results saved to: test-runner-results.json');
  
  // Check for individual test result files
  const resultFiles = [
    'test-results.json',
    'line-by-line-test-results.json'
  ];
  
  log('');
  log('📋 Individual test result files:');
  resultFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`  ✅ ${file}`);
    } else {
      log(`  ❌ ${file} (not found)`);
    }
  });
  
  return results.failedSuites === 0;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`Test runner failed: ${error.message}`, 'error');
      process.exit(1);
    });
}

module.exports = { runAllTests, results };
