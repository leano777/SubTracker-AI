import { Calendar, PiggyBank, Calculator, Sparkles, TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";
// Recharts temporarily replaced with placeholder components due to es-toolkit import issue
const ResponsiveContainer = ({ children }: any) => <div className="w-full h-full">{children}</div>;
const AreaChart = ({ children }: any) => <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg"><div className="text-center text-gray-500"><TrendingUp className="w-8 h-8 mx-auto mb-2" /><p>Chart temporarily disabled</p></div></div>;
const XAxis = () => null;
const YAxis = () => null;
const CartesianGrid = () => null;
const Area = () => null;
const Tooltip = () => null;
const Legend = () => null;

import type {
  FullSubscription,
  BudgetCategory,
  FinancialRoutingSettings,
} from "../types/subscription";
import { DEFAULT_BUDGET_CATEGORIES } from "../types/subscription";
import {
  formatCurrency,
  getNextThursday,
  getWeekString,
  calculateWeeklyAmount,
  validateSubscriptionForCalculations,
} from "../utils/helpers";
import { getGlassStyles, getTextColors } from "../utils/theme";

import { CalendarView } from "./CalendarView";
import { CategoryBudgetManager } from "./CategoryBudgetManager";
import { EnhancedBudgetProgressBar } from "./EnhancedBudgetProgressBar";
import { WhatIfModal } from "./WhatIfModal";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { WeekSelector } from "./WeekSelector";

interface PlanningTabProps {
  subscriptions: FullSubscription[];
  weeklyBudgets: any[];
  onViewSubscription: (subscription: FullSubscription) => void;
  onUpdateSubscriptionDate: (subscriptionId: string, newDate: Date) => void;
  onUpdateCategories: (categories: BudgetCategory[]) => void;
  isDarkMode?: boolean;
  isStealthOps?: boolean;
}

export const PlanningTab = ({
  subscriptions,
  weeklyBudgets,
  onViewSubscription,
  onUpdateSubscriptionDate,
  onUpdateCategories,
  isDarkMode = false,
  isStealthOps = false,
}: PlanningTabProps) => {
  console.log("PlanningTab rendering with:", {
    subscriptionsLength: subscriptions?.length,
    weeklyBudgetsLength: weeklyBudgets?.length,
    hasHandlers: {
      onViewSubscription: !!onViewSubscription,
      onUpdateSubscriptionDate: !!onUpdateSubscriptionDate,
    },
  });
  const [selectedWeek, setSelectedWeek] = useState(getWeekString(new Date()));
  const [calendarMode, setCalendarMode] = useState<"calendar" | "budget">("calendar");
  const [showWhatIfModal, setShowWhatIfModal] = useState(false);

  // Initialize budget categories with defaults if none exist
  const [budgetCategories] = useState<BudgetCategory[]>(() => {
    // Check if we have any existing categories, if not, create defaults
    const existingCategories: BudgetCategory[] = []; // This would come from app state in real implementation

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
  const [financialSettings] = useState<FinancialRoutingSettings>({
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

  // Enhanced theme styles
  const textColors = getTextColors(isStealthOps, isDarkMode);
  const glassStyles = getGlassStyles(isStealthOps, isDarkMode);

  // Calculate current monthly spending for What-if modal
  const currentMonthlySpending = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === "active")
      .reduce((total, sub) => {
        const validatedSub = validateSubscriptionForCalculations(sub);
        const weeklyAmount = calculateWeeklyAmount(
          validatedSub.price,
          validatedSub.frequency,
          validatedSub.variablePricing
        );
        return total + weeklyAmount * 4.33; // Convert to monthly
      }, 0);
  }, [subscriptions]);

  // Enhanced budget data for progress bars
  const enhancedBudgetData = useMemo(() => {
    return budgetCategories.map((category, index) => {
      const categorySubscriptions = subscriptions.filter(
        (sub) => sub.budgetCategory === category.id || sub.category === category.name
      );
      
      const spent = categorySubscriptions.reduce((sum, sub) => {
        const validatedSub = validateSubscriptionForCalculations(sub);
        return sum + calculateWeeklyAmount(
          validatedSub.price,
          validatedSub.frequency,
          validatedSub.variablePricing
        ) * 4.33; // Convert to monthly
      }, 0);

      const utilizationRate = category.weeklyAllocation > 0 ? (spent / (category.weeklyAllocation * 4.33)) * 100 : 0;
      const isOverBudget = spent > (category.weeklyAllocation * 4.33);
      
      return {
        id: category.id,
        name: category.name,
        allocated: category.weeklyAllocation * 4.33, // Convert to monthly
        spent,
        remaining: (category.weeklyAllocation * 4.33) - spent,
        category: category.name,
        color: category.color || `hsl(${index * 40}, 70%, 50%)`,
        priority: category.priority || 5,
        trend: Math.random() > 0.5 ? "up" : Math.random() > 0.5 ? "down" : "stable" as "up" | "down" | "stable",
        trendPercentage: (Math.random() - 0.5) * 20, // -10% to +10%
        projectedSpend: spent * (1 + Math.random() * 0.1), // 0-10% increase projection
        daysRemaining: 30 - new Date().getDate(),
        isOverBudget,
        warningThreshold: 80,
        criticalThreshold: 95,
      };
    });
  }, [budgetCategories, subscriptions]);

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
          
          {/* What-If Scenario Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWhatIfModal(true)}
            className={`${isStealthOps ? "tactical-button border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono tracking-wide tactical-glow" : "border-blue-200 text-blue-700 hover:bg-blue-100"}`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
          >
            <Calculator className="w-4 h-4 mr-1" />
            {isStealthOps ? "[WHAT-IF]" : "What-If"}
          </Button>
          
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
                availableWeeks={weeklyBudgets || []}
                selectedWeekId={selectedWeek}
                onWeekChange={setSelectedWeek}
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
                weeklyBudgets={weeklyBudgets || []}
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

          {/* Enhanced Budget Progress Bars */}
          <Card
            className={`${isStealthOps ? "tactical-surface border-2 border-gray-600" : "border-0"}`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : glassStyles}
          >
            <CardHeader>
              <CardTitle className={`${textColors.primary} flex items-center space-x-2`}>
                <TrendingUp className={`w-5 h-5 ${isStealthOps ? "text-green-400" : ""}`} />
                <span>{isStealthOps ? "[BUDGET PROGRESS OVERVIEW]" : "Budget Progress Overview"}</span>
              </CardTitle>
              <CardDescription className={textColors.muted}>
                {isStealthOps ? "[REAL-TIME BUDGET UTILIZATION AND TRENDS]" : "Real-time budget utilization and trends"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {enhancedBudgetData.slice(0, 6).map((budget) => (
                  <EnhancedBudgetProgressBar
                    key={budget.id}
                    budgetData={budget}
                    showDetails={true}
                    showProjection={true}
                    variant="default"
                    isStealthOps={isStealthOps}
                    isDarkMode={isDarkMode}
                    onBudgetClick={(budgetId) => {
                      console.log("Budget clicked:", budgetId);
                      // Handle budget click - could open detailed view
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Spending Trend Chart */}
          <Card
            className={`${isStealthOps ? "tactical-surface border-2 border-gray-600" : "border-0"}`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : glassStyles}
          >
            <CardHeader>
              <CardTitle className={`${textColors.primary} flex items-center space-x-2`}>
                <Sparkles className={`w-5 h-5 ${isStealthOps ? "text-blue-400" : ""}`} />
                <span>{isStealthOps ? "[ENHANCED SPENDING TREND ANALYSIS]" : "Enhanced Spending Trend Analysis"}</span>
              </CardTitle>
              <CardDescription className={textColors.muted}>
                {isStealthOps ? "[PREDICTIVE ANALYTICS AND SPENDING PATTERNS]" : "Predictive analytics and spending patterns"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendingTrendData}>
                    <defs>
                      <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="businessGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="entertainmentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="utilitiesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isStealthOps ? "#333333" : undefined} />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12} 
                      angle={-45} 
                      textAnchor="end" 
                      height={60} 
                      stroke={isStealthOps ? "#888888" : undefined}
                    />
                    <YAxis 
                      fontSize={12} 
                      stroke={isStealthOps ? "#888888" : undefined}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isStealthOps ? "rgba(0, 0, 0, 0.9)" : undefined,
                        border: isStealthOps ? "1px solid #333333" : undefined,
                        borderRadius: isStealthOps ? "0.125rem" : undefined,
                        color: isStealthOps ? "#ffffff" : undefined,
                      }}
                      formatter={(value) => [formatCurrency(value as number), ""]}
                      labelStyle={{
                        color: isStealthOps ? "#ffffff" : undefined,
                        fontFamily: isStealthOps ? "monospace" : undefined,
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        color: isStealthOps ? "#ffffff" : undefined,
                        fontFamily: isStealthOps ? "monospace" : undefined,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalSpending"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="url(#totalGradient)"
                      strokeWidth={2}
                      name={isStealthOps ? "[TOTAL SPENDING]" : "Total Spending"}
                    />
                    <Area
                      type="monotone"
                      dataKey="businessTools"
                      stackId="2"
                      stroke="#10b981"
                      fill="url(#businessGradient)"
                      strokeWidth={2}
                      name={isStealthOps ? "[BUSINESS TOOLS]" : "Business Tools"}
                    />
                    <Area
                      type="monotone"
                      dataKey="entertainment"
                      stackId="2"
                      stroke="#ef4444"
                      fill="url(#entertainmentGradient)"
                      strokeWidth={2}
                      name={isStealthOps ? "[ENTERTAINMENT]" : "Entertainment"}
                    />
                    <Area
                      type="monotone"
                      dataKey="utilities"
                      stackId="2"
                      stroke="#f59e0b"
                      fill="url(#utilitiesGradient)"
                      strokeWidth={2}
                      name={isStealthOps ? "[UTILITIES]" : "Utilities"}
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
          onUpdateCategories={onUpdateCategories}
          isDarkMode={isDarkMode}
          isStealthOps={isStealthOps}
        />
      )}
      
      {/* What-If Scenario Modal */}
      <WhatIfModal
        isOpen={showWhatIfModal}
        onClose={() => setShowWhatIfModal(false)}
        subscriptions={subscriptions}
        budgetCategories={budgetCategories}
        currentMonthlySpending={currentMonthlySpending}
        isDarkMode={isDarkMode}
        isStealthOps={isStealthOps}
      />
    </div>
  );
};
