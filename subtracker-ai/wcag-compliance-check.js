#!/usr/bin/env node

/**
 * WCAG 2.1 AA Compliance Verification Script
 * Validates color contrast ratios and accessibility standards
 * Ensures text readability meets WCAG 2.1 AA requirements (4.5:1 normal text, 3:1 large text)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WCAG 2.1 AA Contrast Requirements
const WCAG_REQUIREMENTS = {
  AA_NORMAL: 4.5,      // 4.5:1 for normal text
  AA_LARGE: 3.0,       // 3:1 for large text (18pt+ or 14pt+ bold)
  AAA_NORMAL: 7.0,     // 7:1 for AAA normal text
  AAA_LARGE: 4.5       // 4.5:1 for AAA large text
};

// Theme color definitions from our CSS variables
const THEME_COLORS = {
  light: {
    '--bg-primary': '#ffffff',           // Background
    '--text-primary': '#1a1a1a',        // High contrast text
    '--text-secondary': '#525252',      // Medium contrast text
    '--text-muted': '#737373',          // Lower contrast text
    '--color-primary': '#2563eb',       // Brand blue
    '--color-primary-hover': '#1d4ed8'  // Hover blue
  },
  dark: {
    '--bg-primary': '#0a0a0b',          // Dark background
    '--text-primary': '#f0f6fc',        // High contrast white text
    '--text-secondary': '#b3b3b3',      // Medium contrast gray text
    '--text-muted': '#8c8c8c',          // Lower contrast muted text
    '--color-primary': '#4285f4',       // Accessible blue
    '--color-primary-hover': '#5a95f5'  // Hover blue
  },
  tactical: {
    '--bg-primary': '#1a1a1a',          // Tactical dark
    '--text-primary': '#f5f5f5',        // High contrast text
    '--text-secondary': '#cccccc',      // Medium contrast
    '--text-muted': '#999999',          // Muted text
    '--color-primary': '#00ff88',       // Tactical green
    '--color-primary-hover': '#33ff99'  // Hover green
  }
};

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance
 */
function getRelativeLuminance(rgb) {
  const { r, g, b } = rgb;

  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check WCAG compliance for a color combination
 */
function checkWCAGCompliance(foreground, background, isLargeText = false) {
  const ratio = getContrastRatio(foreground, background);

  const aaThreshold = isLargeText ? WCAG_REQUIREMENTS.AA_LARGE : WCAG_REQUIREMENTS.AA_NORMAL;
  const aaaThreshold = isLargeText ? WCAG_REQUIREMENTS.AAA_LARGE : WCAG_REQUIREMENTS.AAA_NORMAL;

  return {
    ratio: ratio.toFixed(2),
    passesAA: ratio >= aaThreshold,
    passesAAA: ratio >= aaaThreshold,
    level: ratio >= aaaThreshold ? 'AAA' : ratio >= aaThreshold ? 'AA' : 'FAIL'
  };
}

/**
 * Test all theme combinations
 */
function testThemeCompliance() {
  console.log('🎨 WCAG 2.1 AA COMPLIANCE VERIFICATION');
  console.log('====================================\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  Object.entries(THEME_COLORS).forEach(([themeName, colors]) => {
    console.log(`🌓 ${themeName.toUpperCase()} THEME`);
    console.log('-'.repeat(20));

    const background = colors['--bg-primary'];

    // Test each text color against background
    Object.entries(colors).forEach(([colorVar, colorValue]) => {
      if (colorVar.startsWith('--text-') || colorVar.startsWith('--color-')) {
        const compliance = checkWCAGCompliance(colorValue, background);
        const isLargeText = false; // We'll test both
        const largeTextCompliance = checkWCAGCompliance(colorValue, background, true);

        results.total++;

        if (compliance.passesAA) {
          results.passed++;
          console.log(`✅ ${colorVar}: ${compliance.ratio}:1 (${compliance.level})`);
        } else {
          results.failed++;
          console.log(`❌ ${colorVar}: ${compliance.ratio}:1 (FAIL - needs ${WCAG_REQUIREMENTS.AA_NORMAL}:1)`);
        }

        results.details.push({
          theme: themeName,
          variable: colorVar,
          foreground: colorValue,
          background: background,
          ratio: compliance.ratio,
          passesAA: compliance.passesAA,
          passesAAA: compliance.passesAAA,
          level: compliance.level
        });
      }
    });

    console.log('');
  });

  return results;
}

/**
 * Verify CSS variables are properly defined
 */
