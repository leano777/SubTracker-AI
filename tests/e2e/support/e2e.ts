// ***********************************************************
// This example support/e2e.ts is processed and loaded automatically 
// before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands
import './commands'

// Disable screenshot and video on passing tests in interactive mode
if (Cypress.env('SKIP_PASSING_SCREENSHOTS')) {
  Cypress.Screenshot.defaults({
    screenshotOnRunFailure: true,
    screenshotOnPassing: false,
  })
}

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // This is useful for third-party code that might throw exceptions
  console.warn('Uncaught exception:', err.message)
  
  // Return false to prevent the test from failing
  // Add specific exceptions you want to ignore
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false
  }
  
  // Let other exceptions fail the test
  return true
})

// Global before hook
before(() => {
  cy.log('🚀 Starting E2E test suite')
  
  // Clear any existing data
  cy.clearAllLocalStorage()
  cy.clearAllSessionStorage()
  cy.clearCookies()
})

// Global beforeEach hook
beforeEach(() => {
  // Set consistent viewport
  cy.viewport(1280, 720)
  
  // Preserve certain cookies/storage between tests if needed
  // Cypress.Cookies.preserveOnce('session', 'auth-token')
  
  // Intercept API calls for better test control
  cy.intercept('GET', '/api/**').as('apiGet')
  cy.intercept('POST', '/api/**').as('apiPost')
  cy.intercept('PUT', '/api/**').as('apiPut')
  cy.intercept('DELETE', '/api/**').as('apiDelete')
  
  // Set up test environment
  if (Cypress.env('ENABLE_MOCK_DATA')) {
    cy.setupMockData()
  }
})

// Global afterEach hook
afterEach(() => {
  // Clean up after each test
  if (cy.state('test').state === 'failed') {
    // Additional logging for failed tests
    cy.log('❌ Test failed, capturing additional debug info')
  }
  
  // Reset any test data changes
  if (!Cypress.env('PRESERVE_DATA')) {
    cy.task('clearTestData')
  }
})

// Global after hook
after(() => {
  cy.log('🏁 E2E test suite completed')
})

// Add custom types to avoid TypeScript errors
declare global {
  namespace Cypress {
    interface Chainable {
      setupMockData(): Chainable<void>
      login(email?: string, password?: string): Chainable<void>
      logout(): Chainable<void>
      addSubscription(subscription: any): Chainable<void>
      editBudget(amount: number): Chainable<void>
      waitForApiResponse(alias: string, timeout?: number): Chainable<void>
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>
      seedTestData(): Chainable<void>
    }
  }
}
