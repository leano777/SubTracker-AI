/**
 * Financial Service
 * Manages financial transaction data and calculations
 */

import type {
  TransactionCategory,
  DebtType,
  SubscriptionCategory,
  Transaction,
  DebtPayment,
  SubscriptionPayment,
  MonthlyFinancialData,
  DebtSummary,
  SubscriptionSummary,
  FinancialSummary
} from '../types/financialTransactions';

import {
  TransactionCategoryEnum,
  DebtTypeEnum,
  SubscriptionCategoryEnum
} from '../types/financialTransactions';

// Define CategoryBreakdown locally to avoid import issues
interface CategoryBreakdown {
  category: TransactionCategory;
  displayName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  icon?: string;
  color?: string;
  transactions: Transaction[];
}

// Define CalendarTransaction locally to avoid import issues
type CalendarTransaction = {
  date: number;
  transactions: Array<{
    name: string;
    amount: number;
    type: 'subscription' | 'debt' | 'utility' | 'transport' | 'other';
    category: TransactionCategory;
  }>;
  totalAmount: number;
};

class FinancialService {
  private static instance: FinancialService;
  private monthlyData: Map<string, MonthlyFinancialData> = new Map();
  private currentMonth: string = '';
  private currentYear: number = new Date().getFullYear();

  private constructor() {
    this.loadSampleData();
    this.loadStoredData();
  }

  static getInstance(): FinancialService {
    if (!FinancialService.instance) {
      FinancialService.instance = new FinancialService();
    }
    return FinancialService.instance;
  }

  // Load sample August 2025 data based on your HTML dashboard
  private loadSampleData(): void {
    const augustData = this.createAugust2025Data();
    const key = this.getMonthKey(8, 2025);
    this.monthlyData.set(key, augustData);
  }

