import { Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { RouterProvider } from "react-router-dom";

import { LandingPage } from "./components/LandingPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useDataManagement } from "./hooks/useDataManagement";
import { useIsDesktop, useIsMobile } from "./hooks/useDeviceDetection";
import createAppRouter from "./router";
import { applyThemeClasses } from "./utils/theme";

const AppContent = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const isDesktop = useIsDesktop();
  const isMobile = useIsMobile();

  // Stable user reference
  const stableUserId = useMemo(() => {
    return user?.id ?? null;
  }, [user?.id]);

  // Data Management Hook
  const dataManagement = useDataManagement(
    isAuthenticated,
    stableUserId,
    true, // isOnline
    false // cloudSyncEnabled - disabled for testing
  );

  // Destructure data management with null safety
  const {
    subscriptions = [],
    paymentCards = [],
    appSettings,
    notifications = [],
    weeklyBudgets = [],
  } = dataManagement || {};

  // Default app settings
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

  // Apply light theme
  useMemo(() => {
    applyThemeClasses("light");
  }, []);

  // Props for router
  const appShellProps = useMemo(() => {
    return {
      user,
      globalSearchTerm: "",
      setGlobalSearchTerm: () => {},
      isOnline: true,
      cloudSyncEnabled: false,
      isAuthenticated,
      syncStatus: "idle" as const,
      lastSyncTime: null,
      isLoggingOut: false,
      isDarkMode: false,
      isStealthOps: false,
      textColors: { primary: "", secondary: "", muted: "" },
      glassSecondaryStyles: {},
      triggerDataSync: async () => {},
      dataSyncManager: null,
      openSettingsModal: () => {},
      handleQuickLogout: async () => {},
      handleConfirmLogout: async () => {},
      unreadNotificationsCount: 0,
      // Data for route components
      subscriptions,
      paymentCards,
      appSettings: appSettings || defaultAppSettings,
      notifications,
      weeklyBudgets,
      defaultAppSettings,
      // Handlers for route components
      openEditForm: () => {},
      handleDeleteSubscription: () => {},
      handleCancelSubscription: () => {},
      handleReactivateSubscription: () => {},
      handleActivateFromWatchlist: () => {},
      openAddForm: () => {},
      openWatchlistForm: () => {},
      handleViewSubscription: () => {},
      handleUpdateSubscriptionDate: () => {},
      handleUpdateCategories: () => {},
    };
  }, [user, isAuthenticated, subscriptions, paymentCards, appSettings, notifications, weeklyBudgets, defaultAppSettings]);

  // Create router with current props
  const router = useMemo(() => {
    return createAppRouter(appShellProps);
  }, [appShellProps]);

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