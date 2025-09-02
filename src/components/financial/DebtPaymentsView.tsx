/**
 * Debt Payments View Component
 * Displays debt and credit payments summary
 */

import React, { useState, useEffect } from 'react';
import { financialService } from '../../services/financialService';
import { DebtSummary, DebtPayment } from '../../types/financialTransactions';
import { CreditCard, TrendingDown, AlertCircle, DollarSign } from 'lucide-react';

interface DebtPaymentsViewProps {
  month: number;
  year: number;
  onDebtClick: (debtType: string, payments: DebtPayment[]) => void;
}

export const DebtPaymentsView: React.FC<DebtPaymentsViewProps> = ({ 
  month, 
  year, 
  onDebtClick 
}) => {
  const [debtData, setDebtData] = useState<DebtSummary[]>([]);

  useEffect(() => {
    const data = financialService.getDebtSummary(month, year);
    setDebtData(data);
  }, [month, year]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getDebtIcon = (type: string): React.ReactNode => {
    const iconMap: Record<string, React.ReactNode> = {
      'Affirm': <CreditCard className="w-6 h-6" />,
      'Klarna': <CreditCard className="w-6 h-6" />,
      'Credit Cards': <CreditCard className="w-6 h-6" />,
      'Student Loans': <AlertCircle className="w-6 h-6" />,
      'Credit Builder': <TrendingDown className="w-6 h-6" />,
      'Personal Loan': <DollarSign className="w-6 h-6" />,
      'Auto Loan': <CreditCard className="w-6 h-6" />,
    };
    return iconMap[type] || <DollarSign className="w-6 h-6" />;
  };

  const getDebtColor = (type: string): string => {
    const colors: Record<string, string> = {
      'Affirm': 'from-purple-500 to-purple-600',
      'Klarna': 'from-pink-500 to-pink-600',
      'Credit Cards': 'from-red-500 to-red-600',
      'Student Loans': 'from-blue-500 to-blue-600',
      'Credit Builder': 'from-green-500 to-green-600',
      'Personal Loan': 'from-yellow-500 to-yellow-600',
      'Auto Loan': 'from-indigo-500 to-indigo-600',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const totalDebt = debtData.reduce((sum, debt) => sum + debt.totalAmount, 0);
  const totalPayments = debtData.reduce((sum, debt) => sum + debt.paymentCount, 0);

  return (
    <div className="debt-payments-view">
      {/* Summary Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-red-900/20 to-gray-900 border border-red-800/30 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light text-white mb-2 flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-red-400" />
              Debt & Credit Payments
            </h2>
            <p className="text-gray-400">
              Track all your debt payments and credit obligations
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-light text-red-400">
              {formatCurrency(totalDebt)}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {totalPayments} payments this month
            </div>
          </div>
        </div>
      </div>

      {/* Debt Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {debtData.map((debt) => (
          <div
            key={debt.type}
            onClick={() => onDebtClick(debt.displayName, debt.payments)}
            className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden cursor-pointer hover:transform hover:-translate-y-1 transition-all duration-300 hover:border-white group"
          >
            {/* Gradient Header */}
            <div className={`h-2 bg-gradient-to-r ${getDebtColor(debt.displayName)}`} />
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${getDebtColor(debt.displayName)} bg-opacity-20`}>
                    {getDebtIcon(debt.displayName)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors">
                      {debt.displayName}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {debt.paymentCount} payment{debt.paymentCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Paid</span>
                  <span className="text-xl font-light text-white">
                    {formatCurrency(debt.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Average Payment</span>
                  <span className="text-lg text-gray-300">
                    {formatCurrency(debt.averagePayment)}
                  </span>
                </div>
              </div>

              {/* Payment Progress Bar */}
              <div className="mt-4">
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getDebtColor(debt.displayName)} transition-all duration-500`}
                    style={{ width: `${Math.min((debt.paymentCount / 30) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Payments List */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">Recent Payments</h3>
        <div className="space-y-2">
          {debtData.flatMap(debt => 
            debt.payments.slice(0, 5).map(payment => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-400">
                    {new Date(payment.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div>
                    <div className="text-white">{payment.name}</div>
                    <div className="text-xs text-gray-500">{payment.creditor}</div>
                  </div>
                </div>
                <div className="text-white font-medium">
                  {formatCurrency(payment.amount)}
                </div>
              </div>
            ))
          ).slice(0, 10)}
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div className="text-sm text-gray-400 mb-2">Affirm/Klarna</div>
          <div className="text-2xl font-light text-purple-400">
            {formatCurrency(debtData.find(d => d.displayName === 'Affirm')?.totalAmount || 0)}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div className="text-sm text-gray-400 mb-2">Credit Cards</div>
          <div className="text-2xl font-light text-red-400">
            {formatCurrency(debtData.find(d => d.displayName === 'Credit Cards')?.totalAmount || 0)}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div className="text-sm text-gray-400 mb-2">Student Loans</div>
          <div className="text-2xl font-light text-blue-400">
            {formatCurrency(debtData.find(d => d.displayName === 'Student Loans')?.totalAmount || 0)}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div className="text-sm text-gray-400 mb-2">Other Debt</div>
          <div className="text-2xl font-light text-gray-400">
            {formatCurrency(
              debtData
                .filter(d => !['Affirm', 'Credit Cards', 'Student Loans'].includes(d.displayName))
                .reduce((sum, d) => sum + d.totalAmount, 0)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};