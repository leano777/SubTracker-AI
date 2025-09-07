/**
 * Analytics Service
 * Provides advanced financial analytics, trends, and predictions
 */

import type { MonthlyFinancialData, Transaction, TransactionCategory } from '../types/financialTransactions';
import { financialService } from './financialService';

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

export interface SpendingTrend {
  category: string;
  periods: {
    month: number;
    year: number;
    amount: number;
    change: number; // percentage change from previous period
  }[];
  trend: 'increasing' | 'decreasing' | 'stable';
  avgMonthlySpend: number;
  projection: number; // projected next month spend
}

export interface BudgetAnalysis {
  category: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number; // positive = under budget, negative = over budget
  variancePercent: number;
  status: 'under' | 'over' | 'on_track';
  daysRemaining: number;
  projectedMonthEnd: number;
}

export interface FinancialInsight {
  type: 'warning' | 'tip' | 'achievement';
  title: string;
  description: string;
  impact: number; // potential savings or cost
  category?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MonthlyComparison {
  currentMonth: {
    month: number;
    year: number;
    totalSpending: number;
    categories: CategoryBreakdown[];
  };
  previousMonth: {
    month: number;
    year: number;
    totalSpending: number;
    categories: CategoryBreakdown[];
  };
  changes: {
    totalChange: number;
    totalChangePercent: number;
    categoryChanges: {
      category: string;
      change: number;
      changePercent: number;
    }[];
  };
}

class AnalyticsService {
  private static instance: AnalyticsService;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Spending Trends Analysis
  getSpendingTrends(months: number = 6): SpendingTrend[] {
    const trends: SpendingTrend[] = [];
    const categories = ['transportation', 'debt_and_credit', 'utilities', 'subscriptions', 'other'];
    
    categories.forEach(category => {
      const periods = this.generateTrendPeriods(category, months);
      const trend = this.calculateTrend(periods);
      const avgSpend = this.calculateAverageSpend(periods);
      const projection = this.projectNextMonth(periods);

      trends.push({
        category,
        periods,
        trend,
        avgMonthlySpend: avgSpend,
        projection
      });
    });

    return trends.sort((a, b) => b.avgMonthlySpend - a.avgMonthlySpend);
  }

  // Budget Tracking
  getBudgetAnalysis(month: number, year: number, budgets: Record<string, number>): BudgetAnalysis[] {
    const monthlyData = financialService.getMonthlyData(month, year);
    const analysis: BudgetAnalysis[] = [];
    
    Object.entries(budgets).forEach(([category, budgetAmount]) => {
      const categoryData = monthlyData.categories.find(c => c.category === category);
      const actualAmount = categoryData?.amount || 0;
      const variance = budgetAmount - actualAmount;
      const variancePercent = budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;
      
      const daysInMonth = new Date(year, month, 0).getDate();
      const currentDay = new Date().getDate();
      const daysRemaining = Math.max(0, daysInMonth - currentDay);
      
      // Project month-end spending based on current pace
      const dailyRate = actualAmount / currentDay;
      const projectedMonthEnd = dailyRate * daysInMonth;
      
      let status: 'under' | 'over' | 'on_track';
      if (projectedMonthEnd > budgetAmount * 1.1) {
        status = 'over';
      } else if (projectedMonthEnd < budgetAmount * 0.9) {
        status = 'under';
      } else {
        status = 'on_track';
      }

      analysis.push({
        category,
        budgetAmount,
        actualAmount,
        variance,
        variancePercent,
        status,
        daysRemaining,
        projectedMonthEnd
      });
    });

    return analysis;
  }

  // Financial Insights
  generateInsights(month: number, year: number): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    const monthlyData = financialService.getMonthlyData(month, year);
    const trends = this.getSpendingTrends(3);
    const comparison = this.getMonthlyComparison(month, year);

    // High spending categories
    const topSpendingCategory = monthlyData.categories.reduce((max, cat) => 
      cat.amount > max.amount ? cat : max
    );
    
    if (topSpendingCategory.amount > 1000) {
      insights.push({
        type: 'warning',
        title: `High ${topSpendingCategory.displayName} Spending`,
        description: `Your ${topSpendingCategory.displayName.toLowerCase()} spending is $${topSpendingCategory.amount.toFixed(2)} this month.`,
        impact: topSpendingCategory.amount * 0.1,
        category: topSpendingCategory.category,
        priority: 'high'
      });
    }

    // Subscription optimization
    const subscriptionTotal = monthlyData.subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
    const unusedSubscriptions = monthlyData.subscriptions.filter(sub => !sub.isActive);
    
    if (unusedSubscriptions.length > 0) {
      const savings = unusedSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
      insights.push({
        type: 'tip',
        title: 'Cancel Unused Subscriptions',
        description: `You have ${unusedSubscriptions.length} inactive subscriptions that could save you $${savings.toFixed(2)} monthly.`,
        impact: savings * 12,
        category: 'subscriptions',
        priority: 'medium'
      });
    }

    // Spending increase alerts
    if (comparison.changes.totalChangePercent > 20) {
      insights.push({
        type: 'warning',
        title: 'Spending Increase Alert',
        description: `Your total spending increased by ${comparison.changes.totalChangePercent.toFixed(1)}% compared to last month.`,
        impact: comparison.changes.totalChange,
        priority: 'high'
      });
    }

    // Debt payment consistency
    const debtPayments = monthlyData.debtPayments;
    const totalDebtPayments = debtPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    if (totalDebtPayments > 0) {
      insights.push({
        type: 'achievement',
        title: 'Debt Payment Progress',
        description: `Great job! You paid $${totalDebtPayments.toFixed(2)} towards debt this month.`,
        impact: totalDebtPayments,
        category: 'debt',
        priority: 'low'
      });
    }

