import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'

// Use our working test but with the real router components
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppShell from "./components/AppShell";
import { LandingPage } from "./components/LandingPage";
import { SubscriptionsUnifiedTab } from "./components/SubscriptionsUnifiedTab";
import { IntelligenceTab } from "./components/IntelligenceTab";

// Simple placeholder components to test without complex imports
function SimpleDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Dashboard functionality will be restored once recharts issues are resolved.</p>
    </div>
  );
}

// Real Subscriptions Component
function RealSubscriptions() {
  return (
    <SubscriptionsUnifiedTab
      subscriptions={[]} // Empty for now
      cards={[]} // Empty for now
      onEdit={() => {}} // Placeholder
      onDelete={() => {}} // Placeholder
      onCancel={() => {}} // Placeholder
      onReactivate={() => {}} // Placeholder
      onActivateFromWatchlist={() => {}} // Placeholder
      onAddNew={() => {}} // Placeholder
      onAddToWatchlist={() => {}} // Placeholder
    />
  );
}

function SimplePlanning() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Planning</h1>
      <p>Planning functionality will be restored once recharts issues are resolved.</p>
    </div>
  );
}

// Real Intelligence Component
function RealIntelligence() {
  return (
    <IntelligenceTab
      subscriptions={[]} // Empty for now
      cards={[]} // Empty for now
      onAutomationTrigger={() => {}} // Placeholder
    />
  );
}

// Create minimal props for AppShell
const createAppShellProps = (user: any, isAuthenticated: boolean) => ({
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
  textColors: { 
    primary: "text-gray-900", 
    secondary: "text-gray-700", 
    muted: "text-gray-600" 
  },
  glassSecondaryStyles: {},
  triggerDataSync: async () => {},
  dataSyncManager: { 
    isSyncInProgress: () => false,  // Function that returns boolean
    lastSyncTime: null, 
    syncError: null,
    sync: async () => {},
    clearError: () => {}
  },
  openSettingsModal: () => {},
  handleQuickLogout: async () => {},
  handleConfirmLogout: async () => {},
  unreadNotificationsCount: 0,
});

function WorkingApp() {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 animate-spin mx-auto border-4 border-blue-500 border-t-transparent rounded-full" />
          <p>Loading SubTracker...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <AppShell {...createAppShellProps(user, isAuthenticated)} />,
      children: [
        { index: true, element: <SimpleDashboard /> },
        { path: "subscriptions", element: <RealSubscriptions /> },
        { path: "planning", element: <SimplePlanning /> },
        { path: "intelligence", element: <RealIntelligence /> },
      ],
    },
  ]);
  
  return <RouterProvider router={router} />;
}

const App = () => {
  return (
    <AuthProvider>
      <WorkingApp />
    </AuthProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
