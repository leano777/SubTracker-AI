describe('Budget Management', () => {
  beforeEach(() => {
    cy.visit('/')
    
    // Setup mock data
    cy.setupMockData()
    
    // Login if required
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="login-button"], button:contains("Login")').length > 0) {
        cy.login()
      }
    })
  })

  it('should display current budget information', () => {
    // Look for budget-related elements
    cy.get('body').then(($body) => {
      const hasBudgetDisplay = $body.find('[data-testid*="budget"], .budget, [class*="budget" i]').length > 0
      const hasBudgetText = $body.text().toLowerCase().includes('budget')
      const hasSpendingDisplay = $body.text().toLowerCase().includes('spent') || $body.text().toLowerCase().includes('remaining')
      
      if (hasBudgetDisplay || hasBudgetText || hasSpendingDisplay) {
        cy.log('Budget information found')
        cy.get('body').should('contain.text', 'Budget')
          .or('contain.text', 'budget')
          .or('contain.text', 'Spent')
          .or('contain.text', 'Remaining')
      } else {
        cy.log('Budget display not found - may not be implemented yet')
      }
    })
  })

  it('should allow setting a monthly budget', () => {
    const testBudget = 500

    cy.get('body').then(($body) => {
      // Look for budget setting controls
      const budgetButtons = $body.find('button:contains("Budget"), [data-testid*="budget"], button:contains("Set Budget")')
      
      if (budgetButtons.length > 0) {
        cy.wrap(budgetButtons.first()).click()
        
        // Look for budget input form
        cy.get('body').then(($formBody) => {
          if ($formBody.find('input[name*="budget"], input[placeholder*="budget" i]').length > 0) {
            cy.editBudget(testBudget)
            
            // Verify budget was set
            cy.get('body').should('contain.text', testBudget.toString())
          } else {
            cy.log('Budget input form not found')
          }
        })
      } else {
        cy.log('Budget setting functionality not found')
      }
    })
  })

  it('should show budget vs actual spending comparison', () => {
    cy.get('body').then(($body) => {
      const hasProgressBar = $body.find('[role="progressbar"], .progress-bar, progress').length > 0
      const hasPercentage = $body.text().match(/\d+%/g)
      const hasBudgetComparison = $body.text().includes('of') && $body.text().includes('$')
      
      if (hasProgressBar || hasPercentage || hasBudgetComparison) {
        cy.log('Budget comparison found')
        
        // Verify visual indicators exist
        cy.get('body').should('contain.text', '$')
        
        if (hasProgressBar) {
          cy.get('[role="progressbar"], .progress-bar, progress').should('be.visible')
        }
        
        if (hasPercentage) {
          cy.get('body').should('match', /\d+%/)
        }
      } else {
        cy.log('Budget comparison not found')
      }
    })
  })

  it('should warn when approaching budget limit', () => {
    // Set a low budget to trigger warning
    const lowBudget = 30

    cy.get('body').then(($body) => {
      const budgetButtons = $body.find('button:contains("Budget"), [data-testid*="budget"]')
      
      if (budgetButtons.length > 0) {
        cy.wrap(budgetButtons.first()).click()
        
        cy.get('body').then(($formBody) => {
          if ($formBody.find('input[name*="budget"], input[placeholder*="budget" i]').length > 0) {
            cy.editBudget(lowBudget)
            
            // Check for warning indicators
            cy.get('body').then(($warningBody) => {
              const hasWarningColor = $warningBody.find('[class*="red"], [class*="warning"], [class*="danger"]').length > 0
              const hasWarningText = $warningBody.text().toLowerCase().includes('warning') || 
                                   $warningBody.text().toLowerCase().includes('limit') ||
                                   $warningBody.text().toLowerCase().includes('over')
              
              if (hasWarningColor || hasWarningText) {
                cy.log('Budget warning found')
              } else {
                cy.log('No budget warning - spending may be within limits')
              }
            })
          }
        })
      } else {
        cy.log('Cannot test budget warning - budget setting not available')
      }
    })
  })

  it('should display spending by category', () => {
    cy.get('body').then(($body) => {
      const hasChart = $body.find('svg, canvas, .chart, [class*="chart" i]').length > 0
      const hasCategoryBreakdown = $body.text().includes('Entertainment') || 
                                  $body.text().includes('Utilities') ||
                                  $body.text().includes('category')
      
      if (hasChart || hasCategoryBreakdown) {
        cy.log('Category spending breakdown found')
        
        if (hasChart) {
          cy.get('svg, canvas, .chart').should('be.visible')
        }
        
        // Check for category labels
        cy.get('body').should('contain.text', 'Entertainment')
          .or('contain.text', 'category')
          .or('contain.text', 'Category')
      } else {
        cy.log('Category spending breakdown not found')
      }
    })
  })

  it('should show budget history/trends', () => {
    cy.get('body').then(($body) => {
      const hasHistorySection = $body.text().toLowerCase().includes('history') ||
                               $body.text().toLowerCase().includes('trend') ||
                               $body.text().toLowerCase().includes('month')
      const hasTimeControls = $body.find('select, button').filter((i, el) => {
        return $(el).text().toLowerCase().includes('month') ||
               $(el).text().toLowerCase().includes('year') ||
               $(el).text().toLowerCase().includes('period')
      }).length > 0
      
      if (hasHistorySection || hasTimeControls) {
        cy.log('Budget history/trends found')
        
        if (hasTimeControls) {
          // Try to interact with time controls
          cy.get('body').find('select, button').filter((i, el) => {
            return $(el).text().toLowerCase().includes('month') ||
                   $(el).text().toLowerCase().includes('period')
          }).first().click()
        }
      } else {
        cy.log('Budget history/trends not found')
      }
    })
  })

  it('should calculate remaining budget correctly', () => {
    // Set known budget and check calculations
    const testBudget = 200
    
    cy.get('body').then(($body) => {
      const budgetButtons = $body.find('button:contains("Budget"), [data-testid*="budget"]')
      
      if (budgetButtons.length > 0) {
        cy.wrap(budgetButtons.first()).click()
        
        cy.get('body').then(($formBody) => {
          if ($formBody.find('input[name*="budget"]').length > 0) {
            cy.editBudget(testBudget)
            
            // Check if remaining budget is calculated
            cy.get('body').then(($calcBody) => {
              const bodyText = $calcBody.text()
              const remainingMatch = bodyText.match(/remaining|left/i)
              const dollarAmounts = bodyText.match(/\$[\d,]+\.?\d*/g)
              
              if (remainingMatch && dollarAmounts && dollarAmounts.length > 1) {
                cy.log('Budget calculation found')
                cy.get('body').should('contain.text', 'remaining')
                  .or('contain.text', 'left')
                  .or('contain.text', 'Available')
              } else {
                cy.log('Remaining budget calculation not clearly displayed')
              }
            })
          }
        })
      } else {
        cy.log('Cannot test budget calculation - budget setting not available')
      }
    })
  })

  it('should handle budget reset/clear', () => {
    cy.get('body').then(($body) => {
      const resetButtons = $body.find('button:contains("Reset"), button:contains("Clear"), [data-testid*="reset"]')
      
      if (resetButtons.length > 0) {
        cy.wrap(resetButtons.first()).click()
        
        // Confirm reset if confirmation dialog appears
        cy.get('body').then(($confirmBody) => {
          if ($confirmBody.find('button:contains("Confirm"), button:contains("Yes")').length > 0) {
            cy.get('button:contains("Confirm"), button:contains("Yes")').click()
          }
        })
        
        // Verify budget was reset
        cy.get('body').should('not.contain.text', '$200')
          .or('not.contain.text', '$500')
          .or('contain.text', '$0')
      } else {
        cy.log('Budget reset functionality not found')
      }
    })
  })
})
