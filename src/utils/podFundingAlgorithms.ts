import type {
  BudgetPod,
  Transaction,
  IncomeSource,
  PodFundingAnalysis,
  FundingSuggestion,
  FundingAutomationRule,
  PodFundingDashboardMetrics
} from '../types/financial';

interface SpendingPattern {
  podId: string;
  monthlyAverage: number;
  variance: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: number[];
  outliers: number[];
  consistency: number; // 0-100
}

interface IncomePattern {
  sourceId: string;
  stability: number; // 0-100
  growthRate: number; // percentage
  variability: number; // coefficient of variation
  reliability: number; // 0-100
}

/**
 * Analyzes spending patterns for a specific budget pod
 */
export const analyzeSpendingPattern = (
  podId: string,
  transactions: Transaction[],
  timeframeMonths: number = 6
): SpendingPattern => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - timeframeMonths);

  // Filter transactions for this pod within timeframe
  const podTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return (
      transactionDate >= startDate && 
      transactionDate <= endDate &&
      (t.budgetPodId === podId || t.category.includes(podId))
    );
  });

  if (podTransactions.length === 0) {
    return {
      podId,
      monthlyAverage: 0,
      variance: 0,
      trend: 'stable',
      seasonality: [],
      outliers: [],
      consistency: 0,
    };
  }

  // Group transactions by month
  const monthlySpending: Record<string, number> = {};
  podTransactions.forEach(transaction => {
    const monthKey = transaction.date.substring(0, 7); // YYYY-MM
    monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + Math.abs(transaction.amount);
  });

  const monthlyAmounts = Object.values(monthlySpending);
  const monthlyAverage = monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length;

  // Calculate variance
  const variance = monthlyAmounts.length > 1 ? 
    monthlyAmounts.reduce((sum, amount) => sum + Math.pow(amount - monthlyAverage, 2), 0) / (monthlyAmounts.length - 1) :
    0;

  // Determine trend using linear regression
  const trend = calculateTrend(monthlyAmounts);

  // Calculate consistency score (inverse of coefficient of variation)
  const consistency = monthlyAverage > 0 ? 
    Math.max(0, 100 - ((Math.sqrt(variance) / monthlyAverage) * 100)) : 0;

  // Detect outliers (values > 2 standard deviations from mean)
  const stdDev = Math.sqrt(variance);
  const outliers = monthlyAmounts.filter(amount => 
    Math.abs(amount - monthlyAverage) > (2 * stdDev)
  );

  return {
    podId,
    monthlyAverage,
    variance,
    trend,
    seasonality: calculateSeasonality(monthlyAmounts),
    outliers,
    consistency,
  };
};

/**
 * Analyzes income patterns for stability and predictability
 */
export const analyzeIncomePattern = (
  incomeSource: IncomeSource,
  transactions: Transaction[],
  timeframeMonths: number = 12
): IncomePattern => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - timeframeMonths);

  const incomeTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return (
      t.type === 'income' &&
      transactionDate >= startDate &&
      transactionDate <= endDate &&
      (t.externalAccountId === incomeSource.id || t.description.includes(incomeSource.name))
    );
  });

  if (incomeTransactions.length === 0) {
    return {
      sourceId: incomeSource.id,
      stability: 50,
      growthRate: 0,
      variability: 0,
      reliability: incomeSource.isActive ? 75 : 25,
    };
  }

  // Group by month
  const monthlyIncome: Record<string, number> = {};
  incomeTransactions.forEach(transaction => {
    const monthKey = transaction.date.substring(0, 7);
    monthlyIncome[monthKey] = (monthlyIncome[monthKey] || 0) + transaction.amount;
  });

  const monthlyAmounts = Object.values(monthlyIncome);
  const averageMonthly = monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length;

  // Calculate stability (inverse of coefficient of variation)
  const variance = monthlyAmounts.length > 1 ?
    monthlyAmounts.reduce((sum, amount) => sum + Math.pow(amount - averageMonthly, 2), 0) / (monthlyAmounts.length - 1) :
    0;
  const coefficientOfVariation = averageMonthly > 0 ? Math.sqrt(variance) / averageMonthly : 0;
  const stability = Math.max(0, 100 - (coefficientOfVariation * 100));

  // Calculate growth rate
  const growthRate = calculateTrendPercentage(monthlyAmounts);

  // Reliability based on consistency and expected vs actual
  const expectedMonthly = incomeSource.netAmount;
  const actualVsExpected = expectedMonthly > 0 ? (averageMonthly / expectedMonthly) : 1;
  const reliability = Math.min(100, stability * 0.7 + (Math.min(actualVsExpected, 1) * 30));

  return {
    sourceId: incomeSource.id,
    stability,
    growthRate,
    variability: coefficientOfVariation,
    reliability,
  };
};

