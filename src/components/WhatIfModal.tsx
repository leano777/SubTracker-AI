import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  Zap,
  DollarSign,
  Plus,
  Minus,
  BarChart3,
  PieChart,
  Lightbulb,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

import type { FullSubscription, BudgetCategory } from "../types/subscription";
import { formatCurrency, calculateWeeklyAmount, validateSubscriptionForCalculations } from "../utils/helpers";
import { getGlassStyles, getTextColors } from "../utils/theme";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface WhatIfModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: FullSubscription[];
  budgetCategories: BudgetCategory[];
  currentMonthlySpending: number;
  isDarkMode?: boolean;
  isStealthOps?: boolean;
}

interface ScenarioSettings {
  weeklyIncomeChange: number;
  categoryBudgetChanges: { [categoryId: string]: number };
  subscriptionChanges: { [subscriptionId: string]: { enabled: boolean; priceMultiplier: number } };
  addNewSubscriptionBudget: number;
  emergencyFundTarget: number;
  savingsGoalTarget: number;
}

interface ScenarioResults {
  totalWeeklySpending: number;
  totalMonthlySpending: number;
  weeklyIncome: number;
  monthlyIncome: number;
  budgetUtilization: number;
  surplus: number;
  emergencyFundContribution: number;
  savingsContribution: number;
  categoryBreakdown: {
    categoryId: string;
    name: string;
    currentSpending: number;
    newSpending: number;
    change: number;
    changePercent: number;
  }[];
  impactAnalysis: {
    type: "positive" | "negative" | "neutral";
    message: string;
    severity: "low" | "medium" | "high";
  }[];
}

