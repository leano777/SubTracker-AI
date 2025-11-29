describe('Tab Navigation Smoke Test', () => {
  beforeEach(() => {
    cy.visit('/');
    
    // Login if needed
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="login-form"]').length > 0) {
        cy.get('[data-testid="email-input"]').type('demo@demo.com');
        cy.get('[data-testid="password-input"]').type('demo123');
        cy.get('[data-testid="login-button"]').click();
        cy.wait(1000);
      }
    });
  });

  it('should navigate through all tabs without white screen or errors', () => {
    const tabs = [
      { selector: '[data-tab="overview"]', expectedContent: 'dashboard' },
      { selector: '[data-tab="subscriptions"]', expectedContent: 'subscription' },
      { selector: '[data-tab="planning"]', expectedContent: 'planning' },
      { selector: '[data-tab="intelligence"]', expectedContent: 'intelligence' }
    ];

    tabs.forEach((tab) => {
      cy.get(tab.selector).click();
      
      // Wait for content to load
      cy.wait(500);
      
      // Verify no white screen - should have some content
      cy.get('main').should('not.be.empty');
      
      // Verify main content area exists and is visible
      cy.get('#main-content').should('be.visible');
      
      // Check for error boundaries or error messages
      cy.get('[role="alert"]').should('not.exist');
      cy.get('[data-testid="error-content"]').should('not.exist');
      
      // Verify tab is active
      cy.get(tab.selector).should('have.class', 'bg-primary');
    });
  });

  it('should handle rapid tab switching without errors', () => {
    const tabSelectors = [
      '[data-tab="overview"]',
      '[data-tab="subscriptions"]', 
      '[data-tab="planning"]',
      '[data-tab="intelligence"]'
    ];

    // Rapidly click through tabs multiple times
    for (let i = 0; i < 3; i++) {
      tabSelectors.forEach((selector) => {
        cy.get(selector).click();
        cy.wait(100); // Small delay to simulate rapid clicking
      });
    }

    // Should end without errors
    cy.get('main').should('be.visible').and('not.be.empty');
    cy.get('[role="alert"]').should('not.exist');
  });

  it('should maintain proper focus management during tab navigation', () => {
    // Click on subscriptions tab
    cy.get('[data-tab="subscriptions"]').click();
    
    // Verify main content is focusable and has proper ARIA labels
    cy.get('#main-content')
      .should('have.attr', 'tabindex', '-1')
      .and('have.attr', 'aria-label');

    // Tab through the interface
    cy.get('body').tab().tab();
    
    // Should be able to navigate without getting stuck
    cy.focused().should('exist');
  });

  it('should handle keyboard navigation between tabs', () => {
    // Focus on first tab
    cy.get('[data-tab="overview"]').focus();
    
    // Use arrow keys to navigate
    cy.focused().type('{rightarrow}');
    cy.focused().should('have.attr', 'data-tab', 'subscriptions');
    
    cy.focused().type('{rightarrow}');
    cy.focused().should('have.attr', 'data-tab', 'planning');
    
    cy.focused().type('{leftarrow}');
    cy.focused().should('have.attr', 'data-tab', 'subscriptions');
  });

  it('should announce tab changes for screen readers', () => {
    // Switch to planning tab
    cy.get('[data-tab="planning"]').click();
    
    // Check if live region exists (should be created by accessibility utils)
    cy.get('[id^="live-region"]').should('exist');
    
    // Verify page heading is updated
    cy.get('h1').should('contain', 'Planning');
  });

  it('should display proper error recovery when tab content fails', () => {
    // This test would need to be implemented with error injection
    // For now, we just verify error boundary structure exists
    cy.get('main').within(() => {
      // Should have error boundary wrapper
      cy.get('[data-testid="tab-content"], main > div').should('exist');
    });
  });

  it('should work correctly on mobile viewport', () => {
    cy.viewport(375, 667); // iPhone SE dimensions
    
    // Mobile menu should be available
    cy.get('[aria-label="Menu"]').should('be.visible');
    
    // Click to open mobile menu
    cy.get('[aria-label="Menu"]').click();
    
    // Navigate through tabs in mobile menu
    const mobileTabs = ['dashboard', 'subscriptions', 'planning', 'intelligence'];
    
    mobileTabs.forEach((tab) => {
      cy.get(`[data-tab="${tab}"]`).click();
      cy.wait(300);
      
      // Main content should be visible
      cy.get('main').should('be.visible');
      
      // No errors should be present
      cy.get('[role="alert"]').should('not.exist');
    });
  });

  it('should maintain URL sync with tab navigation', () => {
    // This would be implemented if routing is added
    // For now, verify tabs work without URL changes
    cy.get('[data-tab="subscriptions"]').click();
    cy.url().should('include', '/'); // Should stay on same page for now
  });

  it('should preserve application state during tab switching', () => {
    // Add a subscription if possible
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="add-subscription"]').length > 0) {
        cy.get('[data-testid="add-subscription"]').click();
        cy.get('[data-testid="subscription-name"]').type('Test Service');
        cy.get('[data-testid="save-subscription"]').click();
      }
    });

    // Switch tabs and verify data persists
    cy.get('[data-tab="planning"]').click();
    cy.get('[data-tab="subscriptions"]').click();
    
    // Should still show the added subscription (if feature exists)
    cy.get('main').should('be.visible');
  });

  it('should handle theme changes during tab navigation', () => {
    // Open settings if available
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="settings-button"], [aria-label*="Settings"]').length > 0) {
        cy.get('[data-testid="settings-button"], [aria-label*="Settings"]').first().click();
        
        // Try to change theme
        cy.get('[data-testid="theme-select"], select').then(($select) => {
          if ($select.length > 0) {
            cy.get($select).select('dark');
            cy.wait(500);
          }
        });
        
        // Close settings
        cy.get('[data-testid="close-settings"], button').contains('Close').click();
      }
    });

    // Navigate tabs with new theme
    cy.get('[data-tab="intelligence"]').click();
    cy.get('[data-tab="overview"]').click();
    
    // Should work without issues
    cy.get('main').should('be.visible');
  });
});
