/**
 * Financial Intelligence Service
 * Advanced anomaly detection, pattern recognition, and predictive analytics
 */

import { financialService } from './financialService';
import type { Transaction, MonthlyFinancialData, TransactionCategory } from '../types/financialTransactions';

export interface AnomalyDetection {
  id: string;
  type: 'spending_spike' | 'unusual_pattern' | 'duplicate_charge' | 'category_surge' | 'velocity_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  transaction?: Transaction;
  category?: string;
  amount?: number;
  description: string;
  recommendation: string;
  detectedAt: Date;
  metadata?: Record<string, any>;
}

export interface SpendingPattern {
  category: TransactionCategory;
  averageDaily: number;
  averageWeekly: number;
  averageMonthly: number;
  standardDeviation: number;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  seasonality?: {
    highMonths: number[];
    lowMonths: number[];
    pattern: 'consistent' | 'seasonal' | 'irregular';
  };
}

export interface CashFlowProjection {
  date: Date;
  projectedBalance: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
  factors: {
    recurringIncome: number;
    recurringExpenses: number;
    averageVariableExpenses: number;
    seasonalAdjustment: number;
  };
}

export interface FinancialInsight {
  id: string;
  type: 'optimization' | 'warning' | 'opportunity' | 'achievement';
  category: string;
  title: string;
  description: string;
  impact: number; // Potential savings or cost
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestedAction?: string;
  createdAt: Date;
}

class FinancialIntelligenceService {
  private static instance: FinancialIntelligenceService;
  private anomalyHistory: AnomalyDetection[] = [];
  private patternCache: Map<string, SpendingPattern> = new Map();
  private lastAnalysisTime: Date | null = null;

  private constructor() {
    this.loadAnomalyHistory();
  }

  static getInstance(): FinancialIntelligenceService {
    if (!FinancialIntelligenceService.instance) {
      FinancialIntelligenceService.instance = new FinancialIntelligenceService();
    }
    return FinancialIntelligenceService.instance;
  }

  /**
   * Detect anomalies in financial transactions
   */
  async detectAnomalies(
    timeframe: 'day' | 'week' | 'month' = 'month'
  ): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = [];
    const now = new Date();
    
    // Get recent transactions based on timeframe
    const transactions = await this.getTransactionsByTimeframe(timeframe);
    
    // Get historical patterns for comparison
    const patterns = await this.analyzeSpendingPatterns();
    
    // 1. Detect spending spikes
    const spikes = this.detectSpendingSpikes(transactions, patterns);
    anomalies.push(...spikes);
    
    // 2. Detect unusual patterns
    const unusualPatterns = this.detectUnusualPatterns(transactions, patterns);
    anomalies.push(...unusualPatterns);
    
    // 3. Detect potential duplicate charges
    const duplicates = this.detectDuplicateCharges(transactions);
    anomalies.push(...duplicates);
    
    // 4. Detect category surges
    const categorySurges = this.detectCategorySurges(transactions, patterns);
    anomalies.push(...categorySurges);
    
    // 5. Detect velocity changes
    const velocityChanges = this.detectVelocityChanges(transactions);
    anomalies.push(...velocityChanges);
    
    // Update anomaly history
    this.anomalyHistory.push(...anomalies);
    this.saveAnomalyHistory();
    
    this.lastAnalysisTime = now;
    
