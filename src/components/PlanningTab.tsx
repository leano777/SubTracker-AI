import React, { useState, useMemo } from "react";
import {
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  Plus,
  DollarSign,
  PiggyBank,
  Calculator,
} from "lucide-react";
import { CalendarView } from "./CalendarView";
import { CategoryBudgetManager } from "./CategoryBudgetManager";
import { WeekSelector } from "./WeekSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  FullSubscription,
  BudgetCategory,
  WeeklyAllocation,
  FinancialRoutingSettings,
  DEFAULT_BUDGET_CATEGORIES,
} from "../types/subscription";
import {
  formatCurrency,
  getNextThursday,
  getWeekString,
  calculateWeeklyAmount,
  validateSubscriptionForCalculations,
} from "../utils/helpers";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

interface PlanningTabProps {
  subscriptions: FullSubscription[];
  weeklyBudgets: any[];
  onViewSubscription: (subscription: FullSubscription) => void;
  onUpdateSubscriptionDate: (subscriptionId: string, newDate: Date) => void;
  isDarkMode?: boolean;
  isStealthOps?: boolean;
}

export function PlanningTab({
  subscriptions,
  weeklyBudgets,
  onViewSubscription,
  onUpdateSubscriptionDate,
  isDarkMode = false,
  isStealthOps = false,
}: PlanningTabProps) {
  const [selectedWeek, setSelectedWeek] = useState(getWeekString(new Date()));
  const [calendarMode, setCalendarMode] = useState<"calendar" | "budget">("calendar");

  // Initialize budget categories with defaults if none exist
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(() => {
    // Check if we have any existing categories, if not, create defaults
    const existingCategories = []; // This would come from app state in real implementation

    if (existingCategories.length === 0) {
      return DEFAULT_BUDGET_CATEGORIES.map((category, index) => ({
        ...category,
        id: `default-${index}`,
        createdDate: new Date().toISOString().split("T")[0],
      }));
    }

    return existingCategories;
  });

  // Initialize financial settings
  const [financialSettings, setFinancialSettings] = useState<FinancialRoutingSettings>({
    payDay: "thursday",
    weeklyIncome: 1000, // Default weekly income
    emergencyFundPercentage: 10,
    minimumBufferPercentage: 15,
    autoAllocateEnabled: true,
    rolloverUnspent: true,
    priorityFunding: true,
    notificationSettings: {
      lowBalance: true,
      overspending: true,
      weeklyAllocation: true,
      categoryRebalancing: true,
    },
    allocationThresholds: {
      warning: 25,
      critical: 10,
    },
  });

  // Initialize weekly allocations
  const [weeklyAllocations, setWeeklyAllocations] = useState<WeeklyAllocation[]>([]);

  // Calculate upcoming payments for the selected week
  const weeklyPayments = useMemo(() => {
    const weekStart = new Date();
    const [year, week] = selectedWeek.split("-W").map(Number);
    weekStart.setFullYear(year);
    weekStart.setMonth(0, 1);
    weekStart.setDate(weekStart.getDate() + (week - 1) * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return subscriptions
      .filter((sub) => {
        if (sub.status !== "active") return false;
        const nextPayment = new Date(sub.nextPayment);
        return nextPayment >= weekStart && nextPayment < weekEnd;
      })
      .sort((a, b) => new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime());
  }, [subscriptions, selectedWeek]);

  // Calculate weekly spending breakdown
  const weeklyBreakdown = useMemo(() => {
    const breakdown: { [key: string]: { total: number; subscriptions: FullSubscription[] } } = {};

    weeklyPayments.forEach((sub) => {
      const category = sub.category || "Uncategorized";
      if (!breakdown[category]) {
        breakdown[category] = { total: 0, subscriptions: [] };
      }
      const validatedSub = validateSubscriptionForCalculations(sub);
      breakdown[category].total += calculateWeeklyAmount(
        validatedSub.price,
        validatedSub.frequency,
        validatedSub.variablePricing
      );
      breakdown[category].subscriptions.push(sub);
    });

    return Object.entries(breakdown)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.subscriptions.length,
        subscriptions: data.subscriptions,
      }))
      .sort((a, b) => b.total - a.total);
  }, [weeklyPayments]);

  // Calculate total weekly spending
  const totalWeeklySpending = weeklyBreakdown.reduce((sum, item) => sum + item.total, 0);

  // Calculate category spending over time for charts
  const spendingTrendData = useMemo(() => {
    const weeks = [];
    const currentDate = new Date();

    for (let i = -8; i <= 4; i++) {
      const weekDate = new Date(currentDate);
      weekDate.setDate(weekDate.getDate() + i * 7);
      const weekString = getWeekString(weekDate);

      const weekStart = new Date(weekDate);
      weekStart.setDate(weekStart.getDate() - weekDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekPayments = subscriptions.filter((sub) => {
        if (sub.status !== "active") return false;
        const nextPayment = new Date(sub.nextPayment);
        return nextPayment >= weekStart && nextPayment < weekEnd;
      });

      const totalSpending = weekPayments.reduce((sum, sub) => {
        const validatedSub = validateSubscriptionForCalculations(sub);
        return (
          sum +
          calculateWeeklyAmount(
            validatedSub.price,
            validatedSub.frequency,
            validatedSub.variablePricing
          )
        );
      }, 0);

      weeks.push({
        week: weekString,
        date: weekDate.toLocaleDateString(),
        totalSpending,
        subscriptionCount: weekPayments.length,
        businessTools: weekPayments
          .filter((sub) => sub.category === "Business Tools")
          .reduce((sum, sub) => {
            const validatedSub = validateSubscriptionForCalculations(sub);
            return (
              sum +
              calculateWeeklyAmount(
                validatedSub.price,
                validatedSub.frequency,
                validatedSub.variablePricing
              )
            );
          }, 0),
        entertainment: weekPayments
          .filter((sub) => sub.category === "Entertainment")
          .reduce((sum, sub) => {
            const validatedSub = validateSubscriptionForCalculations(sub);
            return (
              sum +
              calculateWeeklyAmount(
                validatedSub.price,
                validatedSub.frequency,
                validatedSub.variablePricing
              )
            );
          }, 0),
        utilities: weekPayments
          .filter((sub) => sub.category === "Utilities & Services")
          .reduce((sum, sub) => {
            const validatedSub = validateSubscriptionForCalculations(sub);
            return (
              sum +
              calculateWeeklyAmount(
                validatedSub.price,
                validatedSub.frequency,
                validatedSub.variablePricing
              )
            );
          }, 0),
      });
    }

    return weeks;
  }, [subscriptions]);

  // Get next Thursday for pay day calculation
  const nextPayDay = getNextThursday(new Date());

  const textColors = {
    primary: isStealthOps ? "text-white" : isDarkMode ? "text-gray-100" : "text-gray-900",
    secondary: isStealthOps ? "text-gray-300" : isDarkMode ? "text-gray-300" : "text-gray-700",
    muted: isStealthOps ? "text-gray-400" : isDarkMode ? "text-gray-400" : "text-gray-600",
  };

  const glassStyles = {
    background: isStealthOps
      ? "rgba(0, 0, 0, 0.9)"
      : isDarkMode
        ? "rgba(31, 41, 55, 0.8)"
        : "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(12px)",
    border: isStealthOps
      ? "1px solid #333333"
      : isDarkMode
        ? "1px solid rgba(75, 85, 99, 0.3)"
        : "1px solid rgba(255, 255, 255, 0.3)",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-semibold ${textColors.primary}`}>
            {isStealthOps ? "[FINANCIAL PLANNING]" : "Financial Planning"}
          </h1>
          <p className={`${textColors.muted} mt-1`}>
            {isStealthOps
              ? "[MANAGE SUBSCRIPTION SCHEDULES AND BUDGET ALLOCATIONS]"
              : "Manage your subscription schedules and budget allocations"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`${textColors.secondary} ${isStealthOps ? "font-mono" : ""}`}
          >
            {isStealthOps ? "[NEXT PAY: " : "Next Pay: "}
            {nextPayDay.toLocaleDateString()}
            {isStealthOps ? "]" : ""}
          </Badge>
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Button
              variant={calendarMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCalendarMode("calendar")}
              className={`${isStealthOps ? "tactical-button" : ""} px-3`}
              style={isStealthOps ? { borderRadius: "0" } : undefined}
            >
              <Calendar className="w-4 h-4 mr-1" />
              {isStealthOps ? "[CALENDAR]" : "Calendar"}
            </Button>
            <Button
              variant={calendarMode === "budget" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCalendarMode("budget")}
              className={`${isStealthOps ? "tactical-button" : ""} px-3`}
              style={isStealthOps ? { borderRadius: "0" } : undefined}
            >
              <PiggyBank className="w-4 h-4 mr-1" />
              {isStealthOps ? "[BUDGET]" : "Budget"}
            </Button>
          </div>
        </div>
      </div>

      {/* Mode-specific content */}
      {calendarMode === "calendar" ? (
        <div className="space-y-6">
          {/* Week Selector */}
          <Card
            className={`${isStealthOps ? "tactical-surface border-2 border-gray-600" : "border-0"}`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : glassStyles}
          >
            <CardContent className="p-4">
              <WeekSelector
                selectedWeek={selectedWeek}
                onWeekChange={setSelectedWeek}
                isDarkMode={isDarkMode}
                isStealthOps={isStealthOps}
              />
            </CardContent>
          </Card>

          {/* Weekly Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className={`${isStealthOps ? "tactical-surface border border-gray-600" : "border-0"}`}
              style={isStealthOps ? { borderRadius: "0.125rem" } : glassStyles}
            >
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm ${textColors.muted}`}>
                  {isStealthOps ? "[TOTAL WEEKLY SPEND]" : "Total Weekly Spend"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${textColors.primary}`}>
                  {formatCurrency(totalWeeklySpending)}
                </div>
                <p className={`text-sm ${textColors.muted} mt-1`}>
                  {weeklyPayments.length} payment{weeklyPayments.length !== 1 ? "s" : ""} due
                </p>
              </CardContent>
            </Card>

            <Card
              className={`${isStealthOps ? "tactical-surface border border-gray-600" : "border-0"}`}
              style={isStealthOps ? { borderRadius: "0.125rem" } : glassStyles}
            >
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm ${textColors.muted}`}>
                  {isStealthOps ? "[BUDGET UTILIZATION]" : "Budget Utilization"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${textColors.primary}`}>
                  {financialSettings.weeklyIncome > 0
                    ? `${((totalWeeklySpending / financialSettings.weeklyIncome) * 100).toFixed(1)}%`
                    : "0%"}
                </div>
                <Progress
                  value={
                    financialSettings.weeklyIncome > 0
                      ? (totalWeeklySpending / financialSettings.weeklyIncome) * 100
                      : 0
                  }
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>

            <Card
              className={`${isStealthOps ? "tactical-surface border border-gray-600" : "border-0"}`}
              style={isStealthOps ? { borderRadius: "0.125rem" } : glassStyles}
            >
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm ${textColors.muted}`}>
                  {isStealthOps ? "[DAYS TO PAYDAY]" : "Days to Payday"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${textColors.primary}`}>
                  {Math.ceil((nextPayDay.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <p className={`text-sm ${textColors.muted} mt-1`}>
                  {nextPayDay.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Calendar View */}
          <Card
            className={`${isStealthOps ? "tactical-surface border-2 border-gray-600" : "border-0"}`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : glassStyles}
          >
            <CardContent className="p-6">
              <CalendarView
                subscriptions={subscriptions}
                onViewSubscription={onViewSubscription}
                onUpdateSubscriptionDate={onUpdateSubscriptionDate}
                isDarkMode={isDarkMode}
                isStealthOps={isStealthOps}
              />
            </CardContent>
          </Card>

          {/* Weekly Breakdown */}
          {weeklyBreakdown.length > 0 && (
            <Card
              className={`${isStealthOps ? "tactical-surface border-2 border-gray-600" : "border-0"}`}
              style={isStealthOps ? { borderRadius: "0.125rem" } : glassStyles}
            >
              <CardHeader>
                <CardTitle className={textColors.primary}>
                  {isStealthOps ? "[WEEKLY SPENDING BREAKDOWN]" : "Weekly Spending Breakdown"}
                </CardTitle>
                <CardDescription className={textColors.muted}>
                  Spending by category for the selected week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyBreakdown.map(
                    ({ category, total, count, subscriptions: categorySubscriptions }) => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${textColors.primary}`}>{category}</span>
                            <Badge variant="secondary" className={isStealthOps ? "font-mono" : ""}>
                              {count} subscription{count !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <span className={`font-semibold ${textColors.primary}`}>
                            {formatCurrency(total)}
                          </span>
                        </div>
                        <Progress
                          value={totalWeeklySpending > 0 ? (total / totalWeeklySpending) * 100 : 0}
                          className="h-2"
                        />
                        <div className="flex flex-wrap gap-1">
                          {categorySubscriptions.map((sub) => (
                            <Badge
                              key={sub.id}
                              variant="outline"
                              className={`text-xs ${textColors.muted} ${isStealthOps ? "font-mono" : ""}`}
                            >
                              {sub.name} -{" "}
                              {(() => {
                                const validatedSub = validateSubscriptionForCalculations(sub);
                                return formatCurrency(
                                  calculateWeeklyAmount(
                                    validatedSub.price,
                                    validatedSub.frequency,
                                    validatedSub.variablePricing
                                  )
                                );
                              })()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Spending Trend Chart */}
          <Card
            className={`${isStealthOps ? "tactical-surface border-2 border-gray-600" : "border-0"}`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : glassStyles}
          >
            <CardHeader>
              <CardTitle className={textColors.primary}>
                {isStealthOps ? "[SPENDING TREND ANALYSIS]" : "Spending Trend Analysis"}
              </CardTitle>
              <CardDescription className={textColors.muted}>
                Weekly spending patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendingTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} angle={-45} textAnchor="end" height={60} />
                    <YAxis fontSize={12} />
                    <Area
                      type="monotone"
                      dataKey="totalSpending"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Total Spending"
                    />
                    <Area
                      type="monotone"
                      dataKey="businessTools"
                      stackId="2"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Business Tools"
                    />
                    <Area
                      type="monotone"
                      dataKey="entertainment"
                      stackId="2"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                      name="Entertainment"
                    />
                    <Area
                      type="monotone"
                      dataKey="utilities"
                      stackId="2"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.6}
                      name="Utilities"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Budget mode - show CategoryBudgetManager
        <CategoryBudgetManager
          subscriptions={subscriptions}
          budgetCategories={budgetCategories}
          financialSettings={financialSettings}
          weeklyAllocations={weeklyAllocations}
          onUpdateCategories={setBudgetCategories}
          onUpdateSettings={setFinancialSettings}
          onUpdateAllocations={setWeeklyAllocations}
          isDarkMode={isDarkMode}
          isStealthOps={isStealthOps}
        />
      )}
    </div>
  );
}
