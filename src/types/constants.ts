// Type definitions - Updated to be compatible with FullSubscription
export interface Subscription {
  id: string;
  name: string;
  // Both price and cost for compatibility
  price: number;
  cost: number;
  // Both frequency and billingCycle for compatibility
  frequency: "monthly" | "yearly" | "weekly" | "daily";
  billingCycle: "monthly" | "quarterly" | "yearly";
  nextPayment: string;
  category: string;
  isActive: boolean;
  description?: string;
  subscriptionType: "personal" | "business";
  status: "active" | "cancelled" | "watchlist" | "trial";
  dateAdded: string;
  dateCancelled?: string;
  watchlistNotes?: string;
  paymentCardId?: string;
  cardId?: string; // Alternative naming for payment card
  favicon?: string;
  logoUrl?: string; // Alternative naming for logo
  websiteUrl?: string;
  website?: string; // Alternative naming
  billingUrl?: string;
  tags?: string[];
  notes?: string;
  cancelledDate?: string;
  trialEndDate?: string;
  reminderDays?: number;
  isStarred?: boolean;
  variablePricing?: {
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
    isVariable?: boolean;
    upcomingChanges?: { date: string; cost: string; description: string }[];
  };
  planType?: "basic" | "premium" | "enterprise" | "custom" | "paid" | "free" | "trial";
  priority?: "essential" | "important" | "nice-to-have" | "medium" | "low" | "high";
  budgetCategory?: string;
  businessExpense?: boolean;
  taxDeductible?: boolean;
  automationEnabled?: boolean;
  automationRules?: {
    cancelBeforeRenewal?: boolean;
    upgradeThreshold?: number;
    downgradeThreshold?: number;
  };
  linkedCard?: string;
  hasLinkedCard?: boolean;
  paymentCard?: string;
  // Free trial fields
  isFreeTrial?: boolean;
  trialStartDate?: string;
  trialConvertedDate?: string;
  originalTrialCost?: number;
}

export interface PaymentCard {
  id: string;
  nickname?: string;
  name?: string; // Alternative naming
  lastFour?: string;
  lastFourDigits?: string; // Alternative naming
  type?: "visa" | "mastercard" | "amex" | "discover" | "credit" | "debit" | "other";
  provider?: "visa" | "mastercard" | "amex" | "discover" | "other"; // Alternative naming
  issuer?: string;
  expiryMonth?: string | number; // Made optional for compatibility
  expiryYear?: string | number; // Made optional for compatibility
  color?: string;
  isDefault: boolean;
  dateAdded?: string;
  creditLimit?: number;
  availableCredit?: number;
  statementDate?: number;
  paymentDueDate?: number;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export type ThemeMode = "light" | "dark" | "stealth-ops";

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

export interface AppNotification {
  id: string;
  type: "warning" | "info" | "success" | "trial" | "reminder";
  title: string;
  message: string;
  timestamp: string;
  date?: string; // Alternative naming for timestamp
  read: boolean;
  subscriptionId?: string;
}

// Chart color palette
export const CHART_COLORS = {
  primary: "#030213",
  secondary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#6366f1",
  purple: "#8b5cf6",
  pink: "#ec4899",
  trial: "#f97316",
};

export const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: CHART_COLORS.secondary,
  Productivity: CHART_COLORS.success,
  Security: CHART_COLORS.danger,
  Storage: CHART_COLORS.warning,
  "AI & Tools": CHART_COLORS.info,
  Business: CHART_COLORS.purple,
  Design: CHART_COLORS.pink,
  Other: "#6b7280",
};

export const CARD_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];
