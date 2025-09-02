import { useState, useEffect } from "react";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { DashboardTab } from "../components/DashboardTab";
import { Sidebar } from "../components/Sidebar";
import { TestBanner } from "../components/TestBanner";
import { TestComponent } from "../components/TestComponent";
import SubscriptionsView from "../components/views/SubscriptionsView";
import BudgetPodsView from "../components/views/BudgetPodsView";
import { EnhancedBudgetPodsView } from "../components/views/EnhancedBudgetPodsView";
import InvestmentsView from "../components/views/InvestmentsView";
import NotebooksView from "../components/views/NotebooksView";
import CalendarView from "../components/views/CalendarView";
import { PaymentCardsView } from "../components/views/PaymentCardsView";
import { SettingsView } from "../components/views/SettingsView";
import { FinancialOverview } from "../components/financial/FinancialOverview";
import { useAuth } from "../contexts/AuthContext";
import { useDataManagement } from "../hooks/useDataManagement";
import { 
  INITIAL_SUBSCRIPTIONS, 
  INITIAL_PAYMENT_CARDS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_APP_SETTINGS 
} from "../data/mockData";
import type { FullSubscription, PaymentCard as FullPaymentCard } from "../types/subscription";
import type { AppSettings, AppNotification } from "../types/constants";

export const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const [subscriptions, setSubscriptions] = useState<FullSubscription[]>([]);
  const [paymentCards, setPaymentCards] = useState<FullPaymentCard[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(INITIAL_APP_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Initialize with demo data on first load
  useEffect(() => {
    const initializeData = () => {
      // Check if we have data in localStorage
      const localDataKey = `subtracker_data_${user?.id || 'local-user-001'}`;
      const storedData = localStorage.getItem(localDataKey);
      
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          setSubscriptions(parsed.subscriptions || []);
          setPaymentCards(parsed.paymentCards || []);
          setNotifications(parsed.notifications || []);
          setAppSettings(parsed.appSettings || INITIAL_APP_SETTINGS);
          setHasInitialized(true);
        } catch (error) {
          console.error('Error parsing stored data:', error);
          // Initialize with demo data if parsing fails
          loadDemoData();
        }
      } else if (!hasInitialized) {
        // No stored data, load demo data
        loadDemoData();
      }
      
      setIsLoading(false);
    };

    const loadDemoData = () => {
      console.log('Loading demo data...');
      setSubscriptions(INITIAL_SUBSCRIPTIONS);
      setPaymentCards(INITIAL_PAYMENT_CARDS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setAppSettings(INITIAL_APP_SETTINGS);
      setHasInitialized(true);
      
      // Save to localStorage
      const localDataKey = `subtracker_data_${user?.id || 'local-user-001'}`;
      const dataToStore = {
        subscriptions: INITIAL_SUBSCRIPTIONS,
        paymentCards: INITIAL_PAYMENT_CARDS,
        notifications: INITIAL_NOTIFICATIONS,
        appSettings: INITIAL_APP_SETTINGS,
      };
      localStorage.setItem(localDataKey, JSON.stringify(dataToStore));
    };

    // Small delay to simulate loading
    setTimeout(initializeData, 100);
  }, [user, hasInitialized]);

  // Save data whenever it changes
  useEffect(() => {
    if (hasInitialized && subscriptions.length > 0) {
      const localDataKey = `subtracker_data_${user?.id || 'local-user-001'}`;
      const dataToStore = {
        subscriptions,
        paymentCards,
        notifications,
        appSettings,
      };
      localStorage.setItem(localDataKey, JSON.stringify(dataToStore));
    }
  }, [subscriptions, paymentCards, notifications, appSettings, hasInitialized, user]);

  const handleAddNew = () => {
    // TODO: Implement add new subscription
    console.log('Add new subscription');
  };

  const handleViewCalendar = () => {
    // TODO: Implement view calendar
    console.log('View calendar');
  };

  const handleManageCards = () => {
    // TODO: Implement manage cards
    console.log('Manage cards');
  };

  const handleCheckWatchlist = () => {
    // TODO: Implement check watchlist
    console.log('Check watchlist');
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <DashboardTab
            subscriptions={subscriptions}
            cards={paymentCards}
            settings={appSettings}
            notifications={notifications}
            onAddNew={handleAddNew}
            onViewCalendar={handleViewCalendar}
            onManageCards={handleManageCards}
            onCheckWatchlist={handleCheckWatchlist}
          />
        );
      case 'subscriptions':
        return (
          <SubscriptionsView
            subscriptions={subscriptions}
            setSubscriptions={setSubscriptions}
            paymentCards={paymentCards}
          />
        );
      case 'budgetpods':
        return (
          <EnhancedBudgetPodsView
            subscriptions={subscriptions}
            userId={user?.id || 'local-user-001'}
          />
        );
      case 'investments':
        return (
          <InvestmentsView />
        );
      case 'notebooks':
        return (
          <NotebooksView />
        );
      case 'calendar':
        return (
          <CalendarView subscriptions={subscriptions} />
        );
      case 'cards':
        return (
          <PaymentCardsView userId={user?.id || 'local-user-001'} />
        );
      case 'financials':
        return (
          <FinancialOverview />
        );
      case 'settings':
        return (
          <SettingsView />
        );
      default:
        return <DashboardTab
          subscriptions={subscriptions}
          cards={paymentCards}
          settings={appSettings}
          notifications={notifications}
          onAddNew={handleAddNew}
          onViewCalendar={handleViewCalendar}
          onManageCards={handleManageCards}
          onCheckWatchlist={handleCheckWatchlist}
        />;
    }
  };

  return (
    <ProtectedRoute>
      <TestComponent />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
          isMobileOpen={sidebarMobileOpen}
          onMobileToggle={setSidebarMobileOpen}
        />
        
        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <header className="bg-white dark:bg-gray-800 shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {/* Mobile menu button */}
                  <button
                    onClick={() => setSidebarMobileOpen(!sidebarMobileOpen)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    SubTracker AI
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.email || 'Local User'}
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
          
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};