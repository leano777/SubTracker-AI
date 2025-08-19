#!/usr/bin/env node

/**
 * ST-003 Smoke Test Runner
 * 
 * Executes critical smoke tests for:
 * - Login functionality
 * - Tab switching
 * - CRUD subscription operations
 * - Planning graph rendering
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.cyan}${colors.bright}${'='.repeat(60)}`);
  console.log(`${title}`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function checkServer() {
  log('🔍 Checking if development server is running...', colors.blue);
  
  try {
    if (process.platform === 'win32') {
      execSync('curl -f http://localhost:5175 > nul 2>&1', { stdio: 'ignore' });
    } else {
      execSync('curl -f http://localhost:5175 > /dev/null 2>&1', { stdio: 'ignore' });
    }
    logSuccess('Development server is running');
    return true;
  } catch (error) {
    logError('Development server is not running');
    log('Please start the development server with: npm run dev', colors.yellow);
    return false;
  }
}

function setupTestDirectories() {
  log('📁 Setting up test directories...', colors.blue);
  
  const directories = [
    'test-results',
    'test-results/smoke',
    'test-results/cypress',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/reports'
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`Created directory: ${dir}`, colors.cyan);
    }
  });
  
  logSuccess('Test directories ready');
}

async function runSmokeTests() {
  logSection('🚬 Running ST-003 Smoke Tests');
  
  try {
    log('🔥 Executing critical smoke test suite...', colors.blue);
    
    // Run the ST-003 smoke tests specifically
    const command = 'npx cypress run --spec "tests/e2e/smoke-tests/ST-003-smoke-tests.cy.ts" --reporter json --reporter-options "output=test-results/smoke/ST-003-results.json"';
    
    execSync(command, {
      stdio: 'inherit',
      timeout: 300000 // 5 minutes timeout
    });
    
    logSuccess('ST-003 smoke tests completed successfully');
    return { success: true };
    
  } catch (error) {
    logError('ST-003 smoke tests failed');
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

async function generateSmokeReport() {
  log('📊 Generating smoke test report...', colors.blue);
  
  const report = {
    timestamp: new Date().toISOString(),
    testSuite: 'ST-003 Smoke Tests',
    critical: true,
    coverage: [
      'Login functionality',
      'Tab switching',
      'CRUD subscription operations', 
      'Planning graph rendering',
      'Overall system stability'
    ],
    status: 'unknown'
  };
  
  try {
    if (fs.existsSync('test-results/smoke/ST-003-results.json')) {
      const results = JSON.parse(fs.readFileSync('test-results/smoke/ST-003-results.json', 'utf8'));
      report.results = results;
      report.status = results.stats?.failures === 0 ? 'passed' : 'failed';
    }
  } catch (error) {
    logWarning('Could not read smoke test results');
    report.status = 'unknown';
  }
  
  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ST-003 Smoke Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .status-pass { color: #28a745; }
        .status-fail { color: #dc3545; }
        .status-unknown { color: #ffc107; }
        .coverage { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; margin: 20px 0; }
        .critical { background: #fff3cd; border-left-color: #ffc107; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚬 ST-003 Smoke Test Report</h1>
        <p><strong>Generated:</strong> ${report.timestamp}</p>
        <p><strong>Status:</strong> <span class="status-${report.status}">${report.status.toUpperCase()}</span></p>
        <p><strong>Critical:</strong> ${report.critical ? 'YES' : 'NO'}</p>
    </div>
    
    <div class="coverage critical">
        <h2>🎯 Critical Coverage Areas</h2>
        <ul>
            ${report.coverage.map(item => `<li>✅ ${item}</li>`).join('')}
        </ul>
    </div>
    
    <div class="coverage">
        <h2>📋 Test Requirements</h2>
        <p><strong>ST-003 Smoke Tests</strong> verify the most critical user paths work correctly:</p>
        <ol>
            <li><strong>Login Flow:</strong> Demo authentication and error handling</li>
            <li><strong>Tab Navigation:</strong> All tabs load without errors or white screens</li>
            <li><strong>Subscription CRUD:</strong> Create, Read, Update, Delete operations accessible</li>
            <li><strong>Planning Graphs:</strong> Charts and visualizations render correctly</li>
            <li><strong>System Stability:</strong> Complete workflow without crashes</li>
        </ol>
    </div>
    
    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef;">
        <p><small>ST-003 Smoke Test Suite - Critical Path Validation</small></p>
    </footer>
</body>
</html>`;
  
  // Write reports
  fs.writeFileSync('test-results/reports/ST-003-smoke-report.html', htmlReport);
  fs.writeFileSync('test-results/reports/ST-003-smoke-report.json', JSON.stringify(report, null, 2));
  
  logSuccess('Smoke test report generated');
  log(`View HTML report: test-results/reports/ST-003-smoke-report.html`, colors.cyan);
}

async function main() {
  logSection('ST-003 Smoke Test Suite Runner');
  
  // Check prerequisites
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  // Setup
  setupTestDirectories();
  
  // Run tests
  const result = await runSmokeTests();
  
  // Generate report
  await generateSmokeReport();
  
  if (result.success) {
    logSection('🎉 Smoke Tests Completed Successfully');
    log('All critical paths are functional', colors.green);
    process.exit(0);
  } else {
    logSection('💥 Smoke Tests Failed');
    log('Critical issues detected - deployment should be blocked', colors.red);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { runSmokeTests, generateSmokeReport };
