import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🔧 Setting up global test environment...');

  // Launch browser for global setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Wait for the application to be ready
  try {
    const baseURL = config.webServer?.url || config.use?.baseURL || 'http://localhost:5175';
    console.log(`⏳ Waiting for app to be ready at ${baseURL}...`);
    
    // Wait up to 2 minutes for the app to be available
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    
    // Verify the app has loaded by checking for key elements
    await page.waitForSelector('body', { timeout: 30000 });
    
    console.log('✅ Application is ready for testing');

    // Optional: Pre-authenticate test user or seed test data
    // This can be useful for tests that require authentication
    try {
      // Check if auth is required by looking for login elements
      const loginButton = await page.locator('[data-testid="login-button"], [aria-label*="login"], button:has-text("Login"), button:has-text("Sign In")').first();
      
      if (await loginButton.isVisible({ timeout: 5000 })) {
        console.log('🔐 Authentication required - setting up test session');
        
        // This is where you would implement pre-authentication
        // For now, we'll just log that auth is available
        console.log('📝 Login interface detected');
      } else {
        console.log('🔓 No authentication required or already authenticated');
      }
    } catch (error) {
      // No auth required or auth elements not found
      console.log('ℹ️  No authentication setup needed');
    }

    // Warm up critical routes
    const criticalRoutes = ['/', '/dashboard'];
    for (const route of criticalRoutes) {
      try {
        await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle', timeout: 10000 });
        console.log(`✅ Warmed up route: ${route}`);
      } catch (error) {
        console.log(`⚠️  Could not warm up route ${route}: ${error}`);
      }
    }

  } catch (error) {
    console.error('❌ Failed to set up global test environment:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('🎉 Global setup completed successfully');
}

export default globalSetup;
