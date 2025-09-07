/**
 * Financial Transaction Types
 * Comprehensive types for monthly financial data tracking
 */

export type TransactionCategory = 
  | 'transportation'
  | 'debt_payments'
  | 'utilities'
  | 'subscriptions'
  | 'rent'
  | 'groceries'
  | 'dining'
  | 'shopping'
  | 'entertainment'
  | 'healthcare'
  | 'insurance'
  | 'savings'
  | 'investments'
  | 'taxes'
  | 'other';

export const TransactionCategoryEnum = {
  TRANSPORTATION: 'transportation' as TransactionCategory,
  DEBT_PAYMENTS: 'debt_payments' as TransactionCategory,
  UTILITIES: 'utilities' as TransactionCategory,
  SUBSCRIPTIONS: 'subscriptions' as TransactionCategory,
  RENT: 'rent' as TransactionCategory,
  GROCERIES: 'groceries' as TransactionCategory,
  DINING: 'dining' as TransactionCategory,
  SHOPPING: 'shopping' as TransactionCategory,
  ENTERTAINMENT: 'entertainment' as TransactionCategory,
  HEALTHCARE: 'healthcare' as TransactionCategory,
  INSURANCE: 'insurance' as TransactionCategory,
  SAVINGS: 'savings' as TransactionCategory,
  INVESTMENTS: 'investments' as TransactionCategory,
  TAXES: 'taxes' as TransactionCategory,
  OTHER: 'other' as TransactionCategory,
} as const;

export type DebtType = 
  | 'affirm'
  | 'klarna'
  | 'credit_card'
  | 'student_loan'
  | 'credit_builder'
  | 'personal_loan'
  | 'auto_loan'
  | 'mortgage'
  | 'other';

export const DebtTypeEnum = {
  AFFIRM: 'affirm' as DebtType,
  KLARNA: 'klarna' as DebtType,
  CREDIT_CARD: 'credit_card' as DebtType,
  STUDENT_LOAN: 'student_loan' as DebtType,
  CREDIT_BUILDER: 'credit_builder' as DebtType,
  PERSONAL_LOAN: 'personal_loan' as DebtType,
  AUTO_LOAN: 'auto_loan' as DebtType,
  MORTGAGE: 'mortgage' as DebtType,
  OTHER: 'other' as DebtType,
} as const;

export type SubscriptionCategory = 
  | 'business_tools'
  | 'personal'
  | 'entertainment'
  | 'productivity'
  | 'cloud_storage'
  | 'ai_services'
  | 'development'
  | 'other';

export const SubscriptionCategoryEnum = {
  BUSINESS_TOOLS: 'business_tools' as SubscriptionCategory,
  PERSONAL: 'personal' as SubscriptionCategory,
  ENTERTAINMENT: 'entertainment' as SubscriptionCategory,
  PRODUCTIVITY: 'productivity' as SubscriptionCategory,
  CLOUD_STORAGE: 'cloud_storage' as SubscriptionCategory,
  AI_SERVICES: 'ai_services' as SubscriptionCategory,
  DEVELOPMENT: 'development' as SubscriptionCategory,
  OTHER: 'other' as SubscriptionCategory,
} as const;

export interface Transaction {
  id: string;
  date: string; // ISO date string
  name: string;
  amount: number;
  category: TransactionCategory;
  subcategory?: string;
  recurring: boolean;
  notes?: string;
  paymentMethod?: string;
  vendor?: string;
  tags?: string[];
}

export interface DebtPayment {
  id: string;
  date: string;
  name: string;
  amount: number;
  type: DebtType;
  creditor: string;
  remainingBalance?: number;
  interestRate?: number;
  minimumPayment?: number;
  dueDate?: string;
}

export interface SubscriptionPayment {
  id: string;
  date: string;
  name: string;
  serviceName: string;
  amount: number;
  category: SubscriptionCategory;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
  isActive: boolean;
  nextPaymentDate?: string;
}

export interface CategoryBreakdown {
  category: TransactionCategory;
  displayName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  icon?: string;
  color?: string;
  transactions: Transaction[];
}

export interface MonthlyFinancialData {
  month: string;
  year: number;
  totalSpending: number;
  totalIncome: number;
  netAmount: number;
  categories: CategoryBreakdown[];
  transactions: Transaction[];
  debtPayments: DebtPayment[];
  subscriptions: SubscriptionPayment[];
  transportationCosts: number;
  utilityCosts: number;
  debtTotal: number;
  subscriptionTotal: number;
}

export interface FinancialSummary {
  totalExternalSpending: number;
  transportation: number;
  debtAndCredit: number;
  utilities: number;
  subscriptions: number;
  other: number;
  savingsRate: number;
  monthOverMonthChange: number;
}

export interface DebtSummary {
  type: DebtType;
  displayName: string;
  totalAmount: number;
  paymentCount: number;
  payments: DebtPayment[];
  averagePayment: number;
}

export interface SubscriptionSummary {
  category: SubscriptionCategory;
  displayName: string;
  totalAmount: number;
  subscriptions: SubscriptionPayment[];
  activeCount: number;
  monthlyRecurring: number;
}

// Sample data structure matching your HTML dashboard
export const SAMPLE_AUGUST_2025_DATA: MonthlyFinancialData = {
  month: 'August',
  year: 2025,
  totalSpending: 4185.39,
  totalIncome: 0,
  netAmount: -4185.39,
  transportationCosts: 1208.00,
  utilityCosts: 950.00,
  debtTotal: 1013.73,
  subscriptionTotal: 313.37,
  categories: [
    {
      category: 'transportation',
      displayName: 'Transportation',
      amount: 1208.00,
      percentage: 29,
      transactionCount: 2,
      icon: '🚗',
      color: '#8884d8',
      transactions: []
    },
    {
      category: 'debt_payments',
      displayName: 'Debt Payments',
      amount: 1013.73,
      percentage: 25,
      transactionCount: 16,
      icon: '💳',
      color: '#82ca9d',
      transactions: []
    },
    {
      category: 'utilities',
      displayName: 'Utilities',
      amount: 950.00,
      percentage: 23,
      transactionCount: 2,
      icon: '⚡',
      color: '#ffc658',
      transactions: []
    },
    {
      category: 'subscriptions',
      displayName: 'Subscriptions',
      amount: 313.37,
      percentage: 8,
      transactionCount: 16,
      icon: '📱',
      color: '#ff7300',
      transactions: []
    },
    {
      category: 'other',
      displayName: 'Other',
      amount: 642.29,
      percentage: 15,
      transactionCount: 8,
      icon: '📊',
      color: '#8dd1e1',
      transactions: []
    }
  ],
  transactions: [],
  debtPayments: [],
  subscriptions: []
};