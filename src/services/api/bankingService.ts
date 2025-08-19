// Banking Service - Integrates with Plaid for bank account connections and transactions
import { getAPIConfig, isAPIConfigured } from './apiConfig';

// Plaid Types
export interface PlaidAccount {
  account_id: string;
  balances: {
    available: number | null;
    current: number;
    iso_currency_code: string;
    limit: number | null;
  };
  mask: string;
  name: string;
  official_name: string | null;
  subtype: string;
  type: 'depository' | 'credit' | 'loan' | 'investment';
}

export interface PlaidTransaction {
  account_id: string;
  amount: number;
  iso_currency_code: string;
  category: string[];
  category_id: string;
  date: string;
  datetime: string | null;
  location: {
    address: string | null;
    city: string | null;
    country: string | null;
    lat: number | null;
    lon: number | null;
    postal_code: string | null;
    region: string | null;
    store_number: string | null;
  };
  merchant_name: string | null;
  name: string;
  payment_channel: 'online' | 'in store' | 'other';
  pending: boolean;
  pending_transaction_id: string | null;
  transaction_id: string;
  transaction_type: string;
}

export interface PlaidInstitution {
  institution_id: string;
  name: string;
  products: string[];
  country_codes: string[];
  url: string | null;
  primary_color: string | null;
  logo: string | null;
}

export interface BankConnection {
  id: string;
  institutionId: string;
  institutionName: string;
  accessToken: string;
  itemId: string;
  accounts: PlaidAccount[];
  lastSync: string;
  status: 'connected' | 'error' | 'updating';
  error?: string;
}

// Transaction categorization
export interface TransactionCategory {
  id: string;
  name: string;
  type: 'subscription' | 'bill' | 'income' | 'expense' | 'transfer' | 'investment';
  keywords: string[];
  merchantPatterns: RegExp[];
  amountRange?: { min?: number; max?: number };
  isRecurring?: boolean;
}

// Default categories for automatic categorization
const DEFAULT_CATEGORIES: TransactionCategory[] = [
  {
    id: 'subscription_streaming',
    name: 'Streaming Services',
    type: 'subscription',
    keywords: ['netflix', 'spotify', 'hulu', 'disney', 'hbo', 'apple music', 'youtube'],
    merchantPatterns: [/netflix/i, /spotify/i, /hulu/i, /disney\+?/i, /hbo/i, /youtube/i],
    isRecurring: true,
  },
  {
    id: 'subscription_software',
    name: 'Software Subscriptions',
    type: 'subscription',
    keywords: ['adobe', 'microsoft', 'dropbox', 'google', 'slack', 'zoom', 'github'],
    merchantPatterns: [/adobe/i, /microsoft/i, /dropbox/i, /google/i, /slack/i, /zoom/i],
    isRecurring: true,
  },
  {
    id: 'bill_utilities',
    name: 'Utilities',
    type: 'bill',
    keywords: ['electric', 'gas', 'water', 'internet', 'comcast', 'verizon', 'att'],
    merchantPatterns: [/electric/i, /gas company/i, /water/i, /comcast/i, /verizon/i],
    isRecurring: true,
  },
  {
    id: 'income_salary',
    name: 'Salary',
    type: 'income',
    keywords: ['payroll', 'salary', 'direct deposit', 'employer'],
    merchantPatterns: [/payroll/i, /direct dep/i],
    amountRange: { min: 500 },
    isRecurring: true,
  },
  {
    id: 'expense_grocery',
    name: 'Groceries',
    type: 'expense',
    keywords: ['walmart', 'target', 'kroger', 'safeway', 'whole foods', 'trader joes'],
    merchantPatterns: [/walmart/i, /target/i, /kroger/i, /safeway/i, /whole foods/i],
  },
  {
    id: 'expense_dining',
    name: 'Dining Out',
    type: 'expense',
    keywords: ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonalds', 'chipotle'],
    merchantPatterns: [/restaurant/i, /cafe/i, /coffee/i, /starbucks/i, /mcdonald/i],
  },
  {
    id: 'investment_crypto',
    name: 'Cryptocurrency',
    type: 'investment',
    keywords: ['coinbase', 'binance', 'kraken', 'crypto', 'bitcoin'],
    merchantPatterns: [/coinbase/i, /binance/i, /kraken/i, /crypto/i],
  },
  {
    id: 'investment_brokerage',
    name: 'Stock Investment',
    type: 'investment',
    keywords: ['robinhood', 'fidelity', 'vanguard', 'schwab', 'etrade'],
    merchantPatterns: [/robinhood/i, /fidelity/i, /vanguard/i, /schwab/i, /etrade/i],
  },
];

