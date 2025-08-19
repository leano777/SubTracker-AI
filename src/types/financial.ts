// Extended financial tracking types for the personal financial dashboard

import type { FullSubscription } from './subscription';

// Bills - extends subscription model for all recurring payments
export interface Bill extends FullSubscription {
  billType: 'utility' | 'rent' | 'mortgage' | 'insurance' | 'loan' | 'credit' | 'other';
  dueDay?: number; // Day of month when due
  autopay: boolean;
  accountNumber?: string;
  provider?: string;
  minimumPayment?: number;
  averagePayment?: number;
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
}

// Investment tracking
export interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'crypto' | 'mutual_fund' | 'bond' | 'option' | 'other';
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice: number;
  lastUpdated: string;
  platform: 'robinhood' | 'coinbase' | 'sequence' | 'vanguard' | 'fidelity' | 'other';
  notes?: string;
  targetPrice?: number;
  stopLoss?: number;
  category?: 'growth' | 'dividend' | 'value' | 'speculative' | 'defensive';
  sector?: string;
  // Performance metrics
  totalReturn?: number;
  percentReturn?: number;
  dayChange?: number;
  dayChangePercent?: number;
  // Additional metadata
  currency?: string;
  exchange?: string;
  dividendYield?: number;
  marketCap?: number;
  pe_ratio?: number;
  // Thesis tracking
  thesisId?: string; // Links to notebook entry
  conviction: 'low' | 'medium' | 'high' | 'very_high';
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
}

// Financial goals tracking
export interface FinancialGoal {
  id: string;
  title: string;
  description?: string;
  category: 'savings' | 'investment' | 'debt_reduction' | 'purchase' | 'retirement' | 'emergency' | 'other';
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'abandoned';
  createdDate: string;
  completedDate?: string;
  // Contribution tracking
  monthlyContribution?: number;
  autoContribute: boolean;
  contributionHistory?: {
    date: string;
    amount: number;
    note?: string;
  }[];
  // Milestones
  milestones?: {
    id: string;
    title: string;
    targetAmount: number;
    reached: boolean;
    reachedDate?: string;
  }[];
  // Linked accounts/investments
  linkedInvestments?: string[]; // Investment IDs
  linkedAccounts?: string[];
  notes?: string;
}

// Notebook/Journal entries for planning
export interface NotebookEntry {
  id: string;
  title: string;
  content: string; // Rich text/markdown content
  type: 'investment_thesis' | 'strategy' | 'research' | 'plan' | 'review' | 'journal' | 'other';
  category?: string;
  tags: string[];
  createdDate: string;
  lastModified: string;
  // Linked items
  linkedInvestments?: string[]; // Investment IDs
  linkedGoals?: string[]; // Goal IDs
  linkedSubscriptions?: string[]; // Subscription IDs
  linkedBills?: string[]; // Bill IDs
  // Tasks/Action items
  tasks?: {
    id: string;
    text: string;
    completed: boolean;
    dueDate?: string;
    completedDate?: string;
  }[];
  // Attachments/Resources
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
    size?: number;
  }[];
  // Metadata
  isPinned: boolean;
  isArchived: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative';
  confidenceLevel?: 1 | 2 | 3 | 4 | 5;
}

// Pay period allocation for budgeting
export interface PayPeriodAllocation {
  id: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  grossAmount: number;
  netAmount: number;
  allocations: {
    category: string;
    amount: number;
    percentage: number;
    priority: number;
    isFixed: boolean;
  }[];
  // Actual vs planned tracking
  actualSpending?: {
    category: string;
    amount: number;
    variance: number;
  }[];
  notes?: string;
}

// Watchlist item with enhanced tracking
export interface WatchlistItem {
  id: string;
  name: string;
  type: 'subscription' | 'investment' | 'service' | 'product';
  category: 'personal' | 'business' | 'both';
  estimatedCost: number;
  costFrequency: 'one_time' | 'monthly' | 'yearly' | 'variable';
  priority: 'low' | 'medium' | 'high' | 'considering' | 'researching';
  // Evaluation criteria
  pros: string[];
  cons: string[];
  alternatives?: string[];
  researchNotes?: string;
  // Decision factors
  businessValue?: 1 | 2 | 3 | 4 | 5;
  personalValue?: 1 | 2 | 3 | 4 | 5;
  costBenefit?: 1 | 2 | 3 | 4 | 5;
  timeToImplement?: 'immediate' | 'days' | 'weeks' | 'months';
  // Tracking
  dateAdded: string;
  lastReviewed?: string;
  decidedDate?: string;
  decision?: 'approved' | 'rejected' | 'postponed';
  // Links
  url?: string;
  trialAvailable?: boolean;
  trialDuration?: number;
  referralCode?: string;
}

// Account integration for external services
export interface ExternalAccount {
  id: string;
  provider: 'sequence' | 'coinbase' | 'robinhood' | 'plaid' | 'other';
  accountName: string;
  accountType: 'checking' | 'savings' | 'investment' | 'credit' | 'crypto';
  isConnected: boolean;
  lastSync?: string;
  syncFrequency: 'realtime' | 'daily' | 'weekly' | 'manual';
  // Credentials (encrypted)
  encryptedCredentials?: string;
  // Account data
  balance?: number;
  availableBalance?: number;
  currency?: string;
  accountNumber?: string; // Last 4 digits only
  // Sync status
  syncStatus: 'synced' | 'syncing' | 'error' | 'disconnected';
  lastError?: string;
  // Permissions
  permissions: {
    readBalance: boolean;
    readTransactions: boolean;
    readInvestments: boolean;
    executeTransfers: boolean;
    executeTrades: boolean;
  };
}

