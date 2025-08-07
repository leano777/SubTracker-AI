import { useState } from "react";
import { Bell, X, Check, AlertCircle, Info, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Notification } from "../types/constants";

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
}

export function NotificationsPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
}: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return AlertTriangle;
      case "info":
        return Info;
      case "trial":
        return AlertCircle;
      case "success":
        return Check;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "warning":
        return "text-orange-600";
      case "info":
        return "text-blue-600";
      case "trial":
        return "text-red-600";
      case "success":
        return "text-green-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadNotifications.length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">{unreadNotifications.length}</span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-hidden p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                {unreadNotifications.length > 0 && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    {unreadNotifications.length} new
                  </Badge>
                )}
              </CardTitle>
              {unreadNotifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="text-xs">
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs">We'll notify you when something important happens</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {/* Unread Notifications */}
                  {unreadNotifications.length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-primary/5 border-b">
                        <h4 className="text-sm font-medium flex items-center space-x-2">
                          <Sparkles className="w-3 h-3" />
                          <span>New ({unreadNotifications.length})</span>
                        </h4>
                      </div>
                      {unreadNotifications.map((notification) => {
                        const Icon = getNotificationIcon(notification.type);
                        return (
                          <div
                            key={notification.id}
                            className="p-4 border-b border-border bg-primary/5 hover:bg-primary/10 transition-colors"
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`p-1 rounded-full ${getNotificationColor(notification.type)}`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium">{notification.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <span className="text-xs text-muted-foreground">
                                        {getTimeAgo(notification.timestamp)}
                                      </span>
                                      <Badge variant="secondary" className="text-xs capitalize">
                                        {notification.type}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1 ml-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onMarkAsRead(notification.id)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onDeleteNotification(notification.id)}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Read Notifications */}
                  {readNotifications.length > 0 && (
                    <>
                      {unreadNotifications.length > 0 && <Separator />}
                      <div className="px-4 py-2 bg-muted/50 border-b">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Earlier ({readNotifications.length})
                        </h4>
                      </div>
                      {readNotifications.slice(0, 5).map((notification) => {
                        const Icon = getNotificationIcon(notification.type);
                        return (
                          <div
                            key={notification.id}
                            className="p-4 border-b border-border opacity-60 hover:opacity-80 transition-opacity"
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`p-1 rounded-full ${getNotificationColor(notification.type)}`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium">{notification.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <span className="text-xs text-muted-foreground">
                                        {getTimeAgo(notification.timestamp)}
                                      </span>
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {notification.type}
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDeleteNotification(notification.id)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {readNotifications.length > 5 && (
                        <div className="p-4 text-center">
                          <p className="text-xs text-muted-foreground">
                            {readNotifications.length - 5} more notifications...
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
