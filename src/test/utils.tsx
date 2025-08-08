import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import React from "react";
import type { ReactNode } from "react";
import { vi } from "vitest";

import { AuthProvider } from "../contexts/AuthContext";
import type { AppSettings, Notification } from "../types/constants";
import type { FullSubscription, FullPaymentCard } from "../types/subscription";

// Mock data generators
export const createMockSubscription = (
  overrides: Partial<FullSubscription> = {}
): FullSubscription => ({
  id: "test-sub-1",
  name: "Test Subscription",
  price: 9.99,
  frequency: "monthly",
  nextPayment: "2024-01-15",
  category: "Entertainment",
  status: "active",
  dateAdded: "2024-01-01",
  description: "A test subscription",
  website: "https://test.com",
  tags: ["test"],
  ...overrides,
});

export const createMockPaymentCard = (
  overrides: Partial<FullPaymentCard> = {}
): FullPaymentCard => ({
  id: "test-card-1",
  name: "Test Card",
  lastFourDigits: "1234",
  expiryMonth: 12,
  expiryYear: 2025,
  provider: "visa",
  isDefault: true,
  dateAdded: "2024-01-01",
  ...overrides,
});

export const createMockAppSettings = (overrides: Partial<AppSettings> = {}): AppSettings => ({
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
    defaultView: "dashboard",
    showCancelled: true,
    groupByCategory: false,
    darkMode: false,
    showFavicons: true,
    theme: "light",
  },
  ...overrides,
});

export const createMockNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: "test-notification-1",
  type: "info",
  title: "Test Notification",
  message: "This is a test notification",
  timestamp: new Date().toISOString(),
  read: false,
  ...overrides,
});

// Mock user data
export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  createdAt: "2024-01-01T00:00:00Z",
};

export const mockSession = {
  access_token:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QtcmVmIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJpYXQiOjE2OTkxMjgwMDAsImV4cCI6MTk5OTEzMjgwMCwic3ViIjoidGVzdC11c2VyLWlkIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.test-signature",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "test-refresh-token",
  user: mockUser,
};

// Mock Auth Context Provider
export const MockAuthProvider: React.FC<{
  children: ReactNode;
  value?: Partial<any>;
}> = ({ children, value = {} }) => {
  const defaultValue = {
    user: mockUser,
    loading: false,
    error: null,
    isAuthenticated: true,
    googleAuthAvailable: true,
    session: mockSession,
    signIn: vi.fn().mockResolvedValue({ success: true }),
    signUp: vi.fn().mockResolvedValue({ success: true }),
    signInWithGoogle: vi.fn().mockResolvedValue({ success: true }),
    signOut: vi.fn().mockResolvedValue({ success: true }),
    forceSignOut: vi.fn().mockResolvedValue({ success: true }),
    resetPassword: vi.fn().mockResolvedValue({ success: true }),
    ...value,
  };

  return <AuthProvider>{children}</AuthProvider>;
};

// Custom render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    authValue = {},
    ...renderOptions
  }: {
    authValue?: Partial<any>;
  } & Omit<RenderOptions, "wrapper"> = {}
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return <MockAuthProvider value={authValue}>{children}</MockAuthProvider>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Hook testing utilities
export const createHookWrapper = ({ authValue = {} }: { authValue?: Partial<any> } = {}) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MockAuthProvider value={authValue}>{children}</MockAuthProvider>;
  };
};

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  await new Promise((resolve) => setTimeout(resolve, 0)); // Let React finish rendering
  const end = performance.now();
  return end - start;
};

// Mock timers utilities
export const advanceTimersByTime = (ms: number) => {
  vi.advanceTimersByTime(ms);
};

export const runAllTimers = () => {
  vi.runAllTimers();
};

// Local storage testing utilities
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
    store, // Access to the underlying store for testing
  };
};

// Data sync manager mock
export const mockDataSyncManager = {
  loadFromCloud: vi.fn(),
  saveToCloud: vi.fn(),
  addSyncListener: vi.fn(),
  removeSyncListener: vi.fn(),
  getLastSyncTime: vi.fn(),
  isOnline: vi.fn(() => true),
};

// Wait for async operations
export const waitForNextUpdate = () => new Promise((resolve) => setTimeout(resolve, 0));

// Custom matchers for testing
export const customMatchers = {
  toHaveValidSubscriptionData: (subscription: FullSubscription) => {
    const required = ["id", "name", "price", "frequency", "status", "dateAdded"];
    const missing = required.filter((field) => !subscription[field as keyof FullSubscription]);

    return {
      pass: missing.length === 0,
      message: () =>
        missing.length === 0
          ? `Expected subscription to be invalid`
          : `Expected subscription to have required fields: ${missing.join(", ")}`,
    };
  },

  toBeValidCurrency: (value: number) => {
    const isValid = typeof value === "number" && value >= 0 && Number.isFinite(value);

    return {
      pass: isValid,
      message: () =>
        isValid
          ? `Expected ${value} to be an invalid currency value`
          : `Expected ${value} to be a valid currency value (non-negative finite number)`,
    };
  },
};

// React 18 profiler utilities for performance testing
export const createProfiler = () => {
  const phases: string[] = [];
  const durations: number[] = [];

  const onRender = (
    id: string,
    phase: "mount" | "update",
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    phases.push(phase);
    durations.push(actualDuration);
  };

  return {
    onRender,
    getPhases: () => [...phases],
    getDurations: () => [...durations],
    getAverageDuration: () => durations.reduce((a, b) => a + b, 0) / durations.length || 0,
    getMaxDuration: () => Math.max(...durations) || 0,
    reset: () => {
      phases.length = 0;
      durations.length = 0;
    },
  };
};

// Test data sets for comprehensive testing
export const testDataSets = {
  subscriptions: {
    minimal: createMockSubscription(),
    withAllFields: createMockSubscription({
      description: "Complete subscription with all fields",
      website: "https://complete.example.com",
      tags: ["complete", "test", "full"],
      notes: "Test notes",
      trialEndDate: "2024-02-01",
      reminderDays: 3,
      isStarred: true,
      variablePricing: {
        minPrice: 5.99,
        maxPrice: 19.99,
        averagePrice: 12.99,
      },
      automationEnabled: true,
      automationRules: {
        cancelBeforeRenewal: false,
        upgradeThreshold: 100,
        downgradeThreshold: 50,
      },
      businessExpense: true,
      taxDeductible: true,
      priority: "essential",
    }),
    cancelled: createMockSubscription({
      status: "cancelled",
      cancelledDate: "2024-01-10",
    }),
    watchlist: createMockSubscription({
      status: "watchlist",
      notes: "Considering this subscription",
    }),
    expired: createMockSubscription({
      nextPayment: "2023-12-01",
    }),
  },
  paymentCards: {
    minimal: createMockPaymentCard(),
    withAllFields: createMockPaymentCard({
      nickname: "Primary Business Card",
      color: "#3b82f6",
      billingAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "TS",
        zipCode: "12345",
        country: "US",
      },
      creditLimit: 5000,
      availableCredit: 4500,
      statementDate: 15,
      paymentDueDate: 5,
    }),
  },
};

export { render };
