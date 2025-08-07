// Enhanced subscription types with comprehensive budget allocation support
export interface FullSubscription {
  id: string;
  name: string;
  price: number;
  frequency: "monthly" | "yearly" | "weekly" | "daily";
  nextPayment: string;
  category: string;
  status: "active" | "cancelled" | "paused" | "watchlist";
  paymentCard?: string;
  description?: string;
  website?: string;
  tags?: string[];
  notes?: string;
  dateAdded: string;
  cancelledDate?: string;
  trialEndDate?: string;
  reminderDays?: number;
  isStarred?: boolean;
  variablePricing?: {
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
  };
  automationEnabled?: boolean;
  automationRules?: {
    cancelBeforeRenewal?: boolean;
    upgradeThreshold?: number;
    downgradeThreshold?: number;
  };
  linkedCard?: string;
  planType?: "basic" | "premium" | "enterprise" | "custom";
  // Enhanced budget allocation properties
  budgetCategory?: string; // Maps to financial routing buckets
  priority?: "essential" | "important" | "nice-to-have";
  businessExpense?: boolean;
  taxDeductible?: boolean;
}

export interface PaymentCard {
  id: string;
  name: string;
  lastFourDigits: string;
  expiryMonth: number;
  expiryYear: number;
  provider: "visa" | "mastercard" | "amex" | "discover" | "other";
  isDefault: boolean;
  nickname?: string;
  color?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  dateAdded: string;
  // Enhanced budget properties
  creditLimit?: number;
  availableCredit?: number;
  statementDate?: number; // Day of month
  paymentDueDate?: number; // Day of month
}

export type FullPaymentCard = PaymentCard;

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

// Export all existing types
export type {
  Subscription,
  NotificationSetting,
  AppSettings,
  BudgetAlert,
  WeeklyBudget,
} from "./constants";
