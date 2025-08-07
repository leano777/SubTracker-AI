import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LandingPage } from "./components/LandingPage";
import { DashboardTab } from "./components/DashboardTab";
import { SubscriptionsUnifiedTab } from "./components/SubscriptionsUnifiedTab";
import { PlanningTab } from "./components/PlanningTab";
import { IntelligenceTab } from "./components/IntelligenceTab";
import { SubscriptionForm } from "./components/SubscriptionForm";
import { PaymentCardForm } from "./components/PaymentCardForm";
import { SubscriptionSidePeek } from "./components/SubscriptionSidePeek";
import { QuickActionButton } from "./components/QuickActionButton";
import { FloatingNotifications } from "./components/FloatingNotifications";
import { AppHeader } from "./components/AppHeader";
import { AdvancedSettingsTab } from "./components/AdvancedSettingsTab";
import { ImportDialog } from "./components/ImportDialog";
import { DataRecoveryDialog } from "./components/DataRecoveryDialog";
import { useAppHandlers } from "./hooks/useAppHandlers";
import { useIsDesktop, useIsMobile } from "./hooks/useDeviceDetection";
import { useDataManagement } from "./hooks/useDataManagement";
import { FullSubscription, PaymentCard as FullPaymentCard } from "./types/subscription";
import { dataSyncManager } from "./utils/dataSync";
import { formatDateForStorage } from "./utils/dateUtils";
import { applyThemeClasses } from "./utils/theme";

