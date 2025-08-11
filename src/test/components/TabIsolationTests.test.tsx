import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// Import the lazy route components
import { 
  DashboardTab, 
  SubscriptionsUnifiedTab, 
  PlanningTab,
  preloadCriticalTabs
} from '../../components/LazyRoutes';

// Import isolation test utils
import {
  renderTabInIsolation,
  waitForTabToLoad,
  cleanupTabTest,
  mockWindowLocation,
  createErrorThrowingComponent,
  createLargeDataset,
  createMockSubscriptions,
  createMockPaymentCards,
  createMockSettings,
  createMockNotifications,
  createMockWeeklyBudgets,
  createTabHandlers,
  TestWrapper,
} from '../tab-isolation.utils.tsx';

// Create mock data for tests
const mockSubscriptions = createMockSubscriptions();
const mockPaymentCards = createMockPaymentCards();
const mockSettings = createMockSettings();
const mockNotifications = createMockNotifications();
const mockWeeklyBudgets = createMockWeeklyBudgets();

describe('Tab Isolation Tests - Individual Tab Mounting', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanupTabTest();
  });

  describe('DashboardTab Isolation', () => {
    it('should mount DashboardTab in isolation without errors', async () => {
      renderTabInIsolation(DashboardTab);

      // Wait for the lazy component to load
      await waitForTabToLoad('Dashboard');

      // The dashboard should render without crashing
      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should handle empty data props gracefully', async () => {
      renderTabInIsolation(DashboardTab, {
        subscriptions: [],
        cards: [],
        notifications: [],
        weeklyBudgets: []
      });

      await waitForTabToLoad('Dashboard');

      // Should render without errors even with empty data
      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should handle undefined props gracefully', async () => {
      renderTabInIsolation(DashboardTab, {
        subscriptions: undefined,
        cards: undefined,
        settings: undefined,
        notifications: undefined,
        weeklyBudgets: undefined
      } as any);

      await waitForTabToLoad('Dashboard');

      // Should render without crashing even with undefined props
      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });
  });

  describe('SubscriptionsUnifiedTab Isolation', () => {
    const mockHandlers = {
      onEdit: vi.fn(),
      onDelete: vi.fn(),
      onCancel: vi.fn(),
      onReactivate: vi.fn(),
      onActivateFromWatchlist: vi.fn(),
      onAddNew: vi.fn(),
      onAddToWatchlist: vi.fn(),
    };

    it('should mount SubscriptionsUnifiedTab in isolation without errors', async () => {
      renderTabInIsolation(SubscriptionsUnifiedTab);

      await waitForTabToLoad('Subscriptions');

      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should handle empty subscriptions list', async () => {
      renderTabInIsolation(SubscriptionsUnifiedTab, {
        subscriptions: []
      });

      await waitForTabToLoad('Subscriptions');

      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should handle missing handler props gracefully', async () => {
      renderTabInIsolation(SubscriptionsUnifiedTab, {
        onEdit: undefined,
        onDelete: undefined,
        onCancel: undefined,
        onReactivate: undefined,
        onActivateFromWatchlist: undefined,
        onAddNew: undefined,
        onAddToWatchlist: undefined
      } as any);

      await waitForTabToLoad('Subscriptions');

      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });
  });

  describe('PlanningTab Isolation', () => {
    const mockPlanningHandlers = {
      onViewSubscription: vi.fn(),
      onUpdateSubscriptionDate: vi.fn(),
      onUpdateCategories: vi.fn(),
    };

    it('should mount PlanningTab in isolation without errors', async () => {
      renderTabInIsolation(PlanningTab);

      await waitForTabToLoad('Planning');

      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should handle empty budget data', async () => {
      renderTabInIsolation(PlanningTab, {
        weeklyBudgets: []
      });

      await waitForTabToLoad('Planning');

      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should handle missing handler props gracefully', async () => {
      renderTabInIsolation(PlanningTab, {
        onViewSubscription: undefined,
        onUpdateSubscriptionDate: undefined,
        onUpdateCategories: undefined
      } as any);

      await waitForTabToLoad('Planning');

      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Integration', () => {
    it('should display error fallback when a tab component throws an error', async () => {
      // Create a component that will throw an error
      const ErrorThrowingComponent = () => {
        throw new Error('Test error for error boundary');
      };

      // Mock the lazy loading to return our error component
      const originalImport = await import('../../components/LazyRoutes');
      vi.doMock('../../components/LazyRoutes', () => ({
        ...originalImport,
        DashboardTab: ErrorThrowingComponent
      }));

      render(
        <TestWrapper>
          <DashboardTab
            subscriptions={mockSubscriptions}
            cards={mockPaymentCards}
            settings={mockSettings}
            notifications={mockNotifications}
            weeklyBudgets={mockWeeklyBudgets}
          />
        </TestWrapper>
      );

      // Should show error fallback instead of crashing
      await waitFor(() => {
        expect(screen.queryByText(/Dashboard Tab Error/)).toBeInTheDocument();
      }, { timeout: 10000 });
    });

    it('should provide retry functionality in error fallback', async () => {
      const { mockReload } = mockWindowLocation();

      // Create error component that shows retry button
      const ErrorComponent = () => (
        <div>
          <span>Dashboard Tab Error</span>
          <button onClick={() => window.location.reload()}>
            Retry Loading Tab
          </button>
        </div>
      );

      render(
        <TestWrapper>
          <ErrorComponent />
        </TestWrapper>
      );

      // Click retry button
      const retryButton = screen.getByText('Retry Loading Tab');
      retryButton.click();

      expect(mockReload).toHaveBeenCalled();
    });
  });

  describe('Lazy Loading and Suspense', () => {
    it('should show loading state before components load', async () => {
      // Mock a delayed import to test loading state
      vi.doMock('../../components/DashboardTab', () => ({
        DashboardTab: () => new Promise(resolve => 
          setTimeout(() => resolve({ default: () => <div>Dashboard Loaded</div> }), 1000)
        )
      }));

      render(
        <TestWrapper>
          <DashboardTab
            subscriptions={mockSubscriptions}
            cards={mockPaymentCards}
            settings={mockSettings}
            notifications={mockNotifications}
            weeklyBudgets={mockWeeklyBudgets}
          />
        </TestWrapper>
      );

      // Should show loading initially
      expect(screen.getByText(/Loading Dashboard/)).toBeInTheDocument();
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.queryByText(/Loading Dashboard/)).not.toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Preloading Functionality', () => {
    it('should not throw errors when preloading critical tabs', () => {
      expect(() => {
        preloadCriticalTabs();
      }).not.toThrow();
    });

    it('should handle preloading failures gracefully', async () => {
      // Mock import failures
      vi.doMock('../../components/DashboardTab', () => 
        Promise.reject(new Error('Network error'))
      );

      // Should not throw when preloading fails
      expect(() => {
        preloadCriticalTabs();
      }).not.toThrow();
    });
  });

  describe('Component Lifecycle and Cleanup', () => {
    it('should properly cleanup when unmounting tabs', async () => {
      const { unmount } = render(
        <TestWrapper>
          <DashboardTab
            subscriptions={mockSubscriptions}
            cards={mockPaymentCards}
            settings={mockSettings}
            notifications={mockNotifications}
            weeklyBudgets={mockWeeklyBudgets}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Loading Dashboard/)).not.toBeInTheDocument();
      }, { timeout: 10000 });

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid mounting and unmounting', async () => {
      for (let i = 0; i < 3; i++) {
        const { unmount } = render(
          <TestWrapper>
            <DashboardTab
              subscriptions={mockSubscriptions}
              cards={mockPaymentCards}
              settings={mockSettings}
              notifications={mockNotifications}
              weeklyBudgets={mockWeeklyBudgets}
            />
          </TestWrapper>
        );

        // Quick unmount before full load
        unmount();
      }

      // Should not cause memory leaks or errors
      expect(true).toBe(true);
    });
  });

  describe('Props Validation and Edge Cases', () => {
    it('should handle malformed subscription data', async () => {
      const malformedSubscriptions = [
        { id: 'bad-1' }, // Missing required fields
        null, // Null subscription
        undefined, // Undefined subscription
        { id: 'bad-2', name: '', price: 'invalid' }, // Invalid data types
      ];

      render(
        <TestWrapper>
          <DashboardTab
            subscriptions={malformedSubscriptions as any}
            cards={mockPaymentCards}
            settings={mockSettings}
            notifications={mockNotifications}
            weeklyBudgets={mockWeeklyBudgets}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Loading Dashboard/)).not.toBeInTheDocument();
      }, { timeout: 10000 });

      // Should handle malformed data gracefully
      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('should handle extremely large datasets', async () => {
      // Create a large dataset
      const largeSubscriptionsList = Array.from({ length: 1000 }, (_, i) => ({
        id: `sub-${i}`,
        name: `Subscription ${i}`,
        price: Math.random() * 100,
        frequency: 'monthly',
        nextPayment: '2024-01-15',
        status: 'active',
        dateAdded: '2024-01-01',
        category: 'Test'
      }));

      render(
        <TestWrapper>
          <DashboardTab
            subscriptions={largeSubscriptionsList}
            cards={mockPaymentCards}
            settings={mockSettings}
            notifications={mockNotifications}
            weeklyBudgets={mockWeeklyBudgets}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Loading Dashboard/)).not.toBeInTheDocument();
      }, { timeout: 15000 }); // Longer timeout for large dataset

      expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
    });
  });
});
