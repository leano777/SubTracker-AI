/**
 * Intelligence Service - Smart Subscription Management & Recommendations
 * Provides AI-powered insights, duplicate detection, and intelligent recommendations
 */

import { differenceInDays, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import type { FullSubscription, FullPaymentCard } from '@/types/subscription';

export interface SmartRecommendation {
  id: string;
  type: 'duplicate' | 'cost_optimization' | 'usage_concern' | 'price_increase' | 'better_plan' | 'seasonal_cancel';
  title: string;
  description: string;
  subscriptionId: string;
  subscriptionName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  potentialSavings?: number;
  confidence: number; // 0-1 scale
  actionType: 'cancel' | 'upgrade' | 'downgrade' | 'review' | 'merge' | 'monitor';
  actionText: string;
  metadata: {
    relatedSubscriptions?: string[];
    alternativeSuggestions?: string[];
    reasonDetails?: string[];
    evidence?: any[];
  };
  createdAt: string;
  dismissedAt?: string;
  actedUponAt?: string;
}

export interface DuplicateDetection {
  id: string;
  subscriptions: FullSubscription[];
  type: 'exact' | 'similar' | 'category_overlap';
  confidence: number;
  potentialSavings: number;
  recommendation: string;
  details: {
    nameSimilarity: number;
    categorySimilarity: number;
    functionalOverlap: string[];
  };
}

export interface PriceTracking {
  subscriptionId: string;
  subscriptionName: string;
  currentPrice: number;
  historicalPrices: {
    date: string;
    price: number;
    planType?: string;
    source: 'user_input' | 'detected' | 'external_api';
  }[];
  priceChanges: {
    date: string;
    oldPrice: number;
    newPrice: number;
    changePercent: number;
    changeType: 'increase' | 'decrease';
    notified: boolean;
  }[];
  lastChecked: string;
}

export interface UsageInsight {
  subscriptionId: string;
  subscriptionName: string;
  estimatedUsage: 'heavy' | 'moderate' | 'light' | 'unused';
  confidence: number;
  indicators: {
    loginFrequency?: 'daily' | 'weekly' | 'monthly' | 'rarely';
    featureUtilization?: 'full' | 'partial' | 'minimal';
    timeSpentDaily?: number; // minutes
    lastActivity?: string;
  };
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high'; // Risk of being unnecessary
}

export interface BudgetAlert {
  id: string;
  type: 'overspending' | 'upcoming_large_payment' | 'budget_exceeded' | 'unusual_activity';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  category?: string;
  affectedSubscriptions: string[];
  suggestedActions: string[];
  triggerAmount?: number;
  budgetAmount?: number;
  createdAt: string;
  resolvedAt?: string;
}

class IntelligenceService {
  private readonly SIMILARITY_THRESHOLD = 0.7;
  private readonly CATEGORY_OVERLAP_THRESHOLD = 0.8;
  private readonly PRICE_INCREASE_THRESHOLD = 0.1; // 10%
  
  /**
   * Generate smart recommendations for all subscriptions
   */
  generateRecommendations(
    subscriptions: FullSubscription[],
    paymentCards: FullPaymentCard[]
  ): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    // Duplicate detection
    const duplicates = this.detectDuplicates(subscriptions);
    duplicates.forEach(duplicate => {
      recommendations.push(this.createDuplicateRecommendation(duplicate));
    });
    
    // Cost optimization
    const costOptimizations = this.analyzeCostOptimization(subscriptions);
    recommendations.push(...costOptimizations);
    
    // Usage analysis
    const usageRecommendations = this.analyzeUsagePatterns(subscriptions);
    recommendations.push(...usageRecommendations);
    
    // Price increase alerts
    const priceAlerts = this.checkPriceIncreases(subscriptions);
    recommendations.push(...priceAlerts);
    
    // Seasonal recommendations
    const seasonalRecs = this.generateSeasonalRecommendations(subscriptions);
    recommendations.push(...seasonalRecs);
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
  
  /**
   * Detect duplicate or similar subscriptions
   */
  detectDuplicates(subscriptions: FullSubscription[]): DuplicateDetection[] {
    const duplicates: DuplicateDetection[] = [];
    const processed = new Set<string>();
    
    for (let i = 0; i < subscriptions.length; i++) {
      if (processed.has(subscriptions[i].id)) continue;
      
      const similar: FullSubscription[] = [subscriptions[i]];
      let bestSimilarity = { overall: 0, name: 0, category: 0, functionalOverlap: [] as string[] };
      
      for (let j = i + 1; j < subscriptions.length; j++) {
        if (processed.has(subscriptions[j].id)) continue;
        
        const similarity = this.calculateSubscriptionSimilarity(
          subscriptions[i],
          subscriptions[j]
        );
        
        if (similarity.overall > this.SIMILARITY_THRESHOLD) {
          similar.push(subscriptions[j]);
          processed.add(subscriptions[j].id);
          
          // Keep track of the best similarity for metadata
          if (similarity.overall > bestSimilarity.overall) {
            bestSimilarity = similarity;
          }
        }
      }
      
      if (similar.length > 1) {
        const totalCost = similar.reduce((sum, sub) => sum + this.getMonthlyEquivalent(sub), 0);
        const cheapestCost = Math.min(...similar.map(sub => this.getMonthlyEquivalent(sub)));
        
        duplicates.push({
          id: `duplicate-${Date.now()}-${i}`,
          subscriptions: similar,
          type: bestSimilarity.overall > 0.9 ? 'exact' : 'similar',
          confidence: bestSimilarity.overall,
          potentialSavings: totalCost - cheapestCost,
          recommendation: this.generateDuplicateRecommendation(similar),
          details: {
            nameSimilarity: bestSimilarity.name,
            categorySimilarity: bestSimilarity.category,
            functionalOverlap: bestSimilarity.functionalOverlap,
          },
        });
      }
      
      processed.add(subscriptions[i].id);
    }
    
    return duplicates;
  }
  
  /**
   * Track price changes for subscriptions
   */
  trackPriceChanges(
    subscriptions: FullSubscription[],
    historicalData: PriceTracking[] = []
  ): PriceTracking[] {
    const priceTrackingData: PriceTracking[] = [];
    
    subscriptions.forEach(sub => {
      const existingTracking = historicalData.find(h => h.subscriptionId === sub.id);
      const currentPrice = sub.cost || sub.price;
      
      if (existingTracking) {
        const lastPrice = existingTracking.currentPrice;
        let updatedTracking = { ...existingTracking };
        
        if (currentPrice !== lastPrice) {
          // Price change detected
          const changePercent = ((currentPrice - lastPrice) / lastPrice) * 100;
          
          updatedTracking.priceChanges.push({
            date: new Date().toISOString(),
            oldPrice: lastPrice,
            newPrice: currentPrice,
            changePercent,
            changeType: currentPrice > lastPrice ? 'increase' : 'decrease',
            notified: false,
          });
          
          updatedTracking.historicalPrices.push({
            date: new Date().toISOString(),
            price: currentPrice,
            planType: sub.planType,
            source: 'detected',
          });
          
          updatedTracking.currentPrice = currentPrice;
        }
        
        updatedTracking.lastChecked = new Date().toISOString();
        priceTrackingData.push(updatedTracking);
      } else {
        // New subscription to track
        priceTrackingData.push({
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          currentPrice,
          historicalPrices: [{
            date: sub.dateAdded || new Date().toISOString(),
            price: currentPrice,
            planType: sub.planType,
            source: 'user_input',
          }],
          priceChanges: [],
          lastChecked: new Date().toISOString(),
        });
      }
    });
    
    return priceTrackingData;
  }
  
  /**
   * Generate intelligent budget alerts
   */
  generateBudgetAlerts(
    subscriptions: FullSubscription[],
    monthlyBudget?: number,
    categoryBudgets?: { [category: string]: number }
  ): BudgetAlert[] {
    const alerts: BudgetAlert[] = [];
    const now = new Date();
    
    // Overall budget check
    if (monthlyBudget) {
      const totalMonthlySpend = subscriptions
        .filter(sub => sub.status === 'active')
        .reduce((sum, sub) => sum + this.getMonthlyEquivalent(sub), 0);
      
      if (totalMonthlySpend > monthlyBudget) {
        alerts.push({
          id: `budget-exceeded-${Date.now()}`,
          type: 'budget_exceeded',
          severity: totalMonthlySpend > monthlyBudget * 1.2 ? 'critical' : 'warning',
          title: 'Monthly Budget Exceeded',
          message: `Your subscriptions cost $${totalMonthlySpend.toFixed(2)}/month, which is $${(totalMonthlySpend - monthlyBudget).toFixed(2)} over your $${monthlyBudget} budget.`,
          affectedSubscriptions: subscriptions.filter(sub => sub.status === 'active').map(sub => sub.id),
          suggestedActions: [
            'Review and cancel unused subscriptions',
            'Look for cheaper alternatives',
            'Consider annual billing for discounts',
          ],
          triggerAmount: totalMonthlySpend,
          budgetAmount: monthlyBudget,
          createdAt: now.toISOString(),
        });
      }
    }
    
    // Upcoming large payments
    const upcomingPayments = subscriptions
      .filter(sub => sub.status === 'active' && sub.nextPayment)
      .map(sub => ({
        subscription: sub,
        daysUntil: differenceInDays(parseISO(sub.nextPayment), now),
        amount: sub.cost || sub.price,
      }))
      .filter(payment => payment.daysUntil <= 7 && payment.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil);
    
    const largePayments = upcomingPayments.filter(payment => payment.amount > 50);
    
    if (largePayments.length > 0) {
      alerts.push({
        id: `large-payments-${Date.now()}`,
        type: 'upcoming_large_payment',
        severity: largePayments.some(p => p.amount > 200) ? 'warning' : 'info',
        title: 'Large Payments Coming Soon',
        message: `You have ${largePayments.length} subscription payments over $50 due in the next 7 days, totaling $${largePayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}.`,
        affectedSubscriptions: largePayments.map(p => p.subscription.id),
        suggestedActions: [
          'Ensure sufficient funds are available',
          'Consider spreading payments throughout the month',
          'Review if all services are still needed',
        ],
        createdAt: now.toISOString(),
      });
    }
    
    return alerts;
  }
  
  /**
   * Calculate similarity between two subscriptions
   */
  private calculateSubscriptionSimilarity(
    sub1: FullSubscription,
    sub2: FullSubscription
  ): {
    overall: number;
    name: number;
    category: number;
    functionalOverlap: string[];
  } {
    // Name similarity
    const name1 = sub1.name.toLowerCase().trim();
    const name2 = sub2.name.toLowerCase().trim();
    const nameSimilarity = this.calculateStringSimilarity(name1, name2);
    
    // Category similarity
    const category1 = sub1.category?.toLowerCase() || '';
    const category2 = sub2.category?.toLowerCase() || '';
    const categorySimilarity = category1 === category2 ? 1 : 0;
    
    // Functional overlap detection
    const functionalOverlap = this.detectFunctionalOverlap(sub1, sub2);
    const overlapScore = functionalOverlap.length > 0 ? 0.8 : 0;
    
    // Overall similarity calculation
    const overall = (nameSimilarity * 0.4 + categorySimilarity * 0.3 + overlapScore * 0.3);
    
    return {
      overall,
      name: nameSimilarity,
      category: categorySimilarity,
      functionalOverlap,
    };
  }
  
  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;
    
    return 1 - matrix[str2.length][str1.length] / maxLength;
  }
  
  /**
   * Detect functional overlap between subscriptions
   */
  private detectFunctionalOverlap(sub1: FullSubscription, sub2: FullSubscription): string[] {
    const overlap: string[] = [];
    
    // Common service patterns
    const servicePatterns = [
      { keywords: ['cloud', 'storage', 'drive', 'dropbox', 'onedrive'], service: 'cloud_storage' },
      { keywords: ['video', 'streaming', 'netflix', 'hulu', 'disney'], service: 'video_streaming' },
      { keywords: ['music', 'spotify', 'apple music', 'youtube music'], service: 'music_streaming' },
      { keywords: ['email', 'gmail', 'outlook', 'protonmail'], service: 'email' },
      { keywords: ['password', 'manager', '1password', 'lastpass'], service: 'password_management' },
      { keywords: ['vpn', 'nordvpn', 'expressvpn', 'surfshark'], service: 'vpn' },
      { keywords: ['design', 'figma', 'sketch', 'adobe'], service: 'design_tools' },
    ];
    
    const name1 = sub1.name.toLowerCase();
    const name2 = sub2.name.toLowerCase();
    
    servicePatterns.forEach(pattern => {
      const matches1 = pattern.keywords.some(keyword => name1.includes(keyword));
      const matches2 = pattern.keywords.some(keyword => name2.includes(keyword));
      
      if (matches1 && matches2) {
        overlap.push(pattern.service);
      }
    });
    
    return overlap;
  }
  
  /**
   * Analyze cost optimization opportunities
   */
  private analyzeCostOptimization(subscriptions: FullSubscription[]): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    subscriptions.forEach(sub => {
      if (sub.status !== 'active') return;
      
      // Annual billing optimization
      if (sub.frequency === 'monthly' && this.getMonthlyEquivalent(sub) > 10) {
        const annualSavings = this.estimateAnnualBillingSavings(sub);
        if (annualSavings > 0) {
          recommendations.push({
            id: `annual-billing-${sub.id}`,
            type: 'cost_optimization',
            title: 'Switch to Annual Billing',
            description: `Save approximately $${annualSavings.toFixed(2)}/year by switching to annual billing.`,
            subscriptionId: sub.id,
            subscriptionName: sub.name,
            priority: annualSavings > 50 ? 'high' : 'medium',
            potentialSavings: annualSavings,
            confidence: 0.8,
            actionType: 'upgrade',
            actionText: 'Switch to Annual Plan',
            metadata: {
              reasonDetails: [
                `Current monthly cost: $${(sub.cost || sub.price).toFixed(2)}`,
                `Estimated annual savings: $${annualSavings.toFixed(2)}`,
                'Most services offer 10-20% discounts for annual billing',
              ],
            },
            createdAt: new Date().toISOString(),
          });
        }
      }
      
      // High cost review
      const monthlyCost = this.getMonthlyEquivalent(sub);
      if (monthlyCost > 50) {
        recommendations.push({
          id: `high-cost-review-${sub.id}`,
          type: 'cost_optimization',
          title: 'High-Cost Subscription Review',
          description: `This subscription costs $${monthlyCost.toFixed(2)}/month. Consider if all features are being used.`,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          priority: monthlyCost > 100 ? 'high' : 'medium',
          confidence: 0.6,
          actionType: 'review',
          actionText: 'Review Usage',
          metadata: {
            reasonDetails: [
              'High monthly cost detected',
              'Review if all premium features are needed',
              'Consider downgrading to a lower tier',
            ],
          },
          createdAt: new Date().toISOString(),
        });
      }
    });
    
    return recommendations;
  }
  
  /**
   * Analyze usage patterns and generate recommendations
   */
  private analyzeUsagePatterns(subscriptions: FullSubscription[]): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    // This would typically integrate with actual usage data
    // For now, we'll use heuristics based on subscription age and cost
    
    subscriptions.forEach(sub => {
      if (sub.status !== 'active') return;
      
      const daysSinceAdded = sub.dateAdded 
        ? differenceInDays(new Date(), parseISO(sub.dateAdded))
        : 0;
      
      // Long-unused subscriptions
      if (daysSinceAdded > 90) {
        const monthlyCost = this.getMonthlyEquivalent(sub);
        recommendations.push({
          id: `unused-review-${sub.id}`,
          type: 'usage_concern',
          title: 'Long-Running Subscription',
          description: `This subscription has been active for ${Math.floor(daysSinceAdded / 30)} months. Review if it's still needed.`,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          priority: monthlyCost > 20 ? 'medium' : 'low',
          potentialSavings: monthlyCost * 12,
          confidence: 0.5,
          actionType: 'review',
          actionText: 'Review Usage',
          metadata: {
            reasonDetails: [
              `Active for ${Math.floor(daysSinceAdded / 30)} months`,
              'Consider if features are still being used',
              'Cancel if no longer needed',
            ],
          },
          createdAt: new Date().toISOString(),
        });
      }
    });
    
    return recommendations;
  }
  
  /**
   * Check for price increases
   */
  private checkPriceIncreases(subscriptions: FullSubscription[]): SmartRecommendation[] {
    // This would typically compare against stored historical prices
    // For now, we'll generate alerts for any variable pricing subscriptions
    
    return subscriptions
      .filter(sub => sub.variablePricing?.upcomingChanges?.length)
      .map(sub => {
        const changes = sub.variablePricing!.upcomingChanges!;
        const nextChange = changes[0];
        const currentCost = sub.cost || sub.price;
        const increase = nextChange.cost - currentCost;
        const increasePercent = (increase / currentCost) * 100;
        
        return {
          id: `price-increase-${sub.id}`,
          type: 'price_increase' as const,
          title: 'Price Increase Alert',
          description: `${sub.name} will increase by $${increase.toFixed(2)} (${increasePercent.toFixed(1)}%) on ${nextChange.date}.`,
          subscriptionId: sub.id,
          subscriptionName: sub.name,
          priority: increasePercent > 20 ? 'high' : 'medium' as const,
          confidence: 0.9,
          actionType: 'review' as const,
          actionText: 'Review Options',
          metadata: {
            reasonDetails: [
              `Price increasing from $${currentCost} to $${nextChange.cost}`,
              `Increase of ${increasePercent.toFixed(1)}%`,
              nextChange.description || 'No reason provided',
            ],
          },
          createdAt: new Date().toISOString(),
        };
      });
  }
  
  /**
   * Generate seasonal recommendations
   */
  private generateSeasonalRecommendations(subscriptions: FullSubscription[]): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    const now = new Date();
    const month = now.getMonth();
    
    // Holiday season optimization (Nov-Dec)
    if (month >= 10) {
      const entertainmentSubs = subscriptions.filter(sub => 
        sub.category?.toLowerCase().includes('entertainment') && sub.status === 'active'
      );
      
      if (entertainmentSubs.length > 2) {
        const totalCost = entertainmentSubs.reduce((sum, sub) => sum + this.getMonthlyEquivalent(sub), 0);
        
        recommendations.push({
          id: `seasonal-entertainment-${Date.now()}`,
          type: 'seasonal_cancel',
          title: 'Holiday Season: Review Entertainment Subscriptions',
          description: `Consider temporarily pausing some entertainment subscriptions during the busy holiday season. Potential savings: $${totalCost.toFixed(2)}/month.`,
          subscriptionId: entertainmentSubs[0].id,
          subscriptionName: 'Entertainment Subscriptions',
          priority: 'low',
          potentialSavings: totalCost,
          confidence: 0.4,
          actionType: 'review',
          actionText: 'Review All',
          metadata: {
            relatedSubscriptions: entertainmentSubs.map(sub => sub.id),
            reasonDetails: [
              'Holiday season typically means less entertainment consumption',
              'Consider pausing and resuming after holidays',
              `Total potential savings: $${totalCost.toFixed(2)}/month`,
            ],
          },
          createdAt: new Date().toISOString(),
        });
      }
    }
    
    return recommendations;
  }
  
  /**
   * Create duplicate recommendation
   */
  private createDuplicateRecommendation(duplicate: DuplicateDetection): SmartRecommendation {
    const cheapest = duplicate.subscriptions.reduce((min, sub) => 
      this.getMonthlyEquivalent(sub) < this.getMonthlyEquivalent(min) ? sub : min
    );
    
    return {
      id: `duplicate-rec-${duplicate.id}`,
      type: 'duplicate',
      title: 'Duplicate Services Detected',
      description: `You have ${duplicate.subscriptions.length} similar services. Keep ${cheapest.name} and save $${duplicate.potentialSavings.toFixed(2)}/month.`,
      subscriptionId: cheapest.id,
      subscriptionName: duplicate.subscriptions.map(s => s.name).join(', '),
      priority: duplicate.potentialSavings > 30 ? 'high' : duplicate.potentialSavings > 10 ? 'medium' : 'low',
      potentialSavings: duplicate.potentialSavings,
      confidence: duplicate.confidence,
      actionType: 'merge',
      actionText: 'Review Duplicates',
      metadata: {
        relatedSubscriptions: duplicate.subscriptions.map(sub => sub.id),
        reasonDetails: [
          `${duplicate.confidence > 0.9 ? 'Exact' : 'Similar'} services detected`,
          `Functional overlap: ${duplicate.details.functionalOverlap.join(', ')}`,
          `Recommended to keep: ${cheapest.name}`,
        ],
      },
      createdAt: new Date().toISOString(),
    };
  }
  
  /**
   * Generate duplicate recommendation text
   */
  private generateDuplicateRecommendation(subscriptions: FullSubscription[]): string {
    if (subscriptions.length === 2) {
      const cheaper = subscriptions.reduce((min, sub) => 
        this.getMonthlyEquivalent(sub) < this.getMonthlyEquivalent(min) ? sub : min
      );
      return `Consider keeping ${cheaper.name} as it's the most cost-effective option.`;
    }
    
    return `Consider consolidating these ${subscriptions.length} similar services to save money.`;
  }
  
  /**
   * Estimate annual billing savings
   */
  private estimateAnnualBillingSavings(subscription: FullSubscription): number {
    // Most services offer 10-20% discount for annual billing
    const monthlyAmount = this.getMonthlyEquivalent(subscription);
    const estimatedDiscount = 0.15; // 15% average discount
    return monthlyAmount * 12 * estimatedDiscount;
  }
  
  /**
   * Get monthly equivalent cost
   */
  private getMonthlyEquivalent(subscription: FullSubscription): number {
    const cost = subscription.cost || subscription.price;
    const frequency = subscription.frequency || subscription.billingCycle;
    
    switch (frequency) {
      case 'yearly':
        return cost / 12;
      case 'quarterly':
        return cost / 3;
      case 'weekly':
        return cost * 4.33;
      case 'daily':
        return cost * 30;
      default:
        return cost;
    }
  }
}

export const intelligenceService = new IntelligenceService();
export default intelligenceService;