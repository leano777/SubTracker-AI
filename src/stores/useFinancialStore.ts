import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FullSubscription, FullPaymentCard, WeeklyBudget, BudgetCategory } from '../types/subscription';
import type { AppSettings, AppNotification } from '../types/constants';
import type { Investment, Bill, FinancialGoal, NotebookEntry, BudgetPod } from '../types/financial';

interface FinancialStore {
  // Core Data
  subscriptions: FullSubscription[];
  paymentCards: FullPaymentCard[];
  notifications: AppNotification[];
  appSettings: AppSettings;
  weeklyBudgets: WeeklyBudget[];
  budgetCategories: BudgetCategory[];
  
  // New Financial Data
  bills: Bill[];
  investments: Investment[];
  financialGoals: FinancialGoal[];
  notebookEntries: NotebookEntry[];
  budgetPods: BudgetPod[];
  
  // UI State
  activeView: 'dashboard' | 'subscriptions' | 'watchlist' | 'portfolio' | 'notebooks' | 'budget' | 'settings';
  isMobileView: boolean;
  isLoading: boolean;
  
  // Modal State
  modals: {
    subscription: boolean;
    card: boolean;
    settings: boolean;
    import: boolean;
    recovery: boolean;
    notebook: boolean;
    investment: boolean;
  };
  
  // Editing State
  editingItems: {
    subscription: FullSubscription | null;
    card: FullPaymentCard | null;
    bill: Bill | null;
    investment: Investment | null;
    notebook: NotebookEntry | null;
  };
  
  // Actions - Subscriptions
  setSubscriptions: (subscriptions: FullSubscription[]) => void;
  addSubscription: (subscription: FullSubscription) => void;
  updateSubscription: (id: string, updates: Partial<FullSubscription>) => void;
  deleteSubscription: (id: string) => void;
  
  // Actions - Payment Cards
  setPaymentCards: (cards: FullPaymentCard[]) => void;
  addPaymentCard: (card: FullPaymentCard) => void;
  updatePaymentCard: (id: string, updates: Partial<FullPaymentCard>) => void;
  deletePaymentCard: (id: string) => void;
  
