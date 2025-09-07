import { AuthError, User as SupabaseUser } from "@supabase/supabase-js";
import { createContext, useContext, useState, useEffect } from "react";
import { ReactNode } from "react";

import { supabase } from "../utils/supabase/client";

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

// Check if we're in local/demo mode
const isLocalMode = import.meta.env.VITE_USE_LOCAL_AUTH === 'true' || import.meta.env.VITE_USE_LOCAL_AUTH === true;

// Demo user for local mode
const DEMO_USER: User = {
  id: 'local-user-001',
  email: 'demo@subtracker.ai',
  name: 'Demo User',
  avatarUrl: undefined,
  createdAt: new Date().toISOString()
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleAuthAvailable, setGoogleAuthAvailable] = useState(!isLocalMode);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for local/demo mode first
        if (isLocalMode || !supabase) {
          console.log('🔐 Local/Demo mode activated!');
          
          // Check if user was previously signed in (stored in localStorage)
          const storedUser = localStorage.getItem('subtracker_local_user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setSession({ user: parsedUser });
          }
          setLoading(false);
          return;
        }

        // Normal Supabase flow
        if (supabase?.auth) {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth session error:', error);
            setError(error.message);
          } else if (session?.user) {
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              avatarUrl: session.user.user_metadata?.avatar_url,
              createdAt: session.user.created_at || new Date().toISOString()
            };
            setUser(user);
            setSession(session);
          }

          // Set up auth state listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (session?.user) {
                const user: User = {
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  avatarUrl: session.user.user_metadata?.avatar_url,
                  createdAt: session.user.created_at || new Date().toISOString()
                };
                setUser(user);
                setSession(session);
              } else {
                setUser(null);
                setSession(null);
              }
            }
          );

          // Cleanup subscription
          return () => {
            subscription?.unsubscribe();
          };
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);

      // Local/Demo mode
      if (isLocalMode || !supabase) {
        console.log('🔐 Local/Demo mode sign in');
        const localUser = { ...DEMO_USER, email, name: email.split('@')[0] };
        setUser(localUser);
        setSession({ user: localUser });
        localStorage.setItem('subtracker_local_user', JSON.stringify(localUser));
        return { success: true, user: localUser };
      }

      // Normal Supabase flow
      if (supabase?.auth) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setError(error.message);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const user: User = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || email.split('@')[0],
            avatarUrl: data.user.user_metadata?.avatar_url,
            createdAt: data.user.created_at || new Date().toISOString()
          };
          setUser(user);
          setSession(data.session);
          return { success: true, user };
        }
      }

      return { success: false, error: 'Authentication service not available' };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to sign in';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null);

      // Local/Demo mode
      if (isLocalMode || !supabase) {
        console.log('🔐 Account created but needs verification. Attempting direct sign-in...');
        return signIn(email, password);
      }

      // Normal Supabase flow
      if (supabase?.auth) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        });

        if (error) {
          setError(error.message);
          return { success: false, error: error.message };
        }

        if (data.user) {
          // For demo purposes, auto-sign in after signup
          return signIn(email, password);
        }
      }

      return { success: false, error: 'Authentication service not available' };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to sign up';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);

      if (isLocalMode || !supabase) {
        return { 
          success: false, 
          error: 'Google authentication is not available in demo mode' 
        };
      }

      if (supabase?.auth) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });

        if (error) {
          setError(error.message);
          return { success: false, error: error.message };
        }

        return { success: true };
      }

      return { success: false, error: 'Authentication service not available' };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to sign in with Google';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      setError(null);

      // Local/Demo mode
      if (isLocalMode || !supabase) {
        setUser(null);
        setSession(null);
        localStorage.removeItem('subtracker_local_user');
        return { success: true };
      }

      // Normal Supabase flow
      if (supabase?.auth) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          setError(error.message);
          return { success: false, error: error.message };
        }
        setUser(null);
        setSession(null);
        return { success: true };
      }

      return { success: false, error: 'Authentication service not available' };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to sign out';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const forceSignOut = async () => {
    try {
      // Clear all auth data
      setUser(null);
      setSession(null);
      setError(null);
      
      // Clear local storage
      localStorage.removeItem('subtracker_local_user');
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // If using Supabase, sign out there too
      if (supabase?.auth) {
        await supabase.auth.signOut();
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to force sign out' };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);

      if (isLocalMode || !supabase) {
        return { 
          success: false, 
          error: 'Password reset is not available in demo mode' 
        };
      }

      if (supabase?.auth) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) {
          setError(error.message);
          return { success: false, error: error.message };
        }

        return { success: true };
      }

      return { success: false, error: 'Authentication service not available' };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to reset password';
      setError(errorMessage);
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
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};