import {
  Settings,
  Bell,
  DollarSign,
  Palette,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Save,
  Moon,
  Sun,
  Zap,
  Lightbulb,
  Key,
} from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { APIIntegrations } from "./settings/APIIntegrations";
import { ExportButton } from "./export/ExportButton";

import type { AppSettings } from "../types/constants";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";

interface AdvancedSettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onExportData?: () => void;
  onImportData: () => void;
  onResetApp: () => void;
}

export const AdvancedSettingsTab = ({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onResetApp,
}: AdvancedSettingsTabProps) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Detect current theme
  const currentTheme = settings.preferences.theme || "light";
  const isDarkMode = currentTheme === "dark";
  const isStealthOps = currentTheme === "stealth-ops";

  // Theme-aware text colors
  const getTextColors = () => {
    if (isStealthOps) {
      return {
        primary: "text-white",
        secondary: "text-gray-300",
        muted: "text-gray-400",
        accent: "text-green-400",
      };
    }
    return {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      muted: isDarkMode ? "text-gray-400" : "text-gray-600",
      accent: isDarkMode ? "text-blue-400" : "text-blue-600",
    };
  };

  const textColors = getTextColors();

  const updateLocalSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...localSettings, ...newSettings };
    setLocalSettings(updated);
    setHasChanges(JSON.stringify(updated) !== JSON.stringify(settings));
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="general">General Settings</TabsTrigger>
        <TabsTrigger value="integrations">
          <Key className="w-4 h-4 mr-2" />
          API Integrations
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2
              className={`flex items-center space-x-2 ${textColors.primary} ${isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""}`}
            >
              <Settings className={`w-6 h-6 ${isStealthOps ? "text-green-400" : ""}`} />
              <span>{isStealthOps ? "[ADVANCED SETTINGS]" : "Advanced Settings"}</span>
            </h2>
            <p className={`${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}>
              {isStealthOps
                ? "[CUSTOMIZE YOUR SUBTRACKER EXPERIENCE]"
                : "Customize your subscription tracker experience"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <>
                <Button
                variant="outline"
                onClick={handleReset}
                className={`${
                  isStealthOps
                    ? "tactical-button border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono tracking-wide"
                    : ""
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {isStealthOps ? "[RESET]" : "Reset"}
              </Button>
                <Button
                  onClick={handleSave}
                  className={`${
                    isStealthOps
                      ? "bg-green-600 hover:bg-green-500 text-black font-mono tracking-wide tactical-glow"
                      : ""
                  }`}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isStealthOps ? "[SAVE CHANGES]" : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </div>

      {hasChanges && (
        <div
          className={`p-4 border rounded-lg ${
            isStealthOps
              ? "tactical-surface border border-yellow-400 tactical-glow"
              : "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800"
          }`}
          style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
        >
          <p
            className={`text-sm ${
              isStealthOps
                ? "text-yellow-400 font-mono tracking-wide"
                : "text-orange-700 dark:text-orange-300"
            }`}
          >
            {isStealthOps
              ? "[UNSAVED CHANGES DETECTED - REMEMBER TO SAVE]"
              : "You have unsaved changes. Don't forget to save your settings."}
          </p>
        </div>
      )}

      {/* Notifications Settings */}
      <Card className={isStealthOps ? "tactical-surface" : ""}>
        <CardHeader>
          <CardTitle
            className={`flex items-center space-x-2 ${textColors.primary} ${isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""}`}
          >
            <Bell className={`w-5 h-5 ${isStealthOps ? "text-green-400" : ""}`} />
            <span>{isStealthOps ? "[NOTIFICATIONS & ALERTS]" : "Notifications & Alerts"}</span>
          </CardTitle>
          <CardDescription
            className={`${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
          >
            {isStealthOps
              ? "[CONFIGURE ALERT PARAMETERS]"
              : "Configure when and how you want to be notified about your subscriptions"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label
                  htmlFor="upcomingPayments"
                  className={`${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps ? "[UPCOMING PAYMENT ALERTS]" : "Upcoming Payment Alerts"}
                </Label>
                <p
                  className={`text-sm ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps
                    ? "[ALERT BEFORE PAYMENTS DUE]"
                    : "Get notified before subscription payments are due"}
                </p>
              </div>
              <Switch
                id="upcomingPayments"
                checked={localSettings.notifications.upcomingPayments}
                onCheckedChange={(checked) =>
                  updateLocalSettings({
                    notifications: { ...localSettings.notifications, upcomingPayments: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label
                  htmlFor="highSpending"
                  className={`${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps ? "[HIGH SPENDING ALERTS]" : "High Spending Alerts"}
                </Label>
                <p
                  className={`text-sm ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps
                    ? "[ALERT WHEN THRESHOLD EXCEEDED]"
                    : "Get alerted when spending exceeds your threshold"}
                </p>
              </div>
              <Switch
                id="highSpending"
                checked={localSettings.notifications.highSpending}
                onCheckedChange={(checked) =>
                  updateLocalSettings({
                    notifications: { ...localSettings.notifications, highSpending: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label
                  htmlFor="trialExpirations"
                  className={`${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps ? "[TRIAL EXPIRATION ALERTS]" : "Free Trial Expiration Alerts"}
                </Label>
                <p
                  className={`text-sm ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps
                    ? "[ALERT BEFORE TRIALS EXPIRE]"
                    : "Get notified when free trials are about to expire"}
                </p>
              </div>
              <Switch
                id="trialExpirations"
                checked={localSettings.notifications.trialExpirations}
                onCheckedChange={(checked) =>
                  updateLocalSettings({
                    notifications: { ...localSettings.notifications, trialExpirations: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label
                  htmlFor="weeklyReports"
                  className={`${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps ? "[WEEKLY SUMMARY REPORTS]" : "Weekly Summary Reports"}
                </Label>
                <p
                  className={`text-sm ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps
                    ? "[WEEKLY INTEL REPORTS]"
                    : "Receive weekly spending summaries and insights"}
                </p>
              </div>
              <Switch
                id="weeklyReports"
                checked={localSettings.notifications.weeklyReports}
                onCheckedChange={(checked) =>
                  updateLocalSettings({
                    notifications: { ...localSettings.notifications, weeklyReports: checked },
                  })
                }
              />
            </div>
          </div>

          <Separator className={isStealthOps ? "border-gray-600" : ""} />

          <div className="space-y-4">
            <h4
              className={`font-medium ${textColors.primary} ${isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""}`}
            >
              {isStealthOps ? "[ALERT TIMING]" : "Alert Timing"}
            </h4>

            <div className="space-y-2">
              <Label
                htmlFor="upcomingPaymentDays"
                className={`${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
              >
                {isStealthOps ? "[UPCOMING PAYMENT DAYS]" : "Upcoming Payment Days"}
              </Label>
              <div className="flex items-center space-x-4">
                <Slider
                  value={[localSettings.thresholds.upcomingPaymentDays]}
                  onValueChange={(value) =>
                    updateLocalSettings({
                      thresholds: { ...localSettings.thresholds, upcomingPaymentDays: value[0] },
                    })
                  }
                  max={30}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <Badge
                  variant="outline"
                  className={`min-w-fit ${
                    isStealthOps
                      ? "tactical-surface border border-gray-600 font-mono tracking-wide"
                      : ""
                  }`}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  {localSettings.thresholds.upcomingPaymentDays} {isStealthOps ? "[DAYS]" : "days"}
                </Badge>
              </div>
              <p
                className={`text-xs ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
              >
                {isStealthOps
                  ? "[ALERT DAYS BEFORE PAYMENTS DUE]"
                  : "Get notified this many days before payments are due"}
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="trialReminderDays"
                className={`${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
              >
                {isStealthOps ? "[TRIAL REMINDER DAYS]" : "Trial Reminder Days"}
              </Label>
              <div className="flex items-center space-x-4">
                <Slider
                  value={[localSettings.thresholds.trialReminderDays]}
                  onValueChange={(value) =>
                    updateLocalSettings({
                      thresholds: { ...localSettings.thresholds, trialReminderDays: value[0] },
                    })
                  }
                  max={14}
                  min={1}
                  step={1}
                  className="flex-1"
                />
                <Badge
                  variant="outline"
                  className={`min-w-fit ${
                    isStealthOps
                      ? "tactical-surface border border-gray-600 font-mono tracking-wide"
                      : ""
                  }`}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  {localSettings.thresholds.trialReminderDays} {isStealthOps ? "[DAYS]" : "days"}
                </Badge>
              </div>
              <p
                className={`text-xs ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
              >
                {isStealthOps
                  ? "[ALERT DAYS BEFORE TRIALS EXPIRE]"
                  : "Get notified this many days before trials expire"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spending Thresholds */}
      <Card className={isStealthOps ? "tactical-surface" : ""}>
        <CardHeader>
          <CardTitle
            className={`flex items-center space-x-2 ${textColors.primary} ${isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""}`}
          >
            <DollarSign className={`w-5 h-5 ${isStealthOps ? "text-green-400" : ""}`} />
            <span>{isStealthOps ? "[SPENDING THRESHOLDS]" : "Spending Thresholds"}</span>
          </CardTitle>
          <CardDescription
            className={`${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
          >
            {isStealthOps
              ? "[SET SPENDING LIMITS AND BUDGET ALERTS]"
              : "Set spending limits and budget alerts"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="highSpendingAmount"
              className={`${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
            >
              {isStealthOps ? "[HIGH SPENDING ALERT THRESHOLD]" : "High Spending Alert Threshold"}
            </Label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <span
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textColors.muted}`}
                >
                  $
                </span>
                <Input
                  id="highSpendingAmount"
                  type="number"
                  min="0"
                  step="10"
                  value={localSettings.thresholds.highSpendingAmount}
                  onChange={(e) =>
                    updateLocalSettings({
                      thresholds: {
                        ...localSettings.thresholds,
                        highSpendingAmount: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className={`pl-8 ${isStealthOps ? "tactical-input font-mono tracking-wide" : ""}`}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                />
              </div>
              <Badge
                variant="outline"
                className={`${
                  isStealthOps
                    ? "tactical-surface border border-gray-600 font-mono tracking-wide"
                    : ""
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                {isStealthOps ? "[PER MONTH]" : "per month"}
              </Badge>
            </div>
            <p
              className={`text-xs ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
            >
              {isStealthOps
                ? "[ALERT WHEN MONTHLY COSTS EXCEED THIS AMOUNT]"
                : "Get alerted when your monthly subscription costs exceed this amount"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card className={isStealthOps ? "tactical-surface" : ""}>
        <CardHeader>
          <CardTitle
            className={`flex items-center space-x-2 ${textColors.primary} ${isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""}`}
          >
            <Palette className={`w-5 h-5 ${isStealthOps ? "text-green-400" : ""}`} />
            <span>{isStealthOps ? "[DISPLAY PREFERENCES]" : "Display Preferences"}</span>
          </CardTitle>
          <CardDescription
            className={`${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
          >
            {isStealthOps
              ? "[CUSTOMIZE APP APPEARANCE AND BEHAVIOR]"
              : "Customize how the app looks and behaves"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="defaultView"
                className={`${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
              >
                {isStealthOps ? "[DEFAULT VIEW]" : "Default View"}
              </Label>
              <Select
                value={localSettings.preferences.defaultView}
                onValueChange={(value) =>
                  updateLocalSettings({
                    preferences: { ...localSettings.preferences, defaultView: value },
                  })
                }
              >
                <SelectTrigger
                  className={`${isStealthOps ? "tactical-input font-mono tracking-wide" : ""}`}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={`${isStealthOps ? "tactical-surface border border-gray-600" : ""}`}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  <SelectItem value="dashboard">
                    {isStealthOps ? "[DASHBOARD]" : "Dashboard"}
                  </SelectItem>
                  <SelectItem value="active">
                    {isStealthOps ? "[ACTIVE SUBSCRIPTIONS]" : "Active Subscriptions"}
                  </SelectItem>
                  <SelectItem value="calendar">
                    {isStealthOps ? "[CALENDAR VIEW]" : "Calendar View"}
                  </SelectItem>
                  <SelectItem value="pay-periods">
                    {isStealthOps ? "[PAY PERIODS]" : "Pay Periods"}
                  </SelectItem>
                  <SelectItem value="watchlist">
                    {isStealthOps ? "[WATCHLIST]" : "Watchlist"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label
                    htmlFor="showFavicons"
                    className={`${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                  >
                    {isStealthOps ? "[SHOW SERVICE LOGOS]" : "Show Service Logos"}
                  </Label>
                  <p
                    className={`text-xs ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                  >
                    {isStealthOps
                      ? "[DISPLAY SERVICE ICONS]"
                      : "Display service icons throughout the app"}
                  </p>
                </div>
                <Switch
                  id="showFavicons"
                  checked={localSettings.preferences.showFavicons}
                  onCheckedChange={(checked) =>
                    updateLocalSettings({
                      preferences: { ...localSettings.preferences, showFavicons: checked },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Separator className={isStealthOps ? "border-gray-600" : ""} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label
                  htmlFor="showCancelled"
                  className={`${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps ? "[SHOW CANCELLED SUBSCRIPTIONS]" : "Show Cancelled Subscriptions"}
                </Label>
                <p
                  className={`text-xs ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps
                    ? "[INCLUDE CANCELLED IN OVERVIEW]"
                    : "Include cancelled subscriptions in overview"}
                </p>
              </div>
              <Switch
                id="showCancelled"
                checked={localSettings.preferences.showCancelled}
                onCheckedChange={(checked) =>
                  updateLocalSettings({
                    preferences: { ...localSettings.preferences, showCancelled: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label
                  htmlFor="groupByCategory"
                  className={`${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps ? "[GROUP BY CATEGORY]" : "Group by Category"}
                </Label>
                <p
                  className={`text-xs ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps
                    ? "[GROUP SUBSCRIPTIONS BY CATEGORY]"
                    : "Group subscriptions by category in lists"}
                </p>
              </div>
              <Switch
                id="groupByCategory"
                checked={localSettings.preferences.groupByCategory}
                onCheckedChange={(checked) =>
                  updateLocalSettings({
                    preferences: { ...localSettings.preferences, groupByCategory: checked },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="theme"
                className={`${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
              >
                {isStealthOps ? "[THEME]" : "Theme"}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() =>
                    updateLocalSettings({
                      preferences: {
                        ...localSettings.preferences,
                        theme: "light",
                        darkMode: false,
                      },
                    })
                  }
                  className={`p-3 border-2 transition-all duration-200 ${
                    isStealthOps ? "" : "rounded-lg"
                  } ${
                    localSettings.preferences.theme === "light"
                      ? `${isStealthOps ? "border-green-400 tactical-surface tactical-glow" : "border-primary bg-primary/10"}`
                      : `${isStealthOps ? "border-gray-600 hover:border-green-400 tactical-surface" : "border-border hover:border-primary/50"}`
                  }`}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Sun className={`w-5 h-5 ${isStealthOps ? "text-white" : ""}`} />
                    <span
                      className={`text-sm font-medium ${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                    >
                      {isStealthOps ? "[LIGHT]" : "Light"}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() =>
                    updateLocalSettings({
                      preferences: { ...localSettings.preferences, theme: "dark", darkMode: true },
                    })
                  }
                  className={`p-3 border-2 transition-all duration-200 ${
                    isStealthOps ? "" : "rounded-lg"
                  } ${
                    localSettings.preferences.theme === "dark"
                      ? `${isStealthOps ? "border-green-400 tactical-surface tactical-glow" : "border-primary bg-primary/10"}`
                      : `${isStealthOps ? "border-gray-600 hover:border-green-400 tactical-surface" : "border-border hover:border-primary/50"}`
                  }`}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Moon className={`w-5 h-5 ${isStealthOps ? "text-white" : ""}`} />
                    <span
                      className={`text-sm font-medium ${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                    >
                      {isStealthOps ? "[DARK]" : "Dark"}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() =>
                    updateLocalSettings({
                      preferences: {
                        ...localSettings.preferences,
                        theme: "stealth-ops",
                        darkMode: false,
                      },
                    })
                  }
                  className={`p-3 border-2 transition-all duration-200 ${
                    isStealthOps ? "" : "rounded-lg"
                  } ${
                    localSettings.preferences.theme === "stealth-ops"
                      ? `${isStealthOps ? "border-green-400 tactical-surface tactical-glow" : "border-green-500 bg-green-500/10"}`
                      : `${isStealthOps ? "border-gray-600 hover:border-green-400 tactical-surface" : "border-border hover:border-green-500/50"}`
                  }`}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Zap className={`w-5 h-5 ${isStealthOps ? "text-green-400" : ""}`} />
                    <span
                      className={`text-sm font-medium ${isStealthOps ? "text-green-400 font-mono tracking-wide" : ""}`}
                    >
                      {isStealthOps ? "[STEALTH OPS]" : "Stealth Ops"}
                    </span>
                  </div>
                </button>
              </div>
              <p
                className={`text-xs ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
              >
                {isStealthOps
                  ? "[CHOOSE INTERFACE THEME - STEALTH OPS FEATURES HIGH-CONTRAST TACTICAL STYLING]"
                  : "Choose your interface theme. Stealth Ops features high-contrast tactical styling for maximum readability."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Data Management Section - Matching Image Layout */}
      <div className="space-y-4">
        {/* Data Management Header */}
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 ${
              isStealthOps
                ? "tactical-surface border border-green-400 tactical-glow"
                : "bg-green-100 dark:bg-green-900/30 rounded-lg"
            }`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
          >
            <Shield
              className={`w-6 h-6 ${
                isStealthOps ? "text-green-400" : "text-green-600 dark:text-green-400"
              }`}
            />
          </div>
          <div>
            <h2
              className={`text-xl font-semibold ${textColors.primary} ${
                isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
              }`}
            >
              {isStealthOps ? "[DATA MANAGEMENT]" : "Data Management"}
            </h2>
            <p className={`${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}>
              {isStealthOps
                ? "[BACKUP, RESTORE, AND MANAGE YOUR SUBSCRIPTION DATA]"
                : "Backup, restore, and manage your subscription data"}
            </p>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export Data Card */}
          <Card
            className={`transition-all duration-200 ${
              isStealthOps
                ? "tactical-surface border border-gray-600"
                : "hover:shadow-lg"
            }`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div
                className={`mx-auto w-12 h-12 flex items-center justify-center ${
                  isStealthOps
                    ? "tactical-surface border border-green-400"
                    : "bg-blue-100 dark:bg-blue-900/30 rounded-lg"
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <Download
                  className={`w-6 h-6 ${
                    isStealthOps ? "text-green-400" : "text-blue-600 dark:text-blue-400"
                  }`}
                />
              </div>
              <div className="space-y-2">
                <h3
                  className={`font-semibold ${textColors.primary} ${
                    isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                  }`}
                >
                  {isStealthOps ? "[EXPORT DATA]" : "Export Data"}
                </h3>
                <p
                  className={`text-sm ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps
                    ? "[DOWNLOAD ALL YOUR SUBSCRIPTION DATA]"
                    : "Download all your subscriptions, cards, and settings"}
                </p>
                <ExportButton 
                  variant="outline"
                  className={`mt-4 ${
                    isStealthOps
                      ? "bg-transparent border-green-400 text-green-400 hover:bg-green-400/10"
                      : ""
                  }`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Import Data Card */}
          <Card
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              isStealthOps
                ? "tactical-surface border border-gray-600 hover:border-green-400 hover:tactical-glow"
                : "hover:shadow-lg"
            }`}
            onClick={onImportData}
            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div
                className={`mx-auto w-12 h-12 flex items-center justify-center ${
                  isStealthOps
                    ? "tactical-surface border border-green-400"
                    : "bg-green-100 dark:bg-green-900/30 rounded-lg"
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <Upload
                  className={`w-6 h-6 ${
                    isStealthOps ? "text-green-400" : "text-green-600 dark:text-green-400"
                  }`}
                />
              </div>
              <div className="space-y-2">
                <h3
                  className={`font-semibold ${textColors.primary} ${
                    isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                  }`}
                >
                  {isStealthOps ? "[IMPORT DATA]" : "Import Data"}
                </h3>
                <p
                  className={`text-sm ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps
                    ? "[RESTORE FROM BACKUP OR CSV]"
                    : "Restore from a backup file or import CSV data"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Reset App Card */}
          <Card
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              isStealthOps
                ? "tactical-surface border border-red-400 hover:border-red-300 hover:tactical-glow"
                : "border-red-200 bg-red-50 dark:bg-red-900/20 hover:shadow-lg"
            }`}
            onClick={() => {
              if (
                confirm(
                  isStealthOps
                    ? "[CONFIRM: DELETE ALL DATA? THIS CANNOT BE UNDONE]"
                    : "Are you sure you want to reset all data? This action cannot be undone."
                )
              ) {
                onResetApp();
              }
            }}
            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
          >
            <CardContent className="p-6 text-center space-y-4">
              <div
                className={`mx-auto w-12 h-12 flex items-center justify-center ${
                  isStealthOps
                    ? "tactical-surface border border-red-400"
                    : "bg-red-100 dark:bg-red-900/30 rounded-lg"
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <RotateCcw
                  className={`w-6 h-6 ${
                    isStealthOps ? "text-red-400" : "text-red-600 dark:text-red-400"
                  }`}
                />
              </div>
              <div className="space-y-2">
                <h3
                  className={`font-semibold ${
                    isStealthOps
                      ? "text-red-400 font-mono tracking-wide tactical-text-glow"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {isStealthOps ? "[RESET APP]" : "Reset App"}
                </h3>
                <p
                  className={`text-sm ${
                    isStealthOps
                      ? "text-red-400 font-mono tracking-wide"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isStealthOps
                    ? "[CLEAR ALL DATA AND RESET TO DEFAULTS]"
                    : "Clear all data and reset to default settings"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pro Tip Section */}
        <div
          className={`p-4 border ${
            isStealthOps
              ? "tactical-surface border border-yellow-400 tactical-glow"
              : "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 rounded-lg"
          }`}
          style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 w-6 h-6 flex items-center justify-center ${
                isStealthOps ? "" : "rounded-full bg-amber-100 dark:bg-amber-900/50"
              }`}
            >
              <Lightbulb
                className={`w-4 h-4 ${
                  isStealthOps ? "text-yellow-400" : "text-amber-600 dark:text-amber-400"
                }`}
              />
            </div>
            <div className="flex-1">
              <h4
                className={`font-medium mb-2 ${
                  isStealthOps
                    ? "text-yellow-400 font-mono tracking-wide tactical-text-glow"
                    : "text-amber-800 dark:text-amber-200"
                }`}
              >
                {isStealthOps ? "[⚡ PRO TIP]" : "💡 Pro Tip"}
              </h4>
              <p
                className={`text-sm ${
                  isStealthOps
                    ? "text-yellow-300 font-mono tracking-wide"
                    : "text-amber-700 dark:text-amber-300"
                }`}
              >
                {isStealthOps
                  ? "[EXPORT YOUR DATA REGULARLY TO KEEP A BACKUP OF YOUR SUBSCRIPTION INFORMATION. THE EXPORT INCLUDES ALL SUBSCRIPTIONS, PAYMENT CARDS, AND YOUR CUSTOM SETTINGS.]"
                  : "Export your data regularly to keep a backup of your subscription information. The export includes all subscriptions, payment cards, and your custom settings."}
              </p>
            </div>
          </div>
        </div>
      </div>
      </TabsContent>

      <TabsContent value="integrations" className="space-y-6">
        <APIIntegrations />
      </TabsContent>
    </Tabs>
  );
};
