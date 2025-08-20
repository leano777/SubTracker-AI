/**
 * Smart Notifications Component
 * Intelligent notification system with AI-powered insights and alerts
 */

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  X,
  Settings,
  Clock,
  Zap
} from 'lucide-react';
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFinancialStore } from '@/stores/useFinancialStore';
import intelligenceService, { type BudgetAlert, type SmartRecommendation } from '@/services/intelligenceService';

interface SmartNotification {
  id: string;
  type: 'payment_due' | 'price_change' | 'budget_alert' | 'recommendation' | 'duplicate_found' | 'usage_low' | 'trial_ending';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  subscriptionId?: string;
  actionRequired: boolean;
  createdAt: string;
  readAt?: string;
  dismissedAt?: string;
  metadata?: any;
}

interface NotificationSettings {
  enableSmartAlerts: boolean;
  priceChangeAlerts: boolean;
  duplicateDetection: boolean;
  budgetOverruns: boolean;
  unusedSubscriptions: boolean;
  trialReminders: boolean;
  optimizationSuggestions: boolean;
}

interface SmartNotificationsProps {
  className?: string;
  onOpenSettings?: () => void;
}

export function SmartNotifications({ className, onOpenSettings }: SmartNotificationsProps) {
  const { subscriptions } = useFinancialStore();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    enableSmartAlerts: true,
    priceChangeAlerts: true,
    duplicateDetection: true,
    budgetOverruns: true,
    unusedSubscriptions: true,
    trialReminders: true,
    optimizationSuggestions: true,
  });

  useEffect(() => {
    if (settings.enableSmartAlerts) {
      generateSmartNotifications();
    }
  }, [subscriptions, settings]);

  const generateSmartNotifications = async () => {
    const newNotifications: SmartNotification[] = [];

    // Payment due notifications
    if (settings.trialReminders) {
      const paymentDue = generatePaymentDueNotifications();
      newNotifications.push(...paymentDue);
    }

    // Budget alerts
    if (settings.budgetOverruns) {
      const budgetAlerts = await generateBudgetNotifications();
      newNotifications.push(...budgetAlerts);
    }

    // Smart recommendations
    if (settings.optimizationSuggestions) {
      const recommendations = await generateRecommendationNotifications();
      newNotifications.push(...recommendations);
    }

    // Duplicate detection alerts
    if (settings.duplicateDetection) {
      const duplicates = await generateDuplicateNotifications();
      newNotifications.push(...duplicates);
    }

    // Price change alerts
    if (settings.priceChangeAlerts) {
      const priceChanges = generatePriceChangeNotifications();
      newNotifications.push(...priceChanges);
    }

    // Update notifications
    const existingIds = new Set(notifications.map(n => n.id));
    const filteredNew = newNotifications.filter(n => !existingIds.has(n.id));
    
    setNotifications(prev => [...filteredNew, ...prev].slice(0, 50)); // Keep only 50 most recent
    setUnreadCount(filteredNew.filter(n => !n.readAt).length);
  };

  const generatePaymentDueNotifications = (): SmartNotification[] => {
    const notifications: SmartNotification[] = [];
    const now = new Date();

    subscriptions
      .filter(sub => sub.status === 'active' && sub.nextPayment)
      .forEach(sub => {
        const paymentDate = new Date(sub.nextPayment);
        const daysUntil = Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil <= 3 && daysUntil >= 0) {
          let priority: SmartNotification['priority'] = 'medium';
          let title = 'Payment Due Soon';
          
          if (daysUntil === 0) {
            priority = 'high';
            title = 'Payment Due Today';
          } else if (daysUntil === 1) {
            priority = 'high';
            title = 'Payment Due Tomorrow';
          }

          if ((sub.cost || sub.price) > 50) {
            priority = priority === 'medium' ? 'high' : 'critical';
          }

          notifications.push({
            id: `payment-due-${sub.id}-${paymentDate.getTime()}`,
            type: 'payment_due',
            title,
            message: `${sub.name} payment of $${(sub.cost || sub.price).toFixed(2)} is due ${
              daysUntil === 0 ? 'today' : 
              daysUntil === 1 ? 'tomorrow' : 
              `in ${daysUntil} days`
            }.`,
            priority,
            subscriptionId: sub.id,
            actionRequired: true,
            createdAt: new Date().toISOString(),
            metadata: {
              paymentDate: sub.nextPayment,
              amount: sub.cost || sub.price,
              daysUntil,
            },
          });
        }
      });

    return notifications;
  };

  const generateBudgetNotifications = async (): Promise<SmartNotification[]> => {
    const notifications: SmartNotification[] = [];
    
    try {
      const budgetAlerts = intelligenceService.generateBudgetAlerts(subscriptions, 500); // $500 example budget
      
      budgetAlerts.forEach(alert => {
        notifications.push({
          id: `budget-${alert.id}`,
          type: 'budget_alert',
          title: alert.title,
          message: alert.message,
          priority: alert.severity === 'critical' ? 'critical' : 
                   alert.severity === 'warning' ? 'high' : 'medium',
          actionRequired: alert.severity !== 'info',
          createdAt: alert.createdAt,
          metadata: alert,
        });
      });
    } catch (error) {
      console.error('Error generating budget notifications:', error);
    }

    return notifications;
  };

  const generateRecommendationNotifications = async (): Promise<SmartNotification[]> => {
    const notifications: SmartNotification[] = [];
    
    try {
      const recommendations = intelligenceService.generateRecommendations(subscriptions, []);
      
      recommendations
        .filter(rec => rec.priority === 'high' || rec.priority === 'critical')
        .forEach(rec => {
          notifications.push({
            id: `recommendation-${rec.id}`,
            type: 'recommendation',
            title: rec.title,
            message: rec.description,
            priority: rec.priority,
            subscriptionId: rec.subscriptionId,
            actionRequired: rec.priority === 'critical',
            createdAt: rec.createdAt,
            metadata: rec,
          });
        });
    } catch (error) {
      console.error('Error generating recommendation notifications:', error);
    }

    return notifications;
  };

  const generateDuplicateNotifications = async (): Promise<SmartNotification[]> => {
    const notifications: SmartNotification[] = [];
    
    try {
      const duplicates = intelligenceService.detectDuplicates(subscriptions);
      
      duplicates.forEach(duplicate => {
        notifications.push({
          id: `duplicate-${duplicate.id}`,
          type: 'duplicate_found',
          title: 'Duplicate Services Detected',
          message: `Found ${duplicate.subscriptions.length} similar services. Potential savings: $${duplicate.potentialSavings.toFixed(2)}/month.`,
          priority: duplicate.potentialSavings > 30 ? 'high' : 'medium',
          actionRequired: true,
          createdAt: new Date().toISOString(),
          metadata: duplicate,
        });
      });
    } catch (error) {
      console.error('Error generating duplicate notifications:', error);
    }

    return notifications;
  };

  const generatePriceChangeNotifications = (): SmartNotification[] => {
    const notifications: SmartNotification[] = [];

    subscriptions
      .filter(sub => sub.variablePricing?.upcomingChanges?.length)
      .forEach(sub => {
        const changes = sub.variablePricing!.upcomingChanges!;
        changes.forEach(change => {
          const currentPrice = sub.cost || sub.price;
          const increase = change.cost - currentPrice;
          const increasePercent = (increase / currentPrice) * 100;

          if (increase > 0) {
            notifications.push({
              id: `price-increase-${sub.id}-${change.date}`,
              type: 'price_change',
              title: 'Price Increase Alert',
              message: `${sub.name} will increase by $${increase.toFixed(2)} (${increasePercent.toFixed(1)}%) on ${format(new Date(change.date), 'MMM dd, yyyy')}.`,
              priority: increasePercent > 20 ? 'high' : 'medium',
              subscriptionId: sub.id,
              actionRequired: increasePercent > 20,
              createdAt: new Date().toISOString(),
              metadata: {
                oldPrice: currentPrice,
                newPrice: change.cost,
                changeDate: change.date,
                increasePercent,
              },
            });
          }
        });
      });

    return notifications;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, readAt: new Date().toISOString() }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, dismissedAt: new Date().toISOString() }
          : notif
      )
    );
  };

  const markAllAsRead = () => {
    const now = new Date().toISOString();
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, readAt: notif.readAt || now }))
    );
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: SmartNotification['type']) => {
    switch (type) {
      case 'payment_due':
        return <Calendar className="h-4 w-4" />;
      case 'price_change':
        return <TrendingUp className="h-4 w-4" />;
      case 'budget_alert':
        return <AlertTriangle className="h-4 w-4" />;
      case 'recommendation':
        return <Brain className="h-4 w-4" />;
      case 'duplicate_found':
        return <Zap className="h-4 w-4" />;
      case 'usage_low':
        return <Clock className="h-4 w-4" />;
      case 'trial_ending':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: SmartNotification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const activeNotifications = notifications.filter(n => !n.dismissedAt);
  const unreadNotifications = activeNotifications.filter(n => !n.readAt);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative ${className}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Smart Notifications
          </div>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            {onOpenSettings && (
              <Button variant="ghost" size="icon" onClick={onOpenSettings} className="h-7 w-7">
                <Settings className="h-3 w-3" />
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {activeNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p className="text-sm text-muted-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">
              No smart notifications at the moment.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-2">
              {activeNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                    !notification.readAt ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                  }`}
                  onClick={() => !notification.readAt && markAsRead(notification.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-background">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium ${
                            !notification.readAt ? 'font-semibold' : ''
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                              {notification.priority}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notification.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          {notification.actionRequired && (
                            <Badge variant="outline" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SmartNotifications;