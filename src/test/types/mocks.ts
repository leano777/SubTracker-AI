import { vi, type MockedFunction } from 'vitest';
import type { 
  SupabaseClient, 
  AuthChangeEvent, 
  Session, 
  User,
  AuthError,
  Subscription,
  AuthTokenResponsePassword,
  AuthResponse,
  OAuthResponse,
  SignOut,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  SignInWithOAuthCredentials
} from '@supabase/supabase-js';

// Mock types for Supabase auth methods
export interface MockSupabaseAuth {
  getSession: MockedFunction<any>;
  onAuthStateChange: MockedFunction<any>;
  signInWithPassword: MockedFunction<any>;
  signUp: MockedFunction<any>;
  signInWithOAuth: MockedFunction<any>;
  signOut: MockedFunction<any>;
  resetPasswordForEmail: MockedFunction<any>;
}

// Mock types for Supabase database operations
export interface MockSupabaseFrom {
  select: MockedFunction<any>;
  insert: MockedFunction<any>;
  update: MockedFunction<any>;
  delete: MockedFunction<any>;
  eq: MockedFunction<any>;
  order: MockedFunction<any>;
  limit: MockedFunction<any>;
  single: MockedFunction<any>;
}

// Complete mock Supabase client
export interface MockSupabase {
  auth: MockSupabaseAuth;
  from: MockedFunction<any>;
}

// Export a utility function to create properly typed mocks
export const createMockSupabase = (): MockSupabase => ({
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
});
