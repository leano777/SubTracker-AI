import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useFinancialStore } from './stores/useFinancialStore';
// Using local auth to bypass Supabase issues
import { AuthProvider, useAuth } from './contexts/LocalAuthContext';
import { MobileDashboard } from './components/dashboard/MobileDashboard';
import { DashboardTab } from './components/DashboardTab';
import { SubscriptionsUnifiedTab } from './components/SubscriptionsUnifiedTab';
import { Watchlist } from './components/Watchlist';
import { CalendarView } from './components/CalendarView';
import { AdvancedSettingsTab } from './components/AdvancedSettingsTab';
import { SimpleLandingPage } from './components/SimpleLandingPage';
import { ModernSubscriptionForm } from './components/forms/ModernSubscriptionForm';
import { PaymentCardForm } from './components/PaymentCardForm';
import { SmartPayPeriodCalculator } from './components/financial/SmartPayPeriodCalculator';
import { BudgetPods } from './components/budget/BudgetPods';
import { InvestmentPortfolio } from './components/portfolio/InvestmentPortfolio';
import { FinancialNotebooks } from './components/notebooks/FinancialNotebooks';
import { FloatingNotifications } from './components/FloatingNotifications';
import { initializeDemoData } from './data/demoData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { 
  Home, 
  CreditCard, 
  Eye, 
  Calendar as CalendarIcon,
  TrendingUp,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Calculator,
  PiggyBank
} from 'lucide-react';
import { applyThemeClasses } from './utils/theme';
import type { FullSubscription } from './types/subscription';

