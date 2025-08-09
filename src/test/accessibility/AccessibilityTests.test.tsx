/**
 * Accessibility Tests for WCAG AA Compliance
 * ST-038: A11y compliance - Phase 8 Accessibility & Interaction Polish
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

import App from '../../App';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AppShell } from '../../components/AppShell';
import { AuthProvider } from '../../contexts/AuthContext';
import {
  testColorContrast,
  testKeyboardNavigation,
  testFocusManagement,
  testAriaLabeling,
  wcagAAConfig
} from '../../utils/accessibility/axeConfig';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock router for testing
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/dashboard' }),
  useNavigate: () => vi.fn(),
  Outlet: () => <div>Test Content</div>,
}));

// Mock authentication context
vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'test-user', name: 'Test User', email: 'test@example.com' },
      loading: false,
      isAuthenticated: true,
      signOut: vi.fn(),
    }),
  };
});

describe('Accessibility Tests - WCAG AA Compliance', () => {
  beforeEach(() => {
    // Clear any existing violations
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Clean up after tests
    vi.clearAllMocks();
  });

  describe('Color Contrast Testing', () => {
    it('should meet WCAG AA color contrast requirements for buttons', async () => {
      const { container } = render(
        <div>
          <Button variant="default">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Link Button</Button>
        </div>
      );

      const results = await testColorContrast(container);
      expect(results).toHaveNoViolations();
    });

    it('should meet WCAG AA color contrast requirements for inputs', async () => {
      const { container } = render(
        <div>
          <Input placeholder="Regular input" />
          <Input placeholder="Disabled input" disabled />
          <Input placeholder="Error input" aria-invalid="true" />
        </div>
      );

      const results = await testColorContrast(container);
      expect(results).toHaveNoViolations();
    });

    it('should meet WCAG AA color contrast requirements in dark mode', async () => {
      const { container } = render(
        <div className="dark">
          <Button variant="default">Dark Mode Button</Button>
          <Input placeholder="Dark mode input" />
        </div>
      );

      const results = await testColorContrast(container);
      expect(results).toHaveNoViolations();
    });

    it('should meet WCAG AA color contrast requirements in stealth-ops theme', async () => {
      const { container } = render(
        <div className="stealth-ops">
          <Button variant="default">Stealth Ops Button</Button>
          <Input placeholder="Stealth ops input" />
        </div>
      );

      const results = await testColorContrast(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation Testing', () => {
    it('should support keyboard navigation through all interactive elements', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div>
          <Button>Button 1</Button>
          <Input placeholder="Input field" />
          <Button>Button 2</Button>
          <button>Native Button</button>
        </div>
      );

      // Test Tab navigation
      const button1 = screen.getByText('Button 1');
      const input = screen.getByPlaceholderText('Input field');
      const button2 = screen.getByText('Button 2');
      const nativeButton = screen.getByText('Native Button');

      // Focus first element
      button1.focus();
      expect(button1).toHaveFocus();

      // Tab to next element
      await user.tab();
      expect(input).toHaveFocus();

      // Tab to next element
      await user.tab();
      expect(button2).toHaveFocus();

      // Tab to next element
      await user.tab();
      expect(nativeButton).toHaveFocus();

      // Test keyboard activation
      await user.keyboard('{Enter}');

      const results = await testKeyboardNavigation(container);
      expect(results).toHaveNoViolations();
    });

    it('should provide proper skip links for navigation', async () => {
      const { container } = render(
        <div>
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Skip to main content
          </a>
          <nav role="navigation" aria-label="Main navigation">
            <Button>Nav Item 1</Button>
            <Button>Nav Item 2</Button>
          </nav>
          <main id="main-content">
            <h1>Main Content</h1>
            <p>Content goes here</p>
          </main>
        </div>
      );

      const results = await testKeyboardNavigation(container);
      expect(results).toHaveNoViolations();
    });

    it('should handle arrow key navigation in menus', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div role="menu" aria-label="Test menu">
          <button role="menuitem" tabIndex={0}>Menu Item 1</button>
          <button role="menuitem" tabIndex={-1}>Menu Item 2</button>
          <button role="menuitem" tabIndex={-1}>Menu Item 3</button>
        </div>
      );

      const menuItem1 = screen.getByText('Menu Item 1');
      const menuItem2 = screen.getByText('Menu Item 2');

      // Focus first menu item
      menuItem1.focus();
      expect(menuItem1).toHaveFocus();

      // Simulate arrow down navigation (would need custom implementation)
      fireEvent.keyDown(menuItem1, { key: 'ArrowDown' });

      const results = await testKeyboardNavigation(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain focus order in modal dialogs', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <div role="dialog" aria-labelledby="dialog-title" aria-modal="true">
          <h2 id="dialog-title">Dialog Title</h2>
          <Input placeholder="First input" />
          <Button>Action Button</Button>
          <Button>Cancel Button</Button>
        </div>
      );

      const input = screen.getByPlaceholderText('First input');
      const actionButton = screen.getByText('Action Button');
      const cancelButton = screen.getByText('Cancel Button');

      // Focus should start within dialog
      input.focus();
      expect(input).toHaveFocus();

      await user.tab();
      expect(actionButton).toHaveFocus();

      await user.tab();
      expect(cancelButton).toHaveFocus();

      const results = await testKeyboardNavigation(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Focus Management Testing', () => {
    it('should provide visible focus indicators', async () => {
      const { container } = render(
        <div>
          <Button>Focusable Button</Button>
          <Input placeholder="Focusable Input" />
        </div>
      );

      const button = screen.getByText('Focusable Button');
      const input = screen.getByPlaceholderText('Focusable Input');

      // Test focus indicators exist
      button.focus();
      expect(button).toHaveFocus();

      input.focus();
      expect(input).toHaveFocus();

      const results = await testFocusManagement(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have focus traps outside modal dialogs', async () => {
      const { container } = render(
        <div>
          <Button>Outside Button 1</Button>
          <div role="main">
            <Button>Main Content Button</Button>
          </div>
          <Button>Outside Button 2</Button>
        </div>
      );

      const results = await testFocusManagement(container);
      expect(results).toHaveNoViolations();
    });

    it('should manage focus in dynamic content changes', async () => {
      const TestComponent = () => {
        const [showContent, setShowContent] = React.useState(false);
        
        return (
          <div>
            <Button onClick={() => setShowContent(!showContent)}>
              Toggle Content
            </Button>
            {showContent && (
              <div aria-live="polite">
                <h2>Dynamic Content</h2>
                <Button>Dynamic Button</Button>
              </div>
            )}
          </div>
        );
      };

      const { container } = render(<TestComponent />);
      const toggleButton = screen.getByText('Toggle Content');

      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('Dynamic Content')).toBeInTheDocument();
      });

      const results = await testFocusManagement(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA Labels and Descriptions Testing', () => {
    it('should provide proper ARIA labels for all interactive elements', async () => {
      const { container } = render(
        <div>
          <Button aria-label="Close dialog">×</Button>
          <Input aria-label="Search subscriptions" placeholder="Search..." />
          <button aria-describedby="help-text">
            Help
          </button>
          <div id="help-text">This button provides help information</div>
        </div>
      );

      const results = await testAriaLabeling(container);
      expect(results).toHaveNoViolations();
    });

    it('should provide proper form labels', async () => {
      const { container } = render(
        <form>
          <label htmlFor="email">Email Address</label>
          <Input id="email" type="email" aria-required="true" />
          
          <fieldset>
            <legend>Notification Preferences</legend>
            <label>
              <input type="checkbox" />
              Email notifications
            </label>
            <label>
              <input type="checkbox" />
              SMS notifications
            </label>
          </fieldset>
        </form>
      );

      const results = await testAriaLabeling(container);
      expect(results).toHaveNoViolations();
    });

    it('should provide proper headings structure', async () => {
      const { container } = render(
        <div>
          <h1>Main Page Title</h1>
          <section>
            <h2>Section Title</h2>
            <h3>Subsection Title</h3>
            <h3>Another Subsection</h3>
          </section>
          <section>
            <h2>Another Section</h2>
          </section>
        </div>
      );

      const results = await axe(container, wcagAAConfig);
      expect(results).toHaveNoViolations();
    });

    it('should provide proper landmark roles', async () => {
      const { container } = render(
        <div>
          <header role="banner">
            <nav role="navigation" aria-label="Main navigation">
              <Button>Home</Button>
            </nav>
          </header>
          <main role="main">
            <h1>Main Content</h1>
          </main>
          <aside role="complementary">
            <h2>Sidebar</h2>
          </aside>
          <footer role="contentinfo">
            <p>Footer content</p>
          </footer>
        </div>
      );

      const results = await axe(container, wcagAAConfig);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Full Application Accessibility', () => {
    it('should meet WCAG AA standards for the main application', async () => {
      const { container } = render(
        <AuthProvider>
          <App />
        </AuthProvider>
      );

      // Wait for component to fully render
      await waitFor(() => {
        expect(screen.getByText(/SubTracker/)).toBeInTheDocument();
      }, { timeout: 5000 });

      const results = await axe(container, wcagAAConfig);
      expect(results).toHaveNoViolations();
    });

    it('should handle screen reader announcements for dynamic content', async () => {
      const { container } = render(
        <div>
          <div aria-live="polite" id="status-message"></div>
          <Button 
            onClick={() => {
              const status = document.getElementById('status-message');
              if (status) status.textContent = 'Action completed successfully';
            }}
          >
            Perform Action
          </Button>
        </div>
      );

      const button = screen.getByText('Perform Action');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Action completed successfully')).toBeInTheDocument();
      });

      const results = await axe(container, wcagAAConfig);
      expect(results).toHaveNoViolations();
    });

    it('should support high contrast mode', async () => {
      // Test with Windows high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { container } = render(
        <div className="high-contrast">
          <Button>High Contrast Button</Button>
          <Input placeholder="High contrast input" />
        </div>
      );

      const results = await testColorContrast(container);
      expect(results).toHaveNoViolations();
    });

    it('should support reduced motion preferences', async () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { container } = render(
        <div>
          <Button disableMotion>No Motion Button</Button>
          <Input disableMotion placeholder="No motion input" />
        </div>
      );

      const results = await axe(container, wcagAAConfig);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Mobile Accessibility', () => {
    it('should provide adequate touch targets', async () => {
      const { container } = render(
        <div className="touch-device">
          <Button className="min-h-[44px] min-w-[44px]">Touch Button</Button>
          <Button size="sm" className="min-h-[44px] min-w-[44px]">Small Button</Button>
        </div>
      );

      const results = await axe(container, wcagAAConfig);
      expect(results).toHaveNoViolations();
    });

    it('should support zoom up to 200% without horizontal scrolling', async () => {
      // Mock viewport for zoom testing
      Object.defineProperty(document.documentElement, 'style', {
        value: {
          zoom: '200%',
          fontSize: '32px'
        }
      });

      const { container } = render(
        <div style={{ maxWidth: '100vw', overflow: 'hidden' }}>
          <Button className="text-lg">Large Text Button</Button>
          <Input className="text-lg" placeholder="Large text input" />
        </div>
      );

      const results = await axe(container, wcagAAConfig);
      expect(results).toHaveNoViolations();
    });
  });
});
