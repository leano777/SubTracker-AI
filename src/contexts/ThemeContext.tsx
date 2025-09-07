/**
 * Theme Context - Enhanced with Tactical Dark Mode
 * Provides dark/light/tactical theme switching across the application
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'tactical-dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  isDarkMode: boolean;
  isTacticalMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'tactical-dark' 
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    // Validate the saved theme
    if (savedTheme && ['light', 'dark', 'tactical-dark'].includes(savedTheme)) {
      return savedTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);
    
    // Apply theme to document root
    const root = document.documentElement;
    
    // Remove all theme classes first
    root.classList.remove('light', 'dark', 'tactical-dark');
    root.removeAttribute('data-theme');
    
    // Add the current theme
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    
    const themeColors = {
      light: '#ffffff',
      dark: '#1a202c',
      'tactical-dark': '#0a0e13'
    };
    
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', themeColors[theme]);
    }
  }, [theme]);

  const toggleTheme = () => {
    const themeOrder: ThemeMode[] = ['light', 'dark', 'tactical-dark'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setThemeState(themeOrder[nextIndex]);
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const isDarkMode = theme === 'dark' || theme === 'tactical-dark';
  const isTacticalMode = theme === 'tactical-dark';

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
    isDarkMode,
    isTacticalMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme detection utilities
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
};

export const isHighContrast = (): boolean => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }
  return false;
};

export const prefersReducedMotion = (): boolean => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

// Utility hook for getting theme-aware classes
export const useThemeClasses = () => {
  const { theme, isTacticalMode } = useTheme();
  
  if (isTacticalMode) {
    return {
      // Card styles for tactical mode
      card: 'tactical-card',
      cardHover: 'tactical-card hover:shadow-lg hover:border-tactical-primary',
      
      // Button styles for tactical mode
      buttonPrimary: 'btn-tactical-primary',
      buttonSecondary: 'btn-tactical-secondary',
      buttonGhost: 'btn-tactical-ghost',
      
      // Input styles for tactical mode
      input: 'form-input-tactical',
      select: 'form-select-tactical',
      
      // Text styles for tactical mode
      heading: 'text-primary font-bold',
      subheading: 'text-secondary font-semibold',
      body: 'text-secondary',
      muted: 'text-muted',
      
      // Layout for tactical mode
      page: 'min-h-screen bg-primary',
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      
      // Status styles for tactical mode
      success: 'text-financial-income',
      error: 'text-financial-expense',
      warning: 'text-warning',
      info: 'text-info'
    };
  }
  
  // Default styles for light/dark themes
  const isDark = theme === 'dark';
  
  return {
    // Card styles
    card: `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl`,
    cardHover: `${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'} border rounded-xl transition-colors duration-200`,
    
    // Button styles
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200',
    buttonSecondary: `${isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'} px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors duration-200`,
    buttonGhost: `${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} px-4 py-2 rounded-lg transition-colors duration-200`,
    
    // Input styles
    input: `${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`,
    select: `${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`,
    
    // Text styles
    heading: `${isDark ? 'text-white' : 'text-gray-900'} font-semibold`,
    subheading: `${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium`,
    body: `${isDark ? 'text-gray-300' : 'text-gray-700'}`,
    muted: `${isDark ? 'text-gray-400' : 'text-gray-500'}`,
    
    // Layout
    page: `${isDark ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`,
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    
    // Status styles
    success: isDark ? 'text-green-400' : 'text-green-600',
    error: isDark ? 'text-red-400' : 'text-red-600',
    warning: isDark ? 'text-yellow-400' : 'text-yellow-600',
    info: isDark ? 'text-blue-400' : 'text-blue-600'
  };
};

export default ThemeContext;