// Debug logging utility
const debugLog = (category: string, data: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[${category}]`, data);
  }
};

function AppContent() {
  const { user, loading: authLoading, isAuthenticated, signOut } = useAuth();
  const isDesktop = useIsDesktop();
  const isMobile = useIsMobile();

  // Mounted ref for cleanup safety
  const isMountedRef = useRef(true);
  const cleanupFunctionsRef = useRef<Set<() => void>>(new Set());

  // Timeout tracking for proper cleanup
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Helper function to add cleanup
  const addCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctionsRef.current.add(cleanupFn);
  }, []);

  // Helper function to create tracked timeout
  const createTrackedTimeout = useCallback(
    (callback: () => void, delay: number) => {
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          callback();
        }
        timeoutsRef.current.delete(timeoutId);
      }, delay);

      timeoutsRef.current.add(timeoutId);
      addCleanup(() => {
        clearTimeout(timeoutId);
        timeoutsRef.current.delete(timeoutId);
      });

      return timeoutId;
    },
    [addCleanup]
  );

  // Core UI State - Simplified and consolidated
  const [uiState, setUiState] = useState({
    activeTab: "overview",
    isFormOpen: false,
    isWatchlistMode: false,
    globalSearchTerm: "",
    isMobileMenuOpen: false,
  });

  // Modal State - Consolidated to prevent race conditions
  const [modalState, setModalState] = useState({
    isCardModalOpen: false,
    isSidePeekOpen: false,
    isSettingsModalOpen: false,
    isImportDialogOpen: false,
    isDataRecoveryOpen: false,
  });

  // Editing State - Separate for clear ownership
  const [editingState, setEditingState] = useState({
    editingSubscription: null as FullSubscription | null,
    editingCard: null as FullPaymentCard | null,
    sidePeekSubscription: null as FullSubscription | null,
  });

  // Connection State
  const [connectionState, setConnectionState] = useState(() => ({
    isOnline: navigator.onLine,
    cloudSyncEnabled: true,
  }));

  // Stable user reference - Only derive userId to prevent object reference changes
  const stableUserId = useMemo(() => {
    debugLog("stableUserId recalculated", user?.id);
    return user?.id || null;
  }, [user?.id]);

  // Data Management Hook - FIXED: Simplified parameters to prevent cascade re-renders
  const dataManagement = useDataManagement(
    isAuthenticated,
    stableUserId,
    connectionState.isOnline,
    connectionState.cloudSyncEnabled
  );

  // Destructure data management with null safety
  const {
    subscriptions = [],
    setSubscriptions,
    paymentCards = [],
    setPaymentCards,
    appSettings,
    setAppSettings,
    notifications = [],
    setNotifications,
    weeklyBudgets = [],
    syncStatus,
    lastSyncTime,
    loadUserData,
    triggerDataSync,
  } = dataManagement || {};

  // Default app settings - Memoized to prevent recreation
  const defaultAppSettings = useMemo(
    () => ({
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
        defaultView: "dashboard" as const,
        showCancelled: true,
        groupByCategory: false,
        darkMode: false,
        showFavicons: true,
        theme: "light" as const,
      },
    }),
    []
  );

  // Theme calculations - Optimized with stable reference
  const themeValues = useMemo(() => {
    const currentTheme = appSettings?.preferences?.theme || "light";
    debugLog("themeValues recalculated", currentTheme);

    const isDarkMode = currentTheme === "dark";
    const isStealthOps = currentTheme === "stealth-ops";

    return {
      currentTheme,
      isDarkMode,
      isStealthOps,
      textColors: {
        primary: isDarkMode ? "text-gray-100" : "text-gray-900",
        secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
        muted: isDarkMode ? "text-gray-400" : "text-gray-600",
        onGlass: isDarkMode ? "text-gray-100" : "text-gray-900",
      },
      glassSecondaryStyles: {
        backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
      },
      glassAccentStyles: {
        backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.9)" : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(16px)",
      },
    };
  }, [appSettings?.preferences?.theme]);

  // Apply theme when it changes - FIXED: Proper cleanup and debouncing
  useEffect(() => {
    debugLog("theme effect triggered", themeValues.currentTheme);

    const timeoutId = createTrackedTimeout(() => {
      if (isMountedRef.current) {
        try {
          applyThemeClasses(themeValues.currentTheme);
        } catch (error) {
          console.error("Theme application failed:", error);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(timeoutId);
    };
  }, [themeValues.currentTheme, createTrackedTimeout]);

  // Online/offline handling - FIXED: Proper cleanup and state updates
  useEffect(() => {
    debugLog("online/offline effect mounted", navigator.onLine);

    const handleOnline = () => {
      if (isMountedRef.current) {
        setConnectionState((prev) => ({ ...prev, isOnline: true }));
      }
    };

    const handleOffline = () => {
      if (isMountedRef.current) {
        setConnectionState((prev) => ({ ...prev, isOnline: false }));
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const cleanup = () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };

    addCleanup(cleanup);
    return cleanup;
  }, [addCleanup]);

  // Load user data - FIXED: Proper dependency management and cleanup
  useEffect(() => {
    debugLog("loadUserData effect", { isAuthenticated, stableUserId });

    if (!isAuthenticated || !stableUserId || !loadUserData) {
      return;
    }

    let isEffectMounted = true;

    const loadData = async () => {
      try {
        await loadUserData(stableUserId);
      } catch (error) {
        if (isEffectMounted && isMountedRef.current) {
          console.error("Failed to load user data:", error);
        }
      }
    };

    loadData();

    return () => {
      isEffectMounted = false;
    };
  }, [isAuthenticated, stableUserId, loadUserData]);

  // Stable handlers - FIXED: Simplified dependencies
  const stableHandlers = useMemo(() => {
    debugLog("stableHandlers recalculated", uiState.activeTab);

    return {
      setActiveTab: (tab: string) => {
        if (isMountedRef.current) {
          setUiState((prev) => ({ ...prev, activeTab: tab }));
        }
      },
      setIsFormOpen: (open: boolean) => {
        if (isMountedRef.current) {
          setUiState((prev) => ({ ...prev, isFormOpen: open }));
        }
      },
      setIsWatchlistMode: (mode: boolean) => {
        if (isMountedRef.current) {
          setUiState((prev) => ({ ...prev, isWatchlistMode: mode }));
        }
      },
      setEditingSubscription: (subscription: FullSubscription | null) => {
        if (isMountedRef.current) {
          setEditingState((prev) => ({ ...prev, editingSubscription: subscription }));
        }
      },
    };
  }, []); // Empty dependency array - these are state setters

  // App Handlers - FIXED: Stable data management references
  const appHandlersConfig = useMemo(
    () => ({
      subscriptions,
      setSubscriptions,
      paymentCards,
      setPaymentCards,
      appSettings,
      setAppSettings,
      notifications,
      setNotifications,
      ...stableHandlers,
      editingSubscription: editingState.editingSubscription,
    }),
    [
      subscriptions,
      setSubscriptions,
      paymentCards,
      setPaymentCards,
      appSettings,
      setAppSettings,
      notifications,
      setNotifications,
      stableHandlers,
      editingState.editingSubscription,
    ]
  );

  const {
    handleMarkNotificationAsRead,
    handleMarkAllNotificationsAsRead,
    handleAddSubscription,
    handleEditSubscription,
    handleDeleteSubscription,
    handleCancelSubscription,
    handleReactivateSubscription,
    handleActivateFromWatchlist,
    handleAddCard,
    handleEditCard,
    handleDeleteCard,
    handleExportData,
    openEditForm,
    closeForm,
    openAddForm,
    openWatchlistForm,
  } = useAppHandlers(appHandlersConfig);

  // Logout handler - FIXED: Proper state cleanup before async operation
  const handleLogout = useCallback(async () => {
    debugLog("logout initiated", "clearing state");

    try {
      // Clear state synchronously first
      if (isMountedRef.current) {
        setSubscriptions?.([]);
        setPaymentCards?.([]);
        setNotifications?.([]);
        setUiState({
          activeTab: "overview",
          isFormOpen: false,
          isWatchlistMode: false,
          globalSearchTerm: "",
          isMobileMenuOpen: false,
        });
        setModalState({
          isCardModalOpen: false,
          isSidePeekOpen: false,
          isSettingsModalOpen: false,
          isImportDialogOpen: false,
          isDataRecoveryOpen: false,
        });
        setEditingState({
          editingSubscription: null,
          editingCard: null,
          sidePeekSubscription: null,
        });
      }

      // Then perform async logout
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [signOut, setSubscriptions, setPaymentCards, setNotifications]);

  // Modal handlers - FIXED: Consolidated state updates
  const modalHandlers = useMemo(
    () => ({
      openSettingsModal: () => {
        if (isMountedRef.current) {
          setModalState((prev) => ({ ...prev, isSettingsModalOpen: true }));
        }
      },
      closeSettingsModal: () => {
        if (isMountedRef.current) {
          setModalState((prev) => ({ ...prev, isSettingsModalOpen: false }));
        }
      },
      openImportDialog: () => {
        if (isMountedRef.current) {
          setModalState((prev) => ({ ...prev, isImportDialogOpen: true }));
        }
      },
      closeImportDialog: () => {
        if (isMountedRef.current) {
          setModalState((prev) => ({ ...prev, isImportDialogOpen: false }));
        }
      },
      openDataRecovery: () => {
        if (isMountedRef.current) {
          setModalState((prev) => ({ ...prev, isDataRecoveryOpen: true }));
        }
      },
      closeDataRecovery: () => {
        if (isMountedRef.current) {
          setModalState((prev) => ({ ...prev, isDataRecoveryOpen: false }));
        }
      },
    }),
    []
  );

  // Settings update handler - FIXED: Debounced theme application
  const handleUpdateSettings = useCallback(
    (newSettings: typeof appSettings) => {
      if (!isMountedRef.current) return;

      try {
        setAppSettings?.(newSettings);

        // Only apply theme if it actually changed
        const oldTheme = appSettings?.preferences?.theme;
        const newTheme = newSettings?.preferences?.theme;

        if (newTheme && newTheme !== oldTheme) {
          createTrackedTimeout(() => {
            if (isMountedRef.current) {
              applyThemeClasses(newTheme);
            }
          }, 100);
        }
      } catch (error) {
        console.error("Settings update failed:", error);
      }
    },
    [appSettings?.preferences?.theme, setAppSettings, createTrackedTimeout]
  );

  // Reset app handler - FIXED: Atomic state reset
  const handleResetApp = useCallback(() => {
    if (!isMountedRef.current) return;

    try {
      // Reset all state atomically
      setSubscriptions?.([]);
      setPaymentCards?.([]);
      setNotifications?.([]);
      setAppSettings?.(defaultAppSettings);

      setUiState({
        activeTab: "overview",
        isFormOpen: false,
        isWatchlistMode: false,
        globalSearchTerm: "",
        isMobileMenuOpen: false,
      });

      setEditingState({
        editingSubscription: null,
        editingCard: null,
        sidePeekSubscription: null,
      });

      // Apply theme immediately
      applyThemeClasses("light");
      modalHandlers.closeSettingsModal();
    } catch (error) {
      console.error("App reset failed:", error);
    }
  }, [
    setSubscriptions,
    setPaymentCards,
    setNotifications,
    setAppSettings,
    defaultAppSettings,
    modalHandlers,
  ]);

  // Data recovery handler - FIXED: Proper validation and error handling
  const handleDataRecovered = useCallback(
    (data: {
      subscriptions?: FullSubscription[];
      paymentCards?: FullPaymentCard[];
      notifications?: any[];
      appSettings?: any;
    }) => {
      if (!isMountedRef.current) return;

      try {
        // Validate and set data
        if (Array.isArray(data.subscriptions)) {
          setSubscriptions?.(data.subscriptions);
        }
        if (Array.isArray(data.paymentCards)) {
          setPaymentCards?.(data.paymentCards);
        }
        if (Array.isArray(data.notifications)) {
          setNotifications?.(data.notifications);
        }
        if (data.appSettings && typeof data.appSettings === "object") {
          setAppSettings?.(data.appSettings);
        }

        modalHandlers.closeDataRecovery();
      } catch (error) {
        console.error("Data recovery failed:", error);
      }
    },
    [setSubscriptions, setPaymentCards, setNotifications, setAppSettings, modalHandlers]
  );

  // Import data handler - FIXED: Proper ID generation and validation
  const handleImportData = useCallback(
    (data: { subscriptions?: FullSubscription[]; cards?: FullPaymentCard[] }) => {
      if (!isMountedRef.current) return;

      try {
        const currentTime = Date.now();

        if (Array.isArray(data.subscriptions) && data.subscriptions.length > 0) {
          const importedSubs = data.subscriptions
            .filter(
              (sub): sub is FullSubscription =>
                sub && typeof sub === "object" && typeof sub.name === "string"
            )
            .map((sub, index) => ({
              ...sub,
              id: `import-${currentTime}-${index}`,
              dateAdded: sub.dateAdded || new Date().toISOString().split("T")[0],
              name: sub.name || "Imported Subscription",
              price: typeof sub.price === "number" ? sub.price : 0,
              frequency: sub.frequency || "monthly",
              status: sub.status || "active",
            }));

          setSubscriptions?.((prev) => [...(prev || []), ...importedSubs]);
        }

        if (Array.isArray(data.cards) && data.cards.length > 0) {
          const importedCards = data.cards
            .filter(
              (card): card is FullPaymentCard =>
                card && typeof card === "object" && typeof card.name === "string"
            )
            .map((card, index) => ({
              ...card,
              id: `import-card-${currentTime}-${index}`,
              dateAdded: card.dateAdded || new Date().toISOString().split("T")[0],
              name: card.name || "Imported Card",
              lastFour: card.lastFour || "0000",
            }));

          setPaymentCards?.((prev) => [...(prev || []), ...importedCards]);
        }

        modalHandlers.closeImportDialog();
      } catch (error) {
        console.error("Import failed:", error);
      }
    },
    [setSubscriptions, setPaymentCards, modalHandlers]
  );

  // Subscription view handler - FIXED: Device-specific logic with error handling
  const handleViewSubscription = useCallback(
    (subscription: FullSubscription) => {
      if (!subscription || !isMountedRef.current) return;

      try {
        if (isDesktop) {
          setEditingState((prev) => ({ ...prev, sidePeekSubscription: subscription }));
          setModalState((prev) => ({ ...prev, isSidePeekOpen: true }));
        } else {
          openEditForm?.(subscription);
        }
      } catch (error) {
        console.error("View subscription failed:", error);
      }
    },
    [isDesktop, openEditForm]
  );

  // Date update handler - FIXED: Proper cleanup and validation
  const handleUpdateSubscriptionDate = useCallback(
    (subscriptionId: string, newDate: Date) => {
      if (!subscriptionId || !newDate || !isMountedRef.current) return;

      try {
        const formattedDate = formatDateForStorage(newDate);

        setSubscriptions?.((prevSubscriptions) => {
          if (!Array.isArray(prevSubscriptions)) return [];

          return prevSubscriptions.map((sub) => {
            if (sub?.id === subscriptionId) {
              return { ...sub, nextPayment: formattedDate };
            }
            return sub;
          });
        });

        // Clear side peek after update
        createTrackedTimeout(() => {
          if (isMountedRef.current) {
            setEditingState((prev) => ({ ...prev, sidePeekSubscription: null }));
            setModalState((prev) => ({ ...prev, isSidePeekOpen: false }));
          }
        }, 100);
      } catch (error) {
        console.error("Date update failed:", error);
      }
    },
    [setSubscriptions, createTrackedTimeout]
  );

  // Side peek handlers - FIXED: Proper state management with timing
  const sidePeekHandlers = useMemo(
    () => ({
      closeSidePeek: () => {
        if (!isMountedRef.current) return;

        setModalState((prev) => ({ ...prev, isSidePeekOpen: false }));
        createTrackedTimeout(() => {
          if (isMountedRef.current) {
            setEditingState((prev) => ({ ...prev, sidePeekSubscription: null }));
          }
        }, 300);
      },
      handleSidePeekEdit: (subscription: FullSubscription) => {
        if (!isMountedRef.current) return;

        setModalState((prev) => ({ ...prev, isSidePeekOpen: false }));
        createTrackedTimeout(() => {
          if (isMountedRef.current) {
            setEditingState((prev) => ({ ...prev, sidePeekSubscription: null }));
            openEditForm?.(subscription);
          }
        }, 300);
      },
    }),
    [openEditForm, createTrackedTimeout]
  );

  // Card modal handlers - FIXED: Consolidated state management
  const cardModalHandlers = useMemo(
    () => ({
      openCardModal: () => {
        if (isMountedRef.current) {
          setEditingState((prev) => ({ ...prev, editingCard: null }));
          setModalState((prev) => ({ ...prev, isCardModalOpen: true }));
        }
      },
      openEditCardModal: (card: FullPaymentCard) => {
        if (isMountedRef.current) {
          setEditingState((prev) => ({ ...prev, editingCard: card }));
          setModalState((prev) => ({ ...prev, isCardModalOpen: true }));
        }
      },
      closeCardModal: () => {
        if (isMountedRef.current) {
          setModalState((prev) => ({ ...prev, isCardModalOpen: false }));
          setEditingState((prev) => ({ ...prev, editingCard: null }));
        }
      },
    }),
    []
  );

  // Card save handler - FIXED: Proper validation and error handling
  const handleCardSave = useCallback(
    (cardData: Omit<FullPaymentCard, "id" | "dateAdded">) => {
      if (!cardData || typeof cardData !== "object" || !isMountedRef.current) return;

      try {
        if (editingState.editingCard) {
          handleEditCard?.({ ...editingState.editingCard, ...cardData });
        } else {
          handleAddCard?.(cardData);
        }
        cardModalHandlers.closeCardModal();
      } catch (error) {
        console.error("Card save failed:", error);
      }
    },
    [editingState.editingCard, handleEditCard, handleAddCard, cardModalHandlers]
  );

  // Data sync handler - FIXED: Proper error handling and conditions
  const handleDataSync = useCallback(async () => {
    if (
      !connectionState.isOnline ||
      !connectionState.cloudSyncEnabled ||
      !stableUserId ||
      !triggerDataSync
    ) {
      return;
    }

    try {
      await triggerDataSync();
    } catch (error) {
      console.error("Data sync failed:", error);
    }
  }, [connectionState.isOnline, connectionState.cloudSyncEnabled, stableUserId, triggerDataSync]);

  // Computed values - FIXED: Optimized with proper null safety
  const computedValues = useMemo(() => {
    debugLog("computedValues recalculated", {
      subscriptionsCount: subscriptions?.length,
      notificationsCount: notifications?.length,
    });

    return {
      activeSubscriptionsCount: Array.isArray(subscriptions)
        ? subscriptions.filter((sub) => sub?.status === "active").length
        : 0,
      unreadNotificationsCount: Array.isArray(notifications)
        ? notifications.filter((n) => n && !n.read).length
        : 0,
    };
  }, [subscriptions, notifications]);

  // Tab content renderer - FIXED: Simplified dependencies and error boundary
  const renderTabContent = useCallback(() => {
    if (!isMountedRef.current) return null;

    try {
      const props = {
        subscriptions: subscriptions || [],
        cards: paymentCards || [],
        settings: appSettings || defaultAppSettings,
        notifications: notifications || [],
        weeklyBudgets: weeklyBudgets || [],
      };

      switch (uiState.activeTab) {
        case "overview":
          return <DashboardTab {...props} />;
        case "subscriptions":
          return (
            <SubscriptionsUnifiedTab
              subscriptions={props.subscriptions}
              cards={props.cards}
              onEdit={openEditForm}
              onDelete={handleDeleteSubscription}
              onCancel={handleCancelSubscription}
              onReactivate={handleReactivateSubscription}
              onActivateFromWatchlist={handleActivateFromWatchlist}
              onAddNew={openAddForm}
              onAddToWatchlist={openWatchlistForm}
            />
          );
        case "planning":
          return (
            <PlanningTab
              subscriptions={props.subscriptions}
              weeklyBudgets={props.weeklyBudgets}
              onViewSubscription={handleViewSubscription}
              onUpdateSubscriptionDate={handleUpdateSubscriptionDate}
            />
          );
        case "intelligence":
          return (
            <IntelligenceTab
              subscriptions={props.subscriptions}
              cards={props.cards}
              onAutomationTrigger={() => {}}
            />
          );
        default:
          return <DashboardTab {...props} />;
      }
    } catch (error) {
      console.error("Tab content render error:", error);
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <p className="text-destructive">Something went wrong loading this tab.</p>
            <button
              onClick={() => {
                if (isMountedRef.current) {
                  setUiState((prev) => ({ ...prev, activeTab: "overview" }));
                }
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Return to Overview
            </button>
          </div>
        </div>
      );
    }
  }, [
    uiState.activeTab,
    subscriptions,
    paymentCards,
    appSettings,
    notifications,
    weeklyBudgets,
    defaultAppSettings,
    openEditForm,
    handleDeleteSubscription,
    handleCancelSubscription,
    handleReactivateSubscription,
    handleActivateFromWatchlist,
    openAddForm,
    openWatchlistForm,
    handleViewSubscription,
    handleUpdateSubscriptionDate,
  ]);

  // Cleanup effect - CRITICAL: Proper cleanup on unmount
  useEffect(() => {
    return () => {
      debugLog("AppContent unmounting", "cleaning up resources");
      isMountedRef.current = false;

      // Clear all timeouts
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutsRef.current.clear();

      // Run all cleanup functions
      cleanupFunctionsRef.current.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          console.error("Cleanup function error:", error);
        }
      });
      cleanupFunctionsRef.current.clear();
    };
  }, []);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p>Loading SubTracker...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <AppHeader
        user={user}
        activeTab={uiState.activeTab}
        setActiveTab={stableHandlers.setActiveTab}
        globalSearchTerm={uiState.globalSearchTerm}
        setGlobalSearchTerm={(term: string) => {
          if (isMountedRef.current) {
            setUiState((prev) => ({ ...prev, globalSearchTerm: term }));
          }
        }}
        isOnline={connectionState.isOnline}
        cloudSyncEnabled={connectionState.cloudSyncEnabled}
        isAuthenticated={isAuthenticated}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        isLoggingOut={false}
        isMobile={isMobile}
        isMobileMenuOpen={uiState.isMobileMenuOpen}
        setIsMobileMenuOpen={(open: boolean) => {
          if (isMountedRef.current) {
            setUiState((prev) => ({ ...prev, isMobileMenuOpen: open }));
          }
        }}
        isDarkMode={themeValues.isDarkMode}
        isStealthOps={themeValues.isStealthOps}
        textColors={themeValues.textColors}
        glassSecondaryStyles={themeValues.glassSecondaryStyles}
        triggerDataSync={handleDataSync}
        dataSyncManager={dataSyncManager}
        openSettingsModal={modalHandlers.openSettingsModal}
        handleQuickLogout={handleLogout}
        handleConfirmLogout={handleLogout}
      />

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 ${isMobile ? "pb-32" : ""}`}>
        <div className="p-4 sm:p-6 min-h-[calc(100vh-140px)] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/20 dark:border-gray-700/20">
          {renderTabContent()}
        </div>
      </div>

      {/* Floating Components */}
      <FloatingNotifications
        notifications={notifications || []}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        isDarkMode={themeValues.isDarkMode}
      />

      <QuickActionButton
        activeTab={uiState.activeTab}
        onTabChange={stableHandlers.setActiveTab}
        onAddNew={openAddForm}
        subscriptionsCount={computedValues.activeSubscriptionsCount}
        aiInsightsCount={computedValues.unreadNotificationsCount}
        isMobile={isMobile}
      />

      {/* Side Peek */}
      {editingState.sidePeekSubscription && (
        <SubscriptionSidePeek
          subscription={editingState.sidePeekSubscription}
          cards={paymentCards || []}
          isOpen={modalState.isSidePeekOpen}
          onClose={sidePeekHandlers.closeSidePeek}
          onEdit={sidePeekHandlers.handleSidePeekEdit}
          onDelete={handleDeleteSubscription}
          onCancel={handleCancelSubscription}
          onReactivate={handleReactivateSubscription}
          onActivateFromWatchlist={handleActivateFromWatchlist}
        />
      )}

      {/* Modals */}
      <Dialog open={uiState.isFormOpen} onOpenChange={stableHandlers.setIsFormOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          aria-describedby="subscription-form-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>
              {editingState.editingSubscription
                ? editingState.editingSubscription.status === "watchlist"
                  ? "Edit Watchlist Item"
                  : "Edit Subscription"
                : uiState.isWatchlistMode
                  ? "Add to Watchlist"
                  : "Add New Subscription"}
            </DialogTitle>
            <DialogDescription id="subscription-form-dialog-description">
              {editingState.editingSubscription
                ? "Update your subscription information and payment schedule."
                : uiState.isWatchlistMode
                  ? "Add a subscription you're considering to your watchlist."
                  : "Add a new subscription to track its costs and payment dates."}
            </DialogDescription>
          </DialogHeader>
          <SubscriptionForm
            subscription={editingState.editingSubscription || undefined}
            cards={paymentCards || []}
            onSave={
              editingState.editingSubscription ? handleEditSubscription : handleAddSubscription
            }
            onCancel={closeForm}
            isWatchlistMode={uiState.isWatchlistMode}
            onManageCards={cardModalHandlers.openCardModal}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={modalState.isCardModalOpen} onOpenChange={cardModalHandlers.closeCardModal}>
        <DialogContent className="max-w-md" aria-describedby="payment-card-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {editingState.editingCard ? "Edit Payment Card" : "Add Payment Card"}
            </DialogTitle>
            <DialogDescription id="payment-card-dialog-description">
              {editingState.editingCard
                ? "Update your payment card information and manage billing details."
                : "Add a new payment card for tracking subscription payments and billing."}
            </DialogDescription>
          </DialogHeader>
          <PaymentCardForm
            card={editingState.editingCard || undefined}
            onSave={handleCardSave}
            onCancel={cardModalHandlers.closeCardModal}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={modalState.isSettingsModalOpen} onOpenChange={modalHandlers.closeSettingsModal}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          aria-describedby="settings-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>Profile & Settings</DialogTitle>
            <DialogDescription id="settings-dialog-description">
              Customize your SubTracker experience, manage preferences, and configure advanced
              settings.
            </DialogDescription>
          </DialogHeader>
          <AdvancedSettingsTab
            settings={appSettings || defaultAppSettings}
            onUpdateSettings={handleUpdateSettings}
            onExportData={handleExportData}
            onImportData={modalHandlers.openImportDialog}
            onResetApp={handleResetApp}
          />
        </DialogContent>
      </Dialog>

      <DataRecoveryDialog
        open={modalState.isDataRecoveryOpen}
        onOpenChange={modalHandlers.closeDataRecovery}
        user={user}
        isStealthOps={themeValues.isStealthOps}
        isDarkMode={themeValues.isDarkMode}
        textColors={themeValues.textColors}
        glassAccentStyles={themeValues.glassAccentStyles}
        onDataRecovered={handleDataRecovered}
      />

      <ImportDialog
        open={modalState.isImportDialogOpen}
        onOpenChange={modalHandlers.closeImportDialog}
        onImport={handleImportData}
        existingSubscriptions={subscriptions || []}
        existingCards={paymentCards || []}
      />

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        richColors
        theme={themeValues.isDarkMode ? "dark" : "light"}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
