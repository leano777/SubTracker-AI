// Sequence.io API Integration Service
// Banking and transaction data aggregation

import { BaseAPIService } from './base';
import type { APIServiceConfig, APIResponse } from './base';

export interface SequenceAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan';
  institution: string;
  balance: number;
  availableBalance?: number;
  currency: string;
  lastUpdated: string;
  accountNumber?: string; // Last 4 digits
  routingNumber?: string;
}

export interface SequenceTransaction {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  subCategory?: string;
  merchant?: string;
  pending: boolean;
  type: 'debit' | 'credit';
  tags?: string[];
  notes?: string;
}

export interface SequenceBalance {
  accountId: string;
  current: number;
  available: number;
  pending: number;
  currency: string;
  asOf: string;
}

export interface SequenceBudgetInsight {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  trend: 'under' | 'on_track' | 'over';
  projectedEndOfMonth: number;
}

export class SequenceAPIService extends BaseAPIService {
  constructor(credentials?: { apiKey?: string; apiSecret?: string }) {
    const config: APIServiceConfig = {
      name: 'Sequence.io',
      baseUrl: process.env.VITE_SEQUENCE_API_URL || 'https://api.sequence.io',
      version: 'v1',
      credentials: {
        apiKey: credentials?.apiKey || process.env.VITE_SEQUENCE_API_KEY,
        apiSecret: credentials?.apiSecret || process.env.VITE_SEQUENCE_API_SECRET,
      },
      headers: {
        'X-API-Key': credentials?.apiKey || process.env.VITE_SEQUENCE_API_KEY || '',
      },
      rateLimitPerMinute: 60,
      timeout: 30000,
      retryAttempts: 3,
    };
    super(config);
  }

