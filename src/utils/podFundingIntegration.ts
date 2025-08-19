import type {
  BudgetPod,
  Transaction,
  IncomeSource,
  PodFundingAnalysis,
  FundingSuggestion,
  FundingAutomationRule
} from '../types/financial';
import {
  generatePodFundingAnalysis,
  generateFundingSuggestions,
  calculateDashboardMetrics
} from './podFundingAlgorithms';

/**
 * Integration utilities for syncing pod funding intelligence with income and transaction systems
 */

interface PodFundingSyncResult {
  updatedAnalyses: PodFundingAnalysis[];
  newSuggestions: FundingSuggestion[];
  triggerRules: FundingAutomationRule[];
}

/**
 * Synchronizes pod funding analyses when transactions are updated
 */
export const syncPodFundingOnTransactionChange = (
  budgetPods: BudgetPod[],
  transactions: Transaction[],
  incomeSources: IncomeSource[],
  automationRules: FundingAutomationRule[],
  changedTransactionPodIds?: string[]
): PodFundingSyncResult => {
  // Determine which pods need analysis updates
  const podsToAnalyze = changedTransactionPodIds 
    ? budgetPods.filter(pod => changedTransactionPodIds.includes(pod.id))
    : budgetPods;

  // Generate fresh analyses for affected pods
  const updatedAnalyses: PodFundingAnalysis[] = podsToAnalyze.map(pod =>
    generatePodFundingAnalysis(pod, transactions, incomeSources)
  );

  // Generate new suggestions based on updated analyses
  const allAnalyses = [
    ...updatedAnalyses,
    // Include existing analyses for pods that weren't changed
    // In a real implementation, you'd pass existing analyses and merge them
  ];

  const newSuggestions = generateFundingSuggestions(
    budgetPods,
    updatedAnalyses,
    incomeSources,
    transactions
  );

  // Check which automation rules should be triggered
  const triggerRules = checkAutomationRuleTriggers(
    updatedAnalyses,
    automationRules
  );

  return {
    updatedAnalyses,
    newSuggestions,
    triggerRules
  };
};

/**
 * Synchronizes pod funding when income sources change
 */
export const syncPodFundingOnIncomeChange = (
  budgetPods: BudgetPod[],
  transactions: Transaction[],
  incomeSources: IncomeSource[],
  existingAnalyses: PodFundingAnalysis[],
  automationRules: FundingAutomationRule[],
  incomeChangePercentage: number
): PodFundingSyncResult => {
  // Regenerate all analyses due to income impact on funding capacity
  const updatedAnalyses = budgetPods.map(pod =>
    generatePodFundingAnalysis(pod, transactions, incomeSources)
  );

  // Generate income-aware funding suggestions
  const newSuggestions = generateFundingSuggestions(
    budgetPods,
    updatedAnalyses,
    incomeSources,
    transactions
  ).map(suggestion => {
    // Adjust suggestions based on income change
    if (incomeChangePercentage > 10) {
      // Significant income increase - suggest higher funding
      return {
        ...suggestion,
        suggestedAmount: Math.round(suggestion.suggestedAmount * (1 + Math.min(incomeChangePercentage / 100, 0.2))),
        reasonCode: 'income_change' as const,
        description: `${suggestion.description} Income increase of ${incomeChangePercentage.toFixed(1)}% allows for higher allocation.`
      };
    } else if (incomeChangePercentage < -10) {
      // Significant income decrease - suggest lower funding
      return {
        ...suggestion,
        suggestedAmount: Math.round(suggestion.suggestedAmount * (1 + Math.max(incomeChangePercentage / 100, -0.15))),
        reasonCode: 'income_change' as const,
        description: `${suggestion.description} Income decrease of ${Math.abs(incomeChangePercentage).toFixed(1)}% requires lower allocation.`
      };
    }
    return suggestion;
  });

  // Check automation rules, especially those triggered by income changes
  const triggerRules = checkAutomationRuleTriggers(
    updatedAnalyses,
    automationRules,
    { incomeChangePercentage }
  );

  return {
    updatedAnalyses,
    newSuggestions,
    triggerRules
  };
};

