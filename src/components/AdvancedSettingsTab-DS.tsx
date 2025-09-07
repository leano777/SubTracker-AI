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
import type { AppSettings } from "../types/constants";

// Design System Components
import { Button } from "../design-system/primitives/Button/Button";
import { Card } from "../design-system/primitives/Card/Card";
import { Input } from "../design-system/primitives/Input/Input";
import { Select } from "../design-system/primitives/Select/Select";
import { Switch } from "../design-system/primitives/Switch/Switch";
import { Badge } from "../design-system/primitives/Badge/Badge";
import { Tabs } from "../design-system/navigation/Tabs/Tabs";
import { Container } from "../design-system/layout/Container/Container";
import { Grid, GridItem } from "../design-system/layout/Grid/Grid";
import { Stack, HStack, VStack } from "../design-system/layout/Stack/Stack";
import { Alert } from "../design-system/feedback/Alert/Alert";
import { Progress } from "../design-system/feedback/Progress/Progress";

import { APIIntegrations } from "./settings/APIIntegrations";
import { ExportButton } from "./export/ExportButton";

interface AdvancedSettingsTabProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onExportData?: () => void;
  onImportData: () => void;
  onResetApp: () => void;
}

export const AdvancedSettingsTabDS = ({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onResetApp,
}: AdvancedSettingsTabProps) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

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

  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  const currencyOptions = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "JPY", label: "JPY (¥)" },
  ];

  const tabItems = [
    {
      id: "general",
      label: "General Settings",
      icon: <Settings className="w-4 h-4" />,
      content: (
        <VStack spacing="lg">
          {/* Appearance Section */}
          <Card title="Appearance" description="Customize the look and feel of your application">
            <VStack spacing="md">
              <div>
                <Select
                  label="Theme"
                  options={themeOptions}
                  value={localSettings.preferences.theme || "light"}
                  onChange={(value) =>
                    updateLocalSettings({
                      ...localSettings,
                      preferences: { ...localSettings.preferences, theme: value as any },
                    })
                  }
                />
              </div>

              <Switch
                checked={localSettings.preferences.animations ?? true}
                onChange={(checked) =>
                  updateLocalSettings({
                    ...localSettings,
                    preferences: { ...localSettings.preferences, animations: checked },
                  })
                }
                label="Enable animations"
                description="Show smooth transitions and animations"
              />

              <Switch
                checked={localSettings.preferences.sounds ?? false}
                onChange={(checked) =>
                  updateLocalSettings({
                    ...localSettings,
                    preferences: { ...localSettings.preferences, sounds: checked },
                  })
                }
                label="Enable sound effects"
                description="Play sounds for notifications and actions"
              />
            </VStack>
          </Card>

          {/* Notifications Section */}
          <Card title="Notifications" description="Configure how you receive alerts and reminders">
            <VStack spacing="md">
              <Switch
                checked={localSettings.notifications.paymentReminders ?? true}
                onChange={(checked) =>
                  updateLocalSettings({
                    ...localSettings,
                    notifications: { ...localSettings.notifications, paymentReminders: checked },
                  })
                }
                label="Payment reminders"
                description="Get notified before subscription payments"
              />

              <Switch
                checked={localSettings.notifications.priceChanges ?? true}
                onChange={(checked) =>
                  updateLocalSettings({
                    ...localSettings,
                    notifications: { ...localSettings.notifications, priceChanges: checked },
                  })
                }
                label="Price change alerts"
                description="Notify when subscription prices change"
              />

              <Switch
                checked={localSettings.notifications.renewalAlerts ?? true}
                onChange={(checked) =>
                  updateLocalSettings({
                    ...localSettings,
                    notifications: { ...localSettings.notifications, renewalAlerts: checked },
                  })
                }
                label="Renewal alerts"
                description="Alert before subscriptions renew"
              />

              <Input
                type="number"
                label="Reminder days before payment"
                value={localSettings.notifications.reminderDays ?? 3}
                onChange={(e) =>
                  updateLocalSettings({
                    ...localSettings,
                    notifications: {
                      ...localSettings.notifications,
                      reminderDays: parseInt(e.target.value) || 3,
                    },
                  })
                }
                helperText="How many days before payment to send reminders"
              />
            </VStack>
          </Card>

          {/* Currency & Locale */}
          <Card title="Currency & Locale" description="Set your preferred currency and date format">
            <VStack spacing="md">
              <Select
                label="Currency"
                options={currencyOptions}
                value={localSettings.currency || "USD"}
                onChange={(value) =>
                  updateLocalSettings({
                    ...localSettings,
                    currency: value,
                  })
                }
              />

              <Select
                label="Date format"
                options={[
                  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                ]}
                value={localSettings.dateFormat || "MM/DD/YYYY"}
                onChange={(value) =>
                  updateLocalSettings({
                    ...localSettings,
                    dateFormat: value,
                  })
                }
              />
            </VStack>
          </Card>

          {/* Data Management */}
          <Card title="Data Management" description="Import, export, and manage your data">
            <VStack spacing="md">
              <HStack spacing="md">
                <Button
                  variant="secondary"
                  leftIcon={<Upload className="w-4 h-4" />}
                  onClick={onImportData}
                >
                  Import Data
                </Button>
                {onExportData && (
                  <Button
                    variant="secondary"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={onExportData}
                  >
                    Export Data
                  </Button>
                )}
              </HStack>

              <Alert variant="warning">
                <strong>Danger Zone</strong>
                <p>This action cannot be undone. All your data will be permanently deleted.</p>
                <Button
                  variant="destructive"
                  size="sm"
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                  onClick={onResetApp}
                  className="mt-2"
                >
                  Reset Application
                </Button>
              </Alert>
            </VStack>
          </Card>
        </VStack>
      ),
    },
    {
      id: "integrations",
      label: "API Integrations",
      icon: <Key className="w-4 h-4" />,
      content: (
        <Card title="API Integrations" description="Connect external services to enhance functionality">
          <APIIntegrations />
        </Card>
      ),
    },
    {
      id: "security",
      label: "Security",
      icon: <Shield className="w-4 h-4" />,
      content: (
        <VStack spacing="lg">
          <Card title="Privacy & Security" description="Manage your privacy and security settings">
            <VStack spacing="md">
              <Switch
                checked={localSettings.privacy?.dataCollection ?? true}
                onChange={(checked) =>
                  updateLocalSettings({
                    ...localSettings,
                    privacy: { ...localSettings.privacy, dataCollection: checked },
                  })
                }
                label="Allow anonymous usage data"
                description="Help improve the app by sharing anonymous usage statistics"
              />

              <Switch
                checked={localSettings.privacy?.encryption ?? true}
                onChange={(checked) =>
                  updateLocalSettings({
                    ...localSettings,
                    privacy: { ...localSettings.privacy, encryption: checked },
                  })
                }
                label="Encrypt local data"
                description="Use encryption for sensitive data stored locally"
              />

              <Switch
                checked={localSettings.privacy?.autoBackup ?? false}
                onChange={(checked) =>
                  updateLocalSettings({
                    ...localSettings,
                    privacy: { ...localSettings.privacy, autoBackup: checked },
                  })
                }
                label="Automatic backups"
                description="Automatically backup your data to the cloud"
              />
            </VStack>
          </Card>

          <Card title="Session Management" description="Control your active sessions">
            <Alert variant="info">
              You are currently logged in from 1 device
            </Alert>
          </Card>
        </VStack>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" padding>
      <VStack spacing="lg">
        {/* Header */}
        <Card className="w-full">
          <HStack justify="between" align="center">
            <VStack spacing="xs">
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Settings
              </h1>
              <p className="text-[var(--color-text-secondary)]">
                Manage your application preferences and configuration
              </p>
            </VStack>
            
            {hasChanges && (
              <HStack spacing="sm">
                <Badge variant="warning">Unsaved changes</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<Save className="w-4 h-4" />}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </HStack>
            )}
          </HStack>
        </Card>

        {/* Main Content */}
        <Card className="w-full">
          <Tabs
            tabs={tabItems}
            defaultTab="general"
            variant="line"
            fullWidth
          />
        </Card>
      </VStack>
    </Container>
  );
};

export default AdvancedSettingsTabDS;