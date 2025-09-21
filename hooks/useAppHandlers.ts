import { useCallback } from 'react';
import { generateFavicon } from '../utils/helpers';
import { FullSubscription, FullPaymentCard } from '../types/subscription';
import { AppSettings, Notification } from '../types/constants';

interface UseAppHandlersProps {
  subscriptions: FullSubscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<FullSubscription[]>>;
  paymentCards: FullPaymentCard[];
  setPaymentCards: React.Dispatch<React.SetStateAction<FullPaymentCard[]>>;
  appSettings: AppSettings;
  setAppSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsWatchlistMode: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingSubscription: React.Dispatch<React.SetStateAction<FullSubscription | null>>;
  editingSubscription: FullSubscription | null;
}

export const useAppHandlers = ({
  subscriptions,
  setSubscriptions,
  paymentCards,
  setPaymentCards,
  appSettings,
  setAppSettings,
  notifications,
  setNotifications,
  setActiveTab,
  setIsFormOpen,
  setIsWatchlistMode,
  setEditingSubscription,
  editingSubscription
}: UseAppHandlersProps) => {

  // Theme toggle handler
  const handleThemeToggle = useCallback(() => {
    setAppSettings(prev => ({
      ...prev,
      preferences: { ...prev.preferences, darkMode: !prev.preferences.darkMode }
    }));
  }, [setAppSettings]);

  // Notification handlers
  const handleMarkNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ));
  }, [setNotifications]);

  const handleMarkAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  }, [setNotifications]);

  const handleDeleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  }, [setNotifications]);

  // Subscription CRUD handlers
  const handleAddSubscription = useCallback((subscriptionData: Omit<FullSubscription, 'id'>) => {
    const newSubscription: FullSubscription = {
      ...subscriptionData,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setSubscriptions(prev => [...prev, newSubscription]);
    setIsFormOpen(false);
    setIsWatchlistMode(false);
    setEditingSubscription(null);
  }, [setSubscriptions, setIsFormOpen, setIsWatchlistMode, setEditingSubscription]);

  const handleEditSubscription = useCallback((subscriptionData: Omit<FullSubscription, 'id'>) => {
    if (!editingSubscription) return;
    const updatedSubscription = { ...subscriptionData, id: editingSubscription.id };
    setSubscriptions(prev => prev.map(sub => 
      sub.id === editingSubscription.id ? updatedSubscription : sub
    ));
    setIsFormOpen(false);
    setIsWatchlistMode(false);
    setEditingSubscription(null);
  }, [editingSubscription, setSubscriptions, setIsFormOpen, setIsWatchlistMode, setEditingSubscription]);

  const handleDeleteSubscription = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    }
  }, [setSubscriptions]);

  const handleCancelSubscription = useCallback((id: string) => {
    const subscription = subscriptions.find(sub => sub.id === id);
    if (!subscription) return;

    const cancelledSubscription: FullSubscription = {
      ...subscription,
      status: 'cancelled',
      cancelledDate: new Date().toISOString().split('T')[0]
    };

    setSubscriptions(prev => prev.map(sub => 
      sub.id === id ? cancelledSubscription : sub
    ));
  }, [subscriptions, setSubscriptions]);

  const handleReactivateSubscription = useCallback((id: string) => {
    const subscription = subscriptions.find(sub => sub.id === id);
    if (!subscription) return;

    const reactivatedSubscription: FullSubscription = {
      ...subscription,
      status: 'active',
      cancelledDate: undefined
    };

    setSubscriptions(prev => prev.map(sub => 
      sub.id === id ? reactivatedSubscription : sub
    ));
  }, [subscriptions, setSubscriptions]);

  const handleActivateFromWatchlist = useCallback((id: string) => {
    const subscription = subscriptions.find(sub => sub.id === id);
    if (!subscription) return;

    const activatedSubscription: FullSubscription = {
      ...subscription,
      status: 'active',
      nextPayment: subscription.nextPayment || new Date().toISOString().split('T')[0]
    };

    setSubscriptions(prev => prev.map(sub => 
      sub.id === id ? activatedSubscription : sub
    ));
  }, [subscriptions, setSubscriptions]);

  // Payment card handlers
  const handleAddCard = useCallback((cardData: Omit<FullPaymentCard, 'id' | 'dateAdded'>) => {
    const newCard: FullPaymentCard = {
      ...cardData,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString().split('T')[0]
    };
    
    if (newCard.isDefault) {
      setPaymentCards(prev => prev.map(card => ({ ...card, isDefault: false })));
    }
    
    setPaymentCards(prev => [...prev, newCard]);
  }, [setPaymentCards]);

  const handleEditCard = useCallback((updatedCard: FullPaymentCard) => {
    if (updatedCard.isDefault) {
      setPaymentCards(prev => prev.map(card => 
        card.id === updatedCard.id 
          ? updatedCard 
          : { ...card, isDefault: false }
      ));
    } else {
      setPaymentCards(prev => prev.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      ));
    }
  }, [setPaymentCards]);

  const handleDeleteCard = useCallback((id: string) => {
    setPaymentCards(prev => prev.filter(card => card.id !== id));
    setSubscriptions(prev => prev.map(sub => 
      sub.paymentCard === id ? { ...sub, paymentCard: undefined } : sub
    ));
  }, [setPaymentCards, setSubscriptions]);

  const handleSetDefaultCard = useCallback((id: string) => {
    setPaymentCards(prev => prev.map(card => ({
      ...card,
      isDefault: card.id === id
    })));
  }, [setPaymentCards]);

  // Bulk operations handlers
  const handleBulkEdit = useCallback((subscriptionIds: string[], updates: Partial<FullSubscription>) => {
    setSubscriptions(prev => prev.map(sub => 
      subscriptionIds.includes(sub.id) ? { ...sub, ...updates } : sub
    ));
  }, [setSubscriptions]);

  const handleBulkDelete = useCallback((subscriptionIds: string[]) => {
    setSubscriptions(prev => prev.filter(sub => !subscriptionIds.includes(sub.id)));
  }, [setSubscriptions]);

  // Note: handleImportData is now handled directly in App.tsx via ImportDialog

  const handleExportData = useCallback((format: 'json' | 'csv') => {
    if (format === 'json') {
      const exportData = {
        subscriptions,
        cards: paymentCards,
        settings: appSettings,
        exportDate: new Date().toISOString(),
        version: '4.0-ai'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscription-tracker-ai-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const headers = [
        'Name', 'Price', 'Frequency', 'Next Payment', 'Category', 
        'Plan Type', 'Status', 'Description', 'Website URL'
      ];
      
      const csvData = subscriptions.map(sub => [
        sub.name,
        sub.price,
        sub.frequency,
        sub.nextPayment || '',
        sub.category,
        sub.planType || '',
        sub.status,
        sub.description || '',
        sub.website || ''
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscriptions-ai-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [subscriptions, paymentCards, appSettings]);

  const handleResetApp = useCallback(() => {
    setSubscriptions([]);
    setPaymentCards([]);
    setAppSettings({
      notifications: {
        upcomingPayments: true,
        highSpending: true,
        weeklyReports: false,
        trialExpirations: true
      },
      thresholds: {
        highSpendingAmount: 200,
        upcomingPaymentDays: 7,
        trialReminderDays: 3
      },
      preferences: {
        defaultView: 'dashboard',
        showCancelled: true,
        groupByCategory: false,
        darkMode: false,
        showFavicons: true
      }
    });
    setNotifications([]);
    setActiveTab('dashboard');
  }, [setSubscriptions, setPaymentCards, setAppSettings, setNotifications, setActiveTab]);

  // AI and automation handlers
  const handleDataSync = useCallback((data: any) => {
    console.log('Real-time data received:', data);
    // Handle real-time updates from collaborators
  }, []);

  const handleConflictResolution = useCallback((conflicts: any[]) => {
    console.log('Sync conflicts detected:', conflicts);
    // Handle data conflicts
  }, []);

  const handleAutomationTrigger = useCallback((automation: any) => {
    console.log('Automation triggered:', automation);
    // Handle automation rule triggers
  }, []);

  // UI handlers
  const openEditForm = useCallback((subscription: FullSubscription) => {
    setEditingSubscription(subscription);
    setIsWatchlistMode(subscription.status === 'watchlist');
    setIsFormOpen(true);
  }, [setEditingSubscription, setIsWatchlistMode, setIsFormOpen]);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingSubscription(null);
    setIsWatchlistMode(false);
  }, [setIsFormOpen, setEditingSubscription, setIsWatchlistMode]);

  const openAddForm = useCallback(() => {
    setEditingSubscription(null);
    setIsWatchlistMode(false);
    setIsFormOpen(true);
  }, [setEditingSubscription, setIsWatchlistMode, setIsFormOpen]);

  const openWatchlistForm = useCallback(() => {
    setEditingSubscription(null);
    setIsWatchlistMode(true);
    setIsFormOpen(true);
  }, [setEditingSubscription, setIsWatchlistMode, setIsFormOpen]);

  return {
    // Theme handlers
    handleThemeToggle,
    
    // Notification handlers
    handleMarkNotificationAsRead,
    handleMarkAllNotificationsAsRead,
    handleDeleteNotification,
    
    // Subscription CRUD
    handleAddSubscription,
    handleEditSubscription,
    handleDeleteSubscription,
    handleCancelSubscription,
    handleReactivateSubscription,
    handleActivateFromWatchlist,
    
    // Payment card handlers
    handleAddCard,
    handleEditCard,
    handleDeleteCard,
    handleSetDefaultCard,
    
    // Bulk operations
    handleBulkEdit,
    handleBulkDelete,
    handleExportData,
    handleResetApp,
    
    // AI and automation
    handleDataSync,
    handleConflictResolution,
    handleAutomationTrigger,
    
    // UI handlers
    openEditForm,
    closeForm,
    openAddForm,
    openWatchlistForm
  };
};