/**
 * Generates comprehensive funding analysis for a budget pod
 */
export const generatePodFundingAnalysis = (
  pod: BudgetPod,
  transactions: Transaction[],
  incomeSources: IncomeSource[]
): PodFundingAnalysis => {
  const spendingPattern = analyzeSpendingPattern(pod.id, transactions);
  const incomeReliability = incomeSources
    .filter(source => source.isActive)
    .reduce((sum, source) => {
      const pattern = analyzeIncomePattern(source, transactions);
      return sum + pattern.reliability;
    }, 0) / Math.max(incomeSources.filter(s => s.isActive).length, 1);

  // Calculate current utilization
  const currentUtilization = pod.monthlyAmount > 0 ? 
    (pod.currentAmount / pod.monthlyAmount) * 100 : 0;

  // Generate reasoning
  const reasoning: string[] = [];
  
  if (spendingPattern.trend === 'increasing') {
    reasoning.push(`Spending trend is increasing by ~${(spendingPattern.variance / spendingPattern.monthlyAverage * 100).toFixed(1)}% monthly`);
  }
  
  if (currentUtilization > 90) {
    reasoning.push('Pod is heavily utilized, consider increasing allocation');
  } else if (currentUtilization < 50) {
    reasoning.push('Pod is underutilized, funds could be reallocated');
  }
  
  if (spendingPattern.consistency < 70) {
    reasoning.push('Inconsistent spending pattern detected, monitor closely');
  }

  // Calculate recommended funding
  let recommendedFunding = spendingPattern.monthlyAverage;
  
  // Adjust for trend
  if (spendingPattern.trend === 'increasing') {
    recommendedFunding *= 1.15; // 15% buffer for increasing trend
  } else if (spendingPattern.trend === 'decreasing') {
    recommendedFunding *= 0.95; // 5% reduction for decreasing trend
  } else {
    recommendedFunding *= 1.1; // 10% buffer for stable spending
  }

  // Adjust for variance (higher variance = more buffer needed)
  const varianceMultiplier = 1 + (Math.sqrt(spendingPattern.variance) / spendingPattern.monthlyAverage * 0.5);
  recommendedFunding *= Math.min(varianceMultiplier, 1.5); // Cap at 50% increase

  // Risk assessment
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (currentUtilization > 85 && spendingPattern.trend === 'increasing') {
    riskLevel = 'high';
  } else if (currentUtilization > 75 || spendingPattern.consistency < 60) {
    riskLevel = 'medium';
  }

  // Confidence based on data quality and patterns
  const dataQuality = Math.min(100, (transactions.length / 12) * 100); // Prefer 12+ data points
  const patternClarity = spendingPattern.consistency;
  const confidence = Math.round((dataQuality * 0.4) + (patternClarity * 0.6));

  return {
    podId: pod.id,
    currentUtilization,
    averageMonthlySpend: spendingPattern.monthlyAverage,
    spendingTrend: spendingPattern.trend,
    seasonalPatterns: spendingPattern.seasonality.length > 0 ? 
      spendingPattern.seasonality.map((value, index) => ({
        month: index + 1,
        averageSpend: value,
        variance: spendingPattern.variance,
      })) : undefined,
    recommendedFunding: Math.round(recommendedFunding),
    confidence,
    reasoning,
    riskLevel,
    lastAnalyzed: new Date().toISOString(),
  };
};

/**
 * Generates intelligent funding suggestions based on analysis
 */