  private createAugust2025Data(): MonthlyFinancialData {
    const transactions: Transaction[] = [];
    const debtPayments: DebtPayment[] = [];
    const subscriptions: SubscriptionPayment[] = [];

    // Transportation
    transactions.push(
      {
        id: 'trans-1',
        date: '2025-08-28',
        name: 'Car Insurance',
        amount: 256.00,
        category: 'transportation' as TransactionCategory,
        recurring: true,
        vendor: 'Insurance Company'
      },
      {
        id: 'trans-2',
        date: '2025-08-30',
        name: 'Car Payment',
        amount: 952.00,
        category: 'transportation' as TransactionCategory,
        recurring: true,
        vendor: 'Auto Lender'
      }
    );

    // Utilities
    transactions.push(
      {
        id: 'util-1',
        date: '2025-08-27',
        name: 'SDGE + Cethron',
        amount: 475.00,
        category: 'utilities' as TransactionCategory,
        recurring: true,
        vendor: 'SDGE'
      },
      {
        id: 'util-2',
        date: '2025-08-28',
        name: 'SDGE + Cethron',
        amount: 475.00,
        category: 'utilities' as TransactionCategory,
        recurring: true,
        vendor: 'SDGE'
      }
    );

    // Debt Payments - Affirm/Klarna
    const affirmPayments = [
      { date: '2025-08-04', amount: 67.00 },
      { date: '2025-08-05', amount: 36.38 },
      { date: '2025-08-08', amount: 127.47 },
      { date: '2025-08-10', amount: 93.70 },
      { date: '2025-08-14', amount: 41.79 },
      { date: '2025-08-18', amount: 30.05 },
      { date: '2025-08-23', amount: 31.76 },
      { date: '2025-08-25', amount: 51.31 },
      { date: '2025-08-30', amount: 57.48 }
    ];

    affirmPayments.forEach((payment, index) => {
      debtPayments.push({
        id: `affirm-${index + 1}`,
        date: payment.date,
        name: 'Affirm Payment',
        amount: payment.amount,
        type: 'affirm' as DebtType,
        creditor: 'Affirm'
      });
    });

    // Credit Card Payments
    const ccPayments = [
      { date: '2025-08-13', amount: 196.99 },
      { date: '2025-08-18', amount: 98.00 },
      { date: '2025-08-19', amount: 58.02 },
      { date: '2025-08-22', amount: 40.00 },
      { date: '2025-08-30', amount: 20.00, name: 'CC Payment - Marco Leano' }
    ];

    ccPayments.forEach((payment, index) => {
      debtPayments.push({
        id: `cc-${index + 1}`,
        date: payment.date,
        name: payment.name || 'Credit Card Payment',
        amount: payment.amount,
        type: 'credit_card' as DebtType,
        creditor: 'Credit Card'
      });
    });

    // Student Loan
    debtPayments.push({
      id: 'student-loan-1',
      date: '2025-08-12',
      name: 'Student Loan Payment',
      amount: 23.78,
      type: 'student_loan' as DebtType,
      creditor: 'Student Loan Servicer'
    });

    // Credit Builder
    debtPayments.push({
      id: 'credit-builder-1',
      date: '2025-08-30',
      name: 'Credit Builder',
      amount: 40.00,
      type: 'credit_builder' as DebtType,
      creditor: 'Credit Builder'
    });

    // Business Subscriptions
    const businessSubs = [
      { date: '2025-08-08', name: 'Notion', service: 'Workspace', amount: 68.00 },
      { date: '2025-08-08', name: 'Warp', service: 'Terminal', amount: 25.23 },
      { date: '2025-08-12', name: 'Warp', service: 'Terminal', amount: 20.04 },
      { date: '2025-08-31', name: 'Supabase', service: 'Database', amount: 44.58 },
      { date: '2025-08-01', name: 'Sequence', service: 'Financial', amount: 9.33 },
      { date: '2025-08-30', name: 'Sequence', service: 'Financial', amount: 16.23 },
      { date: '2025-08-17', name: 'Claude', service: 'AI Assistant', amount: 20.00 },
      { date: '2025-08-22', name: 'Canva', service: 'Design', amount: 12.99 },
      { date: '2025-08-11', name: 'OpenAI', service: 'GPT', amount: 5.00 }
    ];

    businessSubs.forEach((sub, index) => {
      subscriptions.push({
        id: `bus-sub-${index + 1}`,
        date: sub.date,
        name: `${sub.name} (${sub.service})`,
        serviceName: sub.name,
        amount: sub.amount,
        category: 'business_tools' as SubscriptionCategory,
        frequency: 'monthly',
        isActive: true
      });
    });

    // Personal Subscriptions
    const personalSubs = [
      { date: '2025-08-08', name: 'Apple Subscriptions', amount: 31.97 },
      { date: '2025-08-26', name: 'Google One', service: 'Storage', amount: 1.99 },
      { date: '2025-08-29', name: 'Google One', service: 'Storage', amount: 19.99 },
      { date: '2025-08-31', name: 'Spotify', service: 'Music', amount: 11.99 }
    ];

    personalSubs.forEach((sub, index) => {
      subscriptions.push({
        id: `per-sub-${index + 1}`,
        date: sub.date,
        name: sub.service ? `${sub.name} (${sub.service})` : sub.name,
        serviceName: sub.name,
        amount: sub.amount,
        category: 'personal' as SubscriptionCategory,
        frequency: 'monthly',
        isActive: true
      });
    });

    // Other Subscriptions
    subscriptions.push(
      {
        id: 'other-sub-1',
        date: '2025-08-01',
        name: 'General Subscriptions',
        serviceName: 'Various',
        amount: 38.00,
        category: 'other' as SubscriptionCategory,
        frequency: 'monthly',
        isActive: true
      },
      {
        id: 'other-sub-2',
        date: '2025-08-01',
        name: 'AI Subs (Various)',
        serviceName: 'AI Services',
        amount: 20.00,
        category: 'ai_services' as SubscriptionCategory,
        frequency: 'monthly',
        isActive: true
      }
    );

    // Other expenses
    const otherExpenses = [
      { date: '2025-08-16', name: 'Dev Fund', amount: 15.15 },
      { date: '2025-08-21', name: 'Dev Fund', amount: 5.00 },
      { date: '2025-08-28', name: 'Dev Fund', amount: 0.99 },
      { date: '2025-08-28', name: 'Taxes', amount: 50.00 },
      { date: '2025-08-28', name: 'Operating Expenses', amount: 100.00 }
    ];

    otherExpenses.forEach((expense, index) => {
      transactions.push({
        id: `other-${index + 1}`,
        date: expense.date,
        name: expense.name,
        amount: expense.amount,
        category: 'other' as TransactionCategory,
        recurring: false
      });
    });

    // Calculate categories
    const categories = this.calculateCategories([...transactions, 
      ...debtPayments.map(d => ({...d, category: 'debt_payments' as TransactionCategory} as Transaction)),
      ...subscriptions.map(s => ({...s, category: 'subscriptions' as TransactionCategory} as Transaction))
    ]);

    return {
      month: 'August',
      year: 2025,
      totalSpending: 4185.39,
      totalIncome: 0,
      netAmount: -4185.39,
      transportationCosts: 1208.00,
      utilityCosts: 950.00,
      debtTotal: 1013.73,
      subscriptionTotal: 313.37,
      categories,
      transactions,
      debtPayments,
      subscriptions
    };
  }

