import { Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import { AdvancedSettingsTab } from "./components/AdvancedSettingsTab";
import { DataRecoveryDialog } from "./components/DataRecoveryDialog";
import { FloatingNotifications } from "./components/FloatingNotifications";
import { ImportDialog } from "./components/ImportDialog";
import { LandingPage } from "./components/LandingPage";
import { PaymentCardForm } from "./components/PaymentCardForm";
import { QuickActionButton } from "./components/QuickActionButton";
import { SubscriptionForm } from "./components/SubscriptionForm";
import { SubscriptionSidePeek } from "./components/SubscriptionSidePeek";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useAppHandlers } from "./hooks/useAppHandlers";
import { useDataManagement } from "./hooks/useDataManagement";
import { useIsDesktop, useIsMobile } from "./hooks/useDeviceDetection";
import createModernAppRouter from "./modernRouter";
import type { FullSubscription, PaymentCard as FullPaymentCard } from "./types/subscription";
import type { AppSettings, AppNotification } from "./types/constants";
import { dataSyncManager } from "./utils/dataSync";
import { formatDateForStorage } from "./utils/dateUtils";
import {
  applyThemeClasses,
  getTextColors,
  getGlassSecondaryStyles,
  getGlassAccentStyles,
} from "./utils/theme";

const AppContent = () => {
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

  // Core UI State - Simplified for router-based navigation
  const [uiState, setUiState] = useState({
    isFormOpen: false,
    isWatchlistMode: false,
    globalSearchTerm: "",
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
    cloudSyncEnabled: false, // TEMPORARILY DISABLED - TESTING SYNC FREEZE ISSUE
  }));

  // Stable user reference - Only derive userId to prevent object reference changes
  const stableUserId = useMemo(() => {
    return user?.id ?? null;
  }, [user?.id]);

  // Data Management Hook
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

    const isDarkMode = currentTheme === "dark";
    const isStealthOps = currentTheme === "stealth-ops";

    return {
      currentTheme,
      isDarkMode,
      isStealthOps,
      textColors: getTextColors(isStealthOps, isDarkMode),
      glassSecondaryStyles: getGlassSecondaryStyles(isStealthOps, isDarkMode),
      glassAccentStyles: getGlassAccentStyles(isStealthOps, isDarkMode),
    };
  }, [appSettings?.preferences?.theme]);

  // Apply theme when it changes
  useEffect(() => {
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

  // Online/offline handling
  useEffect(() => {
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

  // Load user data
  useEffect(() => {
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

    void loadData();

    return () => {
      isEffectMounted = false;
    };
  }, [isAuthenticated, stableUserId, loadUserData]);

  // Stable handlers
  const stableHandlers = useMemo(() => {
    return {
      setIsFormOpen: (open: boolean | ((prev: boolean) => boolean)) => {
        if (isMountedRef.current) {
          if (typeof open === "function") {
            setUiState((prev) => ({ ...prev, isFormOpen: open(prev.isFormOpen) }));
          } else {
            setUiState((prev) => ({ ...prev, isFormOpen: open }));
          }
        }
      },
      setIsWatchlistMode: (mode: boolean | ((prev: boolean) => boolean)) => {
        if (isMountedRef.current) {
          if (typeof mode === "function") {
            setUiState((prev) => ({ ...prev, isWatchlistMode: mode(prev.isWatchlistMode) }));
          } else {
            setUiState((prev) => ({ ...prev, isWatchlistMode: mode }));
          }
        }
      },
      setEditingSubscription: (
        subscription:
          | FullSubscription
          | null
          | ((prev: FullSubscription | null) => FullSubscription | null)
      ) => {
        if (isMountedRef.current) {
          if (typeof subscription === "function") {
            setEditingState((prev) => ({
              ...prev,
              editingSubscription: subscription(prev.editingSubscription),
            }));
          } else {
            setEditingState((prev) => ({ ...prev, editingSubscription: subscription }));
          }
        }
      },
    };
  }, []);

  // App Handlers
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
    handleExportData,
    openEditForm,
    closeForm,
    openAddForm,
    openWatchlistForm,
  } = useAppHandlers({
    ...appHandlersConfig,
    setActiveTab: (tab: string) => {
      // Handle tab change logic or navigate to appropriate route
      console.log('Tab changed to:', tab);
    }
  });

  // Logout handler
  const handleLogout = useCallback(async () => {
    try {
      // Clear state synchronously first
      if (isMountedRef.current) {
        setSubscriptions?.([]);
        setPaymentCards?.([]);
        setNotifications?.([]);
        setUiState({
          isFormOpen: false,
          isWatchlistMode: false,
          globalSearchTerm: "",
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

  // Modal handlers
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

  // Settings update handler
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

  // Reset app handler
  const handleResetApp = useCallback(() => {
    if (!isMountedRef.current) return;

    try {
      // Reset all state atomically
      setSubscriptions?.([]);
      setPaymentCards?.([]);
      setNotifications?.([]);
      setAppSettings?.(defaultAppSettings);

      setUiState({
        isFormOpen: false,
        isWatchlistMode: false,
        globalSearchTerm: "",
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

  // Data recovery handler
  const handleDataRecovered = useCallback(
    (data: {
      subscriptions?: FullSubscription[];
      paymentCards?: FullPaymentCard[];
      notifications?: AppNotification[];
      appSettings?: Partial<AppSettings>;
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
          setAppSettings?.(data.appSettings as AppSettings);
        }

        modalHandlers.closeDataRecovery();
      } catch (error) {
        console.error("Data recovery failed:", error);
      }
    },
    [setSubscriptions, setPaymentCards, setNotifications, setAppSettings, modalHandlers]
  );

  // Import data handler
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
              dateAdded: card.dateAdded ?? new Date().toISOString().split("T")[0],
              name: card.name ?? "Imported Card",
              lastFour: card.lastFour ?? "0000",
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

  // Subscription view handler
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

  // Date update handler
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

  // Categories update handler for planning tab
  const handleUpdateCategories = useCallback((categories: any) => {
    if (!isMountedRef.current) return;
    // TODO: Implement category updates when needed
  }, []);

  // Side peek handlers
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

  // Card modal handlers
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

  // Card save handler
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

  // Data sync handler
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

  // Computed values
  const computedValues = useMemo(() => {
    return {
      activeSubscriptionsCount: Array.isArray(subscriptions)
        ? subscriptions.filter((sub) => sub?.status === "active").length
        : 0,
      unreadNotificationsCount: Array.isArray(notifications)
        ? notifications.filter((n) => n && !n.read).length
        : 0,
    };
  }, [subscriptions, notifications]);

  // Props for AppShell and child components
  const appShellProps = useMemo(() => {
    return {
      user,
      globalSearchTerm: uiState.globalSearchTerm,
      setGlobalSearchTerm: (term: string) => {
        if (isMountedRef.current) {
          setUiState((prev) => ({ ...prev, globalSearchTerm: term }));
        }
      },
      isOnline: connectionState.isOnline,
      cloudSyncEnabled: connectionState.cloudSyncEnabled,
      isAuthenticated,
      syncStatus,
      lastSyncTime,
      isLoggingOut: false,
      isDarkMode: themeValues.isDarkMode,
      isStealthOps: themeValues.isStealthOps,
      textColors: themeValues.textColors,
      glassSecondaryStyles: themeValues.glassSecondaryStyles,
      triggerDataSync: handleDataSync,
      dataSyncManager,
      openSettingsModal: modalHandlers.openSettingsModal,
      handleQuickLogout: handleLogout,
      handleConfirmLogout: handleLogout,
      unreadNotificationsCount: computedValues.unreadNotificationsCount,
      // Data for route components
      subscriptions,
      paymentCards,
      appSettings: appSettings || defaultAppSettings,
      notifications,
      weeklyBudgets,
      defaultAppSettings,
      // Handlers for route components
      openEditForm,
      handleDeleteSubscription,
      handleCancelSubscription,
      handleReactivateSubscription,
      handleActivateFromWatchlist,
      openAddForm,
      openWatchlistForm,
      handleViewSubscription,
      handleUpdateSubscriptionDate,
      handleUpdateCategories,
    };
  }, [
    user,
    uiState.globalSearchTerm,
    connectionState,
    isAuthenticated,
    syncStatus,
    lastSyncTime,
    themeValues,
    handleDataSync,
    modalHandlers.openSettingsModal,
    handleLogout,
    computedValues.unreadNotificationsCount,
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
    handleUpdateCategories,
  ]);

  // Create router with current props
  const router = useMemo(() => {
    return createModernAppRouter(appShellProps);
  }, [appShellProps]);

  // Mount effect
  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
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
      {/* Router Provider */}
      <RouterProvider router={router} />

      {/* Global Floating Components */}
      <FloatingNotifications
        notifications={notifications || []}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        isDarkMode={themeValues.isDarkMode}
      />

      <QuickActionButton
        activeTab="" // Not used in router version
        onTabChange={() => {}} // Not used in router version
        onAddNew={openAddForm}
        subscriptionsCount={computedValues.activeSubscriptionsCount}
        aiInsightsCount={computedValues.unreadNotificationsCount}
        isMobile={isMobile}
      />

      {/* Side Peek - temporarily disabled */}
      {/*
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
      */}

      {/* Global Modals - temporarily disabled */}
      {/*
      <Dialog open={uiState.isFormOpen} onOpenChange={stableHandlers.setIsFormOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20 dark:border-gray-700/30"
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
        <DialogContent
          className="max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20 dark:border-gray-700/30"
          aria-describedby="payment-card-dialog-description"
        >
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
          className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20 dark:border-gray-700/30"
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
            onExportData={() => handleExportData("json")}
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

      */}

      {/* Toast Notifications - temporarily disabled */}
      {/*
      <Toaster
        position="bottom-right"
        richColors
        theme={themeValues.isDarkMode ? "dark" : "light"}
      />
      */}
    </div>
  );
};

const RouterApp = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default RouterApp;
