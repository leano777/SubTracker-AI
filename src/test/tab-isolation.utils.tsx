import { vi, expect } from 'vitest';
import { render, waitFor, screen, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock data factories for consistent testing
export const createMockSubscriptions = (count = 2) => 
  Array.from({ length: count }, (_, i) => ({
    id: `test-sub-${i + 1}`,
    name: `Test Subscription ${i + 1}`,
    price: 9.99 + i * 5,
    frequency: 'monthly' as const,
    nextPayment: '2024-01-15',
    status: 'active' as const,
    dateAdded: '2024-01-01',
    category: 'Test'
  }));

export const createMockPaymentCards = (count = 1) => 
  Array.from({ length: count }, (_, i) => ({
    id: `card-${i + 1}`,
    name: `Test Card ${i + 1}`,
    lastFour: `123${i}`,
    type: 'Visa' as const,
    dateAdded: '2024-01-01'
  }));

export const createMockSettings = () => ({
  notifications: {
    upcomingPayments: true,
    highSpending: true,
    weeklyReports: false,
    trialExpirations: true,
  },
  thresholds: {
    highSpendingAmount: 200,
    upcomingPaymentDays: 7,
    trialReminderDays: 3,
  },
  preferences: {
    defaultView: 'dashboard' as const,
    showCancelled: true,
    groupByCategory: false,
    darkMode: false,
    showFavicons: true,
    theme: 'light' as const,
  },
});

export const createMockNotifications = (count = 1) => 
  Array.from({ length: count }, (_, i) => ({
    id: `notif-${i + 1}`,
    message: `Test notification ${i + 1}`,
    type: 'upcoming_payment' as const,
    read: false,
    timestamp: new Date().toISOString()
  }));

export const createMockWeeklyBudgets = (count = 1) => 
  Array.from({ length: count }, (_, i) => ({
    id: `budget-${i + 1}`,
    week: `2024-W${(i + 3).toString().padStart(2, '0')}`,
    budget: 100 + i * 50,
    spent: 25.98 + i * 10
  }));

// Tab-specific test helpers
export const createTabHandlers = () => ({
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onCancel: vi.fn(),
  onReactivate: vi.fn(),
  onActivateFromWatchlist: vi.fn(),
  onAddNew: vi.fn(),
  onAddToWatchlist: vi.fn(),
  onViewSubscription: vi.fn(),
  onUpdateSubscriptionDate: vi.fn(),
  onUpdateCategories: vi.fn(),
});

// Test wrapper component
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  </BrowserRouter>
);

// Helper to test tab isolation
export const renderTabInIsolation = (TabComponent: React.ComponentType<any>, props = {}) => {
  const defaultProps = {
    subscriptions: createMockSubscriptions(),
    cards: createMockPaymentCards(),
    settings: createMockSettings(),
    notifications: createMockNotifications(),
    weeklyBudgets: createMockWeeklyBudgets(),
    ...createTabHandlers(),
    ...props
  };

  return render(
    <TestWrapper>
      <TabComponent {...defaultProps} />
    </TestWrapper>
  );
};

// Helper to wait for lazy components to load
export const waitForTabToLoad = async (tabName: string, timeout = 10000) => {
  await waitFor(
    () => {
      expect(screen.queryByText(`Loading ${tabName}`)).not.toBeInTheDocument();
      expect(screen.queryByText(`${tabName} Tab Error`)).not.toBeInTheDocument();
    },
    { timeout }
  );
};

// Error testing helpers
export const createErrorThrowingComponent = (errorMessage = 'Test error') => {
  return () => {
    throw new Error(errorMessage);
  };
};

// Mock window location for testing
export const mockWindowLocation = () => {
  const mockReload = vi.fn();
  Object.defineProperty(window, 'location', {
    value: { 
      reload: mockReload,
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000'
    },
    writable: true
  });
  return { mockReload };
};

// Reset test environment
export const cleanupTabTest = () => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
};

// Performance testing helpers
export const createLargeDataset = (type: 'subscriptions' | 'cards' | 'notifications' | 'budgets', size = 1000) => {
  switch (type) {
    case 'subscriptions':
      return createMockSubscriptions(size);
    case 'cards':
      return createMockPaymentCards(size);
    case 'notifications':
      return createMockNotifications(size);
    case 'budgets':
      return createMockWeeklyBudgets(size);
    default:
      return [];
  }
};