/**
 * Synchronizes pod funding when budget pods are modified
 */
export const syncPodFundingOnPodChange = (
  budgetPods: BudgetPod[],
  transactions: Transaction[],
  incomeSources: IncomeSource[],
  automationRules: FundingAutomationRule[],
  changedPodIds: string[]
): PodFundingSyncResult => {
  // Analyze only the changed pods
  const updatedAnalyses = budgetPods
    .filter(pod => changedPodIds.includes(pod.id))
    .map(pod => generatePodFundingAnalysis(pod, transactions, incomeSources));

  // Generate suggestions for the affected pods
  const newSuggestions = generateFundingSuggestions(
    budgetPods.filter(pod => changedPodIds.includes(pod.id)),
    updatedAnalyses,
    incomeSources,
    transactions
  );

  // Check if pod changes trigger any automation rules
  const triggerRules = checkAutomationRuleTriggers(
    updatedAnalyses,
    automationRules
  );

  return {
    updatedAnalyses,
    newSuggestions,
    triggerRules
  };
};

/**
 * Checks which automation rules should be triggered based on current analyses
 */
export const checkAutomationRuleTriggers = (
  analyses: PodFundingAnalysis[],
  automationRules: FundingAutomationRule[],
  context?: {
    incomeChangePercentage?: number;
    spendingVariancePercentage?: number;
  }
): FundingAutomationRule[] => {
  const now = new Date();
  const triggered: FundingAutomationRule[] = [];

  for (const rule of automationRules) {
    if (!rule.isActive) continue;

    // Check time interval (simplified - in real implementation, track last execution)
    const shouldCheckTimeInterval = true; // Would check against last execution time

    if (!shouldCheckTimeInterval) continue;

    let shouldTrigger = false;

    // Check utilization threshold triggers
    if (rule.triggers.utilizationThreshold) {
      const relevantAnalyses = analyses.filter(analysis => {
        const podIncluded = rule.scope.includePods.length === 0 || 
          rule.scope.includePods.includes(analysis.podId);
        const podNotExcluded = !rule.scope.excludePods.includes(analysis.podId);
        return podIncluded && podNotExcluded;
      });

      const triggerUtilization = relevantAnalyses.some(analysis => 
        analysis.currentUtilization >= rule.triggers.utilizationThreshold!
      );

      if (triggerUtilization) shouldTrigger = true;
    }

    // Check income change triggers
    if (rule.triggers.incomeChange && context?.incomeChangePercentage) {
      if (Math.abs(context.incomeChangePercentage) >= rule.triggers.incomeChange) {
        shouldTrigger = true;
      }
    }

    // Check spending variance triggers
    if (rule.triggers.spendingVariance && context?.spendingVariancePercentage) {
      if (Math.abs(context.spendingVariancePercentage) >= rule.triggers.spendingVariance) {
        shouldTrigger = true;
      }
    }

    if (shouldTrigger) {
      triggered.push(rule);
    }
  }

  return triggered;
};

/**
 * Calculates the impact of applying a funding suggestion
 */
export const calculateSuggestionImpact = (
  suggestion: FundingSuggestion,
  currentPod: BudgetPod,
  transactions: Transaction[],
  incomeSources: IncomeSource[]
): {
  utilizationChange: number;
  monthlyImpact: number;
  riskChange: number;
  confidence: number;
} => {
  const currentUtilization = currentPod.monthlyAmount > 0 ? 
    (currentPod.currentAmount / currentPod.monthlyAmount) * 100 : 0;
  
  const newUtilization = suggestion.suggestedAmount > 0 ? 
    (currentPod.currentAmount / suggestion.suggestedAmount) * 100 : 0;

  const utilizationChange = newUtilization - currentUtilization;
  const monthlyImpact = suggestion.suggestedAmount - suggestion.currentAmount;

  // Calculate risk change (simplified)
  const riskChange = utilizationChange > 0 ? -10 : 5; // Lower utilization = lower risk

  return {
    utilizationChange,
    monthlyImpact,
    riskChange,
    confidence: suggestion.supportingData.confidence
  };
};

/**
 * Applies automation rule and generates funding adjustments
 */
