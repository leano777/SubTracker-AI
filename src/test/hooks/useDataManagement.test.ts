import { renderHook, act, waitFor } from "@testing-library/react";
// @ts-nocheck
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { useDataManagement } from "../../hooks/useDataManagement";
import type { FullSubscription } from "../../types/subscription";
import {
  createMockSubscription,
  createMockPaymentCard,
  createMockAppSettings,
  mockDataSyncManager,
  createHookWrapper,
} from "../utils";

// Mock the data sync manager
vi.mock("../../utils/dataSync", () => ({
  dataSyncManager: mockDataSyncManager,
}));

// Mock the cache utilities with factory function
vi.mock("../../utils/cache", () => {
  const mockCache = {
    saveUserDataToCache: vi.fn(),
    loadUserDataFromCache: vi.fn(() => ({
      subscriptions: [],
      paymentCards: [],
      notifications: [],
      appSettings: {
        currency: "USD",
        dateFormat: "MM/dd/yyyy",
        theme: "light",
        notifications: true,
        autoSync: true,
        backupEnabled: true,
      },
      hasInitialized: false,
      dataCleared: false,
      weeklyBudgets: [],
      cacheTimestamp: new Date().toISOString(),
    })),
    clearUserDataCache: vi.fn(),
  };

  return mockCache;
});

// Get the mocked cache instance
const mockCache = vi.mocked(await import("../../utils/cache"));

// Mock pay period calculations
vi.mock("../../utils/payPeriodCalculations", () => ({
  calculatePayPeriodRequirements: vi.fn(() => []),
  getSubscriptionStatistics: vi.fn(() => ({})),
}));

