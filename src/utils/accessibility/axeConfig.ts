/**
 * Axe-Core Configuration for WCAG AA Compliance Testing
 * ST-038: A11y compliance - Phase 8 Accessibility & Interaction Polish
 */

// @ts-nocheck
import { toHaveNoViolations } from 'jest-axe';
import axe from 'axe-core';

// WCAG AA Configuration
export const wcagAAConfig = {
  rules: {
    // Color contrast rules (WCAG AA Level)
    'color-contrast': { enabled: true },
    'color-contrast-enhanced': { enabled: false }, // AAA level - disabled for AA compliance

    // Keyboard accessibility
    'tabindex': { enabled: true },
    'focus-order': { enabled: true },

    // ARIA rules
    'aria-allowed-attr': { enabled: true },
    'aria-allowed-role': { enabled: true },
    'aria-command-name': { enabled: true },
    'aria-hidden-body': { enabled: true },
    'aria-hidden-focus': { enabled: true },
    'aria-input-field-name': { enabled: true },
    'aria-label': { enabled: true },
    'aria-labelledby': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roledescription': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-toggle-field-name': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },

    // Form accessibility
    'label': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'input-button-name': { enabled: true },
    'input-image-alt': { enabled: true },

    // Heading structure
    'heading-order': { enabled: true },
    'empty-heading': { enabled: true },

    // Link accessibility
    'link-name': { enabled: true },
    'link-in-text-block': { enabled: true },

    // Image accessibility
    'image-alt': { enabled: true },
    'image-redundant-alt': { enabled: true },

    // List accessibility
    'list': { enabled: true },
    'listitem': { enabled: true },
    'definition-list': { enabled: true },
    'dlitem': { enabled: true },

    // Table accessibility
    'table-duplicate-name': { enabled: true },
    'table-fake-caption': { enabled: true },
    'td-has-header': { enabled: true },
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },

    // Language
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'valid-lang': { enabled: true },

    // Page structure
    'bypass': { enabled: true },
    'document-title': { enabled: true },
    'duplicate-id': { enabled: true },
    'duplicate-id-active': { enabled: true },
    'duplicate-id-aria': { enabled: true },

    // Landmarks
    'landmark-banner-is-top-level': { enabled: true },
    'landmark-complementary-is-top-level': { enabled: true },
    'landmark-contentinfo-is-top-level': { enabled: true },
    'landmark-main-is-top-level': { enabled: true },
    'landmark-no-duplicate-banner': { enabled: true },
    'landmark-no-duplicate-contentinfo': { enabled: true },
    'landmark-no-duplicate-main': { enabled: true },
    'landmark-one-main': { enabled: true },
    'landmark-unique': { enabled: true },

    // Audio/Video
    'audio-caption': { enabled: true },
    'video-caption': { enabled: true },
    'video-description': { enabled: true },

    // Motion and animation
    'meta-refresh': { enabled: true },
    'meta-viewport': { enabled: true },
    'meta-viewport-large': { enabled: true },

    // Focus management
    'no-autoplay-audio': { enabled: true },
    'scrollable-region-focusable': { enabled: true },
    'skip-link': { enabled: true },
  },

  // Tags to focus on for WCAG AA compliance
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  
  // Include best practices but not strict requirements
  disableOtherRules: false,

  // Reporter configuration
  reporter: 'v2',
  
  // Results configuration
  resultTypes: ['violations', 'incomplete', 'inapplicable', 'passes'],
  
  // Include/exclude configurations
  include: [['body']],
  exclude: [['.sr-only']], // Exclude screen reader only content from visual testing

  // Timing configuration
  timeout: 10000,
};

// Color contrast specific testing configuration
export const colorContrastConfig = {
  ...wcagAAConfig,
  rules: {
    'color-contrast': { 
      enabled: true,
      options: {
        // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
        noScroll: false,
        shadowOutlineEmulationEnabled: true,
        ignoreUnicode: true,
        ignoreLength: false,
        ignorePseudo: false,
      }
    }
  },
  tags: ['wcag2aa']
};

// Keyboard navigation specific configuration
export const keyboardNavConfig = {
  ...wcagAAConfig,
  rules: {
    'keyboard': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'tabindex': { enabled: true },
    'focusable-content': { enabled: true },
    'aria-hidden-focus': { enabled: true },
    'skip-link': { enabled: true },
    'scrollable-region-focusable': { enabled: true },
  },
  tags: ['wcag2a', 'wcag2aa', 'keyboard']
};

// Focus management configuration
export const focusManagementConfig = {
  ...wcagAAConfig,
  rules: {
    'focus-order-semantics': { enabled: true },
    'tabindex': { enabled: true },
    'focusable-content': { enabled: true },
    'aria-hidden-focus': { enabled: true },
    'skip-link': { enabled: true },
  }
};

// ARIA labeling configuration
export const ariaLabelingConfig = {
  ...wcagAAConfig,
  rules: {
    'aria-command-name': { enabled: true },
    'aria-input-field-name': { enabled: true },
    'aria-label': { enabled: true },
    'aria-labelledby': { enabled: true },
    'aria-toggle-field-name': { enabled: true },
    'button-name': { enabled: true },
    'input-button-name': { enabled: true },
    'link-name': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'label': { enabled: true },
  }
};

// Export default configuration for comprehensive testing
export default wcagAAConfig;

// Helper function to run axe tests with custom configuration
export const runAxeTest = async (
  element: Element | Document = document,
  config = wcagAAConfig
) => {
  const axe = await import('axe-core');
  return axe.run(element, config);
};

// Helper function for color contrast testing
export const testColorContrast = async (element: Element | Document = document) => {
  return runAxeTest(element, colorContrastConfig);
};

// Helper function for keyboard navigation testing
export const testKeyboardNavigation = async (element: Element | Document = document) => {
  return runAxeTest(element, keyboardNavConfig);
};

// Helper function for focus management testing
export const testFocusManagement = async (element: Element | Document = document) => {
  return runAxeTest(element, focusManagementConfig);
};

// Helper function for ARIA labeling testing
export const testAriaLabeling = async (element: Element | Document = document) => {
  return runAxeTest(element, ariaLabelingConfig);
};
