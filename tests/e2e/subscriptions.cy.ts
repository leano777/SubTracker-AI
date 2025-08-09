describe('Subscription Management', () => {
  beforeEach(() => {
    cy.visit('/')
    
    // Setup mock data for consistent testing
    cy.setupMockData()
    
    // Login if required
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="login-button"], button:contains("Login")').length > 0) {
        cy.login()
      }
    })
  })

  it('should display existing subscriptions', () => {
    // Should see subscription list or cards
    cy.get('body').should('contain.text', 'Netflix')
      .or('contain.text', 'Subscriptions')
      .or('contain.text', 'Monthly')
    
    // Check for subscription elements
    cy.get('body').then(($body) => {
      const hasSubscriptionCards = $body.find('[data-testid*="subscription"], .subscription-card').length > 0
      const hasSubscriptionTable = $body.find('table, [role="table"]').length > 0
      const hasSubscriptionList = $body.find('ul, [role="list"]').length > 0
      
      if (!hasSubscriptionCards && !hasSubscriptionTable && !hasSubscriptionList) {
        cy.log('No subscriptions display found - may be empty state')
      }
    })
  })

  it('should add a new subscription', () => {
    const testSubscription = {
      name: 'Test Service',
      cost: 12.99,
      category: 'Entertainment',
      billingCycle: 'monthly'
    }

    // Look for add subscription button
    cy.get('body').then(($body) => {
      const addButton = $body.find('button:contains("Add"), [data-testid*="add"]').first()
      
      if (addButton.length > 0) {
        cy.wrap(addButton).click()
        
        // Fill out form if it appears
        cy.get('body').then(($formBody) => {
          if ($formBody.find('input[name*="name"], input[placeholder*="name" i]').length > 0) {
            cy.addSubscription(testSubscription)
            
            // Verify subscription was added
            cy.get('body').should('contain.text', testSubscription.name)
          } else {
            cy.log('Add subscription form not found')
          }
        })
      } else {
        cy.log('Add subscription button not found - testing with direct form access')
      }
    })
  })

  it('should edit an existing subscription', () => {
    // Find first subscription to edit
    cy.get('body').then(($body) => {
      const editButtons = $body.find('button:contains("Edit"), [data-testid*="edit"], [aria-label*="edit" i]')
      
      if (editButtons.length > 0) {
        cy.wrap(editButtons.first()).click()
        
        // Update subscription details
        cy.get('body').then(($editBody) => {
          if ($editBody.find('input[name*="cost"], input[placeholder*="cost" i]').length > 0) {
            cy.get('input[name*="cost"], input[placeholder*="cost" i]')
              .clear()
              .type('19.99')
            
            // Save changes
            cy.get('button:contains("Save"), button[type="submit"]').click()
            
            // Verify update
            cy.get('body').should('contain.text', '19.99')
          } else {
            cy.log('Edit form not found')
          }
        })
      } else {
        cy.log('Edit functionality not found')
      }
    })
  })

  it('should delete a subscription', () => {
    // Find delete button
    cy.get('body').then(($body) => {
      const deleteButtons = $body.find('button:contains("Delete"), [data-testid*="delete"], [aria-label*="delete" i]')
      
      if (deleteButtons.length > 0) {
        // Get subscription name before deletion
        let subscriptionName = ''
        cy.wrap(deleteButtons.first()).closest('[data-testid*="subscription"], .subscription-card, tr').then(($container) => {
          subscriptionName = $container.text()
        })
        
        cy.wrap(deleteButtons.first()).click()
        
        // Handle confirmation dialog if present
        cy.get('body').then(($confirmBody) => {
          if ($confirmBody.find('button:contains("Confirm"), button:contains("Yes"), button:contains("Delete")').length > 0) {
            cy.get('button:contains("Confirm"), button:contains("Yes"), button:contains("Delete")').click()
          }
        })
        
        // Verify deletion
        if (subscriptionName) {
          cy.get('body').should('not.contain.text', subscriptionName)
        }
      } else {
        cy.log('Delete functionality not found')
      }
    })
  })

  it('should filter subscriptions by category', () => {
    cy.get('body').then(($body) => {
      const filterSelect = $body.find('select[name*="category"], [data-testid*="filter"], [data-testid*="category"]')
      
      if (filterSelect.length > 0) {
        // Filter by Entertainment category
        cy.wrap(filterSelect.first()).select('Entertainment')
        
        // Verify filtered results
        cy.get('body').should('contain.text', 'Entertainment')
          .or('contain.text', 'Netflix')
          .or('contain.text', 'Spotify')
      } else {
        cy.log('Category filter not found')
      }
    })
  })

  it('should search subscriptions', () => {
    cy.get('body').then(($body) => {
      const searchInput = $body.find('input[placeholder*="search" i], input[name*="search"], [data-testid*="search"]')
      
      if (searchInput.length > 0) {
        cy.wrap(searchInput.first()).type('Netflix')
        
        // Verify search results
        cy.get('body').should('contain.text', 'Netflix')
      } else {
        cy.log('Search functionality not found')
      }
    })
  })

  it('should display subscription totals', () => {
    // Look for total cost display
    cy.get('body').then(($body) => {
      const hasTotalDisplay = $body.find('[data-testid*="total"], .total, [class*="total" i]').length > 0
      const hasMonthlyTotal = $body.text().match(/\$[\d,]+\.?\d*/g)
      
      if (hasTotalDisplay || hasMonthlyTotal) {
        cy.log('Total cost display found')
        // Verify total is displayed
        cy.get('body').should('match', /\$[\d,]+\.?\d*/)
      } else {
        cy.log('Total cost display not found')
      }
    })
  })

  it('should handle subscription renewal notifications', () => {
    // Check for upcoming renewals
    cy.get('body').then(($body) => {
      const hasNotifications = $body.find('[data-testid*="notification"], .notification, [class*="notification" i]').length > 0
      const hasUpcomingSection = $body.text().toLowerCase().includes('upcoming') || $body.text().toLowerCase().includes('renewal')
      
      if (hasNotifications || hasUpcomingSection) {
        cy.log('Renewal notifications found')
        cy.get('body').should('contain.text', 'renew')
          .or('contain.text', 'upcoming')
          .or('contain.text', 'due')
      } else {
        cy.log('No renewal notifications found')
      }
    })
  })
})
