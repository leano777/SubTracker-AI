/**
 * Notification Preferences Component
 * Manage notification settings and preferences
 */

import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Clock, Save } from 'lucide-react';
import notificationService, { type NotificationPreferences } from '@/services/supabase/notificationService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export function NotificationPreferencesPanel() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    pushEnabled: true,
    reminderDays: 3,
    notificationTypes: {
      paymentReminders: true,
      priceChanges: true,
      renewals: true,
      budgetAlerts: true,
      trialEnding: true,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  // Save preferences
  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const success = await notificationService.updatePreferences(preferences);
      if (success) {
        toast.success('Notification preferences saved');
        setHasChanges(false);

        // Restart scheduler with new settings
        notificationService.stopNotificationScheduler();
        notificationService.startNotificationScheduler();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  // Update preference
  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Update notification type
  const updateNotificationType = (type: keyof NotificationPreferences['notificationTypes'], enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [type]: enabled,
      },
    }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            Loading preferences...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.emailEnabled}
              onCheckedChange={(checked) => updatePreference('emailEnabled', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser push notifications
                </p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences.pushEnabled}
              onCheckedChange={(checked) => updatePreference('pushEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="payment-reminders">💳 Payment Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded before subscription renewals
              </p>
            </div>
            <Switch
              id="payment-reminders"
              checked={preferences.notificationTypes.paymentReminders}
              onCheckedChange={(checked) => updateNotificationType('paymentReminders', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="price-changes">📈 Price Changes</Label>
              <p className="text-sm text-muted-foreground">
                Alert when subscription prices change
              </p>
            </div>
            <Switch
              id="price-changes"
              checked={preferences.notificationTypes.priceChanges}
              onCheckedChange={(checked) => updateNotificationType('priceChanges', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="renewals">🔄 Renewals</Label>
              <p className="text-sm text-muted-foreground">
                Confirmation when subscriptions renew
              </p>
            </div>
            <Switch
              id="renewals"
              checked={preferences.notificationTypes.renewals}
              onCheckedChange={(checked) => updateNotificationType('renewals', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="budget-alerts">⚠️ Budget Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Warnings when approaching budget limits
              </p>
            </div>
            <Switch
              id="budget-alerts"
              checked={preferences.notificationTypes.budgetAlerts}
              onCheckedChange={(checked) => updateNotificationType('budgetAlerts', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="trial-ending">⏰ Trial Ending</Label>
              <p className="text-sm text-muted-foreground">
                Notify before free trials expire
              </p>
            </div>
            <Switch
              id="trial-ending"
              checked={preferences.notificationTypes.trialEnding}
              onCheckedChange={(checked) => updateNotificationType('trialEnding', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timing Settings
          </CardTitle>
          <CardDescription>
            Configure when to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="reminder-days">
              Payment Reminder Days: {preferences.reminderDays} days before
            </Label>
            <Slider
              id="reminder-days"
              min={1}
              max={7}
              step={1}
              value={[preferences.reminderDays]}
              onValueChange={([value]) => updatePreference('reminderDays', value)}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              How many days before payment to send reminders
            </p>
          </div>

          {preferences.quietHours && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quiet-hours">Quiet Hours</Label>
                  <Switch
                    id="quiet-hours"
                    checked={preferences.quietHours.enabled}
                    onCheckedChange={(checked) =>
                      updatePreference('quietHours', {
                        ...preferences.quietHours,
                        enabled: checked,
                      })
                    }
                  />
                </div>
                {preferences.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quiet-start">Start Time</Label>
                      <Input
                        id="quiet-start"
                        type="time"
                        value={preferences.quietHours.startTime}
                        onChange={(e) =>
                          updatePreference('quietHours', {
                            ...preferences.quietHours,
                            startTime: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiet-end">End Time</Label>
                      <Input
                        id="quiet-end"
                        type="time"
                        value={preferences.quietHours.endTime}
                        onChange={(e) =>
                          updatePreference('quietHours', {
                            ...preferences.quietHours,
                            endTime: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button
            onClick={savePreferences}
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default NotificationPreferencesPanel;