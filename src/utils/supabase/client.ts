import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

// Create a single shared Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

// Singleton pattern - create client only once
export const createClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
      auth: {
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Enhanced error handling for token refresh
        flowType: "pkce",
      },
    });
  }
  return supabaseInstance;
};

// Export the default shared client instance
export const supabase = createClient();
