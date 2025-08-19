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
import { BudgetPods } from './features/budget/components/BudgetPods';
import { InvestmentPortfolio } from './components/portfolio/InvestmentPortfolio';
import { EnhancedInvestmentDashboard } from './components/portfolio/EnhancedInvestmentDashboard';
import { PortfolioPerformance } from './components/portfolio/PortfolioPerformance';
import { InvestmentThesisManager } from './components/portfolio/InvestmentThesis';
import { FinancialNotebooks } from './components/notebooks/FinancialNotebooks';
import { GoalManagementDashboard } from './components/goals/GoalManagementDashboard';
import { TransactionDashboard } from './components/transactions/TransactionDashboard';
import { PodFundingIntelligence } from './components/pods/PodFundingIntelligence';
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
  PiggyBank,
  Target,
  ArrowRightLeft,
  Brain
} from 'lucide-react';
import { applyThemeClasses } from './utils/theme';
import type { FullSubscription } from './types/subscription';
import type { FinancialGoal } from './types/financial';

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
    // Income sources
    incomeSources,
    paycheckAllocations,
    currentPayCycleSummary,
    setIncomeSources,
    setPaycheckAllocations,
    setPayCycleSummary,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    createPaycheckAllocation,
    updatePaycheckAllocation,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addNotebookEntry,
    updateNotebookEntry,
    deleteNotebookEntry,
    // Transactions
    transactions,
    transactionCategories,
    cashFlowHistory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    // Financial goals
    financialGoals,
    addFinancialGoal,
    updateFinancialGoal,
    deleteFinancialGoal,
    // Pod funding intelligence
    podFundingAnalyses,
    fundingSuggestions,
    automationRules,
    setPodFundingAnalyses,
    setFundingSuggestions,
    setAutomationRules,
    addPodFundingAnalysis,
    updatePodFundingAnalysis,
    addFundingSuggestion,
    updateFundingSuggestion,
    removeFundingSuggestion,
    addAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
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
      // Initialize income data
      setIncomeSources(demoData.incomeSources);
      setPaycheckAllocations(demoData.paycheckAllocations);
      setPayCycleSummary(demoData.currentPayCycleSummary);
      // Initialize pod funding intelligence data
      setPodFundingAnalyses(demoData.podFundingAnalyses || []);
      setFundingSuggestions(demoData.fundingSuggestions || []);
      setAutomationRules(demoData.automationRules || []);
      setDemoDataLoaded(true);
    }
  }, [isAuthenticated, demoDataLoaded, subscriptions.length, setSubscriptions, setPaymentCards, setNotifications, setWeeklyBudgets, setBills, setInvestments, setFinancialGoals, setNotebookEntries, setBudgetPods, setIncomeSources, setPaycheckAllocations, setPayCycleSummary]);

  // Handle subscription form submission
  const handleSubscriptionSave = (subscriptionData: Partial<FullSubscription>) => {
    if (editingItems.subscription) {
      updateSubscription(editingItems.subscription.id, subscriptionData);
    } else {
      const newSubscription: FullSubscription = {
        ...subscriptionData as FullSubscription,
        id: `sub-${Date.now()}`,
        dateAdded: new Date().toISOString().split('T')[0],
        isActive: subscriptionData.status === 'active',
        cost: subscriptionData.price || 0,
        billingCycle: subscriptionData.frequency === 'monthly' ? 'monthly' : 
                      subscriptionData.frequency === 'yearly' ? 'yearly' : 'monthly',
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
                variant={activeView === 'goals' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('goals')}
              >
                <Target className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3">Financial Goals</span>}
              </Button>
              
              <Button
                variant={activeView === 'transactions' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('transactions')}
              >
                <ArrowRightLeft className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3">Transactions</span>}
              </Button>
              
              <Button
                variant={activeView === 'pod-intelligence' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveView('pod-intelligence')}
              >
                <Brain className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3">Pod Intelligence</span>}
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
                    onActivateFromWatchlist={(id) => {
                      updateSubscription(id, { status: 'active' });
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
              <EnhancedInvestmentDashboard />
            )}
            
            {activeView === 'budget' && (
              <BudgetPods
                budgetPods={budgetPods}
                incomeSources={incomeSources}
                paycheckAllocations={paycheckAllocations}
                payCycleSummary={currentPayCycleSummary}
                onAddPod={(podData) => {
                  const now = new Date().toISOString();
                  const pod = {
                    id: `pod-${Date.now()}`,
                    createdDate: now,
                    lastModified: now,
                    ...podData,
                  };
                  addBudgetPod(pod);
                }}
                onUpdatePod={(id, updates) => {
                  updateBudgetPod(id, updates);
                  
                  // Trigger pod funding sync for updated pod
                  if (updates.monthlyAmount || updates.currentAmount) {
                    import('./utils/podFundingIntegration').then(({ syncPodFundingOnPodChange }) => {
                      const syncResult = syncPodFundingOnPodChange(
                        budgetPods.map(p => p.id === id ? { ...p, ...updates } : p),
                        transactions,
                        incomeSources,
                        automationRules,
                        [id]
                      );
                      
                      // Update analysis for this pod
                      syncResult.updatedAnalyses.forEach(analysis => {
                        addPodFundingAnalysis(analysis);
                      });
                      
                      // Add new suggestions if any
                      syncResult.newSuggestions.forEach(suggestion => {
                        addFundingSuggestion(suggestion);
                      });
                    });
                  }
                }}
                onDeletePod={deleteBudgetPod}
                onAddFunds={addToBudgetPod}
                onWithdrawFunds={withdrawFromBudgetPod}
                onAddIncomeSource={addIncomeSource}
                onUpdateIncomeSource={(id, updates) => {
                  const currentSource = incomeSources.find(s => s.id === id);
                  updateIncomeSource(id, updates);
                  
                  // Check if income amount changed significantly
                  if (currentSource && updates.netAmount && currentSource.netAmount !== updates.netAmount) {
                    const changePercentage = ((updates.netAmount - currentSource.netAmount) / currentSource.netAmount) * 100;
                    
                    if (Math.abs(changePercentage) > 5) { // 5% threshold
                      import('./utils/podFundingIntegration').then(({ syncPodFundingOnIncomeChange }) => {
                        const syncResult = syncPodFundingOnIncomeChange(
                          budgetPods,
                          transactions,
                          incomeSources.map(s => s.id === id ? { ...s, ...updates } : s),
                          podFundingAnalyses,
                          automationRules,
                          changePercentage
                        );
                        
                        // Update analyses
                        syncResult.updatedAnalyses.forEach(analysis => {
                          addPodFundingAnalysis(analysis);
                        });
                        
                        // Add income-aware suggestions
                        syncResult.newSuggestions.forEach(suggestion => {
                          addFundingSuggestion(suggestion);
                        });
                      });
                    }
                  }
                }}
                onDeleteIncomeSource={deleteIncomeSource}
                onCreatePaycheckAllocation={createPaycheckAllocation}
                onUpdatePaycheckAllocation={updatePaycheckAllocation}
              />
            )}
            
            {activeView === 'goals' && (
              <GoalManagementDashboard
                goals={financialGoals}
                analytics={[]} // TODO: Add analytics data
                recommendations={[]} // TODO: Add recommendations
                incomeSources={incomeSources}
                budgetPods={budgetPods}
                transactions={transactions}
                onAddGoal={(goalData) => {
                  const now = new Date().toISOString();
                  const goal: FinancialGoal = {
                    id: `goal-${Date.now()}`,
                    createdDate: now,
                    lastModified: now,
                    ...goalData
                  };
                  addFinancialGoal(goal);
                }}
                onUpdateGoal={updateFinancialGoal}
                onDeleteGoal={deleteFinancialGoal}
                onAddContribution={(goalId, amount, note) => {
                  // Add contribution logic - update goal's current amount and add to history
                  const goal = financialGoals.find(g => g.id === goalId);
                  if (goal) {
                    updateFinancialGoal(goalId, {
                      currentAmount: goal.currentAmount + amount,
                      contributionHistory: [
                        ...(goal.contributionHistory || []),
                        {
                          date: new Date().toISOString(),
                          amount,
                          note,
                          source: 'manual'
                        }
                      ]
                    });
                  }
                }}
              />
            )}
            
            {activeView === 'transactions' && (
              <TransactionDashboard
                transactions={transactions}
                transactionCategories={transactionCategories}
                cashFlowHistory={cashFlowHistory}
                budgetPods={budgetPods}
                incomeSources={incomeSources}
                paycheckAllocations={paycheckAllocations}
                onAddTransaction={(transactionData) => {
                  addTransaction(transactionData);
                  // Trigger pod funding analysis update if transaction affects a budget pod
                  if (transactionData.budgetPodId) {
                    import('./utils/podFundingIntegration').then(({ syncPodFundingOnTransactionChange }) => {
                      const syncResult = syncPodFundingOnTransactionChange(
                        budgetPods,
                        transactions,
                        incomeSources,
                        automationRules,
                        [transactionData.budgetPodId!]
                      );
                      
                      // Update analyses for affected pods
                      syncResult.updatedAnalyses.forEach(analysis => {
                        addPodFundingAnalysis(analysis);
                      });
                      
                      // Add new suggestions
                      syncResult.newSuggestions.forEach(suggestion => {
                        addFundingSuggestion(suggestion);
                      });
                    });
                  }
                }}
                onUpdateTransaction={(id, updates) => {
                  updateTransaction(id, updates);
                  // Trigger pod funding sync for updated transactions
                  const transaction = transactions.find(t => t.id === id);
                  if (transaction?.budgetPodId || updates.budgetPodId) {
                    const affectedPodIds = [transaction?.budgetPodId, updates.budgetPodId]
                      .filter(Boolean) as string[];
                    
                    if (affectedPodIds.length > 0) {
                      import('./utils/podFundingIntegration').then(({ syncPodFundingOnTransactionChange }) => {
                        const syncResult = syncPodFundingOnTransactionChange(
                          budgetPods,
                          transactions,
                          incomeSources,
                          automationRules,
                          affectedPodIds
                        );
                        
                        syncResult.updatedAnalyses.forEach(analysis => {
                          addPodFundingAnalysis(analysis);
                        });
                      });
                    }
                  }
                }}
                onDeleteTransaction={(id) => {
                  const transaction = transactions.find(t => t.id === id);
                  deleteTransaction(id);
                  
                  // Update pod analysis if transaction was linked to a pod
                  if (transaction?.budgetPodId) {
                    import('./utils/podFundingIntegration').then(({ syncPodFundingOnTransactionChange }) => {
                      const syncResult = syncPodFundingOnTransactionChange(
                        budgetPods,
                        transactions.filter(t => t.id !== id), // Exclude deleted transaction
                        incomeSources,
                        automationRules,
                        [transaction.budgetPodId!]
                      );
                      
                      syncResult.updatedAnalyses.forEach(analysis => {
                        addPodFundingAnalysis(analysis);
                      });
                    });
                  }
                }}
              />
            )}
            
            {activeView === 'pod-intelligence' && (
              <PodFundingIntelligence
                budgetPods={budgetPods}
                transactions={transactions}
                incomeSources={incomeSources}
                podAnalyses={podFundingAnalyses}
                fundingSuggestions={fundingSuggestions}
                automationRules={automationRules}
                onApplySuggestion={(suggestionId) => {
                  // Find and apply the suggestion
                  const suggestion = fundingSuggestions.find(s => s.id === suggestionId);
                  if (suggestion) {
                    // Update the budget pod with the suggested amount
                    updateBudgetPod(suggestion.podId, {
                      monthlyAmount: suggestion.suggestedAmount
                    });
                    // Mark suggestion as applied
                    updateFundingSuggestion(suggestionId, { status: 'applied' });
                  }
                }}
                onRejectSuggestion={(suggestionId) => {
                  updateFundingSuggestion(suggestionId, { status: 'rejected' });
                }}
                onCreateAutomationRule={(rule) => {
                  const newRule = {
                    id: `rule-${Date.now()}`,
                    createdDate: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    ...rule
                  };
                  addAutomationRule(newRule);
                }}
                onUpdateAutomationRule={updateAutomationRule}
                onRunAnalysis={() => {
                  // Import and run analysis algorithms
                  Promise.all([
                    import('./utils/podFundingAlgorithms'),
                    import('./utils/podFundingIntegration')
                  ]).then(([algorithms, integration]) => {
                    // Generate analysis for each pod
                    const analyses = budgetPods.map(pod => 
                      algorithms.generatePodFundingAnalysis(pod, transactions, incomeSources)
                    );
                    setPodFundingAnalyses(analyses);
                    
                    // Generate funding suggestions
                    const suggestions = algorithms.generateFundingSuggestions(
                      budgetPods, 
                      analyses, 
                      incomeSources, 
                      transactions
                    );
                    setFundingSuggestions(suggestions);
                    
                    // Check for automation rule triggers
                    const triggeredRules = integration.checkAutomationRuleTriggers(
                      analyses, 
                      automationRules
                    );
                    
                    // Apply triggered rules (simplified implementation)
                    if (triggeredRules.length > 0) {
                      console.log('Triggered automation rules:', triggeredRules);
                    }
                  });
                }}
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