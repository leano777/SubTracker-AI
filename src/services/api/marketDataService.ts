// Market Data Service - Fetches real-time prices and market data
import { API_CONFIGS, getAPIConfig, isAPIConfigured, API_PRIORITY, CACHE_CONFIG } from './apiConfig';
import type { Investment } from '../../types/financial';

// Types for market data
export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  timestamp: string;
}

export interface MarketNews {
  id: string;
  headline: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  symbols: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  circulatingSupply: number;
  totalSupply?: number;
  ath: number;
  athDate: string;
  atl: number;
  atlDate: string;
}

// Cache implementation
class DataCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  set(key: string, data: any, ttl: number = CACHE_CONFIG.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear() {
    this.cache.clear();
  }
}

// Rate limiter implementation
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  canMakeRequest(apiName: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(apiName) || [];
    
    // Filter out old requests
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= limit) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(apiName, recentRequests);
    return true;
  }

  getRemainingTime(apiName: string, windowMs: number): number {
    const requests = this.requests.get(apiName) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    const timeUntilReset = (oldestRequest + windowMs) - Date.now();
    return Math.max(0, timeUntilReset);
  }
}

// Market Data Service
export class MarketDataService {
  private cache = new DataCache();
  private rateLimiter = new RateLimiter();

  // Fetch stock quote using multiple APIs with fallback
  async getStockQuote(symbol: string): Promise<MarketQuote | null> {
    // Check cache first
    const cacheKey = `stock_quote_${symbol}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Try APIs in priority order
    for (const apiName of API_PRIORITY.stocks) {
      if (!isAPIConfigured(apiName as keyof typeof API_CONFIGS)) continue;
      
      try {
        let quote: MarketQuote | null = null;
        
        switch (apiName) {
          case 'alphaVantage':
            quote = await this.fetchAlphaVantageQuote(symbol);
            break;
          case 'yahooFinance':
            quote = await this.fetchYahooFinanceQuote(symbol);
            break;
          case 'finnhub':
            quote = await this.fetchFinnhubQuote(symbol);
            break;
          case 'iexCloud':
            quote = await this.fetchIEXQuote(symbol);
            break;
        }
        
        if (quote) {
          this.cache.set(cacheKey, quote, CACHE_CONFIG.quoteTTL);
          return quote;
        }
      } catch (error) {
        console.error(`Failed to fetch from ${apiName}:`, error);
        // Continue to next API
      }
    }
    
    return null;
  }

  // Alpha Vantage implementation
  private async fetchAlphaVantageQuote(symbol: string): Promise<MarketQuote | null> {
    const config = getAPIConfig('alphaVantage');
    
    if (!this.rateLimiter.canMakeRequest('alphaVantage', 
      config.rateLimit?.requests || 5, 
      config.rateLimit?.windowMs || 60000)) {
      throw new Error('Rate limit exceeded for Alpha Vantage');
    }
    
    const url = `${config.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${config.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data['Global Quote']) {
      const quote = data['Global Quote'];
      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(quote['08. previous close']),
        timestamp: new Date().toISOString(),
      };
    }
    
    return null;
  }

  // Yahoo Finance implementation (uses public API, no key required)
  private async fetchYahooFinanceQuote(symbol: string): Promise<MarketQuote | null> {
    // Using Yahoo Finance v8 API endpoint
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.chart && data.chart.result && data.chart.result[0]) {
        const result = data.chart.result[0];
        const quote = result.meta;
        const regularMarketPrice = quote.regularMarketPrice;
        const previousClose = quote.previousClose || quote.chartPreviousClose;
        
        return {
          symbol: quote.symbol,
          price: regularMarketPrice,
          change: regularMarketPrice - previousClose,
          changePercent: ((regularMarketPrice - previousClose) / previousClose) * 100,
          volume: quote.regularMarketVolume || 0,
          high: quote.regularMarketDayHigh,
          low: quote.regularMarketDayLow,
          open: quote.regularMarketOpen,
          previousClose: previousClose,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error('Yahoo Finance API error:', error);
    }
    
    return null;
  }

  // Finnhub implementation
  private async fetchFinnhubQuote(symbol: string): Promise<MarketQuote | null> {
    const config = getAPIConfig('finnhub');
    
    const url = `${config.baseUrl}/quote?symbol=${symbol}&token=${config.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.c) { // 'c' is current price in Finnhub
      return {
        symbol: symbol,
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        volume: 0, // Finnhub doesn't provide volume in quote endpoint
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc,
        timestamp: new Date().toISOString(),
      };
    }
    
    return null;
  }

  // IEX Cloud implementation
  private async fetchIEXQuote(symbol: string): Promise<MarketQuote | null> {
    const config = getAPIConfig('iexCloud');
    
    const url = `${config.baseUrl}/stock/${symbol}/quote?token=${config.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.latestPrice) {
      return {
        symbol: data.symbol,
        price: data.latestPrice,
        change: data.change,
        changePercent: data.changePercent * 100,
        volume: data.volume,
        marketCap: data.marketCap,
        high: data.high,
        low: data.low,
        open: data.open,
        previousClose: data.previousClose,
        timestamp: new Date(data.latestUpdate).toISOString(),
      };
    }
    
    return null;
  }

