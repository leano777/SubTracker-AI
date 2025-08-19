// Robinhood API Integration Service
// Stock and options trading portfolio tracking

import { BaseAPIService } from './base';
import type { APIServiceConfig, APIResponse } from './base';

export interface RobinhoodAccount {
  url: string;
  account_number: string;
  status: 'active' | 'deactivated' | 'restricted';
  buying_power: string;
  cash: string;
  cash_available_for_withdrawal: string;
  portfolio_value: string;
  market_value: string;
  total_return_today: string;
  total_return_today_percentage: string;
  type: 'cash' | 'margin';
  created_at: string;
  updated_at: string;
}

export interface RobinhoodPosition {
  url: string;
  instrument: string;
  symbol: string;
  name?: string;
  quantity: string;
  average_buy_price: string;
  shares_held_for_buys: string;
  shares_held_for_sells: string;
  created_at: string;
  updated_at: string;
}

export interface RobinhoodOrder {
  id: string;
  ref_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  order_type: 'market' | 'limit' | 'stop_loss' | 'stop_limit';
  quantity: string;
  price?: string;
  stop_price?: string;
  state: 'queued' | 'placed' | 'canceled' | 'filled' | 'rejected' | 'failed';
  time_in_force: 'gfd' | 'gtc' | 'ioc' | 'fok';
  created_at: string;
  executed_at?: string;
  updated_at: string;
  fees: string;
  executed_price?: string;
  executed_quantity?: string;
}

export interface RobinhoodQuote {
  symbol: string;
  last_trade_price: string;
  last_extended_hours_trade_price?: string;
  previous_close: string;
  adjusted_previous_close: string;
  bid_price: string;
  bid_size: number;
  ask_price: string;
  ask_size: number;
  high_price?: string;
  low_price?: string;
  open_price?: string;
  volume?: number;
  updated_at: string;
}

export interface RobinhoodPortfolioHistorical {
  span: 'day' | 'week' | 'month' | '3month' | 'year' | '5year' | 'all';
  interval: '5minute' | '10minute' | 'hour' | 'day' | 'week';
  bounds: 'regular' | 'extended' | '24_7';
  data_points: Array<{
    begins_at: string;
    open_price: string;
    close_price: string;
    adjusted_open_price: string;
    adjusted_close_price: string;
  }>;
}

export interface RobinhoodWatchlist {
  id: string;
  name: string;
  symbols: string[];
  created_at: string;
  updated_at: string;
}

export interface RobinhoodDividend {
  id: string;
  symbol: string;
  amount: string;
  rate: string;
  position: string;
  withholding: string;
  record_date: string;
  payable_date: string;
  paid_at?: string;
  state: 'pending' | 'reinvested' | 'paid';
}

export class RobinhoodAPIService extends BaseAPIService {
  private accessToken?: string;
  private refreshToken?: string;

  constructor(credentials?: { username?: string; password?: string; accessToken?: string }) {
    const config: APIServiceConfig = {
      name: 'Robinhood',
      baseUrl: process.env.VITE_ROBINHOOD_API_URL || 'https://api.robinhood.com',
      version: '',
      credentials: {
        accessToken: credentials?.accessToken || process.env.VITE_ROBINHOOD_ACCESS_TOKEN,
      },
      headers: {
        'Accept': 'application/json',
      },
      rateLimitPerMinute: 60,
      timeout: 30000,
      retryAttempts: 3,
    };
    super(config);
    
    this.accessToken = credentials?.accessToken;
  }

