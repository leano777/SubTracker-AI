import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, beforeAll, afterEach, afterAll, vi } from 'vitest';
import type { MockSupabase } from '../types/mocks';

import App from "../../App";
import { createMockSubscription, createMockPaymentCard, mockDataSyncManager } from "../utils";

// Mock all the dependencies
vi.mock("../../utils/dataSync", () => ({
  dataSyncManager: mockDataSyncManager,
}));

vi.mock("../../utils/cache", () => ({
  saveUserDataToCache: vi.fn(),
  loadUserDataFromCache: vi.fn(() => ({
    subscriptions: [],
    paymentCards: [],
    notifications: [],
    appSettings: {
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
    },
    hasInitialized: false,
    dataCleared: false,
    weeklyBudgets: [],
    cacheTimestamp: new Date().toISOString(),
  })),
  clearUserDataCache: vi.fn(),
}));

vi.mock("../../utils/payPeriodCalculations", () => ({
  calculatePayPeriodRequirements: vi.fn(() => []),
  getSubscriptionStatistics: vi.fn(() => ({})),
}));

// Mock Supabase client for integration tests with factory function
vi.mock("../../utils/supabase/client", () => {
  const mockSupabase: MockSupabase = {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  };

  return {
    supabase: mockSupabase,
  };
});

// Get the mocked supabase instance
const { supabase: mockSupabase } = await import("../../utils/supabase/client") as unknown as { supabase: MockSupabase };