  // Fetch cryptocurrency data
  async getCryptoQuote(symbol: string): Promise<CryptoData | null> {
    // Check cache first
    const cacheKey = `crypto_quote_${symbol}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Try CoinGecko first (free and reliable)
    if (isAPIConfigured('coinGecko')) {
      try {
        const quote = await this.fetchCoinGeckoData(symbol);
        if (quote) {
          this.cache.set(cacheKey, quote, CACHE_CONFIG.quoteTTL);
          return quote;
        }
      } catch (error) {
        console.error('CoinGecko API error:', error);
      }
    }

    // Fallback to Coinbase
    if (isAPIConfigured('coinbase')) {
      try {
        const quote = await this.fetchCoinbaseData(symbol);
        if (quote) {
          this.cache.set(cacheKey, quote, CACHE_CONFIG.quoteTTL);
          return quote;
        }
      } catch (error) {
        console.error('Coinbase API error:', error);
      }
    }

    return null;
  }

  // CoinGecko implementation
  private async fetchCoinGeckoData(symbol: string): Promise<CryptoData | null> {
    const config = getAPIConfig('coinGecko');
    
    // CoinGecko uses IDs not symbols, so we need a mapping
    const coinIdMap: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'SOL': 'solana',
      'ADA': 'cardano',
      'DOGE': 'dogecoin',
      'MATIC': 'matic-network',
      'DOT': 'polkadot',
      'AVAX': 'avalanche-2',
      'LINK': 'chainlink',
    };
    
    const coinId = coinIdMap[symbol.toUpperCase()] || symbol.toLowerCase();
    const url = `${config.baseUrl}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.market_data) {
        return {
          id: data.id,
          symbol: data.symbol.toUpperCase(),
          name: data.name,
          currentPrice: data.market_data.current_price.usd,
          marketCap: data.market_data.market_cap.usd,
          volume24h: data.market_data.total_volume.usd,
          priceChange24h: data.market_data.price_change_24h,
          priceChangePercentage24h: data.market_data.price_change_percentage_24h,
          circulatingSupply: data.market_data.circulating_supply,
          totalSupply: data.market_data.total_supply,
          ath: data.market_data.ath.usd,
          athDate: data.market_data.ath_date.usd,
          atl: data.market_data.atl.usd,
          atlDate: data.market_data.atl_date.usd,
        };
      }
    } catch (error) {
      console.error('CoinGecko fetch error:', error);
    }
    
    return null;
  }

  // Coinbase implementation
  private async fetchCoinbaseData(symbol: string): Promise<CryptoData | null> {
    const config = getAPIConfig('coinbase');
    
    const url = `${config.baseUrl}/exchange-rates?currency=${symbol}`;
    const headers = {
      ...config.headers,
      'Authorization': `Bearer ${config.apiKey}`,
    };
    
    try {
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      if (data.data && data.data.rates) {
        const usdRate = 1 / parseFloat(data.data.rates.USD);
        
        // Coinbase exchange rates are limited, fetch more data from spot price
        const spotUrl = `${config.baseUrl}/prices/${symbol}-USD/spot`;
        const spotResponse = await fetch(spotUrl, { headers });
        const spotData = await spotResponse.json();
        
        return {
          id: symbol.toLowerCase(),
          symbol: symbol,
          name: symbol, // Coinbase doesn't provide full name in this endpoint
          currentPrice: spotData.data ? parseFloat(spotData.data.amount) : usdRate,
          marketCap: 0, // Not available from Coinbase
          volume24h: 0, // Not available from Coinbase
          priceChange24h: 0,
          priceChangePercentage24h: 0,
          circulatingSupply: 0,
          totalSupply: 0,
          ath: 0,
          athDate: '',
          atl: 0,
          atlDate: '',
        };
      }
    } catch (error) {
      console.error('Coinbase fetch error:', error);
    }
    
    return null;
  }

  // Batch update investment prices
  async updateInvestmentPrices(investments: Investment[]): Promise<Investment[]> {
    const updatedInvestments = await Promise.all(
      investments.map(async (investment) => {
        try {
          let quote: MarketQuote | CryptoData | null = null;
          
          if (investment.type === 'crypto') {
            const cryptoData = await this.getCryptoQuote(investment.symbol);
            if (cryptoData) {
              quote = {
                symbol: cryptoData.symbol,
                price: cryptoData.currentPrice,
                change: cryptoData.priceChange24h,
                changePercent: cryptoData.priceChangePercentage24h,
                volume: cryptoData.volume24h,
                marketCap: cryptoData.marketCap,
                timestamp: new Date().toISOString(),
              };
            }
          } else {
            quote = await this.getStockQuote(investment.symbol);
          }
          
          if (quote) {
            return {
              ...investment,
              currentPrice: quote.price,
              dayChange: quote.change,
              dayChangePercent: quote.changePercent,
              lastUpdated: quote.timestamp,
            };
          }
        } catch (error) {
          console.error(`Failed to update price for ${investment.symbol}:`, error);
        }
        
        return investment;
      })
    );
    
    return updatedInvestments;
  }

  // Get market news
  async getMarketNews(symbols?: string[]): Promise<MarketNews[]> {
    // Implementation would fetch news from various sources
    // For now, return empty array
    return [];
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const marketDataService = new MarketDataService();