// Transaction for tracking all money movements
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer' | 'investment';
  category: string;
  subcategory?: string;
  description: string;
  // Source/Destination
  accountId?: string;
  externalAccountId?: string;
  paymentMethodId?: string;
  // Linked items
  subscriptionId?: string;
  billId?: string;
  investmentId?: string;
  goalId?: string;
  // Metadata
  isPending: boolean;
  isRecurring: boolean;
  tags?: string[];
  notes?: string;
  // Reconciliation
  isReconciled: boolean;
  reconciledDate?: string;
}

// Paycheck and income tracking
export interface IncomeSource {
  id: string;
  name: string;
  type: 'salary' | 'hourly' | 'contract' | 'freelance' | 'side_hustle' | 'passive' | 'other';
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'irregular';
  grossAmount: number;
  netAmount: number;
  // Deductions
  taxes?: number;
  benefits?: number;
  retirement?: number;
  otherDeductions?: number;
  // Schedule
  payDates: string[]; // Next few pay dates
  isActive: boolean;
  // Metadata
  employer?: string;
  notes?: string;
  createdDate: string;
  lastModified: string;
}

// Paycheck allocation mapping
export interface PaycheckAllocation {
  id: string;
  incomeSourceId: string;
  payDate: string;
  grossAmount: number;
  netAmount: number;
  // Pod allocations from this paycheck
  podAllocations: {
    podId: string;
    amount: number;
    percentage: number;
  }[];
  // Fixed expenses
  fixedExpenses: {
    name: string;
    amount: number;
    category: 'rent' | 'utilities' | 'insurance' | 'loan' | 'other';
  }[];
  // Remaining after allocations
  remainingAmount: number;
  // Status
  isPlanned: boolean; // vs actual
  isProcessed: boolean;
  // Notes
  notes?: string;
}

// Pay cycle summary for visualization
export interface PayCycleSummary {
  period: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalAllocated: number;
  totalFixedExpenses: number;
  totalRemaining: number;
  paychecks: PaycheckAllocation[];
  // Pod funding status
  podFunding: {
    podId: string;
    targetAmount: number;
    allocatedAmount: number;
    remainingNeeded: number;
    isFunded: boolean;
  }[];
}

// Monthly budget pods for organized saving
export interface BudgetPod {
  id: string;
  name: string;
  type: 'vehicle' | 'rent' | 'food' | 'subscriptions' | 'emergency' | 'entertainment' | 'health' | 'utilities' | 'custom';
  description?: string;
  monthlyAmount: number;
  currentAmount: number;
  targetAmount?: number; // For pods that are building toward a goal
  // Tracking
  isActive: boolean;
  autoTransfer: boolean;
  transferDay?: number; // Day of month to auto-transfer
  // Income allocation preferences
  fundingPreferences?: {
    preferredPaychecks: 'first' | 'last' | 'all' | 'custom'; // Which paychecks in cycle
    minimumPerPaycheck?: number; // Minimum amount per paycheck
    maxPercentagePerPaycheck?: number; // Max % of paycheck for this pod
  };
  // Associated items
  linkedSubscriptions?: string[]; // Subscription IDs that draw from this pod
  linkedBills?: string[]; // Bill IDs that draw from this pod
  linkedGoals?: string[]; // Goal IDs this pod contributes to
  // History
  createdDate: string;
  lastModified: string;
  contributions?: {
    date: string;
    amount: number;
    note?: string;
    paycheckId?: string; // Link to specific paycheck
  }[];
  withdrawals?: {
    date: string;
    amount: number;
    reason: string;
    linkedItem?: string; // ID of subscription/bill that caused withdrawal
  }[];
  // Settings
  color?: string; // UI color theme
  icon?: string; // Icon name or emoji
  priority: 1 | 2 | 3 | 4 | 5;
  rolloverUnused: boolean; // Whether unused amounts roll to next month
  warningThreshold?: number; // Alert when pod balance drops below this
  notes?: string;
}

// Dashboard summary data
export interface FinancialSummary {
  // Cash flow
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashFlow: number;
  
  // Subscriptions
  activeSubscriptions: number;
  monthlySubscriptionCost: number;
  upcomingPayments: number;
  
  // Bills
  totalBills: number;
  monthlyBillsCost: number;
  overdueBills: number;
  
  // Investments
  portfolioValue: number;
  totalInvested: number;
  totalReturn: number;
  dayChange: number;
  
  // Goals
  activeGoals: number;
  totalGoalTarget: number;
  totalGoalProgress: number;
  goalsOnTrack: number;
  
  // Budgets
  weeklyBudget: number;
  weeklyAllocated: number;
  weeklyRemaining: number;
  
  // Alerts
  alerts: {
    type: 'payment_due' | 'goal_milestone' | 'budget_exceeded' | 'investment_alert' | 'trial_ending';
    severity: 'info' | 'warning' | 'critical';
    message: string;
    actionRequired?: boolean;
  }[];
}