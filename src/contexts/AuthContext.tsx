import type { AuthError, User as SupabaseUser } from "@supabase/supabase-js";
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

import { supabase } from "../utils/supabase/client"; // Use shared singleton

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  googleAuthAvailable: boolean;
  session: any;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; user?: any }>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string; user?: any }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  forceSignOut: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleAuthAvailable, setGoogleAuthAvailable] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Helper function to clear corrupted auth data (ONLY auth tokens, NOT user data)
  const clearCorruptedAuthData = () => {
    try {
      // Clear ONLY Supabase auth-related localStorage items, preserve user data cache
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("sb-") ||
            key.includes("supabase.auth.token") ||
            key.includes("supabase-auth-token") ||
            (key.includes("supabase") && key.includes("auth")) ||
            key.includes("refresh_token") ||
            key.includes("access_token"))
        ) {
          // ONLY clear auth tokens, NOT user data cache (subtracker_cache_)
          if (!key.includes("subtracker_cache_")) {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Clear sessionStorage (but preserve any user data)
      const sessionKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && !key.includes("subtracker_")) {
          sessionKeysToRemove.push(key);
        }
      }

      sessionKeysToRemove.forEach((key) => {
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      // Silent cleanup failure - auth will handle gracefully
    }
  };

  // Helper function to detect auth session errors
  const isAuthSessionError = (error: any): boolean => {
    const errorMessage = error?.message || error?.toString() || "";
    return (
      (errorMessage.includes("refresh") &&
        (errorMessage.includes("token") || errorMessage.includes("Token")) &&
        (errorMessage.includes("Invalid") ||
          errorMessage.includes("Not Found") ||
          errorMessage.includes("expired"))) ||
      errorMessage.includes("Auth session missing") ||
      errorMessage.includes("AuthSessionMissingError") ||
      errorMessage.includes("No session") ||
      (errorMessage.includes("JWT") && errorMessage.includes("expired"))
    );
  };

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session with enhanced error handling
    const getInitialSession = async () => {
      try {
        // Check if supabase client is available
        if (!supabase?.auth) {
          setError("Authentication service not available");
          setLoading(false);
          return;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          // Check if this is an auth session error
          if (isAuthSessionError(error)) {
            clearCorruptedAuthData();
            setUser(null);
            setSession(null);
            setError(null);
            setLoading(false);
            return;
          }

          setError(error.message);
          setLoading(false);
          return;
        }

        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || "",
            name:
              session.user.user_metadata?.name ||
              session.user.user_metadata?.full_name ||
              session.user.email ||
              "User",
            avatarUrl: session.user.user_metadata?.avatar_url,
            createdAt: session.user.created_at,
          };
          setUser(userData);
          setSession(session);
        } else {
          setUser(null);
          setSession(null);
        }

        setError(null);
        setLoading(false);
      } catch (err) {
        // Check if this is an auth session error
        if (isAuthSessionError(err)) {
          clearCorruptedAuthData();
          setUser(null);
          setSession(null);
          setError(null);
          setLoading(false);
          return;
        }

        setError("Failed to initialize authentication");
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes with enhanced error handling
    let subscription: any = null;

    try {
      if (supabase?.auth) {
        const {
          data: { subscription: authSubscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          try {
            if (event === "SIGNED_IN" && session?.user) {
              const userData: User = {
                id: session.user.id,
                email: session.user.email || "",
                name:
                  session.user.user_metadata?.name ||
                  session.user.user_metadata?.full_name ||
                  session.user.email ||
                  "User",
                avatarUrl: session.user.user_metadata?.avatar_url,
                createdAt: session.user.created_at,
              };
              setUser(userData);
              setSession(session);
              setError(null);
            } else if (event === "SIGNED_OUT") {
              setUser(null);
              setSession(null);
              setError(null);
            } else if (event === "TOKEN_REFRESHED" && session) {
              setSession(session);
              setError(null);
            }
            setLoading(false);
          } catch (err) {
            // Check if this is an auth session error
            if (isAuthSessionError(err)) {
              clearCorruptedAuthData();
              setUser(null);
              setSession(null);
              setError(null);
              setLoading(false);
              return;
            }

            setError("Authentication state error");
            setLoading(false);
          }
        });

        subscription = authSubscription;
      }
    } catch (err) {
      // Check if this is an auth session error
      if (isAuthSessionError(err)) {
        clearCorruptedAuthData();
        setUser(null);
        setSession(null);
        setError(null);
        setLoading(false);
      }
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Development demo mode
      if (email === 'demo@demo.com' && password === 'demo123') {
        const demoUser: User = {
          id: 'demo-user-id',
          email: 'demo@demo.com',
          name: 'Demo User',
          avatarUrl: undefined,
          createdAt: new Date().toISOString(),
        };
        setUser(demoUser);
        setError(null);
        setLoading(false);
        console.log('🔐 Demo mode activated!');
        return { success: true, user: demoUser };
      }

      if (!supabase?.auth) {
        throw new Error("Authentication service not available");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return { success: false, error: error.message };
      }

      setLoading(false);
      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!supabase?.auth) {
        throw new Error("Authentication service not available");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            full_name: name,
          },
          emailRedirectTo: undefined, // Disable email verification for development
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return { success: false, error: error.message };
      }

      // For development: if user exists but email not confirmed, try to sign them in
      if (data.user && !data.session) {
        console.log('🔐 Account created but needs verification. Attempting direct sign-in...');
        const signInResult = await signIn(email, password);
        if (signInResult.success) {
          setLoading(false);
          return { success: true, user: data.user };
        }
      }

      setLoading(false);
      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account";
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!supabase?.auth) {
        throw new Error("Authentication service not available");
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        // Removed redirectTo option to avoid redirect_uri_mismatch
        // Supabase will handle the redirect automatically
      });

      if (error) {
        // Check for specific OAuth configuration errors
        if (
          error.message.includes("provider is not enabled") ||
          error.message.includes("Unsupported provider") ||
          error.message.includes("redirect_uri_mismatch")
        ) {
          setGoogleAuthAvailable(false);

          let configError = "Google sign-in configuration error. ";

          if (error.message.includes("redirect_uri_mismatch")) {
            configError +=
              "The redirect URI in Google Cloud Console doesn't match the expected URL. ";
            configError += `Make sure you have added this exact URL: https://ythtqafqwglruxzikipo.supabase.co/auth/v1/callback`;
          } else if (error.message.includes("provider is not enabled")) {
            configError += "Google OAuth provider is not enabled in Supabase.";
          } else {
            configError += "Please check your Google OAuth configuration.";
          }

          setError(configError);
          setLoading(false);
          return { success: false, error: configError };
        }

        setError(error.message);
        setLoading(false);
        return { success: false, error: error.message };
      }

      setLoading(false);
      return { success: true };
    } catch (err: any) {
      // Handle network or other errors
      let errorMessage = err.message || "Failed to sign in with Google";

      if (
        err.message &&
        (err.message.includes("provider is not enabled") ||
          err.message.includes("redirect_uri_mismatch"))
      ) {
        setGoogleAuthAvailable(false);
        errorMessage = "Google sign-in configuration error. Please check the setup instructions.";
      }

      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    setLoading(true);

    try {
      // Check if supabase and auth are available
      if (!supabase) {
        throw new Error("Authentication service not available - supabase client missing");
      }

      if (!supabase.auth) {
        throw new Error("Authentication service not available - auth module missing");
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error.message);
        setLoading(false);
        return { success: false, error: error.message };
      }

      setUser(null);
      setError(null);
      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign out";
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Force sign out - bypasses Supabase and clears everything locally
  const forceSignOut = async () => {
    setLoading(true);

    try {
      // Clear user state immediately
      setUser(null);
      setError(null);

      // Clear all browser storage
      try {
        localStorage.clear();
        sessionStorage.clear();

        // Clear Supabase specific storage keys
        const supabaseKeys = Object.keys(localStorage).filter(
          (key) => key.includes("supabase") || key.includes("auth")
        );
        supabaseKeys.forEach((key) => localStorage.removeItem(key));
      } catch (storageError) {
        // Storage clearing failed, continue anyway
      }

      // Try to call Supabase signOut if available, but don't fail if it doesn't work
      try {
        if (supabase?.auth) {
          await supabase.auth.signOut();
        }
      } catch (supabaseError) {
        // Continue anyway since we're forcing logout
      }

      setLoading(false);

      // Force reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 100);

      return { success: true };
    } catch (err) {
      setLoading(false);

      // Even if force logout fails, try to reload the page
      setTimeout(() => {
        window.location.reload();
      }, 100);

      return { success: true }; // Return success since we're reloading anyway
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!supabase?.auth) {
        throw new Error("Authentication service not available");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send reset email";
      return { success: false, error: errorMessage };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    googleAuthAvailable,
    session,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    forceSignOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
