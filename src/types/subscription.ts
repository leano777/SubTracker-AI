// Enhanced subscription types with comprehensive budget allocation support
export interface FullSubscription {
  id: string;
  name: string;
  // Both price and cost for compatibility
  price: number;
  cost: number;
  // Both frequency and billingCycle for compatibility
  frequency: "monthly" | "yearly" | "weekly" | "daily" | "quarterly";
  billingCycle: "monthly" | "quarterly" | "yearly" | "variable";
  nextPayment: string;
  category: string;
  status: "active" | "cancelled" | "paused" | "watchlist" | "trial";
  // Payment card properties with multiple naming conventions
  paymentCard?: string;
  cardId?: string;
  paymentCardId?: string;
  // Additional properties for compatibility
  isActive: boolean;
  subscriptionType?: "personal" | "business";
  logoUrl?: string;
  description?: string;
  website?: string;
  websiteUrl?: string;
  billingUrl?: string;
  tags?: string[];
  notes?: string;
  dateAdded: string;
  dateCancelled?: string;
  cancelledDate?: string;
  trialEndDate?: string;
  trialStartDate?: string;
  trialConvertedDate?: string;
  originalTrialCost?: number;
  isFreeTrial?: boolean;
  reminderDays?: number;
  isStarred?: boolean;
  watchlistNotes?: string;
  hasLinkedCard?: boolean;
  favicon?: string;
  variablePricing?: {
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
    isVariable?: boolean;
    upcomingChanges?: { date: string; cost: number; description: string }[];
  };
  automationEnabled?: boolean;
  automationRules?: {
    cancelBeforeRenewal?: boolean;
    upgradeThreshold?: number;
    downgradeThreshold?: number;
  };
  linkedCard?: string;
  planType?: "basic" | "premium" | "enterprise" | "custom" | "paid" | "free" | "trial";
  // Enhanced budget allocation properties
  budgetCategory?: string; // Maps to financial routing buckets
  priority?: "essential" | "important" | "nice-to-have" | "medium" | "low" | "high";
  businessExpense?: boolean;
  taxDeductible?: boolean;
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

export type FullPaymentCard = PaymentCard;

// Type alias for backwards compatibility
export type Subscription = FullSubscription;

// New budget allocation types
export interface BudgetCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  weeklyAllocation: number; // Amount to allocate weekly
  currentBalance: number; // Current balance in this bucket
  priority: number; // 1-10, higher = more important
  autoFund: boolean; // Automatically fund this category
  fundingOrder: number; // Order in which to fund categories
  createdDate: string;
  isDefault: boolean; // Can't be deleted if true
  // Calculation properties
  weeklyExpenses?: number; // Calculated weekly expenses for this category
  monthlyExpenses?: number; // Calculated monthly expenses
  subscriptionCount?: number; // Number of active subscriptions
  // Overage/underage tracking
  lastWeekOverage?: number;
  averageOverage?: number;
  minimumBuffer?: number; // Minimum buffer to maintain
}

export interface WeeklyBudget {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  allocatedAmount: number;
  subscriptions: string[];
  // Additional properties expected by components
  totalBudget: number;
  allocated: number;
  remaining: number;
  weekStartDate?: string; // For backwards compatibility
  weekEndDate?: string; // For backwards compatibility
  isCurrentWeek?: boolean;
  weekNumber?: number;
  monthYear?: string;
  requiredAmount?: number;
  daysUntilPayday?: number;
}

export interface PayPeriodRequirement {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  requiredAmount: number;
  subscriptions: {
    id: string;
    name: string;
    cost: number;
    dueDate: string;
    category: string;
    frequency: string;
    status: string;
    subscriptionType: string;
  }[];
}

