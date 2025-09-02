/**
 * Financial Types - Working Export File
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
  date: string;
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

export type CalendarTransaction = {
  date: number;
  transactions: Array<{
    name: string;
    amount: number;
    type: 'subscription' | 'debt' | 'utility' | 'transport' | 'other';
    category: TransactionCategory;
  }>;
  totalAmount: number;
};