  private calculateCategories(transactions: Transaction[]): CategoryBreakdown[] {
    const categoryMap = new Map<TransactionCategory, CategoryBreakdown>();
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    const categoryConfig = {
      ['transportation']: { name: 'Transportation', icon: '🚗', color: '#8884d8' },
      ['debt_payments']: { name: 'Debt Payments', icon: '💳', color: '#82ca9d' },
      ['utilities']: { name: 'Utilities', icon: '⚡', color: '#ffc658' },
      ['subscriptions']: { name: 'Subscriptions', icon: '📱', color: '#ff7300' },
      ['other']: { name: 'Other', icon: '📊', color: '#8dd1e1' }
    };

    transactions.forEach(transaction => {
      const category = transaction.category;
      if (!categoryMap.has(category)) {
        const config = categoryConfig[category] || { name: category, icon: '📊', color: '#999999' };
        categoryMap.set(category, {
          category,
          displayName: config.name,
          amount: 0,
          percentage: 0,
          transactionCount: 0,
          icon: config.icon,
          color: config.color,
          transactions: []
        });
      }

      const categoryData = categoryMap.get(category)!;
      categoryData.amount += transaction.amount;
      categoryData.transactionCount++;
      categoryData.transactions.push(transaction);
    });

    // Calculate percentages
    categoryMap.forEach(category => {
      category.percentage = Math.round((category.amount / totalAmount) * 100);
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);
  }

  private loadStoredData(): void {
    try {
      const stored = localStorage.getItem('financial_data');
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, value]) => {
          this.monthlyData.set(key, value as MonthlyFinancialData);
        });
      }
    } catch (error) {
      console.error('Failed to load financial data:', error);
    }
  }

  private saveData(): void {
    try {
      const data: Record<string, MonthlyFinancialData> = {};
      this.monthlyData.forEach((value, key) => {
        data[key] = value;
      });
      localStorage.setItem('financial_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save financial data:', error);
    }
  }

  private getMonthKey(month: number, year: number): string {
    return `${year}-${month.toString().padStart(2, '0')}`;
  }

  // Public methods
  getMonthlyData(month: number, year: number): MonthlyFinancialData | null {
    const key = this.getMonthKey(month, year);
    return this.monthlyData.get(key) || null;
  }

  getCurrentMonthData(): MonthlyFinancialData | null {
    const now = new Date();
    return this.getMonthlyData(now.getMonth() + 1, now.getFullYear());
  }

  getFinancialSummary(month: number, year: number): FinancialSummary {
    const data = this.getMonthlyData(month, year);
    if (!data) {
      return {
        totalExternalSpending: 0,
        transportation: 0,
        debtAndCredit: 0,
        utilities: 0,
        subscriptions: 0,
        other: 0,
        savingsRate: 0,
        monthOverMonthChange: 0
      };
    }

    return {
      totalExternalSpending: data.totalSpending,
      transportation: data.transportationCosts,
      debtAndCredit: data.debtTotal,
      utilities: data.utilityCosts,
      subscriptions: data.subscriptionTotal,
      other: data.totalSpending - data.transportationCosts - data.debtTotal - data.utilityCosts - data.subscriptionTotal,
      savingsRate: 0,
      monthOverMonthChange: 0
    };
  }

  getCalendarData(month: number, year: number): CalendarTransaction[] {
    const data = this.getMonthlyData(month, year);
    if (!data) return [];

    const calendar = new Map<number, CalendarTransaction>();
    
    // Process all transactions
    [...data.transactions, 
     ...data.debtPayments.map(d => ({...d, category: 'debt_payments' as TransactionCategory} as Transaction)),
     ...data.subscriptions.map(s => ({...s, category: 'subscriptions' as TransactionCategory} as Transaction))
    ].forEach(transaction => {
      const date = new Date(transaction.date);
      const day = date.getDate();
      
      if (!calendar.has(day)) {
        calendar.set(day, {
          date: day,
          transactions: [],
          totalAmount: 0
        });
      }
      
      const dayData = calendar.get(day)!;
      dayData.transactions.push({
        name: transaction.name,
        amount: transaction.amount,
        type: this.getTransactionType(transaction.category),
        category: transaction.category
      });
      dayData.totalAmount += transaction.amount;
    });

    return Array.from(calendar.values()).sort((a, b) => a.date - b.date);
  }

  private getTransactionType(category: TransactionCategory): 'subscription' | 'debt' | 'utility' | 'transport' | 'other' {
    switch (category) {
      case 'subscriptions':
        return 'subscription';
      case 'debt_payments':
        return 'debt';
      case 'utilities':
        return 'utility';
      case 'transportation':
        return 'transport';
      default:
        return 'other';
    }
  }

  getDebtSummary(month: number, year: number): DebtSummary[] {
    const data = this.getMonthlyData(month, year);
    if (!data) return [];

    const debtMap = new Map<DebtType, DebtSummary>();
    
    data.debtPayments.forEach(payment => {
      if (!debtMap.has(payment.type)) {
        debtMap.set(payment.type, {
          type: payment.type,
          displayName: this.getDebtDisplayName(payment.type),
          totalAmount: 0,
          paymentCount: 0,
          payments: [],
          averagePayment: 0
        });
      }
      
      const summary = debtMap.get(payment.type)!;
      summary.totalAmount += payment.amount;
      summary.paymentCount++;
      summary.payments.push(payment);
    });

    // Calculate averages
    debtMap.forEach(summary => {
      summary.averagePayment = summary.totalAmount / summary.paymentCount;
    });

    return Array.from(debtMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  }

  private getDebtDisplayName(type: DebtType): string {
    const names: Record<DebtType, string> = {
      ['affirm']: 'Affirm',
      ['klarna']: 'Klarna',
      ['credit_card']: 'Credit Cards',
      ['student_loan']: 'Student Loans',
      ['credit_builder']: 'Credit Builder',
      ['personal_loan']: 'Personal Loan',
      ['auto_loan']: 'Auto Loan',
      ['mortgage']: 'Mortgage',
      ['other']: 'Other Debt'
    };
    return names[type] || type;
  }

  getSubscriptionSummary(month: number, year: number): SubscriptionSummary[] {
    const data = this.getMonthlyData(month, year);
    if (!data) return [];

    const subMap = new Map<SubscriptionCategory, SubscriptionSummary>();
    
    data.subscriptions.forEach(sub => {
      if (!subMap.has(sub.category)) {
        subMap.set(sub.category, {
          category: sub.category,
          displayName: this.getSubscriptionCategoryName(sub.category),
          totalAmount: 0,
          subscriptions: [],
          activeCount: 0,
          monthlyRecurring: 0
        });
      }
      
      const summary = subMap.get(sub.category)!;
      summary.totalAmount += sub.amount;
      summary.subscriptions.push(sub);
      if (sub.isActive) summary.activeCount++;
      if (sub.frequency === 'monthly') summary.monthlyRecurring += sub.amount;
    });

    return Array.from(subMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  }

  private getSubscriptionCategoryName(category: SubscriptionCategory): string {
    const names: Record<SubscriptionCategory, string> = {
      ['business_tools']: 'Business Tools',
      ['personal']: 'Personal',
      ['entertainment']: 'Entertainment',
      ['productivity']: 'Productivity',
      ['cloud_storage']: 'Cloud Storage',
      ['ai_services']: 'AI Services',
      ['development']: 'Development',
      ['other']: 'Other'
    };
    return names[category] || category;
  }

  addTransaction(transaction: Omit<Transaction, 'id'>): void {
    const date = new Date(transaction.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = this.getMonthKey(month, year);
    
    let monthData = this.monthlyData.get(key);
    if (!monthData) {
      monthData = this.createEmptyMonthData(month, year);
      this.monthlyData.set(key, monthData);
    }
    
    const newTransaction: Transaction = {
      ...transaction,
      id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    monthData.transactions.push(newTransaction);
    monthData.totalSpending += newTransaction.amount;
    
    // Recalculate categories
    monthData.categories = this.calculateCategories([
      ...monthData.transactions,
      ...monthData.debtPayments.map(d => ({...d, category: 'debt_payments' as TransactionCategory} as Transaction)),
      ...monthData.subscriptions.map(s => ({...s, category: 'subscriptions' as TransactionCategory} as Transaction))
    ]);
    
    this.saveData();
  }

  private createEmptyMonthData(month: number, year: number): MonthlyFinancialData {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    return {
      month: monthNames[month - 1],
      year,
      totalSpending: 0,
      totalIncome: 0,
      netAmount: 0,
      transportationCosts: 0,
      utilityCosts: 0,
      debtTotal: 0,
      subscriptionTotal: 0,
      categories: [],
      transactions: [],
      debtPayments: [],
      subscriptions: []
    };
  }
}

export const financialService = FinancialService.getInstance();