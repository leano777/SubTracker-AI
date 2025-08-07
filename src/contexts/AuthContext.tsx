import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../utils/supabase/client"; // Use shared singleton
import { AuthError, User as SupabaseUser } from "@supabase/supabase-js";

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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleAuthAvailable, setGoogleAuthAvailable] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Helper function to clear corrupted auth data (ONLY auth tokens, NOT user data)
  const clearCorruptedAuthData = () => {
    console.log("🧹 Clearing corrupted auth tokens only...");
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
        console.log(`🗑️ Removed corrupted auth key: ${key}`);
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

      console.log("✅ Corrupted auth tokens cleared, user data preserved");
    } catch (error) {
      console.error("❌ Failed to clear corrupted auth data:", error);
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
        console.log("🔍 Initializing auth state...");

        // Check if supabase client is available
        if (!supabase || !supabase.auth) {
          console.error("❌ Supabase client or auth module not available");
          setError("Authentication service not available");
          setLoading(false);
          return;
        }

        console.log("✅ Supabase client available, checking session...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Session check error:", error);

          // Check if this is an auth session error
          if (isAuthSessionError(error)) {
            console.log("🔄 Auth session error detected, clearing corrupted data...");
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
          console.log("✅ Active session found:", session.user.email);
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
          console.log("ℹ️ No active session found");
          setUser(null);
          setSession(null);
        }

        setError(null);
        setLoading(false);
      } catch (err) {
        console.error("💥 Auth initialization error:", err);

        // Check if this is an auth session error
        if (isAuthSessionError(err)) {
          console.log("🔄 Auth session error in catch block, clearing corrupted data...");
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
            console.log("🔄 Auth state change:", event);

            if (event === "SIGNED_IN" && session?.user) {
              console.log("✅ User signed in:", session.user.email);
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

              // Check if this is a new user (email confirmation)
              const isNewUser =
                session.user.email_confirmed_at &&
                new Date(session.user.email_confirmed_at).getTime() > Date.now() - 60000; // Within last minute

              if (isNewUser) {
                console.log("🎉 New user email confirmed successfully:", session.user.email);
              }
            } else if (event === "SIGNED_OUT") {
              console.log("✅ User signed out");
              setUser(null);
              setSession(null);
              setError(null);
            } else if (event === "TOKEN_REFRESHED" && session) {
              console.log("🔄 Token refreshed successfully");
              setSession(session);
              setError(null);
            }
            setLoading(false);
          } catch (err) {
            console.error("💥 Auth state change error:", err);

            // Check if this is an auth session error
            if (isAuthSessionError(err)) {
              console.log("🔄 Auth session error in state change, clearing corrupted data...");
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
      console.error("💥 Error setting up auth listener:", err);

      // Check if this is an auth session error
      if (isAuthSessionError(err)) {
        console.log("🔄 Auth session error in listener setup, clearing corrupted data...");
        clearCorruptedAuthData();
        setUser(null);
        setSession(null);
        setError(null);
        setLoading(false);
      }
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
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
            name: name,
            full_name: name,
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return { success: false, error: error.message };
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
    console.log("🚪 Starting signOut process...");
    setLoading(true);

    try {
      // Check if supabase and auth are available
      if (!supabase) {
        console.error("❌ Supabase client not available");
        throw new Error("Authentication service not available - supabase client missing");
      }

      if (!supabase.auth) {
        console.error("❌ Supabase auth module not available");
        throw new Error("Authentication service not available - auth module missing");
      }

      console.log("🔄 Calling supabase.auth.signOut()...");
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("❌ Supabase signOut error:", error);
        setError(error.message);
        setLoading(false);
        return { success: false, error: error.message };
      }

      console.log("✅ Supabase signOut successful");
      setUser(null);
      setError(null);
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error("💥 SignOut exception:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to sign out";
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Force sign out - bypasses Supabase and clears everything locally
  const forceSignOut = async () => {
    console.log("🔧 Starting force signOut...");
    setLoading(true);

    try {
      // Clear user state immediately
      setUser(null);
      setError(null);

      // Clear all browser storage
      console.log("🧹 Clearing storage...");
      try {
        localStorage.clear();
        sessionStorage.clear();

        // Clear Supabase specific storage keys
        const supabaseKeys = Object.keys(localStorage).filter(
          (key) => key.includes("supabase") || key.includes("auth")
        );
        supabaseKeys.forEach((key) => localStorage.removeItem(key));

        console.log("✅ Storage cleared");
      } catch (storageError) {
        console.error("⚠️ Storage clearing failed:", storageError);
      }

      // Try to call Supabase signOut if available, but don't fail if it doesn't work
      try {
        if (supabase?.auth) {
          console.log("🔄 Attempting Supabase signOut as backup...");
          await supabase.auth.signOut();
          console.log("✅ Backup Supabase signOut successful");
        }
      } catch (supabaseError) {
        console.warn("⚠️ Supabase signOut failed during force logout:", supabaseError);
        // Continue anyway since we're forcing logout
      }

      setLoading(false);

      // Force reload to ensure clean state
      console.log("🔄 Reloading page to ensure clean state...");
      setTimeout(() => {
        window.location.reload();
      }, 100);

      return { success: true };
    } catch (err) {
      console.error("💥 Force signOut failed:", err);
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
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