export const applyAutomationRule = (
  rule: FundingAutomationRule,
  budgetPods: BudgetPod[],
  analyses: PodFundingAnalysis[]
): {
  adjustments: { podId: string; currentAmount: number; newAmount: number; reasoning: string }[];
  requiresReview: boolean;
} => {
  const adjustments: { podId: string; currentAmount: number; newAmount: number; reasoning: string }[] = [];
  let totalAdjustment = 0;
  let requiresReview = false;

  // Filter pods based on rule scope
  const applicablePods = budgetPods.filter(pod => {
    const included = rule.scope.includePods.length === 0 || rule.scope.includePods.includes(pod.id);
    const notExcluded = !rule.scope.excludePods.includes(pod.id);
    return included && notExcluded;
  });

  for (const pod of applicablePods) {
    const analysis = analyses.find(a => a.podId === pod.id);
    if (!analysis) continue;

    let newAmount = pod.monthlyAmount;
    let reasoning = '';

    // Apply adjustment based on rule configuration
    if (rule.actions.adjustmentType === 'percentage') {
      if (analysis.currentUtilization > (rule.triggers.utilizationThreshold || 80)) {
        const adjustmentPercent = Math.min(rule.actions.maxAdjustment, 15) / 100;
        newAmount = Math.round(pod.monthlyAmount * (1 + adjustmentPercent));
        reasoning = `Increased by ${(adjustmentPercent * 100).toFixed(0)}% due to high utilization (${analysis.currentUtilization.toFixed(1)}%)`;
      }
    } else if (rule.actions.adjustmentType === 'fixed_amount') {
      // Fixed amount adjustments
      if (analysis.currentUtilization > (rule.triggers.utilizationThreshold || 80)) {
        newAmount = pod.monthlyAmount + Math.min(rule.actions.maxAdjustment, 100);
        reasoning = `Increased by $${Math.min(rule.actions.maxAdjustment, 100)} due to high utilization`;
      }
    } else if (rule.actions.adjustmentType === 'smart_algorithm') {
      // Smart algorithm uses the recommendation from analysis
      newAmount = analysis.recommendedFunding;
      reasoning = `Smart adjustment based on spending patterns and trends`;
    }

    const adjustmentAmount = Math.abs(newAmount - pod.monthlyAmount);
    
    // Check if adjustment exceeds thresholds
    if (adjustmentAmount >= rule.actions.minReviewThreshold) {
      requiresReview = true;
    }

    // Apply auto-approval limits
    if (adjustmentAmount > rule.actions.autoApprovalLimit) {
      requiresReview = true;
    }

    // Check total adjustment limits
    if (totalAdjustment + adjustmentAmount > rule.scope.maxTotalAdjustment) {
      // Scale down the adjustment to stay within limits
      newAmount = pod.monthlyAmount + Math.min(
        rule.scope.maxTotalAdjustment - totalAdjustment,
        newAmount - pod.monthlyAmount
      );
      reasoning += ` (limited by total adjustment cap)`;
    }

    if (newAmount !== pod.monthlyAmount) {
      adjustments.push({
        podId: pod.id,
        currentAmount: pod.monthlyAmount,
        newAmount: Math.round(newAmount),
        reasoning
      });

      totalAdjustment += Math.abs(newAmount - pod.monthlyAmount);
    }
  }

  return {
    adjustments,
    requiresReview
  };
};

/**
 * Determines if a pod funding analysis needs updating based on recent activity
 */
export const shouldUpdatePodAnalysis = (
  analysis: PodFundingAnalysis,
  transactions: Transaction[],
  maxAgeHours: number = 24
): boolean => {
  const analysisAge = Date.now() - new Date(analysis.lastAnalyzed).getTime();
  const ageInHours = analysisAge / (1000 * 60 * 60);

  if (ageInHours > maxAgeHours) return true;

  // Check if there are new transactions since last analysis
  const recentTransactions = transactions.filter(t => 
    t.budgetPodId === analysis.podId &&
    new Date(t.date) > new Date(analysis.lastAnalyzed)
  );

  return recentTransactions.length > 0;
};