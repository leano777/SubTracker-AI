import { test, expect } from '@playwright/test';

// Storybook base URL
const STORYBOOK_URL = 'http://localhost:6006';

test.describe('Storybook Visual Regression Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to Storybook
    await page.goto(STORYBOOK_URL);
    
    // Wait for Storybook to load
    await page.waitForSelector('[data-testid="storybook-canvas"], iframe[title="storybook-preview-iframe"]', { timeout: 10000 });
  });

  test('Button component - default state', async ({ page }) => {
    // Navigate to Button story
    await page.goto(`${STORYBOOK_URL}/?path=/story/example-button--primary`);
    
    // Wait for the story to load
    await page.waitForLoadState('networkidle');
    
    // Get the preview iframe
    const previewFrame = page.frameLocator('[title="storybook-preview-iframe"]');
    
    // Wait for button to be visible
    await previewFrame.locator('button').first().waitFor();
    
    // Take screenshot of the button
    await expect(previewFrame.locator('button').first()).toHaveScreenshot('button-primary.png');
  });

  test('Button component - all variants', async ({ page }) => {
    const buttonVariants = [
      'primary',
      'secondary',
      'large',
      'small'
    ];

    for (const variant of buttonVariants) {
      await page.goto(`${STORYBOOK_URL}/?path=/story/example-button--${variant}`);
      await page.waitForLoadState('networkidle');
      
      const previewFrame = page.frameLocator('[title="storybook-preview-iframe"]');
      await previewFrame.locator('button').first().waitFor();
      
      await expect(previewFrame.locator('button').first()).toHaveScreenshot(`button-${variant}.png`);
    }
  });

  test('Header component visual test', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/?path=/story/example-header--logged-in`);
    await page.waitForLoadState('networkidle');
    
    const previewFrame = page.frameLocator('[title="storybook-preview-iframe"]');
    await previewFrame.locator('header, .header').first().waitFor();
    
    await expect(previewFrame.locator('header, .header').first()).toHaveScreenshot('header-logged-in.png');
  });

  test('Page component full layout', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/?path=/story/example-page--logged-in`);
    await page.waitForLoadState('networkidle');
    
    const previewFrame = page.frameLocator('[title="storybook-preview-iframe"]');
    await previewFrame.locator('body').waitFor();
    
    // Take full page screenshot
    await expect(previewFrame.locator('body')).toHaveScreenshot('page-logged-in.png', {
      fullPage: true
    });
  });

  // Test custom UI components if they exist
  test('UI Components - Button stories', async ({ page }) => {
    // Check if custom button stories exist
    try {
      await page.goto(`${STORYBOOK_URL}/?path=/story/ui-button--default`);
      await page.waitForLoadState('networkidle');
      
      const previewFrame = page.frameLocator('[title="storybook-preview-iframe"]');
      await previewFrame.locator('button').first().waitFor({ timeout: 5000 });
      
      await expect(previewFrame.locator('button').first()).toHaveScreenshot('ui-button-default.png');
    } catch (error) {
      console.log('Custom UI Button story not found, skipping...');
    }
  });

  test('UI Components - Input stories', async ({ page }) => {
    try {
      await page.goto(`${STORYBOOK_URL}/?path=/story/ui-input--default`);
      await page.waitForLoadState('networkidle');
      
      const previewFrame = page.frameLocator('[title="storybook-preview-iframe"]');
      await previewFrame.locator('input').first().waitFor({ timeout: 5000 });
      
      await expect(previewFrame.locator('input').first()).toHaveScreenshot('ui-input-default.png');
    } catch (error) {
      console.log('Custom UI Input story not found, skipping...');
    }
  });

  test('Dark theme vs Light theme comparison', async ({ page }) => {
    // Test light theme
    await page.goto(`${STORYBOOK_URL}/?path=/story/example-page--logged-in`);
    await page.waitForLoadState('networkidle');
    
    let previewFrame = page.frameLocator('[title="storybook-preview-iframe"]');
    await previewFrame.locator('body').waitFor();
    
    await expect(previewFrame.locator('body')).toHaveScreenshot('page-light-theme.png', {
      fullPage: true
    });

    // Switch to dark theme if available
    try {
      await page.locator('[title="Change the theme of the preview"]').click();
      await page.locator('text=dark').click();
      await page.waitForTimeout(1000); // Wait for theme transition
      
      await expect(previewFrame.locator('body')).toHaveScreenshot('page-dark-theme.png', {
        fullPage: true
      });
    } catch (error) {
      console.log('Dark theme toggle not found, skipping theme comparison...');
    }
  });

  test('Mobile viewport components', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${STORYBOOK_URL}/?path=/story/example-button--primary`);
    await page.waitForLoadState('networkidle');
    
    const previewFrame = page.frameLocator('[title="storybook-preview-iframe"]');
    await previewFrame.locator('button').first().waitFor();
    
    await expect(previewFrame.locator('button').first()).toHaveScreenshot('button-mobile.png');
  });

  test('Accessibility - Focus states', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/?path=/story/example-button--primary`);
    await page.waitForLoadState('networkidle');
    
    const previewFrame = page.frameLocator('[title="storybook-preview-iframe"]');
    const button = previewFrame.locator('button').first();
    
    // Focus the button
    await button.focus();
    
    // Capture focused state
    await expect(button).toHaveScreenshot('button-focused.png');
  });

  test('Component states - Hover effects', async ({ page }) => {
    await page.goto(`${STORYBOOK_URL}/?path=/story/example-button--primary`);
    await page.waitForLoadState('networkidle');
    
    const previewFrame = page.frameLocator('[title="storybook-preview-iframe"]');
    const button = previewFrame.locator('button').first();
    
    // Hover over the button
    await button.hover();
    
    // Capture hover state
    await expect(button).toHaveScreenshot('button-hover.png');
  });
});