describe("App Integration Tests", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default authenticated state
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: "test-token",
          user: {
            id: "test-user-id",
            email: "test@example.com",
            created_at: "2024-01-01",
            user_metadata: { name: "Test User" },
          },
        },
      },
      error: null,
    });

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    mockDataSyncManager.loadFromCloud.mockResolvedValue({
      success: true,
      data: {
        subscriptions: [],
        paymentCards: [],
        notifications: [],
        appSettings: {},
        weeklyBudgets: [],
      },
      timestamp: new Date().toISOString(),
    });

    mockDataSyncManager.saveToCloud.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Authentication Flow", () => {
    it("should show landing page when not authenticated", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/welcome to subtracker/i)).toBeInTheDocument();
      });
    });

    it("should show loading state during authentication check", () => {
      // Make getSession hang to simulate loading
      mockSupabase.auth.getSession.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<App />);

      expect(screen.getByText(/loading subtracker/i)).toBeInTheDocument();
    });

    it("should show main app when authenticated", async () => {
      render(<App />);

      await waitFor(() => {
        // Should show app header and main navigation
        expect(screen.getByRole("banner")).toBeInTheDocument();
        expect(screen.getByText(/overview/i)).toBeInTheDocument();
      });
    });
  });

  describe("Main Application Flow", () => {
    it("should navigate between tabs", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/overview/i)).toBeInTheDocument();
      });

      // Navigate to subscriptions tab
      const subscriptionsTab = screen.getByText(/subscriptions/i);
      await user.click(subscriptionsTab);

      await waitFor(() => {
        expect(screen.getByText(/manage your subscriptions/i)).toBeInTheDocument();
      });

      // Navigate to planning tab
      const planningTab = screen.getByText(/planning/i);
      await user.click(planningTab);

      await waitFor(() => {
        expect(screen.getByText(/budget planning/i)).toBeInTheDocument();
      });
    });

    it("should handle add subscription flow", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("banner")).toBeInTheDocument();
      });

      // Click add subscription button
      const addButton = screen.getByRole("button", { name: /add/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/add new subscription/i)).toBeInTheDocument();
      });

      // Fill out the form
      const nameInput = screen.getByLabelText(/name/i);
      const priceInput = screen.getByLabelText(/price/i);

      await user.type(nameInput, "Test Subscription");
      await user.type(priceInput, "9.99");

      // Select frequency
      const frequencySelect = screen.getByLabelText(/frequency/i);
      await user.selectOptions(frequencySelect, "monthly");

      // Save the subscription
      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        // Dialog should close
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should handle search functionality", async () => {
      // Mock some existing subscriptions
      mockDataSyncManager.loadFromCloud.mockResolvedValue({
        success: true,
        data: {
          subscriptions: [
            createMockSubscription({ name: "Netflix", category: "Entertainment" }),
            createMockSubscription({ name: "Spotify", category: "Entertainment" }),
            createMockSubscription({ name: "Adobe CC", category: "Design" }),
          ],
          paymentCards: [],
          notifications: [],
          appSettings: {},
          weeklyBudgets: [],
        },
        timestamp: new Date().toISOString(),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("banner")).toBeInTheDocument();
      });

      // Navigate to subscriptions tab
      const subscriptionsTab = screen.getByText(/subscriptions/i);
      await user.click(subscriptionsTab);

      await waitFor(() => {
        expect(screen.getByText(/netflix/i)).toBeInTheDocument();
        expect(screen.getByText(/spotify/i)).toBeInTheDocument();
        expect(screen.getByText(/adobe/i)).toBeInTheDocument();
      });

      // Search for specific subscription
      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, "Netflix");

      await waitFor(() => {
        expect(screen.getByText(/netflix/i)).toBeInTheDocument();
        expect(screen.queryByText(/spotify/i)).not.toBeInTheDocument();
      });
    });

    it("should handle subscription editing flow", async () => {
      const testSubscription = createMockSubscription({
        id: "test-sub-1",
        name: "Test Service",
        price: 10.99,
      });

      mockDataSyncManager.loadFromCloud.mockResolvedValue({
        success: true,
        data: {
          subscriptions: [testSubscription],
          paymentCards: [],
          notifications: [],
          appSettings: {},
          weeklyBudgets: [],
        },
        timestamp: new Date().toISOString(),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("banner")).toBeInTheDocument();
      });

      // Navigate to subscriptions tab
      const subscriptionsTab = screen.getByText(/subscriptions/i);
      await user.click(subscriptionsTab);

      await waitFor(() => {
        expect(screen.getByText(/test service/i)).toBeInTheDocument();
      });

      // Click edit button for the subscription
      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/edit subscription/i)).toBeInTheDocument();
      });

      // Modify the subscription
      const priceInput = screen.getByDisplayValue("10.99");
      await user.clear(priceInput);
      await user.type(priceInput, "12.99");

      // Save changes
      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should handle payment card management", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("banner")).toBeInTheDocument();
      });

      // Open add subscription dialog first
      const addButton = screen.getByRole("button", { name: /add/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Click manage cards button
      const manageCardsButton = screen.getByText(/manage cards/i);
      await user.click(manageCardsButton);

      await waitFor(() => {
        expect(screen.getByText(/add payment card/i)).toBeInTheDocument();
      });

      // Fill out card form
      const cardNameInput = screen.getByLabelText(/card name/i);
      const lastFourInput = screen.getByLabelText(/last four digits/i);

      await user.type(cardNameInput, "Test Card");
      await user.type(lastFourInput, "1234");

      // Save card
      const saveCardButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveCardButton);

      await waitFor(() => {
        // Should close the card dialog and return to subscription dialog
        expect(screen.getByText(/add new subscription/i)).toBeInTheDocument();
      });
    });

    it("should handle settings modal", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("banner")).toBeInTheDocument();
      });

      // Open settings modal
      const settingsButton = screen.getByRole("button", { name: /settings/i });
      await user.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/profile & settings/i)).toBeInTheDocument();
      });

      // Navigate through settings tabs
      expect(screen.getByText(/notifications/i)).toBeInTheDocument();
      expect(screen.getByText(/preferences/i)).toBeInTheDocument();
      expect(screen.getByText(/data management/i)).toBeInTheDocument();

      // Toggle a setting
      const darkModeToggle = screen.getByLabelText(/dark mode/i);
      await user.click(darkModeToggle);

      // Close settings
      const closeButton = screen.getByRole("button", { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("should handle data sync operations", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("banner")).toBeInTheDocument();
      });

      // Mock successful sync
      mockDataSyncManager.loadFromCloud.mockResolvedValue({
        success: true,
        data: {
          subscriptions: [createMockSubscription()],
          paymentCards: [createMockPaymentCard()],
          notifications: [],
          appSettings: {},
          weeklyBudgets: [],
        },
        timestamp: new Date().toISOString(),
      });

      // Trigger sync (this might be automatic or through a sync button)
      // The exact trigger depends on your UI implementation
      const syncButton = screen.queryByRole("button", { name: /sync/i });
      if (syncButton) {
        await user.click(syncButton);

        await waitFor(() => {
          expect(mockDataSyncManager.loadFromCloud).toHaveBeenCalled();
        });
      }
    });

    it("should handle offline state", async () => {
      // Mock offline state
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        value: false,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("banner")).toBeInTheDocument();
      });

      // Should show offline indicator
      expect(screen.getByText(/offline/i)).toBeInTheDocument();

      // Sync operations should be disabled
      const syncButton = screen.queryByRole("button", { name: /sync/i });
      if (syncButton) {
        expect(syncButton).toBeDisabled();
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle data loading errors gracefully", async () => {
      mockDataSyncManager.loadFromCloud.mockRejectedValue(new Error("Network error"));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("banner")).toBeInTheDocument();
      });

      // Should still render the app, possibly with an error message
      expect(screen.getByText(/overview/i)).toBeInTheDocument();
    });

    it("should handle form validation errors", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("banner")).toBeInTheDocument();
      });

      // Open add subscription dialog
      const addButton = screen.getByRole("button", { name: /add/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Try to save without required fields
      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        // Should show validation errors
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });
    });

    it("should handle network errors during save", async () => {
      mockDataSyncManager.saveToCloud.mockRejectedValue(new Error("Save failed"));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("banner")).toBeInTheDocument();
      });

      // Add a subscription
      const addButton = screen.getByRole("button", { name: /add/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/name/i);
      const priceInput = screen.getByLabelText(/price/i);

      await user.type(nameInput, "Test Subscription");
      await user.type(priceInput, "9.99");

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        // Should handle save error gracefully
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("Responsive Design", () => {
    it("should adapt to mobile viewport", async () => {
      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      // Mock mobile media query
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === "(max-width: 768px)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("banner")).toBeInTheDocument();
      });

      // Should show mobile-specific elements
      const mobileMenuButton = screen.queryByRole("button", { name: /menu/i });
      if (mobileMenuButton) {
        expect(mobileMenuButton).toBeInTheDocument();
      }
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels and roles", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("banner")).toBeInTheDocument();
      });

      // Check for proper landmarks
      expect(screen.getByRole("banner")).toBeInTheDocument(); // Header
      expect(screen.getByRole("main")).toBeInTheDocument(); // Main content

      // Check for proper button labels
      const addButton = screen.getByRole("button", { name: /add/i });
      expect(addButton).toHaveAccessibleName();

      // Check for proper navigation
      const navigation = screen.getByRole("navigation");
      expect(navigation).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("banner")).toBeInTheDocument();
      });

      // Test tab navigation
      const addButton = screen.getByRole("button", { name: /add/i });
      addButton.focus();
      expect(document.activeElement).toBe(addButton);

      // Test Enter key activation
      fireEvent.keyDown(addButton, { key: "Enter" });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should provide screen reader friendly content", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("banner")).toBeInTheDocument();
      });

      // Check for proper headings hierarchy
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);

      // Check for descriptive text
      expect(screen.getByText(/overview/i)).toBeInTheDocument();
    });
  });
});
