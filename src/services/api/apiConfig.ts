// API Configuration and Key Management
// This file manages API keys and endpoints for various financial services

export interface APIConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  requiresAuth: boolean;
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
  headers?: Record<string, string>;
}

// API Configurations (keys should be stored in environment variables in production)
export const API_CONFIGS: Record<string, APIConfig> = {
  // Market Data APIs
  alphaVantage: {
    name: 'Alpha Vantage',
    baseUrl: 'https://www.alphavantage.co/query',
    apiKey: import.meta.env.VITE_ALPHA_VANTAGE_KEY || 'demo',
    requiresAuth: true,
    rateLimit: {
      requests: 5,
      windowMs: 60000, // 5 requests per minute for free tier
    },
  },
  
  yahooFinance: {
    name: 'Yahoo Finance',
    baseUrl: 'https://query2.finance.yahoo.com',
    requiresAuth: false,
    rateLimit: {
      requests: 100,
      windowMs: 60000,
    },
  },
  
  // Cryptocurrency APIs
  coinGecko: {
    name: 'CoinGecko',
    baseUrl: 'https://api.coingecko.com/api/v3',
    apiKey: import.meta.env.VITE_COINGECKO_KEY,
    requiresAuth: false, // Free tier available without auth
    rateLimit: {
      requests: 10,
      windowMs: 60000,
    },
  },
  
  coinbase: {
    name: 'Coinbase',
    baseUrl: 'https://api.coinbase.com/v2',
    apiKey: import.meta.env.VITE_COINBASE_KEY,
    requiresAuth: true,
    headers: {
      'CB-VERSION': '2023-01-01',
    },
  },
  
  // Banking & Transaction APIs
  plaid: {
    name: 'Plaid',
    baseUrl: import.meta.env.VITE_PLAID_ENV === 'production' 
      ? 'https://production.plaid.com' 
      : 'https://sandbox.plaid.com',
    apiKey: import.meta.env.VITE_PLAID_SECRET,
    requiresAuth: true,
    headers: {
      'Content-Type': 'application/json',
    },
  },
  
  // Brokerage APIs
  robinhood: {
    name: 'Robinhood',
    baseUrl: 'https://api.robinhood.com',
    requiresAuth: true,
    // Note: Robinhood requires OAuth2 authentication
  },
  
  // Alternative Market Data
  finnhub: {
    name: 'Finnhub',
    baseUrl: 'https://finnhub.io/api/v1',
    apiKey: import.meta.env.VITE_FINNHUB_KEY,
    requiresAuth: true,
    rateLimit: {
      requests: 60,
      windowMs: 60000,
    },
  },
  
  // IEX Cloud for reliable market data
  iexCloud: {
    name: 'IEX Cloud',
    baseUrl: 'https://cloud.iexapis.com/stable',
    apiKey: import.meta.env.VITE_IEX_CLOUD_KEY,
    requiresAuth: true,
    rateLimit: {
      requests: 100,
      windowMs: 1000, // Per second
    },
  },
};

// Helper to get API configuration
export const getAPIConfig = (apiName: keyof typeof API_CONFIGS): APIConfig => {
  const config = API_CONFIGS[apiName];
  if (!config) {
    throw new Error(`API configuration not found for: ${apiName}`);
  }
  return config;
};

// Check if API key is configured
export const isAPIConfigured = (apiName: keyof typeof API_CONFIGS): boolean => {
  const config = API_CONFIGS[apiName];
  if (!config.requiresAuth) return true;
  return !!config.apiKey && config.apiKey !== 'demo';
};

// Get available APIs
export const getAvailableAPIs = (): string[] => {
  return Object.keys(API_CONFIGS).filter(apiName => 
    isAPIConfigured(apiName as keyof typeof API_CONFIGS)
  );
};

// API Priority for fallback
export const API_PRIORITY = {
  stocks: ['alphaVantage', 'yahooFinance', 'finnhub', 'iexCloud'],
  crypto: ['coinGecko', 'coinbase'],
  banking: ['plaid'],
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  enableRateLimiting: true,
  retryAfterLimit: true,
  maxRetries: 3,
  retryDelay: 1000, // ms
};

// Cache configuration
export const CACHE_CONFIG = {
  enableCaching: true,
  defaultTTL: 300000, // 5 minutes
  priceTTL: 60000,    // 1 minute for price data
  quoteTTL: 30000,    // 30 seconds for quotes
  newsTTL: 600000,    // 10 minutes for news
  fundamentalsTTL: 86400000, // 24 hours for fundamentals
};