/**
 * Expense Breakdown Component
 * Displays categorized expenses with visual indicators
 */

import React from 'react';
import type { 
  TransactionCategory
} from '../../types/financialTransactions';

// Define types locally to avoid import issues
interface Transaction {
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

interface DebtPayment {
  id: string;
  date: string;
  name: string;
  amount: number;
  type: string;
  creditor: string;
  remainingBalance?: number;
  interestRate?: number;
  minimumPayment?: number;
  dueDate?: string;
}

interface SubscriptionPayment {
  id: string;
  date: string;
  name: string;
  serviceName: string;
  amount: number;
  category: string;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
  isActive: boolean;
  nextPaymentDate?: string;
}

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

interface MonthlyFinancialData {
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

interface ExpenseBreakdownProps {
  data: MonthlyFinancialData;
  onCategoryClick: (category: string, amount: number, transactions: any[]) => void;
}

export const ExpenseBreakdown: React.FC<ExpenseBreakdownProps> = ({ data, onCategoryClick }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getPercentageWidth = (percentage: number): string => {
    return `${Math.min(percentage, 100)}%`;
  };

  return (
    <div className="expense-breakdown">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.categories.map((category) => (
          <div
            key={category.category}
            onClick={() => onCategoryClick(category.displayName, category.amount, category.transactions)}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:border-white hover:bg-gray-800 group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors">
                {category.displayName}
              </h3>
              <span className="text-2xl">{category.icon}</span>
            </div>

            <div className="space-y-3">
              <div className="text-2xl font-light text-white">
                {formatCurrency(category.amount)}
              </div>

              <div className="relative">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ 
                      width: getPercentageWidth(category.percentage),
                      background: `linear-gradient(90deg, ${category.color}, ${category.color}dd)`
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {category.percentage}% of expenses
                </span>
                <span className="text-gray-500">
                  {category.transactionCount} transactions
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 p-6 bg-gray-900 border border-gray-700 rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-400 mb-1">Total Spending</div>
            <div className="text-xl font-light text-white">
              {formatCurrency(data.totalSpending)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Categories</div>
            <div className="text-xl font-light text-white">
              {data.categories.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Transactions</div>
            <div className="text-xl font-light text-white">
              {data.transactions.length + data.debtPayments.length + data.subscriptions.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Daily Average</div>
            <div className="text-xl font-light text-white">
              {formatCurrency(data.totalSpending / 31)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};