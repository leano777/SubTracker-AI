import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

// Create a single shared Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

// Singleton pattern - create client only once
export const createClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          // Enhanced error handling for token refresh
          flowType: 'pkce'
        }
      }
    );
  }
  return supabaseInstance;
}

// Export the default shared client instance
export const supabase = createClient();