  // Actions - Bills
  setBills: (bills: Bill[]) => void;
  addBill: (bill: Bill) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  
  // Actions - Investments
  setInvestments: (investments: Investment[]) => void;
  addInvestment: (investment: Investment) => void;
  updateInvestment: (id: string, updates: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  
  // Actions - Financial Goals
  setFinancialGoals: (goals: FinancialGoal[]) => void;
  addFinancialGoal: (goal: FinancialGoal) => void;
  updateFinancialGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  deleteFinancialGoal: (id: string) => void;
  
  // Actions - Notebook Entries
  setNotebookEntries: (entries: NotebookEntry[]) => void;
  addNotebookEntry: (entry: NotebookEntry) => void;
  updateNotebookEntry: (id: string, updates: Partial<NotebookEntry>) => void;
  deleteNotebookEntry: (id: string) => void;

  // Actions - Budget Pods
  setBudgetPods: (pods: BudgetPod[]) => void;
  addBudgetPod: (pod: BudgetPod) => void;
  updateBudgetPod: (id: string, updates: Partial<BudgetPod>) => void;
  deleteBudgetPod: (id: string) => void;
  addToBudgetPod: (id: string, amount: number, note?: string) => void;
  withdrawFromBudgetPod: (id: string, amount: number, reason: string) => void;
  
  // Actions - Notifications
  setNotifications: (notifications: AppNotification[]) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Actions - UI State
  setActiveView: (view: FinancialStore['activeView']) => void;
  setMobileView: (isMobile: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  
  // Actions - Modals
  openModal: (modal: keyof FinancialStore['modals']) => void;
  closeModal: (modal: keyof FinancialStore['modals']) => void;
  closeAllModals: () => void;
  
  // Actions - Editing
  setEditingItem: <K extends keyof FinancialStore['editingItems']>(
    type: K,
    item: FinancialStore['editingItems'][K]
  ) => void;
  clearEditingItem: (type: keyof FinancialStore['editingItems']) => void;
  clearAllEditingItems: () => void;
  
  // Actions - Settings
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Actions - Budgets
  setWeeklyBudgets: (budgets: WeeklyBudget[]) => void;
  setBudgetCategories: (categories: BudgetCategory[]) => void;
  
  // Computed Values
  getActiveSubscriptions: () => FullSubscription[];
  getWatchlistItems: () => FullSubscription[];
  getUpcomingPayments: (days: number) => FullSubscription[];
  getTotalMonthlySpend: () => number;
  getPortfolioValue: () => number;
  getUnreadNotificationCount: () => number;
  
  // Reset
  resetStore: () => void;
}

const defaultSettings: AppSettings = {
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
    defaultView: 'dashboard',
    showCancelled: true,
    groupByCategory: false,
    darkMode: false,
    showFavicons: true,
    theme: 'light',
  },
};

const initialState = {
  subscriptions: [],
  paymentCards: [],
  notifications: [],
  appSettings: defaultSettings,
  weeklyBudgets: [],
  budgetCategories: [],
  bills: [],
  investments: [],
  financialGoals: [],
  notebookEntries: [],
  budgetPods: [],
  activeView: 'dashboard' as const,
  isMobileView: false,
  isLoading: false,
  modals: {
    subscription: false,
    card: false,
    settings: false,
    import: false,
    recovery: false,
    notebook: false,
    investment: false,
  },
  editingItems: {
    subscription: null,
    card: null,
    bill: null,
    investment: null,
    notebook: null,
  },
};

export const useFinancialStore = create<FinancialStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Subscriptions
      setSubscriptions: (subscriptions) => set({ subscriptions }),
      addSubscription: (subscription) => 
        set((state) => ({ subscriptions: [...state.subscriptions, subscription] })),
      updateSubscription: (id, updates) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, ...updates } : sub
          ),
        })),
      deleteSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        })),
      
      // Payment Cards
      setPaymentCards: (paymentCards) => set({ paymentCards }),
      addPaymentCard: (card) =>
        set((state) => ({ paymentCards: [...state.paymentCards, card] })),
      updatePaymentCard: (id, updates) =>
        set((state) => ({
          paymentCards: state.paymentCards.map((card) =>
            card.id === id ? { ...card, ...updates } : card
          ),
        })),
      deletePaymentCard: (id) =>
        set((state) => ({
          paymentCards: state.paymentCards.filter((card) => card.id !== id),
        })),
      
      // Bills
      setBills: (bills) => set({ bills }),
      addBill: (bill) =>
        set((state) => ({ bills: [...state.bills, bill] })),
      updateBill: (id, updates) =>
        set((state) => ({
          bills: state.bills.map((bill) =>
            bill.id === id ? { ...bill, ...updates } : bill
          ),
        })),
      deleteBill: (id) =>
        set((state) => ({
          bills: state.bills.filter((bill) => bill.id !== id),
        })),
      
      // Investments
      setInvestments: (investments) => set({ investments }),
      addInvestment: (investment) =>
        set((state) => ({ investments: [...state.investments, investment] })),
      updateInvestment: (id, updates) =>
        set((state) => ({
          investments: state.investments.map((inv) =>
            inv.id === id ? { ...inv, ...updates } : inv
          ),
        })),
      deleteInvestment: (id) =>
        set((state) => ({
          investments: state.investments.filter((inv) => inv.id !== id),
        })),
      
      // Financial Goals
      setFinancialGoals: (financialGoals) => set({ financialGoals }),
      addFinancialGoal: (goal) =>
        set((state) => ({ financialGoals: [...state.financialGoals, goal] })),
      updateFinancialGoal: (id, updates) =>
        set((state) => ({
          financialGoals: state.financialGoals.map((goal) =>
            goal.id === id ? { ...goal, ...updates } : goal
          ),
        })),
      deleteFinancialGoal: (id) =>
        set((state) => ({
          financialGoals: state.financialGoals.filter((goal) => goal.id !== id),
        })),
      
      // Notebook Entries
      setNotebookEntries: (notebookEntries) => set({ notebookEntries }),
      addNotebookEntry: (entry) =>
        set((state) => ({ notebookEntries: [...state.notebookEntries, entry] })),
      updateNotebookEntry: (id, updates) =>
        set((state) => ({
          notebookEntries: state.notebookEntries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        })),
      deleteNotebookEntry: (id) =>
        set((state) => ({
          notebookEntries: state.notebookEntries.filter((entry) => entry.id !== id),
        })),

      // Budget Pods
      setBudgetPods: (budgetPods) => set({ budgetPods }),
      addBudgetPod: (pod) =>
        set((state) => ({ budgetPods: [...state.budgetPods, pod] })),
      updateBudgetPod: (id, updates) =>
        set((state) => ({
          budgetPods: state.budgetPods.map((pod) =>
            pod.id === id ? { ...pod, ...updates, lastModified: new Date().toISOString() } : pod
          ),
        })),
      deleteBudgetPod: (id) =>
        set((state) => ({
          budgetPods: state.budgetPods.filter((pod) => pod.id !== id),
        })),
      addToBudgetPod: (id, amount, note) =>
        set((state) => ({
          budgetPods: state.budgetPods.map((pod) =>
            pod.id === id
              ? {
                  ...pod,
                  currentAmount: pod.currentAmount + amount,
                  lastModified: new Date().toISOString(),
                  contributions: [
                    ...(pod.contributions || []),
                    {
                      date: new Date().toISOString(),
                      amount,
                      note: note || `Added ${amount}`,
                    },
                  ],
                }
              : pod
          ),
        })),
      withdrawFromBudgetPod: (id, amount, reason) =>
        set((state) => ({
          budgetPods: state.budgetPods.map((pod) =>
            pod.id === id
              ? {
                  ...pod,
                  currentAmount: Math.max(0, pod.currentAmount - amount),
                  lastModified: new Date().toISOString(),
                  withdrawals: [
                    ...(pod.withdrawals || []),
                    {
                      date: new Date().toISOString(),
                      amount,
                      reason,
                    },
                  ],
                }
              : pod
          ),
        })),
      
      // Notifications
      setNotifications: (notifications) => set({ notifications }),
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          ),
        })),
      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
        })),
      
      // UI State
      setActiveView: (activeView) => set({ activeView }),
      setMobileView: (isMobileView) => set({ isMobileView }),
      setLoading: (isLoading) => set({ isLoading }),
      
      // Modals
      openModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: true },
        })),
      closeModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: false },
        })),
      closeAllModals: () =>
        set({
          modals: {
            subscription: false,
            card: false,
            settings: false,
            import: false,
            recovery: false,
            notebook: false,
            investment: false,
          },
        }),
      
      // Editing
      setEditingItem: (type, item) =>
        set((state) => ({
          editingItems: { ...state.editingItems, [type]: item },
        })),
      clearEditingItem: (type) =>
        set((state) => ({
          editingItems: { ...state.editingItems, [type]: null },
        })),
      clearAllEditingItems: () =>
        set({
          editingItems: {
            subscription: null,
            card: null,
            bill: null,
            investment: null,
            notebook: null,
          },
        }),
      
      // Settings
      updateSettings: (settings) =>
        set((state) => ({
          appSettings: { ...state.appSettings, ...settings },
        })),
      
      // Budgets
      setWeeklyBudgets: (weeklyBudgets) => set({ weeklyBudgets }),
      setBudgetCategories: (budgetCategories) => set({ budgetCategories }),
      
      // Computed Values
      getActiveSubscriptions: () => {
        const state = get();
        return state.subscriptions.filter((sub) => sub.status === 'active');
      },
      
      getWatchlistItems: () => {
        const state = get();
        return state.subscriptions.filter((sub) => sub.status === 'watchlist');
      },
      
      getUpcomingPayments: (days) => {
        const state = get();
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        
        return state.subscriptions.filter((sub) => {
          if (sub.status !== 'active') return false;
          const nextPayment = new Date(sub.nextPayment);
          return nextPayment >= today && nextPayment <= futureDate;
        });
      },
      
      getTotalMonthlySpend: () => {
        const state = get();
        return state.subscriptions
          .filter((sub) => sub.status === 'active')
          .reduce((total, sub) => {
            const monthlyAmount = sub.frequency === 'yearly' 
              ? sub.price / 12 
              : sub.frequency === 'quarterly'
              ? sub.price / 3
              : sub.frequency === 'weekly'
              ? sub.price * 4.33
              : sub.price;
            return total + monthlyAmount;
          }, 0);
      },
      
      getPortfolioValue: () => {
        const state = get();
        return state.investments.reduce((total, inv) => {
          return total + (inv.quantity * inv.currentPrice);
        }, 0);
      },
      
      getUnreadNotificationCount: () => {
        const state = get();
        return state.notifications.filter((n) => !n.read).length;
      },
      
      // Reset
      resetStore: () => set(initialState),
    }),
    {
      name: 'financial-dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        subscriptions: state.subscriptions,
        paymentCards: state.paymentCards,
        bills: state.bills,
        investments: state.investments,
        financialGoals: state.financialGoals,
        notebookEntries: state.notebookEntries,
        appSettings: state.appSettings,
        weeklyBudgets: state.weeklyBudgets,
        budgetCategories: state.budgetCategories,
      }),
    }
  )
);