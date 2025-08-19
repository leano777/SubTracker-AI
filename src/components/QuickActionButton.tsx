import { Plus, BarChart3, Calendar, Brain, Grid3X3, ChevronUp, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface QuickActionButtonProps {
  activeTab: string;
  onTabChange: (tab: string) => void; // Dispatches { type: 'TAB_SET', payload: tab }
  onAddNew: () => void;
  subscriptionsCount: number;
  aiInsightsCount: number;
  isMobile: boolean;
}

export const QuickActionButton = ({
  activeTab,
  onTabChange,
  onAddNew,
  subscriptionsCount,
  aiInsightsCount,
  isMobile,
}: QuickActionButtonProps) => {
  console.log("🔧 QuickActionButton rendered with props:", { activeTab, onAddNew: !!onAddNew, isMobile });
  const [isExpanded, setIsExpanded] = useState(false);

  // Detect stealth ops theme
  const isStealthOps =
    typeof document !== "undefined" && document.documentElement.classList.contains("stealth-ops");
  const isDarkMode =
    typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, color: "blue" },
    {
      id: "subscriptions",
      label: "Subscriptions",
      icon: Grid3X3,
      color: "green",
      badge: subscriptionsCount,
    },
    { id: "planning", label: "Planning", icon: Calendar, color: "purple" },
    {
      id: "intelligence",
      label: "Intelligence",
      icon: Brain,
      color: "orange",
      badge: aiInsightsCount,
    },
  ];

  const quickActions = [
    {
      id: "add",
      label: "Add Subscription",
      icon: Plus,
      action: onAddNew,
      color: isStealthOps
        ? "tactical-button border-green-400 bg-black hover:bg-green-400 hover:text-black text-green-400"
        : "bg-blue-500 hover:bg-blue-600",
    },
  ];

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

  const getGlassStyles = () => {
    if (isStealthOps) {
      return {
        backgroundColor: "rgba(0, 0, 0, 0.98)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        border: "2px solid #333333",
        boxShadow: "0 0 25px rgba(0, 255, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        backgroundImage:
          "linear-gradient(135deg, rgba(0, 255, 0, 0.05) 0%, rgba(0, 255, 0, 0.02) 100%)",
      };
    }
    return {
      backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: isDarkMode ? "1px solid rgba(75, 85, 99, 0.3)" : "1px solid rgba(255, 255, 255, 0.2)",
      boxShadow: isDarkMode
        ? "0 12px 40px 0 rgba(0, 0, 0, 0.8)"
        : "0 12px 40px 0 rgba(31, 38, 135, 0.37)",
      backgroundImage:
        "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
    };
  };

  if (!isMobile) {
    // For desktop, show only the add button with stealth ops styling
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => {
            alert("Plus button clicked!"); // Simple test
            console.log("🔥 Desktop Plus Button clicked - calling onAddNew");
            console.log("🔍 onAddNew function:", onAddNew);
            if (onAddNew) {
              try {
                onAddNew();
                console.log("✅ onAddNew called successfully");
              } catch (error) {
                console.error("❌ Error calling onAddNew:", error);
              }
            } else {
              console.error("❌ onAddNew is undefined!");
            }
          }}
          size="lg"
          className={`h-14 w-14 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
            isStealthOps
              ? "tactical-button border-2 border-green-400 bg-black hover:bg-green-400 hover:text-black tactical-glow"
              : "rounded-full bg-blue-500 hover:bg-blue-600"
          }`}
          style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
        >
          <Plus className={`w-6 h-6 ${isStealthOps ? "text-green-400" : ""}`} />
        </Button>
      </div>
    );
  }

  // Mobile version with expanded functionality and stealth ops support
  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Expanded Menu */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 -z-10 ${
              isStealthOps ? "bg-black/40" : "bg-black/20 backdrop-blur-sm"
            }`}
            onClick={() => setIsExpanded(false)}
          />

          {/* Menu Container */}
          <div className="absolute bottom-16 right-0 mb-2">
            <div
              className={`p-4 shadow-xl min-w-[280px] ${
                isStealthOps
                  ? "tactical-surface"
                  : "rounded-2xl border border-white/20 dark:border-gray-700/30"
              }`}
              style={{
                ...getGlassStyles(),
                borderRadius: isStealthOps ? "0.125rem" : undefined,
              }}
            >
              {/* Quick Actions */}
              <div className="mb-4">
                <h3
                  className={`text-sm font-medium mb-3 ${textColors.secondary} ${
                    isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                  }`}
                >
                  {isStealthOps ? "[QUICK ACTIONS]" : "Quick Actions"}
                </h3>
                <div className="space-y-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      onClick={() => {
                        console.log(`🔥 Mobile ${action.label} button clicked - calling action`);
                        action.action();
                        setIsExpanded(false);
                      }}
                      className={`w-full justify-start gap-3 h-12 text-white ${action.color} ${
                        isStealthOps ? "font-mono tracking-wide" : "rounded-xl"
                      }`}
                      style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                    >
                      <action.icon className="w-5 h-5" />
                      {isStealthOps ? `[${action.label.toUpperCase()}]` : action.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tab Navigation */}
              <div>
                <h3
                  className={`text-sm font-medium mb-3 ${textColors.secondary} ${
                    isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                  }`}
                >
                  {isStealthOps ? "[NAVIGATION]" : "Navigation"}
                </h3>
                <div className="space-y-2">
                  {tabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      onClick={() => {
                        console.log("Tab clicked:", tab.id);
                        onTabChange(tab.id);
                        setIsExpanded(false);
                      }}
                      className={`w-full justify-start gap-3 h-12 ${
                        isStealthOps
                          ? `font-mono tracking-wide ${
                              activeTab === tab.id
                                ? "tactical-button border-green-400 bg-green-400 text-black tactical-glow"
                                : "tactical-button border-gray-600 text-gray-300 hover:border-green-400 hover:text-green-400"
                            }`
                          : `rounded-xl ${
                              activeTab === tab.id
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                            }`
                      }`}
                      style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="flex-1 text-left">
                        {isStealthOps ? `[${tab.label.toUpperCase()}]` : tab.label}
                      </span>
                      {tab.badge && tab.badge > 0 && (
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            isStealthOps
                              ? `tactical-surface border font-mono tracking-wide ${
                                  activeTab === tab.id
                                    ? "border-black text-black bg-black/20"
                                    : "border-green-400 text-green-400"
                                }`
                              : `${
                                  activeTab === tab.id
                                    ? "bg-primary-foreground/20 text-primary-foreground"
                                    : `bg-${tab.color}-100 text-${tab.color}-700 dark:bg-${tab.color}-900 dark:text-${tab.color}-300`
                                }`
                          }`}
                          style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                        >
                          {tab.badge}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Action Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        size="lg"
        className={`h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300 text-white ${
          isStealthOps
            ? `tactical-button border-2 tactical-glow ${
                isExpanded
                  ? "border-red-400 bg-black hover:bg-red-400 hover:text-black"
                  : "border-green-400 bg-black hover:bg-green-400 hover:text-black"
              }`
            : `rounded-full ${
                isExpanded ? "bg-gray-500 hover:bg-gray-600" : "bg-blue-500 hover:bg-blue-600"
              }`
        }`}
        style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
      >
        {isExpanded ? (
          <X
            className={`w-6 h-6 ${isStealthOps ? (isExpanded ? "text-red-400" : "text-green-400") : ""}`}
          />
        ) : (
          <ChevronUp className={`w-6 h-6 ${isStealthOps ? "text-green-400" : ""}`} />
        )}
      </Button>
    </div>
  );
};
