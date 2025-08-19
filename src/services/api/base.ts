// Base API service configuration and utilities
// Foundation for Phase 4 API integrations

export interface APICredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  webhook?: string;
}

export interface APIServiceConfig {
  name: string;
  baseUrl: string;
  version: string;
  credentials?: APICredentials;
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  rateLimitPerMinute?: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    rateLimit?: {
      remaining: number;
      reset: string;
    };
  };
}

export abstract class BaseAPIService {
  protected config: APIServiceConfig;
  protected lastRequestTime: number = 0;
  protected requestCount: number = 0;
  protected rateLimitReset: number = Date.now();

  constructor(config: APIServiceConfig) {
    this.config = config;
  }

  // Rate limiting implementation
  protected async checkRateLimit(): Promise<void> {
    if (!this.config.rateLimitPerMinute) return;

    const now = Date.now();
    if (now > this.rateLimitReset) {
      this.requestCount = 0;
      this.rateLimitReset = now + 60000; // Reset every minute
    }

    if (this.requestCount >= this.config.rateLimitPerMinute) {
      const waitTime = this.rateLimitReset - now;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.rateLimitReset = Date.now() + 60000;
    }

    this.requestCount++;
    this.lastRequestTime = now;
  }

  // Generic request method with retry logic
  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    await this.checkRateLimit();

    const url = `${this.config.baseUrl}/${this.config.version}/${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...options.headers,
    };

    let attempts = 0;
    const maxAttempts = this.config.retryAttempts || 3;

    while (attempts < maxAttempts) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          this.config.timeout || 30000
        );

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        // Check for rate limit headers
        const rateLimit = {
          remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
          reset: response.headers.get('X-RateLimit-Reset') || '',
        };

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited, wait and retry
            const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            attempts++;
            continue;
          }

          const errorData = await response.json().catch(() => ({}));
          return {
            success: false,
            error: {
              code: response.status.toString(),
              message: errorData.message || response.statusText,
              details: errorData,
            },
            metadata: {
              timestamp: new Date().toISOString(),
              rateLimit,
            },
          };
        }

        const data = await response.json();
        return {
          success: true,
          data,
          metadata: {
            timestamp: new Date().toISOString(),
            rateLimit,
          },
        };
      } catch (error: any) {
        attempts++;
        if (attempts >= maxAttempts) {
          return {
            success: false,
            error: {
              code: 'NETWORK_ERROR',
              message: error.message || 'Network request failed',
              details: error,
            },
            metadata: {
              timestamp: new Date().toISOString(),
            },
          };
        }
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
      }
    }

    return {
      success: false,
      error: {
        code: 'MAX_RETRIES',
        message: 'Maximum retry attempts exceeded',
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Abstract methods to be implemented by specific services
  abstract authenticate(): Promise<boolean>;
  abstract testConnection(): Promise<boolean>;
  abstract getAccountInfo(): Promise<APIResponse>;
}

// Secure credential storage using browser's crypto API
export class SecureCredentialStore {
  private static STORAGE_KEY = 'subtracker_api_credentials';
  
  static async encryptCredentials(credentials: Record<string, APICredentials>): Promise<string> {
    // In production, use proper encryption
    // For now, using base64 encoding as placeholder
    const json = JSON.stringify(credentials);
    return btoa(json);
  }

  static async decryptCredentials(encrypted: string): Promise<Record<string, APICredentials>> {
    // In production, use proper decryption
    // For now, using base64 decoding as placeholder
    try {
      const json = atob(encrypted);
      return JSON.parse(json);
    } catch {
      return {};
    }
  }

  static async saveCredentials(service: string, credentials: APICredentials): Promise<void> {
    const existing = await this.getAllCredentials();
    existing[service] = credentials;
    const encrypted = await this.encryptCredentials(existing);
    localStorage.setItem(this.STORAGE_KEY, encrypted);
  }

  static async getCredentials(service: string): Promise<APICredentials | null> {
    const all = await this.getAllCredentials();
    return all[service] || null;
  }

  static async getAllCredentials(): Promise<Record<string, APICredentials>> {
    const encrypted = localStorage.getItem(this.STORAGE_KEY);
    if (!encrypted) return {};
    return this.decryptCredentials(encrypted);
  }

  static async removeCredentials(service: string): Promise<void> {
    const existing = await this.getAllCredentials();
    delete existing[service];
    const encrypted = await this.encryptCredentials(existing);
    localStorage.setItem(this.STORAGE_KEY, encrypted);
  }
}

// API Service Registry
export class APIServiceRegistry {
  private static services: Map<string, BaseAPIService> = new Map();

  static register(name: string, service: BaseAPIService): void {
    this.services.set(name, service);
  }

  static get(name: string): BaseAPIService | undefined {
    return this.services.get(name);
  }

  static getAll(): Map<string, BaseAPIService> {
    return this.services;
  }

  static async testAllConnections(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [name, service] of this.services) {
      try {
        results[name] = await service.testConnection();
      } catch {
        results[name] = false;
      }
    }
    
    return results;
  }
}