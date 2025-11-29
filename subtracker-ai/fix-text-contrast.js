#!/usr/bin/env node

/**
 * Text Contrast Fix Script
 * Systematically replaces low-contrast text classes with theme-aware CSS variables
 * Target: 1,203 violations across 147 component files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Text class replacements mapping
const textReplacements = {
  // Low contrast grays → High contrast theme-aware classes
  'text-gray-400': 'text-secondary',      // Ensures proper contrast in all themes
  'text-gray-500': 'text-secondary',      // Maps to --text-secondary CSS variable
  'text-gray-600': 'text-primary',       // Maps to --text-primary CSS variable
  'text-gray-300': 'text-muted',         // For very subtle text
  'text-gray-700': 'text-primary',       // Strong text
  'text-gray-800': 'text-primary',       // Very strong text
  'text-gray-900': 'text-primary',       // Maximum contrast text

  // Muted text consistency
  'text-muted-foreground': 'text-muted', // Use theme-aware muted

  // Dark mode specific fixes
  'dark:text-gray-400': '',               // Remove redundant dark mode classes
  'dark:text-gray-300': '',               // Theme variables handle this automatically
  'dark:text-gray-200': '',               // CSS variables are theme-aware

  // Combined class patterns (common in components)
  'text-gray-600 dark:text-gray-400': 'text-secondary',
  'text-gray-700 dark:text-gray-300': 'text-primary',
  'text-gray-800 dark:text-gray-200': 'text-primary',
  'text-gray-500 dark:text-gray-400': 'text-secondary',

  // Small text improvements (ensure readability)
  'text-xs text-gray-': 'text-xs font-medium text-',
  'text-sm text-gray-': 'text-sm font-medium text-',
};

// Files to process
const srcDir = './src';
const extensionsToProcess = ['.tsx', '.ts', '.jsx', '.js'];

// Statistics tracking
let filesProcessed = 0;
let totalReplacements = 0;
let violationsFixed = 0;

/**
 * Recursively get all files in directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file);
      if (extensionsToProcess.includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fileChanged = false;
    let fileReplacements = 0;

    // Apply each replacement
    Object.entries(textReplacements).forEach(([oldPattern, newPattern]) => {
      const regex = new RegExp(oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);

      if (matches) {
        content = content.replace(regex, newPattern);
        fileReplacements += matches.length;
        fileChanged = true;
      }
    });

    // Special handling for complex patterns
    // Fix className patterns with multiple gray classes
    const classNamePattern = /className="([^"]*(?:text-gray-\d+|text-muted-foreground)[^"]*)"/g;
    content = content.replace(classNamePattern, (match, classContent) => {
      let updatedClasses = classContent;

      // Apply replacements within className
      Object.entries(textReplacements).forEach(([oldPattern, newPattern]) => {
        const regex = new RegExp(oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        if (updatedClasses.match(regex)) {
          updatedClasses = updatedClasses.replace(regex, newPattern);
          fileReplacements++;
        }
      });

      // Clean up duplicate spaces and empty classes
      updatedClasses = updatedClasses
        .split(' ')
        .filter(cls => cls.trim() && cls !== '')
        .join(' ');

      return `className="${updatedClasses}"`;
    });

    // Write back to file if changes were made
    if (fileChanged) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${fileReplacements} violations in ${filePath}`);
      violationsFixed += fileReplacements;
    }

    filesProcessed++;
    totalReplacements += fileReplacements;

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Starting Text Contrast Fix...\n');
  console.log('Target: 1,203 violations across 147 component files\n');

  const allFiles = getAllFiles(srcDir);
  const componentFiles = allFiles.filter(file =>
    file.includes('components') ||
    file.includes('contexts') ||
    file.includes('pages') ||
    file.includes('utils') ||
    file.endsWith('App.tsx') ||
    file.endsWith('main.tsx') ||
    file.endsWith('Router.tsx') ||
    file.endsWith('Test.tsx')
  );

  console.log(`📁 Found ${componentFiles.length} component files to process\n`);

  // Process each file
  componentFiles.forEach(processFile);

  // Summary
  console.log('\n📊 TEXT CONTRAST FIX COMPLETE');
  console.log('================================');
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Total replacements: ${totalReplacements}`);
  console.log(`Violations fixed: ${violationsFixed}`);
  console.log(`Expected violations: 1,203`);
  console.log(`Fix coverage: ${((violationsFixed / 1203) * 100).toFixed(1)}%`);

  if (violationsFixed >= 1000) {
    console.log('\n✅ MAJOR SUCCESS: Text readability significantly improved!');
    console.log('🎯 Users should now be able to read text across all themes');
  } else if (violationsFixed >= 500) {
    console.log('\n⚠️  PARTIAL SUCCESS: Many issues fixed, but more work needed');
  } else {
    console.log('\n❌ LIMITED SUCCESS: Additional manual fixes required');
  }

  console.log('\n🧪 Next Steps:');
  console.log('1. Test the application in all three themes (light/dark/tactical)');
  console.log('2. Verify text readability on all major pages');
  console.log('3. Run WCAG compliance check');
  console.log('4. Address any remaining manual fixes needed');
}

// Execute the script
main();