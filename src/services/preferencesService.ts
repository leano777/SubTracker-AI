/**
 * User Preferences Service
 * Manages user preferences like theme, currency, notifications
 */

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  notifications: {
    renewalReminders: boolean;
    budgetAlerts: boolean;
    weeklyReports: boolean;
    optimizationTips: boolean;
  };
  dashboard: {
    defaultView: 'breakdown' | 'calendar' | 'subscriptions' | 'debt' | 'analytics';
    showPotentialSavings: boolean;
    compactMode: boolean;
  };
  privacy: {
    analyticsTracking: boolean;
    dataSharing: boolean;
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  notifications: {
    renewalReminders: true,
    budgetAlerts: true,
    weeklyReports: false,
    optimizationTips: true
  },
  dashboard: {
    defaultView: 'breakdown',
    showPotentialSavings: true,
    compactMode: false
  },
  privacy: {
    analyticsTracking: true,
    dataSharing: false
  }
};

class PreferencesService {
  private static instance: PreferencesService;
  private preferences: UserPreferences;
  private listeners: Set<(preferences: UserPreferences) => void> = new Set();

  static getInstance(): PreferencesService {
    if (!PreferencesService.instance) {
      PreferencesService.instance = new PreferencesService();
    }
    return PreferencesService.instance;
  }

  constructor() {
    this.loadPreferences();
  }

  private loadPreferences() {
    try {
      const stored = localStorage.getItem('user_preferences');
      if (stored) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      } else {
        this.preferences = { ...DEFAULT_PREFERENCES };
      }
    } catch (error) {
      console.warn('Failed to load preferences:', error);
      this.preferences = { ...DEFAULT_PREFERENCES };
    }
  }

  private savePreferences() {
    try {
      localStorage.setItem('user_preferences', JSON.stringify(this.preferences));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.preferences));
  }

  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  updatePreferences(updates: Partial<UserPreferences>) {
    this.preferences = this.deepMerge(this.preferences, updates);
    this.savePreferences();
  }

  resetToDefaults() {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.savePreferences();
  }

  subscribe(listener: (preferences: UserPreferences) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Theme helpers
  getTheme(): 'light' | 'dark' {
    if (this.preferences.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return this.preferences.theme;
  }

  setTheme(theme: 'light' | 'dark' | 'system') {
    this.updatePreferences({ theme });
  }

  // Currency helpers
  getCurrency() {
    return this.preferences.currency;
  }

  setCurrency(currency: UserPreferences['currency']) {
    this.updatePreferences({ currency });
  }

  formatCurrency(amount: number): string {
    const currency = this.getCurrency();
    
    const formatters: Record<string, Intl.NumberFormat> = {
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
      GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
      CAD: new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }),
      AUD: new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })
    };

    return formatters[currency]?.format(amount) || formatters.USD.format(amount);
  }

  // Date helpers
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const format = this.preferences.dateFormat;

    switch (format) {
      case 'DD/MM/YYYY':
        return dateObj.toLocaleDateString('en-GB');
      case 'YYYY-MM-DD':
        return dateObj.toISOString().split('T')[0];
      default: // MM/DD/YYYY
        return dateObj.toLocaleDateString('en-US');
    }
  }

  // Notification helpers
  shouldShowNotification(type: keyof UserPreferences['notifications']): boolean {
    return this.preferences.notifications[type];
  }

  // Dashboard helpers
  getDefaultView() {
    return this.preferences.dashboard.defaultView;
  }

  shouldShowPotentialSavings(): boolean {
    return this.preferences.dashboard.showPotentialSavings;
  }

  isCompactMode(): boolean {
    return this.preferences.dashboard.compactMode;
  }

  // Privacy helpers
  isAnalyticsEnabled(): boolean {
    return this.preferences.privacy.analyticsTracking;
  }

  isDataSharingEnabled(): boolean {
    return this.preferences.privacy.dataSharing;
  }

  // Utility method for deep merging objects
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  // Export/Import preferences
  exportPreferences(): string {
    return JSON.stringify(this.preferences, null, 2);
  }

  importPreferences(preferencesJson: string): boolean {
    try {
      const imported = JSON.parse(preferencesJson);
      this.updatePreferences(imported);
      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }
}

export const preferencesService = PreferencesService.getInstance();