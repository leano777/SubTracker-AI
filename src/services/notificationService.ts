import {
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '../types/notifications';
import type { Notification, NotificationPreferences } from '../types/notifications';
import type { FullSubscription, PaymentCard } from '../types/subscription';

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private preferences: NotificationPreferences = DEFAULT_NOTIFICATION_PREFERENCES;
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private userId: string = 'local-user-001';

  private constructor() {
    this.loadNotifications();
    this.loadPreferences();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Load notifications from localStorage
  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem(`notifications_${this.userId}`);
      if (stored) {
        this.notifications = JSON.parse(stored);
        // Clean up expired notifications
        this.cleanupExpired();
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  // Save notifications to localStorage
  private saveNotifications(): void {
    try {
      localStorage.setItem(`notifications_${this.userId}`, JSON.stringify(this.notifications));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // Load preferences from localStorage
  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem(`notification_preferences_${this.userId}`);
      if (stored) {
        this.preferences = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      this.preferences = DEFAULT_NOTIFICATION_PREFERENCES;
    }
  }

  // Save preferences to localStorage
  savePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    try {
      localStorage.setItem(`notification_preferences_${this.userId}`, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  // Get current preferences
  getPreferences(): NotificationPreferences {
    return this.preferences;
  }

  // Subscribe to notification changes
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getNotifications()));
  }

  // Create a new notification
  create(
    type: NotificationType,
    title: string,
    message: string,
    options: Partial<Notification> = {}
  ): Notification {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      priority: options.priority || this.getPriorityForType(type),
      status: NotificationStatus.UNREAD,
      title,
      message,
      timestamp: new Date().toISOString(),
      sound: options.sound ?? this.preferences.soundEnabled,
      ...options,
    };

    // Check if this type of notification is enabled
    if (!this.preferences.enabled || !this.preferences.types[type]) {
      return notification; // Return but don't save
    }

    // Check quiet hours
    if (this.isQuietHours()) {
      notification.sound = false;
    }

    // Add to notifications
    this.notifications.unshift(notification);
    this.saveNotifications();

    // Play sound if enabled
    if (notification.sound && !this.isQuietHours()) {
      this.playNotificationSound();
    }

    return notification;
  }

  // Get priority based on notification type
  private getPriorityForType(type: NotificationType): NotificationPriority {
    switch (type) {
      case NotificationType.PAYMENT_DUE:
      case NotificationType.TRIAL_ENDING:
      case NotificationType.CARD_EXPIRING:
        return NotificationPriority.HIGH;
      case NotificationType.RENEWAL_UPCOMING:
      case NotificationType.HIGH_SPENDING:
      case NotificationType.BUDGET_EXCEEDED:
        return NotificationPriority.MEDIUM;
      default:
        return NotificationPriority.LOW;
    }
  }

  // Check if current time is in quiet hours
  private isQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = this.preferences.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  // Play notification sound
  private playNotificationSound(): void {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors
      });
    } catch (error) {
      // Ignore sound errors
    }
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return this.notifications;
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => n.status === NotificationStatus.UNREAD);
  }

  // Get unread count
  getUnreadCount(): number {
    return this.getUnreadNotifications().length;
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && notification.status === NotificationStatus.UNREAD) {
      notification.status = NotificationStatus.READ;
      this.saveNotifications();
    }
  }

  // Mark all as read
  markAllAsRead(): void {
    let hasChanges = false;
    this.notifications.forEach(notification => {
      if (notification.status === NotificationStatus.UNREAD) {
        notification.status = NotificationStatus.READ;
        hasChanges = true;
      }
    });
    if (hasChanges) {
      this.saveNotifications();
    }
  }

  // Archive notification
  archive(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.status = NotificationStatus.ARCHIVED;
      this.saveNotifications();
    }
  }

  // Delete notification
  delete(notificationId: string): void {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.saveNotifications();
    }
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications = [];
    this.saveNotifications();
  }

  // Clean up expired notifications
  private cleanupExpired(): void {
    const now = new Date();
    let hasChanges = false;
    
    this.notifications = this.notifications.filter(notification => {
      if (notification.expiresAt) {
        const expiryDate = new Date(notification.expiresAt);
        if (expiryDate < now) {
          hasChanges = true;
          return false;
        }
      }
      return true;
    });

    if (hasChanges) {
      this.saveNotifications();
    }
  }

  // Check subscriptions for notifications
  checkSubscriptions(subscriptions: FullSubscription[], cards: PaymentCard[]): void {
    if (!this.preferences.enabled) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    subscriptions.forEach(subscription => {
      if (subscription.status !== 'active' && subscription.status !== 'trial') return;

      // Check for upcoming renewals
      if (subscription.nextPayment) {
        const nextPaymentDate = new Date(subscription.nextPayment);
        const daysUntil = Math.ceil((nextPaymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Payment due today
        if (daysUntil === 0 && !this.hasNotificationForToday(NotificationType.PAYMENT_DUE, subscription.id)) {
          this.create(
            NotificationType.PAYMENT_DUE,
            `Payment Due Today`,
            `${subscription.name} payment of $${subscription.price} is due today`,
            {
              metadata: {
                subscriptionId: subscription.id,
                subscriptionName: subscription.name,
                amount: subscription.price,
                daysUntil: 0,
              },
              priority: NotificationPriority.URGENT,
            }
          );
        }
        // Upcoming renewal
        else if (
          daysUntil > 0 &&
          daysUntil <= this.preferences.advanceDays.renewal &&
          !this.hasNotificationForToday(NotificationType.RENEWAL_UPCOMING, subscription.id)
        ) {
          this.create(
            NotificationType.RENEWAL_UPCOMING,
            `${subscription.name} Renewal Soon`,
            `Renewal in ${daysUntil} day${daysUntil > 1 ? 's' : ''} - $${subscription.price}`,
            {
              metadata: {
                subscriptionId: subscription.id,
                subscriptionName: subscription.name,
                amount: subscription.price,
                daysUntil,
              },
            }
          );
        }
      }

      // Check for trial ending
      if (subscription.status === 'trial' && subscription.trialEndDate) {
        const trialEndDate = new Date(subscription.trialEndDate);
        const daysUntil = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (
          daysUntil >= 0 &&
          daysUntil <= this.preferences.advanceDays.trial &&
          !this.hasNotificationForToday(NotificationType.TRIAL_ENDING, subscription.id)
        ) {
          this.create(
            NotificationType.TRIAL_ENDING,
            `Trial Ending Soon`,
            `${subscription.name} trial ends in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
            {
              metadata: {
                subscriptionId: subscription.id,
                subscriptionName: subscription.name,
                daysUntil,
              },
              priority: NotificationPriority.HIGH,
            }
          );
        }
      }
    });

    // Check for expiring cards
    cards.forEach(card => {
      if (card.expiryMonth && card.expiryYear) {
        const expiryDate = new Date(card.expiryYear, card.expiryMonth - 1);
        const daysUntil = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (
          daysUntil >= 0 &&
          daysUntil <= this.preferences.advanceDays.cardExpiry &&
          !this.hasNotificationForToday(NotificationType.CARD_EXPIRING, card.id)
        ) {
          this.create(
            NotificationType.CARD_EXPIRING,
            `Card Expiring Soon`,
            `Card ending in ${card.lastFour} expires in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
            {
              metadata: {
                cardId: card.id,
                cardLast4: card.lastFour,
                daysUntil,
              },
              priority: daysUntil <= 7 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
            }
          );
        }
      }
    });

    // Check for high spending
    const monthlyTotal = subscriptions
      .filter(s => s.status === 'active')
      .reduce((total, sub) => {
        const amount = sub.price || 0;
        const multiplier = sub.frequency === 'yearly' ? 1/12 : 
                         sub.frequency === 'weekly' ? 4.33 : 1;
        return total + (amount * multiplier);
      }, 0);

    if (
      monthlyTotal > this.preferences.highSpendingThreshold &&
      !this.hasNotificationForToday(NotificationType.HIGH_SPENDING)
    ) {
      this.create(
        NotificationType.HIGH_SPENDING,
        `High Monthly Spending Alert`,
        `Your monthly subscription spending is $${monthlyTotal.toFixed(2)}, exceeding your threshold of $${this.preferences.highSpendingThreshold}`,
        {
          metadata: {
            amount: monthlyTotal,
            threshold: this.preferences.highSpendingThreshold,
          },
          priority: NotificationPriority.MEDIUM,
        }
      );
    }
  }

  // Check if we already have a notification for today
  private hasNotificationForToday(type: NotificationType, subscriptionId?: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return this.notifications.some(n => {
      const notificationDate = new Date(n.timestamp).toISOString().split('T')[0];
      return (
        n.type === type &&
        notificationDate === today &&
        (!subscriptionId || n.metadata?.subscriptionId === subscriptionId)
      );
    });
  }

  // Generate weekly summary
  generateWeeklySummary(subscriptions: FullSubscription[]): void {
    if (!this.preferences.enabled || !this.preferences.types[NotificationType.WEEKLY_SUMMARY]) {
      return;
    }

    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const monthlyTotal = subscriptions
      .filter(s => s.status === 'active')
      .reduce((total, sub) => {
        const amount = sub.price || 0;
        const multiplier = sub.frequency === 'yearly' ? 1/12 : 
                         sub.frequency === 'weekly' ? 4.33 : 1;
        return total + (amount * multiplier);
      }, 0);

    const upcomingRenewals = subscriptions.filter(s => {
      if (s.status !== 'active' || !s.nextPayment) return false;
      const daysUntil = Math.ceil(
        (new Date(s.nextPayment).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntil >= 0 && daysUntil <= 7;
    }).length;

    this.create(
      NotificationType.WEEKLY_SUMMARY,
      `Weekly Summary`,
      `You have ${activeCount} active subscriptions totaling $${monthlyTotal.toFixed(2)}/month. ${upcomingRenewals} renewal${upcomingRenewals !== 1 ? 's' : ''} coming up this week.`,
      {
        metadata: {
          activeCount,
          monthlyTotal,
          upcomingRenewals,
        },
        priority: NotificationPriority.LOW,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    );
  }
}

export const notificationService = NotificationService.getInstance();