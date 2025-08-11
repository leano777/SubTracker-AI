import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

// Create a single shared Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

// Singleton pattern - create client only once
export const createClient = (): SupabaseClient => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  
  // Basic validation
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration');
  }
  
  supabaseInstance ??= createSupabaseClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Enhanced error handling for token refresh
        flowType: "pkce",
      },
    }
  );
  return supabaseInstance;
};

// Export the default shared client instance
export const supabase = createClient();
