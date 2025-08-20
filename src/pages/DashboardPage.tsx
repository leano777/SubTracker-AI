import { ProtectedRoute } from "../components/ProtectedRoute";
// We need to import and use AppContent directly since App already includes AuthProvider
import { Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Toaster } from "sonner";
import { initializeAccessibility, announce } from "../utils/accessibility/focusManagement";
import { useTabReducer } from "../hooks/useTabReducer";

import { AdvancedSettingsTab } from "../components/AdvancedSettingsTab";
import { AppHeader } from "../components/AppHeader";
import { DashboardTab } from "../components/DashboardTab";
import { DebugToolButton } from "../components/DebugToolButton";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { DataRecoveryDialog } from "../components/DataRecoveryDialog";
import { FloatingNotifications } from "../components/FloatingNotifications";
import { ImportDialog } from "../components/ImportDialog";
import { IntelligenceTab } from "../components/IntelligenceTab";
import { LandingPage } from "../components/LandingPage";
import { PaymentCardForm } from "../components/PaymentCardForm";
import { PlanningTab } from "../components/PlanningTab";
import { QuickActionButton } from "../components/QuickActionButton";
import { SubscriptionForm } from "../components/SubscriptionForm";
import { SubscriptionSidePeek } from "../components/SubscriptionSidePeek";
import { SubscriptionsUnifiedTab } from "../components/SubscriptionsUnifiedTab";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { useAuth } from "../contexts/AuthContext";
import { useAppHandlers } from "../hooks/useAppHandlers";
import { useDataManagement } from "../hooks/useDataManagement";
import { useIsDesktop, useIsMobile } from "../hooks/useDeviceDetection";
import type { FullSubscription, PaymentCard as FullPaymentCard } from "../types/subscription";
import type { AppSettings, AppNotification } from "../types/constants";
import { dataSyncManager } from "../utils/dataSync";
import { formatDateForStorage } from "../utils/dateUtils";
import {
  applyThemeClasses,
  getTextColors,
  getGlassSecondaryStyles,
  getGlassAccentStyles,
} from "../utils/theme";

export const DashboardPage = () => {
  // For now, just render a simplified authenticated dashboard
  const { user, signOut } = useAuth();
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                SubTracker AI Dashboard
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Welcome to Your Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your subscription management features will appear here. The full dashboard is being loaded...
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};