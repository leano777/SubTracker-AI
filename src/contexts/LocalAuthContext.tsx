import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

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

// Local development auth provider - no external dependencies
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for saved local user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('local_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error loading saved user:', e);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // For local development, accept any credentials
    const userData: User = {
      id: 'local-user-1',
      email: email,
      name: email.split('@')[0],
      avatarUrl: undefined,
      createdAt: new Date().toISOString(),
    };
    
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('local_user', JSON.stringify(userData));
    
    return { success: true, user: userData };
  };

  const signUp = async (email: string, password: string, name: string) => {
    // For local development, create user immediately
    const userData: User = {
      id: `local-user-${Date.now()}`,
      email: email,
      name: name || email.split('@')[0],
      avatarUrl: undefined,
      createdAt: new Date().toISOString(),
    };
    
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('local_user', JSON.stringify(userData));
    
    return { success: true, user: userData };
  };

  const signInWithGoogle = async () => {
    // Simulate Google sign-in for local development
    const userData: User = {
      id: 'google-user-1',
      email: 'user@gmail.com',
      name: 'Google User',
      avatarUrl: undefined,
      createdAt: new Date().toISOString(),
    };
    
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('local_user', JSON.stringify(userData));
    
    return { success: true };
  };

  const signOut = async () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('local_user');
    // Keep financial data intact
    return { success: true };
  };

  const forceSignOut = async () => {
    return signOut();
  };

  const resetPassword = async (email: string) => {
    // Simulate password reset
    console.log('Password reset requested for:', email);
    return { success: true };
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated,
    googleAuthAvailable: false, // Disabled for local auth
    session: null,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    forceSignOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};