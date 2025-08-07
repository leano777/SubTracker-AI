import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Notification } from "../types/constants";

interface FloatingNotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isDarkMode: boolean;
}

export function FloatingNotifications({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  isDarkMode,
}: FloatingNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Detect stealth ops theme
  const isStealthOps =
    typeof document !== "undefined" && document.documentElement.classList.contains("stealth-ops");

  const getGlassStyles = () => {
    if (isStealthOps) {
      return {
        backgroundColor: "rgba(0, 0, 0, 0.98)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        border: "2px solid #333333",
        boxShadow: "0 0 25px rgba(0, 255, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      };
    }
    return {
      backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.9)" : "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: isDarkMode ? "1px solid rgba(75, 85, 99, 0.4)" : "1px solid rgba(255, 255, 255, 0.4)",
      boxShadow: isDarkMode
        ? "0 12px 40px 0 rgba(0, 0, 0, 0.8)"
        : "0 12px 40px 0 rgba(31, 38, 135, 0.37)",
    };
  };

  const glassStyles = getGlassStyles();

  // Enhanced text colors with Stealth Ops support
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

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 -z-10 ${
              isStealthOps ? "bg-black/40" : "bg-black/20 backdrop-blur-sm"
            }`}
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            className={`absolute bottom-16 right-0 w-80 max-w-[calc(100vw-2rem)] max-h-96 border-0 overflow-hidden mb-2 ${
              isStealthOps ? "tactical-surface" : "rounded-2xl"
            }`}
            style={{
              ...glassStyles,
              borderRadius: isStealthOps ? "0.125rem" : undefined,
            }}
          >
            <div
              className={`p-4 ${
                isStealthOps
                  ? "border-b border-gray-600"
                  : "border-b border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`font-semibold ${textColors.primary} ${
                    isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                  }`}
                >
                  {isStealthOps ? "[NOTIFICATIONS]" : "Notifications"}
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onMarkAllAsRead}
                      className={`text-xs ${
                        isStealthOps
                          ? "tactical-button border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono tracking-wide"
                          : ""
                      }`}
                      style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                    >
                      {isStealthOps ? "[MARK ALL READ]" : "Mark All Read"}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className={`h-6 w-6 p-0 ${
                      isStealthOps
                        ? "tactical-button border-gray-600 text-gray-400 hover:border-red-400 hover:text-red-400"
                        : ""
                    }`}
                    style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-4">
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 transition-colors cursor-pointer ${
                        isStealthOps
                          ? `tactical-surface border ${
                              notification.read
                                ? "border-gray-600 hover:border-gray-500"
                                : "border-green-400 tactical-glow hover:border-green-300"
                            }`
                          : `rounded-lg ${
                              notification.read
                                ? "bg-secondary/30 hover:bg-secondary/50"
                                : "bg-primary/10 hover:bg-primary/20 border border-primary/20"
                            }`
                      }`}
                      onClick={() => {
                        onMarkAsRead(notification.id);
                        setIsOpen(false);
                      }}
                      style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 mt-2 flex-shrink-0 ${
                            isStealthOps ? "" : "rounded-full"
                          } ${
                            notification.type === "warning"
                              ? isStealthOps
                                ? "bg-yellow-400"
                                : "bg-yellow-500"
                              : notification.type === "trial"
                                ? isStealthOps
                                  ? "bg-blue-400"
                                  : "bg-blue-500"
                                : isStealthOps
                                  ? "bg-green-400"
                                  : "bg-green-500"
                          }`}
                          style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium ${textColors.primary} ${
                              !notification.read ? "font-semibold" : ""
                            } ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                          >
                            {isStealthOps
                              ? `[${notification.title.toUpperCase()}]`
                              : notification.title}
                          </div>
                          <div
                            className={`text-sm mt-1 ${textColors.muted} line-clamp-2 ${
                              isStealthOps ? "font-mono tracking-wide" : ""
                            }`}
                          >
                            {isStealthOps
                              ? `[${notification.message.toUpperCase()}]`
                              : notification.message}
                          </div>
                          <div
                            className={`text-xs mt-2 ${textColors.muted} ${
                              isStealthOps ? "font-mono tracking-wide" : ""
                            }`}
                          >
                            {isStealthOps ? "[" : ""}
                            {new Date(notification.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {isStealthOps ? "]" : ""}
                          </div>
                        </div>
                        {!notification.read && (
                          <div
                            className={`w-2 h-2 flex-shrink-0 mt-2 ${
                              isStealthOps
                                ? "bg-green-400 tactical-glow"
                                : "bg-primary rounded-full"
                            }`}
                            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  {notifications.length > 10 && (
                    <div className="text-center py-2">
                      <span
                        className={`text-sm ${textColors.muted} ${
                          isStealthOps ? "font-mono tracking-wide" : ""
                        }`}
                      >
                        {isStealthOps
                          ? `[SHOWING 10 OF ${notifications.length} NOTIFICATIONS]`
                          : `Showing 10 of ${notifications.length} notifications`}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className={`w-8 h-8 mx-auto mb-2 ${textColors.muted} opacity-50`} />
                  <p
                    className={`text-sm ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                  >
                    {isStealthOps ? "[NO NOTIFICATIONS]" : "No notifications"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Enhanced Notification Button with Stealth Ops Support */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={`h-12 w-12 p-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative ${
          isStealthOps
            ? "tactical-button border-2 border-green-400 bg-black hover:bg-gray-900 tactical-glow"
            : "rounded-full bg-gray-600 hover:bg-gray-700"
        }`}
        style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
      >
        <Bell className={`w-5 h-5 ${isStealthOps ? "text-green-400" : ""}`} />
        {unreadCount > 0 && (
          <div
            className={`absolute -top-1 -right-1 h-5 w-5 text-xs font-medium shadow-lg flex items-center justify-center ${
              isStealthOps
                ? "bg-red-500 text-white border border-red-400 font-mono tracking-wide tactical-glow"
                : "bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full"
            }`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
          >
            {unreadCount}
          </div>
        )}
      </Button>
    </div>
  );
}
