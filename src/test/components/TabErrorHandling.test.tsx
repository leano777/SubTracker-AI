import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { SimpleErrorBoundary } from '../../components/SimpleErrorBoundary';
import { DashboardTab, preloadCriticalTabs } from '../../components/LazyRoutes';

import {
  renderTabInIsolation,
  waitForTabToLoad,
  cleanupTabTest,
  mockWindowLocation,
  createErrorThrowingComponent,
  TestWrapper
} from '../tab-isolation.utils';

describe('Tab Error Handling and Preloading', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanupTabTest();
  });

  describe('Error Boundary Integration', () => {
    it('should catch and display errors from tab components', async () => {
      const ErrorTab = () => {
        throw new Error('Simulated tab error');
      };

      const { rerender } = renderTabInIsolation(ErrorTab);

      // Error boundary should catch the error and show fallback UI
      await waitFor(() => {
        expect(screen.getByText(/Tab Error/)).toBeInTheDocument();
        expect(screen.getByText(/Retry Loading/)).toBeInTheDocument();
      });

      // Test error recovery by remounting component
      rerender(
        <TestWrapper>
          <SimpleErrorBoundary>
            <DashboardTab />
          </SimpleErrorBoundary>
        </TestWrapper>
      );

      await waitForTabToLoad('Dashboard');
      expect(screen.queryByText(/Tab Error/)).not.toBeInTheDocument();
    });

    it('should handle errors during lazy loading', async () => {
      // Mock import failure
      vi.doMock('../../components/DashboardTab', () => {
        throw new Error('Failed to load module');
      });

      renderTabInIsolation(DashboardTab);

      await waitFor(() => {
        expect(screen.getByText(/Tab Error/)).toBeInTheDocument();
      });
    });

    it('should show retry button in error fallback UI', async () => {
      const { mockReload } = mockWindowLocation();
      const ErrorComponent = createErrorThrowingComponent('Test error');

      renderTabInIsolation(ErrorComponent);

      const retryButton = await screen.findByText(/Retry/);
      retryButton.click();

      expect(mockReload).toHaveBeenCalled();
    });

    it('should preserve error details during development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const ErrorComponent = createErrorThrowingComponent('Detailed error message');
      renderTabInIsolation(ErrorComponent);

      await waitFor(() => {
        expect(screen.getByText(/Detailed error message/)).toBeInTheDocument();
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not show error details in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const ErrorComponent = createErrorThrowingComponent('Detailed error message');
      renderTabInIsolation(ErrorComponent);

      await waitFor(() => {
        expect(screen.queryByText(/Detailed error message/)).not.toBeInTheDocument();
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Preloading and Code Splitting', () => {
    it('should preload critical tabs without errors', () => {
      expect(() => preloadCriticalTabs()).not.toThrow();
    });

    it('should handle preloading failures gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn');

      // Mock an import failure
      vi.doMock('../../components/DashboardTab', () => 
        Promise.reject(new Error('Network error'))
      );

      preloadCriticalTabs();

      // Should log warning but not crash
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should not block rendering when preloading fails', async () => {
      // Mock failing imports
      vi.doMock('../../components/DashboardTab', () => 
        Promise.reject(new Error('Network error'))
      );
      vi.doMock('../../components/SubscriptionsUnifiedTab', () => 
        Promise.reject(new Error('Network error'))
      );

      preloadCriticalTabs();

      // Component should still render
      renderTabInIsolation(DashboardTab);
      await waitForTabToLoad('Dashboard');

      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should show loading state during tab load', async () => {
      // Mock delayed import
      vi.doMock('../../components/DashboardTab', () => ({
        DashboardTab: new Promise(resolve => 
          setTimeout(() => resolve({ default: () => <div>Loaded</div> }), 500)
        )
      }));

      renderTabInIsolation(DashboardTab);

      // Should show loading state
      expect(screen.getByText(/Loading/)).toBeInTheDocument();

      // Should eventually load
      await waitForTabToLoad('Dashboard');
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
    });

    it('should handle rapid navigation between tabs', async () => {
      const { rerender } = renderTabInIsolation(DashboardTab);

      // Quickly switch between tabs
      rerender(<TestWrapper><DashboardTab /></TestWrapper>);
      rerender(<TestWrapper><DashboardTab /></TestWrapper>);
      rerender(<TestWrapper><DashboardTab /></TestWrapper>);

      // Should eventually stabilize
      await waitForTabToLoad('Dashboard');
      expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Error/)).not.toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should allow clearing local data when error occurs', async () => {
      const { mockReload } = mockWindowLocation();
      const mockStorage = {
        localStorage: {
          clear: vi.fn(),
        },
        sessionStorage: {
          clear: vi.fn(),
        },
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockStorage.localStorage,
      });
      Object.defineProperty(window, 'sessionStorage', {
        value: mockStorage.sessionStorage,
      });

      const ErrorComponent = createErrorThrowingComponent();
      renderTabInIsolation(ErrorComponent);

      // Find and click "Clear Data & Reload" button
      const clearDataButton = await screen.findByText(/Clear Data & Reload/);
      clearDataButton.click();

      // Should clear storage and reload
      expect(mockStorage.localStorage.clear).toHaveBeenCalled();
      expect(mockStorage.sessionStorage.clear).toHaveBeenCalled();
      expect(mockReload).toHaveBeenCalled();
    });

    it('should handle multiple error boundaries correctly', async () => {
      // Create nested error boundaries
      const NestedErrorComponent = () => (
        <SimpleErrorBoundary>
          <SimpleErrorBoundary>
            {createErrorThrowingComponent()()}
          </SimpleErrorBoundary>
        </SimpleErrorBoundary>
      );

      renderTabInIsolation(NestedErrorComponent);

      // Should only show one error UI
      const errorMessages = await screen.findAllByText(/Error/);
      expect(errorMessages.length).toBe(1);
    });

    it('should preserve app shell when tab errors occur', async () => {
      const ErrorComponent = createErrorThrowingComponent();
      
      renderTabInIsolation(ErrorComponent);

      // App shell should remain intact
      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
      
      // Error boundary should contain the error
      expect(screen.getByText(/Error/)).toBeInTheDocument();
    });
  });
});
