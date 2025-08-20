/**
 * Supabase Sync Hook
 * Syncs local Zustand store with Supabase database
 */

import { useEffect, useState, useCallback } from 'react';
import { useFinancialStore } from '@/stores/useFinancialStore';
import { supabase } from '@/utils/supabase/client';
import subscriptionService from '@/services/supabase/subscriptionService';
import paymentCardService from '@/services/supabase/paymentCardService';
import type { FullSubscription, FullPaymentCard } from '@/types/subscription';

interface SyncStatus {
  isLoading: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  error: string | null;
}

export function useSupabaseSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    isSyncing: false,
    lastSync: null,
    error: null
  });

  const {
    subscriptions,
    paymentCards,
    setSubscriptions,
    setPaymentCards,
    addSubscription: addToStore,
    updateSubscription: updateInStore,
    deleteSubscription: deleteFromStore,
    addPaymentCard: addCardToStore,
    updatePaymentCard: updateCardInStore,
    deletePaymentCard: deleteCardFromStore
  } = useFinancialStore();

  /**
   * Initial load - fetch data from Supabase
   */
  const loadInitialData = useCallback(async () => {
    setSyncStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSyncStatus(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Load subscriptions and payment cards in parallel
      const [subs, cards] = await Promise.all([
        subscriptionService.getSubscriptions(),
        paymentCardService.getPaymentCards()
      ]);

      // Update store with fetched data
      setSubscriptions(subs);
      setPaymentCards(cards);

      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSync: new Date()
      }));
    } catch (error) {
      console.error('Error loading initial data:', error);
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load data from server'
      }));
    }
  }, [setSubscriptions, setPaymentCards]);

  /**
   * Add subscription with Supabase sync
   */
  const addSubscription = useCallback(async (subscription: FullSubscription) => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Add to Supabase
      const created = await subscriptionService.createSubscription(subscription);
      
      if (created) {
        // Update local store with server response (includes server-generated ID)
        addToStore(created);
        setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSync: new Date() }));
        return created;
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error) {
      console.error('Error adding subscription:', error);
      
      // Still add to local store for offline capability
      addToStore(subscription);
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Failed to sync. Data saved locally.'
      }));
      return subscription;
    }
  }, [addToStore]);

  /**
   * Update subscription with Supabase sync
   */
  const updateSubscription = useCallback(async (id: string, updates: Partial<FullSubscription>) => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Update in Supabase
      const updated = await subscriptionService.updateSubscription(id, updates);
      
      if (updated) {
        // Update local store with server response
        updateInStore(id, updated);
        setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSync: new Date() }));
        return updated;
      } else {
        throw new Error('Failed to update subscription');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      
      // Still update local store for offline capability
      updateInStore(id, updates);
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Failed to sync. Changes saved locally.'
      }));
      return { id, ...updates };
    }
  }, [updateInStore]);

  /**
   * Delete subscription with Supabase sync
   */
  const deleteSubscription = useCallback(async (id: string) => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Delete from Supabase
      const success = await subscriptionService.deleteSubscription(id);
      
      if (success) {
        // Delete from local store
        deleteFromStore(id);
        setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSync: new Date() }));
        return true;
      } else {
        throw new Error('Failed to delete subscription');
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      
      // Still delete from local store
      deleteFromStore(id);
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Failed to sync deletion with server.'
      }));
      return false;
    }
  }, [deleteFromStore]);

  /**
   * Add payment card with Supabase sync
   */
  const addPaymentCard = useCallback(async (card: FullPaymentCard) => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Add to Supabase
      const created = await paymentCardService.createPaymentCard(card);
      
      if (created) {
        // Update local store with server response
        addCardToStore(created);
        setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSync: new Date() }));
        return created;
      } else {
        throw new Error('Failed to create payment card');
      }
    } catch (error) {
      console.error('Error adding payment card:', error);
      
      // Still add to local store
      addCardToStore(card);
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Failed to sync. Card saved locally.'
      }));
      return card;
    }
  }, [addCardToStore]);

  /**
   * Update payment card with Supabase sync
   */
  const updatePaymentCard = useCallback(async (id: string, updates: Partial<FullPaymentCard>) => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Update in Supabase
      const updated = await paymentCardService.updatePaymentCard(id, updates);
      
      if (updated) {
        // Update local store
        updateCardInStore(id, updated);
        setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSync: new Date() }));
        return updated;
      } else {
        throw new Error('Failed to update payment card');
      }
    } catch (error) {
      console.error('Error updating payment card:', error);
      
      // Still update local store
      updateCardInStore(id, updates);
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Failed to sync. Changes saved locally.'
      }));
      return { id, ...updates };
    }
  }, [updateCardInStore]);

  /**
   * Delete payment card with Supabase sync
   */
  const deletePaymentCard = useCallback(async (id: string) => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Delete from Supabase
      const success = await paymentCardService.deletePaymentCard(id);
      
      if (success) {
        // Delete from local store
        deleteCardFromStore(id);
        setSyncStatus(prev => ({ ...prev, isSyncing: false, lastSync: new Date() }));
        return true;
      } else {
        throw new Error('Failed to delete payment card');
      }
    } catch (error) {
      console.error('Error deleting payment card:', error);
      
      // Still delete from local store
      deleteCardFromStore(id);
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Failed to sync deletion with server.'
      }));
      return false;
    }
  }, [deleteCardFromStore]);

  /**
   * Force sync all data
   */
  const forceSync = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  /**
   * Set up real-time subscriptions
   */
  useEffect(() => {
    const setupRealtimeSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to subscription changes
      const subscriptionChannel = supabase
        .channel('subscriptions')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${user.id}`
          },
          async (payload) => {
            console.log('Subscription change:', payload);
            // Reload subscriptions on any change
            const subs = await subscriptionService.getSubscriptions();
            setSubscriptions(subs);
          }
        )
        .subscribe();

      // Subscribe to payment card changes
      const cardChannel = supabase
        .channel('payment_cards')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payment_cards',
            filter: `user_id=eq.${user.id}`
          },
          async (payload) => {
            console.log('Payment card change:', payload);
            // Reload payment cards on any change
            const cards = await paymentCardService.getPaymentCards();
            setPaymentCards(cards);
          }
        )
        .subscribe();

      // Cleanup function
      return () => {
        supabase.removeChannel(subscriptionChannel);
        supabase.removeChannel(cardChannel);
      };
    };

    const cleanup = setupRealtimeSubscriptions();

    // Load initial data
    loadInitialData();

    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [loadInitialData, setSubscriptions, setPaymentCards]);

  return {
    syncStatus,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    addPaymentCard,
    updatePaymentCard,
    deletePaymentCard,
    forceSync
  };
}

export default useSupabaseSync;