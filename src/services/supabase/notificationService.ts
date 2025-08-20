/**
 * Notification Service - Payment Reminders & Alerts
 * Handles all notification-related operations
 */

import { supabase } from '@/utils/supabase/client';
import { format, addDays, differenceInDays, startOfDay } from 'date-fns';
import type { FullSubscription } from '@/types/subscription';

export type NotificationType = 
  | 'payment_reminder'
  | 'price_increase'
  | 'renewal'
  | 'cancellation'
  | 'trial_ending'
  | 'budget_alert'
  | 'payment_failed';

export interface Notification {
  id: string;
  userId?: string;
  subscriptionId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
  subscription?: {
    name: string;
    cost: number;
    nextBillingDate: string;
  };
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  reminderDays: number;
  notificationTypes: {
    paymentReminders: boolean;
    priceChanges: boolean;
    renewals: boolean;
    budgetAlerts: boolean;
    trialEnding: boolean;
  };
  quietHours?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

class NotificationService {
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * Get all notifications for the current user
   */
  async getNotifications(unreadOnly = false): Promise<Notification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('notifications')
        .select(`
          *,
          subscriptions (
            name,
            cost,
            next_billing_date
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(this.transformFromDB);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Get notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting notification count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Create a notification
   */
  async createNotification(
    type: NotificationType,
    title: string,
    message: string,
    subscriptionId?: string,
    scheduledFor?: Date
  ): Promise<Notification | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const notificationData = {
        user_id: user.id,
        subscription_id: subscriptionId,
        type,
        title,
        message,
        is_read: false,
        scheduled_for: scheduledFor?.toISOString(),
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select('*')
        .single();

      if (error) throw error;
      return this.transformFromDB(data);
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Schedule payment reminders for subscriptions
   */
  async schedulePaymentReminders(reminderDays = 3): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all active subscriptions
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .not('next_billing_date', 'is', null);

      if (error) throw error;
      if (!subscriptions || subscriptions.length === 0) return;

      const today = startOfDay(new Date());
      const reminders: any[] = [];

      for (const sub of subscriptions) {
        const billingDate = new Date(sub.next_billing_date);
        const daysUntilBilling = differenceInDays(billingDate, today);

        // Schedule reminder if within reminder window and not already scheduled
        if (daysUntilBilling > 0 && daysUntilBilling <= reminderDays) {
          // Check if reminder already exists
          const { data: existing } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('subscription_id', sub.id)
            .eq('type', 'payment_reminder')
            .gte('scheduled_for', today.toISOString())
            .single();

          if (!existing) {
            const reminderDate = addDays(billingDate, -reminderDays);
            reminders.push({
              user_id: user.id,
              subscription_id: sub.id,
              type: 'payment_reminder',
              title: `Payment Reminder: ${sub.name}`,
              message: `Your ${sub.name} subscription ($${sub.cost}) will renew in ${daysUntilBilling} days on ${format(billingDate, 'MMM dd, yyyy')}.`,
              is_read: false,
              scheduled_for: reminderDate.toISOString(),
            });
          }
        }
      }

      if (reminders.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(reminders);

        if (insertError) throw insertError;
        console.log(`Scheduled ${reminders.length} payment reminders`);
      }
    } catch (error) {
      console.error('Error scheduling payment reminders:', error);
    }
  }

  /**
   * Check for price changes in subscriptions
   */
  async checkPriceChanges(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get subscriptions with variable pricing
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          variable_pricing (*)
        `)
        .eq('user_id', user.id)
        .eq('billing_cycle', 'variable');

      if (error) throw error;
      if (!subscriptions) return;

      const today = startOfDay(new Date());
      const notifications: any[] = [];

