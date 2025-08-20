/**
 * User Setup Service
 * Handles new user onboarding and data initialization
 */

import { supabase } from '@/utils/supabase/client';
import type { FullSubscription, FullPaymentCard } from '@/types/subscription';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  monthly_budget?: number;
  currency: string;
  timezone: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingData {
  name: string;
  monthlyBudget?: number;
  primaryPaymentMethods: {
    nickname: string;
    lastFour: string;
    type: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other' | 'credit' | 'debit';
    isDefault: boolean;
  }[];
  existingSubscriptions: {
    name: string;
    cost: number;
    billingCycle: 'monthly' | 'yearly' | 'quarterly' | 'weekly' | 'variable';
    category: string;
    nextPayment?: string;
  }[];
  preferences: {
    notifications: boolean;
    smartRecommendations: boolean;
    priceAlerts: boolean;
    budgetAlerts: boolean;
  };
}

export interface QuickStartTemplate {
  id: string;
  name: string;
  description: string;
  subscriptions: Partial<FullSubscription>[];
  paymentCards: Partial<FullPaymentCard>[];
  monthlyBudget: number;
}

class UserSetupService {
  /**
   * Complete user onboarding process
   */
  async completeOnboarding(userId: string, data: OnboardingData): Promise<{ success: boolean; error?: string }> {
    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: data.name,
          monthly_budget: data.monthlyBudget,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
        return { success: false, error: 'Failed to update profile' };
      }

      // Add payment methods
      if (data.primaryPaymentMethods.length > 0) {
        const paymentCards = data.primaryPaymentMethods.map(card => ({
          id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          nickname: card.nickname,
          last_four: card.lastFour,
          type: card.type,
          is_default: card.isDefault,
          created_at: new Date().toISOString(),
        }));

        const { error: cardsError } = await supabase
          .from('payment_cards')
          .insert(paymentCards);

        if (cardsError) {
          console.error('Payment cards error:', cardsError);
          // Continue with setup even if payment cards fail
        }
      }

      // Add initial subscriptions
      if (data.existingSubscriptions.length > 0) {
        const subscriptions = data.existingSubscriptions.map(sub => ({
          id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          name: sub.name,
          cost: sub.cost,
          billing_cycle: sub.billingCycle,
          category: sub.category,
          status: 'active' as const,
          next_payment: sub.nextPayment || this.calculateNextPayment(sub.billingCycle),
          date_added: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }));

        const { error: subsError } = await supabase
          .from('subscriptions')
          .insert(subscriptions);

        if (subsError) {
          console.error('Subscriptions error:', subsError);
          // Continue with setup even if subscriptions fail
        }
      }

