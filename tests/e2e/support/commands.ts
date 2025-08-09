/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Custom command to get elements by test id
 */
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`)
})

/**
 * Custom command to setup mock data for testing
 */
Cypress.Commands.add('setupMockData', () => {
  cy.window().then((win) => {
    // Set up mock subscription data in localStorage
    const mockSubscriptions = [
      {
        id: 'test-sub-1',
        name: 'Netflix',
        cost: 15.99,
        billingCycle: 'monthly',
        nextBilling: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Entertainment'
      },
      {
        id: 'test-sub-2', 
        name: 'Spotify',
        cost: 9.99,
        billingCycle: 'monthly',
        nextBilling: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Entertainment'
      }
    ]
    
    win.localStorage.setItem('subscriptions', JSON.stringify(mockSubscriptions))
    win.localStorage.setItem('testMode', 'true')
  })
})

/**
 * Custom command for user authentication
 */
Cypress.Commands.add('login', (email?: string, password?: string) => {
  const testEmail = email || Cypress.env('TEST_USER_EMAIL') || 'test@example.com'
  const testPassword = password || Cypress.env('TEST_USER_PASSWORD') || 'TestPassword123!'
  
  cy.visit('/')
  
  // Look for login button or modal
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="login-button"]').length > 0) {
      cy.getByTestId('login-button').click()
    } else if ($body.find('button:contains("Login")').length > 0) {
      cy.get('button:contains("Login")').first().click()
    } else if ($body.find('button:contains("Sign In")').length > 0) {
      cy.get('button:contains("Sign In")').first().click()
    }
  })
  
  // Fill in login form
  cy.get('input[type="email"], input[name="email"], input[placeholder*="email" i]')
    .type(testEmail, { delay: 50 })
  
  cy.get('input[type="password"], input[name="password"], input[placeholder*="password" i]')
    .type(testPassword, { delay: 50 })
  
  // Submit form
  cy.get('button[type="submit"], button:contains("Sign In"), button:contains("Login")')
    .click()
  
  // Wait for successful login
  cy.url().should('not.contain', 'login')
  cy.get('body').should('not.contain', 'Login')
})

/**
 * Custom command for user logout
 */
Cypress.Commands.add('logout', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="logout-button"]').length > 0) {
      cy.getByTestId('logout-button').click()
    } else if ($body.find('[data-testid="user-menu"]').length > 0) {
      cy.getByTestId('user-menu').click()
      cy.get('button:contains("Logout"), button:contains("Sign Out")').click()
    } else if ($body.find('button:contains("Logout")').length > 0) {
      cy.get('button:contains("Logout")').first().click()
    }
  })
  
  // Verify logout
  cy.get('body').should('contain', 'Login')
})

/**
 * Custom command to add a new subscription
 */
Cypress.Commands.add('addSubscription', (subscription) => {
  // Navigate to add subscription
  cy.get('button:contains("Add Subscription"), [data-testid="add-subscription"]').click()
  
  // Fill out the form
  if (subscription.name) {
    cy.get('input[name="name"], input[placeholder*="name" i]').type(subscription.name)
  }
  
  if (subscription.cost) {
    cy.get('input[name="cost"], input[placeholder*="cost" i], input[placeholder*="price" i]')
      .clear()
      .type(subscription.cost.toString())
  }
  
  if (subscription.category) {
    cy.get('select[name="category"], [data-testid="category-select"]').select(subscription.category)
  }
  
  if (subscription.billingCycle) {
    cy.get('select[name="billingCycle"], [data-testid="billing-cycle-select"]').select(subscription.billingCycle)
  }
  
  // Submit the form
  cy.get('button[type="submit"], button:contains("Save"), button:contains("Add")').click()
  
  // Verify subscription was added
  cy.get('body').should('contain', subscription.name)
})

/**
 * Custom command to edit budget
 */
Cypress.Commands.add('editBudget', (amount: number) => {
  // Navigate to budget section
  cy.get('[data-testid="budget-section"], button:contains("Budget")').click()
  
  // Find and click edit budget button
  cy.get('button:contains("Edit"), [data-testid="edit-budget"]').click()
  
  // Update budget amount
  cy.get('input[name="budget"], input[placeholder*="budget" i]')
    .clear()
    .type(amount.toString())
  
  // Save changes
  cy.get('button:contains("Save"), button[type="submit"]').click()
  
  // Verify budget was updated
  cy.get('body').should('contain', amount.toString())
})

/**
 * Custom command to wait for API responses
 */
Cypress.Commands.add('waitForApiResponse', (alias: string, timeout: number = 10000) => {
  cy.wait(`@${alias}`, { timeout })
})

/**
 * Custom command to seed test data
 */
Cypress.Commands.add('seedTestData', () => {
  cy.task('seedTestData')
})

// Extend Cypress namespace to include our custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>
      setupMockData(): Chainable<void>
      login(email?: string, password?: string): Chainable<void>
      logout(): Chainable<void>
      addSubscription(subscription: any): Chainable<void>
      editBudget(amount: number): Chainable<void>
      waitForApiResponse(alias: string, timeout?: number): Chainable<void>
      seedTestData(): Chainable<void>
    }
  }
}