export const generateFundingSuggestions = (
  budgetPods: BudgetPod[],
  podAnalyses: PodFundingAnalysis[],
  incomeSources: IncomeSource[],
  transactions: Transaction[]
): FundingSuggestion[] => {
  const suggestions: FundingSuggestion[] = [];
  const totalAvailableIncome = incomeSources
    .filter(source => source.isActive)
    .reduce((sum, source) => sum + source.netAmount, 0);

  podAnalyses.forEach((analysis) => {
    const pod = budgetPods.find(p => p.id === analysis.podId);
    if (!pod) return;

    const currentAmount = pod.monthlyAmount;
    const recommendedAmount = analysis.recommendedFunding;
    const difference = recommendedAmount - currentAmount;
    const percentageDifference = currentAmount > 0 ? (difference / currentAmount) * 100 : 0;

    // Skip if difference is minimal
    if (Math.abs(percentageDifference) < 5) return;

    let suggestionType: FundingSuggestion['suggestionType'] = 'maintain';
    let priority: FundingSuggestion['priority'] = 'low';
    let reasonCode: FundingSuggestion['reasonCode'] = 'trending_up';

    // Determine suggestion type and priority
    if (difference > 0) {
      suggestionType = 'increase';
      if (analysis.currentUtilization > 85 && analysis.spendingTrend === 'increasing') {
        priority = 'critical';
        reasonCode = 'overspent';
      } else if (analysis.spendingTrend === 'increasing') {
        priority = 'high';
        reasonCode = 'trending_up';
      } else {
        priority = 'medium';
      }
    } else {
      suggestionType = 'decrease';
      if (analysis.currentUtilization < 30) {
        priority = 'medium';
        reasonCode = 'underutilized';
      } else if (analysis.spendingTrend === 'decreasing') {
        priority = 'low';
        reasonCode = 'trending_down';
      }
    }

    // Generate title and description
    const title = `${suggestionType === 'increase' ? 'Increase' : 'Decrease'} ${pod.name} funding`;
    const description = generateSuggestionDescription(suggestionType, analysis, pod);

    // Calculate impact analysis
    const monthlySavings = suggestionType === 'decrease' ? Math.abs(difference) : 0;
    const utilizationOptimization = Math.abs(75 - analysis.currentUtilization); // Target 75% utilization

    const suggestion: FundingSuggestion = {
      id: `suggestion-${pod.id}-${Date.now()}`,
      podId: pod.id,
      suggestionType,
      priority,
      currentAmount,
      suggestedAmount: Math.round(recommendedAmount),
      monthlyImpact: difference,
      reasonCode,
      title,
      description,
      impactAnalysis: {
        monthlySavings,
        riskReduction: analysis.riskLevel === 'high' ? 25 : 0,
        utilizationOptimization,
      },
      implementation: {
        effectiveDate: getNextMonthStart(),
        autoApply: Math.abs(difference) < 50 && priority === 'low',
        requiresReview: priority === 'critical' || Math.abs(difference) > 200,
        rollbackAfter: priority === 'low' ? 30 : undefined,
      },
      supportingData: {
        historicalSpend: [analysis.averageMonthlySpend],
        projectedSpend: [recommendedAmount],
        confidence: analysis.confidence,
        dataPoints: transactions.filter(t => t.budgetPodId === pod.id).length,
      },
      createdDate: new Date().toISOString(),
      status: 'pending',
    };

    suggestions.push(suggestion);
  });

  // Sort by priority and impact
  return suggestions.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const priorityCompare = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityCompare !== 0) return priorityCompare;
    
    return Math.abs(b.monthlyImpact) - Math.abs(a.monthlyImpact);
  });
};

/**
 * Calculates comprehensive dashboard metrics
 */
