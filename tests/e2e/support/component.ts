// ***********************************************************
// This example support/component.ts is processed and loaded 
// automatically before your component test files.
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

import { mount } from '@cypress/react18'
import './commands'

// Import global styles
import '../../../src/styles/globals.css'

// Mount React components for component testing
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)

// Configure component testing
beforeEach(() => {
  // Set up any global component test configuration here
})

// Example component test utilities
Cypress.Commands.add('mountWithTheme', (component: React.ReactNode, theme: 'light' | 'dark' = 'light') => {
  return cy.mount(
    <div className={theme === 'dark' ? 'dark' : ''}>
      {component}
    </div>
  )
})

// Extend Cypress namespace for component testing
declare global {
  namespace Cypress {
    interface Chainable {
      mountWithTheme(component: React.ReactNode, theme?: 'light' | 'dark'): Chainable<any>
    }
  }
}
