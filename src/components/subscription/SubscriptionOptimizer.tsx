/**
 * Subscription Optimizer Component
 * Analyzes subscriptions and provides optimization recommendations
 */

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  TrendingDown, 
  Lightbulb, 
  DollarSign, 
  Calendar, 
  Target,
  Award,
  RefreshCw,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';
import { financialService } from '../../services/financialService';

interface SubscriptionOptimization {
  id: string;
  type: 'duplicate' | 'unused' | 'expensive' | 'trial_ending' | 'annual_savings';
  title: string;
  description: string;
  subscriptions: any[];
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
  action: string;
}

interface SubscriptionOptimizerProps {
  month: number;
  year: number;
}

export const SubscriptionOptimizer: React.FC<SubscriptionOptimizerProps> = ({ month, year }) => {
  const [optimizations, setOptimizations] = useState<SubscriptionOptimization[]>([]);
  const [totalPotentialSavings, setTotalPotentialSavings] = useState(0);
  const [activeOptimizations, setActiveOptimizations] = useState<string[]>([]);

  useEffect(() => {
    analyzeSubscriptions();
  }, [month, year]);

  const analyzeSubscriptions = () => {
    const subscriptionData = financialService.getSubscriptionSummary(month, year);
    const allSubscriptions = subscriptionData.flatMap(cat => cat.subscriptions);
    const optimizationList: SubscriptionOptimization[] = [];

    // Find duplicate services
    const serviceCounts: Record<string, any[]> = {};
    allSubscriptions.forEach(sub => {
      const category = sub.category;
      if (!serviceCounts[category]) serviceCounts[category] = [];
      serviceCounts[category].push(sub);
    });

    Object.entries(serviceCounts).forEach(([category, subs]) => {
      if (subs.length > 1) {
        const totalCost = subs.reduce((sum, sub) => sum + sub.amount, 0);
        const cheapest = subs.reduce((min, sub) => sub.amount < min.amount ? sub : min);
        const savings = totalCost - cheapest.amount;

        optimizationList.push({
          id: `duplicate-${category}`,
          type: 'duplicate',
          title: `Multiple ${category.replace('_', ' ')} Services`,
          description: `You have ${subs.length} services in the same category. Consider keeping only the best one.`,
          subscriptions: subs,
          potentialSavings: savings,
          priority: savings > 20 ? 'high' : 'medium',
          action: 'Cancel redundant subscriptions'
        });
      }
    });

    // Find inactive subscriptions
    const inactiveSubscriptions = allSubscriptions.filter(sub => !sub.isActive);
    if (inactiveSubscriptions.length > 0) {
      const savings = inactiveSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
      optimizationList.push({
        id: 'inactive-subs',
        type: 'unused',
        title: 'Inactive Subscriptions',
        description: `${inactiveSubscriptions.length} subscriptions appear to be inactive or rarely used.`,
        subscriptions: inactiveSubscriptions,
        potentialSavings: savings,
        priority: 'high',
        action: 'Cancel unused subscriptions'
      });
    }

    // Find expensive subscriptions
    const expensiveThreshold = 50;
    const expensiveSubscriptions = allSubscriptions.filter(sub => sub.amount > expensiveThreshold);
    if (expensiveSubscriptions.length > 0) {
      const avgAlternativeCost = expensiveSubscriptions.reduce((sum, sub) => sum + sub.amount * 0.7, 0);
      const currentCost = expensiveSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
      const savings = currentCost - avgAlternativeCost;

      optimizationList.push({
        id: 'expensive-subs',
        type: 'expensive',
        title: 'High-Cost Subscriptions',
        description: `${expensiveSubscriptions.length} subscriptions are above $${expensiveThreshold}/month. Look for alternatives.`,
        subscriptions: expensiveSubscriptions,
        potentialSavings: savings,
        priority: 'medium',
        action: 'Research alternatives'
      });
    }

    // Annual payment savings opportunity
    const monthlyOnlySubscriptions = allSubscriptions.filter(sub => sub.frequency === 'monthly');
    if (monthlyOnlySubscriptions.length > 0) {
      const annualSavings = monthlyOnlySubscriptions.reduce((sum, sub) => sum + (sub.amount * 12 * 0.15), 0); // 15% typical annual discount
      
      optimizationList.push({
        id: 'annual-opportunity',
        type: 'annual_savings',
        title: 'Annual Payment Savings',
        description: `Switch ${monthlyOnlySubscriptions.length} monthly subscriptions to annual billing for discounts.`,
        subscriptions: monthlyOnlySubscriptions,
        potentialSavings: annualSavings,
        priority: 'low',
        action: 'Switch to annual billing'
      });
    }

    // Simulated trial endings
    const trialEndingSoon = allSubscriptions.slice(0, 2).map(sub => ({
      ...sub,
      trialEndDate: new Date(Date.now() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000) // 1-7 days
    }));

    if (trialEndingSoon.length > 0) {
      optimizationList.push({
        id: 'trial-ending',
        type: 'trial_ending',
        title: 'Trials Ending Soon',
        description: `${trialEndingSoon.length} free trials are ending soon. Decide if you want to continue.`,
        subscriptions: trialEndingSoon,
        potentialSavings: trialEndingSoon.reduce((sum, sub) => sum + sub.amount, 0),
        priority: 'high',
        action: 'Review before auto-renewal'
      });
    }

    setOptimizations(optimizationList);
    setTotalPotentialSavings(optimizationList.reduce((sum, opt) => sum + opt.potentialSavings, 0));
  };

  const getOptimizationIcon = (type: string) => {
    switch (type) {
      case 'duplicate':
        return <RefreshCw className="w-5 h-5 text-orange-400" />;
      case 'unused':
        return <Trash2 className="w-5 h-5 text-red-400" />;
      case 'expensive':
        return <TrendingDown className="w-5 h-5 text-yellow-400" />;
      case 'trial_ending':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'annual_savings':
        return <Award className="w-5 h-5 text-green-400" />;
      default:
        return <Lightbulb className="w-5 h-5 text-blue-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-900/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-900/20';
      default:
        return 'border-blue-500 bg-blue-900/20';
    }
  };

  const handleOptimizationAction = (optimizationId: string) => {
    setActiveOptimizations(prev => 
      prev.includes(optimizationId) 
        ? prev.filter(id => id !== optimizationId)
        : [...prev, optimizationId]
    );
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="subscription-optimizer">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-light text-white mb-2 flex items-center gap-3">
          <Target className="w-8 h-8 text-green-400" />
          Subscription Optimizer
        </h2>
        <p className="text-gray-400">
          AI-powered recommendations to optimize your subscription spending
        </p>
      </div>

      {/* Savings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-gradient-to-r from-green-900/20 to-gray-900 border border-green-700/30 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-green-400" />
            <span className="text-gray-400 text-sm">Potential Monthly Savings</span>
          </div>
          <div className="text-3xl font-light text-green-400">
            {formatCurrency(totalPotentialSavings)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formatCurrency(totalPotentialSavings * 12)}/year if implemented
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <span className="text-gray-400 text-sm">Optimization Opportunities</span>
          </div>
          <div className="text-3xl font-light text-white">
            {optimizations.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {optimizations.filter(opt => opt.priority === 'high').length} high priority
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-blue-400" />
            <span className="text-gray-400 text-sm">Actions Taken</span>
          </div>
          <div className="text-3xl font-light text-white">
            {activeOptimizations.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formatCurrency(
              optimizations
                .filter(opt => activeOptimizations.includes(opt.id))
                .reduce((sum, opt) => sum + opt.potentialSavings, 0)
            )} saved
          </div>
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="space-y-6">
        <h3 className="text-xl font-medium text-white mb-4">Recommendations</h3>
        
        {optimizations.length === 0 ? (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center">
            <Award className="w-12 h-12 mx-auto text-green-400 mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">Great Job!</h4>
            <p className="text-gray-400">
              Your subscriptions are well optimized. We couldn't find any significant optimization opportunities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {optimizations.map((optimization) => (
              <div
                key={optimization.id}
                className={`border rounded-xl p-6 transition-all duration-200 ${getPriorityColor(optimization.priority)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getOptimizationIcon(optimization.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-medium text-white">{optimization.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          optimization.priority === 'high' ? 'bg-red-900/30 text-red-400' :
                          optimization.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-blue-900/30 text-blue-400'
                        }`}>
                          {optimization.priority} priority
                        </span>
                      </div>
                      <div className="text-lg font-medium text-green-400">
                        Save {formatCurrency(optimization.potentialSavings)}/mo
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4">{optimization.description}</p>

                    {/* Affected Subscriptions */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-400 mb-2">Affected Subscriptions:</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {optimization.subscriptions.slice(0, 4).map((sub, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                            <span className="text-white text-sm">{sub.serviceName}</span>
                            <span className="text-gray-400 text-sm">{formatCurrency(sub.amount)}</span>
                          </div>
                        ))}
                        {optimization.subscriptions.length > 4 && (
                          <div className="text-sm text-gray-500 p-3">
                            +{optimization.subscriptions.length - 4} more...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleOptimizationAction(optimization.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          activeOptimizations.includes(optimization.id)
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {activeOptimizations.includes(optimization.id) ? (
                          <>
                            <Award className="w-4 h-4" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Target className="w-4 h-4" />
                            {optimization.action}
                          </>
                        )}
                      </button>
                      
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pro Tips */}
      <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-gray-900 border border-blue-700/30 rounded-xl p-6">
        <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-400" />
          Pro Tips for Subscription Management
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            • Set calendar reminders before free trials end
          </div>
          <div>
            • Use annual billing for 10-20% discounts
          </div>
          <div>
            • Review subscriptions quarterly
          </div>
          <div>
            • Share family plans to split costs
          </div>
          <div>
            • Cancel before renewal, resubscribe if needed
          </div>
          <div>
            • Look for student discounts if applicable
          </div>
        </div>
      </div>
    </div>
  );
};