export interface WeeklyAllocation {
  week: string; // ISO week string
  categories: {
    [categoryId: string]: {
      requiredAmount: number;
      allocatedAmount: number;
      actualSpent: number;
      subscriptions: string[]; // Subscription IDs due this week
      overage: number; // Positive = over, negative = under
    };
  };
  totalRequired: number;
  totalAllocated: number;
  payDate: string; // Thursday pay date for this week
  allocationsComplete: boolean;
}

export interface FinancialRoutingSettings {
  payDay: "thursday"; // Fixed to Thursday as requested
  weeklyIncome: number; // Total weekly income
  emergencyFundPercentage: number; // Percentage to reserve for emergency
  minimumBufferPercentage: number; // Minimum buffer per category
  autoAllocateEnabled: boolean; // Automatically allocate funds
  rolloverUnspent: boolean; // Roll over unspent amounts to next week
  priorityFunding: boolean; // Fund high priority categories first
  // Advanced settings
  notificationSettings: {
    lowBalance: boolean;
    overspending: boolean;
    weeklyAllocation: boolean;
    categoryRebalancing: boolean;
  };
  allocationThresholds: {
    warning: number; // Warn when category balance drops below this %
    critical: number; // Critical alert when balance drops below this %
  };
}

// Default budget categories
export const DEFAULT_BUDGET_CATEGORIES: Omit<BudgetCategory, "id" | "createdDate">[] = [
  {
    name: "Business Tools",
    description: "Professional software, SaaS tools, and business-related subscriptions",
    color: "#3b82f6", // Blue
    icon: "briefcase",
    weeklyAllocation: 100,
    currentBalance: 0,
    priority: 8,
    autoFund: true,
    fundingOrder: 1,
    isDefault: true,
    minimumBuffer: 50,
  },
  {
    name: "Entertainment",
    description: "Streaming services, gaming, music, and entertainment subscriptions",
    color: "#ef4444", // Red
    icon: "play-circle",
    weeklyAllocation: 75,
    currentBalance: 0,
    priority: 5,
    autoFund: true,
    fundingOrder: 3,
    isDefault: true,
    minimumBuffer: 25,
  },
  {
    name: "Utilities & Services",
    description: "Internet, phone, cloud storage, and essential services",
    color: "#10b981", // Green
    icon: "wifi",
    weeklyAllocation: 50,
    currentBalance: 0,
    priority: 9,
    autoFund: true,
    fundingOrder: 2,
    isDefault: true,
    minimumBuffer: 30,
  },
  {
    name: "Health & Fitness",
    description: "Gym memberships, health apps, nutrition, and wellness subscriptions",
    color: "#f59e0b", // Amber
    icon: "heart",
    weeklyAllocation: 40,
    currentBalance: 0,
    priority: 7,
    autoFund: true,
    fundingOrder: 4,
    isDefault: false,
    minimumBuffer: 20,
  },
  {
    name: "Education & Learning",
    description: "Online courses, educational platforms, and skill development",
    color: "#8b5cf6", // Purple
    icon: "book-open",
    weeklyAllocation: 30,
    currentBalance: 0,
    priority: 6,
    autoFund: true,
    fundingOrder: 5,
    isDefault: false,
    minimumBuffer: 15,
  },
];

// Weekly allocation calculation utilities
export interface WeeklyCalculationResult {
  week: string;
  payDate: string;
  categories: {
    [categoryId: string]: {
      subscriptionsDue: FullSubscription[];
      totalDue: number;
      currentBalance: number;
      requiredFunding: number;
      priority: number;
    };
  };
  totalWeeklyNeed: number;
  totalCurrentBalance: number;
  additionalFundingRequired: number;
  fundingRecommendations: {
    categoryId: string;
    amount: number;
    reason: string;
    priority: number;
  }[];
}

// Import and re-export notification type from constants
import type { AppNotification } from './constants';
export type { AppNotification };

// Legacy Notification type for backwards compatibility
export type Notification = AppNotification & {
  actionUrl?: string;
  actionText?: string;
};

// Note: Additional types will be available from constants when implemented
