/**
 * Sync Service
 * Handles real-time synchronization across devices using Supabase
 */

import { supabase } from '@/utils/supabase/client';
import { useFinancialStore } from '@/stores/useFinancialStore';
import type { FullSubscription, FullPaymentCard } from '@/types/subscription';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  syncInProgress: boolean;
}

class SyncService {
  private syncStatus: SyncStatus = {
    isOnline: true,
    lastSync: null,
    pendingChanges: 0,
    syncInProgress: false,
  };

  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private changeBuffer: Map<string, any> = new Map();
  private syncTimeout: NodeJS.Timeout | null = null;

  /**
   * Initialize sync service with user authentication
   */
  async initialize(userId: string): Promise<void> {
    try {
      // Set up real-time subscriptions for data changes
      this.setupRealtimeSubscriptions(userId);
      
      // Perform initial sync
      await this.performFullSync(userId);
      
      // Set up periodic sync
      this.setupPeriodicSync();
      
      console.log('Sync service initialized successfully');
    } catch (error) {
      console.error('Sync service initialization failed:', error);
    }
  }

  /**
   * Set up Supabase real-time subscriptions
   */
  private setupRealtimeSubscriptions(userId: string): void {
    // Subscribe to subscription changes
    supabase
      .channel('subscriptions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          this.handleRealtimeChange('subscriptions', payload);
        }
      )
      .subscribe();

