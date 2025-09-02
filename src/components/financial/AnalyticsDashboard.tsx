/**
 * Analytics Dashboard Component
 * Advanced financial analytics, trends, and insights
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  Award,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  DollarSign
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import type { 
  SpendingTrend, 
  BudgetAnalysis, 
  FinancialInsight, 
  MonthlyComparison 
} from '../../services/analyticsService';

interface AnalyticsDashboardProps {
  month: number;
  year: number;
}

type AnalyticsView = 'trends' | 'budget' | 'insights' | 'comparison';

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ month, year }) => {
  const [activeView, setActiveView] = useState<AnalyticsView>('trends');
  const [spendingTrends, setSpendingTrends] = useState<SpendingTrend[]>([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis[]>([]);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [monthlyComparison, setMonthlyComparison] = useState<MonthlyComparison | null>(null);
  const [spendingVelocity, setSpendingVelocity] = useState<any>(null);

  // Demo budget settings
  const demoBudgets = {
    transportation: 1200,
    debt_and_credit: 1000,
    utilities: 800,
    subscriptions: 400,
    other: 600
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [month, year]);

  const loadAnalyticsData = () => {
    const trends = analyticsService.getSpendingTrends(6);
    const budget = analyticsService.getBudgetAnalysis(month, year, demoBudgets);
    const financialInsights = analyticsService.generateInsights(month, year);
    const comparison = analyticsService.getMonthlyComparison(month, year);
    const velocity = analyticsService.getSpendingVelocity(month, year);

    setSpendingTrends(trends);
    setBudgetAnalysis(budget);
    setInsights(financialInsights);
    setMonthlyComparison(comparison);
    setSpendingVelocity(velocity);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-red-400" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-green-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-400';
      case 'decreasing':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-blue-400" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-green-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBudgetStatus = (analysis: BudgetAnalysis) => {
    switch (analysis.status) {
      case 'over':
        return { color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700' };
      case 'under':
        return { color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-700' };
      default:
        return { color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-700' };
    }
  };

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-light text-white mb-2 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-purple-400" />
          Financial Analytics
        </h2>
        <p className="text-gray-400">
          Advanced insights and spending analysis for {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Quick Stats */}
      {spendingVelocity && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400 text-sm">Daily Spending Rate</span>
            </div>
            <div className="text-2xl font-light text-white">
              {formatCurrency(spendingVelocity.currentPace)}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400 text-sm">Projected Month-End</span>
            </div>
            <div className="text-2xl font-light text-white">
              {formatCurrency(spendingVelocity.projectedMonthEnd)}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 md:p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-gray-400 text-sm">Spending Pace</span>
            </div>
            <div className={`text-2xl font-light capitalize ${
              spendingVelocity.comparison === 'ahead' ? 'text-red-400' :
              spendingVelocity.comparison === 'behind' ? 'text-green-400' : 'text-gray-400'
            }`}>
              {spendingVelocity.comparison.replace('_', ' ')}
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-wrap gap-2 md:gap-3">
          <button
            onClick={() => setActiveView('trends')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all touch-manipulation ${
              activeView === 'trends'
                ? 'bg-white text-black font-medium'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Spending Trends</span>
            <span className="sm:hidden">Trends</span>
          </button>
          
          <button
            onClick={() => setActiveView('budget')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all touch-manipulation ${
              activeView === 'budget'
                ? 'bg-white text-black font-medium'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            Budget Tracking
          </button>
          
          <button
            onClick={() => setActiveView('insights')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all touch-manipulation ${
              activeView === 'insights'
                ? 'bg-white text-black font-medium'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Insights
          </button>
          
          <button
            onClick={() => setActiveView('comparison')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-all touch-manipulation ${
              activeView === 'comparison'
                ? 'bg-white text-black font-medium'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Comparison
          </button>
        </div>
      </div>

      {/* Content Views */}
      <div className="min-h-[400px]">
        {activeView === 'trends' && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-white mb-4">6-Month Spending Trends</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {spendingTrends.map((trend) => (
                <div key={trend.category} className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-white capitalize">
                      {trend.category.replace('_', ' ')}
                    </h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trend.trend)}
                      <span className={`text-sm capitalize ${getTrendColor(trend.trend)}`}>
                        {trend.trend}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Average Monthly</span>
                      <div className="text-2xl font-light text-white">
                        {formatCurrency(trend.avgMonthlySpend)}
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-400 text-sm">Next Month Projection</span>
                      <div className="text-xl font-light text-gray-300">
                        {formatCurrency(trend.projection)}
                      </div>
                    </div>

                    {/* Simple trend visualization */}
                    <div className="mt-4">
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            trend.trend === 'increasing' ? 'bg-red-500' :
                            trend.trend === 'decreasing' ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${Math.min((trend.projection / trend.avgMonthlySpend) * 50, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'budget' && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-white mb-4">Budget Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgetAnalysis.map((budget) => {
                const status = getBudgetStatus(budget);
                const progressPercent = Math.min((budget.actualAmount / budget.budgetAmount) * 100, 100);
                
                return (
                  <div key={budget.category} className={`bg-gray-900 border rounded-xl p-6 ${status.border}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-white capitalize">
                        {budget.category.replace('_', ' ')}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${status.bg} ${status.color}`}>
                        {budget.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Spent</span>
                        <span className="text-white">{formatCurrency(budget.actualAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Budget</span>
                        <span className="text-white">{formatCurrency(budget.budgetAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Variance</span>
                        <span className={budget.variance >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {budget.variance >= 0 ? '+' : ''}{formatCurrency(budget.variance)}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              budget.status === 'over' ? 'bg-red-500' :
                              budget.status === 'under' ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span>{progressPercent.toFixed(0)}%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-400">
                        Projected month-end: {formatCurrency(budget.projectedMonthEnd)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeView === 'insights' && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-white mb-4">Financial Insights</h3>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-medium text-white">{insight.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.priority === 'high' ? 'bg-red-900/30 text-red-400' :
                          insight.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-gray-800 text-gray-400'
                        }`}>
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3">{insight.description}</p>
                      {insight.impact > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400">
                            Potential impact: {formatCurrency(insight.impact)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'comparison' && monthlyComparison && (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-white mb-4">Month-over-Month Comparison</h3>
            
            {/* Overview */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Current Month</h4>
                  <div className="text-3xl font-light text-white">
                    {formatCurrency(monthlyComparison.currentMonth.totalSpending)}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Previous Month</h4>
                  <div className="text-3xl font-light text-gray-400">
                    {formatCurrency(monthlyComparison.previousMonth.totalSpending)}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  {monthlyComparison.changes.totalChange >= 0 ? 
                    <TrendingUp className="w-5 h-5 text-red-400" /> :
                    <TrendingDown className="w-5 h-5 text-green-400" />
                  }
                  <span className={`font-medium ${
                    monthlyComparison.changes.totalChange >= 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {monthlyComparison.changes.totalChange >= 0 ? '+' : ''}
                    {formatCurrency(monthlyComparison.changes.totalChange)} 
                    ({monthlyComparison.changes.totalChangePercent.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {monthlyComparison.changes.categoryChanges.map((change) => {
                const currentCat = monthlyComparison.currentMonth.categories.find(c => c.category === change.category);
                const prevCat = monthlyComparison.previousMonth.categories.find(c => c.category === change.category);
                
                if (!currentCat) return null;

                return (
                  <div key={change.category} className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                    <h4 className="text-lg font-medium text-white mb-4 capitalize">
                      {change.category.replace('_', ' ')}
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current</span>
                        <span className="text-white">{formatCurrency(currentCat.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Previous</span>
                        <span className="text-gray-400">{formatCurrency(prevCat?.amount || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Change</span>
                        <div className="flex items-center gap-1">
                          {change.change >= 0 ? 
                            <TrendingUp className="w-4 h-4 text-red-400" /> :
                            <TrendingDown className="w-4 h-4 text-green-400" />
                          }
                          <span className={change.change >= 0 ? 'text-red-400' : 'text-green-400'}>
                            {change.change >= 0 ? '+' : ''}{formatCurrency(change.change)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};