const SimplifiedAppContent = () => {
  const { user, loading: authLoading, isAuthenticated, signOut } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [demoDataLoaded, setDemoDataLoaded] = useState(false);
  
  const {
    subscriptions,
    paymentCards,
    notifications,
    appSettings,
    weeklyBudgets,
    budgetPods,
    investments,
    notebookEntries,
    activeView,
    modals,
    editingItems,
    setActiveView,
    openModal,
    closeModal,
    setEditingItem,
    clearEditingItem,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    addPaymentCard,
    updatePaymentCard,
    getActiveSubscriptions,
    getWatchlistItems,
    getTotalMonthlySpend,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updateSettings,
    setMobileView,
    setSubscriptions,
    setPaymentCards,
    setNotifications,
    setWeeklyBudgets,
    setBills,
    setInvestments,
    setFinancialGoals,
    setNotebookEntries,
    setBudgetPods,
    addBudgetPod,
    updateBudgetPod,
    deleteBudgetPod,
    addToBudgetPod,
    withdrawFromBudgetPod,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addNotebookEntry,
    updateNotebookEntry,
    deleteNotebookEntry,
  } = useFinancialStore();

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setMobileView(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setMobileView]);

  // Apply theme
  useEffect(() => {
    const theme = appSettings?.preferences?.theme || 'light';
    applyThemeClasses(theme);
  }, [appSettings?.preferences?.theme]);

  // Load demo data when authenticated (only once)
  useEffect(() => {
    if (isAuthenticated && !demoDataLoaded && subscriptions.length === 0) {
      const demoData = initializeDemoData();
      setSubscriptions(demoData.subscriptions);
      setPaymentCards(demoData.paymentCards);
      setNotifications(demoData.notifications);
      setWeeklyBudgets(demoData.weeklyBudgets);
      setBills(demoData.bills);
      setInvestments(demoData.investments);
      setFinancialGoals(demoData.financialGoals);
      setNotebookEntries(demoData.notebookEntries);
      setBudgetPods(demoData.budgetPods);
      setDemoDataLoaded(true);
    }
  }, [isAuthenticated, demoDataLoaded, subscriptions.length, setSubscriptions, setPaymentCards, setNotifications, setWeeklyBudgets, setBills, setInvestments, setFinancialGoals, setNotebookEntries, setBudgetPods]);

  // Handle subscription form submission
  const handleSubscriptionSave = (subscriptionData: Partial<FullSubscription>) => {
    if (editingItems.subscription) {
      updateSubscription(editingItems.subscription.id, subscriptionData);
    } else {
      const newSubscription: FullSubscription = {
        id: `sub-${Date.now()}`,
        dateAdded: new Date().toISOString().split('T')[0],
        isActive: subscriptionData.status === 'active',
        cost: subscriptionData.price || 0,
        billingCycle: subscriptionData.frequency === 'monthly' ? 'monthly' : 
                      subscriptionData.frequency === 'yearly' ? 'yearly' : 'monthly',
        ...subscriptionData as FullSubscription,
      };
      addSubscription(newSubscription);
    }
    closeModal('subscription');
    clearEditingItem('subscription');
  };

  // Handle card form submission
  const handleCardSave = (cardData: any) => {
    if (editingItems.card) {
      updatePaymentCard(editingItems.card.id, cardData);
    } else {
      addPaymentCard({
        id: `card-${Date.now()}`,
        isDefault: false,
        ...cardData,
      });
    }
    closeModal('card');
    clearEditingItem('card');
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Financial Dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <SimpleLandingPage />;
  }

  // Mobile view - show mobile dashboard
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <MobileDashboard />
        
        {/* Subscription Form Modal */}
        <Dialog open={modals.subscription} onOpenChange={() => closeModal('subscription')}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItems.subscription ? 'Edit Subscription' : 'Add Subscription'}
              </DialogTitle>
              <DialogDescription>
                Track your recurring payments and subscriptions
              </DialogDescription>
            </DialogHeader>
            <ModernSubscriptionForm
              subscription={editingItems.subscription || undefined}
              cards={paymentCards}
              onSave={handleSubscriptionSave}
              onCancel={() => {
                closeModal('subscription');
                clearEditingItem('subscription');
              }}
              isWatchlistMode={false}
              onManageCards={() => openModal('card')}
            />
          </DialogContent>
        </Dialog>

        {/* Card Form Modal */}
        <Dialog open={modals.card} onOpenChange={() => closeModal('card')}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItems.card ? 'Edit Payment Card' : 'Add Payment Card'}
              </DialogTitle>
            </DialogHeader>
            <PaymentCardForm
              card={editingItems.card || undefined}
              onSave={handleCardSave}
              onCancel={() => {
                closeModal('card');
                clearEditingItem('card');
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Floating Notifications */}
        <FloatingNotifications
          notifications={notifications}
          onMarkAsRead={markNotificationAsRead}
          onMarkAllAsRead={markAllNotificationsAsRead}
          isDarkMode={appSettings?.preferences?.theme === 'dark'}
        />

        <Toaster position="top-center" />
      </div>
    );
  }

  // Desktop view - show full dashboard with tabs
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-8">
              <h1 className={`font-bold text-xl ${isSidebarOpen ? 'block' : 'hidden'}`}>
                FinanceHub
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
            
            <nav className="space-y-2">
              <Button
                variant={activeView === 'dashboard' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('dashboard')}
              >
                <Home className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3">Dashboard</span>}
              </Button>
              
              <Button
                variant={activeView === 'subscriptions' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('subscriptions')}
              >
                <CreditCard className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3">Subscriptions</span>}
              </Button>
              
              <Button
                variant={activeView === 'watchlist' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('watchlist')}
              >
                <Eye className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3">Watchlist</span>}
              </Button>
              
              <Button
                variant={activeView === 'calculator' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('calculator' as any)}
              >
                <Calculator className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3">Pay Calculator</span>}
              </Button>
              
              <Button
                variant={activeView === 'portfolio' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('portfolio')}
              >
                <TrendingUp className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3">Portfolio</span>}
              </Button>
              
              <Button
                variant={activeView === 'budget' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('budget')}
              >
                <PiggyBank className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3">Budget Pods</span>}
              </Button>
              
              <Button
                variant={activeView === 'notebooks' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('notebooks')}
              >
                <BookOpen className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3">Notebooks</span>}
              </Button>
            </nav>
            
            <div className="absolute bottom-4 left-4 right-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setActiveView('settings')}
              >
                <Settings className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3">Settings</span>}
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={signOut}
              >
                <LogOut className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3">Logout</span>}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {activeView === 'dashboard' && (
              <DashboardTab
                subscriptions={subscriptions}
                cards={paymentCards}
                settings={appSettings}
                notifications={notifications}
                weeklyBudgets={weeklyBudgets}
                onAddNew={() => openModal('subscription')}
                onViewCalendar={() => setActiveView('subscriptions')}
                onManageCards={() => openModal('card')}
                onCheckWatchlist={() => setActiveView('watchlist')}
              />
            )}
            
            {activeView === 'subscriptions' && (
              <Tabs defaultValue="active" className="w-full">
                <TabsList>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active">
                  <SubscriptionsUnifiedTab
                    subscriptions={subscriptions}
                    cards={paymentCards}
                    onEdit={(sub) => {
                      setEditingItem('subscription', sub);
                      openModal('subscription');
                    }}
                    onDelete={deleteSubscription}
                    onCancel={(id) => updateSubscription(id, { status: 'cancelled' })}
                    onReactivate={(id) => updateSubscription(id, { status: 'active' })}
                    onActivateFromWatchlist={(sub) => {
                      updateSubscription(sub.id, { status: 'active' });
                    }}
                    onAddNew={() => openModal('subscription')}
                    onAddToWatchlist={() => {
                      clearEditingItem('subscription');
                      openModal('subscription');
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="calendar">
                  <CalendarView
                    subscriptions={subscriptions.filter(s => s.status === 'active')}
                    weeklyBudgets={weeklyBudgets}
                    onViewSubscription={(sub) => {
                      setEditingItem('subscription', sub);
                      openModal('subscription');
                    }}
                    onUpdateSubscriptionDate={(id, date) => {
                      updateSubscription(id, { nextPayment: date.toISOString().split('T')[0] });
                    }}
                  />
                </TabsContent>
              </Tabs>
            )}
            
            {activeView === 'watchlist' && (
              <Watchlist
                watchlistItems={getWatchlistItems()}
                onEdit={(sub) => {
                  setEditingItem('subscription', sub);
                  openModal('subscription');
                }}
                onDelete={deleteSubscription}
                onViewDetails={(sub) => {
                  setEditingItem('subscription', sub);
                  openModal('subscription');
                }}
                onActivate={(sub) => {
                  updateSubscription(sub.id, { status: 'active' });
                }}
                onAddNew={() => {
                  clearEditingItem('subscription');
                  openModal('subscription');
                }}
              />
            )}
            
            {activeView === 'calculator' && (
              <SmartPayPeriodCalculator />
            )}
            
            {activeView === 'portfolio' && (
              <InvestmentPortfolio
                investments={investments}
                onAddInvestment={addInvestment}
                onUpdateInvestment={updateInvestment}
                onDeleteInvestment={deleteInvestment}
              />
            )}
            
            {activeView === 'budget' && (
              <BudgetPods
                budgetPods={budgetPods}
                onAddPod={addBudgetPod}
                onUpdatePod={updateBudgetPod}
                onDeletePod={deleteBudgetPod}
                onAddFunds={addToBudgetPod}
                onWithdrawFunds={withdrawFromBudgetPod}
              />
            )}
            
            {activeView === 'notebooks' && (
              <FinancialNotebooks
                notebooks={notebookEntries}
                onAddNotebook={addNotebookEntry}
                onUpdateNotebook={updateNotebookEntry}
                onDeleteNotebook={deleteNotebookEntry}
              />
            )}
            
            {activeView === 'settings' && (
              <AdvancedSettingsTab
                settings={appSettings}
                onUpdateSettings={updateSettings}
                onExportData={() => {
                  // TODO: Implement export
                  console.log('Export data');
                }}
                onImportData={() => openModal('import')}
                onResetApp={() => {
                  // TODO: Implement reset
                  console.log('Reset app');
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={modals.subscription} onOpenChange={() => closeModal('subscription')}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItems.subscription ? 'Edit Subscription' : 'Add Subscription'}
            </DialogTitle>
            <DialogDescription>
              Manage your recurring payments and subscriptions
            </DialogDescription>
          </DialogHeader>
          <ModernSubscriptionForm
            subscription={editingItems.subscription || undefined}
            cards={paymentCards}
            onSave={handleSubscriptionSave}
            onCancel={() => {
              closeModal('subscription');
              clearEditingItem('subscription');
            }}
            isWatchlistMode={false}
            onManageCards={() => openModal('card')}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={modals.card} onOpenChange={() => closeModal('card')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItems.card ? 'Edit Payment Card' : 'Add Payment Card'}
            </DialogTitle>
          </DialogHeader>
          <PaymentCardForm
            card={editingItems.card || undefined}
            onSave={handleCardSave}
            onCancel={() => {
              closeModal('card');
              clearEditingItem('card');
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Floating Notifications */}
      <FloatingNotifications
        notifications={notifications}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
        isDarkMode={appSettings?.preferences?.theme === 'dark'}
      />

      <Toaster position="bottom-right" />
    </div>
  );
};

const SimplifiedApp = () => {
  return (
    <AuthProvider>
      <SimplifiedAppContent />
    </AuthProvider>
  );
};

export default SimplifiedApp;