    // Subscribe to payment card changes
    supabase
      .channel('payment_cards_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_cards',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          this.handleRealtimeChange('payment_cards', payload);
        }
      )
      .subscribe();

    // Subscribe to user profile changes
    supabase
      .channel('profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          this.handleRealtimeChange('profiles', payload);
        }
      )
      .subscribe();
  }

  /**
   * Handle real-time data changes from Supabase
   */
  private handleRealtimeChange(table: string, payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (table) {
      case 'subscriptions':
        this.handleSubscriptionChange(eventType, newRecord, oldRecord);
        break;
      case 'payment_cards':
        this.handlePaymentCardChange(eventType, newRecord, oldRecord);
        break;
      case 'profiles':
        this.handleProfileChange(eventType, newRecord, oldRecord);
        break;
    }

    this.updateSyncStatus({ lastSync: new Date() });
  }

  /**
   * Handle subscription real-time changes
   */
  private handleSubscriptionChange(eventType: string, newRecord: any, oldRecord: any): void {
    const store = useFinancialStore.getState();
    
    switch (eventType) {
      case 'INSERT':
        if (newRecord && !store.subscriptions.find(s => s.id === newRecord.id)) {
          const subscription = this.transformSupabaseToSubscription(newRecord);
          store.addSubscription(subscription);
        }
        break;
      case 'UPDATE':
        if (newRecord) {
          const subscription = this.transformSupabaseToSubscription(newRecord);
          store.updateSubscription(newRecord.id, subscription);
        }
        break;
      case 'DELETE':
        if (oldRecord) {
          store.deleteSubscription(oldRecord.id);
        }
        break;
    }
  }

  /**
   * Handle payment card real-time changes
   */
  private handlePaymentCardChange(eventType: string, newRecord: any, oldRecord: any): void {
    const store = useFinancialStore.getState();
    
    switch (eventType) {
      case 'INSERT':
        if (newRecord && !store.paymentCards.find(c => c.id === newRecord.id)) {
          const card = this.transformSupabaseToPaymentCard(newRecord);
          store.addPaymentCard(card);
        }
        break;
      case 'UPDATE':
        if (newRecord) {
          const card = this.transformSupabaseToPaymentCard(newRecord);
          store.updatePaymentCard(newRecord.id, card);
        }
        break;
      case 'DELETE':
        if (oldRecord) {
          store.deletePaymentCard(oldRecord.id);
        }
        break;
    }
  }

  /**
   * Handle profile real-time changes
   */
  private handleProfileChange(eventType: string, newRecord: any, oldRecord: any): void {
    // Handle profile changes - could update user settings or preferences
    console.log('Profile changed:', eventType, newRecord);
  }

  /**
   * Perform full data synchronization
   */
  async performFullSync(userId: string): Promise<void> {
    if (this.syncStatus.syncInProgress) return;

    this.updateSyncStatus({ syncInProgress: true });

    try {
      // Fetch all user data from Supabase
      const [subscriptionsResult, cardsResult] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('payment_cards')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
      ]);

      const store = useFinancialStore.getState();

      // Update subscriptions
      if (subscriptionsResult.data) {
        const subscriptions = subscriptionsResult.data.map(this.transformSupabaseToSubscription);
        store.setSubscriptions(subscriptions);
      }

      // Update payment cards
      if (cardsResult.data) {
        const cards = cardsResult.data.map(this.transformSupabaseToPaymentCard);
        store.setPaymentCards(cards);
      }

      this.updateSyncStatus({ 
        lastSync: new Date(), 
        pendingChanges: 0,
      });

      console.log('Full sync completed successfully');
    } catch (error) {
      console.error('Full sync failed:', error);
      this.updateSyncStatus({ isOnline: false });
    } finally {
      this.updateSyncStatus({ syncInProgress: false });
    }
  }

  /**
   * Sync local changes to Supabase
   */
  async syncLocalChanges(userId: string): Promise<void> {
    if (this.changeBuffer.size === 0) return;

    try {
      const changes = Array.from(this.changeBuffer.entries());
      this.changeBuffer.clear();

      for (const [changeId, change] of changes) {
        await this.applySingleChange(userId, change);
      }

      this.updateSyncStatus({ 
        pendingChanges: 0,
        lastSync: new Date(),
      });
    } catch (error) {
      console.error('Local sync failed:', error);
      // Re-add failed changes to buffer
      // In a production app, you'd want more sophisticated retry logic
    }
  }

  /**
   * Queue a local change for sync
   */
  queueChange(changeId: string, change: any): void {
    this.changeBuffer.set(changeId, change);
    this.updateSyncStatus({ pendingChanges: this.changeBuffer.size });

    // Debounce sync
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = setTimeout(() => {
      const userId = this.getCurrentUserId();
      if (userId) {
        this.syncLocalChanges(userId);
      }
    }, 1000);
  }

  /**
   * Apply a single change to Supabase
   */
  private async applySingleChange(userId: string, change: any): Promise<void> {
    const { type, table, operation, data } = change;

    switch (operation) {
      case 'INSERT':
        await supabase.from(table).insert({ ...data, user_id: userId });
        break;
      case 'UPDATE':
        await supabase.from(table).update(data).eq('id', data.id).eq('user_id', userId);
        break;
      case 'DELETE':
        await supabase.from(table).delete().eq('id', data.id).eq('user_id', userId);
        break;
    }
  }

  /**
   * Set up periodic sync every 5 minutes
   */
  private setupPeriodicSync(): void {
    setInterval(() => {
      const userId = this.getCurrentUserId();
      if (userId && navigator.onLine) {
        this.performFullSync(userId);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Transform Supabase record to FullSubscription
   */
  private transformSupabaseToSubscription(record: any): FullSubscription {
    return {
      id: record.id,
      name: record.name,
      cost: record.cost,
      price: record.cost, // Compatibility
      frequency: record.billing_cycle || 'monthly',
      billingCycle: record.billing_cycle || 'monthly',
      nextPayment: record.next_payment || '',
      category: record.category || 'Other',
      status: record.status || 'active',
      isActive: record.status === 'active',
      dateAdded: record.date_added || record.created_at,
      // Add other fields as needed
    };
  }

  /**
   * Transform Supabase record to FullPaymentCard
   */
  private transformSupabaseToPaymentCard(record: any): FullPaymentCard {
    return {
      id: record.id,
      nickname: record.nickname || '',
      lastFour: record.last_four || '',
      type: record.type || 'other',
      isDefault: record.is_default || false,
      dateAdded: record.created_at,
    };
  }

  /**
   * Get current user ID (would come from auth context in real implementation)
   */
  private getCurrentUserId(): string | null {
    // In a real implementation, this would get the current user from auth context
    // For now, return null to prevent errors
    return null;
  }

  /**
   * Update sync status and notify listeners
   */
  private updateSyncStatus(updates: Partial<SyncStatus>): void {
    this.syncStatus = { ...this.syncStatus, ...updates };
    this.listeners.forEach(listener => listener(this.syncStatus));
  }

  /**
   * Subscribe to sync status changes
   */
  onSyncStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Force a manual sync
   */
  async forceSync(): Promise<void> {
    const userId = this.getCurrentUserId();
    if (userId) {
      await this.performFullSync(userId);
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    
    // Unsubscribe from real-time channels
    supabase.removeAllChannels();
    
    this.listeners.clear();
    this.changeBuffer.clear();
  }
}

export const syncService = new SyncService();
export default syncService;