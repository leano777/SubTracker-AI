import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5175',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    
    // Folders
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/e2e.ts',
    fixturesFolder: 'tests/e2e/fixtures',
    screenshotsFolder: 'test-results/cypress/screenshots',
    videosFolder: 'test-results/cypress/videos',
    downloadsFolder: 'test-results/cypress/downloads',
    
    // Test runner
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Retry
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Node events
    setupNodeEvents(on, config) {
      // implement node event listeners here
      
      // Task for seeding test data
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        
        // Clear test data
        clearTestData() {
          // Implementation for clearing test data
          return null;
        },
        
        // Seed test data  
        seedTestData() {
          // Implementation for seeding test data
          return null;
        }
      });
      
      return config;
    },
    
    // Environment variables
    env: {
      // Test user credentials (use secure env vars in CI)
      TEST_USER_EMAIL: 'test@example.com',
      TEST_USER_PASSWORD: 'TestPassword123!',
      
      // API endpoints
      API_BASE_URL: 'http://localhost:5175/api',
      
      // Feature flags for testing
      ENABLE_MOCK_DATA: true,
      SKIP_AUTH: false
    },
    
    // Browser-specific settings
    chromeWebSecurity: false,
    experimentalStudio: true,
    experimentalWebKitSupport: false
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/component.ts',
    indexHtmlFile: 'tests/e2e/support/component-index.html',
  },
});
