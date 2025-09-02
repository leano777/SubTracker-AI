/**
 * Financial Transaction Types
 * Comprehensive types for monthly financial data tracking
 */

export enum TransactionCategory {
  TRANSPORTATION = 'transportation',
  DEBT_PAYMENTS = 'debt_payments',
  UTILITIES = 'utilities',
  SUBSCRIPTIONS = 'subscriptions',
  RENT = 'rent',
  GROCERIES = 'groceries',
  DINING = 'dining',
  SHOPPING = 'shopping',
  ENTERTAINMENT = 'entertainment',
  HEALTHCARE = 'healthcare',
  INSURANCE = 'insurance',
  SAVINGS = 'savings',
  INVESTMENTS = 'investments',
  TAXES = 'taxes',
  OTHER = 'other'
}

export enum DebtType {
  AFFIRM = 'affirm',
  KLARNA = 'klarna',
  CREDIT_CARD = 'credit_card',
  STUDENT_LOAN = 'student_loan',
  CREDIT_BUILDER = 'credit_builder',
  PERSONAL_LOAN = 'personal_loan',
  AUTO_LOAN = 'auto_loan',
  MORTGAGE = 'mortgage',
  OTHER = 'other'
}

export enum SubscriptionCategory {
  BUSINESS_TOOLS = 'business_tools',
  PERSONAL = 'personal',
  ENTERTAINMENT = 'entertainment',
  PRODUCTIVITY = 'productivity',
  CLOUD_STORAGE = 'cloud_storage',
  AI_SERVICES = 'ai_services',
  DEVELOPMENT = 'development',
  OTHER = 'other'
}

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

export interface CalendarTransaction {
  date: number; // Day of month
  transactions: Array<{
    name: string;
    amount: number;
    type: 'subscription' | 'debt' | 'utility' | 'transport' | 'other';
    category: TransactionCategory;
  }>;
  totalAmount: number;
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
      category: TransactionCategory.TRANSPORTATION,
      displayName: 'Transportation',
      amount: 1208.00,
      percentage: 29,
      transactionCount: 2,
      icon: '🚗',
      color: '#8884d8',
      transactions: []
    },
    {
      category: TransactionCategory.DEBT_PAYMENTS,
      displayName: 'Debt Payments',
      amount: 1013.73,
      percentage: 25,
      transactionCount: 16,
      icon: '💳',
      color: '#82ca9d',
      transactions: []
    },
    {
      category: TransactionCategory.UTILITIES,
      displayName: 'Utilities',
      amount: 950.00,
      percentage: 23,
      transactionCount: 2,
      icon: '⚡',
      color: '#ffc658',
      transactions: []
    },
    {
      category: TransactionCategory.SUBSCRIPTIONS,
      displayName: 'Subscriptions',
      amount: 313.37,
      percentage: 8,
      transactionCount: 16,
      icon: '📱',
      color: '#ff7300',
      transactions: []
    },
    {
      category: TransactionCategory.OTHER,
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