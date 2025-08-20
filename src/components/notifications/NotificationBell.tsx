/**
 * Notification Bell Component
 * Shows notification count and dropdown menu
 */

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Settings, X } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/components/ui/utils';
import notificationService, { type Notification } from '@/services/supabase/notificationService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationBellProps {
  className?: string;
  onOpenSettings?: () => void;
}

export function NotificationBell({ className, onOpenSettings }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Load notifications
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const [notifs, count] = await Promise.all([
        notificationService.getNotifications(false),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    const success = await notificationService.markAsRead(id);
    if (success) {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const success = await notificationService.markAllAsRead();
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await notificationService.deleteNotification(id);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      const notif = notifications.find(n => n.id === id);
      if (notif && !notif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment_reminder':
        return '💳';
      case 'price_increase':
        return '📈';
      case 'renewal':
        return '🔄';
      case 'budget_alert':
        return '⚠️';
      case 'trial_ending':
        return '⏰';
      case 'payment_failed':
        return '❌';
      default:
        return '🔔';
    }
  };

  // Get priority color
  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  // Load on mount and when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Set up auto-refresh
  useEffect(() => {
    // Initial load
    loadNotifications();

    // Refresh every 5 minutes
    refreshInterval.current = setInterval(() => loadNotifications(), 5 * 60 * 1000);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label="Notifications"
        >
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
          <span>Notifications</span>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            {onOpenSettings && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="h-7 w-7"
              >
                <Settings className="h-3 w-3" />
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              We'll let you know about upcoming payments
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  'flex items-start gap-3 p-3 cursor-pointer',
                  !notification.isRead && 'bg-accent/50'
                )}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <span className="text-xl mt-0.5">
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                      'text-sm font-medium',
                      !notification.isRead && 'font-semibold'
                    )}>
                      {notification.title}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 hover:opacity-100 transition-opacity"
                      onClick={(e) => deleteNotification(notification.id, e)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-xs',
                      getPriorityColor(notification.priority)
                    )}>
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {!notification.isRead && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationBell;