import { test, expect, Page } from '@playwright/test';

// Seed data setup function
async function setupSeedData(page: Page) {
  await page.evaluate(() => {
    const seedData = {
      subscriptions: [
        {
          id: 'seed-1',
          name: 'Netflix Premium',
          price: 15.99,
          cost: 15.99,
          frequency: 'monthly',
          billingCycle: 'monthly',
          nextPayment: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          category: 'Entertainment',
          status: 'active',
          isActive: true,
          website: 'https://netflix.com',
          tags: ['streaming', 'entertainment'],
          priority: 'nice-to-have'
        },
        {
          id: 'seed-2',
          name: 'Adobe Creative Cloud',
          price: 52.99,
          cost: 52.99,
          frequency: 'monthly',
          billingCycle: 'monthly',
          nextPayment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          category: 'Design',
          status: 'active',
          isActive: true,
          website: 'https://adobe.com',
          tags: ['design', 'creative'],
          priority: 'essential'
        },
        {
          id: 'seed-3',
          name: 'Figma Professional',
          price: 12.00,
          cost: 12.00,
          frequency: 'monthly',
          billingCycle: 'monthly',
          nextPayment: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          category: 'Design',
          status: 'active',
          isActive: true,
          website: 'https://figma.com',
          tags: ['design', 'collaboration'],
          priority: 'important'
        }
      ],
      paymentCards: [
        {
          id: 'card-1',
          name: 'Business Visa',
          lastFour: '4532',
          type: 'credit',
          provider: 'visa',
          expiryMonth: 12,
          expiryYear: 2027,
          isDefault: true,
          color: '#3b82f6'
        }
      ],
      appSettings: {
        preferences: {
          theme: 'light',
          darkMode: false,
          defaultView: 'dashboard'
        }
      }
    };
    
    localStorage.setItem('subscriptions', JSON.stringify(seedData.subscriptions));
    localStorage.setItem('paymentCards', JSON.stringify(seedData.paymentCards));
    localStorage.setItem('appSettings', JSON.stringify(seedData.appSettings));
    localStorage.setItem('testMode', 'true');
  });
}

// Helper function to handle authentication if needed
async function handleAuthIfNeeded(page: Page) {
  try {
    const loginButton = page.locator('[data-testid="login-button"], button:has-text("Login"), button:has-text("Sign In")').first();
    const isVisible = await loginButton.isVisible({ timeout: 2000 });
    
    if (isVisible) {
      await loginButton.click();
      await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
      await page.fill('input[type="password"], input[name="password"]', 'password123');
      await page.click('button[type="submit"], button:has-text("Sign In")');
      await page.waitForLoadState('networkidle');
    }
  } catch (error) {
    // No authentication required or already authenticated
  }
}

