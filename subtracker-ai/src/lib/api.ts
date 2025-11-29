// Complete API client for SubTracker AI
// Connects to the Express.js backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

// ============================================
// Types
// ============================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  notificationPreferences: Record<string, unknown>;
  monthlyBudget: number;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: string;
  message: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  budgetLimit: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  subscriptions?: Subscription[];
  _count?: {
    subscriptions: number;
  };
}

export interface Payment {
  id: string;
  subscriptionId: string;
  userId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string | null;
  transactionId: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  notes: string | null;
  receiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
  subscription?: {
    id: string;
    name: string;
    provider: string;
    category?: Category;
  };
}

export interface Subscription {
  id: string;
  name: string;
  provider: string;
  cost: number;
  billingCycle: 'weekly' | 'monthly' | 'quarterly' | 'semi_annually' | 'annually';
  nextBillingDate: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  isActive: boolean;
  isPaused: boolean;
  pauseStartDate: string | null;
  pauseEndDate: string | null;
  autoRenew: boolean;
  reminderDays: number;
  notes: string | null;
  categoryId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  payments?: Payment[];
}

export interface DashboardData {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalMonthlySpending: number;
  upcomingBills: number;
  recentSubscriptions: Subscription[];
  nextBills: Subscription[];
}

export interface PaymentAnalytics {
  summary: {
    totalSpent: number;
    paymentCount: number;
    averagePayment: number;
  };
  categoryBreakdown: {
    category: string;
    total: number;
    count: number;
    color: string;
  }[];
  monthlyTrends: {
    month: string;
    total: number;
    count: number;
  }[];
}

export interface PaginatedPayments {
  payments: Payment[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ============================================
// Input Types for Create/Update Operations
// ============================================

export interface CreateSubscriptionInput {
  name: string;
  cost: number;
  billingCycle: 'weekly' | 'monthly' | 'quarterly' | 'semi_annually' | 'annually';
  nextBillingDate: string;
  description?: string;
  categoryId?: string;
}

export interface UpdateSubscriptionInput {
  name?: string;
  cost?: number;
  billingCycle?: 'weekly' | 'monthly' | 'quarterly' | 'semi_annually' | 'annually';
  nextBillingDate?: string;
  description?: string;
  categoryId?: string | null;
  isActive?: boolean;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  budgetLimit?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  budgetLimit?: number;
}

export interface CreatePaymentInput {
  subscriptionId: string;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  transactionId?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  notes?: string;
  receiptUrl?: string;
}

export interface UpdatePaymentInput {
  amount?: number;
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  notes?: string;
  receiptUrl?: string;
}

export interface PaymentQueryParams {
  subscriptionId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

// ============================================
// API Client Class
// ============================================

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  // Token management
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      // Handle 204 No Content (successful delete)
      if (response.status === 204) {
        return { data: undefined as T };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'An error occurred',
          message: data.message || 'Request failed',
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: 'Network error',
        message: 'Failed to connect to the server',
      };
    }
  }

  // ============================================
  // Authentication Methods
  // ============================================

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.request<void>('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return response;
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/profile');
  }

  async refreshToken(): Promise<ApiResponse<{ token: string; expiresIn: string }>> {
    const response = await this.request<{ token: string; expiresIn: string }>(
      '/auth/refresh',
      { method: 'POST' }
    );
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  // ============================================
  // Subscription Methods
  // ============================================

  async getSubscriptions(): Promise<ApiResponse<Subscription[]>> {
    return this.request<Subscription[]>('/subscriptions');
  }

  async getSubscription(id: string): Promise<ApiResponse<Subscription>> {
    return this.request<Subscription>(`/subscriptions/${id}`);
  }

  async createSubscription(data: CreateSubscriptionInput): Promise<ApiResponse<Subscription>> {
    return this.request<Subscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubscription(
    id: string,
    data: UpdateSubscriptionInput
  ): Promise<ApiResponse<Subscription>> {
    return this.request<Subscription>(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSubscription(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/subscriptions/${id}`, {
      method: 'DELETE',
    });
  }

  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return this.request<DashboardData>('/subscriptions/dashboard');
  }

  async getUpcomingBills(days: number = 30): Promise<ApiResponse<Subscription[]>> {
    return this.request<Subscription[]>(`/subscriptions/upcoming?days=${days}`);
  }

  // ============================================
  // Category Methods
  // ============================================

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>('/categories');
  }

  async getCategory(id: string): Promise<ApiResponse<Category>> {
    return this.request<Category>(`/categories/${id}`);
  }

  async createCategory(data: CreateCategoryInput): Promise<ApiResponse<Category>> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryInput
  ): Promise<ApiResponse<Category>> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // Payment Methods
  // ============================================

  async getPayments(params?: PaymentQueryParams): Promise<ApiResponse<PaginatedPayments>> {
    const queryParams = new URLSearchParams();
    if (params?.subscriptionId) queryParams.append('subscriptionId', params.subscriptionId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/payments?${queryString}` : '/payments';
    return this.request<PaginatedPayments>(endpoint);
  }

  async getPayment(id: string): Promise<ApiResponse<Payment>> {
    return this.request<Payment>(`/payments/${id}`);
  }

  async createPayment(data: CreatePaymentInput): Promise<ApiResponse<Payment>> {
    return this.request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayment(
    id: string,
    data: UpdatePaymentInput
  ): Promise<ApiResponse<Payment>> {
    return this.request<Payment>(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePayment(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/payments/${id}`, {
      method: 'DELETE',
    });
  }

  async getPaymentAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<PaymentAnalytics>> {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/payments/analytics/summary?${queryString}`
      : '/payments/analytics/summary';
    return this.request<PaymentAnalytics>(endpoint);
  }

  // ============================================
  // Health Check Methods
  // ============================================

  async healthCheck(): Promise<ApiResponse<{ status: string; uptime: number }>> {
    return this.request<{ status: string; uptime: number }>('/health');
  }

  async authHealthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/auth/health');
  }

  async testConnection(): Promise<ApiResponse<unknown>> {
    return this.request('/test');
  }
}

// ============================================
// Export Singleton Instance
// ============================================

export const api = new ApiClient(API_BASE_URL);

// Export class for testing
export { ApiClient };
