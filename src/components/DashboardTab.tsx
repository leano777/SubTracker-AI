import {
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar,
  ArrowRight,
  Plus,
  Bell,
  Zap,
  Eye,
} from "lucide-react";
import { useState, useMemo } from "react";
import { notificationService } from "../services/notificationService";
import { NotificationType, NotificationPriority } from "../types/notifications";

import type { AppSettings, AppNotification } from "../types/constants";
import type { FullSubscription, FullPaymentCard } from "../types/subscription";
import { getDaysUntil, parseStoredDate } from "../utils/dateUtils";
import {
  calculateMonthlyAmount,
  formatCurrency,
  safeCalculateMonthlyAmount,
} from "../utils/helpers";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { useTheme } from "../contexts/ThemeContext";

interface DashboardTabProps {
  subscriptions: FullSubscription[];
  cards: FullPaymentCard[];
  settings: AppSettings;
  notifications: AppNotification[];
  weeklyBudgets?: any[];
  onAddNew?: () => void;
  onViewCalendar?: () => void;
  onManageCards?: () => void;
  onCheckWatchlist?: () => void;
}

export const DashboardTab = ({
  subscriptions = [],
  settings,
  notifications = [],
  cards = [],
  onAddNew,
  onViewCalendar,
  onManageCards,
  onCheckWatchlist,
}: DashboardTabProps) => {
  const { theme, isTacticalMode } = useTheme();
  console.log("🏠 DashboardTab rendered with:", {
    subscriptionsCount: subscriptions?.length || 0,
    cardsCount: cards?.length || 0,
    firstSub: subscriptions?.[0]?.name || "none",
  });

  // Safety checks
  if (!subscriptions) {
    console.warn("DashboardTab: subscriptions is null/undefined");
    return <div className="p-4 text-secondary">Loading dashboard...</div>;
  }

  if (!settings) {
    console.warn("DashboardTab: settings is null/undefined");
    return <div className="p-4 text-secondary">Loading dashboard...</div>;
  }

  const [selectedTimeframe, setSelectedTimeframe] = useState<"month" | "quarter" | "year">("month");

  // Detect mobile screen
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Detect current theme
  const currentTheme = settings.preferences.theme || "light";
  const isDarkMode = currentTheme === "dark";
  const isStealthOps = currentTheme === "stealth-ops";

  // Calculate key metrics with error handling and timeframe filtering
  let activeSubscriptions: FullSubscription[] = [];
  let cancelledSubscriptions: FullSubscription[] = [];
  let totalMonthlySpend = 0;
  let totalYearlySpend = 0;
  let displayAmount = 0;
  let timeframeMultiplier = 1;

  try {
    activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");
    cancelledSubscriptions = subscriptions.filter((sub) => sub.status === "cancelled");

    totalMonthlySpend = activeSubscriptions.reduce((total, sub) => {
      return total + safeCalculateMonthlyAmount(sub);
    }, 0);
    totalYearlySpend = totalMonthlySpend * 12;

    // Apply timeframe multiplier based on selected timeframe
    switch (selectedTimeframe) {
      case "quarter":
        timeframeMultiplier = 3;
        displayAmount = totalMonthlySpend * 3;
        break;
      case "year":
        timeframeMultiplier = 12;
        displayAmount = totalYearlySpend;
        break;
      default: // month
        timeframeMultiplier = 1;
        displayAmount = totalMonthlySpend;
        break;
    }

    console.log("💰 Calculations:", {
      activeCount: activeSubscriptions.length,
      totalMonthly: totalMonthlySpend,
      totalYearly: totalYearlySpend,
      selectedTimeframe,
      timeframeMultiplier,
      displayAmount,
    });
  } catch (error) {
    console.error("Error calculating metrics:", error);
    return <div className="p-4">Error calculating dashboard metrics. Check console.</div>;
  }

  // Upcoming payments (next 7 days) - using centralized date utilities
  const upcomingPayments = activeSubscriptions
    .filter((sub) => {
      if (!sub.nextPayment) return false;
      const daysUntil = getDaysUntil(sub.nextPayment);
      return daysUntil <= 7 && daysUntil >= 0;
    })
    .sort((a, b) => {
      // Use centralized date parsing for consistent sorting
      const dateA = parseStoredDate(a.nextPayment);
      const dateB = parseStoredDate(b.nextPayment);
      return dateA.getTime() - dateB.getTime();
    });

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: { [key: string]: { amount: number; count: number; color: string } } = {};
    const colors = isStealthOps
      ? ["#00ff00", "#ffffff", "#ffff00", "#ff0000", "#808080", "#00ffff", "#ff00ff"]
      : ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16"];
    let colorIndex = 0;

    activeSubscriptions.forEach((sub) => {
      if (!breakdown[sub.category]) {
        breakdown[sub.category] = {
          amount: 0,
          count: 0,
          color: colors[colorIndex % colors.length],
        };
        colorIndex++;
      }
      breakdown[sub.category].amount += safeCalculateMonthlyAmount(sub);
      breakdown[sub.category].count += 1;
    });

    return Object.entries(breakdown)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.amount - a.amount);
  }, [activeSubscriptions, isStealthOps]);

  // Spending trend data (mock for now)
  const spendingTrend = [
    { month: "Jan", amount: totalMonthlySpend * 0.9 },
    { month: "Feb", amount: totalMonthlySpend * 0.85 },
    { month: "Mar", amount: totalMonthlySpend * 1.1 },
    { month: "Apr", amount: totalMonthlySpend * 0.95 },
    { month: "May", amount: totalMonthlySpend * 1.05 },
    { month: "Jun", amount: totalMonthlySpend },
  ];

  // High spending items
  const highSpendingItems = activeSubscriptions
    .sort((a, b) => {
      return safeCalculateMonthlyAmount(b) - safeCalculateMonthlyAmount(a);
    })
    .slice(0, 3);

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

  // Quick stats cards
  const QuickStatsCard = ({
    title,
    value,
    change,
    icon: Icon,
    trend,
    color = "blue",
  }: {
    title: string;
    value: string;
    change?: string;
    icon: any;
    trend?: "up" | "down" | "neutral";
    color?: string;
  }) => (
    <Card className={`overflow-hidden ${isStealthOps ? "tactical-surface" : ""}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p
              className={`text-sm ${isStealthOps ? "text-gray-400 font-mono tracking-wide" : "text-muted-foreground"}`}
            >
              {isStealthOps ? `[${title.toUpperCase()}]` : title}
            </p>
            <p
              className={`text-xl sm:text-2xl font-bold ${textColors.primary} ${isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""}`}
            >
              {value}
            </p>
            {change && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  trend === "up"
                    ? isStealthOps
                      ? "text-green-400"
                      : "text-green-600"
                    : trend === "down"
                      ? isStealthOps
                        ? "text-red-400"
                        : "text-red-600"
                      : textColors.muted
                } ${isStealthOps ? "font-mono tracking-wide" : ""}`}
              >
                {trend === "up" && <TrendingUp className="w-3 h-3" />}
                {trend === "down" && <TrendingDown className="w-3 h-3" />}
                {isStealthOps ? `[${change.toUpperCase()}]` : change}
              </div>
            )}
          </div>
          <div
            className={`p-3 ${
              isStealthOps
                ? `tactical-surface border border-green-400 tactical-glow`
                : `rounded-lg bg-${color}-100 dark:bg-${color}-900/30`
            }`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
          >
            <Icon
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                isStealthOps ? "text-green-400" : `text-${color}-600 dark:text-${color}-400`
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Check if no data exists
  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to SubTracker AI
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Your personal financial dashboard for managing subscriptions, budgets, and investments.
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <Button
            onClick={() => {
              // Initialize with demo data
              localStorage.setItem('subtracker_demo_init', 'true');
              window.location.reload();
            }}
            className="px-8 py-3 text-lg"
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Load Demo Data
          </Button>
          
          <Button
            onClick={onAddNew}
            variant="outline"
            className="px-8 py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Subscription
          </Button>
        </div>
        
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg max-w-2xl">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            🚀 Quick Start Guide
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
            <li>• Click "Load Demo Data" to explore with sample subscriptions</li>
            <li>• Use "Add Subscription" to start tracking your real expenses</li>
            <li>• Navigate between Dashboard, Subscriptions, Budget Pods, and more</li>
            <li>• All data is stored locally in your browser for privacy</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2
            className={`text-xl sm:text-2xl font-semibold ${textColors.primary} ${
              isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
            }`}
          >
            {isStealthOps ? "[DASHBOARD OVERVIEW]" : "Dashboard Overview"}
          </h2>
          <p
            className={`text-sm ${textColors.muted} mt-1 ${isStealthOps ? "font-mono tracking-wide" : ""}`}
          >
            {isStealthOps
              ? "[TRACK SUBSCRIPTION SPENDING AND GET INTEL]"
              : "Track your subscription spending and get insights"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs
            value={selectedTimeframe}
            onValueChange={(value) => setSelectedTimeframe(value as any)}
          >
            <TabsList
              className={`grid w-full grid-cols-3 ${isStealthOps ? "tactical-surface" : ""}`}
            >
              <TabsTrigger
                value="month"
                className={`text-xs sm:text-sm ${isStealthOps ? "font-mono tracking-wide" : ""}`}
              >
                {isStealthOps ? "[MONTH]" : "Month"}
              </TabsTrigger>
              <TabsTrigger
                value="quarter"
                className={`text-xs sm:text-sm ${isStealthOps ? "font-mono tracking-wide" : ""}`}
              >
                {isStealthOps ? "[QUARTER]" : "Quarter"}
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className={`text-xs sm:text-sm ${isStealthOps ? "font-mono tracking-wide" : ""}`}
              >
                {isStealthOps ? "[YEAR]" : "Year"}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatsCard
          title={`${selectedTimeframe.charAt(0).toUpperCase() + selectedTimeframe.slice(1)}ly Spend`}
          value={formatCurrency(displayAmount)}
          change={`+5.2% from last ${selectedTimeframe}`}
          icon={DollarSign}
          trend="up"
          color="blue"
        />
        <QuickStatsCard
          title="Active Subscriptions"
          value={activeSubscriptions.length.toString()}
          change={`${cancelledSubscriptions.length} cancelled`}
          icon={CreditCard}
          trend="neutral"
          color="green"
        />
        <QuickStatsCard
          title="Yearly Projection"
          value={formatCurrency(totalYearlySpend)}
          change="Based on current spending"
          icon={TrendingUp}
          trend="up"
          color="purple"
        />
        <QuickStatsCard
          title="Upcoming Payments"
          value={upcomingPayments.length.toString()}
          change="Next 7 days"
          icon={Calendar}
          trend="neutral"
          color="orange"
        />
      </div>


      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Spending Overview */}
        <div className="lg:col-span-2 space-y-6">

          {/* Category Breakdown */}
          <Card className={isStealthOps ? "tactical-surface" : ""}>
            <CardHeader>
              <CardTitle
                className={`${textColors.primary} ${
                  isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                }`}
              >
                {isStealthOps ? "[SPENDING BY CATEGORY]" : "Spending by Category"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryBreakdown.slice(0, isMobile ? 3 : 5).map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 ${isStealthOps ? "" : "rounded-full"}`}
                          style={{
                            backgroundColor: category.color,
                            borderRadius: isStealthOps ? "0.125rem" : undefined,
                          }}
                        />
                        <span
                          className={`font-medium ${textColors.primary} ${
                            isStealthOps ? "font-mono tracking-wide" : ""
                          }`}
                        >
                          {isStealthOps
                            ? `[${category.category.toUpperCase()}]`
                            : category.category}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            isStealthOps
                              ? "tactical-surface border border-gray-600 font-mono tracking-wide"
                              : ""
                          }`}
                          style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                        >
                          {category.count}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-medium ${textColors.primary} ${
                            isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                          }`}
                        >
                          {formatCurrency(category.amount)}
                        </div>
                        <div
                          className={`text-xs ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                        >
                          {((category.amount / totalMonthlySpend) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={(category.amount / totalMonthlySpend) * 100}
                      className={`h-2 ${isStealthOps ? "tactical-surface" : ""}`}
                      style={{
                        backgroundColor: `${category.color}20`,
                      }}
                    />
                  </div>
                ))}
              </div>

              {categoryBreakdown.length > (isMobile ? 3 : 5) && (
                <Button
                  variant="outline"
                  className={`w-full mt-4 ${
                    isStealthOps
                      ? "tactical-button border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono tracking-wide"
                      : ""
                  }`}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  {isStealthOps ? "[VIEW ALL CATEGORIES]" : "View All Categories"}{" "}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Insights */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className={isStealthOps ? "tactical-surface" : ""}>
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${textColors.primary} ${
                  isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                }`}
              >
                <Zap className={`w-5 h-5 ${isStealthOps ? "text-green-400" : ""}`} />
                {isStealthOps ? "[QUICK ACTIONS]" : "Quick Actions"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => {
                  console.log("🔥 Add New Subscription clicked");
                  onAddNew?.();
                }}
                className={`w-full justify-start ${
                  isStealthOps
                    ? "tactical-button border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono tracking-wide"
                    : ""
                }`}
                variant="outline"
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isStealthOps ? "[ADD NEW SUBSCRIPTION]" : "Add New Subscription"}
              </Button>
              
              {/* Test Notification Button - Remove in production */}
              <Button
                onClick={() => {
                  // Create test notifications
                  notificationService.create(
                    NotificationType.PAYMENT_DUE,
                    'Netflix Payment Due',
                    'Your Netflix subscription payment of $15.99 is due tomorrow',
                    { priority: NotificationPriority.HIGH }
                  );
                  notificationService.create(
                    NotificationType.TRIAL_ENDING,
                    'Adobe Trial Ending',
                    'Your Adobe Creative Cloud trial ends in 3 days',
                    { priority: NotificationPriority.MEDIUM }
                  );
                  notificationService.create(
                    NotificationType.CARD_EXPIRING,
                    'Card Expiring Soon',
                    'Your card ending in 4242 expires next month',
                    { priority: NotificationPriority.MEDIUM }
                  );
                }}
                className={`w-full justify-start ${
                  isStealthOps
                    ? "tactical-button border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-mono tracking-wide"
                    : ""
                }`}
                variant="outline"
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <Bell className="w-4 h-4 mr-2" />
                {isStealthOps ? "[TEST NOTIFICATIONS]" : "Test Notifications"}
              </Button>
              <Button
                onClick={() => {
                  console.log("🔥 View Calendar clicked");
                  onViewCalendar?.();
                }}
                className={`w-full justify-start ${
                  isStealthOps
                    ? "tactical-button border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono tracking-wide"
                    : ""
                }`}
                variant="outline"
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {isStealthOps ? "[VIEW CALENDAR]" : "View Calendar"}
              </Button>
              <Button
                onClick={() => {
                  console.log("🔥 Manage Cards clicked");
                  onManageCards?.();
                }}
                className={`w-full justify-start ${
                  isStealthOps
                    ? "tactical-button border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono tracking-wide"
                    : ""
                }`}
                variant="outline"
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isStealthOps ? "[MANAGE CARDS]" : "Manage Cards"}
              </Button>
              <Button
                onClick={() => {
                  console.log("🔥 Check Watchlist clicked");
                  onCheckWatchlist?.();
                }}
                className={`w-full justify-start ${
                  isStealthOps
                    ? "tactical-button border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono tracking-wide"
                    : ""
                }`}
                variant="outline"
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <Eye className="w-4 h-4 mr-2" />
                {isStealthOps ? "[CHECK WATCHLIST]" : "Check Watchlist"}
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Payments */}
          <Card className={isStealthOps ? "tactical-surface" : ""}>
            <CardHeader>
              <CardTitle
                className={`${textColors.primary} ${
                  isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                }`}
              >
                {isStealthOps ? "[UPCOMING PAYMENTS]" : "Upcoming Payments"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingPayments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingPayments.slice(0, 3).map((subscription) => {
                    const daysUntil = Math.ceil(
                      (new Date(subscription.nextPayment).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div
                        key={subscription.id}
                        className={`flex items-center gap-3 p-3 ${
                          isStealthOps
                            ? "tactical-surface border border-gray-600"
                            : "rounded-lg bg-secondary/30"
                        }`}
                        style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                      >
                        {subscription.logoUrl ? (
                          <ImageWithFallback
                            src={subscription.logoUrl}
                            alt={`${subscription.name} logo`}
                            className={`w-8 h-8 object-cover flex-shrink-0 ${
                              isStealthOps ? "border border-green-400" : "rounded"
                            }`}
                            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                              isStealthOps
                                ? "tactical-surface border border-green-400"
                                : "rounded bg-primary/10"
                            }`}
                            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                          >
                            <DollarSign
                              className={`w-4 h-4 ${isStealthOps ? "text-green-400" : "text-primary"}`}
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium truncate ${textColors.primary} ${
                              isStealthOps ? "font-mono tracking-wide" : ""
                            }`}
                          >
                            {subscription.name}
                          </div>
                          <div
                            className={`text-sm ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                          >
                            {isStealthOps
                              ? `[${daysUntil === 0 ? "TODAY" : daysUntil === 1 ? "TOMORROW" : `${daysUntil} DAYS`}]`
                              : daysUntil === 0
                                ? "Today"
                                : daysUntil === 1
                                  ? "Tomorrow"
                                  : `${daysUntil} days`}
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`font-medium ${textColors.primary} ${
                              isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                            }`}
                          >
                            {formatCurrency(subscription.cost)}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {upcomingPayments.length > 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full ${
                        isStealthOps
                          ? "tactical-button border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono tracking-wide"
                          : ""
                      }`}
                      style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                    >
                      {isStealthOps
                        ? `[VIEW ALL (${upcomingPayments.length})]`
                        : `View All (${upcomingPayments.length})`}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className={`w-8 h-8 mx-auto mb-2 ${textColors.muted} opacity-50`} />
                  <p
                    className={`text-sm ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                  >
                    {isStealthOps ? "[NO UPCOMING PAYMENTS]" : "No upcoming payments"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Spending */}
          <Card className={isStealthOps ? "tactical-surface" : ""}>
            <CardHeader>
              <CardTitle
                className={`${textColors.primary} ${
                  isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                }`}
              >
                {isStealthOps ? "[HIGHEST SPENDING]" : "Highest Spending"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highSpendingItems.map((subscription, index) => (
                  <div key={subscription.id} className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 flex items-center justify-center text-xs font-medium ${
                        isStealthOps
                          ? `tactical-surface border font-mono tracking-wide ${
                              index === 0
                                ? "border-yellow-400 text-yellow-400"
                                : index === 1
                                  ? "border-gray-400 text-gray-400"
                                  : "border-orange-400 text-orange-400"
                            }`
                          : `rounded-full ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-800"
                                : index === 1
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-orange-100 text-orange-800"
                            }`
                      }`}
                      style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                    >
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium truncate ${textColors.primary} ${
                          isStealthOps ? "font-mono tracking-wide" : ""
                        }`}
                      >
                        {subscription.name}
                      </div>
                      <div
                        className={`text-sm ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                      >
                        {isStealthOps
                          ? `[${subscription.category.toUpperCase()}]`
                          : subscription.category}
                      </div>
                    </div>

                    <div
                      className={`font-medium ${textColors.primary} ${
                        isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                      }`}
                    >
                      {formatCurrency(
                        calculateMonthlyAmount(
                          subscription.cost,
                          subscription.frequency || subscription.billingCycle || "monthly",
                          subscription.variablePricing
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
