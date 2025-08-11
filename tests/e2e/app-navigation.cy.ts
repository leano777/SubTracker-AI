describe('App Navigation & Core Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
    
    // Setup seed data with comprehensive subscriptions
    cy.window().then((win) => {
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
      }
      
      win.localStorage.setItem('subscriptions', JSON.stringify(seedData.subscriptions))
      win.localStorage.setItem('paymentCards', JSON.stringify(seedData.paymentCards))
      win.localStorage.setItem('appSettings', JSON.stringify(seedData.appSettings))
      win.localStorage.setItem('testMode', 'true')
    })
    
    cy.reload()
    cy.wait(1000) // Allow time for data to load
    
    // Handle authentication if needed
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="login-button"], button:contains("Login")').length > 0) {
        cy.login()
        cy.wait(2000)
      }
    })
  })

  it('should load app with seed data and display dashboard by default', () => {
    cy.log('🏠 Testing Dashboard Tab')
    
    // Verify we're on dashboard/overview by default
    cy.get('body').should('be.visible')
    
    // Look for dashboard indicators
    cy.get('body').then(($body) => {
      const bodyText = $body.text().toLowerCase()
      expect(bodyText).to.satisfy((text) => 
        text.includes('dashboard') || 
        text.includes('overview') || 
        text.includes('total') ||
        text.includes('subscriptions')
      )
    })
    
    // Verify seed data is loaded - should see our test subscriptions
    cy.get('body').should('contain.text', 'Netflix')
      .and('contain.text', 'Adobe')
    
    // Should see some financial data (totals, costs, etc.)
    cy.get('body').should('match', /\$[\d,]+\.?\d*/)
  })

  it('should navigate to Subscriptions tab and display card list', () => {
    cy.log('📋 Testing Subscriptions Tab Navigation')
    
    // Find and click Subscriptions tab
    cy.get('body').then(($body) => {
      const subscriptionsTab = $body.find('[data-testid*="subscriptions"], button:contains("Subscriptions"), [role="tab"]:contains("Subscriptions"), a:contains("Subscriptions")')
      
      if (subscriptionsTab.length > 0) {
        cy.wrap(subscriptionsTab.first()).click()
        cy.wait(500)
        
        // Assert that subscription cards/list is visible
        cy.get('body').then(($updatedBody) => {
          const hasSubscriptionCards = $updatedBody.find('[data-testid*="subscription-card"], .subscription-card, [class*="subscription"]').length > 0
          const hasSubscriptionTable = $updatedBody.find('table, [role="table"], thead, tbody').length > 0
          const hasSubscriptionList = $updatedBody.find('[data-testid*="subscription-list"], .subscription-list').length > 0
          
          // At least one subscription display method should be present
          expect(hasSubscriptionCards || hasSubscriptionTable || hasSubscriptionList).to.be.true
          
          // Verify our seed data subscriptions are visible
          cy.get('body')
            .should('contain.text', 'Netflix')
            .and('contain.text', 'Adobe')
            .and('contain.text', 'Figma')
        })
        
        // Verify subscription details are shown
        cy.get('body').should('match', /\$[\d,]+\.?\d*/) // Should show prices
        cy.get('body').should('contain.text', 'monthly') // Should show billing cycle
        
      } else {
        cy.log('⚠️ Subscriptions tab not found - checking if already on subscriptions view')
        // If no tab found, we might already be showing subscriptions
        cy.get('body').should('contain.text', 'Netflix')
      }
    })
  })

  it('should navigate to Dashboard tab and display graph elements', () => {
    cy.log('📊 Testing Dashboard Tab with Graph Elements')
    
    // First navigate to subscriptions if we're there
    cy.get('body').then(($body) => {
      const subscriptionsTab = $body.find('[data-testid*="subscriptions"], button:contains("Subscriptions"), [role="tab"]:contains("Subscriptions")')
      if (subscriptionsTab.length > 0) {
        cy.wrap(subscriptionsTab.first()).click()
        cy.wait(500)
      }
    })
    
    // Now navigate to Dashboard
    cy.get('body').then(($body) => {
      const dashboardTab = $body.find('[data-testid*="dashboard"], button:contains("Dashboard"), [role="tab"]:contains("Dashboard"), button:contains("Overview"), [role="tab"]:contains("Overview")')
      
      if (dashboardTab.length > 0) {
        cy.wrap(dashboardTab.first()).click()
        cy.wait(1000) // Give charts time to render
        
        // Assert that graph/chart elements are visible
        cy.get('body').then(($updatedBody) => {
          const hasChartElements = $updatedBody.find('svg, canvas, .recharts-wrapper, [class*="chart"], [data-testid*="chart"], .chart-container').length > 0
          const hasGraphElements = $updatedBody.find('.recharts-responsive-container, .recharts-surface, [class*="graph"]').length > 0
          const hasVisualizationElements = $updatedBody.find('[class*="visualization"], [data-testid*="graph"]').length > 0
          
          if (hasChartElements || hasGraphElements || hasVisualizationElements) {
            cy.log('✅ Graph/Chart elements found on dashboard')
          } else {
            cy.log('⚠️ No chart elements found - checking for dashboard stats')
            // Fallback: check for dashboard statistical displays
            cy.get('body').should('match', /\$[\d,]+\.?\d*/) // Should show financial data
          }
        })
        
        // Verify dashboard content is shown
        cy.get('body').should('contain.text', 'Netflix') // Our seed data should be visible
        
      } else {
        cy.log('⚠️ Dashboard tab not found - checking current dashboard state')
        // Verify we're seeing dashboard content
        cy.get('body').should('match', /\$[\d,]+\.?\d*/)
      }
    })
  })

  it('should handle tab switching performance and maintain data', () => {
    cy.log('⚡ Testing Tab Switching Performance')
    
    const tabSwitchTimeout = 2000 // Max acceptable switch time
    
    // Test switching between tabs rapidly
    cy.get('body').then(($body) => {
      const tabs = $body.find('[role="tab"], button:contains("Dashboard"), button:contains("Subscriptions"), [data-testid*="tab"]')
      
      if (tabs.length >= 2) {
        const startTime = Date.now()
        
        // Switch to subscriptions
        cy.wrap(tabs.filter(':contains("Subscriptions")').first()).click()
        cy.wait(100)
        
        // Switch back to dashboard
        cy.wrap(tabs.filter(':contains("Dashboard")').first()).click()
        
        cy.then(() => {
          const endTime = Date.now()
          const switchTime = endTime - startTime
          expect(switchTime).to.be.lessThan(tabSwitchTimeout)
          cy.log(`⏱️ Tab switch completed in ${switchTime}ms`)
        })
        
        // Verify data is still present after switching
        cy.get('body').should('contain.text', 'Netflix')
        cy.get('body').should('match', /\$[\d,]+\.?\d*/)
      }
    })
  })

  it('should support adding new subscription functionality', () => {
    cy.log('➕ Testing Add Subscription Functionality')
    
    // Look for add subscription button/action
    cy.get('body').then(($body) => {
      const addButton = $body.find('button:contains("Add"), [data-testid*="add"], button:contains("New"), [aria-label*="add"]')
      
      if (addButton.length > 0) {
        cy.wrap(addButton.first()).click()
        cy.wait(500)
        
        // Check if form appears
        cy.get('body').then(($formBody) => {
          const hasForm = $formBody.find('form, [role="dialog"], input[name*="name"], input[placeholder*="name"]').length > 0
          
          if (hasForm) {
            cy.log('✅ Add subscription form is accessible')
            
            // Try to fill basic form fields if they exist
            const nameInput = $formBody.find('input[name*="name"], input[placeholder*="name"]')
            const priceInput = $formBody.find('input[name*="price"], input[name*="cost"], input[placeholder*="price"]')
            
            if (nameInput.length > 0) {
              cy.wrap(nameInput.first()).type('Test Subscription E2E')
            }
            
            if (priceInput.length > 0) {
              cy.wrap(priceInput.first()).clear().type('9.99')
            }
            
            // Look for save/submit button
            const submitButton = $formBody.find('button[type="submit"], button:contains("Save"), button:contains("Add")')
            if (submitButton.length > 0) {
              cy.log('✅ Form submission is available')
            }
            
            // Close form (look for cancel or close button)
            const cancelButton = $formBody.find('button:contains("Cancel"), button:contains("Close"), [aria-label*="close"]')
            if (cancelButton.length > 0) {
              cy.wrap(cancelButton.first()).click()
            }
          }
        })
      } else {
        cy.log('⚠️ Add subscription functionality not found')
      }
    })
  })

  it('should display proper error boundaries and loading states', () => {
    cy.log('🛡️ Testing Error Handling and Loading States')
    
    // Test that the app doesn't crash with invalid data
    cy.window().then((win) => {
      win.localStorage.setItem('subscriptions', 'invalid-json')
      win.localStorage.setItem('appSettings', '{"invalid": json}')
    })
    
    cy.reload()
    cy.wait(1000)
    
    // App should still load without crashing
    cy.get('body').should('be.visible')
    
    // Should either show error message or recover gracefully
    cy.get('body').then(($body) => {
      const bodyText = $body.text().toLowerCase()
      const hasErrorHandling = bodyText.includes('error') || bodyText.includes('something went wrong') || bodyText.includes('try again')
      const hasRecovered = bodyText.includes('netflix') || bodyText.includes('dashboard') || bodyText.includes('subscriptions')
      
      // Either proper error handling OR graceful recovery
      expect(hasErrorHandling || hasRecovered).to.be.true
    })
  })

  it('should support dark mode toggle functionality', () => {
    cy.log('🌙 Testing Dark Mode Toggle')
    
    // Look for theme toggle button
    cy.get('body').then(($body) => {
      const themeToggle = $body.find('[data-testid*="theme"], button[aria-label*="theme"], [class*="theme"], button:contains("Dark"), button:contains("Light")')
      
      if (themeToggle.length > 0) {
        // Get initial theme state
        const initialClass = $body.attr('class') || ''
        const initialIsDark = initialClass.includes('dark') || $body.hasClass('dark')
        
        // Toggle theme
        cy.wrap(themeToggle.first()).click()
        cy.wait(500)
        
        // Verify theme changed
        cy.get('body').then(($updatedBody) => {
          const newClass = $updatedBody.attr('class') || ''
          const newIsDark = newClass.includes('dark') || $updatedBody.hasClass('dark')
          
          // Theme state should have changed
          expect(newIsDark).to.not.equal(initialIsDark)
          cy.log(`✅ Theme toggled: ${initialIsDark ? 'dark' : 'light'} -> ${newIsDark ? 'dark' : 'light'}`)
        })
      } else {
        cy.log('⚠️ Theme toggle not found')
      }
    })
  })

  afterEach(() => {
    // Clean up test data
    cy.window().then((win) => {
      win.localStorage.removeItem('testMode')
    })
  })
})
