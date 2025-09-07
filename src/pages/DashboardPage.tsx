import { useState, useEffect } from "react";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { CleanDashboard } from "../components/CleanDashboard";
import { Sidebar } from "../components/Sidebar";
import { OptimizedSubscriptionsView } from "../components/views/OptimizedSubscriptionsView";
import BudgetPodsView from "../components/views/BudgetPodsView";
import { EnhancedBudgetPodsView } from "../components/views/EnhancedBudgetPodsView";
import InvestmentsView from "../components/views/InvestmentsView";
import NotebooksView from "../components/views/NotebooksView";
import CalendarView from "../components/views/CalendarView";
import { PaymentCardsView } from "../components/views/PaymentCardsView";
import { SettingsView } from "../components/views/SettingsView";
import { FinancialOverview } from "../components/financial/FinancialOverview";
import { useAuth } from "../contexts/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";
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

  const handleNavigate = (view: string) => {
    setActiveTab(view);
  };

  const handleQuickAction = (action: string, data?: any) => {
    switch(action) {
      case 'add-subscription':
        setActiveTab('subscriptions');
        // TODO: Open add modal
        break;
      case 'review-unused':
      case 'review-all-unused':
        setActiveTab('subscriptions');
        // TODO: Filter to show unused
        break;
      case 'cancel-subscription':
        // TODO: Handle cancel
        console.log('Cancel subscription', data);
        break;
      case 'keep-subscription':
        // TODO: Mark as reviewed
        console.log('Keep subscription', data);
        break;
      case 'view-subscription':
        setActiveTab('subscriptions');
        // TODO: Focus on specific subscription
        break;
      case 'export-data':
        // TODO: Export functionality
        console.log('Export data');
        break;
      default:
        console.log('Unknown action:', action);
    }
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
          <CleanDashboard
            subscriptions={subscriptions}
            monthlyBudget={appSettings.monthlyBudget || 500}
            onNavigate={handleNavigate}
          />
        );
      case 'subscriptions':
        return (
          <OptimizedSubscriptionsView
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
        return (
          <CleanDashboard
            subscriptions={subscriptions}
            monthlyBudget={appSettings.monthlyBudget || 500}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-primary flex">
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
          <header className="bg-secondary border-b border-primary shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {/* Mobile menu button */}
                  <button
                    onClick={() => setSidebarMobileOpen(!sidebarMobileOpen)}
                    className="lg:hidden p-2 rounded-lg hover:bg-hover transition-colors text-primary"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="text-2xl font-bold text-primary">
                    SubTracker AI
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <span className="text-sm text-secondary">
                    {user?.email || 'Local User'}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2 bg-error hover:opacity-90 text-white rounded-lg transition-all"
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