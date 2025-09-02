// Database Schema Types for SubTracker AI
// Prepared for backend integration with user authentication

// User Management
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
  subscription: UserSubscriptionPlan;
}

export interface UserPreferences {
  currency: string;
  timezone: string;
  fiscalMonthStartDay: number; // 1-31
  darkMode: boolean;
  notifications: NotificationSettings;
  dataRetentionDays: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  budgetAlerts: boolean;
  subscriptionReminders: boolean;
  weeklyReports: boolean;
  alertThreshold: number; // Percentage of budget before alert
}

export interface UserSubscriptionPlan {
  plan: 'free' | 'premium' | 'family';
  validUntil: Date;
  features: string[];
}

// Enhanced Budget Pod System
export interface BudgetPod {
  id: string;
  userId: string;
  name: string;
  description?: string;
  iconName: string;
  color: string;
  
  // Budget Configuration
  budgetType: 'fixed' | 'percentage' | 'envelope' | 'goal';
  amount: number;
  percentageOfIncome?: number;
  
  // Time Period
  period: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  customPeriodDays?: number;
  startDate: Date;
  endDate?: Date;
  
  // Rollover Settings
  rolloverEnabled: boolean;
  rolloverType?: 'accumulate' | 'reset' | 'carryforward';
  maxRolloverAmount?: number;
  
  // Category Rules
  categories: string[];
  autoAssignRules: CategoryRule[];
  
  // Current Period Stats
  currentPeriodSpent: number;
  currentPeriodRemaining: number;
  previousPeriodRollover: number;
  
  // Goals
  savingsGoal?: number;
  goalDeadline?: Date;
  goalProgress?: number;
  
  // Sharing (for family plans)
  sharedWith?: string[]; // User IDs
  permissions?: PodPermission[];
  
  // Metadata
  isActive: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastResetAt: Date;
}

export interface CategoryRule {
  id: string;
  podId: string;
  ruleName: string;
  ruleType: 'merchant' | 'category' | 'amount' | 'keyword';
  condition: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  value: string | number;
  priority: number;
}

export interface PodPermission {
  userId: string;
  permission: 'view' | 'add_transaction' | 'edit' | 'admin';
}

// Enhanced Transaction System
export interface Transaction {
  id: string;
  userId: string;
  podId?: string;
  
  // Basic Info
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer' | 'savings';
  
  // Categorization
  category: string;
  subcategory?: string;
  tags: string[];
  merchant?: string;
  
  // Financial Details
  paymentMethod?: 'cash' | 'credit' | 'debit' | 'bank_transfer' | 'crypto' | 'other';
  cardId?: string; // Links to payment card
  subscriptionId?: string; // Links to subscription
  
  // Dates
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Location (optional)
  location?: {
    merchant: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  
  // Attachments
  receiptUrl?: string;
  notes?: string;
  
  // Recurring Transaction Info
  isRecurring: boolean;
  recurringId?: string;
  
  // Budget Impact
  impactedPods: string[]; // Pod IDs affected by this transaction
  splitAmounts?: { podId: string; amount: number }[]; // For split transactions
  
  // Reconciliation
  isReconciled: boolean;
  reconciledAt?: Date;
  bankTransactionId?: string;
}

// Subscription Management (Enhanced)
export interface Subscription {
  id: string;
  userId: string;
  
  // Basic Info
  name: string;
  description?: string;
  provider: string;
  category: string;
  
  // Billing
  cost: number;
  currency: string;
  billingCycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  customBillingDays?: number;
  
  // Dates
  startDate: Date;
  nextBillingDate: Date;
  lastBillingDate?: Date;
  endDate?: Date;
  
  // Payment
  paymentMethodId?: string;
  autoRenew: boolean;
  
  // Tracking
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'trial';
  trialEndDate?: Date;
  
  // Budget Integration
  linkedPodId?: string;
  
  // Notifications
  reminderDays: number; // Days before billing to remind
  lastReminderSent?: Date;
  
  // Usage Tracking
  usageTracking?: {
    lastUsed?: Date;
    usageFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
    value: 'essential' | 'valuable' | 'nice-to-have' | 'unused';
  };
  
  // Metadata
  url?: string;
  logoUrl?: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Investment Tracking
export interface Investment {
  id: string;
  userId: string;
  
  // Basic Info
  name: string;
  symbol?: string;
  type: 'stock' | 'etf' | 'mutual_fund' | 'crypto' | 'bond' | 'real_estate' | 'other';
  platform: string;
  
  // Holdings
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: Date;
  
  // Performance
  totalInvested: number;
  currentValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  realizedGainLoss: number;
  
  // Dividends/Income
  dividendYield?: number;
  lastDividendAmount?: number;
  lastDividendDate?: Date;
  totalDividendsReceived: number;
  
  // Goals
  targetPrice?: number;
  stopLossPrice?: number;
  notes?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Financial Goals
export interface FinancialGoal {
  id: string;
  userId: string;
  
  name: string;
  description?: string;
  type: 'savings' | 'debt_payoff' | 'investment' | 'purchase' | 'emergency_fund';
  
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  
  linkedPodIds: string[];
  autoContribute: boolean;
  contributionAmount?: number;
  contributionFrequency?: 'weekly' | 'monthly';
  
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  
  milestones: {
    amount: number;
    description: string;
    reached: boolean;
    reachedAt?: Date;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Analytics and Insights
export interface FinancialSnapshot {
  id: string;
  userId: string;
  date: Date;
  
  // Income
  totalIncome: number;
  incomeByCategory: { category: string; amount: number }[];
  
  // Expenses
  totalExpenses: number;
  expensesByCategory: { category: string; amount: number }[];
  expensesByPod: { podId: string; podName: string; amount: number }[];
  
  // Savings
  totalSaved: number;
  savingsRate: number;
  
  // Budget Performance
  budgetUtilization: number;
  overBudgetPods: string[];
  underBudgetPods: string[];
  
  // Trends
  monthOverMonthChange: number;
  yearOverYearChange: number;
  
  // Predictions
  projectedMonthEndBalance: number;
  projectedSavings: number;
  
  createdAt: Date;
}

// Sync and Backup
export interface DataSync {
  id: string;
  userId: string;
  syncType: 'backup' | 'restore' | 'export' | 'import';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dataTypes: ('pods' | 'transactions' | 'subscriptions' | 'investments' | 'goals')[];
  fileUrl?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}