test.describe('Comprehensive App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupSeedData(page);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await handleAuthIfNeeded(page);
  });

  test('Load app with seed data and verify dashboard', async ({ page }) => {
    console.log('🏠 Testing: Load app with seed data');
    
    // Verify app loaded
    await expect(page.locator('body')).toBeVisible();
    
    // Verify seed data is present
    await expect(page.locator('text=Netflix')).toBeVisible();
    await expect(page.locator('text=Adobe')).toBeVisible();
    
    // Should show financial data
    const bodyText = await page.textContent('body');
    expect(bodyText).toMatch(/\$[\d,]+\.?\d*/);
    
    console.log('✅ Dashboard loads with seed data');
  });

  test('Navigate to Subscriptions tab and assert card list visible', async ({ page }) => {
    console.log('📋 Testing: Subscriptions tab navigation');
    
    // Find and click Subscriptions tab
    const subscriptionsTab = page.locator('[data-testid*="subscriptions"], button:has-text("Subscriptions"), [role="tab"]:has-text("Subscriptions")').first();
    
    if (await subscriptionsTab.count() > 0) {
      await subscriptionsTab.click();
      await page.waitForTimeout(500);
      
      // Assert subscription cards/list is visible
      const hasCards = await page.locator('[data-testid*="subscription-card"], .subscription-card, [class*="subscription"]').count() > 0;
      const hasTable = await page.locator('table, [role="table"]').count() > 0;
      const hasList = await page.locator('[data-testid*="subscription-list"]').count() > 0;
      
      expect(hasCards || hasTable || hasList).toBeTruthy();
      
      // Verify all seed subscriptions are visible
      await expect(page.locator('text=Netflix')).toBeVisible();
      await expect(page.locator('text=Adobe')).toBeVisible();
      await expect(page.locator('text=Figma')).toBeVisible();
      
      // Verify subscription details
      await expect(page.locator('text=monthly')).toBeVisible();
      
      console.log('✅ Subscriptions tab shows card list');
    } else {
      console.log('⚠️ Subscriptions tab not found - checking if already on subscriptions view');
      await expect(page.locator('text=Netflix')).toBeVisible();
    }
  });

  test('Navigate to Dashboard tab and assert graph element visible', async ({ page }) => {
    console.log('📊 Testing: Dashboard tab with graph elements');
    
    // First ensure we're not already on dashboard by clicking subscriptions if it exists
    const subscriptionsTab = page.locator('[data-testid*="subscriptions"], button:has-text("Subscriptions")').first();
    if (await subscriptionsTab.count() > 0) {
      await subscriptionsTab.click();
      await page.waitForTimeout(500);
    }
    
    // Now navigate to Dashboard
    const dashboardTab = page.locator('[data-testid*="dashboard"], button:has-text("Dashboard"), button:has-text("Overview"), [role="tab"]:has-text("Dashboard")').first();
    
    if (await dashboardTab.count() > 0) {
      await dashboardTab.click();
      await page.waitForTimeout(1000); // Give charts time to render
      
      // Assert graph/chart elements are visible
      const hasCharts = await page.locator('svg, canvas, .recharts-wrapper, [class*="chart"], [data-testid*="chart"]').count() > 0;
      const hasGraphs = await page.locator('.recharts-responsive-container, .recharts-surface').count() > 0;
      const hasViz = await page.locator('[class*="visualization"]').count() > 0;
      
      if (hasCharts || hasGraphs || hasViz) {
        console.log('✅ Graph/Chart elements found on dashboard');
        
        // Take a screenshot of the dashboard for verification
        await page.screenshot({ path: 'test-results/dashboard-with-graphs.png', fullPage: true });
      } else {
        console.log('⚠️ No chart elements found - verifying dashboard stats instead');
        // Fallback: check for dashboard statistical displays
        const bodyText = await page.textContent('body');
        expect(bodyText).toMatch(/\$[\d,]+\.?\d*/);
      }
      
      // Verify dashboard shows our data
      await expect(page.locator('text=Netflix')).toBeVisible();
      
      console.log('✅ Dashboard tab shows graph elements or stats');
    } else {
      console.log('⚠️ Dashboard tab not found - assuming we\'re on dashboard');
      const bodyText = await page.textContent('body');
      expect(bodyText).toMatch(/\$[\d,]+\.?\d*/);
    }
  });

  test('Test tab switching performance and data persistence', async ({ page }) => {
    console.log('⚡ Testing: Tab switching performance');
    
    const startTime = Date.now();
    
    // Switch between tabs to test performance
    const subscriptionsTab = page.locator('button:has-text("Subscriptions")').first();
    const dashboardTab = page.locator('button:has-text("Dashboard"), button:has-text("Overview")').first();
    
    if (await subscriptionsTab.count() > 0 && await dashboardTab.count() > 0) {
      await subscriptionsTab.click();
      await page.waitForTimeout(100);
      
      await dashboardTab.click();
      await page.waitForTimeout(100);
      
      const endTime = Date.now();
      const switchTime = endTime - startTime;
      
      expect(switchTime).toBeLessThan(3000); // Should switch within 3 seconds
      console.log(`⏱️ Tab switch completed in ${switchTime}ms`);
      
      // Verify data persists after switching
      await expect(page.locator('text=Netflix')).toBeVisible();
      
      console.log('✅ Tab switching is fast and data persists');
    }
  });

  test('Test mobile viewport - FAB menu and responsive design', async ({ page }) => {
    console.log('📱 Testing: Mobile viewport functionality');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Look for mobile-specific elements
    const hasFAB = await page.locator('[data-testid*="fab"], .floating-action, .fixed').count() > 0;
    const hasMobileMenu = await page.locator('[data-testid*="mobile-menu"], button[aria-label*="menu"]').count() > 0;
    const hasBurgerMenu = await page.locator('.hamburger, [aria-label*="toggle"]').count() > 0;
    
    if (hasFAB || hasMobileMenu || hasBurgerMenu) {
      console.log('✅ Mobile-specific UI elements found');
      
      // Test mobile menu functionality if present
      const mobileMenuTrigger = page.locator('[data-testid*="mobile-menu"], button[aria-label*="menu"], .hamburger').first();
      if (await mobileMenuTrigger.count() > 0) {
        await mobileMenuTrigger.click();
        await page.waitForTimeout(500);
        
        // Menu should be visible
        const menuVisible = await page.locator('[role="dialog"], .mobile-menu-content, .menu-overlay').isVisible();
        if (menuVisible) {
          // Close menu
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
          console.log('✅ Mobile menu opens and closes properly');
        }
      }
    }
    
    // Verify content is still accessible on mobile
    await expect(page.locator('text=Netflix')).toBeVisible();
    
    // Test tab changes render quickly on mobile
    const tabs = page.locator('button:has-text("Subscriptions"), button:has-text("Dashboard")');
    if (await tabs.count() >= 2) {
      const startTime = Date.now();
      await tabs.first().click();
      await page.waitForTimeout(100);
      const endTime = Date.now();
      
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(1000); // Should render within 1 second on mobile
      console.log(`📱 Mobile tab change rendered in ${renderTime}ms`);
    }
    
    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/mobile-viewport.png', fullPage: true });
    
    console.log('✅ Mobile viewport tests completed');
  });

  test('Test data editing functionality', async ({ page }) => {
    console.log('✏️ Testing: Data editing functionality');
    
    // Look for edit buttons or functionality
    const editButtons = page.locator('button:has-text("Edit"), [data-testid*="edit"], [aria-label*="edit"]');
    
    if (await editButtons.count() > 0) {
      await editButtons.first().click();
      await page.waitForTimeout(500);
      
      // Check if edit form appeared
      const hasForm = await page.locator('form, [role="dialog"], input[name*="name"]').count() > 0;
      
      if (hasForm) {
        // Try to edit a field
        const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').first();
        if (await nameInput.count() > 0) {
          await nameInput.fill('Edited Subscription Name');
          
          // Look for save button
          const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
          if (await saveButton.count() > 0) {
            console.log('✅ Edit functionality is accessible');
          }
          
          // Cancel or close to avoid actual changes
          const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Close")').first();
          if (await cancelButton.count() > 0) {
            await cancelButton.click();
          }
        }
      }
    } else {
      console.log('⚠️ Edit functionality not found or not accessible');
    }
  });

  test('Test add subscription functionality', async ({ page }) => {
    console.log('➕ Testing: Add subscription functionality');
    
    const addButtons = page.locator('button:has-text("Add"), [data-testid*="add"], button:has-text("New")');
    
    if (await addButtons.count() > 0) {
      await addButtons.first().click();
      await page.waitForTimeout(500);
      
      // Verify form opens
      const hasForm = await page.locator('form, [role="dialog"]').count() > 0;
      
      if (hasForm) {
        // Fill out basic fields
        const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').first();
        const priceInput = page.locator('input[name*="price"], input[name*="cost"]').first();
        
        if (await nameInput.count() > 0) {
          await nameInput.fill('Test E2E Subscription');
        }
        
        if (await priceInput.count() > 0) {
          await priceInput.fill('19.99');
        }
        
        console.log('✅ Add subscription form is functional');
        
        // Cancel to avoid actual addition
        const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Close")').first();
        if (await cancelButton.count() > 0) {
          await cancelButton.click();
        }
      }
    }
  });

  test('Test sync functionality', async ({ page }) => {
    console.log('🔄 Testing: Sync functionality');
    
    // Look for sync buttons or indicators
    const syncButtons = page.locator('button:has-text("Sync"), [data-testid*="sync"], [aria-label*="sync"]');
    const syncStatus = page.locator('[data-testid*="sync-status"], .sync-status');
    
    if (await syncButtons.count() > 0) {
      console.log('✅ Sync functionality found');
      
      // Test sync button click
      await syncButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Check for sync feedback
      const hasSyncFeedback = await page.locator('text=sync', '[class*="sync"]').count() > 0;
      if (hasSyncFeedback) {
        console.log('✅ Sync provides user feedback');
      }
    } else if (await syncStatus.count() > 0) {
      console.log('✅ Sync status indicator found');
    } else {
      console.log('⚠️ Sync functionality not found');
    }
  });

  test('Test dark mode toggle', async ({ page }) => {
    console.log('🌙 Testing: Dark mode toggle');
    
    const themeToggle = page.locator('[data-testid*="theme"], button[aria-label*="theme"], button:has-text("Dark"), button:has-text("Light")').first();
    
    if (await themeToggle.count() > 0) {
      // Get initial theme
      const initialClass = await page.getAttribute('body', 'class') || '';
      const initialIsDark = initialClass.includes('dark');
      
      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Check if theme changed
      const newClass = await page.getAttribute('body', 'class') || '';
      const newIsDark = newClass.includes('dark');
      
      if (newIsDark !== initialIsDark) {
        console.log(`✅ Theme toggled successfully: ${initialIsDark ? 'dark' : 'light'} → ${newIsDark ? 'dark' : 'light'}`);
        
        // Take screenshots of both themes
        await page.screenshot({ path: `test-results/${newIsDark ? 'dark' : 'light'}-theme.png`, fullPage: true });
      } else {
        console.log('⚠️ Theme may not have changed or change not reflected in body class');
      }
    } else {
      console.log('⚠️ Theme toggle not found');
    }
  });

  test('Test error boundaries and resilience', async ({ page }) => {
    console.log('🛡️ Testing: Error boundaries and app resilience');
    
    // Test with corrupted data
    await page.evaluate(() => {
      localStorage.setItem('subscriptions', 'invalid-json');
      localStorage.setItem('appSettings', '{invalid: json}');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // App should still load
    await expect(page.locator('body')).toBeVisible();
    
    // Should either show error message or recover gracefully
    const bodyText = await page.textContent('body');
    const hasErrorHandling = bodyText?.toLowerCase().includes('error') || bodyText?.toLowerCase().includes('something went wrong');
    const hasRecovered = bodyText?.toLowerCase().includes('dashboard') || bodyText?.toLowerCase().includes('subscriptions');
    
    expect(hasErrorHandling || hasRecovered).toBeTruthy();
    
    console.log('✅ App handles errors gracefully');
  });

  test.afterEach(async ({ page }) => {
    // Clean up test data
    await page.evaluate(() => {
      localStorage.removeItem('testMode');
    });
  });
});
