import { test, expect } from '@playwright/test';

test.describe('Application Visual Regression Tests', () => {

  test('Landing page layout', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Hide any dynamic elements that change between runs
    await page.addStyleTag({
      content: `
        [data-testid="current-time"],
        .time-display,
        .timestamp {
          visibility: hidden !important;
        }
      `
    });
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('landing-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Dashboard layout - authenticated state', async ({ page }) => {
    await page.goto('/');
    
    // Check if authentication is required
    const hasLoginButton = await page.locator('[data-testid="login-button"], button:contains("Login")').count() > 0;
    
    if (hasLoginButton) {
      // Simulate login if required
      await page.locator('[data-testid="login-button"], button:contains("Login")').first().click();
      
      // Fill login form
      await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
      await page.fill('input[type="password"], input[name="password"]', 'password123');
      await page.click('button[type="submit"], button:contains("Sign In")');
      
      // Wait for dashboard to load
      await page.waitForLoadState('networkidle');
    }
    
    // Hide dynamic content
    await page.addStyleTag({
      content: `
        .timestamp,
        [data-testid="current-time"],
        .time-display,
        .loading,
        [class*="animate"],
        [class*="pulse"] {
          visibility: hidden !important;
        }
      `
    });
    
    await expect(page).toHaveScreenshot('dashboard-authenticated.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Subscription list view', async ({ page }) => {
    await page.goto('/');
    
    // Set up mock data
    await page.evaluate(() => {
      const mockData = [
        {
          id: '1',
          name: 'Netflix',
          cost: 15.99,
          billingCycle: 'monthly',
          category: 'Entertainment'
        },
        {
          id: '2', 
          name: 'Spotify',
          cost: 9.99,
          billingCycle: 'monthly',
          category: 'Entertainment'
        }
      ];
      localStorage.setItem('subscriptions', JSON.stringify(mockData));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic elements
    await page.addStyleTag({
      content: `
        .timestamp,
        [data-testid*="time"],
        .loading,
        [class*="animate"] {
          visibility: hidden !important;
        }
      `
    });
    
    // Take screenshot of subscription list
    const subscriptionsList = page.locator('[data-testid*="subscriptions"], .subscriptions, [class*="subscription"]');
    if (await subscriptionsList.count() > 0) {
      await expect(subscriptionsList.first()).toHaveScreenshot('subscriptions-list.png');
    } else {
      // Fallback to full page if specific element not found
      await expect(page).toHaveScreenshot('subscriptions-view.png', {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('Budget overview section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Set up budget data
    await page.evaluate(() => {
      localStorage.setItem('budget', JSON.stringify({
        monthly: 200,
        spent: 125.98,
        remaining: 74.02
      }));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic elements
    await page.addStyleTag({
      content: `
        [class*="animate"],
        .loading,
        .timestamp {
          animation: none !important;
          visibility: hidden !important;
        }
      `
    });
    
    // Try to find budget section
    const budgetSection = page.locator('[data-testid*="budget"], .budget, [class*="budget"]');
    if (await budgetSection.count() > 0) {
      await expect(budgetSection.first()).toHaveScreenshot('budget-overview.png');
    } else {
      console.log('Budget section not found - taking full page screenshot');
      await expect(page).toHaveScreenshot('budget-view.png', {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('Mobile responsive layout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic content
    await page.addStyleTag({
      content: `
        .timestamp,
        [class*="animate"],
        .loading {
          visibility: hidden !important;
        }
      `
    });
    
    await expect(page).toHaveScreenshot('mobile-layout.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Tablet responsive layout', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.addStyleTag({
      content: `
        .timestamp,
        [class*="animate"],
        .loading {
          visibility: hidden !important;
        }
      `
    });
    
    await expect(page).toHaveScreenshot('tablet-layout.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Dark theme vs Light theme', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic elements
    const hideAnimations = `
      .timestamp,
      [class*="animate"],
      .loading {
        visibility: hidden !important;
      }
    `;
    
    await page.addStyleTag({ content: hideAnimations });
    
    // Capture light theme
    await expect(page).toHaveScreenshot('light-theme.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Try to switch to dark theme
    const themeToggle = page.locator('[data-testid*="theme"], [class*="theme"], button[aria-label*="theme"]');
    if (await themeToggle.count() > 0) {
      await themeToggle.first().click();
      await page.waitForTimeout(500); // Wait for theme transition
      
      await page.addStyleTag({ content: hideAnimations });
      
      await expect(page).toHaveScreenshot('dark-theme.png', {
        fullPage: true,
        animations: 'disabled'
      });
    } else {
      console.log('Theme toggle not found - skipping dark theme test');
    }
  });

  test('Modal dialogs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to open add subscription modal
    const addButton = page.locator('button:contains("Add"), [data-testid*="add"]');
    if (await addButton.count() > 0) {
      await addButton.first().click();
      
      // Wait for modal to appear
      await page.waitForSelector('[role="dialog"], .modal, [data-testid*="modal"]', { timeout: 5000 });
      
      const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]');
      await expect(modal.first()).toHaveScreenshot('add-subscription-modal.png');
    } else {
      console.log('Add button not found - skipping modal test');
    }
  });

  test('Form validation states', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to find and interact with forms
    const forms = page.locator('form');
    if (await forms.count() > 0) {
      const form = forms.first();
      
      // Try to submit empty form to trigger validation
      const submitButton = form.locator('button[type="submit"], input[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Wait for validation messages
        await page.waitForTimeout(1000);
        
        await expect(form).toHaveScreenshot('form-validation-errors.png');
      }
    } else {
      console.log('No forms found - skipping validation test');
    }
  });

  test('Empty states', async ({ page }) => {
    await page.goto('/');
    
    // Clear any existing data to show empty states
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.addStyleTag({
      content: `
        .timestamp,
        [class*="animate"],
        .loading {
          visibility: hidden !important;
        }
      `
    });
    
    await expect(page).toHaveScreenshot('empty-state.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Loading states', async ({ page }) => {
    // Slow down network to capture loading states
    await page.route('**/*', route => {
      // Add delay to see loading states
      setTimeout(() => route.continue(), 1000);
    });
    
    await page.goto('/');
    
    // Try to capture loading state quickly
    await page.waitForSelector('.loading, [data-testid*="loading"], [class*="loading"]', { timeout: 2000 }).catch(() => {
      console.log('Loading state not captured - page loaded too quickly');
    });
    
    const loadingElement = page.locator('.loading, [data-testid*="loading"], [class*="loading"]');
    if (await loadingElement.count() > 0) {
      await expect(loadingElement.first()).toHaveScreenshot('loading-state.png');
    }
    
    // Wait for full load and take final state
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('loaded-state.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});
