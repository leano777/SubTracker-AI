import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, UserPreferences } from '../types/database';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  syncData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useEnhancedAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useEnhancedAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const EnhancedAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage or session
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      // Check for stored session
      const storedSession = localStorage.getItem('subtracker_session');
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          
          // For now, use local user data
          // In production, this would validate with backend
          if (session.userId) {
            const storedUser = localStorage.getItem(`subtracker_user_${session.userId}`);
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
          }
        } catch (error) {
          console.error('Error loading session:', error);
        }
      }
      
      // If no user, create a local demo user
      if (!user) {
        const demoUser: User = {
          id: 'local-user-001',
          email: 'demo@subtracker.ai',
          name: 'Demo User',
          createdAt: new Date(),
          updatedAt: new Date(),
          preferences: {
            currency: 'USD',
            timezone: 'America/New_York',
            fiscalMonthStartDay: 1,
            darkMode: false,
            notifications: {
              emailNotifications: true,
              budgetAlerts: true,
              subscriptionReminders: true,
              weeklyReports: false,
              alertThreshold: 80
            },
            dataRetentionDays: 365
          },
          subscription: {
            plan: 'free',
            validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            features: ['unlimited_pods', 'basic_analytics', 'data_export']
          }
        };
        
        setUser(demoUser);
        localStorage.setItem(`subtracker_user_${demoUser.id}`, JSON.stringify(demoUser));
        localStorage.setItem('subtracker_session', JSON.stringify({ userId: demoUser.id }));
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual authentication with backend
      // For now, simulate authentication
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists locally
      const localUsers = JSON.parse(localStorage.getItem('subtracker_users') || '[]');
      const existingUser = localUsers.find((u: any) => u.email === email);
      
      if (existingUser) {
        // In production, verify password with backend
        setUser(existingUser);
        localStorage.setItem('subtracker_session', JSON.stringify({ userId: existingUser.id }));
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual registration with backend
      // For now, create local user
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          currency: 'USD',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          fiscalMonthStartDay: 1,
          darkMode: false,
          notifications: {
            emailNotifications: true,
            budgetAlerts: true,
            subscriptionReminders: true,
            weeklyReports: false,
            alertThreshold: 80
          },
          dataRetentionDays: 365
        },
        subscription: {
          plan: 'free',
          validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          features: ['unlimited_pods', 'basic_analytics', 'data_export']
        }
      };
      
      // Store user locally
      const localUsers = JSON.parse(localStorage.getItem('subtracker_users') || '[]');
      localUsers.push(newUser);
      localStorage.setItem('subtracker_users', JSON.stringify(localUsers));
      localStorage.setItem(`subtracker_user_${newUser.id}`, JSON.stringify(newUser));
      localStorage.setItem('subtracker_session', JSON.stringify({ userId: newUser.id }));
      
      setUser(newUser);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    
    try {
      // Clear session
      localStorage.removeItem('subtracker_session');
      
      // TODO: Call backend to invalidate session
      
      setUser(null);
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // TODO: Update profile on backend
      
      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date()
      };
      
      setUser(updatedUser);
      localStorage.setItem(`subtracker_user_${user.id}`, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // TODO: Update preferences on backend
      
      const updatedUser = {
        ...user,
        preferences: {
          ...user.preferences,
          ...preferences
        },
        updatedAt: new Date()
      };
      
      setUser(updatedUser);
      localStorage.setItem(`subtracker_user_${user.id}`, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const syncData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // TODO: Implement data sync with backend
      // This would sync all local data with the server
      
      console.log('Syncing data for user:', user.id);
      
      // Gather all local data
      const budgetPods = localStorage.getItem(`subtracker_enhanced_pods_${user.id}`);
      const transactions = localStorage.getItem(`subtracker_transactions_${user.id}`);
      const subscriptions = localStorage.getItem(`subtracker_data_${user.id}`);
      const investments = localStorage.getItem(`subtracker_investments_${user.id}`);
      const notebooks = localStorage.getItem(`subtracker_notebooks_${user.id}`);
      
      const dataToSync = {
        userId: user.id,
        timestamp: new Date().toISOString(),
        data: {
          budgetPods: budgetPods ? JSON.parse(budgetPods) : [],
          transactions: transactions ? JSON.parse(transactions) : [],
          subscriptions: subscriptions ? JSON.parse(subscriptions) : {},
          investments: investments ? JSON.parse(investments) : [],
          notebooks: notebooks ? JSON.parse(notebooks) : []
        }
      };
      
      // TODO: Send to backend
      console.log('Data to sync:', dataToSync);
      
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store sync timestamp
      localStorage.setItem(`subtracker_last_sync_${user.id}`, new Date().toISOString());
      
    } catch (error) {
      console.error('Data sync error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updatePreferences,
    syncData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default EnhancedAuthProvider;