/**
 * Transaction Modal Component
 * Displays detailed transaction information
 */

import React from 'react';
import { X } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  data 
}) => {
  if (!isOpen || !data) return null;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const renderContent = () => {
    // Category breakdown modal
    if (data.category && data.transactions) {
      return (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-light text-white">{data.category}</h2>
              <p className="text-gray-400 mt-1">Category Details</p>
            </div>
            <div className="text-2xl font-light text-white">
              {formatCurrency(data.amount)}
            </div>
          </div>

          <div className="space-y-3 max-h-60 md:max-h-96 overflow-y-auto">
            {data.transactions.map((transaction: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div>
                  <div className="text-white font-medium">{transaction.name}</div>
                  <div className="text-sm text-gray-400">{transaction.date}</div>
                </div>
                <div className="text-white">
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }

    // Calendar date modal
    if (data.date && data.transactions) {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const currentMonth = new Date().getMonth();
      
      return (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-light text-white">
              {monthNames[currentMonth]} {data.date}
            </h2>
            <p className="text-gray-400 mt-1">
              {data.transactions.length} transaction{data.transactions.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-3 max-h-60 md:max-h-96 overflow-y-auto">
            {data.transactions.map((transaction: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getTypeColor(transaction.type)}`} />
                  <div>
                    <div className="text-white font-medium">{transaction.name}</div>
                    <div className="text-sm text-gray-400 capitalize">
                      {transaction.type.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <div className="text-white">
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">Total</span>
              <span className="text-white font-medium">
                {formatCurrency(data.transactions.reduce((sum: number, t: any) => sum + t.amount, 0))}
              </span>
            </div>
          </div>
        </>
      );
    }

    // Subscription detail modal
    if (data.subscription) {
      const sub = data.subscription;
      return (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-light text-white">{sub.serviceName}</h2>
            <p className="text-gray-400 mt-1">Subscription Details</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Amount</div>
                  <div className="text-white font-medium">
                    {formatCurrency(sub.amount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Frequency</div>
                  <div className="text-white capitalize">{sub.frequency}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Category</div>
                  <div className="text-white">{sub.category.replace('_', ' ')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  <div className="text-white">
                    {sub.isActive ? (
                      <span className="text-green-400">Active</span>
                    ) : (
                      <span className="text-gray-400">Inactive</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Payment Date</div>
              <div className="text-white">{sub.date}</div>
            </div>

            {sub.nextPaymentDate && (
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Next Payment</div>
                <div className="text-white">{sub.nextPaymentDate}</div>
              </div>
            )}
          </div>
        </>
      );
    }

    // Debt payments modal
    if (data.debtType && data.payments) {
      return (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-light text-white">{data.debtType} Payments</h2>
              <p className="text-gray-400 mt-1">
                {data.payments.length} payment{data.payments.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-2xl font-light text-white">
              {formatCurrency(data.payments.reduce((sum: number, p: any) => sum + p.amount, 0))}
            </div>
          </div>

          <div className="space-y-3 max-h-60 md:max-h-96 overflow-y-auto">
            {data.payments.map((payment: any) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div>
                  <div className="text-white font-medium">{payment.name}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(payment.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <div className="text-white">
                  {formatCurrency(payment.amount)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Total Paid</div>
                <div className="text-white font-medium">
                  {formatCurrency(data.payments.reduce((sum: number, p: any) => sum + p.amount, 0))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Average Payment</div>
                <div className="text-white font-medium">
                  {formatCurrency(
                    data.payments.reduce((sum: number, p: any) => sum + p.amount, 0) / data.payments.length
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'subscription':
        return 'bg-blue-500';
      case 'debt':
        return 'bg-red-500';
      case 'utility':
        return 'bg-yellow-500';
      case 'transport':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal - Mobile Optimized */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4">
        <div 
          className="bg-gray-900 border border-gray-700 rounded-xl md:rounded-2xl p-4 md:p-6 max-w-2xl w-full max-h-[90vh] md:max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button - Mobile Optimized */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 md:top-4 md:right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors touch-manipulation"
          >
            <X className="w-6 h-6 md:w-5 md:h-5 text-gray-400 hover:text-white" />
          </button>

          {/* Content */}
          {renderContent()}
        </div>
      </div>
    </>
  );
};