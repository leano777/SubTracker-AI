export enum NotificationType {
  RENEWAL_UPCOMING = 'renewal_upcoming',
  PAYMENT_DUE = 'payment_due',
  TRIAL_ENDING = 'trial_ending',
  CARD_EXPIRING = 'card_expiring',
  HIGH_SPENDING = 'high_spending',
  SUBSCRIPTION_ADDED = 'subscription_added',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  SUBSCRIPTION_UPDATED = 'subscription_updated',
  WEEKLY_SUMMARY = 'weekly_summary',
  BUDGET_EXCEEDED = 'budget_exceeded',
  PRICE_INCREASE = 'price_increase',
  SYSTEM = 'system'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived'
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  timestamp: string;
  expiresAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    subscriptionId?: string;
    subscriptionName?: string;
    amount?: number;
    daysUntil?: number;
    cardLast4?: string;
    [key: string]: any;
  };
  sound?: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  types: {
    [NotificationType.RENEWAL_UPCOMING]: boolean;
    [NotificationType.PAYMENT_DUE]: boolean;
    [NotificationType.TRIAL_ENDING]: boolean;
    [NotificationType.CARD_EXPIRING]: boolean;
    [NotificationType.HIGH_SPENDING]: boolean;
    [NotificationType.SUBSCRIPTION_ADDED]: boolean;
    [NotificationType.SUBSCRIPTION_CANCELLED]: boolean;
    [NotificationType.SUBSCRIPTION_UPDATED]: boolean;
    [NotificationType.WEEKLY_SUMMARY]: boolean;
    [NotificationType.BUDGET_EXCEEDED]: boolean;
    [NotificationType.PRICE_INCREASE]: boolean;
    [NotificationType.SYSTEM]: boolean;
  };
  advanceDays: {
    renewal: number; // Days before renewal to notify
    trial: number; // Days before trial ends
    cardExpiry: number; // Days before card expires
  };
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "08:00"
  };
  highSpendingThreshold: number;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  emailNotifications: true,
  pushNotifications: true,
  soundEnabled: false,
  types: {
    [NotificationType.RENEWAL_UPCOMING]: true,
    [NotificationType.PAYMENT_DUE]: true,
    [NotificationType.TRIAL_ENDING]: true,
    [NotificationType.CARD_EXPIRING]: true,
    [NotificationType.HIGH_SPENDING]: true,
    [NotificationType.SUBSCRIPTION_ADDED]: true,
    [NotificationType.SUBSCRIPTION_CANCELLED]: true,
    [NotificationType.SUBSCRIPTION_UPDATED]: false,
    [NotificationType.WEEKLY_SUMMARY]: true,
    [NotificationType.BUDGET_EXCEEDED]: true,
    [NotificationType.PRICE_INCREASE]: true,
    [NotificationType.SYSTEM]: true,
  },
  advanceDays: {
    renewal: 7,
    trial: 3,
    cardExpiry: 30,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  highSpendingThreshold: 500,
};