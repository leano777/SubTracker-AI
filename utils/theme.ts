// Enhanced theme-aware glass styles with full Stealth Ops tactical integration
export const getGlassStyles = (isStealthOps: boolean, isDarkMode: boolean) => {
  if (isStealthOps) {
    return {
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(1px)',
      WebkitBackdropFilter: 'blur(1px)',
      border: '2px solid #333333',
      borderRadius: '0.125rem',
      boxShadow: '0 0 25px rgba(0, 255, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    };
  }
  return {
    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: isDarkMode ? '1px solid rgba(75, 85, 99, 0.3)' : '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '1rem',
    boxShadow: isDarkMode 
      ? '0 8px 32px 0 rgba(0, 0, 0, 0.6)' 
      : '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
  };
};

export const getGlassSecondaryStyles = (isStealthOps: boolean, isDarkMode: boolean) => {
  if (isStealthOps) {
    return {
      backgroundColor: 'rgba(10, 10, 10, 0.98)',
      backdropFilter: 'blur(1px)',
      WebkitBackdropFilter: 'blur(1px)',
      border: '1px solid #333333',
      borderRadius: '0.125rem',
      boxShadow: '0 0 20px rgba(0, 255, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
    };
  }
  return {
    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.6)' : 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: isDarkMode ? '1px solid rgba(75, 85, 99, 0.2)' : '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0.75rem',
    boxShadow: isDarkMode 
      ? '0 4px 16px 0 rgba(0, 0, 0, 0.4)' 
      : '0 4px 16px 0 rgba(31, 38, 135, 0.2)'
  };
};

export const getGlassAccentStyles = (isStealthOps: boolean, isDarkMode: boolean) => {
  if (isStealthOps) {
    return {
      backgroundColor: 'rgba(0, 0, 0, 1)',
      backdropFilter: 'blur(1px)',
      WebkitBackdropFilter: 'blur(1px)',
      border: '2px solid #333333',
      borderRadius: '0.125rem',
      boxShadow: '0 0 30px rgba(0, 255, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    };
  }
  return {
    backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: isDarkMode ? '1px solid rgba(75, 85, 99, 0.4)' : '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '1.5rem',
    boxShadow: isDarkMode 
      ? '0 12px 40px 0 rgba(0, 0, 0, 0.8)' 
      : '0 12px 40px 0 rgba(31, 38, 135, 0.37)'
  };
};

// Enhanced text colors with comprehensive Stealth Ops support
export const getTextColors = (isStealthOps: boolean, isDarkMode: boolean) => {
  if (isStealthOps) {
    return {
      primary: 'text-white font-mono tracking-wide tactical-text-glow',
      secondary: 'text-gray-300 font-mono tracking-wide',
      muted: 'text-gray-400 font-mono tracking-wide',
      onGlass: 'text-white font-mono tracking-wide',
      accent: 'text-green-400 font-mono tracking-wide tactical-text-glow',
      danger: 'text-red-400 font-mono tracking-wide',
      warning: 'text-yellow-400 font-mono tracking-wide',
      success: 'text-green-400 font-mono tracking-wide tactical-text-glow'
    };
  }
  return {
    primary: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    secondary: isDarkMode ? 'text-gray-300' : 'text-gray-700',
    muted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    onGlass: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    accent: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    danger: isDarkMode ? 'text-red-400' : 'text-red-600',
    warning: isDarkMode ? 'text-yellow-400' : 'text-yellow-600',
    success: isDarkMode ? 'text-green-400' : 'text-green-600'
  };
};

// Apply theme classes to document
export const applyThemeClasses = (currentTheme: string) => {
  const root = document.documentElement;
  root.classList.remove('dark', 'stealth-ops');
  
  switch (currentTheme) {
    case 'dark':
      root.classList.add('dark');
      break;
    case 'stealth-ops':
      root.classList.add('stealth-ops');
      break;
    default:
      // Light theme is default, no class needed
      break;
  }
};