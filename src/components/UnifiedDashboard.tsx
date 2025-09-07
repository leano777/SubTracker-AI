import React, { useMemo } from 'react';
import { 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  TrendingUp,
  TrendingDown,
  CreditCard,
  Clock,
  X,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { FullSubscription } from '../types/subscription';
import { formatCurrency, calculateMonthlyAmount, roundToNearestCent } from '../utils/helpers';
import { getDaysUntil } from '../utils/dateUtils';

interface UnifiedDashboardProps {
  subscriptions: FullSubscription[];
  monthlyBudget: number;
  onNavigate: (view: string) => void;
  onQuickAction: (action: string, data?: any) => void;
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({
  subscriptions,
  monthlyBudget,
  onNavigate,
  onQuickAction
}) => {
  const { isTacticalMode } = useTheme();

  // Calculate key metrics
  const metrics = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active');
    const cancelled = subscriptions.filter(s => s.status === 'cancelled');
    
    const monthlySpend = roundToNearestCent(active.reduce((sum, sub) => {
      const amount = calculateMonthlyAmount(sub.price, sub.frequency);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0));

    const yearlySpend = roundToNearestCent(monthlySpend * 12);
    const budgetUsed = monthlyBudget > 0 ? Math.round((monthlySpend / monthlyBudget) * 1000) / 10 : 0;
    const budgetRemaining = roundToNearestCent(monthlyBudget - monthlySpend);

    // Find unused subscriptions (mock detection - in real app would track usage)
    const unused = active.filter(sub => {
      // For demo: mark as unused if no description or low priority
      return !sub.description || sub.priority === 'low';
    });

    // Get upcoming payments (next 7 days)
    const upcoming = active
      .filter(sub => {
        if (!sub.nextPayment) return false;
        const days = getDaysUntil(sub.nextPayment);
        return days >= 0 && days <= 7;
      })
      .sort((a, b) => getDaysUntil(a.nextPayment!) - getDaysUntil(b.nextPayment!))
      .slice(0, 5); // Show max 5

    // Get high spending subscriptions
    const highSpenders = active
      .sort((a, b) => {
        const aMonthly = calculateMonthlyAmount(a.price, a.frequency);
        const bMonthly = calculateMonthlyAmount(b.price, b.frequency);
        return bMonthly - aMonthly;
      })
      .slice(0, 3);

    return {
      monthlySpend,
      yearlySpend,
      budgetUsed,
      budgetRemaining,
      activeCount: active.length,
      cancelledCount: cancelled.length,
      unusedCount: unused.length,
      potentialSavings: unused.reduce((sum, sub) => {
        const amount = calculateMonthlyAmount(sub.price, sub.frequency);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0),
      upcoming,
      highSpenders,
      unused
    };
  }, [subscriptions, monthlyBudget]);

  const getBudgetColor = () => {
    if (metrics.budgetUsed > 100) return 'text-error';
    if (metrics.budgetUsed > 80) return 'text-warning';
    return isTacticalMode ? 'text-tactical-primary' : 'text-success';
  };

  const getBudgetStatus = () => {
    if (metrics.budgetUsed > 100) return 'Over Budget';
    if (metrics.budgetUsed > 80) return 'Near Limit';
    return 'On Track';
  };

  return (
    <div className="unified-dashboard space-y-6">
      {/* Header Section - Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly Spending */}
        <div className="bg-secondary border border-primary rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted text-sm font-medium">Monthly Spending</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {formatCurrency(metrics.monthlySpend)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-sm font-medium ${getBudgetColor()}`}>
                  {getBudgetStatus()}
                </span>
                {monthlyBudget > 0 && (
                  <span className="text-xs text-muted">
                    {metrics.budgetUsed.toFixed(0)}% of budget
                  </span>
                )}
              </div>
            </div>
            <DollarSign className={`w-8 h-8 ${isTacticalMode ? 'text-tactical-primary' : 'text-primary'} opacity-20`} />
          </div>
          
          {/* Budget Progress Bar */}
          {monthlyBudget > 0 && (
            <div className="mt-4">
              <div className="w-full bg-surface rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    metrics.budgetUsed > 100 ? 'bg-error' :
                    metrics.budgetUsed > 80 ? 'bg-warning' :
                    isTacticalMode ? 'bg-tactical-primary' : 'bg-success'
                  }`}
                  style={{ width: `${Math.min(metrics.budgetUsed, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Active Subscriptions */}
        <div className="bg-secondary border border-primary rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted text-sm font-medium">Active Subscriptions</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {metrics.activeCount}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-secondary">
                  {metrics.cancelledCount} cancelled
                </span>
              </div>
            </div>
            <CreditCard className="w-8 h-8 text-primary opacity-20" />
          </div>
          
          <button
            onClick={() => onNavigate('subscriptions')}
            className="mt-4 text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1"
          >
            Manage all
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Quick Actions / Savings */}
        <div className="bg-secondary border border-primary rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted text-sm font-medium">Potential Savings</p>
              <p className="text-3xl font-bold text-primary mt-1">
                {formatCurrency(metrics.potentialSavings)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-warning">
                  {metrics.unusedCount} unused subscriptions
                </span>
              </div>
            </div>
            <AlertCircle className="w-8 h-8 text-warning opacity-20" />
          </div>
          
          {metrics.unusedCount > 0 && (
            <button
              onClick={() => onQuickAction('review-unused')}
              className="mt-4 w-full bg-warning text-white px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Review Unused
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Payments */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-secondary border border-primary rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-primary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Upcoming Payments
              </h3>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs text-muted hover:text-primary"
              >
                View all
              </button>
            </div>
            
            {metrics.upcoming.length > 0 ? (
              <div className="space-y-2">
                {metrics.upcoming.map(sub => (
                  <div 
                    key={sub.id}
                    className="flex items-center justify-between p-2 bg-surface rounded-lg cursor-pointer hover:bg-hover transition-colors"
                    onClick={() => onQuickAction('view-subscription', sub)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                      <div>
                        <p className="text-sm font-medium text-primary">{sub.name}</p>
                        <p className="text-xs text-muted">
                          {getDaysUntil(sub.nextPayment!)} days
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-secondary">
                      {formatCurrency(sub.price)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-4">
                No payments in the next 7 days
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-secondary border border-primary rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => onQuickAction('add-subscription')}
                className="w-full text-left p-3 bg-surface hover:bg-hover rounded-lg transition-colors flex items-center justify-between group"
              >
                <span className="text-sm text-secondary">Add New Subscription</span>
                <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary" />
              </button>
              
              <button
                onClick={() => onNavigate('financials')}
                className="w-full text-left p-3 bg-surface hover:bg-hover rounded-lg transition-colors flex items-center justify-between group"
              >
                <span className="text-sm text-secondary">View Financial Report</span>
                <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary" />
              </button>
              
              <button
                onClick={() => onQuickAction('export-data')}
                className="w-full text-left p-3 bg-surface hover:bg-hover rounded-lg transition-colors flex items-center justify-between group"
              >
                <span className="text-sm text-secondary">Export Data</span>
                <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary" />
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column - High Spenders & Insights */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-secondary border border-primary rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Highest Spending
            </h3>
            
            <div className="space-y-3">
              {metrics.highSpenders.map((sub, index) => {
                const monthly = calculateMonthlyAmount(sub.price, sub.frequency);
                const percentage = metrics.monthlySpend > 0 
                  ? (monthly / metrics.monthlySpend) * 100 
                  : 0;
                
                return (
                  <div key={sub.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted">#{index + 1}</span>
                        <span className="text-sm font-medium text-primary">{sub.name}</span>
                      </div>
                      <span className="text-sm font-bold text-secondary">
                        {formatCurrency(monthly)}
                      </span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          isTacticalMode ? 'bg-tactical-primary' : 'bg-primary'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted">
                      {percentage.toFixed(0)}% of monthly spending
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Focus */}
          <div className="bg-secondary border border-primary rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-3">Today's Focus</h3>
            
            {metrics.unusedCount > 0 ? (
              <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-sm text-primary font-medium mb-2">
                  Review unused subscriptions
                </p>
                <p className="text-xs text-secondary mb-3">
                  You have {metrics.unusedCount} subscriptions that haven't been used recently.
                  You could save {formatCurrency(metrics.potentialSavings)}/month.
                </p>
                <button
                  onClick={() => onQuickAction('review-unused')}
                  className="text-xs font-medium text-warning hover:text-warning-hover"
                >
                  Review now →
                </button>
              </div>
            ) : metrics.budgetUsed > 80 ? (
              <div className="p-3 bg-error/10 border border-error/30 rounded-lg">
                <p className="text-sm text-primary font-medium mb-2">
                  Budget Alert
                </p>
                <p className="text-xs text-secondary mb-3">
                  You've used {metrics.budgetUsed.toFixed(0)}% of your monthly budget.
                  Consider reviewing your highest spending subscriptions.
                </p>
                <button
                  onClick={() => onNavigate('financials')}
                  className="text-xs font-medium text-error hover:text-error-hover"
                >
                  View breakdown →
                </button>
              </div>
            ) : (
              <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <p className="text-sm text-primary font-medium">
                    You're on track!
                  </p>
                </div>
                <p className="text-xs text-secondary">
                  Your spending is within budget and all subscriptions are being used.
                  Keep up the good work!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Unused Subscriptions */}
        <div className="lg:col-span-1">
          <div className="bg-secondary border border-primary rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-warning" />
              Unused Subscriptions
            </h3>
            
            {metrics.unused.length > 0 ? (
              <div className="space-y-2">
                {metrics.unused.slice(0, 5).map(sub => {
                  const monthly = calculateMonthlyAmount(sub.price, sub.frequency);
                  
                  return (
                    <div 
                      key={sub.id}
                      className="p-3 bg-surface rounded-lg border border-warning/20"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-primary">{sub.name}</p>
                          <p className="text-xs text-muted">Not used recently</p>
                        </div>
                        <span className="text-sm font-bold text-warning">
                          {formatCurrency(monthly)}/mo
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => onQuickAction('cancel-subscription', sub)}
                          className="flex-1 text-xs px-2 py-1 bg-error text-white rounded hover:opacity-90"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => onQuickAction('keep-subscription', sub)}
                          className="flex-1 text-xs px-2 py-1 bg-surface text-secondary border border-primary rounded hover:bg-hover"
                        >
                          Keep
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {metrics.unused.length > 5 && (
                  <button
                    onClick={() => onQuickAction('review-all-unused')}
                    className="w-full text-center text-xs text-muted hover:text-primary py-2"
                  >
                    View {metrics.unused.length - 5} more...
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-3 opacity-20" />
                <p className="text-sm text-muted">
                  All subscriptions are being used
                </p>
                <p className="text-xs text-muted mt-1">
                  Great job managing your subscriptions!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="bg-surface border border-primary rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-muted">Yearly Projection</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(metrics.yearlySpend)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Budget Remaining</p>
            <p className={`text-lg font-bold ${metrics.budgetRemaining >= 0 ? 'text-success' : 'text-error'}`}>
              {formatCurrency(Math.abs(metrics.budgetRemaining))}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Average per Sub</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(metrics.activeCount > 0 ? metrics.monthlySpend / metrics.activeCount : 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Total Saved</p>
            <p className="text-lg font-bold text-success">
              {formatCurrency(metrics.cancelledCount * 15)} {/* Mock calculation */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};