  async authenticate(): Promise<boolean> {
    if (!this.config.credentials?.apiKey) {
      console.error('Sequence.io API key not configured');
      return false;
    }

    try {
      const response = await this.makeRequest('auth/verify');
      return response.success;
    } catch (error) {
      console.error('Sequence.io authentication failed:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('ping');
      return response.success;
    } catch {
      return false;
    }
  }

  async getAccountInfo(): Promise<APIResponse> {
    return this.makeRequest('account/info');
  }

  // Get all connected bank accounts
  async getAccounts(): Promise<APIResponse<SequenceAccount[]>> {
    return this.makeRequest<SequenceAccount[]>('accounts');
  }

  // Get account by ID
  async getAccount(accountId: string): Promise<APIResponse<SequenceAccount>> {
    return this.makeRequest<SequenceAccount>(`accounts/${accountId}`);
  }

  // Get account balance
  async getAccountBalance(accountId: string): Promise<APIResponse<SequenceBalance>> {
    return this.makeRequest<SequenceBalance>(`accounts/${accountId}/balance`);
  }

  // Get transactions with optional filters
  async getTransactions(params?: {
    accountId?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
    minAmount?: number;
    maxAmount?: number;
    pending?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<APIResponse<SequenceTransaction[]>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `transactions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.makeRequest<SequenceTransaction[]>(endpoint);
  }

  // Get transaction by ID
  async getTransaction(transactionId: string): Promise<APIResponse<SequenceTransaction>> {
    return this.makeRequest<SequenceTransaction>(`transactions/${transactionId}`);
  }

  // Categorize transactions automatically
  async categorizeTransactions(
    transactions: Array<{ id: string; description: string; amount: number }>
  ): Promise<APIResponse<Array<{ id: string; category: string; confidence: number }>>> {
    return this.makeRequest('transactions/categorize', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
  }

  // Get spending insights
  async getSpendingInsights(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'category' | 'merchant' | 'day' | 'week' | 'month';
  }): Promise<APIResponse<any>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `insights/spending${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.makeRequest(endpoint);
  }

  // Get budget insights
  async getBudgetInsights(): Promise<APIResponse<SequenceBudgetInsight[]>> {
    return this.makeRequest<SequenceBudgetInsight[]>('insights/budget');
  }

  // Get recurring transactions (subscriptions, bills)
  async getRecurringTransactions(): Promise<APIResponse<Array<{
    id: string;
    description: string;
    amount: number;
    frequency: 'weekly' | 'monthly' | 'yearly';
    nextDate: string;
    category: string;
    merchant?: string;
    active: boolean;
  }>>> {
    return this.makeRequest('transactions/recurring');
  }

  // Sync account data
  async syncAccount(accountId: string): Promise<APIResponse<{ status: string; message: string }>> {
    return this.makeRequest(`accounts/${accountId}/sync`, {
      method: 'POST',
    });
  }

  // Sync all accounts
  async syncAllAccounts(): Promise<APIResponse<{ 
    successful: string[];
    failed: Array<{ accountId: string; error: string }>;
  }>> {
    return this.makeRequest('accounts/sync', {
      method: 'POST',
    });
  }

  // Create webhook for real-time updates
  async createWebhook(params: {
    url: string;
    events: Array<'transaction.new' | 'transaction.update' | 'balance.update' | 'account.update'>;
  }): Promise<APIResponse<{ id: string; url: string; secret: string }>> {
    return this.makeRequest('webhooks', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Delete webhook
  async deleteWebhook(webhookId: string): Promise<APIResponse<{ success: boolean }>> {
    return this.makeRequest(`webhooks/${webhookId}`, {
      method: 'DELETE',
    });
  }

  // Export transactions as CSV
  async exportTransactions(params: {
    accountId?: string;
    startDate: string;
    endDate: string;
    format?: 'csv' | 'json' | 'pdf';
  }): Promise<APIResponse<{ downloadUrl: string; expiresAt: string }>> {
    return this.makeRequest('export/transactions', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Helper method to map Sequence transactions to our Transaction type
  mapSequenceTransaction(sequenceTx: SequenceTransaction): any {
    return {
      id: sequenceTx.id,
      date: sequenceTx.date,
      description: sequenceTx.description,
      amount: Math.abs(sequenceTx.amount),
      type: sequenceTx.type === 'credit' ? 'income' : 'expense',
      category: sequenceTx.category,
      subCategory: sequenceTx.subCategory,
      merchant: sequenceTx.merchant,
      pending: sequenceTx.pending,
      tags: sequenceTx.tags || [],
      notes: sequenceTx.notes,
      source: 'sequence',
      sourceId: sequenceTx.id,
      accountId: sequenceTx.accountId,
    };
  }

  // Helper method to detect subscriptions from transactions
  async detectSubscriptions(
    transactions: SequenceTransaction[]
  ): Promise<Array<{
    name: string;
    amount: number;
    frequency: 'monthly' | 'yearly' | 'weekly';
    lastCharge: string;
    nextCharge?: string;
    confidence: number;
  }>> {
    // Group transactions by merchant and amount
    const groups = new Map<string, SequenceTransaction[]>();
    
    transactions.forEach(tx => {
      const key = `${tx.merchant || tx.description}_${tx.amount}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(tx);
    });

    const subscriptions: any[] = [];
    
    // Analyze each group for recurring patterns
    groups.forEach((txs, key) => {
      if (txs.length < 2) return;
      
      // Sort by date
      txs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate intervals between transactions
      const intervals: number[] = [];
      for (let i = 1; i < txs.length; i++) {
        const days = Math.round(
          (new Date(txs[i].date).getTime() - new Date(txs[i - 1].date).getTime()) / 
          (1000 * 60 * 60 * 24)
        );
        intervals.push(days);
      }
      
      // Determine frequency based on average interval
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      let frequency: 'monthly' | 'yearly' | 'weekly' = 'monthly';
      let confidence = 0;
      
      if (avgInterval >= 25 && avgInterval <= 35) {
        frequency = 'monthly';
        confidence = 1 - Math.abs(30 - avgInterval) / 30;
      } else if (avgInterval >= 350 && avgInterval <= 380) {
        frequency = 'yearly';
        confidence = 1 - Math.abs(365 - avgInterval) / 365;
      } else if (avgInterval >= 6 && avgInterval <= 8) {
        frequency = 'weekly';
        confidence = 1 - Math.abs(7 - avgInterval) / 7;
      }
      
      if (confidence > 0.7) {
        const lastTx = txs[txs.length - 1];
        subscriptions.push({
          name: lastTx.merchant || lastTx.description,
          amount: Math.abs(lastTx.amount),
          frequency,
          lastCharge: lastTx.date,
          nextCharge: this.calculateNextCharge(lastTx.date, frequency),
          confidence: Math.round(confidence * 100) / 100,
        });
      }
    });
    
    return subscriptions;
  }

  private calculateNextCharge(lastDate: string, frequency: 'monthly' | 'yearly' | 'weekly'): string {
    const date = new Date(lastDate);
    
    switch (frequency) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
    }
    
    return date.toISOString().split('T')[0];
  }
}

// Export singleton instance
export const sequenceAPI = new SequenceAPIService();