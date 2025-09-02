import { useState, useEffect } from "react";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { DashboardTab } from "../components/DashboardTab";
import SubscriptionsView from "../components/views/SubscriptionsView";
import BudgetPodsView from "../components/views/BudgetPodsView";
import { EnhancedBudgetPodsView } from "../components/views/EnhancedBudgetPodsView";
import InvestmentsView from "../components/views/InvestmentsView";
import NotebooksView from "../components/views/NotebooksView";
import CalendarView from "../components/views/CalendarView";
import { PaymentCardsView } from "../components/views/PaymentCardsView";
import { SettingsView } from "../components/views/SettingsView";
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                SubTracker AI
              </h1>
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
        
        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`${
                  activeTab === 'subscriptions'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Subscriptions
              </button>
              <button
                onClick={() => setActiveTab('budgetpods')}
                className={`${
                  activeTab === 'budgetpods'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Budget Pods
              </button>
              <button
                onClick={() => setActiveTab('investments')}
                className={`${
                  activeTab === 'investments'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Investments
              </button>
              <button
                onClick={() => setActiveTab('notebooks')}
                className={`${
                  activeTab === 'notebooks'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Notebooks
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`${
                  activeTab === 'calendar'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Calendar
              </button>
              <button
                onClick={() => setActiveTab('cards')}
                className={`${
                  activeTab === 'cards'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Payment Cards
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Settings
              </button>
            </nav>
          </div>
        </div>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
      </div>
    </ProtectedRoute>
  );
};