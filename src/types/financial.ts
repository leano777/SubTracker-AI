// Re-export financial types from database.ts
export type {
  BudgetPod,
  CategoryRule,
  PodPermission,
  Transaction,
  Subscription,
} from './database';

// Additional financial types
export interface IncomeSource {
  id: string;
  name: string;
  type: 'salary' | 'freelance' | 'business' | 'investment' | 'other';
  amount: number;
  grossAmount?: number;
  netAmount?: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  taxRate?: number;
  taxes?: number;
  benefits?: number;
  retirement?: number;
  otherDeductions?: number;
  employer?: string;
  payDates?: Date[];
  notes?: string;
  createdDate: Date;
  lastModified: Date;
}

export interface PaycheckAllocation {
  id: string;
  incomeSourceId: string;
  podId: string;
  amount: number;
  percentage?: number;
  isPercentage: boolean;
  priority: number;
}

export interface PayCycleSummary {
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalAllocated: number;
  unallocated: number;
  allocations: PaycheckAllocation[];
}

export interface Investment {
  id: string;
  name: string;
  type: 'stock' | 'stocks' | 'bonds' | 'crypto' | 'real-estate' | 'mutual-funds' | 'etf' | 'other';
  currentValue: number;
  currentPrice?: number;
  purchasePrice: number;
  purchaseDate: Date | string;
  quantity?: number;
  symbol?: string;
  platform?: string;
  notes?: string;
  createdDate: Date;
  lastModified: Date;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
  isActive: boolean;
  createdDate: Date;
  lastModified: Date;
}

export interface CashFlowPeriod {
  period: string;
  income: number;
  expenses: number;
  net: number;
  date: Date;
}

export interface TransactionCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  parentId?: string;
}

export interface PodFundingAnalysis {
  podId: string;
  podName: string;
  currentBalance: number;
  targetAmount: number;
  shortfall: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  daysUntilDue?: number;
  recommendedFunding: number;
}

export interface FundingSuggestion {
  podId: string;
  podName: string;
  suggestedAmount: number;
  reason: string;
  impact: 'high' | 'medium' | 'low';
}

export interface FundingAutomationRule {
  id: string;
  name: string;
  isActive: boolean;
  trigger: 'income_received' | 'schedule' | 'threshold';
  conditions: {
    incomeSource?: string;
    schedule?: string;
    thresholdPercentage?: number;
  };
  actions: {
    type: 'distribute' | 'save' | 'invest';
    allocations: Array<{
      podId: string;
      percentage: number;
    }>;
  };
}

export interface PodFundingDashboardMetrics {
  totalPods: number;
  fullyFunded: number;
  needsFunding: number;
  criticalPods: number;
  totalShortfall: number;
  totalSurplus: number;
  fundingHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface PodTransaction {
  id: string;
  podId: string;
  amount: number;
  type: 'funding' | 'expense' | 'transfer';
  description: string;
  date: Date;
  fromPodId?: string;
  toPodId?: string;
  category?: string;
  notes?: string;
}

export interface PodHistory {
  podId: string;
  history: Array<{
    date: Date;
    balance: number;
    change: number;
    type: 'funding' | 'expense' | 'adjustment';
  }>;
}

export interface SpendingLimit {
  id: string;
  podId: string;
  period: 'daily' | 'weekly' | 'monthly';
  amount: number;
  currentSpent: number;
  alertThreshold: number;
  isActive: boolean;
}