  // Override makeRequest to add Robinhood-specific auth
  protected async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    if (this.accessToken) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
      };
    }
    
    return super.makeRequest<T>(endpoint, options);
  }

  async authenticate(): Promise<boolean> {
    // Note: Robinhood requires OAuth2 authentication
    // This is a simplified version - in production, use proper OAuth flow
    if (!this.accessToken) {
      console.error('Robinhood access token not configured');
      return false;
    }

    try {
      const response = await this.makeRequest('user/');
      return response.success;
    } catch (error) {
      console.error('Robinhood authentication failed:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('api-token-auth/');
      return response.success;
    } catch {
      return false;
    }
  }

  async getAccountInfo(): Promise<APIResponse> {
    return this.makeRequest('user/');
  }

  // Get all accounts
  async getAccounts(): Promise<APIResponse<{ results: RobinhoodAccount[] }>> {
    return this.makeRequest<{ results: RobinhoodAccount[] }>('accounts/');
  }

  // Get specific account
  async getAccount(accountNumber: string): Promise<APIResponse<RobinhoodAccount>> {
    return this.makeRequest<RobinhoodAccount>(`accounts/${accountNumber}/`);
  }

  // Get all positions
  async getPositions(params?: {
    nonzero?: boolean;
  }): Promise<APIResponse<{ results: RobinhoodPosition[] }>> {
    const queryParams = new URLSearchParams();
    
    if (params?.nonzero) {
      queryParams.append('nonzero', 'true');
    }

    const endpoint = `positions/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.makeRequest<{ results: RobinhoodPosition[] }>(endpoint);
  }

  // Get orders
  async getOrders(params?: {
    symbol?: string;
    state?: 'queued' | 'placed' | 'canceled' | 'filled';
    since?: string;
    until?: string;
  }): Promise<APIResponse<{ results: RobinhoodOrder[] }>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `orders/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.makeRequest<{ results: RobinhoodOrder[] }>(endpoint);
  }

  // Get specific order
  async getOrder(orderId: string): Promise<APIResponse<RobinhoodOrder>> {
    return this.makeRequest<RobinhoodOrder>(`orders/${orderId}/`);
  }

  // Get quote for a symbol
  async getQuote(symbol: string): Promise<APIResponse<RobinhoodQuote>> {
    return this.makeRequest<RobinhoodQuote>(`quotes/${symbol.toUpperCase()}/`);
  }

  // Get multiple quotes
  async getQuotes(symbols: string[]): Promise<APIResponse<{ results: RobinhoodQuote[] }>> {
    const symbolList = symbols.map(s => s.toUpperCase()).join(',');
    return this.makeRequest<{ results: RobinhoodQuote[] }>(`quotes/?symbols=${symbolList}`);
  }

  // Get portfolio historical data
  async getPortfolioHistorical(
    accountNumber: string,
    params?: {
      span?: 'day' | 'week' | 'month' | '3month' | 'year' | '5year' | 'all';
      interval?: '5minute' | '10minute' | 'hour' | 'day' | 'week';
    }
  ): Promise<APIResponse<RobinhoodPortfolioHistorical>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `portfolios/historicals/${accountNumber}/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.makeRequest<RobinhoodPortfolioHistorical>(endpoint);
  }

  // Get watchlists
  async getWatchlists(): Promise<APIResponse<{ results: RobinhoodWatchlist[] }>> {
    return this.makeRequest<{ results: RobinhoodWatchlist[] }>('watchlists/');
  }

  // Get specific watchlist
  async getWatchlist(watchlistId: string): Promise<APIResponse<RobinhoodWatchlist>> {
    return this.makeRequest<RobinhoodWatchlist>(`watchlists/${watchlistId}/`);
  }

  // Get dividends
  async getDividends(params?: {
    state?: 'pending' | 'reinvested' | 'paid';
  }): Promise<APIResponse<{ results: RobinhoodDividend[] }>> {
    const queryParams = new URLSearchParams();
    
    if (params?.state) {
      queryParams.append('state', params.state);
    }

    const endpoint = `dividends/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.makeRequest<{ results: RobinhoodDividend[] }>(endpoint);
  }

  // Calculate portfolio statistics
  async getPortfolioStats(): Promise<APIResponse<{
    totalValue: number;
    totalCost: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    dayChange: number;
    dayChangePercent: number;
    positions: Array<{
      symbol: string;
      value: number;
      gainLoss: number;
      gainLossPercent: number;
      allocation: number;
    }>;
  }>> {
    try {
      const accountsResponse = await this.getAccounts();
      if (!accountsResponse.success || !accountsResponse.data) {
        return { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch accounts' } };
      }

      const account = accountsResponse.data.results[0];
      if (!account) {
        return { success: false, error: { code: 'NO_ACCOUNT', message: 'No account found' } };
      }

      const positionsResponse = await this.getPositions({ nonzero: true });
      if (!positionsResponse.success || !positionsResponse.data) {
        return { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch positions' } };
      }

      const totalValue = parseFloat(account.portfolio_value);
      const dayChange = parseFloat(account.total_return_today);
      const dayChangePercent = parseFloat(account.total_return_today_percentage);

      let totalCost = 0;
      const positionStats: any[] = [];

      // Get quotes for all positions
      const symbols = positionsResponse.data.results
        .map(p => p.symbol)
        .filter(s => s);
      
      if (symbols.length > 0) {
        const quotesResponse = await this.getQuotes(symbols);
        const quotes = quotesResponse.success ? quotesResponse.data?.results || [] : [];
        const quoteMap = new Map(quotes.map(q => [q.symbol, q]));

        for (const position of positionsResponse.data.results) {
          if (!position.symbol) continue;
          
          const quantity = parseFloat(position.quantity);
          const avgBuyPrice = parseFloat(position.average_buy_price);
          const cost = quantity * avgBuyPrice;
          totalCost += cost;

          const quote = quoteMap.get(position.symbol);
          if (quote) {
            const currentPrice = parseFloat(quote.last_trade_price);
            const value = quantity * currentPrice;
            const gainLoss = value - cost;
            const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;
            const allocation = totalValue > 0 ? (value / totalValue) * 100 : 0;

            positionStats.push({
              symbol: position.symbol,
              value,
              gainLoss,
              gainLossPercent,
              allocation,
            });
          }
        }
      }

      const totalGainLoss = totalValue - totalCost;
      const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

      return {
        success: true,
        data: {
          totalValue,
          totalCost,
          totalGainLoss,
          totalGainLossPercent,
          dayChange,
          dayChangePercent,
          positions: positionStats.sort((a, b) => b.value - a.value),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CALCULATION_ERROR',
          message: 'Failed to calculate portfolio statistics',
          details: error,
        },
      };
    }
  }

  // Helper method to map Robinhood position to our Investment type
  mapRobinhoodPosition(position: RobinhoodPosition, quote?: RobinhoodQuote): any {
    const quantity = parseFloat(position.quantity);
    const avgBuyPrice = parseFloat(position.average_buy_price);
    const currentPrice = quote ? parseFloat(quote.last_trade_price) : avgBuyPrice;
    const cost = quantity * avgBuyPrice;
    const value = quantity * currentPrice;
    const gainLoss = value - cost;
    const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;

    return {
      id: `robinhood_${position.url.split('/').filter(Boolean).pop()}`,
      symbol: position.symbol,
      name: position.name || position.symbol,
      type: 'stock',
      quantity,
      purchasePrice: avgBuyPrice,
      purchaseDate: position.created_at,
      currentPrice,
      lastUpdated: position.updated_at,
      platform: 'robinhood',
      totalReturn: gainLoss,
      percentReturn: gainLossPercent,
      dayChange: quote ? parseFloat(quote.last_trade_price) - parseFloat(quote.previous_close) : 0,
      dayChangePercent: quote && parseFloat(quote.previous_close) > 0 
        ? ((parseFloat(quote.last_trade_price) - parseFloat(quote.previous_close)) / parseFloat(quote.previous_close)) * 100 
        : 0,
      currency: 'USD',
      exchange: 'US',
      conviction: 'medium',
      riskLevel: 'medium',
    };
  }

  // Get options positions
  async getOptionsPositions(): Promise<APIResponse<{ results: any[] }>> {
    return this.makeRequest<{ results: any[] }>('options/positions/');
  }

  // Get crypto holdings (if enabled)
  async getCryptoHoldings(): Promise<APIResponse<{ results: any[] }>> {
    return this.makeRequest<{ results: any[] }>('crypto/holdings/');
  }

  // Get notifications/alerts
  async getNotifications(): Promise<APIResponse<{ results: any[] }>> {
    return this.makeRequest<{ results: any[] }>('notifications/');
  }
}

// Export singleton instance
export const robinhoodAPI = new RobinhoodAPIService();