/**
 * Subscription Service - Supabase Data Persistence
 * Handles all subscription-related database operations
 */

import { supabase } from '@/utils/supabase/client';
import type { FullSubscription } from '@/types/subscription';

export interface SubscriptionDB {
  id: string;
  user_id: string;
  payment_card_id?: string;
  name: string;
  cost: number;
  billing_cycle: string;
  next_billing_date?: string;
  status: string;
  category?: string;
  description?: string;
  website_url?: string;
  logo_url?: string;
  color?: string;
  auto_renew: boolean;
  reminder_days: number;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  metadata?: any;
}

class SubscriptionService {
  /**
   * Get all subscriptions for the current user
   */
  async getSubscriptions(): Promise<FullSubscription[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          payment_cards (
            id,
            nickname,
            last_four,
            brand,
            color
          )
        `)
        .eq('user_id', user.id)
        .order('next_billing_date', { ascending: true });

      if (error) throw error;

      // Transform database format to app format
      return (data || []).map(this.transformFromDB);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  }

  /**
   * Get a single subscription by ID
   */
  async getSubscription(id: string): Promise<FullSubscription | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          payment_cards (
            id,
            nickname,
            last_four,
            brand,
            color
          ),
          variable_pricing (
            id,
            date,
            cost,
            description
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.transformFromDB(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(subscription: Partial<FullSubscription>): Promise<FullSubscription | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const dbData = this.transformToDB(subscription);
      dbData.user_id = user.id;

      const { data, error } = await supabase
        .from('subscriptions')
        .insert(dbData)
        .select(`
          *,
          payment_cards (
            id,
            nickname,
            last_four,
            brand,
            color
          )
        `)
        .single();

      if (error) throw error;

      // Handle variable pricing if present
      if (subscription.variablePricing?.upcomingChanges && subscription.variablePricing.upcomingChanges.length > 0) {
        await this.updateVariablePricing(data.id, subscription.variablePricing.upcomingChanges);
      }

      return this.transformFromDB(data);
    } catch (error) {
      console.error('Error creating subscription:', error);
      return null;
    }
  }

  /**
   * Update an existing subscription
   */
  async updateSubscription(id: string, updates: Partial<FullSubscription>): Promise<FullSubscription | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const dbData = this.transformToDB(updates);
      delete dbData.user_id; // Don't update user_id

      const { data, error } = await supabase
        .from('subscriptions')
        .update(dbData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          payment_cards (
            id,
            nickname,
            last_four,
            brand,
            color
          )
        `)
        .single();

      if (error) throw error;

      // Handle variable pricing updates
      if (updates.variablePricing?.upcomingChanges !== undefined) {
        await this.updateVariablePricing(id, updates.variablePricing.upcomingChanges || []);
      }

