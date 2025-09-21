// Type definitions
export interface Subscription {
  id: string;
  name: string;
  cost: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  nextPayment?: string;
  category: string;
  isActive: boolean;
  description?: string;
  subscriptionType: 'personal' | 'business';
  status: 'active' | 'cancelled' | 'watchlist' | 'trial';
  dateCancelled?: string;
  watchlistNotes?: string;
  paymentCardId?: string;
  favicon?: string;
  websiteUrl?: string;
  // Free trial fields
  isFreeTrial?: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
  trialConvertedDate?: string;
  originalTrialCost?: number;
}

export interface PaymentCard {
  id: string;
  nickname: string;
  lastFour: string;
  type: 'visa' | 'mastercard' | 'amex' | 'discover';
  expiryMonth: string;
  expiryYear: string;
  color: string;
  isDefault: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'stealth-ops';

export interface AppSettings {
  notifications: {
    upcomingPayments: boolean;
    highSpending: boolean;
    weeklyReports: boolean;
    trialExpirations: boolean;
  };
  thresholds: {
    highSpendingAmount: number;
    upcomingPaymentDays: number;
    trialReminderDays: number;
  };
  preferences: {
    defaultView: string;
    showCancelled: boolean;
    groupByCategory: boolean;
    darkMode: boolean;
    showFavicons: boolean;
    theme: ThemeMode;
  };
}

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'trial';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  subscriptionId?: string;
}

// Chart color palette
export const CHART_COLORS = {
  primary: '#030213',
  secondary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#6366f1',
  purple: '#8b5cf6',
  pink: '#ec4899',
  trial: '#f97316'
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Entertainment': CHART_COLORS.secondary,
  'Productivity': CHART_COLORS.success,
  'Security': CHART_COLORS.danger,
  'Storage': CHART_COLORS.warning,
  'AI & Tools': CHART_COLORS.info,
  'Business': CHART_COLORS.purple,
  'Design': CHART_COLORS.pink,
  'Other': '#6b7280'
};

export const CARD_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#6366f1', '#8b5cf6', '#ec4899', '#06b6d4'
];