export const WhatIfModal = ({
  isOpen,
  onClose,
  subscriptions,
  budgetCategories,
  currentMonthlySpending,
  isDarkMode = false,
  isStealthOps = false,
}: WhatIfModalProps) => {
  // Initial scenario settings
  const [scenario, setScenario] = useState<ScenarioSettings>({
    weeklyIncomeChange: 0,
    categoryBudgetChanges: {},
    subscriptionChanges: {},
    addNewSubscriptionBudget: 0,
    emergencyFundTarget: 500,
    savingsGoalTarget: 200,
  });

  const [activeTab, setActiveTab] = useState("income");

  // Theme styles
  const glassStyles = getGlassStyles(isStealthOps, isDarkMode);
  const textColors = getTextColors(isStealthOps, isDarkMode);

  // Calculate current baseline
  const baselineWeeklyIncome = 1000; // This would come from user settings
  const baselineMonthlyIncome = baselineWeeklyIncome * 4.33;

  // Calculate scenario results
  const scenarioResults = useMemo((): ScenarioResults => {
    const newWeeklyIncome = baselineWeeklyIncome + scenario.weeklyIncomeChange;
    const newMonthlyIncome = newWeeklyIncome * 4.33;

    // Calculate category spending changes
    const categoryBreakdown = budgetCategories.map((category) => {
      const categorySubscriptions = subscriptions.filter(
        (sub) => sub.budgetCategory === category.id || sub.category === category.name
      );

      const currentSpending = categorySubscriptions.reduce((sum, sub) => {
        const validatedSub = validateSubscriptionForCalculations(sub);
        return (
          sum +
          calculateWeeklyAmount(
            validatedSub.price,
            validatedSub.frequency,
            validatedSub.variablePricing
          ) *
            4.33
        );
      }, 0);

      // Apply subscription changes
      const newSpending = categorySubscriptions.reduce((sum, sub) => {
        const validatedSub = validateSubscriptionForCalculations(sub);
        const baseAmount =
          calculateWeeklyAmount(
            validatedSub.price,
            validatedSub.frequency,
            validatedSub.variablePricing
          ) * 4.33;

        const subChange = scenario.subscriptionChanges[sub.id];
        if (subChange && !subChange.enabled) return sum; // Subscription disabled

        const multiplier = subChange?.priceMultiplier || 1;
        return sum + baseAmount * multiplier;
      }, 0);

      // Apply category budget changes
      const categoryChange = scenario.categoryBudgetChanges[category.id] || 0;
      const finalSpending = Math.max(0, newSpending + categoryChange);

      return {
        categoryId: category.id,
        name: category.name,
        currentSpending,
        newSpending: finalSpending,
        change: finalSpending - currentSpending,
        changePercent: currentSpending > 0 ? ((finalSpending - currentSpending) / currentSpending) * 100 : 0,
      };
    });

    const totalWeeklySpending = categoryBreakdown.reduce((sum, cat) => sum + cat.newSpending / 4.33, 0);
    const totalMonthlySpending = categoryBreakdown.reduce((sum, cat) => sum + cat.newSpending, 0) + scenario.addNewSubscriptionBudget;

    const budgetUtilization = newMonthlyIncome > 0 ? (totalMonthlySpending / newMonthlyIncome) * 100 : 0;
    const surplus = newMonthlyIncome - totalMonthlySpending;

    const emergencyFundContribution = Math.min(surplus * 0.2, scenario.emergencyFundTarget);
    const savingsContribution = Math.min(surplus * 0.3, scenario.savingsGoalTarget);

    // Generate impact analysis
    const impactAnalysis: ScenarioResults["impactAnalysis"] = [];

    if (budgetUtilization > 100) {
      impactAnalysis.push({
        type: "negative",
        message: "Budget deficit - spending exceeds income",
        severity: "high",
      });
    } else if (budgetUtilization > 80) {
      impactAnalysis.push({
        type: "negative",
        message: "High budget utilization - limited financial flexibility",
        severity: "medium",
      });
    }

    if (surplus > scenario.emergencyFundTarget + scenario.savingsGoalTarget) {
      impactAnalysis.push({
        type: "positive",
        message: "Excellent surplus for emergency fund and savings goals",
        severity: "low",
      });
    }

    const largestIncrease = categoryBreakdown
      .filter((cat) => cat.change > 0)
      .sort((a, b) => b.change - a.change)[0];

    if (largestIncrease && largestIncrease.change > currentMonthlySpending * 0.1) {
      impactAnalysis.push({
        type: "negative",
        message: `Significant increase in ${largestIncrease.name} spending`,
        severity: "medium",
      });
    }

    return {
      totalWeeklySpending,
      totalMonthlySpending,
      weeklyIncome: newWeeklyIncome,
      monthlyIncome: newMonthlyIncome,
      budgetUtilization,
      surplus,
      emergencyFundContribution,
      savingsContribution,
      categoryBreakdown,
      impactAnalysis,
    };
  }, [scenario, subscriptions, budgetCategories, currentMonthlySpending]);

  // Chart data for visualization
  const comparisonChartData = useMemo(() => {
    return [
      {
        name: "Current",
        income: baselineMonthlyIncome,
        spending: currentMonthlySpending,
        surplus: baselineMonthlyIncome - currentMonthlySpending,
      },
      {
        name: "What-If",
        income: scenarioResults.monthlyIncome,
        spending: scenarioResults.totalMonthlySpending,
        surplus: scenarioResults.surplus,
      },
    ];
  }, [scenarioResults, baselineMonthlyIncome, currentMonthlySpending]);

  // Update scenario settings
  const updateScenario = useCallback((updates: Partial<ScenarioSettings>) => {
    setScenario((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetScenario = useCallback(() => {
    setScenario({
      weeklyIncomeChange: 0,
      categoryBudgetChanges: {},
      subscriptionChanges: {},
      addNewSubscriptionBudget: 0,
      emergencyFundTarget: 500,
      savingsGoalTarget: 200,
    });
  }, []);

  const getImpactColor = (type: string) => {
    if (isStealthOps) {
      return type === "positive" ? "text-green-400" : type === "negative" ? "text-red-400" : "text-gray-400";
    }
    return type === "positive" ? "text-green-600" : type === "negative" ? "text-red-600" : "text-gray-600";
  };

  const getImpactIcon = (type: string) => {
    return type === "positive" ? TrendingUp : type === "negative" ? TrendingDown : Target;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-6xl max-h-[90vh] overflow-y-auto ${
          isStealthOps ? "tactical-surface font-mono" : ""
        }`}
        style={isStealthOps ? { ...glassStyles, borderRadius: "0.125rem" } : undefined}
      >
        <DialogHeader>
          <DialogTitle
            className={`flex items-center space-x-2 ${textColors.primary} ${
              isStealthOps ? "tactical-text-glow" : ""
            }`}
          >
            <Calculator className={`w-5 h-5 ${isStealthOps ? "text-green-400" : ""}`} />
            <span>{isStealthOps ? "[WHAT-IF SCENARIO ANALYZER]" : "What-If Scenario Analyzer"}</span>
          </DialogTitle>
          <DialogDescription className={textColors.muted}>
            {isStealthOps
              ? "[ANALYZE THE FINANCIAL IMPACT OF DIFFERENT SPENDING AND INCOME SCENARIOS]"
              : "Analyze the financial impact of different spending and income scenarios"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scenario Results Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card
              className={`${
                isStealthOps
                  ? "tactical-surface border border-blue-400 tactical-glow"
                  : "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className={`w-4 h-4 ${isStealthOps ? "text-blue-400" : "text-blue-600"}`} />
                  <div
                    className={`text-sm ${
                      isStealthOps ? "text-blue-300 font-mono tracking-wide" : "text-blue-700"
                    }`}
                  >
                    {isStealthOps ? "[MONTHLY INCOME]" : "Monthly Income"}
                  </div>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isStealthOps
                      ? "text-blue-400 font-mono tracking-wide tactical-text-glow"
                      : "text-blue-800"
                  }`}
                >
                  {formatCurrency(scenarioResults.monthlyIncome)}
                </div>
                <div
                  className={`text-xs ${
                    isStealthOps ? "text-blue-400 font-mono tracking-wide" : "text-blue-600"
                  }`}
                >
                  {scenario.weeklyIncomeChange >= 0 ? "+" : ""}
                  {formatCurrency(scenario.weeklyIncomeChange * 4.33)} change
                </div>
              </CardContent>
            </Card>

            <Card
              className={`${
                isStealthOps
                  ? "tactical-surface border border-purple-400 tactical-glow"
                  : "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className={`w-4 h-4 ${isStealthOps ? "text-purple-400" : "text-purple-600"}`} />
                  <div
                    className={`text-sm ${
                      isStealthOps ? "text-purple-300 font-mono tracking-wide" : "text-purple-700"
                    }`}
                  >
                    {isStealthOps ? "[MONTHLY SPENDING]" : "Monthly Spending"}
                  </div>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isStealthOps
                      ? "text-purple-400 font-mono tracking-wide tactical-text-glow"
                      : "text-purple-800"
                  }`}
                >
                  {formatCurrency(scenarioResults.totalMonthlySpending)}
                </div>
                <div
                  className={`text-xs ${
                    isStealthOps ? "text-purple-400 font-mono tracking-wide" : "text-purple-600"
                  }`}
                >
                  {scenarioResults.budgetUtilization.toFixed(1)}% of income
                </div>
              </CardContent>
            </Card>

            <Card
              className={`${
                scenarioResults.surplus >= 0
                  ? isStealthOps
                    ? "tactical-surface border border-green-400 tactical-glow"
                    : "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
                  : isStealthOps
                    ? "tactical-surface border border-red-400 tactical-glow"
                    : "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {scenarioResults.surplus >= 0 ? (
                    <TrendingUp
                      className={`w-4 h-4 ${isStealthOps ? "text-green-400" : "text-green-600"}`}
                    />
                  ) : (
                    <TrendingDown
                      className={`w-4 h-4 ${isStealthOps ? "text-red-400" : "text-red-600"}`}
                    />
                  )}
                  <div
                    className={`text-sm ${
                      scenarioResults.surplus >= 0
                        ? isStealthOps
                          ? "text-green-300 font-mono tracking-wide"
                          : "text-green-700"
                        : isStealthOps
                          ? "text-red-300 font-mono tracking-wide"
                          : "text-red-700"
                    }`}
                  >
                    {isStealthOps
                      ? scenarioResults.surplus >= 0
                        ? "[SURPLUS]"
                        : "[DEFICIT]"
                      : scenarioResults.surplus >= 0
                        ? "Surplus"
                        : "Deficit"}
                  </div>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    scenarioResults.surplus >= 0
                      ? isStealthOps
                        ? "text-green-400 font-mono tracking-wide tactical-text-glow"
                        : "text-green-800"
                      : isStealthOps
                        ? "text-red-400 font-mono tracking-wide tactical-text-glow"
                        : "text-red-800"
                  }`}
                >
                  {formatCurrency(Math.abs(scenarioResults.surplus))}
                </div>
                <div
                  className={`text-xs ${
                    scenarioResults.surplus >= 0
                      ? isStealthOps
                        ? "text-green-400 font-mono tracking-wide"
                        : "text-green-600"
                      : isStealthOps
                        ? "text-red-400 font-mono tracking-wide"
                        : "text-red-600"
                  }`}
                >
                  {isStealthOps ? "[PER MONTH]" : "per month"}
                </div>
              </CardContent>
            </Card>

            <Card
              className={`${
                isStealthOps
                  ? "tactical-surface border border-orange-400 tactical-glow"
                  : "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className={`w-4 h-4 ${isStealthOps ? "text-orange-400" : "text-orange-600"}`} />
                  <div
                    className={`text-sm ${
                      isStealthOps ? "text-orange-300 font-mono tracking-wide" : "text-orange-700"
                    }`}
                  >
                    {isStealthOps ? "[BUDGET EFFICIENCY]" : "Budget Efficiency"}
                  </div>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isStealthOps
                      ? "text-orange-400 font-mono tracking-wide tactical-text-glow"
                      : "text-orange-800"
                  }`}
                >
                  {(100 - Math.min(scenarioResults.budgetUtilization, 100)).toFixed(0)}%
                </div>
                <div
                  className={`text-xs ${
                    isStealthOps ? "text-orange-400 font-mono tracking-wide" : "text-orange-600"
                  }`}
                >
                  {isStealthOps ? "[EFFICIENCY RATING]" : "efficiency rating"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scenario Configuration Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`grid w-full grid-cols-4 ${isStealthOps ? "tactical-surface" : ""}`}>
              <TabsTrigger
                value="income"
                className={`${isStealthOps ? "font-mono tracking-wide" : ""}`}
              >
                {isStealthOps ? "[INCOME]" : "Income"}
              </TabsTrigger>
              <TabsTrigger
                value="subscriptions"
                className={`${isStealthOps ? "font-mono tracking-wide" : ""}`}
              >
                {isStealthOps ? "[SUBSCRIPTIONS]" : "Subscriptions"}
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className={`${isStealthOps ? "font-mono tracking-wide" : ""}`}
              >
                {isStealthOps ? "[CATEGORIES]" : "Categories"}
              </TabsTrigger>
              <TabsTrigger
                value="goals"
                className={`${isStealthOps ? "font-mono tracking-wide" : ""}`}
              >
                {isStealthOps ? "[GOALS]" : "Goals"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="income" className="space-y-4">
              <Card className={isStealthOps ? "tactical-surface" : ""}>
                <CardHeader>
                  <CardTitle className={textColors.primary}>
                    {isStealthOps ? "[INCOME ADJUSTMENTS]" : "Income Adjustments"}
                  </CardTitle>
                  <CardDescription className={textColors.muted}>
                    {isStealthOps
                      ? "[MODIFY YOUR WEEKLY INCOME TO SEE THE IMPACT]"
                      : "Modify your weekly income to see the impact"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className={textColors.primary}>
                      {isStealthOps ? "[WEEKLY INCOME CHANGE]" : "Weekly Income Change"}
                    </Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateScenario({ weeklyIncomeChange: scenario.weeklyIncomeChange - 50 })
                        }
                        className={isStealthOps ? "tactical-button" : ""}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div className="flex-1">
                        <Slider
                          value={[scenario.weeklyIncomeChange]}
                          onValueChange={([value]) => updateScenario({ weeklyIncomeChange: value })}
                          max={500}
                          min={-500}
                          step={25}
                          className="w-full"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateScenario({ weeklyIncomeChange: scenario.weeklyIncomeChange + 50 })
                        }
                        className={isStealthOps ? "tactical-button" : ""}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className={`text-sm mt-2 ${textColors.muted}`}>
                      {isStealthOps ? "[CHANGE: " : "Change: "}
                      {scenario.weeklyIncomeChange >= 0 ? "+" : ""}
                      {formatCurrency(scenario.weeklyIncomeChange)}
                      {isStealthOps ? " WEEKLY]" : " weekly"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-4">
              <Card className={isStealthOps ? "tactical-surface" : ""}>
                <CardHeader>
                  <CardTitle className={textColors.primary}>
                    {isStealthOps ? "[SUBSCRIPTION MODIFICATIONS]" : "Subscription Modifications"}
                  </CardTitle>
                  <CardDescription className={textColors.muted}>
                    {isStealthOps
                      ? "[ENABLE/DISABLE SUBSCRIPTIONS OR ADJUST THEIR COSTS]"
                      : "Enable/disable subscriptions or adjust their costs"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subscriptions.slice(0, 8).map((sub) => {
                      const subChange = scenario.subscriptionChanges[sub.id] || {
                        enabled: true,
                        priceMultiplier: 1,
                      };

                      return (
                        <div
                          key={sub.id}
                          className={`flex items-center justify-between p-3 border ${
                            isStealthOps ? "tactical-surface border-gray-600" : "rounded-lg"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={subChange.enabled}
                              onCheckedChange={(enabled) =>
                                updateScenario({
                                  subscriptionChanges: {
                                    ...scenario.subscriptionChanges,
                                    [sub.id]: { ...subChange, enabled },
                                  },
                                })
                              }
                            />
                            <div>
                              <div className={`font-medium ${textColors.primary}`}>{sub.name}</div>
                              <div className={`text-xs ${textColors.muted}`}>
                                {formatCurrency(sub.cost)}/{sub.billingCycle}
                              </div>
                            </div>
                          </div>
                          {subChange.enabled && (
                            <div className="flex items-center space-x-2">
                              <Label className={`text-xs ${textColors.muted}`}>
                                {isStealthOps ? "[COST MULTIPLIER]" : "Cost Multiplier"}
                              </Label>
                              <Slider
                                value={[subChange.priceMultiplier]}
                                onValueChange={([value]) =>
                                  updateScenario({
                                    subscriptionChanges: {
                                      ...scenario.subscriptionChanges,
                                      [sub.id]: { ...subChange, priceMultiplier: value },
                                    },
                                  })
                                }
                                max={2}
                                min={0.5}
                                step={0.1}
                                className="w-20"
                              />
                              <span className={`text-xs ${textColors.primary} w-8`}>
                                {subChange.priceMultiplier.toFixed(1)}x
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <Card className={isStealthOps ? "tactical-surface" : ""}>
                <CardHeader>
                  <CardTitle className={textColors.primary}>
                    {isStealthOps ? "[CATEGORY BUDGET ADJUSTMENTS]" : "Category Budget Adjustments"}
                  </CardTitle>
                  <CardDescription className={textColors.muted}>
                    {isStealthOps
                      ? "[ADJUST SPENDING LIMITS FOR EACH CATEGORY]"
                      : "Adjust spending limits for each category"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {budgetCategories.map((category) => {
                      const change = scenario.categoryBudgetChanges[category.id] || 0;

                      return (
                        <div key={category.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className={textColors.primary}>{category.name}</Label>
                            <div className={`text-sm ${textColors.muted}`}>
                              {change >= 0 ? "+" : ""}
                              {formatCurrency(change)}
                            </div>
                          </div>
                          <Slider
                            value={[change]}
                            onValueChange={([value]) =>
                              updateScenario({
                                categoryBudgetChanges: {
                                  ...scenario.categoryBudgetChanges,
                                  [category.id]: value,
                                },
                              })
                            }
                            max={200}
                            min={-200}
                            step={10}
                            className="w-full"
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              <Card className={isStealthOps ? "tactical-surface" : ""}>
                <CardHeader>
                  <CardTitle className={textColors.primary}>
                    {isStealthOps ? "[FINANCIAL GOALS]" : "Financial Goals"}
                  </CardTitle>
                  <CardDescription className={textColors.muted}>
                    {isStealthOps
                      ? "[SET YOUR EMERGENCY FUND AND SAVINGS TARGETS]"
                      : "Set your emergency fund and savings targets"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className={textColors.primary}>
                      {isStealthOps ? "[EMERGENCY FUND TARGET]" : "Emergency Fund Target"}
                    </Label>
                    <div className="mt-2">
                      <Slider
                        value={[scenario.emergencyFundTarget]}
                        onValueChange={([value]) => updateScenario({ emergencyFundTarget: value })}
                        max={2000}
                        min={100}
                        step={50}
                        className="w-full"
                      />
                    </div>
                    <div className={`text-sm mt-2 ${textColors.muted}`}>
                      {isStealthOps ? "[TARGET: " : "Target: "}
                      {formatCurrency(scenario.emergencyFundTarget)}
                      {isStealthOps ? " MONTHLY]" : " monthly"}
                    </div>
                  </div>

                  <div>
                    <Label className={textColors.primary}>
                      {isStealthOps ? "[SAVINGS GOAL TARGET]" : "Savings Goal Target"}
                    </Label>
                    <div className="mt-2">
                      <Slider
                        value={[scenario.savingsGoalTarget]}
                        onValueChange={([value]) => updateScenario({ savingsGoalTarget: value })}
                        max={1000}
                        min={50}
                        step={25}
                        className="w-full"
                      />
                    </div>
                    <div className={`text-sm mt-2 ${textColors.muted}`}>
                      {isStealthOps ? "[TARGET: " : "Target: "}
                      {formatCurrency(scenario.savingsGoalTarget)}
                      {isStealthOps ? " MONTHLY]" : " monthly"}
                    </div>
                  </div>

                  {scenarioResults.surplus > 0 && (
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div
                        className={`p-3 border ${
                          isStealthOps ? "tactical-surface border-green-400" : "rounded-lg border-green-200"
                        }`}
                      >
                        <div
                          className={`text-sm ${
                            isStealthOps ? "text-green-300 font-mono tracking-wide" : "text-green-700"
                          }`}
                        >
                          {isStealthOps ? "[EMERGENCY FUND]" : "Emergency Fund"}
                        </div>
                        <div
                          className={`font-semibold ${
                            isStealthOps
                              ? "text-green-400 font-mono tracking-wide"
                              : "text-green-800"
                          }`}
                        >
                          {formatCurrency(scenarioResults.emergencyFundContribution)}
                        </div>
                        <Progress
                          value={(scenarioResults.emergencyFundContribution / scenario.emergencyFundTarget) * 100}
                          className="mt-2 h-2"
                        />
                      </div>

                      <div
                        className={`p-3 border ${
                          isStealthOps ? "tactical-surface border-blue-400" : "rounded-lg border-blue-200"
                        }`}
                      >
                        <div
                          className={`text-sm ${
                            isStealthOps ? "text-blue-300 font-mono tracking-wide" : "text-blue-700"
                          }`}
                        >
                          {isStealthOps ? "[SAVINGS GOAL]" : "Savings Goal"}
                        </div>
                        <div
                          className={`font-semibold ${
                            isStealthOps ? "text-blue-400 font-mono tracking-wide" : "text-blue-800"
                          }`}
                        >
                          {formatCurrency(scenarioResults.savingsContribution)}
                        </div>
                        <Progress
                          value={(scenarioResults.savingsContribution / scenario.savingsGoalTarget) * 100}
                          className="mt-2 h-2"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Results Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Comparison Chart */}
            <Card className={isStealthOps ? "tactical-surface" : ""}>
              <CardHeader>
                <CardTitle className={textColors.primary}>
                  {isStealthOps ? "[SCENARIO COMPARISON]" : "Scenario Comparison"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="income" fill="#3b82f6" name="Income" />
                      <Bar dataKey="spending" fill="#ef4444" name="Spending" />
                      <Bar dataKey="surplus" fill="#10b981" name="Surplus" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Impact Analysis */}
            <Card className={isStealthOps ? "tactical-surface" : ""}>
              <CardHeader>
                <CardTitle className={textColors.primary}>
                  {isStealthOps ? "[IMPACT ANALYSIS]" : "Impact Analysis"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {scenarioResults.impactAnalysis.length > 0 ? (
                  scenarioResults.impactAnalysis.map((impact, index) => {
                    const IconComponent = getImpactIcon(impact.type);
                    const colorClass = getImpactColor(impact.type);

                    return (
                      <div
                        key={index}
                        className={`flex items-start space-x-3 p-3 border ${
                          isStealthOps ? "tactical-surface border-gray-600" : "rounded-lg"
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 mt-0.5 ${colorClass}`} />
                        <div className="flex-1">
                          <div className={`font-medium ${textColors.primary}`}>
                            {isStealthOps ? `[${impact.message.toUpperCase()}]` : impact.message}
                          </div>
                          <Badge
                            variant={
                              impact.severity === "high"
                                ? "destructive"
                                : impact.severity === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className={`mt-1 ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                          >
                            {isStealthOps
                              ? `[${impact.severity.toUpperCase()} SEVERITY]`
                              : `${impact.severity} severity`}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className={`w-8 h-8 mx-auto mb-2 ${textColors.muted} opacity-50`} />
                    <p className={textColors.muted}>
                      {isStealthOps
                        ? "[MAKE CHANGES TO SEE IMPACT ANALYSIS]"
                        : "Make changes to see impact analysis"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card className={isStealthOps ? "tactical-surface" : ""}>
            <CardHeader>
              <CardTitle className={textColors.primary}>
                {isStealthOps ? "[CATEGORY SPENDING CHANGES]" : "Category Spending Changes"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scenarioResults.categoryBreakdown.map((category) => (
                  <div
                    key={category.categoryId}
                    className={`flex items-center justify-between p-3 border ${
                      isStealthOps ? "tactical-surface border-gray-600" : "rounded-lg"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`font-medium ${textColors.primary}`}>{category.name}</div>
                      <Badge
                        variant={category.change >= 0 ? "destructive" : "default"}
                        className={isStealthOps ? "font-mono tracking-wide" : ""}
                      >
                        {category.change >= 0 ? "+" : ""}
                        {formatCurrency(category.change)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${textColors.primary}`}>
                        {formatCurrency(category.newSpending)}
                      </div>
                      <div
                        className={`text-xs ${
                          category.changePercent >= 0
                            ? isStealthOps
                              ? "text-red-400"
                              : "text-red-600"
                            : isStealthOps
                              ? "text-green-400"
                              : "text-green-600"
                        }`}
                      >
                        {category.changePercent >= 0 ? "+" : ""}
                        {category.changePercent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={resetScenario}
            className={isStealthOps ? "tactical-button" : ""}
          >
            {isStealthOps ? "[RESET SCENARIO]" : "Reset Scenario"}
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className={isStealthOps ? "tactical-button" : ""}
            >
              {isStealthOps ? "[CLOSE]" : "Close"}
            </Button>
            <Button
              onClick={() => {
                // Here you would implement saving the scenario or applying changes
                console.log("Apply scenario:", scenario);
                onClose();
              }}
              className={isStealthOps ? "bg-green-600 hover:bg-green-500 font-mono tracking-wide" : ""}
            >
              <Zap className="w-4 h-4 mr-2" />
              {isStealthOps ? "[APPLY SCENARIO]" : "Apply Scenario"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
