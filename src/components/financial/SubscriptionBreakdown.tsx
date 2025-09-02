/**
 * Subscription Breakdown Component
 * Displays subscriptions organized by category
 */

import React, { useState, useEffect } from 'react';
import { financialService } from '../../services/financialService';
import { SubscriptionCategory } from '../../types/financialTransactions';

// Define types locally to avoid import issues
interface SubscriptionPayment {
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

interface SubscriptionSummary {
  category: SubscriptionCategory;
  displayName: string;
  totalAmount: number;
  subscriptions: SubscriptionPayment[];
  activeCount: number;
  monthlyRecurring: number;
}

interface SubscriptionBreakdownProps {
  month: number;
  year: number;
  onSubscriptionClick: (subscription: SubscriptionPayment) => void;
}

export const SubscriptionBreakdown: React.FC<SubscriptionBreakdownProps> = ({ 
  month, 
  year, 
  onSubscriptionClick 
}) => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionSummary[]>([]);

  useEffect(() => {
    const data = financialService.getSubscriptionSummary(month, year);
    setSubscriptionData(data);
  }, [month, year]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Business Tools': 'from-blue-500 to-blue-600',
      'Personal': 'from-purple-500 to-purple-600',
      'Entertainment': 'from-pink-500 to-pink-600',
      'AI Services': 'from-green-500 to-green-600',
      'Cloud Storage': 'from-yellow-500 to-yellow-600',
      'Development': 'from-indigo-500 to-indigo-600',
      'Other': 'from-gray-500 to-gray-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'Business Tools': '💼',
      'Personal': '👤',
      'Entertainment': '🎬',
      'AI Services': '🤖',
      'Cloud Storage': '☁️',
      'Development': '💻',
      'Other': '📦'
    };
    return icons[category] || '📦';
  };

  const totalAmount = subscriptionData.reduce((sum, cat) => sum + cat.totalAmount, 0);

  return (
    <div className="subscription-breakdown">
      {/* Summary Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light text-white mb-2">
              Monthly Subscriptions
            </h2>
            <p className="text-gray-400">
              Track all your recurring subscription payments
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-light text-white">
              {formatCurrency(totalAmount)}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Total monthly spend
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Categories */}
      <div className="space-y-6">
        {subscriptionData.map((category) => (
          <div
            key={category.category}
            className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden"
          >
            {/* Category Header */}
            <div className={`p-6 bg-gradient-to-r ${getCategoryColor(category.displayName)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getCategoryIcon(category.displayName)}</span>
                  <div>
                    <h3 className="text-xl font-medium text-white">
                      {category.displayName}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {category.activeCount} active subscription{category.activeCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-light text-white">
                    {formatCurrency(category.totalAmount)}
                  </div>
                  <div className="text-sm text-white/80">
                    {((category.totalAmount / totalAmount) * 100).toFixed(0)}% of total
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription List */}
            <div className="p-6">
              <div className="space-y-3">
                {category.subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    onClick={() => onSubscriptionClick(subscription)}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                            {subscription.serviceName}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {subscription.date.split('-')[2]} • {subscription.frequency}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg text-white">
                        {formatCurrency(subscription.amount)}
                      </div>
                      {subscription.isActive && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div className="text-sm text-gray-400 mb-2">Total Subscriptions</div>
          <div className="text-2xl font-light text-white">
            {subscriptionData.reduce((sum, cat) => sum + cat.subscriptions.length, 0)}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div className="text-sm text-gray-400 mb-2">Active Services</div>
          <div className="text-2xl font-light text-white">
            {subscriptionData.reduce((sum, cat) => sum + cat.activeCount, 0)}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <div className="text-sm text-gray-400 mb-2">Categories</div>
          <div className="text-2xl font-light text-white">
            {subscriptionData.length}
          </div>
        </div>
      </div>
    </div>
  );
};