      // Save user preferences
      const { error: prefsError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          notifications_enabled: data.preferences.notifications,
          smart_recommendations: data.preferences.smartRecommendations,
          price_alerts: data.preferences.priceAlerts,
          budget_alerts: data.preferences.budgetAlerts,
          created_at: new Date().toISOString(),
        });

      if (prefsError) {
        console.error('Preferences error:', prefsError);
        // Continue even if preferences fail
      }

      return { success: true };
    } catch (error) {
      console.error('Onboarding error:', error);
      return { success: false, error: 'Onboarding failed' };
    }
  }

  /**
   * Get user profile and onboarding status
   */
  async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is ok
        console.error('Profile fetch error:', error);
        return { profile: null, error: 'Failed to fetch profile' };
      }

      return { profile: data };
    } catch (error) {
      console.error('Profile error:', error);
      return { profile: null, error: 'Profile fetch failed' };
    }
  }

  /**
   * Check if user needs onboarding
   */
  async needsOnboarding(userId: string): Promise<boolean> {
    try {
      const { profile } = await this.getUserProfile(userId);
      return !profile?.onboarding_completed;
    } catch (error) {
      console.error('Onboarding check error:', error);
      return true; // Default to needing onboarding
    }
  }

  /**
   * Get quick start templates for common subscription setups
   */
  getQuickStartTemplates(): QuickStartTemplate[] {
    return [
      {
        id: 'student',
        name: 'Student Setup',
        description: 'Common subscriptions for students',
        monthlyBudget: 50,
        subscriptions: [
          { name: 'Spotify Student', cost: 5.99, billingCycle: 'monthly', category: 'Entertainment' },
          { name: 'Netflix', cost: 8.99, billingCycle: 'monthly', category: 'Entertainment' },
          { name: 'iCloud Storage', cost: 0.99, billingCycle: 'monthly', category: 'Utilities & Services' },
        ],
        paymentCards: [
          { nickname: 'Student Card', type: 'visa', isDefault: true },
        ],
      },
      {
        id: 'professional',
        name: 'Professional Setup',
        description: 'Business and productivity tools',
        monthlyBudget: 200,
        subscriptions: [
          { name: 'Microsoft 365', cost: 12.50, billingCycle: 'monthly', category: 'Business Tools' },
          { name: 'Adobe Creative Cloud', cost: 54.99, billingCycle: 'monthly', category: 'Business Tools' },
          { name: 'Zoom Pro', cost: 14.99, billingCycle: 'monthly', category: 'Business Tools' },
          { name: 'Slack Pro', cost: 8.75, billingCycle: 'monthly', category: 'Business Tools' },
        ],
        paymentCards: [
          { nickname: 'Business Card', type: 'amex', isDefault: true },
          { nickname: 'Personal Card', type: 'visa', isDefault: false },
        ],
      },
      {
        id: 'family',
        name: 'Family Setup',
        description: 'Entertainment and family services',
        monthlyBudget: 150,
        subscriptions: [
          { name: 'Disney+ Bundle', cost: 19.99, billingCycle: 'monthly', category: 'Entertainment' },
          { name: 'Amazon Prime', cost: 14.98, billingCycle: 'monthly', category: 'Entertainment' },
          { name: 'Apple iCloud Family', cost: 9.99, billingCycle: 'monthly', category: 'Utilities & Services' },
          { name: 'YouTube Premium Family', cost: 22.99, billingCycle: 'monthly', category: 'Entertainment' },
        ],
        paymentCards: [
          { nickname: 'Family Card', type: 'mastercard', isDefault: true },
        ],
      },
      {
        id: 'minimal',
        name: 'Minimal Setup',
        description: 'Essential services only',
        monthlyBudget: 30,
        subscriptions: [
          { name: 'Netflix Basic', cost: 6.99, billingCycle: 'monthly', category: 'Entertainment' },
          { name: 'Spotify', cost: 10.99, billingCycle: 'monthly', category: 'Entertainment' },
        ],
        paymentCards: [
          { nickname: 'Main Card', type: 'visa', isDefault: true },
        ],
      },
      {
        id: 'custom',
        name: 'Start Fresh',
        description: 'Set up your subscriptions manually',
        monthlyBudget: 100,
        subscriptions: [],
        paymentCards: [],
      },
    ];
  }

  /**
   * Apply a quick start template
   */
  async applyQuickStartTemplate(
    userId: string, 
    templateId: string, 
    customizations?: Partial<OnboardingData>
  ): Promise<{ success: boolean; error?: string }> {
    const template = this.getQuickStartTemplates().find(t => t.id === templateId);
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    const onboardingData: OnboardingData = {
      name: customizations?.name || 'User',
      monthlyBudget: customizations?.monthlyBudget || template.monthlyBudget,
      primaryPaymentMethods: customizations?.primaryPaymentMethods || 
        template.paymentCards.map(card => ({
          nickname: card.nickname || 'Payment Card',
          lastFour: card.lastFour || '0000',
          type: card.type || 'visa',
          isDefault: card.isDefault || false,
        })),
      existingSubscriptions: customizations?.existingSubscriptions ||
        template.subscriptions.map(sub => ({
          name: sub.name || 'Subscription',
          cost: sub.cost || 0,
          billingCycle: sub.billingCycle || 'monthly',
          category: sub.category || 'Other',
        })),
      preferences: customizations?.preferences || {
        notifications: true,
        smartRecommendations: true,
        priceAlerts: true,
        budgetAlerts: true,
      },
    };

    return this.completeOnboarding(userId, onboardingData);
  }

  /**
   * Import subscriptions from bank transaction data
   */
  async importFromTransactions(
    userId: string, 
    transactions: Array<{
      description: string;
      amount: number;
      date: string;
      recurring?: boolean;
    }>
  ): Promise<{ subscriptions: FullSubscription[]; confidence: number }> {
    const potentialSubscriptions: FullSubscription[] = [];
    
    // Common subscription patterns
    const subscriptionPatterns = [
      { pattern: /netflix/i, category: 'Entertainment', name: 'Netflix' },
      { pattern: /spotify/i, category: 'Entertainment', name: 'Spotify' },
      { pattern: /amazon prime/i, category: 'Entertainment', name: 'Amazon Prime' },
      { pattern: /disney/i, category: 'Entertainment', name: 'Disney+' },
      { pattern: /hulu/i, category: 'Entertainment', name: 'Hulu' },
      { pattern: /apple.*music/i, category: 'Entertainment', name: 'Apple Music' },
      { pattern: /youtube.*premium/i, category: 'Entertainment', name: 'YouTube Premium' },
      { pattern: /adobe/i, category: 'Business Tools', name: 'Adobe Creative Cloud' },
      { pattern: /microsoft.*365/i, category: 'Business Tools', name: 'Microsoft 365' },
      { pattern: /google.*one/i, category: 'Utilities & Services', name: 'Google One' },
      { pattern: /icloud/i, category: 'Utilities & Services', name: 'iCloud Storage' },
      { pattern: /dropbox/i, category: 'Utilities & Services', name: 'Dropbox' },
    ];

    // Group transactions by similar descriptions and amounts
    const transactionGroups = new Map<string, typeof transactions>();
    
    transactions.forEach(transaction => {
      const key = `${Math.round(transaction.amount * 100)}-${transaction.description.toLowerCase().replace(/[^a-z]/g, '')}`;
      if (!transactionGroups.has(key)) {
        transactionGroups.set(key, []);
      }
      transactionGroups.get(key)!.push(transaction);
    });

    // Identify recurring payments (3+ transactions with same pattern)
    transactionGroups.forEach((group, key) => {
      if (group.length >= 3) {
        const firstTransaction = group[0];
        let subscriptionName = firstTransaction.description;
        let category = 'Other';

        // Try to match against known patterns
        for (const pattern of subscriptionPatterns) {
          if (pattern.pattern.test(firstTransaction.description)) {
            subscriptionName = pattern.name;
            category = pattern.category;
            break;
          }
        }

        // Calculate billing cycle based on transaction frequency
        const dates = group.map(t => new Date(t.date)).sort();
        const daysBetween = dates.length > 1 ? 
          (dates[1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24) : 30;
        
        let billingCycle: FullSubscription['billingCycle'] = 'monthly';
        let frequency: FullSubscription['frequency'] = 'monthly';
        
        if (daysBetween > 350) {
          billingCycle = 'yearly';
          frequency = 'yearly';
        } else if (daysBetween > 85) {
          billingCycle = 'quarterly';
          frequency = 'quarterly';
        } else if (daysBetween < 10) {
          billingCycle = 'monthly'; // Use monthly for billing, weekly for frequency
          frequency = 'weekly';
        }

        potentialSubscriptions.push({
          id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: subscriptionName,
          cost: firstTransaction.amount,
          price: firstTransaction.amount,
          billingCycle,
          frequency,
          category,
          status: 'active',
          isActive: true,
          nextPayment: this.calculateNextPayment(billingCycle),
          dateAdded: new Date().toISOString(),
        });
      }
    });

    // Calculate confidence score based on pattern matches and frequency
    const totalTransactions = transactions.length;
    const identifiedCount = potentialSubscriptions.length;
    const confidence = totalTransactions > 0 ? Math.min(0.9, identifiedCount / totalTransactions + 0.3) : 0;

    return { subscriptions: potentialSubscriptions, confidence };
  }

  /**
   * Calculate next payment date based on billing cycle
   */
  private calculateNextPayment(billingCycle: string): string {
    const now = new Date();
    let nextPayment = new Date(now);

    switch (billingCycle) {
      case 'weekly':
        nextPayment.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextPayment.setMonth(now.getMonth() + 1);
        break;
      case 'quarterly':
        nextPayment.setMonth(now.getMonth() + 3);
        break;
      case 'yearly':
        nextPayment.setFullYear(now.getFullYear() + 1);
        break;
      case 'variable':
        nextPayment.setMonth(now.getMonth() + 1); // Default to monthly for variable
        break;
      default:
        nextPayment.setMonth(now.getMonth() + 1);
    }

    return nextPayment.toISOString();
  }

  /**
   * Validate subscription data before saving
   */
  validateSubscriptionData(subscription: Partial<FullSubscription>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!subscription.name?.trim()) {
      errors.push('Subscription name is required');
    }

    if (!subscription.cost || subscription.cost <= 0) {
      errors.push('Valid cost is required');
    }

    if (!subscription.billingCycle) {
      errors.push('Billing cycle is required');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get common subscription suggestions based on category
   */
  getSubscriptionSuggestions(category: string): Array<{ name: string; estimatedCost: number }> {
    const suggestions: { [key: string]: Array<{ name: string; estimatedCost: number }> } = {
      'Entertainment': [
        { name: 'Netflix', estimatedCost: 15.99 },
        { name: 'Disney+', estimatedCost: 7.99 },
        { name: 'Spotify', estimatedCost: 10.99 },
        { name: 'Hulu', estimatedCost: 7.99 },
        { name: 'Amazon Prime Video', estimatedCost: 8.99 },
        { name: 'YouTube Premium', estimatedCost: 11.99 },
        { name: 'Apple Music', estimatedCost: 10.99 },
      ],
      'Business Tools': [
        { name: 'Microsoft 365', estimatedCost: 12.50 },
        { name: 'Adobe Creative Cloud', estimatedCost: 54.99 },
        { name: 'Slack', estimatedCost: 8.75 },
        { name: 'Zoom Pro', estimatedCost: 14.99 },
        { name: 'Canva Pro', estimatedCost: 12.99 },
        { name: 'Notion', estimatedCost: 8.00 },
        { name: 'Figma', estimatedCost: 12.00 },
      ],
      'Utilities & Services': [
        { name: 'iCloud Storage', estimatedCost: 2.99 },
        { name: 'Google One', estimatedCost: 1.99 },
        { name: 'Dropbox', estimatedCost: 11.99 },
        { name: 'LastPass', estimatedCost: 3.00 },
        { name: '1Password', estimatedCost: 7.99 },
      ],
      'Health & Fitness': [
        { name: 'MyFitnessPal Premium', estimatedCost: 9.99 },
        { name: 'Headspace', estimatedCost: 12.99 },
        { name: 'Calm', estimatedCost: 14.99 },
        { name: 'Nike Training Club', estimatedCost: 14.99 },
      ],
    };

    return suggestions[category] || [];
  }
}

export const userSetupService = new UserSetupService();
export default userSetupService;