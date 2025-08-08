import {
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Calendar,
  Target,
  Briefcase,
  PlayCircle,
  Wifi,
  Heart,
  BookOpen,
  Zap,
  PiggyBank,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import type {
  FullSubscription,
  BudgetCategory,
  WeeklyCalculationResult,
} from "../types/subscription";
import {
  formatCurrency,
  getNextThursday,
  getWeekString,
  calculateWeeklyAmount,
  validateSubscriptionForCalculations,
} from "../utils/helpers";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";

interface CategoryBudgetManagerProps {
  subscriptions: FullSubscription[];
  budgetCategories: BudgetCategory[];
  onUpdateCategories: (categories: BudgetCategory[]) => void;
  isDarkMode: boolean;
  isStealthOps: boolean;
  className?: string;
}

const CATEGORY_ICONS = {
  briefcase: Briefcase,
  "play-circle": PlayCircle,
  wifi: Wifi,
  heart: Heart,
  "book-open": BookOpen,
  "dollar-sign": DollarSign,
  target: Target,
  zap: Zap,
  "piggy-bank": PiggyBank,
};

const CATEGORY_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#ec4899",
  "#6366f1",
];

export const CategoryBudgetManager = ({
  subscriptions,
  budgetCategories,
  onUpdateCategories,
  isDarkMode,
  isStealthOps,
  className = "",
}: CategoryBudgetManagerProps) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: "",
    description: "",
    color: CATEGORY_COLORS[0],
    icon: "briefcase",
    weeklyAllocation: 50,
    priority: 5,
    autoFund: true,
    minimumBuffer: 25,
  });

  // Calculate current week's allocation needs
  const currentWeekCalculation = useMemo((): WeeklyCalculationResult => {
    const thisWeek = getWeekString(new Date());
    const nextThursday = getNextThursday(new Date());

    const categorizedCalculations: { [categoryId: string]: any } = {};
    let totalWeeklyNeed = 0;
    let totalCurrentBalance = 0;

    budgetCategories.forEach((category) => {
      const categorySubscriptions = subscriptions.filter(
        (sub) =>
          sub.status === "active" &&
          (sub.budgetCategory === category.id || sub.category === category.name)
      );

      // Calculate subscriptions due this week
      const subscriptionsDue = categorySubscriptions.filter((sub) => {
        const nextPayment = new Date(sub.nextPayment);
        const weekStart = new Date(nextThursday);
        weekStart.setDate(weekStart.getDate() - 7);
        const weekEnd = new Date(nextThursday);

        return nextPayment >= weekStart && nextPayment < weekEnd;
      });

      const totalDue = subscriptionsDue.reduce((sum, sub) => {
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

      const requiredFunding = Math.max(0, totalDue - category.currentBalance);

      categorizedCalculations[category.id] = {
        subscriptionsDue,
        totalDue,
        currentBalance: category.currentBalance,
        requiredFunding,
        priority: category.priority,
      };

      totalWeeklyNeed += totalDue;
      totalCurrentBalance += category.currentBalance;
    });

    // Generate funding recommendations
    const fundingRecommendations = budgetCategories
      .filter((cat) => categorizedCalculations[cat.id]?.requiredFunding > 0)
      .sort((a, b) => b.priority - a.priority)
      .map((cat) => ({
        categoryId: cat.id,
        amount: categorizedCalculations[cat.id].requiredFunding,
        reason: `${categorizedCalculations[cat.id].subscriptionsDue.length} subscription(s) due this week`,
        priority: cat.priority,
      }));

    return {
      week: thisWeek,
      payDate: nextThursday.toISOString().split("T")[0],
      categories: categorizedCalculations,
      totalWeeklyNeed,
      totalCurrentBalance,
      additionalFundingRequired: Math.max(0, totalWeeklyNeed - totalCurrentBalance),
      fundingRecommendations,
    };
  }, [subscriptions, budgetCategories]);

  // Calculate category spending analytics
  const categoryAnalytics = useMemo(() => {
    return budgetCategories.map((category) => {
      const categorySubscriptions = subscriptions.filter(
        (sub) =>
          sub.status === "active" &&
          (sub.budgetCategory === category.id || sub.category === category.name)
      );

      const monthlyTotal = categorySubscriptions.reduce((sum, sub) => {
        const validatedSub = validateSubscriptionForCalculations(sub);
        const weeklyAmount = calculateWeeklyAmount(
          validatedSub.price,
          validatedSub.frequency,
          validatedSub.variablePricing
        );
        return sum + weeklyAmount * 4.33; // Average weeks per month
      }, 0);

      const weeklyTotal = categorySubscriptions.reduce((sum, sub) => {
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

      const utilizationRate =
        category.weeklyAllocation > 0 ? (weeklyTotal / category.weeklyAllocation) * 100 : 0;

      const balanceHealth =
        category.currentBalance >= (category.minimumBuffer || 0)
          ? "healthy"
          : category.currentBalance > 0
            ? "warning"
            : "critical";

      return {
        category,
        monthlyTotal,
        weeklyTotal,
        subscriptionCount: categorySubscriptions.length,
        utilizationRate,
        balanceHealth,
        projectedWeeks:
          category.currentBalance > 0 && weeklyTotal > 0
            ? Math.floor(category.currentBalance / weeklyTotal)
            : 0,
      };
    });
  }, [subscriptions, budgetCategories]);

  // Handle category creation
  const handleAddCategory = () => {
    const newCategory: BudgetCategory = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      name: newCategoryForm.name,
      description: newCategoryForm.description,
      color: newCategoryForm.color,
      icon: newCategoryForm.icon,
      weeklyAllocation: newCategoryForm.weeklyAllocation,
      currentBalance: 0,
      priority: newCategoryForm.priority,
      autoFund: newCategoryForm.autoFund,
      fundingOrder: budgetCategories.length + 1,
      createdDate: new Date().toISOString().split("T")[0],
      isDefault: false,
      minimumBuffer: newCategoryForm.minimumBuffer,
    };

    onUpdateCategories([...budgetCategories, newCategory]);
    setIsAddingCategory(false);
    setNewCategoryForm({
      name: "",
      description: "",
      color: CATEGORY_COLORS[0],
      icon: "briefcase",
      weeklyAllocation: 50,
      priority: 5,
      autoFund: true,
      minimumBuffer: 25,
    });
  };

  // Handle category editing
  const handleEditCategory = (category: BudgetCategory) => {
    const updatedCategories = budgetCategories.map((cat) =>
      cat.id === category.id ? category : cat
    );
    onUpdateCategories(updatedCategories);
    setEditingCategory(null);
  };

  // Handle category deletion
  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = budgetCategories.filter((cat) => cat.id !== categoryId);
    onUpdateCategories(updatedCategories);
  };

  // Generate allocation data for charts
  const allocationChartData = categoryAnalytics.map(
    ({ category, weeklyTotal, utilizationRate }) => ({
      name: category.name,
      allocated: category.weeklyAllocation,
      spent: weeklyTotal,
      remaining: Math.max(0, category.weeklyAllocation - weeklyTotal),
      utilization: utilizationRate,
      color: category.color,
    })
  );

  const getIconComponent = (iconName: string) => {
    return CATEGORY_ICONS[iconName as keyof typeof CATEGORY_ICONS] || Briefcase;
  };

  const getBalanceColor = (health: string) => {
    switch (health) {
      case "healthy":
        return isStealthOps ? "text-green-400" : "text-green-600";
      case "warning":
        return isStealthOps ? "text-yellow-400" : "text-yellow-600";
      case "critical":
        return isStealthOps ? "text-red-400" : "text-red-600";
      default:
        return isStealthOps ? "text-gray-400" : "text-gray-600";
    }
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

  const textColors = {
    primary: isStealthOps ? "text-white" : isDarkMode ? "text-gray-100" : "text-gray-900",
    secondary: isStealthOps ? "text-gray-300" : isDarkMode ? "text-gray-300" : "text-gray-700",
    muted: isStealthOps ? "text-gray-400" : isDarkMode ? "text-gray-400" : "text-gray-600",
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-semibold ${textColors.primary}`}>
              {isStealthOps ? "[FINANCIAL ROUTING SYSTEM]" : "Financial Routing System"}
            </h2>
            <p className={`${textColors.muted} mt-1`}>
              {isStealthOps
                ? "[MANAGE CATEGORY BUCKETS AND WEEKLY ALLOCATIONS]"
                : "Manage your subscription categories and weekly funding allocations"}
            </p>
          </div>
          <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
            <DialogTrigger asChild>
              <Button
                className={`${isStealthOps ? "tactical-button" : ""} gap-2`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <Plus className="w-4 h-4" />
                {isStealthOps ? "[ADD CATEGORY]" : "Add Category"}
              </Button>
            </DialogTrigger>
            <DialogContent
              className={`max-w-md ${isStealthOps ? "tactical-surface font-mono" : ""}`}
              style={isStealthOps ? { ...glassStyles, borderRadius: "0.125rem" } : glassStyles}
            >
              <DialogHeader>
                <DialogTitle className={textColors.primary}>
                  {isStealthOps ? "[CREATE NEW CATEGORY]" : "Create New Category"}
                </DialogTitle>
                <DialogDescription className={textColors.muted}>
                  {isStealthOps
                    ? "[DEFINE A NEW BUDGET ALLOCATION CATEGORY]"
                    : "Define a new budget category for your subscriptions"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName" className={textColors.primary}>
                    {isStealthOps ? "[CATEGORY NAME]" : "Category Name"}
                  </Label>
                  <Input
                    id="categoryName"
                    value={newCategoryForm.name}
                    onChange={(e) =>
                      setNewCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder={isStealthOps ? "[ENTER CATEGORY NAME]" : "e.g., Personal Finance"}
                    className={isStealthOps ? "tactical-input" : ""}
                    style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                  />
                </div>

                <div>
                  <Label htmlFor="categoryDescription" className={textColors.primary}>
                    {isStealthOps ? "[DESCRIPTION]" : "Description"}
                  </Label>
                  <Textarea
                    id="categoryDescription"
                    value={newCategoryForm.description}
                    onChange={(e) =>
                      setNewCategoryForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder={
                      isStealthOps ? "[CATEGORY DESCRIPTION]" : "Brief description of this category"
                    }
                    className={isStealthOps ? "tactical-input" : ""}
                    style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={textColors.primary}>{isStealthOps ? "[ICON]" : "Icon"}</Label>
                    <Select
                      value={newCategoryForm.icon}
                      onValueChange={(value) =>
                        setNewCategoryForm((prev) => ({ ...prev, icon: value }))
                      }
                    >
                      <SelectTrigger className={isStealthOps ? "tactical-input" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_ICONS).map(([key, IconComponent]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" />
                              {key.replace("-", " ")}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={textColors.primary}>
                      {isStealthOps ? "[COLOR]" : "Color"}
                    </Label>
                    <Select
                      value={newCategoryForm.color}
                      onValueChange={(value) =>
                        setNewCategoryForm((prev) => ({ ...prev, color: value }))
                      }
                    >
                      <SelectTrigger className={isStealthOps ? "tactical-input" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_COLORS.map((color) => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: color }}
                              />
                              {color}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weeklyAllocation" className={textColors.primary}>
                      {isStealthOps ? "[WEEKLY ALLOCATION]" : "Weekly Allocation"}
                    </Label>
                    <Input
                      id="weeklyAllocation"
                      type="number"
                      value={newCategoryForm.weeklyAllocation}
                      onChange={(e) =>
                        setNewCategoryForm((prev) => ({
                          ...prev,
                          weeklyAllocation: Number(e.target.value),
                        }))
                      }
                      className={isStealthOps ? "tactical-input" : ""}
                      style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                    />
                  </div>

                  <div>
                    <Label htmlFor="priority" className={textColors.primary}>
                      {isStealthOps ? "[PRIORITY (1-10)]" : "Priority (1-10)"}
                    </Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      max="10"
                      value={newCategoryForm.priority}
                      onChange={(e) =>
                        setNewCategoryForm((prev) => ({
                          ...prev,
                          priority: Number(e.target.value),
                        }))
                      }
                      className={isStealthOps ? "tactical-input" : ""}
                      style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoFund"
                    checked={newCategoryForm.autoFund}
                    onCheckedChange={(checked) =>
                      setNewCategoryForm((prev) => ({ ...prev, autoFund: checked }))
                    }
                  />
                  <Label htmlFor="autoFund" className={textColors.primary}>
                    {isStealthOps ? "[AUTO-FUND THIS CATEGORY]" : "Auto-fund this category"}
                  </Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleAddCategory}
                    disabled={!newCategoryForm.name.trim()}
                    className={`flex-1 ${isStealthOps ? "tactical-button" : ""}`}
                    style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                  >
                    {isStealthOps ? "[CREATE CATEGORY]" : "Create Category"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingCategory(false)}
                    className={isStealthOps ? "tactical-button" : ""}
                    style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                  >
                    {isStealthOps ? "[CANCEL]" : "Cancel"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Weekly Summary Card */}
        <Card
          className={`${isStealthOps ? "tactical-surface border-2 border-gray-600" : "border-0"}`}
          style={isStealthOps ? { borderRadius: "0.125rem" } : glassStyles}
        >
          <CardHeader>
            <CardTitle className={`${textColors.primary} flex items-center gap-2`}>
              <Calendar className="w-5 h-5" />
              {isStealthOps ? "[WEEKLY ALLOCATION SUMMARY]" : "This Week's Allocation Summary"}
            </CardTitle>
            <CardDescription className={textColors.muted}>
              Pay Date: {new Date(currentWeekCalculation.payDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${textColors.primary}`}>
                  {formatCurrency(currentWeekCalculation.totalWeeklyNeed)}
                </div>
                <p className={`text-sm ${textColors.muted}`}>
                  {isStealthOps ? "[TOTAL NEEDED]" : "Total Needed"}
                </p>
              </div>

              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${getBalanceColor(currentWeekCalculation.totalCurrentBalance >= currentWeekCalculation.totalWeeklyNeed ? "healthy" : "warning")}`}
                >
                  {formatCurrency(currentWeekCalculation.totalCurrentBalance)}
                </div>
                <p className={`text-sm ${textColors.muted}`}>
                  {isStealthOps ? "[CURRENT BALANCE]" : "Current Balance"}
                </p>
              </div>

              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${currentWeekCalculation.additionalFundingRequired > 0 ? "text-red-500" : "text-green-500"}`}
                >
                  {formatCurrency(currentWeekCalculation.additionalFundingRequired)}
                </div>
                <p className={`text-sm ${textColors.muted}`}>
                  {isStealthOps ? "[FUNDING NEEDED]" : "Additional Funding"}
                </p>
              </div>
            </div>

            {currentWeekCalculation.fundingRecommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className={`font-medium ${textColors.primary}`}>
                  {isStealthOps ? "[FUNDING RECOMMENDATIONS]" : "Funding Recommendations"}
                </h4>
                {currentWeekCalculation.fundingRecommendations.map((rec) => {
                  const category = budgetCategories.find((cat) => cat.id === rec.categoryId);
                  return (
                    <div
                      key={rec.categoryId}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        {category && (
                          <>
                            {React.createElement(getIconComponent(category.icon || "briefcase"), {
                              className: "w-4 h-4",
                              style: { color: category.color },
                            })}
                            <span className={textColors.primary}>{category.name}</span>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${textColors.primary}`}>
                          {formatCurrency(rec.amount)}
                        </div>
                        <p className={`text-xs ${textColors.muted}`}>{rec.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className={`grid w-full grid-cols-3 ${isStealthOps ? "tactical-surface" : ""}`}>
          <TabsTrigger value="categories" className={isStealthOps ? "tactical-button" : ""}>
            {isStealthOps ? "[CATEGORIES]" : "Categories"}
          </TabsTrigger>
          <TabsTrigger value="allocations" className={isStealthOps ? "tactical-button" : ""}>
            {isStealthOps ? "[ALLOCATIONS]" : "Allocations"}
          </TabsTrigger>
          <TabsTrigger value="analytics" className={isStealthOps ? "tactical-button" : ""}>
            {isStealthOps ? "[ANALYTICS]" : "Analytics"}
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {categoryAnalytics.map(
              ({
                category,
                weeklyTotal,
                subscriptionCount,
                utilizationRate,
                balanceHealth,
                projectedWeeks,
              }) => {
                const IconComponent = getIconComponent(category.icon || "briefcase");

                return (
                  <Card
                    key={category.id}
                    className={`${isStealthOps ? "tactical-surface border border-gray-600" : "border-0"}`}
                    style={isStealthOps ? { borderRadius: "0.125rem" } : glassStyles}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{
                              backgroundColor: `${category.color}20`,
                              borderRadius: isStealthOps ? "0.125rem" : undefined,
                            }}
                          >
                            <IconComponent className="w-5 h-5" style={{ color: category.color }} />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${textColors.primary}`}>
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className={`text-sm ${textColors.muted} mt-1`}>
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={balanceHealth === "healthy" ? "default" : "destructive"}
                            className={isStealthOps ? "font-mono" : ""}
                          >
                            {isStealthOps ? `[${balanceHealth.toUpperCase()}]` : balanceHealth}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCategory(category)}
                            className={isStealthOps ? "tactical-button" : ""}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          {!category.isDefault && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`${isStealthOps ? "tactical-button text-red-400" : "text-red-600"}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{category.name}"? This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className={`text-sm ${textColors.muted}`}>
                            {isStealthOps ? "[WEEKLY ALLOCATION]" : "Weekly Allocation"}
                          </p>
                          <p className={`font-semibold ${textColors.primary}`}>
                            {formatCurrency(category.weeklyAllocation)}
                          </p>
                        </div>

                        <div>
                          <p className={`text-sm ${textColors.muted}`}>
                            {isStealthOps ? "[CURRENT BALANCE]" : "Current Balance"}
                          </p>
                          <p className={`font-semibold ${getBalanceColor(balanceHealth)}`}>
                            {formatCurrency(category.currentBalance)}
                          </p>
                        </div>

                        <div>
                          <p className={`text-sm ${textColors.muted}`}>
                            {isStealthOps ? "[WEEKLY SPENT]" : "Weekly Spending"}
                          </p>
                          <p className={`font-semibold ${textColors.primary}`}>
                            {formatCurrency(weeklyTotal)}
                          </p>
                        </div>

                        <div>
                          <p className={`text-sm ${textColors.muted}`}>
                            {isStealthOps ? "[SUBSCRIPTIONS]" : "Subscriptions"}
                          </p>
                          <p className={`font-semibold ${textColors.primary}`}>
                            {subscriptionCount}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`text-sm ${textColors.muted}`}>
                            {isStealthOps ? "[UTILIZATION RATE]" : "Utilization Rate"}
                          </span>
                          <span className={`text-sm font-medium ${textColors.primary}`}>
                            {utilizationRate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={Math.min(utilizationRate, 100)}
                          className="h-2"
                          style={{
                            backgroundColor: isStealthOps ? "#1a1a1a" : undefined,
                          }}
                        />
                        {projectedWeeks > 0 && (
                          <p className={`text-xs ${textColors.muted}`}>
                            {isStealthOps
                              ? `[BALANCE LASTS ~${projectedWeeks} WEEKS]`
                              : `Balance will last approximately ${projectedWeeks} weeks`}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              }
            )}
          </div>
        </TabsContent>

        {/* Allocations Tab */}
        <TabsContent value="allocations" className="space-y-4">
          <Card
            className={`${isStealthOps ? "tactical-surface border-2 border-gray-600" : "border-0"}`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : glassStyles}
          >
            <CardHeader>
              <CardTitle className={textColors.primary}>
                {isStealthOps ? "[WEEKLY ALLOCATION BREAKDOWN]" : "Weekly Allocation Breakdown"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={allocationChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Bar dataKey="allocated" fill="#3b82f6" name="Allocated" />
                    <Bar dataKey="spent" fill="#ef4444" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              className={`${isStealthOps ? "tactical-surface border-2 border-gray-600" : "border-0"}`}
              style={isStealthOps ? { borderRadius: "0.125rem" } : glassStyles}
            >
              <CardHeader>
                <CardTitle className={textColors.primary}>
                  {isStealthOps ? "[SPENDING BY CATEGORY]" : "Spending by Category"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationChartData}
                        dataKey="spent"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${formatCurrency(value || 0)}`}
                      >
                        {allocationChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`${isStealthOps ? "tactical-surface border-2 border-gray-600" : "border-0"}`}
              style={isStealthOps ? { borderRadius: "0.125rem" } : glassStyles}
            >
              <CardHeader>
                <CardTitle className={textColors.primary}>
                  {isStealthOps ? "[UTILIZATION RATES]" : "Category Utilization Rates"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryAnalytics.map(({ category, utilizationRate }) => (
                    <div key={category.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={textColors.primary}>{category.name}</span>
                        <span className={`font-medium ${textColors.primary}`}>
                          {utilizationRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(utilizationRate, 100)}
                        className="h-2"
                        style={{
                          backgroundColor: isStealthOps ? "#1a1a1a" : undefined,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Category Dialog */}
      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent
            className={`max-w-md ${isStealthOps ? "tactical-surface font-mono" : ""}`}
            style={isStealthOps ? { ...glassStyles, borderRadius: "0.125rem" } : glassStyles}
          >
            <DialogHeader>
              <DialogTitle className={textColors.primary}>
                {isStealthOps ? "[EDIT CATEGORY]" : "Edit Category"}
              </DialogTitle>
              <DialogDescription className={textColors.muted}>
                {isStealthOps
                  ? "[MODIFY CATEGORY SETTINGS AND ALLOCATION]"
                  : "Modify category settings and allocation amounts"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className={textColors.primary}>
                  {isStealthOps ? "[WEEKLY ALLOCATION]" : "Weekly Allocation"}
                </Label>
                <Input
                  type="number"
                  value={editingCategory.weeklyAllocation}
                  onChange={(e) =>
                    setEditingCategory((prev) =>
                      prev ? { ...prev, weeklyAllocation: Number(e.target.value) } : null
                    )
                  }
                  className={isStealthOps ? "tactical-input" : ""}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                />
              </div>

              <div>
                <Label className={textColors.primary}>
                  {isStealthOps ? "[CURRENT BALANCE]" : "Current Balance"}
                </Label>
                <Input
                  type="number"
                  value={editingCategory.currentBalance}
                  onChange={(e) =>
                    setEditingCategory((prev) =>
                      prev ? { ...prev, currentBalance: Number(e.target.value) } : null
                    )
                  }
                  className={isStealthOps ? "tactical-input" : ""}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                />
              </div>

              <div>
                <Label className={textColors.primary}>
                  {isStealthOps ? "[PRIORITY (1-10)]" : "Priority (1-10)"}
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={editingCategory.priority}
                  onChange={(e) =>
                    setEditingCategory((prev) =>
                      prev ? { ...prev, priority: Number(e.target.value) } : null
                    )
                  }
                  className={isStealthOps ? "tactical-input" : ""}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingCategory.autoFund}
                  onCheckedChange={(checked) =>
                    setEditingCategory((prev) => (prev ? { ...prev, autoFund: checked } : null))
                  }
                />
                <Label className={textColors.primary}>
                  {isStealthOps ? "[AUTO-FUND THIS CATEGORY]" : "Auto-fund this category"}
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => editingCategory && handleEditCategory(editingCategory)}
                  className={`flex-1 ${isStealthOps ? "tactical-button" : ""}`}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  {isStealthOps ? "[SAVE CHANGES]" : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
                  className={isStealthOps ? "tactical-button" : ""}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  {isStealthOps ? "[CANCEL]" : "Cancel"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