describe("useDataManagement", () => {
  const defaultProps = {
    isAuthenticated: true,
    stableUserId: "test-user-id",
    isOnline: true,
    cloudSyncEnabled: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDataSyncManager.loadFromCloud.mockResolvedValue({
      success: true,
      data: {
        subscriptions: [],
        paymentCards: [],
        notifications: [],
        appSettings: createMockAppSettings(),
        weeklyBudgets: [],
      },
      timestamp: new Date().toISOString(),
    });
    mockDataSyncManager.saveToCloud.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with demo data when not authenticated", () => {
      const { result } = renderHook(() => useDataManagement(false, null, true, true));

      expect(result.current.subscriptions.length).toBeGreaterThan(0);
      expect(result.current.paymentCards.length).toBeGreaterThan(0);
      expect(result.current.hasInitialized).toBe(false); // Still initializing
    });

    it("should initialize with empty data when authenticated", () => {
      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      expect(result.current.subscriptions).toEqual([]);
      expect(result.current.paymentCards).toEqual([]);
    });

    it("should handle server requests only when session is ready", () => {
      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      expect(result.current.serverRequestsAllowed).toBe(true);
      expect(result.current.sessionReady).toBe(true);
    });
  });

  describe("Data Loading", () => {
    it("should load user data from cache when available", async () => {
      const mockSubscriptions = [createMockSubscription()];
      const mockCards = [createMockPaymentCard()];

      mockCache.loadUserDataFromCache.mockReturnValue({
        subscriptions: mockSubscriptions,
        paymentCards: mockCards,
        notifications: [],
        appSettings: createMockAppSettings(),
        hasInitialized: true,
        dataCleared: false,
        weeklyBudgets: [],
        cacheTimestamp: new Date().toISOString(),
      });

      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      await waitFor(() => {
        expect(result.current.hasInitialized).toBe(true);
      });

      expect(result.current.subscriptions).toHaveLength(1);
      expect(result.current.paymentCards).toHaveLength(1);
    });

    it("should attempt cloud sync when conditions are met", async () => {
      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      await waitFor(() => {
        expect(mockDataSyncManager.loadFromCloud).toHaveBeenCalled();
      });
    });

    it("should handle cloud sync failures gracefully", async () => {
      mockDataSyncManager.loadFromCloud.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      await waitFor(() => {
        expect(result.current.syncStatus?.type).toBe("error");
      });
    });
  });

  describe("Data Persistence", () => {
    it("should save data to cache when subscriptions change", async () => {
      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      const newSubscription = createMockSubscription({ id: "new-sub" });

      await act(async () => {
        result.current.setSubscriptions([newSubscription]);
      });

      await waitFor(() => {
        expect(mockCache.saveUserDataToCache).toHaveBeenCalledWith(
          "test-user-id",
          expect.objectContaining({
            subscriptions: [newSubscription],
          })
        );
      });
    });

    it("should save to cloud when conditions are met", async () => {
      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      await act(async () => {
        result.current.setSubscriptions([createMockSubscription()]);
      });

      await waitFor(() => {
        expect(mockDataSyncManager.saveToCloud).toHaveBeenCalled();
      });
    });

    it("should not save to cloud when offline", async () => {
      const { result } = renderHook(() => useDataManagement(true, "test-user-id", false, true));

      await act(async () => {
        result.current.setSubscriptions([createMockSubscription()]);
      });

      // Should still save to cache
      expect(mockCache.saveUserDataToCache).toHaveBeenCalled();
      // But not to cloud
      expect(mockDataSyncManager.saveToCloud).not.toHaveBeenCalled();
    });
  });

  describe("Data Migration", () => {
    it("should migrate legacy subscription data format", () => {
      const legacySubscription = {
        id: "legacy-1",
        name: "Legacy Sub",
        cost: 10, // Old field name
        billingCycle: "monthly", // Old field name
        nextPayment: "2024-01-15",
        category: "Entertainment",
        isActive: true, // Old field name
        dateAdded: "2024-01-01",
      };

      mockCache.loadUserDataFromCache.mockReturnValue({
        subscriptions: [legacySubscription],
        paymentCards: [],
        notifications: [],
        appSettings: createMockAppSettings(),
        hasInitialized: true,
        dataCleared: false,
        weeklyBudgets: [],
        cacheTimestamp: new Date().toISOString(),
      });

      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      // Should migrate to new format
      const migratedSubscription = result.current.subscriptions[0];
      expect(migratedSubscription).toHaveProperty("price"); // New field name
      expect(migratedSubscription).toHaveProperty("frequency"); // New field name
      expect(migratedSubscription.status).toBe("active"); // Converted from isActive
    });

    it("should handle invalid subscription data gracefully", () => {
      const invalidSubscription = {
        id: null, // Invalid
        name: "", // Invalid
        price: "invalid", // Invalid type
        frequency: "invalid", // Invalid value
      };

      mockCache.loadUserDataFromCache.mockReturnValue({
        subscriptions: [invalidSubscription],
        paymentCards: [],
        notifications: [],
        appSettings: createMockAppSettings(),
        hasInitialized: true,
        dataCleared: false,
        weeklyBudgets: [],
        cacheTimestamp: new Date().toISOString(),
      });

      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      // Should create valid fallback data
      const subscription = result.current.subscriptions[0];
      expect(subscription.id).toBeTruthy();
      expect(subscription.name).toBeTruthy();
      expect(typeof subscription.price).toBe("number");
      expect(["monthly", "yearly", "weekly", "daily"]).toContain(subscription.frequency);
    });
  });

  describe("Sync Operations", () => {
    it("should trigger manual data sync successfully", async () => {
      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      await act(async () => {
        await result.current.triggerDataSync();
      });

      expect(mockDataSyncManager.loadFromCloud).toHaveBeenCalled();
    });

    it("should handle sync errors", async () => {
      mockDataSyncManager.loadFromCloud.mockRejectedValue(new Error("Sync failed"));

      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      await act(async () => {
        await result.current.triggerDataSync();
      });

      expect(result.current.syncStatus?.type).toBe("error");
    });

    it("should not allow sync when not online", async () => {
      const { result } = renderHook(() => useDataManagement(true, "test-user-id", false, true));

      await act(async () => {
        await result.current.triggerDataSync();
      });

      expect(result.current.syncStatus?.type).toBe("error");
      expect(result.current.syncStatus?.message).toContain("offline");
    });

    it("should not allow sync when not authenticated", async () => {
      const { result } = renderHook(() => useDataManagement(false, null, true, true));

      await act(async () => {
        await result.current.triggerDataSync();
      });

      // Should not trigger sync
      expect(mockDataSyncManager.loadFromCloud).not.toHaveBeenCalled();
    });
  });

  describe("Weekly Budget Calculations", () => {
    it("should calculate weekly budgets when subscriptions change", async () => {
      const subscriptions = [
        createMockSubscription({ price: 10, frequency: "weekly" }),
        createMockSubscription({ price: 30, frequency: "monthly" }),
      ];

      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      await act(async () => {
        result.current.setSubscriptions(subscriptions);
      });

      expect(result.current.weeklyBudgets).toBeDefined();
      expect(Array.isArray(result.current.weeklyBudgets)).toBe(true);
    });
  });

  describe("Cache Operations", () => {
    it("should clear user cache when requested", () => {
      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      act(() => {
        result.current.clearUserDataCache();
      });

      expect(mockCache.clearUserDataCache).toHaveBeenCalledWith("test-user-id");
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing user ID gracefully", () => {
      const { result } = renderHook(() => useDataManagement(true, null, true, true));

      expect(result.current.subscriptions).toEqual([]);
      expect(result.current.hasInitialized).toBe(false);
    });

    it("should handle cloud sync disabled", () => {
      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, false));

      // Should not attempt cloud operations
      expect(mockDataSyncManager.loadFromCloud).not.toHaveBeenCalled();
    });

    it("should handle session not ready state", () => {
      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      // Initially, server requests might not be allowed until session is fully ready
      expect(result.current.sessionReady).toBeDefined();
      expect(result.current.serverRequestsAllowed).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle cache loading errors", () => {
      mockCache.loadUserDataFromCache.mockImplementation(() => {
        throw new Error("Cache error");
      });

      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      // Should not crash and provide fallback behavior
      expect(result.current).toBeDefined();
      expect(result.current.subscriptions).toBeDefined();
    });

    it("should handle save errors gracefully", async () => {
      mockCache.saveUserDataToCache.mockImplementation(() => {
        throw new Error("Save error");
      });

      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      await act(async () => {
        result.current.setSubscriptions([createMockSubscription()]);
      });

      // Should not crash even if save fails
      expect(result.current.subscriptions).toHaveLength(1);
    });
  });

  describe("Subscription Data Validation", () => {
    it("should validate subscription frequency values", () => {
      const invalidFrequencies = ["weekly2", "invalid", null, undefined];

      invalidFrequencies.forEach((freq) => {
        const subscription = {
          ...createMockSubscription(),
          frequency: freq as any,
        };

        const { result } = renderHook(() => useDataManagement(false, null, true, true));

        act(() => {
          result.current.setSubscriptions([subscription]);
        });

        // Should normalize to valid frequency
        const normalizedSub = result.current.subscriptions[0];
        expect(["monthly", "yearly", "weekly", "daily"]).toContain(normalizedSub.frequency);
      });
    });

    it("should validate subscription price values", () => {
      const invalidPrices = [-10, "invalid", null, undefined, NaN, Infinity];

      invalidPrices.forEach((price) => {
        const subscription = {
          ...createMockSubscription(),
          price: price as any,
        };

        const { result } = renderHook(() => useDataManagement(false, null, true, true));

        act(() => {
          result.current.setSubscriptions([subscription]);
        });

        // Should normalize to valid price
        const normalizedSub = result.current.subscriptions[0];
        expect(typeof normalizedSub.price).toBe("number");
        expect(normalizedSub.price).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(normalizedSub.price)).toBe(true);
      });
    });
  });

  describe("Performance Considerations", () => {
    it("should not trigger unnecessary re-renders on identical data", async () => {
      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return useDataManagement(true, "test-user-id", true, true);
      });

      const initialRenderCount = renderCount;

      // Setting same data should not trigger re-render
      await act(async () => {
        result.current.setSubscriptions(result.current.subscriptions);
      });

      // Should not have caused additional renders
      expect(renderCount).toBe(initialRenderCount);
    });

    it("should debounce frequent save operations", async () => {
      const { result } = renderHook(() => useDataManagement(true, "test-user-id", true, true));

      // Make multiple rapid changes
      await act(async () => {
        result.current.setSubscriptions([createMockSubscription({ id: "1" })]);
        result.current.setSubscriptions([createMockSubscription({ id: "2" })]);
        result.current.setSubscriptions([createMockSubscription({ id: "3" })]);
      });

      // Should have saved, but not excessively
      expect(mockCache.saveUserDataToCache).toHaveBeenCalled();
    });
  });
});
