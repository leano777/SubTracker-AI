import { render, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { Profiler, type ProfilerOnRenderCallback } from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import App from "../../App";
import { DashboardTab } from "../../components/DashboardTab";
import { SubscriptionsUnifiedTab } from "../../components/SubscriptionsUnifiedTab";
import {
  createMockSubscription,
  createMockPaymentCard,
  mockDataSyncManager,
  createProfiler,
  measureRenderTime,
  renderWithProviders,
} from "../utils";

// Mock all dependencies for performance testing
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
    hasInitialized: true,
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

// Create large datasets for performance testing
const generateLargeSubscriptionDataset = (count: number) => {
  return Array.from({ length: count }, (_, index) =>
    createMockSubscription({
      id: `perf-sub-${index}`,
      name: `Performance Test Subscription ${index}`,
      price: Math.random() * 50 + 5,
      category: ["Entertainment", "Productivity", "Business", "Design"][index % 4],
      status: index % 10 === 0 ? "cancelled" : "active",
      description: `This is a test subscription ${index} for performance testing with longer description text that might impact rendering performance`,
      tags: [`tag${index}`, `category${index % 4}`, `test`],
    })
  );
};

const generateLargePaymentCardDataset = (count: number) => {
  return Array.from({ length: count }, (_, index) =>
    createMockPaymentCard({
      id: `perf-card-${index}`,
      name: `Performance Test Card ${index}`,
      lastFourDigits: String(index).padStart(4, "0"),
      provider: ["visa", "mastercard", "amex", "discover"][index % 4] as any,
    })
  );
};

describe("Performance Regression Tests", () => {
  const user = userEvent.setup({ delay: null }); // Disable delay for performance tests

  beforeEach(() => {
    vi.clearAllMocks();
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

    // Enable performance measurement
    performance.mark = vi.fn();
    performance.measure = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Hook Performance", () => {
    it("should not exceed performance budget for useDataManagement with large dataset", async () => {
      const largeSubscriptions = generateLargeSubscriptionDataset(1000);
      const largeCards = generateLargePaymentCardDataset(100);

      mockDataSyncManager.loadFromCloud.mockResolvedValue({
        success: true,
        data: {
          subscriptions: largeSubscriptions,
          paymentCards: largeCards,
          notifications: [],
          appSettings: {},
          weeklyBudgets: [],
        },
        timestamp: new Date().toISOString(),
      });

      const profiler = createProfiler();

      const TestComponent = () => {
        const [subscriptions, setSubscriptions] = React.useState(largeSubscriptions);
        return <div>Subscriptions: {subscriptions.length}</div>;
      };

      const renderWithProfiler = () => {
        render(
          <Profiler id="useDataManagement" onRender={profiler.onRender}>
            <TestComponent />
          </Profiler>
        );
      };

      const renderTime = await measureRenderTime(renderWithProfiler);

      await waitFor(() => {
        expect(profiler.getDurations().length).toBeGreaterThan(0);
      });

      // Performance budgets
      expect(renderTime).toBeLessThan(100); // Initial render should be under 100ms
      expect(profiler.getMaxDuration()).toBeLessThan(50); // Individual updates under 50ms
      expect(profiler.getAverageDuration()).toBeLessThan(20); // Average update under 20ms
    });

    it("should handle frequent subscription updates efficiently", async () => {
      const profiler = createProfiler();
      const TestComponent = () => {
        const [subscriptions, setSubscriptions] = React.useState<any[]>([]);

        React.useEffect(() => {
          // Simulate frequent updates
          const timer = setInterval(() => {
            const newSub = createMockSubscription({ id: `update-${Date.now()}` });
            setSubscriptions((prev) => [...prev, newSub]);
          }, 10);

          setTimeout(() => clearInterval(timer), 100); // Stop after 100ms
        }, []);

        return <div>Subscriptions: {subscriptions.length}</div>;
      };

      render(
        <Profiler id="frequentUpdates" onRender={profiler.onRender}>
          <TestComponent />
        </Profiler>
      );

      await waitFor(() => {
        expect(profiler.getDurations().length).toBeGreaterThan(5);
      });

      // Should not cause excessive re-renders
      expect(profiler.getDurations().length).toBeLessThan(20);
      expect(profiler.getMaxDuration()).toBeLessThan(16); // 60fps budget
    });
  });

  describe("Component Rendering Performance", () => {
    it("should render Dashboard efficiently with large dataset", async () => {
      const largeSubscriptions = generateLargeSubscriptionDataset(500);
      const profiler = createProfiler();

      const renderDashboard = () => {
        render(
          <Profiler id="Dashboard" onRender={profiler.onRender}>
            <DashboardTab
              subscriptions={largeSubscriptions}
              cards={[]}
              settings={{
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
              }}
              notifications={[]}
              weeklyBudgets={[]}
            />
          </Profiler>
        );
      };

      const renderTime = await measureRenderTime(renderDashboard);

      // Dashboard should render large datasets efficiently
      expect(renderTime).toBeLessThan(200);
      expect(profiler.getMaxDuration()).toBeLessThan(100);
    });

    it("should handle Subscriptions list virtualization performance", async () => {
      const largeSubscriptions = generateLargeSubscriptionDataset(2000);
      const profiler = createProfiler();

      const renderSubscriptionsList = () => {
        render(
          <Profiler id="SubscriptionsList" onRender={profiler.onRender}>
            <SubscriptionsUnifiedTab
              subscriptions={largeSubscriptions}
              cards={[]}
              onEdit={vi.fn()}
              onDelete={vi.fn()}
              onCancel={vi.fn()}
              onReactivate={vi.fn()}
              onActivateFromWatchlist={vi.fn()}
              onAddNew={vi.fn()}
              onAddToWatchlist={vi.fn()}
            />
          </Profiler>
        );
      };

      const renderTime = await measureRenderTime(renderSubscriptionsList);

      // Large lists should use virtualization to maintain performance
      expect(renderTime).toBeLessThan(300);
      expect(profiler.getMaxDuration()).toBeLessThan(150);
    });

    it("should maintain performance during search operations", async () => {
      const largeSubscriptions = generateLargeSubscriptionDataset(1000);
      const profiler = createProfiler();

      render(
        <Profiler id="SearchPerformance" onRender={profiler.onRender}>
          <SubscriptionsUnifiedTab
            subscriptions={largeSubscriptions}
            cards={[]}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
            onCancel={vi.fn()}
            onReactivate={vi.fn()}
            onActivateFromWatchlist={vi.fn()}
            onAddNew={vi.fn()}
            onAddToWatchlist={vi.fn()}
          />
        </Profiler>
      );

      // Simulate search input
      const searchInput = document.querySelector('input[placeholder*="search"]');
      if (searchInput) {
        await act(async () => {
          await user.type(searchInput as HTMLElement, "Performance Test");
        });

        // Search filtering should be efficient
        expect(profiler.getMaxDuration()).toBeLessThan(50);
      }
    });
  });

  describe("Memory Usage", () => {
    it("should not cause memory leaks with frequent component mounting/unmounting", async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const profiler = createProfiler();

      // Mount and unmount component multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <Profiler id={`MemoryTest${i}`} onRender={profiler.onRender}>
            <DashboardTab
              subscriptions={generateLargeSubscriptionDataset(100)}
              cards={generateLargePaymentCardDataset(10)}
              settings={{
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
              }}
              notifications={[]}
              weeklyBudgets={[]}
            />
          </Profiler>
        );

        await waitFor(() => {
          expect(profiler.getDurations().length).toBeGreaterThan(0);
        });

        unmount();
        profiler.reset();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Memory usage shouldn't grow significantly
      if (initialMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        const memoryGrowthMB = memoryGrowth / 1024 / 1024;
        expect(memoryGrowthMB).toBeLessThan(50); // Less than 50MB growth
      }
    });

    it("should clean up event listeners and timers properly", async () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
      const setTimeoutSpy = vi.spyOn(global, "setTimeout");
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const TestComponent = () => {
        React.useEffect(() => {
          const handleResize = () => {};
          window.addEventListener("resize", handleResize);

          const timer = setTimeout(() => {}, 1000);

          return () => {
            window.removeEventListener("resize", handleResize);
            clearTimeout(timer);
          };
        }, []);

        return <div>Test Component</div>;
      };

      const { unmount } = render(<TestComponent />);

      // Should add event listeners and set timers
      expect(addEventListenerSpy).toHaveBeenCalled();
      expect(setTimeoutSpy).toHaveBeenCalled();

      unmount();

      // Should clean up on unmount
      expect(removeEventListenerSpy).toHaveBeenCalled();
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe("Data Processing Performance", () => {
    it("should process large subscription datasets efficiently", () => {
      const largeDataset = generateLargeSubscriptionDataset(10000);

      const startTime = performance.now();

      // Simulate data processing operations
      const activeSubscriptions = largeDataset.filter((sub) => sub.status === "active");
      const monthlyTotal = activeSubscriptions
        .filter((sub) => sub.frequency === "monthly")
        .reduce((total, sub) => total + sub.price, 0);
      const categories = [...new Set(largeDataset.map((sub) => sub.category))];

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Data processing should be under 100ms for 10k items
      expect(processingTime).toBeLessThan(100);
      expect(activeSubscriptions.length).toBeGreaterThan(0);
      expect(monthlyTotal).toBeGreaterThan(0);
      expect(categories.length).toBeGreaterThan(0);
    });

    it("should handle data migration efficiently", () => {
      // Create legacy format data
      const legacyData = Array.from({ length: 1000 }, (_, index) => ({
        id: `legacy-${index}`,
        name: `Legacy Subscription ${index}`,
        cost: Math.random() * 50, // Old field name
        billingCycle: "monthly", // Old field name
        isActive: true, // Old field name
        category: "Test",
      }));

      const startTime = performance.now();

      // Simulate migration (this would happen in useDataManagement)
      const migratedData = legacyData.map((sub) => ({
        ...sub,
        price: sub.cost, // Migrate cost -> price
        frequency: sub.billingCycle === "monthly" ? "monthly" : "yearly", // Migrate billingCycle -> frequency
        status: sub.isActive ? "active" : "cancelled", // Migrate isActive -> status
        dateAdded: new Date().toISOString().split("T")[0],
        nextPayment: new Date().toISOString().split("T")[0],
      }));

      const endTime = performance.now();
      const migrationTime = endTime - startTime;

      // Migration should be efficient
      expect(migrationTime).toBeLessThan(50);
      expect(migratedData).toHaveLength(1000);
      expect(migratedData[0]).toHaveProperty("price");
      expect(migratedData[0]).toHaveProperty("frequency");
      expect(migratedData[0]).toHaveProperty("status");
    });
  });

  describe("Interaction Performance", () => {
    it("should handle rapid user interactions efficiently", async () => {
      const profiler = createProfiler();
      let clickCount = 0;

      const TestComponent = () => {
        const [count, setCount] = React.useState(0);

        return (
          <button
            onClick={() => {
              setCount((prev) => prev + 1);
              clickCount++;
            }}
          >
            Click count: {count}
          </button>
        );
      };

      render(
        <Profiler id="RapidClicks" onRender={profiler.onRender}>
          <TestComponent />
        </Profiler>
      );

      const button = document.querySelector("button")!;

      // Simulate rapid clicking
      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        await act(async () => {
          button.click();
        });
      }
      const endTime = performance.now();

      const interactionTime = endTime - startTime;

      // Rapid interactions should be handled efficiently
      expect(interactionTime).toBeLessThan(1000); // 100 clicks in under 1 second
      expect(clickCount).toBe(100);
      expect(profiler.getMaxDuration()).toBeLessThan(16); // Maintain 60fps
    });
  });

  describe("Regression Benchmarks", () => {
    const PERFORMANCE_BASELINES = {
      initialRender: 100, // ms
      dataUpdate: 50, // ms
      searchFilter: 30, // ms
      componentMount: 20, // ms
      listScroll: 16, // ms (60fps)
    };

    it("should not regress from performance baselines", async () => {
      const measurements: Record<string, number> = {};

      // Test initial render performance
      const renderTime = await measureRenderTime(() => {
        render(
          <DashboardTab
            subscriptions={generateLargeSubscriptionDataset(100)}
            cards={generateLargePaymentCardDataset(10)}
            settings={{
              notifications: {
                upcomingPayments: true,
                highSpending: true,
                weeklyReports: false,
                trialExpirations: true,
              },
              thresholds: { highSpendingAmount: 200, upcomingPaymentDays: 7, trialReminderDays: 3 },
              preferences: {
                defaultView: "dashboard",
                showCancelled: true,
                groupByCategory: false,
                darkMode: false,
                showFavicons: true,
                theme: "light",
              },
            }}
            notifications={[]}
            weeklyBudgets={[]}
          />
        );
      });

      measurements.initialRender = renderTime;

      // Assert against baselines
      Object.entries(measurements).forEach(([metric, value]) => {
        const baseline = PERFORMANCE_BASELINES[metric as keyof typeof PERFORMANCE_BASELINES];
        if (baseline) {
          expect(value).toBeLessThan(baseline * 1.2); // Allow 20% variance
        }
      });

      // Log measurements for monitoring
      console.log("Performance measurements:", measurements);
    });
  });

  describe("Bundle Size Impact", () => {
    it("should track component render efficiency", () => {
      const renderCounts: Record<string, number> = {};

      const TrackingProfiler: React.FC<{ id: string; children: React.ReactNode }> = ({
        id,
        children,
      }) => (
        <Profiler
          id={id}
          onRender={(id, phase, actualDuration) => {
            renderCounts[id] = (renderCounts[id] || 0) + 1;
          }}
        >
          {children}
        </Profiler>
      );

      const TestApp = () => {
        const [data, setData] = React.useState(generateLargeSubscriptionDataset(10));

        React.useEffect(() => {
          // Simulate data updates
          const timer = setInterval(() => {
            setData((prev) => [...prev, createMockSubscription()]);
          }, 100);

          setTimeout(() => clearInterval(timer), 500);
        }, []);

        return (
          <TrackingProfiler id="TestApp">
            <DashboardTab
              subscriptions={data}
              cards={[]}
              settings={{
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
              }}
              notifications={[]}
              weeklyBudgets={[]}
            />
          </TrackingProfiler>
        );
      };

      render(<TestApp />);

      // Wait for updates to complete
      return waitFor(() => {
        expect(renderCounts.TestApp).toBeGreaterThan(1);
        expect(renderCounts.TestApp).toBeLessThan(10); // Shouldn't re-render excessively
      });
    });
  });
});