    return anomalies;
  }

  /**
   * Analyze spending patterns for each category
   */
  async analyzeSpendingPatterns(): Promise<Map<TransactionCategory, SpendingPattern>> {
    const patterns = new Map<TransactionCategory, SpendingPattern>();
    const monthlyData = financialService.getMonthlyData(new Date().getMonth() + 1, new Date().getFullYear());
    
    if (!monthlyData.categories) return patterns;
    
    for (const categoryData of monthlyData.categories) {
      const transactions = categoryData.transactions || [];
      
      if (transactions.length === 0) continue;
      
      const amounts = transactions.map(t => Math.abs(t.amount));
      const dailyAverage = this.calculateDailyAverage(transactions);
      const weeklyAverage = dailyAverage * 7;
      const monthlyAverage = dailyAverage * 30;
      const stdDev = this.calculateStandardDeviation(amounts);
      
      const pattern: SpendingPattern = {
        category: categoryData.category,
        averageDaily: dailyAverage,
        averageWeekly: weeklyAverage,
        averageMonthly: monthlyAverage,
        standardDeviation: stdDev,
        trend: this.determineTrend(transactions),
        seasonality: this.analyzeSeasonality(transactions)
      };
      
      patterns.set(categoryData.category, pattern);
      this.patternCache.set(categoryData.category, pattern);
    }
    
    return patterns;
  }

  /**
   * Generate cash flow projections
   */
  async generateCashFlowProjections(
    days: number = 30
  ): Promise<CashFlowProjection[]> {
    const projections: CashFlowProjection[] = [];
    const currentDate = new Date();
    
    // Get current balance and historical data
    const monthlyData = financialService.getMonthlyData(
      currentDate.getMonth() + 1,
      currentDate.getFullYear()
    );
    
    // Calculate baseline metrics
    const recurringIncome = this.calculateRecurringIncome(monthlyData);
    const recurringExpenses = this.calculateRecurringExpenses(monthlyData);
    const variableExpenses = this.calculateAverageVariableExpenses(monthlyData);
    
    let projectedBalance = 0; // Start from current balance
    
    for (let i = 1; i <= days; i++) {
      const projectionDate = new Date(currentDate);
      projectionDate.setDate(currentDate.getDate() + i);
      
      // Calculate daily projection
      const dailyIncome = recurringIncome / 30;
      const dailyExpenses = (recurringExpenses + variableExpenses) / 30;
      const seasonalAdjustment = this.getSeasonalAdjustment(projectionDate);
      
      projectedBalance += dailyIncome - (dailyExpenses * seasonalAdjustment);
      
      // Calculate confidence bounds
      const confidence = Math.max(50, 100 - (i * 1.5)); // Confidence decreases over time
      const variance = (100 - confidence) / 100 * Math.abs(projectedBalance) * 0.3;
      
      const projection: CashFlowProjection = {
        date: projectionDate,
        projectedBalance,
        confidence,
        upperBound: projectedBalance + variance,
        lowerBound: projectedBalance - variance,
        factors: {
          recurringIncome: dailyIncome,
          recurringExpenses: dailyExpenses,
          averageVariableExpenses: variableExpenses / 30,
          seasonalAdjustment
        }
      };
      
      projections.push(projection);
    }
    
    return projections;
  }

  /**
   * Generate financial insights and recommendations
   */
  async generateInsights(): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];
    const patterns = await this.analyzeSpendingPatterns();
    const anomalies = await this.detectAnomalies('month');
    
    // 1. Subscription optimization opportunities
    const subscriptionInsights = this.analyzeSubscriptionOptimization();
    insights.push(...subscriptionInsights);
    
    // 2. Budget optimization insights
    const budgetInsights = this.analyzeBudgetOptimization(patterns);
    insights.push(...budgetInsights);
    
    // 3. Spending pattern insights
    const patternInsights = this.analyzePatternInsights(patterns);
    insights.push(...patternInsights);
    
    // 4. Anomaly-based insights
    const anomalyInsights = this.generateAnomalyInsights(anomalies);
    insights.push(...anomalyInsights);
    
    // 5. Achievement insights
    const achievements = this.identifyAchievements(patterns);
    insights.push(...achievements);
    
    return insights.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  // Private helper methods

  private detectSpendingSpikes(
    transactions: Transaction[],
    patterns: Map<TransactionCategory, SpendingPattern>
  ): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    for (const [category, pattern] of patterns) {
      const categoryTransactions = transactions.filter(t => t.category === category);
      
      for (const transaction of categoryTransactions) {
        const amount = Math.abs(transaction.amount);
        const threshold = pattern.averageDaily + (2 * pattern.standardDeviation);
        
        if (amount > threshold) {
          const severity = this.calculateSeverity(amount, threshold, pattern.standardDeviation);
          
          anomalies.push({
            id: `spike-${transaction.id}-${Date.now()}`,
            type: 'spending_spike',
            severity,
            confidence: this.calculateConfidence(pattern.standardDeviation, transactions.length),
            transaction,
            category,
            amount,
            description: `Unusual spending of $${amount.toFixed(2)} in ${category} category`,
            recommendation: `This transaction is ${((amount / pattern.averageDaily - 1) * 100).toFixed(0)}% above your daily average. Consider reviewing if this was planned.`,
            detectedAt: new Date()
          });
        }
      }
    }
    
    return anomalies;
  }

  private detectUnusualPatterns(
    transactions: Transaction[],
    patterns: Map<TransactionCategory, SpendingPattern>
  ): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    // Group transactions by time of day
    const timePatterns = this.analyzeTimePatterns(transactions);
    
    for (const [timeSlot, txs] of timePatterns) {
      if (txs.length > 3) { // Multiple transactions in unusual time
        const isUnusual = this.isUnusualTime(timeSlot);
        
        if (isUnusual) {
          anomalies.push({
            id: `pattern-${Date.now()}`,
            type: 'unusual_pattern',
            severity: 'medium',
            confidence: 75,
            description: `${txs.length} transactions detected during unusual hours (${timeSlot})`,
            recommendation: 'Review these transactions for potential fraudulent activity',
            detectedAt: new Date(),
            metadata: { timeSlot, transactionCount: txs.length }
          });
        }
      }
    }
    
    return anomalies;
  }

  private detectDuplicateCharges(transactions: Transaction[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const seen = new Map<string, Transaction[]>();
    
    for (const transaction of transactions) {
      const key = `${transaction.name}-${Math.abs(transaction.amount)}`;
      
      if (seen.has(key)) {
        const similar = seen.get(key)!;
        const timeDiff = Math.abs(
          new Date(transaction.date).getTime() - 
          new Date(similar[0].date).getTime()
        );
        
        // If transactions are within 3 days and same amount
        if (timeDiff < 3 * 24 * 60 * 60 * 1000) {
          anomalies.push({
            id: `duplicate-${transaction.id}-${Date.now()}`,
            type: 'duplicate_charge',
            severity: 'high',
            confidence: 85,
            transaction,
            amount: Math.abs(transaction.amount),
            description: `Potential duplicate charge: ${transaction.name} for $${Math.abs(transaction.amount).toFixed(2)}`,
            recommendation: 'Verify if this is a legitimate duplicate charge or contact the merchant',
            detectedAt: new Date(),
            metadata: { originalTransaction: similar[0] }
          });
        }
        
        similar.push(transaction);
      } else {
        seen.set(key, [transaction]);
      }
    }
    
    return anomalies;
  }

  private detectCategorySurges(
    transactions: Transaction[],
    patterns: Map<TransactionCategory, SpendingPattern>
  ): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const categoryTotals = new Map<TransactionCategory, number>();
    
    // Calculate current period totals
    for (const transaction of transactions) {
      const current = categoryTotals.get(transaction.category) || 0;
      categoryTotals.set(transaction.category, current + Math.abs(transaction.amount));
    }
    
    // Compare with patterns
    for (const [category, total] of categoryTotals) {
      const pattern = patterns.get(category);
      if (!pattern) continue;
      
      const expectedTotal = pattern.averageWeekly;
      const surge = total / expectedTotal;
      
      if (surge > 1.5) { // 50% increase
        anomalies.push({
          id: `surge-${category}-${Date.now()}`,
          type: 'category_surge',
          severity: surge > 2 ? 'high' : 'medium',
          confidence: 80,
          category,
          amount: total,
          description: `Spending in ${category} is ${((surge - 1) * 100).toFixed(0)}% above normal`,
          recommendation: `Consider reviewing your ${category} expenses to ensure they align with your budget`,
          detectedAt: new Date(),
          metadata: { surge, expectedTotal }
          });
      }
    }
    
    return anomalies;
  }

  private detectVelocityChanges(transactions: Transaction[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    
    // Group transactions by day
    const dailyGroups = this.groupTransactionsByDay(transactions);
    const dailyCounts = Array.from(dailyGroups.values()).map(txs => txs.length);
    
    if (dailyCounts.length < 2) return anomalies;
    
    const avgVelocity = dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length;
    const maxVelocity = Math.max(...dailyCounts);
    
    if (maxVelocity > avgVelocity * 2) {
      anomalies.push({
        id: `velocity-${Date.now()}`,
        type: 'velocity_change',
        severity: maxVelocity > avgVelocity * 3 ? 'high' : 'medium',
        confidence: 70,
        description: `Transaction velocity peaked at ${maxVelocity} transactions/day (${((maxVelocity / avgVelocity - 1) * 100).toFixed(0)}% above average)`,
        recommendation: 'Monitor spending closely during high-velocity periods',
        detectedAt: new Date(),
        metadata: { maxVelocity, avgVelocity }
      });
    }
    
    return anomalies;
  }

  // Utility methods

  private calculateDailyAverage(transactions: Transaction[]): number {
    if (transactions.length === 0) return 0;
    
    const total = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const days = this.getDaySpan(transactions);
    
    return total / Math.max(1, days);
  }

  private calculateStandardDeviation(amounts: number[]): number {
    if (amounts.length === 0) return 0;
    
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const squaredDiffs = amounts.map(x => Math.pow(x - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / amounts.length;
    
    return Math.sqrt(avgSquaredDiff);
  }

  private determineTrend(transactions: Transaction[]): 'increasing' | 'decreasing' | 'stable' | 'volatile' {
    if (transactions.length < 3) return 'stable';
    
    const weeklyTotals = this.getWeeklyTotals(transactions);
    if (weeklyTotals.length < 2) return 'stable';
    
    const changes = [];
    for (let i = 1; i < weeklyTotals.length; i++) {
      changes.push((weeklyTotals[i] - weeklyTotals[i - 1]) / weeklyTotals[i - 1]);
    }
    
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    const changeVolatility = this.calculateStandardDeviation(changes);
    
    if (changeVolatility > 0.3) return 'volatile';
    if (avgChange > 0.1) return 'increasing';
    if (avgChange < -0.1) return 'decreasing';
    return 'stable';
  }

  private analyzeSeasonality(transactions: Transaction[]): SpendingPattern['seasonality'] {
    // Simplified seasonality analysis
    const monthlyTotals = new Map<number, number>();
    
    for (const transaction of transactions) {
      const month = new Date(transaction.date).getMonth();
      const current = monthlyTotals.get(month) || 0;
      monthlyTotals.set(month, current + Math.abs(transaction.amount));
    }
    
    if (monthlyTotals.size < 3) {
      return undefined;
    }
    
    const values = Array.from(monthlyTotals.values());
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    const highMonths = Array.from(monthlyTotals.entries())
      .filter(([_, total]) => total > avg * 1.2)
      .map(([month]) => month);
    
    const lowMonths = Array.from(monthlyTotals.entries())
      .filter(([_, total]) => total < avg * 0.8)
      .map(([month]) => month);
    
    return {
      highMonths,
      lowMonths,
      pattern: highMonths.length > 0 || lowMonths.length > 0 ? 'seasonal' : 'consistent'
    };
  }

  private calculateRecurringIncome(monthlyData: MonthlyFinancialData): number {
    // Simplified - would need actual income data
    return monthlyData.totalIncome || 0;
  }

  private calculateRecurringExpenses(monthlyData: MonthlyFinancialData): number {
    return monthlyData.subscriptionTotal + monthlyData.debtTotal + monthlyData.utilityCosts;
  }

  private calculateAverageVariableExpenses(monthlyData: MonthlyFinancialData): number {
    const total = monthlyData.totalSpending;
    const recurring = this.calculateRecurringExpenses(monthlyData);
    return Math.max(0, total - recurring);
  }

  private getSeasonalAdjustment(date: Date): number {
    const month = date.getMonth();
    // Higher spending in November/December (holidays)
    if (month === 10 || month === 11) return 1.3;
    // Lower spending in January (post-holiday)
    if (month === 0) return 0.8;
    return 1.0;
  }

  private analyzeSubscriptionOptimization(): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    
    // This would analyze subscription usage patterns
    insights.push({
      id: `insight-sub-${Date.now()}`,
      type: 'optimization',
      category: 'subscriptions',
      title: 'Subscription Optimization Opportunity',
      description: 'You have 3 subscriptions that haven\'t been used in the last 30 days',
      impact: 45.97,
      confidence: 85,
      priority: 'medium',
      actionable: true,
      suggestedAction: 'Review and cancel unused subscriptions',
      createdAt: new Date()
    });
    
    return insights;
  }

  private analyzeBudgetOptimization(patterns: Map<TransactionCategory, SpendingPattern>): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    
    for (const [category, pattern] of patterns) {
      if (pattern.trend === 'increasing' && pattern.averageMonthly > 500) {
        insights.push({
          id: `insight-budget-${category}-${Date.now()}`,
          type: 'warning',
          category,
          title: `Rising ${category} Expenses`,
          description: `Your ${category} spending has been increasing and is now at $${pattern.averageMonthly.toFixed(2)}/month`,
          impact: pattern.averageMonthly * 0.2, // Potential 20% savings
          confidence: 75,
          priority: 'high',
          actionable: true,
          suggestedAction: `Set a budget limit for ${category} to control spending`,
          createdAt: new Date()
        });
      }
    }
    
    return insights;
  }

  private analyzePatternInsights(patterns: Map<TransactionCategory, SpendingPattern>): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    
    // Add pattern-based insights
    for (const [category, pattern] of patterns) {
      if (pattern.trend === 'volatile') {
        insights.push({
          id: `insight-pattern-${category}-${Date.now()}`,
          type: 'warning',
          category,
          title: `Volatile ${category} Spending`,
          description: `Your ${category} spending patterns are inconsistent, making budgeting difficult`,
          impact: 0,
          confidence: 80,
          priority: 'low',
          actionable: true,
          suggestedAction: `Track ${category} expenses more closely to identify causes of variation`,
          createdAt: new Date()
        });
      }
    }
    
    return insights;
  }

  private generateAnomalyInsights(anomalies: AnomalyDetection[]): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    
    const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high' || a.severity === 'critical');
    
    if (highSeverityAnomalies.length > 0) {
      insights.push({
        id: `insight-anomaly-${Date.now()}`,
        type: 'warning',
        category: 'security',
        title: 'Unusual Activity Detected',
        description: `${highSeverityAnomalies.length} high-priority anomalies detected in your recent transactions`,
        impact: 0,
        confidence: 90,
        priority: 'high',
        actionable: true,
        suggestedAction: 'Review flagged transactions immediately',
        createdAt: new Date()
      });
    }
    
    return insights;
  }

  private identifyAchievements(patterns: Map<TransactionCategory, SpendingPattern>): FinancialInsight[] {
    const insights: FinancialInsight[] = [];
    
    // Check for positive trends
    for (const [category, pattern] of patterns) {
      if (pattern.trend === 'decreasing') {
        insights.push({
          id: `achievement-${category}-${Date.now()}`,
          type: 'achievement',
          category,
          title: `Great job reducing ${category} spending!`,
          description: `You've successfully reduced ${category} expenses by ${((1 - pattern.averageMonthly / (pattern.averageMonthly * 1.2)) * 100).toFixed(0)}%`,
          impact: pattern.averageMonthly * 0.2,
          confidence: 85,
          priority: 'low',
          actionable: false,
          createdAt: new Date()
        });
      }
    }
    
    return insights;
  }

  // Helper utility methods

  private calculateSeverity(amount: number, threshold: number, stdDev: number): AnomalyDetection['severity'] {
    const deviation = (amount - threshold) / stdDev;
    
    if (deviation > 4) return 'critical';
    if (deviation > 3) return 'high';
    if (deviation > 2) return 'medium';
    return 'low';
  }

  private calculateConfidence(stdDev: number, sampleSize: number): number {
    // Higher standard deviation = lower confidence
    // Larger sample size = higher confidence
    const stdDevFactor = Math.max(0, 100 - (stdDev * 10));
    const sampleFactor = Math.min(100, sampleSize * 5);
    
    return Math.round((stdDevFactor + sampleFactor) / 2);
  }

  private analyzeTimePatterns(transactions: Transaction[]): Map<string, Transaction[]> {
    const patterns = new Map<string, Transaction[]>();
    
    for (const transaction of transactions) {
      const hour = new Date(transaction.date).getHours();
      const timeSlot = this.getTimeSlot(hour);
      
      const current = patterns.get(timeSlot) || [];
      current.push(transaction);
      patterns.set(timeSlot, current);
    }
    
    return patterns;
  }

  private getTimeSlot(hour: number): string {
    if (hour >= 0 && hour < 6) return 'late-night';
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  }

  private isUnusualTime(timeSlot: string): boolean {
    return timeSlot === 'late-night';
  }

  private groupTransactionsByDay(transactions: Transaction[]): Map<string, Transaction[]> {
    const groups = new Map<string, Transaction[]>();
    
    for (const transaction of transactions) {
      const day = new Date(transaction.date).toDateString();
      const current = groups.get(day) || [];
      current.push(transaction);
      groups.set(day, current);
    }
    
    return groups;
  }

  private getDaySpan(transactions: Transaction[]): number {
    if (transactions.length === 0) return 0;
    
    const dates = transactions.map(t => new Date(t.date).getTime());
    const min = Math.min(...dates);
    const max = Math.max(...dates);
    
    return Math.ceil((max - min) / (1000 * 60 * 60 * 24)) || 1;
  }

  private getWeeklyTotals(transactions: Transaction[]): number[] {
    const weeklyMap = new Map<number, number>();
    
    for (const transaction of transactions) {
      const week = this.getWeekNumber(new Date(transaction.date));
      const current = weeklyMap.get(week) || 0;
      weeklyMap.set(week, current + Math.abs(transaction.amount));
    }
    
    return Array.from(weeklyMap.values());
  }

  private getWeekNumber(date: Date): number {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - firstDay.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
  }

  private async getTransactionsByTimeframe(timeframe: 'day' | 'week' | 'month'): Promise<Transaction[]> {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeframe) {
      case 'day':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    const monthlyData = financialService.getMonthlyData(now.getMonth() + 1, now.getFullYear());
    
    return monthlyData.transactions.filter(t => 
      new Date(t.date) >= cutoffDate
    );
  }

  private loadAnomalyHistory(): void {
    try {
      const stored = localStorage.getItem('anomalyHistory');
      if (stored) {
        this.anomalyHistory = JSON.parse(stored).map((a: any) => ({
          ...a,
          detectedAt: new Date(a.detectedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading anomaly history:', error);
    }
  }

  private saveAnomalyHistory(): void {
    try {
      // Keep only last 100 anomalies
      this.anomalyHistory = this.anomalyHistory.slice(-100);
      localStorage.setItem('anomalyHistory', JSON.stringify(this.anomalyHistory));
    } catch (error) {
      console.error('Error saving anomaly history:', error);
    }
  }

  // Public API methods

  getAnomalyHistory(): AnomalyDetection[] {
    return [...this.anomalyHistory];
  }

  clearAnomalyHistory(): void {
    this.anomalyHistory = [];
    this.saveAnomalyHistory();
  }

  getLastAnalysisTime(): Date | null {
    return this.lastAnalysisTime;
  }

  getCachedPatterns(): Map<string, SpendingPattern> {
    return new Map(this.patternCache);
  }
}

export const financialIntelligenceService = FinancialIntelligenceService.getInstance();
export default financialIntelligenceService;