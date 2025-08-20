/**
 * Notification Center Component
 * Full-page view of all notifications with management options
 */

import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Filter, Calendar, AlertCircle, TrendingUp, Clock, CreditCard, X } from 'lucide-react';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import notificationService, { type Notification, type NotificationType } from '@/services/supabase/notificationService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/components/ui/utils';

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | NotificationType>('all');
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    byType: {} as Record<NotificationType, number>,
  });

  // Load notifications
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const notifs = await notificationService.getNotifications(false);
      setNotifications(notifs);
      calculateStats(notifs);
      filterNotifications(notifs, activeTab);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (notifs: Notification[]) => {
    const stats = {
      total: notifs.length,
      unread: notifs.filter(n => !n.isRead).length,
      byType: {} as Record<NotificationType, number>,
    };

    notifs.forEach(n => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
    });

    setStats(stats);
  };

  // Filter notifications based on tab
  const filterNotifications = (notifs: Notification[], tab: typeof activeTab) => {
    let filtered = notifs;

    if (tab === 'unread') {
      filtered = notifs.filter(n => !n.isRead);
    } else if (tab !== 'all') {
      filtered = notifs.filter(n => n.type === tab);
    }

    setFilteredNotifications(filtered);
  };

  // Mark selected as read
  const markSelectedAsRead = async () => {
    const promises = Array.from(selectedIds).map(id =>
      notificationService.markAsRead(id)
    );

    await Promise.all(promises);
    
    setNotifications(prev =>
      prev.map(n => (selectedIds.has(n.id) ? { ...n, isRead: true } : n))
    );
    setSelectedIds(new Set());
    toast.success(`Marked ${selectedIds.size} notifications as read`);
  };

  // Delete selected
  const deleteSelected = async () => {
    const promises = Array.from(selectedIds).map(id =>
      notificationService.deleteNotification(id)
    );

    await Promise.all(promises);
    
    setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
    toast.success(`Deleted ${selectedIds.size} notifications`);
    setSelectedIds(new Set());
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Select all visible
  const selectAll = () => {
    setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Get notification icon
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'payment_reminder':
        return <CreditCard className="h-4 w-4" />;
      case 'price_increase':
        return <TrendingUp className="h-4 w-4" />;
      case 'renewal':
        return <Clock className="h-4 w-4" />;
      case 'budget_alert':
        return <AlertCircle className="h-4 w-4" />;
      case 'trial_ending':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return `Today at ${format(date, 'HH:mm')}`;
    }
    if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'HH:mm')}`;
    }
    return format(date, 'MMM dd, yyyy');
  };

  // Load on mount
  useEffect(() => {
    loadNotifications();

    // Start notification scheduler
    notificationService.startNotificationScheduler();

    return () => {
      notificationService.stopNotificationScheduler();
    };
  }, []);

  // Filter when tab changes
  useEffect(() => {
    filterNotifications(notifications, activeTab);
  }, [activeTab, notifications]);

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Center
            </CardTitle>
            <CardDescription>
              {stats.unread > 0
                ? `${stats.unread} unread notification${stats.unread === 1 ? '' : 's'}`
                : 'All caught up!'}
            </CardDescription>
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedIds.size} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={markSelectedAsRead}
              >
                <Check className="h-4 w-4 mr-1" />
                Mark as read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={deleteSelected}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <div className="px-6 pb-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">
                All ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({stats.unread})
              </TabsTrigger>
              <TabsTrigger value="payment_reminder">
                Payments ({stats.byType.payment_reminder || 0})
              </TabsTrigger>
              <TabsTrigger value="budget_alert">
                Alerts ({stats.byType.budget_alert || 0})
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="px-6">
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading notifications...
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    {activeTab === 'unread'
                      ? 'No unread notifications'
                      : activeTab === 'all'
                      ? 'No notifications yet'
                      : `No ${activeTab.replace('_', ' ')} notifications`}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pb-4">
                  {selectedIds.size === 0 && filteredNotifications.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAll}
                      className="w-full justify-start text-xs text-muted-foreground"
                    >
                      Select all {filteredNotifications.length} notifications
                    </Button>
                  )}
                  
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                        !notification.isRead && 'bg-accent/50 border-accent',
                        selectedIds.has(notification.id) && 'bg-accent',
                        'hover:bg-accent/30 cursor-pointer'
                      )}
                      onClick={() => toggleSelection(notification.id)}
                    >
                      <Checkbox
                        checked={selectedIds.has(notification.id)}
                        onCheckedChange={() => toggleSelection(notification.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className={cn(
                        'p-2 rounded-lg',
                        notification.priority === 'high' && 'bg-red-500/10 text-red-500',
                        notification.priority === 'medium' && 'bg-yellow-500/10 text-yellow-500',
                        notification.priority === 'low' && 'bg-gray-500/10 text-gray-500'
                      )}>
                        {getIcon(notification.type)}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            'font-medium',
                            !notification.isRead && 'font-semibold'
                          )}>
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        {notification.subscription && (
                          <div className="flex items-center gap-2 pt-1">
                            <Badge variant="outline" className="text-xs">
                              {notification.subscription.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ${notification.subscription.cost}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default NotificationCenter;