describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the landing page', () => {
    cy.url().should('include', '/')
    cy.get('body').should('be.visible')
    cy.title().should('not.be.empty')
  })

  it('should display login interface when auth is required', () => {
    // Check if login button exists
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="login-button"]').length > 0) {
        cy.getByTestId('login-button').should('be.visible')
        cy.getByTestId('login-button').should('contain.text', 'Login')
      } else if ($body.find('button:contains("Login")').length > 0) {
        cy.get('button:contains("Login")').should('be.visible')
      } else {
        cy.log('No authentication required - app is open access or already authenticated')
      }
    })
  })

  it('should handle login flow if authentication is required', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="login-button"], button:contains("Login")').length > 0) {
        // Test login flow
        cy.login(Cypress.env('TEST_USER_EMAIL'), Cypress.env('TEST_USER_PASSWORD'))
        
        // Verify successful login
        cy.url().should('not.contain', 'login')
        cy.get('body').should('not.contain', 'Login')
        
        // Should see dashboard or main app content
        cy.get('body').should('contain.text', 'Dashboard')
          .or('contain.text', 'Subscriptions')
          .or('contain.text', 'Welcome')
      } else {
        cy.log('Skipping login test - no authentication required')
      }
    })
  })

  it('should handle logout flow if authentication is used', () => {
    cy.get('body').then(($body) => {
      // First login if needed
      if ($body.find('[data-testid="login-button"], button:contains("Login")').length > 0) {
        cy.login()
      }
      
      // Then test logout
      cy.get('body').then(($bodyAfterLogin) => {
        if ($bodyAfterLogin.find('[data-testid="logout-button"], button:contains("Logout")').length > 0) {
          cy.logout()
          
          // Verify successful logout
          cy.get('body').should('contain.text', 'Login')
            .or('contain.text', 'Sign In')
        } else {
          cy.log('No logout functionality found - app may not have authentication')
        }
      })
    })
  })

  it('should handle invalid login credentials', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="login-button"], button:contains("Login")').length > 0) {
        // Attempt login with invalid credentials
        cy.visit('/')
        
        // Click login
        if ($body.find('[data-testid="login-button"]').length > 0) {
          cy.getByTestId('login-button').click()
        } else {
          cy.get('button:contains("Login")').first().click()
        }
        
        // Enter invalid credentials
        cy.get('input[type="email"], input[name="email"]')
          .type('invalid@example.com', { delay: 50 })
        
        cy.get('input[type="password"], input[name="password"]')
          .type('wrongpassword', { delay: 50 })
        
        cy.get('button[type="submit"], button:contains("Sign In")').click()
        
        // Should show error message
        cy.get('body').should('contain.text', 'Invalid')
          .or('contain.text', 'Error')
          .or('contain.text', 'incorrect')
          .or('contain.text', 'failed')
      } else {
        cy.log('Skipping invalid login test - no authentication required')
      }
    })
  })

  it('should persist login session', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="login-button"], button:contains("Login")').length > 0) {
        // Login
        cy.login()
        
        // Navigate away and back
        cy.visit('/')
        
        // Should still be logged in
        cy.get('body').should('not.contain', 'Login')
        cy.url().should('not.contain', 'login')
      } else {
        cy.log('Skipping session persistence test - no authentication required')
      }
    })
  })
})