// Banking Service Class
export class BankingService {
  private plaidClientId: string;
  private plaidSecret: string;
  private plaidEnv: string;
  private baseUrl: string;

  constructor() {
    const config = getAPIConfig('plaid');
    this.plaidClientId = import.meta.env.VITE_PLAID_CLIENT_ID || '';
    this.plaidSecret = config.apiKey || '';
    this.plaidEnv = import.meta.env.VITE_PLAID_ENV || 'sandbox';
    this.baseUrl = config.baseUrl;
  }

  // Initialize Plaid Link (client-side)
  async createLinkToken(userId: string): Promise<string> {
    if (!isAPIConfigured('plaid')) {
      throw new Error('Plaid is not configured. Please add API keys.');
    }

    const response = await fetch(`${this.baseUrl}/link/token/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.plaidClientId,
        secret: this.plaidSecret,
        user: { client_user_id: userId },
        client_name: 'SubTracker Financial Dashboard',
        products: ['transactions', 'accounts', 'investments'],
        country_codes: ['US'],
        language: 'en',
        webhook: import.meta.env.VITE_PLAID_WEBHOOK_URL,
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.link_token;
  }

  // Exchange public token for access token
  async exchangePublicToken(publicToken: string): Promise<{ accessToken: string; itemId: string }> {
    const response = await fetch(`${this.baseUrl}/item/public_token/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.plaidClientId,
        secret: this.plaidSecret,
        public_token: publicToken,
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    return {
      accessToken: data.access_token,
      itemId: data.item_id,
    };
  }

  // Get accounts
  async getAccounts(accessToken: string): Promise<PlaidAccount[]> {
    const response = await fetch(`${this.baseUrl}/accounts/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.plaidClientId,
        secret: this.plaidSecret,
        access_token: accessToken,
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.accounts;
  }

  // Get transactions
  async getTransactions(
    accessToken: string,
    startDate: string,
    endDate: string,
    options?: {
      count?: number;
      offset?: number;
      accountIds?: string[];
    }
  ): Promise<{ transactions: PlaidTransaction[]; totalTransactions: number }> {
    const response = await fetch(`${this.baseUrl}/transactions/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.plaidClientId,
        secret: this.plaidSecret,
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
          count: options?.count || 100,
          offset: options?.offset || 0,
          account_ids: options?.accountIds,
        },
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    return {
      transactions: data.transactions,
      totalTransactions: data.total_transactions,
    };
  }

  // Get institution info
  async getInstitution(institutionId: string): Promise<PlaidInstitution> {
    const response = await fetch(`${this.baseUrl}/institutions/get_by_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.plaidClientId,
        secret: this.plaidSecret,
        institution_id: institutionId,
        country_codes: ['US'],
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.institution;
  }

  // Categorize transaction
  categorizeTransaction(transaction: PlaidTransaction): TransactionCategory | null {
    const merchantName = transaction.merchant_name?.toLowerCase() || '';
    const transactionName = transaction.name.toLowerCase();
    const amount = Math.abs(transaction.amount);

    for (const category of DEFAULT_CATEGORIES) {
      // Check merchant patterns
      for (const pattern of category.merchantPatterns) {
        if (pattern.test(merchantName) || pattern.test(transactionName)) {
          // Check amount range if specified
          if (category.amountRange) {
            if (category.amountRange.min && amount < category.amountRange.min) continue;
            if (category.amountRange.max && amount > category.amountRange.max) continue;
          }
          return category;
        }
      }

      // Check keywords
      for (const keyword of category.keywords) {
        if (merchantName.includes(keyword) || transactionName.includes(keyword)) {
          // Check amount range if specified
          if (category.amountRange) {
            if (category.amountRange.min && amount < category.amountRange.min) continue;
            if (category.amountRange.max && amount > category.amountRange.max) continue;
          }
          return category;
        }
      }
    }

    // Check Plaid categories as fallback
    if (transaction.category && transaction.category.length > 0) {
      const plaidCategory = transaction.category[0].toLowerCase();
      
      if (plaidCategory.includes('subscription')) {
        return {
          id: 'subscription_other',
          name: 'Other Subscription',
          type: 'subscription',
          keywords: [],
          merchantPatterns: [],
          isRecurring: true,
        };
      }
      
      if (plaidCategory.includes('transfer') && amount < 0) {
        return {
          id: 'income_other',
          name: 'Other Income',
          type: 'income',
          keywords: [],
          merchantPatterns: [],
        };
      }
    }

    return null;
  }

  // Identify recurring transactions (subscriptions and bills)
  identifyRecurringTransactions(
    transactions: PlaidTransaction[]
  ): { subscription: PlaidTransaction[]; bills: PlaidTransaction[] } {
    const merchantFrequency = new Map<string, PlaidTransaction[]>();
    
    // Group by merchant
    transactions.forEach(transaction => {
      const merchant = transaction.merchant_name || transaction.name;
      if (!merchantFrequency.has(merchant)) {
        merchantFrequency.set(merchant, []);
      }
      merchantFrequency.get(merchant)!.push(transaction);
    });

    const subscriptions: PlaidTransaction[] = [];
    const bills: PlaidTransaction[] = [];

    // Analyze frequency
    merchantFrequency.forEach((merchantTransactions, merchant) => {
      if (merchantTransactions.length >= 2) {
        // Sort by date
        merchantTransactions.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Check if amounts are similar (within 10% variance)
        const amounts = merchantTransactions.map(t => Math.abs(t.amount));
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const isConsistentAmount = amounts.every(amt => 
          Math.abs(amt - avgAmount) / avgAmount < 0.1
        );

        if (isConsistentAmount) {
          // Check frequency (monthly pattern)
          const dates = merchantTransactions.map(t => new Date(t.date));
          const dayDiffs: number[] = [];
          
          for (let i = 1; i < dates.length; i++) {
            const diff = Math.abs(dates[i].getTime() - dates[i-1].getTime());
            dayDiffs.push(diff / (1000 * 60 * 60 * 24));
          }

          const avgDayDiff = dayDiffs.reduce((a, b) => a + b, 0) / dayDiffs.length;
          
          // Monthly pattern (25-35 days)
          if (avgDayDiff >= 25 && avgDayDiff <= 35) {
            const category = this.categorizeTransaction(merchantTransactions[0]);
            
            if (category?.type === 'subscription') {
              subscriptions.push(...merchantTransactions);
            } else if (category?.type === 'bill') {
              bills.push(...merchantTransactions);
            } else {
              // Default to subscription for recurring payments
              subscriptions.push(...merchantTransactions);
            }
          }
        }
      }
    });

    return { subscription: subscriptions, bills };
  }

  // Sync all bank connections
  async syncBankConnections(connections: BankConnection[]): Promise<BankConnection[]> {
    const updatedConnections = await Promise.all(
      connections.map(async (connection) => {
        try {
          // Get latest accounts
          const accounts = await this.getAccounts(connection.accessToken);
          
          // Get transactions from last 30 days
          const endDate = new Date().toISOString().split('T')[0];
          const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];
          
          const { transactions } = await this.getTransactions(
            connection.accessToken,
            startDate,
            endDate
          );

          return {
            ...connection,
            accounts,
            lastSync: new Date().toISOString(),
            status: 'connected' as const,
            error: undefined,
          };
        } catch (error) {
          console.error(`Failed to sync connection ${connection.id}:`, error);
          return {
            ...connection,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return updatedConnections;
  }
}

// Export singleton instance
export const bankingService = new BankingService();