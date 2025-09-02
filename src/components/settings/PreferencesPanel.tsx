/**
 * User Preferences Panel Component
 * Comprehensive settings for user preferences
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor,
  DollarSign,
  Calendar,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Download,
  Upload,
  RotateCcw,
  Palette,
  Globe,
  Shield,
  Layout,
  X
} from 'lucide-react';
import { preferencesService } from '../../services/preferencesService';
import type { UserPreferences } from '../../services/preferencesService';

interface PreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesChange?: (preferences: UserPreferences) => void;
}

type SettingsSection = 'appearance' | 'regional' | 'notifications' | 'dashboard' | 'privacy';

export const PreferencesPanel: React.FC<PreferencesPanelProps> = ({ 
  isOpen, 
  onClose, 
  onPreferencesChange 
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  const [preferences, setPreferences] = useState<UserPreferences>(preferencesService.getPreferences());
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPreferences(preferencesService.getPreferences());
      setHasChanges(false);
    }
  }, [isOpen]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const updateNestedPreferences = (section: keyof UserPreferences, updates: any) => {
    const newPreferences = {
      ...preferences,
      [section]: { ...preferences[section], ...updates }
    };
    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const savePreferences = () => {
    preferencesService.updatePreferences(preferences);
    setHasChanges(false);
    if (onPreferencesChange) {
      onPreferencesChange(preferences);
    }
  };

  const resetToDefaults = () => {
    preferencesService.resetToDefaults();
    setPreferences(preferencesService.getPreferences());
    setHasChanges(false);
    if (onPreferencesChange) {
      onPreferencesChange(preferencesService.getPreferences());
    }
  };

  const exportSettings = () => {
    const dataStr = preferencesService.exportPreferences();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'subtracker-preferences.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (preferencesService.importPreferences(content)) {
        setPreferences(preferencesService.getPreferences());
        setHasChanges(false);
        if (onPreferencesChange) {
          onPreferencesChange(preferencesService.getPreferences());
        }
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'regional', label: 'Regional', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'dashboard', label: 'Dashboard', icon: Layout },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4">
        <div 
          className="bg-gray-900 border border-gray-700 rounded-xl md:rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sidebar */}
          <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-medium text-white">Preferences</h2>
            </div>

            <nav className="space-y-2">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id as SettingsSection)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="mt-8 space-y-2">
              <button
                onClick={exportSettings}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Settings
              </button>
              
              <label className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Import Settings
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={resetToDefaults}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-light text-white capitalize">
                {activeSection} Settings
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <label className="text-white font-medium mb-3 block">Theme</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'light', icon: Sun, label: 'Light' },
                      { value: 'dark', icon: Moon, label: 'Dark' },
                      { value: 'system', icon: Monitor, label: 'System' }
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => updatePreferences({ theme: value as any })}
                        className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                          preferences.theme === value
                            ? 'border-blue-500 bg-blue-900/20 text-blue-400'
                            : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white font-medium mb-3 block">Compact Mode</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateNestedPreferences('dashboard', { compactMode: !preferences.dashboard.compactMode })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.dashboard.compactMode ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          preferences.dashboard.compactMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-gray-300">
                      {preferences.dashboard.compactMode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Regional Settings */}
            {activeSection === 'regional' && (
              <div className="space-y-6">
                <div>
                  <label className="text-white font-medium mb-3 block">Currency</label>
                  <select
                    value={preferences.currency}
                    onChange={(e) => updatePreferences({ currency: e.target.value as any })}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="USD">USD - US Dollar ($)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="GBP">GBP - British Pound (£)</option>
                    <option value="CAD">CAD - Canadian Dollar (C$)</option>
                    <option value="AUD">AUD - Australian Dollar (A$)</option>
                  </select>
                </div>

                <div>
                  <label className="text-white font-medium mb-3 block">Date Format</label>
                  <select
                    value={preferences.dateFormat}
                    onChange={(e) => updatePreferences({ dateFormat: e.target.value as any })}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (International)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                {Object.entries(preferences.notifications).map(([key, enabled]) => {
                  const labels: Record<string, string> = {
                    renewalReminders: 'Subscription Renewal Reminders',
                    budgetAlerts: 'Budget Alerts',
                    weeklyReports: 'Weekly Spending Reports',
                    optimizationTips: 'Optimization Tips'
                  };

                  return (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{labels[key]}</h4>
                        <p className="text-gray-400 text-sm">
                          {key === 'renewalReminders' && 'Get notified before subscriptions renew'}
                          {key === 'budgetAlerts' && 'Alert when you exceed budget limits'}
                          {key === 'weeklyReports' && 'Weekly summary of your spending'}
                          {key === 'optimizationTips' && 'Tips to optimize your subscriptions'}
                        </p>
                      </div>
                      <button
                        onClick={() => updateNestedPreferences('notifications', { [key]: !enabled })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          enabled ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dashboard Settings */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <label className="text-white font-medium mb-3 block">Default View</label>
                  <select
                    value={preferences.dashboard.defaultView}
                    onChange={(e) => updateNestedPreferences('dashboard', { defaultView: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="breakdown">Expense Breakdown</option>
                    <option value="calendar">Calendar View</option>
                    <option value="subscriptions">Subscriptions</option>
                    <option value="debt">Debt Payments</option>
                    <option value="analytics">Analytics</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Show Potential Savings</h4>
                    <p className="text-gray-400 text-sm">Display optimization tips and savings opportunities</p>
                  </div>
                  <button
                    onClick={() => updateNestedPreferences('dashboard', { showPotentialSavings: !preferences.dashboard.showPotentialSavings })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.dashboard.showPotentialSavings ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        preferences.dashboard.showPotentialSavings ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                {Object.entries(preferences.privacy).map(([key, enabled]) => {
                  const labels: Record<string, string> = {
                    analyticsTracking: 'Analytics Tracking',
                    dataSharing: 'Data Sharing'
                  };

                  return (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{labels[key]}</h4>
                        <p className="text-gray-400 text-sm">
                          {key === 'analyticsTracking' && 'Help improve the app by sharing usage data'}
                          {key === 'dataSharing' && 'Share anonymous data for research purposes'}
                        </p>
                      </div>
                      <button
                        onClick={() => updateNestedPreferences('privacy', { [key]: !enabled })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          enabled ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Save/Cancel Bar */}
        {hasChanges && (
          <div className="fixed bottom-4 right-4 flex gap-2">
            <button
              onClick={() => {
                setPreferences(preferencesService.getPreferences());
                setHasChanges(false);
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={savePreferences}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </>
  );
};