      for (const sub of subscriptions) {
        if (sub.variable_pricing && sub.variable_pricing.length > 0) {
          // Check for upcoming price changes
          for (const change of sub.variable_pricing) {
            const changeDate = new Date(change.date);
            const daysUntilChange = differenceInDays(changeDate, today);

            if (daysUntilChange > 0 && daysUntilChange <= 7) {
              // Check if notification already exists
              const { data: existing } = await supabase
                .from('notifications')
                .select('id')
                .eq('user_id', user.id)
                .eq('subscription_id', sub.id)
                .eq('type', 'price_increase')
                .gte('created_at', today.toISOString())
                .single();

              if (!existing) {
                const oldCost = sub.cost;
                const newCost = change.cost;
                const changeType = newCost > oldCost ? 'increase' : 'decrease';
                const changeAmount = Math.abs(newCost - oldCost);

                notifications.push({
                  user_id: user.id,
                  subscription_id: sub.id,
                  type: 'price_increase',
                  title: `Price ${changeType}: ${sub.name}`,
                  message: `${sub.name} will ${changeType} by $${changeAmount.toFixed(2)} to $${newCost.toFixed(2)} on ${format(changeDate, 'MMM dd, yyyy')}. ${change.description || ''}`,
                  is_read: false,
                });
              }
            }
          }
        }
      }

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (insertError) throw insertError;
        console.log(`Created ${notifications.length} price change notifications`);
      }
    } catch (error) {
      console.error('Error checking price changes:', error);
    }
  }

  /**
   * Create budget alert
   */
  async createBudgetAlert(message: string, exceeded: boolean = false): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await this.createNotification(
        'budget_alert',
        exceeded ? '⚠️ Budget Exceeded' : '📊 Budget Alert',
        message
      );
    } catch (error) {
      console.error('Error creating budget alert:', error);
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const settings = data?.settings || {};
      return {
        emailEnabled: settings.emailNotifications ?? true,
        pushEnabled: settings.pushNotifications ?? true,
        reminderDays: settings.reminderDays ?? 3,
        notificationTypes: {
          paymentReminders: settings.paymentReminders ?? true,
          priceChanges: settings.priceChanges ?? true,
          renewals: settings.renewals ?? true,
          budgetAlerts: settings.budgetAlerts ?? true,
          trialEnding: settings.trialEnding ?? true,
        },
        quietHours: settings.quietHours,
      };
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('profiles')
        .update({
          settings: {
            emailNotifications: preferences.emailEnabled,
            pushNotifications: preferences.pushEnabled,
            reminderDays: preferences.reminderDays,
            paymentReminders: preferences.notificationTypes?.paymentReminders,
            priceChanges: preferences.notificationTypes?.priceChanges,
            renewals: preferences.notificationTypes?.renewals,
            budgetAlerts: preferences.notificationTypes?.budgetAlerts,
            trialEnding: preferences.notificationTypes?.trialEnding,
            quietHours: preferences.quietHours,
          }
        })
        .eq('id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  }

  /**
   * Start automatic notification checking
   */
  startNotificationScheduler(intervalMinutes = 60): void {
    // Clear existing interval if any
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Initial check
    this.runScheduledChecks();

    // Set up recurring checks
    this.checkInterval = setInterval(
      () => this.runScheduledChecks(),
      intervalMinutes * 60 * 1000
    );

    console.log(`Notification scheduler started (every ${intervalMinutes} minutes)`);
  }

  /**
   * Stop automatic notification checking
   */
  stopNotificationScheduler(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('Notification scheduler stopped');
    }
  }

  /**
   * Run all scheduled checks
   */
  private async runScheduledChecks(): Promise<void> {
    try {
      const prefs = await this.getPreferences();

      if (prefs.notificationTypes.paymentReminders) {
        await this.schedulePaymentReminders(prefs.reminderDays);
      }

      if (prefs.notificationTypes.priceChanges) {
        await this.checkPriceChanges();
      }

      console.log('Scheduled notification checks completed');
    } catch (error) {
      console.error('Error running scheduled checks:', error);
    }
  }

  /**
   * Transform database format to app format
   */
  private transformFromDB(dbData: any): Notification {
    return {
      id: dbData.id,
      userId: dbData.user_id,
      subscriptionId: dbData.subscription_id,
      type: dbData.type,
      title: dbData.title,
      message: dbData.message,
      isRead: dbData.is_read,
      scheduledFor: dbData.scheduled_for,
      sentAt: dbData.sent_at,
      createdAt: dbData.created_at,
      subscription: dbData.subscriptions ? {
        name: dbData.subscriptions.name,
        cost: dbData.subscriptions.cost,
        nextBillingDate: dbData.subscriptions.next_billing_date,
      } : undefined,
      priority: this.getPriority(dbData.type),
    };
  }

  /**
   * Get priority based on notification type
   */
  private getPriority(type: NotificationType): 'low' | 'medium' | 'high' {
    switch (type) {
      case 'payment_failed':
      case 'budget_alert':
        return 'high';
      case 'payment_reminder':
      case 'price_increase':
      case 'trial_ending':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): NotificationPreferences {
    return {
      emailEnabled: true,
      pushEnabled: true,
      reminderDays: 3,
      notificationTypes: {
        paymentReminders: true,
        priceChanges: true,
        renewals: true,
        budgetAlerts: true,
        trialEnding: true,
      },
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

export default notificationService;