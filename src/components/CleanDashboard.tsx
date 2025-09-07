import React, { useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { FullSubscription } from '../types/subscription';
import { formatCurrency, calculateMonthlyAmount, roundToNearestCent } from '../utils/helpers';
import { getDaysUntil } from '../utils/dateUtils';

interface CleanDashboardProps {
  subscriptions: FullSubscription[];
  monthlyBudget: number;
  onNavigate: (view: string) => void;
}

export const CleanDashboard: React.FC<CleanDashboardProps> = ({
  subscriptions,
  monthlyBudget,
  onNavigate
}) => {
  const { isTacticalMode } = useTheme();

  // Calculate only critical metrics
  const metrics = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active');
    const cancelled = subscriptions.filter(s => s.status === 'cancelled');
    
    const monthlySpend = roundToNearestCent(active.reduce((sum, sub) => {
      const amount = calculateMonthlyAmount(sub.price, sub.frequency);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0));

    const yearlyProjection = roundToNearestCent(monthlySpend * 12);
    const budgetUsed = monthlyBudget > 0 ? Math.round((monthlySpend / monthlyBudget) * 1000) / 10 : 0;
    const budgetRemaining = roundToNearestCent(monthlyBudget - monthlySpend);

    // Get upcoming payments for the week
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingWeek = active
      .filter(sub => {
        if (!sub.nextPayment) return false;
        const paymentDate = new Date(sub.nextPayment);
        return paymentDate >= now && paymentDate <= weekFromNow;
      })
      .sort((a, b) => getDaysUntil(a.nextPayment!) - getDaysUntil(b.nextPayment!));
    
    const upcomingWeekTotal = roundToNearestCent(upcomingWeek.reduce((sum, sub) => 
      sum + sub.price, 0
    ));

    // Get next payment
    const nextPayment = upcomingWeek[0];

    // Calculate trend (mock - would compare to last month in real app)
    const lastMonthSpend = monthlySpend * 0.95; // Mock: 5% increase
    const trend = ((monthlySpend - lastMonthSpend) / lastMonthSpend) * 100;

    // Find highest cost subscription
    const highestCost = active.reduce((highest, sub) => {
      const amount = calculateMonthlyAmount(sub.price, sub.frequency);
      const highestAmount = calculateMonthlyAmount(highest.price, highest.frequency);
      return amount > highestAmount ? sub : highest;
    }, active[0] || null);

    // Calculate daily burn rate
    const dailyBurn = roundToNearestCent(monthlySpend / 30.44);

    // New subscriptions this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = active.filter(sub => 
      new Date(sub.dateAdded) >= startOfMonth
    ).length;

    return {
      monthlySpend,
      yearlyProjection,
      budgetUsed,
      budgetRemaining,
      activeCount: active.length,
      cancelledCount: cancelled.length,
      nextPayment,
      upcomingWeek,
      upcomingWeekTotal,
      trend: Math.round(trend * 10) / 10,
      isOverBudget: monthlySpend > monthlyBudget,
      highestCost,
      dailyBurn,
      newThisMonth
    };
  }, [subscriptions, monthlyBudget]);

  const getBudgetStatus = () => {
    if (metrics.budgetUsed > 100) return { text: 'Over Budget', color: 'text-error' };
    if (metrics.budgetUsed > 80) return { text: 'Near Limit', color: 'text-warning' };
    return { text: 'On Track', color: isTacticalMode ? 'text-tactical-primary' : 'text-success' };
  };

  const status = getBudgetStatus();

  return (
    <div className="clean-dashboard space-y-6 max-w-7xl mx-auto">
      {/* Primary Metric - Monthly Spending */}
      <div className="bg-secondary border border-primary rounded-xl p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-sm font-medium text-muted uppercase tracking-wide">
              Monthly Spending
            </h2>
            <div className="mt-3 flex items-baseline gap-4">
              <p className="text-5xl font-bold text-primary">
                {formatCurrency(metrics.monthlySpend)}
              </p>
              <div className="flex items-center gap-2">
                {metrics.trend > 0 ? (
                  <TrendingUp className="w-5 h-5 text-error" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-success" />
                )}
                <span className={`text-sm font-medium ${metrics.trend > 0 ? 'text-error' : 'text-success'}`}>
                  {Math.abs(metrics.trend)}% vs last month
                </span>
              </div>
            </div>
            
            {/* Budget Progress */}
            {monthlyBudget > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${status.color}`}>
                    {status.text}
                  </span>
                  <span className="text-sm text-muted">
                    {formatCurrency(metrics.budgetRemaining)} remaining
                  </span>
                </div>
                <div className="w-full bg-surface rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      metrics.budgetUsed > 100 ? 'bg-error' :
                      metrics.budgetUsed > 80 ? 'bg-warning' :
                      isTacticalMode ? 'bg-tactical-primary' : 'bg-success'
                    }`}
                    style={{ width: `${Math.min(metrics.budgetUsed, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted">$0</span>
                  <span className="text-xs text-muted">{formatCurrency(monthlyBudget)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Stats Grid - 2x2 with valuable insights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* This Week's Spending */}
        <div className="bg-secondary border border-primary rounded-lg p-4 md:p-6">
          <div className="flex flex-col">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">This Week</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {formatCurrency(metrics.upcomingWeekTotal)}
            </p>
            <p className="text-xs text-secondary mt-1">
              {metrics.upcomingWeek.length} payment{metrics.upcomingWeek.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Daily Burn Rate */}
        <div className="bg-secondary border border-primary rounded-lg p-4 md:p-6">
          <div className="flex flex-col">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Daily Burn</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {formatCurrency(metrics.dailyBurn)}
            </p>
            <p className="text-xs text-secondary mt-1">
              avg per day
            </p>
          </div>
        </div>

        {/* Yearly Projection */}
        <div className="bg-secondary border border-primary rounded-lg p-4 md:p-6">
          <div className="flex flex-col">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Yearly Total</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {formatCurrency(metrics.yearlyProjection)}
            </p>
            <p className="text-xs text-secondary mt-1">
              projected
            </p>
          </div>
        </div>

        {/* Biggest Expense */}
        <div className="bg-secondary border border-primary rounded-lg p-4 md:p-6">
          <div className="flex flex-col">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Highest Cost</p>
            {metrics.highestCost ? (
              <>
                <p className="text-2xl font-bold text-primary mt-1">
                  {formatCurrency(calculateMonthlyAmount(metrics.highestCost.price, metrics.highestCost.frequency))}
                </p>
                <p className="text-xs text-secondary mt-1 truncate">
                  {metrics.highestCost.name}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-primary mt-1">—</p>
                <p className="text-xs text-secondary mt-1">No subscriptions</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Smart Insights Section */}
      <div className="bg-secondary border border-primary rounded-lg p-6">
        <h3 className="text-sm font-medium text-muted uppercase tracking-wide mb-4">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Insight 1: Budget Status */}
          <div className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-1.5 ${
              metrics.isOverBudget ? 'bg-error' : 
              metrics.budgetUsed > 80 ? 'bg-warning' : 
              'bg-success'
            }`} />
            <div className="flex-1">
              <p className="text-sm text-primary font-medium">
                {metrics.isOverBudget 
                  ? `Over budget by ${formatCurrency(Math.abs(metrics.budgetRemaining))}`
                  : metrics.budgetUsed > 80
                  ? `Only ${formatCurrency(metrics.budgetRemaining)} left this month`
                  : `${formatCurrency(metrics.budgetRemaining)} available to spend`
                }
              </p>
              <p className="text-xs text-muted mt-1">
                {Math.round((new Date().getDate() / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()) * 100)}% through the month
              </p>
            </div>
          </div>

          {/* Insight 2: Activity */}
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
            <div className="flex-1">
              <p className="text-sm text-primary font-medium">
                {metrics.newThisMonth > 0 
                  ? `Added ${metrics.newThisMonth} new subscription${metrics.newThisMonth !== 1 ? 's' : ''} this month`
                  : metrics.cancelledCount > 0
                  ? `Cancelled ${metrics.cancelledCount} subscription${metrics.cancelledCount !== 1 ? 's' : ''} recently`
                  : `No changes this month`
                }
              </p>
              <p className="text-xs text-muted mt-1">
                {metrics.activeCount} active, {metrics.cancelledCount} cancelled total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alert (only if needed) */}
      {metrics.isOverBudget && (
        <div className="bg-error/10 border border-error/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-primary">Action Required</p>
              <p className="text-sm text-secondary mt-1">
                Your spending exceeds your budget. The highest cost subscription is {metrics.highestCost?.name} 
                at {formatCurrency(calculateMonthlyAmount(metrics.highestCost?.price || 0, metrics.highestCost?.frequency || 'monthly'))}/month.
              </p>
              <button
                onClick={() => onNavigate('subscriptions')}
                className="text-sm font-medium text-error hover:text-error-hover mt-2"
              >
                Review subscriptions →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - Minimal */}
      <div className="flex gap-3">
        <button
          onClick={() => onNavigate('subscriptions')}
          className="flex-1 px-4 py-3 bg-primary text-primary-text rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Manage Subscriptions
        </button>
        <button
          onClick={() => onNavigate('financials')}
          className="flex-1 px-4 py-3 bg-secondary border border-primary text-primary rounded-lg hover:bg-hover transition-colors font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );
};