export const calculateDashboardMetrics = (
  budgetPods: BudgetPod[],
  podAnalyses: PodFundingAnalysis[],
  fundingSuggestions: FundingSuggestion[],
  automationRules: FundingAutomationRule[]
): PodFundingDashboardMetrics => {
  const totalBudgetAmount = budgetPods.reduce((sum, pod) => sum + pod.monthlyAmount, 0);
  const totalUtilized = budgetPods.reduce((sum, pod) => sum + pod.currentAmount, 0);
  const averageUtilization = budgetPods.length > 0 ?
    budgetPods.reduce((sum, pod) => {
      const utilization = pod.monthlyAmount > 0 ? (pod.currentAmount / pod.monthlyAmount) * 100 : 0;
      return sum + utilization;
    }, 0) / budgetPods.length : 0;

  const pendingSuggestions = fundingSuggestions.filter(s => s.status === 'pending').length;
  const potentialSavings = fundingSuggestions
    .filter(s => s.status === 'pending' && s.suggestionType === 'decrease')
    .reduce((sum, s) => sum + Math.abs(s.monthlyImpact), 0);

  const riskReduction = fundingSuggestions
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + (s.impactAnalysis.riskReduction || 0), 0);

  const activeRules = automationRules.filter(r => r.isActive).length;

  // Calculate trends based on analysis
  const highUtilizationPods = podAnalyses.filter(a => a.currentUtilization > 80).length;
  const increasingTrendPods = podAnalyses.filter(a => a.spendingTrend === 'increasing').length;
  
  let utilizationTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (highUtilizationPods > budgetPods.length * 0.3) {
    utilizationTrend = 'declining';
  } else if (averageUtilization > 60 && averageUtilization < 80) {
    utilizationTrend = 'improving';
  }

  const spendingEfficiency = Math.min(100, Math.max(0, 100 - (increasingTrendPods / budgetPods.length * 50)));
  const budgetOptimization = Math.min(100, (podAnalyses.reduce((sum, a) => sum + a.confidence, 0) / podAnalyses.length) || 75);

  return {
    totalPods: budgetPods.length,
    totalBudgetAmount,
    totalUtilized,
    averageUtilization,
    pendingSuggestions,
    potentialSavings,
    riskReduction,
    activeRules,
    autoApprovedThisMonth: 0, // TODO: Track from history
    manualReviewRequired: fundingSuggestions.filter(s => s.implementation.requiresReview).length,
    utilizationTrend,
    spendingEfficiency,
    budgetOptimization,
  };
};

// Helper Functions

function calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const n = values.length;
  const sumX = (n * (n + 1)) / 2;
  const sumY = values.reduce((sum, val) => sum + val, 0);
  const sumXY = values.reduce((sum, val, index) => sum + val * (index + 1), 0);
  const sumXX = (n * (n + 1) * (2 * n + 1)) / 6;
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  if (Math.abs(slope) < 0.1) return 'stable';
  return slope > 0 ? 'increasing' : 'decreasing';
}

function calculateTrendPercentage(values: number[]): number {
  if (values.length < 2) return 0;
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.ceil(values.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  
  return firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
}

function calculateSeasonality(monthlyValues: number[]): number[] {
  // Simple seasonality calculation - would need more sophisticated analysis for production
  if (monthlyValues.length < 12) return [];
  
  // Group by month (assuming monthly data)
  const seasonalPattern: number[] = new Array(12).fill(0);
  const counts: number[] = new Array(12).fill(0);
  
  monthlyValues.forEach((value, index) => {
    const monthIndex = index % 12;
    seasonalPattern[monthIndex] += value;
    counts[monthIndex]++;
  });
  
  return seasonalPattern.map((sum, index) => 
    counts[index] > 0 ? sum / counts[index] : 0
  );
}

function generateSuggestionDescription(
  suggestionType: FundingSuggestion['suggestionType'],
  analysis: PodFundingAnalysis,
  pod: BudgetPod
): string {
  const utilizationText = `Currently at ${analysis.currentUtilization.toFixed(1)}% utilization`;
  const trendText = analysis.spendingTrend === 'increasing' ? 'with increasing spending trend' :
                   analysis.spendingTrend === 'decreasing' ? 'with decreasing spending trend' :
                   'with stable spending pattern';
  
  if (suggestionType === 'increase') {
    return `${utilizationText} ${trendText}. Recommend increasing allocation to prevent overspending.`;
  } else {
    return `${utilizationText} ${trendText}. Consider reducing allocation to optimize budget efficiency.`;
  }
}

function getNextMonthStart(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}