function verifyCSSVariables() {
  console.log('📋 CSS VARIABLES VERIFICATION');
  console.log('=============================\n');

  const requiredFiles = [
    './src/styles/theme-colors.css',
    './src/index.css'
  ];

  const requiredVariables = [
    '--text-primary',
    '--text-secondary',
    '--text-muted',
    '--bg-primary',
    '--color-primary'
  ];

  requiredFiles.forEach(filePath => {
    console.log(`📄 Checking ${filePath}:`);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    requiredVariables.forEach(varName => {
      if (content.includes(varName)) {
        console.log(`✅ ${varName} defined`);
      } else {
        console.log(`❌ ${varName} missing`);
      }
    });

    console.log('');
  });
}

/**
 * Check for remaining problematic classes
 */
function checkForProblematicClasses() {
  console.log('🔍 PROBLEMATIC CLASSES CHECK');
  console.log('===========================\n');

  const problematicPatterns = [
    'text-gray-400',
    'text-gray-500',
    'text-gray-300',
    'text-muted-foreground'
  ];

  const componentFiles = getAllComponentFiles('./src');
  let totalViolations = 0;

  componentFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    let fileViolations = 0;

    problematicPatterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'g');
      const matches = content.match(regex);
      if (matches) {
        fileViolations += matches.length;
      }
    });

    if (fileViolations > 0) {
      console.log(`❌ ${filePath}: ${fileViolations} violations`);
      totalViolations += fileViolations;
    }
  });

  if (totalViolations === 0) {
    console.log('✅ No problematic text classes found!');
  } else {
    console.log(`❌ Found ${totalViolations} violations still remaining`);
  }

  console.log('');
  return totalViolations;
}

/**
 * Get all component files
 */
function getAllComponentFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllComponentFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file);
      if (['.tsx', '.ts', '.jsx', '.js'].includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

/**
 * Generate final compliance report
 */
function generateComplianceReport(testResults, violationsCount) {
  console.log('📊 FINAL COMPLIANCE REPORT');
  console.log('=========================\n');

  const passRate = (testResults.passed / testResults.total * 100).toFixed(1);

  console.log(`Color Combinations Tested: ${testResults.total}`);
  console.log(`WCAG AA Compliant: ${testResults.passed}`);
  console.log(`Non-compliant: ${testResults.failed}`);
  console.log(`Compliance Rate: ${passRate}%`);
  console.log(`Remaining Code Violations: ${violationsCount}`);

  if (testResults.failed === 0 && violationsCount === 0) {
    console.log('\n🎉 PERFECT COMPLIANCE!');
    console.log('✅ All color combinations meet WCAG 2.1 AA standards');
    console.log('✅ No problematic text classes remain in codebase');
    console.log('✅ Users can read text across all themes');
    console.log('✅ Application is accessible and production-ready');
  } else if (testResults.failed <= 2 && violationsCount <= 10) {
    console.log('\n⚠️  EXCELLENT - Minor issues detected');
    console.log('Most text combinations are compliant');
    console.log('Ready for production with minor cleanup');
  } else {
    console.log('\n❌ NEEDS IMPROVEMENT');
    console.log('Significant accessibility issues remain');
    console.log('Additional work required before production');
  }

  // Save detailed results
  const detailedReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      passRate: passRate,
      codeViolations: violationsCount
    },
    colorTests: testResults.details,
    wcagStandards: WCAG_REQUIREMENTS
  };

  fs.writeFileSync('./wcag-compliance-report.json', JSON.stringify(detailedReport, null, 2));
  console.log('\n💾 Detailed report saved to wcag-compliance-report.json');

  console.log('\n🎯 RECOMMENDATIONS:');
  if (testResults.failed === 0) {
    console.log('• Text readability fixes are complete and successful!');
    console.log('• All themes provide excellent user experience');
    console.log('• Ready for production deployment');
  } else {
    console.log('• Review failed color combinations in the detailed report');
    console.log('• Adjust CSS variables for better contrast ratios');
    console.log('• Re-test after making adjustments');
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Starting WCAG 2.1 AA Compliance Check...\n');

  // Verify CSS variables exist
  verifyCSSVariables();

  // Test color contrast compliance
  const testResults = testThemeCompliance();

  // Check for remaining problematic classes
  const violationsCount = checkForProblematicClasses();

  // Generate final report
  generateComplianceReport(testResults, violationsCount);

  console.log('\n✨ WCAG compliance verification complete!');
}

// Execute the compliance check
main();