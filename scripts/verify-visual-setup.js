#!/usr/bin/env node

/**
 * Visual/E2E Test Setup Verification Script
 * ST-040 Implementation Verification
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying Visual/E2E Test Suite Setup (ST-040)...\n');

const requiredFiles = [
  // Configuration files
  'playwright.config.ts',
  'cypress.config.ts',
  
  // Test files
  'tests/visual/storybook-visual.spec.ts',
  'tests/visual/app-visual.spec.ts',
  'tests/e2e/auth.cy.ts',
  'tests/e2e/subscriptions.cy.ts',
  'tests/e2e/budget.cy.ts',
  
  // Support files
  'tests/e2e/support/commands.ts',
  'tests/e2e/support/e2e.ts',
  'tests/e2e/support/component.ts',
  'tests/e2e/support/component-index.html',
  
  // Setup files
  'tests/setup/global-setup.ts',
  'tests/e2e/fixtures/subscriptions.json',
  
  // Documentation
  'tests/README.md'
];

const requiredDirectories = [
  'tests',
  'tests/visual',
  'tests/e2e',
  'tests/e2e/support',
  'tests/e2e/fixtures',
  'tests/setup',
  'test-results',
  'test-results/visual',
  'test-results/cypress'
];

const requiredPackages = [
  'playwright',
  '@playwright/test',
  'cypress',
  'pixelmatch'
];

let errors = 0;
let warnings = 0;

// Check directories
console.log('📁 Checking directories...');
requiredDirectories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`❌ Missing directory: ${dir}`);
    errors++;
  } else {
    console.log(`✅ Directory exists: ${dir}`);
  }
});

console.log('\n📄 Checking required files...');
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`❌ Missing file: ${file}`);
    errors++;
  } else {
    console.log(`✅ File exists: ${file}`);
  }
});

// Check package.json for required dependencies and scripts
console.log('\n📦 Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check dependencies
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  requiredPackages.forEach(pkg => {
    if (allDeps[pkg]) {
      console.log(`✅ Package installed: ${pkg}@${allDeps[pkg]}`);
    } else {
      console.log(`❌ Missing package: ${pkg}`);
      errors++;
    }
  });
  
  // Check scripts
  const requiredScripts = [
    'test:visual',
    'test:visual:headed',
    'test:visual:debug',
    'test:visual:update',
    'test:e2e',
    'test:e2e:open',
    'test:visual:ci',
    'visual:setup',
    'visual:report'
  ];
  
  console.log('\n⚙️ Checking npm scripts...');
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      console.log(`✅ Script available: npm run ${script}`);
    } else {
      console.log(`❌ Missing script: ${script}`);
      errors++;
    }
  });
  
} catch (error) {
  console.log('❌ Could not read package.json');
  errors++;
}

// Check GitHub workflow
console.log('\n🚀 Checking GitHub Actions workflow...');
const workflowFile = '.github/workflows/test.yml';
if (fs.existsSync(workflowFile)) {
  const workflowContent = fs.readFileSync(workflowFile, 'utf8');
  
  const requiredWorkflowFeatures = [
    'visual-tests:',
    'e2e-tests:',
    'test:visual:ci',
    'test:e2e',
    'Visual Regression Tests',
    'E2E Tests'
  ];
  
  requiredWorkflowFeatures.forEach(feature => {
    if (workflowContent.includes(feature)) {
      console.log(`✅ Workflow includes: ${feature}`);
    } else {
      console.log(`❌ Workflow missing: ${feature}`);
      errors++;
    }
  });
} else {
  console.log('❌ GitHub workflow file missing');
  errors++;
}

// Check threshold configuration
console.log('\n🎯 Checking visual diff threshold...');
if (fs.existsSync('playwright.config.ts')) {
  const playwrightConfig = fs.readFileSync('playwright.config.ts', 'utf8');
  if (playwrightConfig.includes('threshold: 0.001')) {
    console.log('✅ Visual diff threshold set to 0.1% (0.001)');
  } else {
    console.log('⚠️ Visual diff threshold may not be properly configured');
    warnings++;
  }
} else {
  console.log('❌ Playwright config missing');
  errors++;
}

// Summary
console.log('\n📊 Setup Verification Summary');
console.log('============================');

if (errors === 0 && warnings === 0) {
  console.log('🎉 Perfect! All components of ST-040 Visual/E2E test suite are properly configured.');
  console.log('\n✨ Ready to run:');
  console.log('   npm run visual:setup  # Install Playwright browsers');
  console.log('   npm run test:visual   # Run visual regression tests');
  console.log('   npm run test:e2e      # Run E2E tests');
  console.log('   npm run storybook     # Start Storybook for component testing');
} else {
  console.log(`❌ Found ${errors} errors and ${warnings} warnings.`);
  console.log('\n🔧 Next steps:');
  if (errors > 0) {
    console.log('   1. Fix the missing files and configurations listed above');
    console.log('   2. Run npm install to ensure all dependencies are installed');
    console.log('   3. Re-run this verification script');
  }
}

console.log('\n📚 Documentation:');
console.log('   tests/README.md - Complete testing guide');
console.log('   ST-040 - Visual/E2E test suite deliverable');

// Exit with error code if there are errors
process.exit(errors > 0 ? 1 : 0);
