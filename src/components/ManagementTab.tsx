import {
  Settings,
  CreditCard,
  Download,
  Upload,
  Trash2,
  Shield,
  Bell,
  Moon,
  Sun,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useState } from "react";

import type { AppSettings } from "../types/constants";
import type { FullSubscription, PaymentCard } from "../types/subscription";
import { formatCurrency } from "../utils/helpers";

import { ImportDialog } from "./ImportDialog";
import { ManageCards } from "./ManageCards";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

interface ManagementTabProps {
  subscriptions: FullSubscription[];
  cards: PaymentCard[];
  settings: AppSettings;
  onAddCard: (card: Omit<PaymentCard, "id" | "dateAdded">) => void;
  onEditCard: (card: PaymentCard) => void;
  onDeleteCard: (id: string) => void;
  onSetDefaultCard: (id: string) => void;
  onBulkEdit: (ids: string[], updates: Partial<FullSubscription>) => void;
  onBulkDelete: (ids: string[]) => void;
  onImportData: (data: any) => void;
  onExportData: (format: "json" | "csv") => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onResetApp: () => void;
  onDataSync: (data: any) => void;
  onConflictResolution: (conflicts: any[]) => void;
}

export const ManagementTab = ({
  subscriptions,
  cards,
  settings,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onSetDefaultCard,
  onImportData,
  onExportData,
  onUpdateSettings,
  onResetApp,
}: ManagementTabProps) => {
  const [activeSection, setActiveSection] = useState("overview");
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Detect dark mode
  const isDarkMode = document.documentElement.classList.contains("dark");

  // Theme-aware text colors
  const textPrimary = isDarkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = isDarkMode ? "text-gray-400" : "text-gray-600";

  // Glassmorphic styles
  const glassStyles = {
    backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: isDarkMode ? "1px solid rgba(75, 85, 99, 0.3)" : "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: isDarkMode
      ? "0 8px 32px 0 rgba(0, 0, 0, 0.6)"
      : "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  };

  const updateNotificationSetting = (key: keyof AppSettings["notifications"], value: boolean) => {
    onUpdateSettings({
      ...settings,
      notifications: { ...settings.notifications, [key]: value },
    });
  };

  const updatePreference = (key: keyof AppSettings["preferences"], value: any) => {
    onUpdateSettings({
      ...settings,
      preferences: { ...settings.preferences, [key]: value },
    });
  };

  const updateThreshold = (key: keyof AppSettings["thresholds"], value: number) => {
    onUpdateSettings({
      ...settings,
      thresholds: { ...settings.thresholds, [key]: value },
    });
  };

  // Enhanced import handler for the new dialog system
  const handleEnhancedImport = (data: {
    subscriptions: FullSubscription[];
    cards: PaymentCard[];
  }) => {
    console.log("📥 Enhanced import received:", data);

    // Convert to the format expected by the existing handler
    const importData = {
      subscriptions: data.subscriptions,
      cards: data.cards,
      version: "4.0-enhanced",
      importDate: new Date().toISOString(),
    };

    onImportData(importData);
  };

  const sections = [
    { id: "overview", label: "Overview", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "cards", label: "Payment Cards", icon: CreditCard },
    { id: "data", label: "Data Management", icon: Download },
    { id: "advanced", label: "Advanced", icon: Shield },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card style={glassStyles}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textMuted}`}>Total Subscriptions</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{subscriptions.length}</p>
              </div>
              <Settings className={`w-8 h-8 ${textMuted}`} />
            </div>
          </CardContent>
        </Card>

        <Card style={glassStyles}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textMuted}`}>Payment Cards</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>{cards.length}</p>
              </div>
              <CreditCard className={`w-8 h-8 ${textMuted}`} />
            </div>
          </CardContent>
        </Card>

        <Card style={glassStyles}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${textMuted}`}>Monthly Total</p>
                <p className={`text-2xl font-bold ${textPrimary}`}>
                  {formatCurrency(
                    subscriptions
                      .filter((s) => s.status === "active")
                      .reduce((total, s) => total + (s.cost || 0), 0)
                  )}
                </p>
              </div>
              <Badge variant="outline" className="ml-2">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme Toggle */}
      <Card style={glassStyles}>
        <CardHeader>
          <CardTitle className={`flex items-center ${textPrimary}`}>
            {settings.preferences.darkMode ? (
              <Moon className="w-5 h-5 mr-2" />
            ) : (
              <Sun className="w-5 h-5 mr-2" />
            )}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className={textPrimary}>
              Dark Mode
            </Label>
            <Switch
              id="dark-mode"
              checked={settings.preferences.darkMode}
              onCheckedChange={(checked) => updatePreference("darkMode", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotifications = () => (
    <Card style={glassStyles}>
      <CardHeader>
        <CardTitle className={`flex items-center ${textPrimary}`}>
          <Bell className="w-5 h-5 mr-2" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="upcoming-payments" className={textPrimary}>
            Upcoming Payments
          </Label>
          <Switch
            id="upcoming-payments"
            checked={settings.notifications.upcomingPayments}
            onCheckedChange={(checked) => updateNotificationSetting("upcomingPayments", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="high-spending" className={textPrimary}>
            High Spending Alerts
          </Label>
          <Switch
            id="high-spending"
            checked={settings.notifications.highSpending}
            onCheckedChange={(checked) => updateNotificationSetting("highSpending", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="trial-expirations" className={textPrimary}>
            Trial Expirations
          </Label>
          <Switch
            id="trial-expirations"
            checked={settings.notifications.trialExpirations}
            onCheckedChange={(checked) => updateNotificationSetting("trialExpirations", checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="high-spending-amount" className={textPrimary}>
            High Spending Threshold
          </Label>
          <Input
            id="high-spending-amount"
            type="number"
            value={settings.thresholds.highSpendingAmount}
            onChange={(e) => updateThreshold("highSpendingAmount", Number(e.target.value))}
            className={`w-full ${
              isDarkMode
                ? "bg-gray-700/50 border-gray-600 text-gray-100"
                : "bg-white/50 border-gray-200 text-gray-900"
            }`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="upcoming-days" className={textPrimary}>
            Upcoming Payment Alert (days)
          </Label>
          <Input
            id="upcoming-days"
            type="number"
            value={settings.thresholds.upcomingPaymentDays}
            onChange={(e) => updateThreshold("upcomingPaymentDays", Number(e.target.value))}
            className={`w-full ${
              isDarkMode
                ? "bg-gray-700/50 border-gray-600 text-gray-100"
                : "bg-white/50 border-gray-200 text-gray-900"
            }`}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderCards = () => (
    <Card style={glassStyles}>
      <CardHeader>
        <CardTitle className={`flex items-center ${textPrimary}`}>
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Cards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ManageCards
          cards={cards}
          onAddCard={onAddCard}
          onEditCard={onEditCard}
          onDeleteCard={onDeleteCard}
          onSetDefault={onSetDefaultCard}
        />
      </CardContent>
    </Card>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
      {/* Enhanced Export/Import */}
      <Card style={glassStyles}>
        <CardHeader>
          <CardTitle className={`flex items-center ${textPrimary}`}>
            <Download className="w-5 h-5 mr-2" />
            Data Export & Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Section */}
          <div>
            <h4 className={`font-medium mb-3 ${textPrimary}`}>Export Data</h4>
            <p className={`text-sm mb-4 ${textMuted}`}>
              Download your subscription data in JSON or CSV format for backup or migration
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => onExportData("json")}
                variant="outline"
                className={`${
                  isDarkMode
                    ? "bg-gray-700/50 hover:bg-gray-600 text-gray-100 border-gray-600"
                    : "bg-white/50 hover:bg-white/70 text-gray-900 border-gray-200"
                }`}
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button
                onClick={() => onExportData("csv")}
                variant="outline"
                className={`${
                  isDarkMode
                    ? "bg-gray-700/50 hover:bg-gray-600 text-gray-100 border-gray-600"
                    : "bg-white/50 hover:bg-white/70 text-gray-900 border-gray-200"
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Import Section */}
          <div>
            <h4 className={`font-medium mb-3 ${textPrimary}`}>Import Data</h4>
            <p className={`text-sm mb-4 ${textMuted}`}>
              Import subscription data from JSON or CSV files with preview and validation
            </p>
            <Button
              onClick={() => setShowImportDialog(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
          </div>

          {/* Data Statistics */}
          <div className="pt-4 border-t">
            <h4 className={`font-medium mb-3 ${textPrimary}`}>Current Data</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-lg font-bold ${textPrimary}`}>
                  {subscriptions.filter((s) => s.status === "active").length}
                </div>
                <div className={`text-xs ${textMuted}`}>Active</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${textPrimary}`}>
                  {subscriptions.filter((s) => s.status === "cancelled").length}
                </div>
                <div className={`text-xs ${textMuted}`}>Cancelled</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${textPrimary}`}>
                  {subscriptions.filter((s) => s.status === "watchlist").length}
                </div>
                <div className={`text-xs ${textMuted}`}>Watchlist</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${textPrimary}`}>{cards.length}</div>
                <div className={`text-xs ${textMuted}`}>Cards</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clear All Data */}
      <Card
        style={{
          ...glassStyles,
          border: isDarkMode
            ? "1px solid rgba(220, 38, 38, 0.3)"
            : "1px solid rgba(220, 38, 38, 0.2)",
        }}
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center ${isDarkMode ? "text-red-400" : "text-red-600"}`}
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg ${isDarkMode ? "bg-red-900/20" : "bg-red-50"}`}>
            <p className={`text-sm mb-3 ${isDarkMode ? "text-red-200" : "text-red-800"}`}>
              Clear all subscription data, payment cards, and reset settings to defaults. This
              action cannot be undone.
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent
                style={{
                  backgroundColor: isDarkMode
                    ? "rgba(31, 41, 55, 0.95)"
                    : "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "0",
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className={textPrimary}>
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription className={textMuted}>
                    This will permanently delete all your subscriptions, payment cards, settings,
                    and notifications. This action cannot be undone. Consider exporting your data
                    first.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className={`${
                      isDarkMode
                        ? "bg-gray-600 hover:bg-gray-500 text-gray-100"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    } border-0`}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onResetApp}
                    className="bg-red-600 hover:bg-red-700 text-white border-0"
                  >
                    Yes, Clear Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdvanced = () => (
    <Card style={glassStyles}>
      <CardHeader>
        <CardTitle className={`flex items-center ${textPrimary}`}>
          <Shield className="w-5 h-5 mr-2" />
          Advanced Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-cancelled" className={textPrimary}>
            Show Cancelled Subscriptions
          </Label>
          <Switch
            id="show-cancelled"
            checked={settings.preferences.showCancelled}
            onCheckedChange={(checked) => updatePreference("showCancelled", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="show-favicons" className={textPrimary}>
            Show Service Favicons
          </Label>
          <Switch
            id="show-favicons"
            checked={settings.preferences.showFavicons}
            onCheckedChange={(checked) => updatePreference("showFavicons", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="group-by-category" className={textPrimary}>
            Group by Category
          </Label>
          <Switch
            id="group-by-category"
            checked={settings.preferences.groupByCategory}
            onCheckedChange={(checked) => updatePreference("groupByCategory", checked)}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className={`text-2xl font-semibold ${textPrimary}`}>Settings & Management</h2>
          <p className={`text-sm ${textMuted}`}>
            Manage your account, notifications, and application preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      activeSection === section.id
                        ? `${isDarkMode ? "bg-blue-900/20 text-blue-400" : "bg-blue-50 text-blue-700"}`
                        : `${textSecondary} hover:${isDarkMode ? "text-gray-200 bg-gray-700" : "text-gray-900 bg-gray-50"}`
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === "overview" && renderOverview()}
            {activeSection === "notifications" && renderNotifications()}
            {activeSection === "cards" && renderCards()}
            {activeSection === "data" && renderDataManagement()}
            {activeSection === "advanced" && renderAdvanced()}
          </div>
        </div>
      </div>

      {/* Enhanced Import Dialog */}
      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleEnhancedImport}
        existingSubscriptions={subscriptions}
        existingCards={cards}
      />
    </>
  );
};
