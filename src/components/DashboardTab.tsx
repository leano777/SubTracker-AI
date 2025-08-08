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
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

import type { AppSettings, Notification } from "../types/constants";
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

interface DashboardTabProps {
  subscriptions: FullSubscription[];
  cards: FullPaymentCard[];
  settings: AppSettings;
  notifications: Notification[];
  weeklyBudgets?: any[];
}

export const DashboardTab = ({
  subscriptions,
  settings,
  notifications,
  cards,
}: DashboardTabProps) => {
  console.log("🏠 DashboardTab rendered with:", {
    subscriptionsCount: subscriptions?.length || 0,
    cardsCount: cards?.length || 0,
    firstSub: subscriptions?.[0]?.name || "none",
  });

  // Safety checks
  if (!subscriptions) {
    console.warn("DashboardTab: subscriptions is null/undefined");
    return <div className="p-4">Loading dashboard...</div>;
  }

  if (!settings) {
    console.warn("DashboardTab: settings is null/undefined");
    return <div className="p-4">Loading dashboard...</div>;
  }

  const [selectedTimeframe, setSelectedTimeframe] = useState<"month" | "quarter" | "year">("month");

  // Detect mobile screen
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Detect current theme
  const currentTheme = settings.preferences.theme || "light";
  const isDarkMode = currentTheme === "dark";
  const isStealthOps = currentTheme === "stealth-ops";

  // Calculate key metrics with error handling
  let activeSubscriptions = [];
  let cancelledSubscriptions = [];
  let totalMonthlySpend = 0;
  let totalYearlySpend = 0;

  try {
    activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");
    cancelledSubscriptions = subscriptions.filter((sub) => sub.status === "cancelled");

    totalMonthlySpend = activeSubscriptions.reduce((total, sub) => {
      return total + safeCalculateMonthlyAmount(sub);
    }, 0);
    totalYearlySpend = totalMonthlySpend * 12;

    console.log("💰 Calculations:", {
      activeCount: activeSubscriptions.length,
      totalMonthly: totalMonthlySpend,
      totalYearly: totalYearlySpend,
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
          title="Monthly Spend"
          value={formatCurrency(totalMonthlySpend)}
          change="+5.2% from last month"
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

      {/* Enhanced Alerts and Notifications with Stealth Ops Support */}
      {(notifications.filter((n) => !n.read).length > 0 || upcomingPayments.length > 0) && (
        <Card
          className={`${
            isStealthOps
              ? "tactical-surface border-2 border-yellow-400 tactical-glow"
              : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20"
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle
              className={`flex items-center gap-2 ${
                isStealthOps
                  ? "text-yellow-400 font-mono tracking-wide tactical-text-glow"
                  : "text-orange-800 dark:text-orange-200"
              }`}
            >
              <Bell className={`w-5 h-5 ${isStealthOps ? "text-yellow-400" : ""}`} />
              {isStealthOps ? "[⚠ ATTENTION REQUIRED ⚠]" : "Attention Required"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingPayments.length > 0 && (
              <div
                className={`flex items-center justify-between p-3 ${
                  isStealthOps
                    ? "tactical-surface border border-gray-600"
                    : "bg-white dark:bg-gray-800 rounded-lg"
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle
                    className={`w-5 h-5 ${isStealthOps ? "text-yellow-400" : "text-orange-500"}`}
                  />
                  <div>
                    <div
                      className={`font-medium ${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                    >
                      {isStealthOps ? "[UPCOMING PAYMENTS]" : "Upcoming Payments"}
                    </div>
                    <div
                      className={`text-sm ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                    >
                      {isStealthOps
                        ? `[${upcomingPayments.length} PAYMENT${upcomingPayments.length !== 1 ? "S" : ""} DUE IN NEXT 7 DAYS]`
                        : `${upcomingPayments.length} payment${upcomingPayments.length !== 1 ? "s" : ""} due in the next 7 days`}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className={`${
                    isStealthOps
                      ? "tactical-button border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono tracking-wide"
                      : ""
                  }`}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  {isStealthOps ? "[VIEW]" : "View"} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            )}

            {notifications
              .filter((n) => !n.read)
              .slice(0, 2)
              .map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-center justify-between p-3 ${
                    isStealthOps
                      ? "tactical-surface border border-gray-600"
                      : "bg-white dark:bg-gray-800 rounded-lg"
                  }`}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 ${isStealthOps ? "" : "rounded-full"} ${
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
                    <div>
                      <div
                        className={`font-medium ${textColors.primary} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                      >
                        {isStealthOps
                          ? `[${notification.title.toUpperCase()}]`
                          : notification.title}
                      </div>
                      <div
                        className={`text-sm ${textColors.muted} line-clamp-1 ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                      >
                        {isStealthOps
                          ? `[${notification.message.toUpperCase()}]`
                          : notification.message}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`${
                      isStealthOps
                        ? "tactical-button border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono tracking-wide"
                        : ""
                    }`}
                    style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                  >
                    {isStealthOps ? "[VIEW]" : "View"}
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Spending Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spending Trend Chart */}
          <Card className={isStealthOps ? "tactical-surface" : ""}>
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${textColors.primary} ${
                  isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                }`}
              >
                <TrendingUp className={`w-5 h-5 ${isStealthOps ? "text-green-400" : ""}`} />
                {isStealthOps ? "[SPENDING TREND]" : "Spending Trend"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spendingTrend}>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: isStealthOps ? "#ffffff" : isDarkMode ? "#e5e7eb" : "#374151",
                        fontFamily: isStealthOps ? "monospace" : "inherit",
                        fontSize: isStealthOps ? 12 : 14,
                      }}
                    />
                    <YAxis hide />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke={isStealthOps ? "#00ff00" : "#3b82f6"}
                      strokeWidth={3}
                      dot={{
                        fill: isStealthOps ? "#00ff00" : "#3b82f6",
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                        stroke: isStealthOps ? "#00ff00" : "#3b82f6",
                        strokeWidth: 2,
                        fill: isStealthOps ? "#00ff00" : "#3b82f6",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div
                className={`flex items-center justify-between mt-4 pt-4 ${
                  isStealthOps ? "border-t border-gray-600" : "border-t"
                }`}
              >
                <div>
                  <div
                    className={`text-sm ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                  >
                    {isStealthOps ? "[AVERAGE MONTHLY]" : "Average Monthly"}
                  </div>
                  <div
                    className={`font-semibold ${textColors.primary} ${
                      isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                    }`}
                  >
                    {formatCurrency(totalMonthlySpend)}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm ${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                  >
                    {isStealthOps ? "[TREND]" : "Trend"}
                  </div>
                  <div
                    className={`flex items-center gap-1 ${
                      isStealthOps ? "text-green-400 font-mono tracking-wide" : "text-green-600"
                    }`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    {isStealthOps ? "[+5.2%]" : "+5.2%"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
              <Button
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
