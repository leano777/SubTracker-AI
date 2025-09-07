import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

// Create a single shared Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

// Check if we're in local/demo mode
const isLocalMode = import.meta.env.VITE_USE_LOCAL_AUTH === 'true' || import.meta.env.VITE_USE_LOCAL_AUTH === true;

// Singleton pattern - create client only once
export const createClient = (): SupabaseClient | null => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  
  // In local mode, return null (we'll handle auth locally)
  if (isLocalMode) {
    console.log('🔐 Local/Demo mode - Supabase client not initialized');
    return null;
  }
  
  // Basic validation
  if (!supabaseUrl || 
      !supabaseKey || 
      supabaseUrl === 'https://your-project.supabase.co' || 
      supabaseKey === 'your-supabase-anon-key') {
    console.warn('⚠️ Supabase configuration missing or using placeholder values');
    console.log('🔐 Falling back to local/demo mode');
    return null;
  }
  
  if (!supabaseInstance) {
    try {
      supabaseInstance = createSupabaseClient(
        supabaseUrl,
        supabaseKey,
        {
          auth: {
            storage: typeof window !== "undefined" ? window.localStorage : undefined,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: "pkce",
          },
        }
      );
      console.log('✅ Supabase client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error);
      return null;
    }
  }
  
  return supabaseInstance;
};

// Export the default shared client instance (might be null in local mode)
export const supabase = createClient();