      return this.transformFromDB(data);
    } catch (error) {
      console.error('Error updating subscription:', error);
      return null;
    }
  }

  /**
   * Delete a subscription
   */
  async deleteSubscription(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting subscription:', error);
      return false;
    }
  }

  /**
   * Cancel a subscription (soft delete)
   */
  async cancelSubscription(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          auto_renew: false
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  }

  /**
   * Pause a subscription
   */
  async pauseSubscription(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'paused',
          auto_renew: false
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error pausing subscription:', error);
      return false;
    }
  }

  /**
   * Resume a paused subscription
   */
  async resumeSubscription(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          auto_renew: true
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      return false;
    }
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('subscriptions')
        .select('cost, billing_cycle, status')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      let monthlyTotal = 0;
      let yearlyTotal = 0;
      let activeCount = 0;

      (data || []).forEach(sub => {
        if (sub.status === 'active') {
          activeCount++;
          const monthlyCost = this.calculateMonthlyCost(sub.cost, sub.billing_cycle);
          monthlyTotal += monthlyCost;
          yearlyTotal += monthlyCost * 12;
        }
      });

      return {
        activeCount,
        monthlyTotal,
        yearlyTotal,
        averageCost: activeCount > 0 ? monthlyTotal / activeCount : 0
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        activeCount: 0,
        monthlyTotal: 0,
        yearlyTotal: 0,
        averageCost: 0
      };
    }
  }

  /**
   * Update variable pricing for a subscription
   */
  private async updateVariablePricing(subscriptionId: string, changes: any[]) {
    try {
      // Delete existing variable pricing
      await supabase
        .from('variable_pricing')
        .delete()
        .eq('subscription_id', subscriptionId);

      // Insert new variable pricing
      if (changes.length > 0) {
        const variablePricing = changes.map(change => ({
          subscription_id: subscriptionId,
          date: change.date,
          cost: change.cost,
          description: change.description
        }));

        await supabase
          .from('variable_pricing')
          .insert(variablePricing);
      }
    } catch (error) {
      console.error('Error updating variable pricing:', error);
    }
  }

  /**
   * Transform database format to app format
   */
  private transformFromDB(dbData: any): FullSubscription {
    return {
      id: dbData.id,
      name: dbData.name,
      price: dbData.cost,
      cost: dbData.cost,
      frequency: dbData.billing_cycle as any,
      billingCycle: dbData.billing_cycle,
      nextPayment: dbData.next_billing_date,
      status: dbData.status || 'active',
      isActive: dbData.status === 'active',
      category: dbData.category,
      description: dbData.description,
      websiteUrl: dbData.website_url,
      logoUrl: dbData.logo_url,
      // color: dbData.color,
      // autoRenew: dbData.auto_renew,
      reminderDays: dbData.reminder_days,
      notes: dbData.notes,
      tags: dbData.tags || [],
      paymentCardId: dbData.payment_card_id,
      paymentCard: dbData.payment_cards ? dbData.payment_cards.nickname : undefined,
      variablePricing: dbData.variable_pricing && dbData.variable_pricing.length > 0 ? {
        minPrice: 0,
        maxPrice: 0,
        averagePrice: 0,
        upcomingChanges: dbData.variable_pricing.map((vp: any) => ({
        date: vp.date,
        cost: vp.cost,
        description: vp.description
        }))
      } : undefined,
      dateAdded: dbData.created_at,
      // updatedAt: dbData.updated_at,
      cancelledDate: dbData.cancelled_at
    };
  }

  /**
   * Transform app format to database format
   */
  private transformToDB(appData: Partial<FullSubscription>): any {
    const dbData: any = {};

    if (appData.name !== undefined) dbData.name = appData.name;
    if (appData.cost !== undefined) dbData.cost = appData.cost;
    if (appData.billingCycle !== undefined) dbData.billing_cycle = appData.billingCycle;
    if (appData.nextPayment !== undefined) dbData.next_billing_date = appData.nextPayment;
    if (appData.status !== undefined) dbData.status = appData.status;
    if (appData.category !== undefined) dbData.category = appData.category;
    if (appData.description !== undefined) dbData.description = appData.description;
    if (appData.websiteUrl !== undefined) dbData.website_url = appData.websiteUrl;
    if (appData.logoUrl !== undefined) dbData.logo_url = appData.logoUrl;
    // if (appData.color !== undefined) dbData.color = appData.color;
    // if (appData.autoRenew !== undefined) dbData.auto_renew = appData.autoRenew;
    if (appData.reminderDays !== undefined) dbData.reminder_days = appData.reminderDays;
    if (appData.notes !== undefined) dbData.notes = appData.notes;
    if (appData.tags !== undefined) dbData.tags = appData.tags;
    if (appData.paymentCardId !== undefined) dbData.payment_card_id = appData.paymentCardId;

    return dbData;
  }

  /**
   * Calculate monthly cost based on billing cycle
   */
  private calculateMonthlyCost(cost: number, billingCycle: string): number {
    switch (billingCycle) {
      case 'monthly':
        return cost;
      case 'yearly':
        return cost / 12;
      case 'quarterly':
        return cost / 3;
      case 'weekly':
        return cost * 4.33;
      default:
        return cost;
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();

export default subscriptionService;