    // Trending category analysis
    trends.forEach(trend => {
      if (trend.trend === 'increasing' && trend.avgMonthlySpend > 100) {
        const changePercent = this.calculateTrendPercentage(trend.periods);
        if (changePercent > 25) {
          insights.push({
            type: 'warning',
            title: `Rising ${trend.category} Costs`,
            description: `Your ${trend.category} spending has increased by ${changePercent.toFixed(1)}% over the past few months.`,
            impact: trend.projection - trend.avgMonthlySpend,
            category: trend.category,
            priority: 'medium'
          });
        }
      }
    });

    return insights.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  }

  // Monthly Comparison
  getMonthlyComparison(month: number, year: number): MonthlyComparison {
    const currentData = financialService.getMonthlyData(month, year);
    
    // Calculate previous month
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear = year - 1;
    }
    
    // For demo purposes, create synthetic previous month data
    const previousData = this.generateSyntheticPreviousMonth(currentData);
    
    const totalChange = currentData.totalSpending - previousData.totalSpending;
    const totalChangePercent = previousData.totalSpending > 0 
      ? (totalChange / previousData.totalSpending) * 100 
      : 0;

    const categoryChanges = currentData.categories.map(currentCat => {
      const prevCat = previousData.categories.find(c => c.category === currentCat.category);
      const prevAmount = prevCat?.amount || 0;
      const change = currentCat.amount - prevAmount;
      const changePercent = prevAmount > 0 ? (change / prevAmount) * 100 : 0;

      return {
        category: currentCat.category,
        change,
        changePercent
      };
    });

    return {
      currentMonth: {
        month,
        year,
        totalSpending: currentData.totalSpending,
        categories: currentData.categories
      },
      previousMonth: {
        month: prevMonth,
        year: prevYear,
        totalSpending: previousData.totalSpending,
        categories: previousData.categories
      },
      changes: {
        totalChange,
        totalChangePercent,
        categoryChanges
      }
    };
  }

  // Spending Velocity (rate of spending)
  getSpendingVelocity(month: number, year: number): {
    currentPace: number;
    projectedMonthEnd: number;
    comparison: 'ahead' | 'behind' | 'on_pace';
    daysRemaining: number;
  } {
    const monthlyData = financialService.getMonthlyData(month, year);
    const daysInMonth = new Date(year, month, 0).getDate();
    const currentDay = Math.min(new Date().getDate(), daysInMonth);
    
    const currentPace = monthlyData.totalSpending / currentDay;
    const projectedMonthEnd = currentPace * daysInMonth;
    const expectedPaceForMonth = monthlyData.totalSpending / (currentDay / daysInMonth);
    
    let comparison: 'ahead' | 'behind' | 'on_pace';
    const variance = (projectedMonthEnd / expectedPaceForMonth - 1) * 100;
    
    if (variance > 10) {
      comparison = 'ahead';
    } else if (variance < -10) {
      comparison = 'behind';
    } else {
      comparison = 'on_pace';
    }

    return {
      currentPace,
      projectedMonthEnd,
      comparison,
      daysRemaining: daysInMonth - currentDay
    };
  }

  // Helper Methods
  private generateTrendPeriods(category: string, months: number) {
    const periods = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      // Generate synthetic data based on August 2025 data
      const baseAmount = this.getCategoryBaseAmount(category);
      const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
      const amount = baseAmount * (1 + variation);
      
      // Calculate change from previous period
      const change = i === months - 1 ? 0 : (Math.random() - 0.5) * 20; // ±10% change
      
      periods.push({
        month,
        year,
        amount,
        change
      });
    }
    
    return periods;
  }

  private calculateTrend(periods: any[]): 'increasing' | 'decreasing' | 'stable' {
    if (periods.length < 2) return 'stable';
    
    const firstHalf = periods.slice(0, Math.floor(periods.length / 2));
    const secondHalf = periods.slice(Math.floor(periods.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, p) => sum + p.amount, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.amount, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  private calculateAverageSpend(periods: any[]): number {
    return periods.reduce((sum, p) => sum + p.amount, 0) / periods.length;
  }

  private projectNextMonth(periods: any[]): number {
    const recentPeriods = periods.slice(-3); // Use last 3 months
    const trend = this.calculateTrend(recentPeriods);
    const avgSpend = this.calculateAverageSpend(recentPeriods);
    
    switch (trend) {
      case 'increasing':
        return avgSpend * 1.1;
      case 'decreasing':
        return avgSpend * 0.9;
      default:
        return avgSpend;
    }
  }

  private calculateTrendPercentage(periods: any[]): number {
    if (periods.length < 2) return 0;
    const first = periods[0].amount;
    const last = periods[periods.length - 1].amount;
    return first > 0 ? ((last - first) / first) * 100 : 0;
  }

  private getCategoryBaseAmount(category: string): number {
    // Base amounts from August 2025 data
    const baseAmounts: Record<string, number> = {
      transportation: 1208,
      debt_and_credit: 1013.73,
      utilities: 950,
      subscriptions: 313.37,
      other: 642.29
    };
    return baseAmounts[category] || 100;
  }

  private generateSyntheticPreviousMonth(currentData: MonthlyFinancialData): MonthlyFinancialData {
    // Generate synthetic previous month data for comparison
    const variation = 0.85 + (Math.random() * 0.3); // 85-115% of current month
    
    return {
      ...currentData,
      totalSpending: currentData.totalSpending * variation,
      categories: currentData.categories.map(cat => ({
        ...cat,
        amount: cat.amount * (0.8 + Math.random() * 0.4) // 80-120% variation per category
      }))
    };
  }
}

export const analyticsService = AnalyticsService.getInstance();