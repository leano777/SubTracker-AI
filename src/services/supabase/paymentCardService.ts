/**
 * Payment Card Service - Supabase Data Persistence
 * Handles all payment card-related database operations
 */

import { supabase } from '@/utils/supabase/client';
import type { FullPaymentCard } from '@/types/subscription';

export interface PaymentCardDB {
  id: string;
  user_id: string;
  nickname: string;
  last_four: string;
  brand?: string;
  color?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

class PaymentCardService {
  /**
   * Get all payment cards for the current user
   */
  async getPaymentCards(): Promise<FullPaymentCard[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('payment_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.transformFromDB);
    } catch (error) {
      console.error('Error fetching payment cards:', error);
      return [];
    }
  }

  /**
   * Get a single payment card by ID
   */
  async getPaymentCard(id: string): Promise<FullPaymentCard | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('payment_cards')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.transformFromDB(data);
    } catch (error) {
      console.error('Error fetching payment card:', error);
      return null;
    }
  }

  /**
   * Create a new payment card
   */
  async createPaymentCard(card: Partial<FullPaymentCard>): Promise<FullPaymentCard | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // If this card should be default, unset other defaults first
      if (card.isDefault) {
        await this.unsetDefaultCards(user.id);
      }

      const dbData = this.transformToDB(card);
      dbData.user_id = user.id;

      const { data, error } = await supabase
        .from('payment_cards')
        .insert(dbData)
        .select('*')
        .single();

      if (error) throw error;

      return this.transformFromDB(data);
    } catch (error) {
      console.error('Error creating payment card:', error);
      return null;
    }
  }

  /**
   * Update an existing payment card
   */
  async updatePaymentCard(id: string, updates: Partial<FullPaymentCard>): Promise<FullPaymentCard | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // If updating to default, unset other defaults first
      if (updates.isDefault) {
        await this.unsetDefaultCards(user.id, id);
      }

      const dbData = this.transformToDB(updates);
      delete dbData.user_id; // Don't update user_id

      const { data, error } = await supabase
        .from('payment_cards')
        .update(dbData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error) throw error;

      return this.transformFromDB(data);
    } catch (error) {
      console.error('Error updating payment card:', error);
      return null;
    }
  }

  /**
   * Delete a payment card
   */
  async deletePaymentCard(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('payment_cards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting payment card:', error);
      return false;
    }
  }

  /**
   * Set a card as default
   */
  async setDefaultCard(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Unset all other defaults
      await this.unsetDefaultCards(user.id, id);

      // Set this card as default
      const { error } = await supabase
        .from('payment_cards')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting default card:', error);
      return false;
    }
  }

  /**
   * Get statistics about payment cards
   */
  async getCardStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get card count and subscription count per card
      const { data: cards, error: cardsError } = await supabase
        .from('payment_cards')
        .select('id')
        .eq('user_id', user.id);

      if (cardsError) throw cardsError;

      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('payment_card_id, cost, billing_cycle')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (subsError) throw subsError;

      const cardUsage = new Map<string, { count: number; monthlySpend: number }>();

      (subscriptions || []).forEach(sub => {
        if (sub.payment_card_id) {
          const existing = cardUsage.get(sub.payment_card_id) || { count: 0, monthlySpend: 0 };
          existing.count++;
          existing.monthlySpend += this.calculateMonthlyCost(sub.cost, sub.billing_cycle);
          cardUsage.set(sub.payment_card_id, existing);
        }
      });

      return {
        totalCards: cards?.length || 0,
        cardUsage: Array.from(cardUsage.entries()).map(([cardId, usage]) => ({
          cardId,
          subscriptionCount: usage.count,
          monthlySpend: usage.monthlySpend
        }))
      };
    } catch (error) {
      console.error('Error getting card stats:', error);
      return {
        totalCards: 0,
        cardUsage: []
      };
    }
  }

  /**
   * Unset default flag for all cards except the specified one
   */
  private async unsetDefaultCards(userId: string, exceptId?: string) {
    try {
      const query = supabase
        .from('payment_cards')
        .update({ is_default: false })
        .eq('user_id', userId);

      if (exceptId) {
        query.neq('id', exceptId);
      }

      await query;
    } catch (error) {
      console.error('Error unsetting default cards:', error);
    }
  }

  /**
   * Transform database format to app format
   */
  private transformFromDB(dbData: PaymentCardDB): FullPaymentCard {
    return {
      id: dbData.id,
      nickname: dbData.nickname,
      lastFour: dbData.last_four,
      // brand: dbData.brand,
      color: dbData.color,
      isDefault: dbData.is_default,
      dateAdded: dbData.created_at
      // updatedAt: dbData.updated_at
    };
  }

  /**
   * Transform app format to database format
   */
  private transformToDB(appData: Partial<FullPaymentCard>): any {
    const dbData: any = {};

    if (appData.nickname !== undefined) dbData.nickname = appData.nickname;
    if (appData.lastFour !== undefined) dbData.last_four = appData.lastFour;
    // if (appData.brand !== undefined) dbData.brand = appData.brand;
    if (appData.color !== undefined) dbData.color = appData.color;
    if (appData.isDefault !== undefined) dbData.is_default = appData.isDefault;

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
export const paymentCardService = new PaymentCardService();

export default paymentCardService;