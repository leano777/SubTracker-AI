import { useState, useEffect, useMemo } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
  DollarSign,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import type { FullSubscription as Subscription, FullPaymentCard as PaymentCard } from "../types/subscription";
import { formatCurrency } from "../utils/helpers";

interface AIInsightsTabProps {
  subscriptions: Subscription[];
  cards: PaymentCard[];
}

interface Insight {
  id: string;
  type: "optimization" | "warning" | "opportunity" | "trend" | "prediction";
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  confidence: number;
  potentialSavings?: number;
  actionItems?: string[];
  category?: string;
}

interface SpendingPattern {
  period: string;
  amount: number;
  trend: "up" | "down" | "stable";
  prediction: number;
}

interface CategoryAnalysis {
  category: string;
  currentSpend: number;
  projectedSpend: number;
  efficiency: number;
  recommendations: string[];
}

export function AIInsightsTab({ subscriptions, cards }: AIInsightsTabProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedInsightType, setSelectedInsightType] = useState<string>("all");

  // Detect theme
  const isStealthOps =
    typeof document !== "undefined" && document.documentElement.classList.contains("stealth-ops");
  const isDarkMode =
    typeof document !== "undefined" && document.documentElement.classList.contains("dark");

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

  // AI Analysis Engine
  const generateInsights = useMemo(() => {
    const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");
    const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
      const monthly =
        sub.billingCycle === "monthly"
          ? sub.cost
          : sub.billingCycle === "quarterly"
            ? sub.cost / 3
            : sub.cost / 12;
      return total + monthly;
    }, 0);

    const insights: Insight[] = [];

    // 1. Spending Optimization Analysis
    const categorySpending = activeSubscriptions.reduce(
      (acc, sub) => {
        const monthly =
          sub.billingCycle === "monthly"
            ? sub.cost
            : sub.billingCycle === "quarterly"
              ? sub.cost / 3
              : sub.cost / 12;
        acc[sub.category] = (acc[sub.category] || 0) + monthly;
        return acc;
      },
      {} as Record<string, number>
    );

    // Identify high-spending categories
    const sortedCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (sortedCategories.length > 0) {
      const [topCategory, topSpending] = sortedCategories[0];
      if (topSpending > monthlyTotal * 0.3) {
        insights.push({
          id: "high-category-spend",
          type: "optimization",
          title: `High ${topCategory} Spending Detected`,
          description: `${topCategory} accounts for ${((topSpending / monthlyTotal) * 100).toFixed(1)}% of your total spending (${formatCurrency(topSpending)}/month). Consider reviewing these subscriptions for optimization opportunities.`,
          impact: "high",
          confidence: 0.85,
          potentialSavings: topSpending * 0.2,
          category: topCategory,
          actionItems: [
            "Review all subscriptions in this category",
            "Look for overlapping services",
            "Consider downgrading premium plans",
            "Negotiate better rates with providers",
          ],
        });
      }
    }

    // 2. Duplicate/Similar Service Detection
    const serviceCategories = activeSubscriptions.reduce(
      (acc, sub) => {
        if (!acc[sub.category]) acc[sub.category] = [];
        acc[sub.category].push(sub);
        return acc;
      },
      {} as Record<string, Subscription[]>
    );

    Object.entries(serviceCategories).forEach(([category, subs]) => {
      if (subs.length > 2) {
        const totalCost = subs.reduce((sum, sub) => {
          const monthly =
            sub.billingCycle === "monthly"
              ? sub.cost
              : sub.billingCycle === "quarterly"
                ? sub.cost / 3
                : sub.cost / 12;
          return sum + monthly;
        }, 0);

        insights.push({
          id: `multiple-${category.toLowerCase()}`,
          type: "optimization",
          title: `Multiple ${category} Services`,
          description: `You have ${subs.length} ${category.toLowerCase()} subscriptions costing ${formatCurrency(totalCost)}/month. Consider consolidating to reduce costs and complexity.`,
          impact: "medium",
          confidence: 0.75,
          potentialSavings: totalCost * 0.3,
          category,
          actionItems: [
            "Compare features across services",
            "Identify core requirements",
            "Cancel redundant subscriptions",
            "Look for bundle deals",
          ],
        });
      }
    });

    // 3. Yearly vs Monthly Billing Optimization
    const monthlyBilled = activeSubscriptions.filter((sub) => sub.billingCycle === "monthly");
    if (monthlyBilled.length > 3) {
      const potentialYearlySavings = monthlyBilled.reduce((total, sub) => {
        // Assume 15% savings on yearly billing
        const annualCost = sub.cost * 12;
        const yearlyDiscount = annualCost * 0.15;
        return total + yearlyDiscount;
      }, 0);

      if (potentialYearlySavings > 100) {
        insights.push({
          id: "yearly-billing-savings",
          type: "opportunity",
          title: "Switch to Annual Billing",
          description: `You could save approximately ${formatCurrency(potentialYearlySavings)} annually by switching ${monthlyBilled.length} subscriptions to yearly billing.`,
          impact: "medium",
          confidence: 0.7,
          potentialSavings: potentialYearlySavings,
          actionItems: [
            "Contact providers about annual discounts",
            "Calculate cash flow impact",
            "Switch stable, long-term services first",
            "Set calendar reminders for renewal dates",
          ],
        });
      }
    }

    // 4. High-Cost Service Analysis
    const expensiveServices = activeSubscriptions
      .map((sub) => ({
        ...sub,
        monthlyEquivalent:
          sub.billingCycle === "monthly"
            ? sub.cost
            : sub.billingCycle === "quarterly"
              ? sub.cost / 3
              : sub.cost / 12,
      }))
      .filter((sub) => sub.monthlyEquivalent > 50)
      .sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent);

    if (expensiveServices.length > 0) {
      const topExpensive = expensiveServices[0];
      insights.push({
        id: "expensive-service-review",
        type: "warning",
        title: "Review High-Cost Subscription",
        description: `${topExpensive.name} costs ${formatCurrency(topExpensive.monthlyEquivalent)}/month. Consider if you're getting full value or if there are cheaper alternatives.`,
        impact: "high",
        confidence: 0.6,
        potentialSavings: topExpensive.monthlyEquivalent * 0.4,
        actionItems: [
          "Audit actual usage vs. cost",
          "Research alternative providers",
          "Negotiate with current provider",
          "Consider feature downgrades",
        ],
      });
    }

    // 5. Growth Trend Prediction
    const currentMonthTotal = monthlyTotal;
    const projectedTotal = currentMonthTotal * 1.1; // Assume 10% growth

    if (projectedTotal > currentMonthTotal) {
      insights.push({
        id: "spending-growth-trend",
        type: "prediction",
        title: "Spending Growth Prediction",
        description: `Based on current patterns, your monthly spending may increase to ${formatCurrency(projectedTotal)} within 6 months. Consider setting spending limits.`,
        impact: "medium",
        confidence: 0.65,
        actionItems: [
          "Set monthly spending budget",
          "Review new subscriptions carefully",
          "Implement approval process for business subs",
          "Regular quarterly reviews",
        ],
      });
    }

    // 6. Card Utilization Analysis
    if (cards.length > 1) {
      const cardUsage = activeSubscriptions.reduce(
        (acc, sub) => {
          if (sub.cardId) {
            acc[sub.cardId] = (acc[sub.cardId] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>
      );

      const underutilizedCards = cards.filter((card) => (cardUsage[card.id] || 0) < 2);
      if (underutilizedCards.length > 0) {
        insights.push({
          id: "card-utilization",
          type: "optimization",
          title: "Optimize Payment Card Usage",
          description: `${underutilizedCards.length} payment cards are underutilized. Consider consolidating to maximize rewards and simplify management.`,
          impact: "low",
          confidence: 0.5,
          actionItems: [
            "Review card rewards programs",
            "Consolidate to high-reward cards",
            "Close unused cards if beneficial",
            "Set up automatic payments",
          ],
        });
      }
    }

    // 7. Business vs Personal Balance
    const businessSubs = activeSubscriptions.filter((sub) => sub.subscriptionType === "business");
    const personalSubs = activeSubscriptions.filter((sub) => sub.subscriptionType === "personal");

    if (businessSubs.length > personalSubs.length * 2) {
      insights.push({
        id: "business-personal-balance",
        type: "trend",
        title: "High Business Subscription Ratio",
        description: `${businessSubs.length} business vs ${personalSubs.length} personal subscriptions. Consider if all business tools are necessary or if some personal tools could support work.`,
        impact: "medium",
        confidence: 0.55,
        actionItems: [
          "Audit business tool necessity",
          "Look for multi-purpose solutions",
          "Consider team vs individual plans",
          "Review tax implications",
        ],
      });
    }

    return insights;
  }, [subscriptions, cards]);

  // Spending Pattern Analysis
  const spendingPatterns = useMemo(() => {
    const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");
    const patterns: SpendingPattern[] = [];

    // Generate 6 months of data (simulated historical + predictions)
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      // Simulate some variation in spending
      const baseAmount = activeSubscriptions.reduce((total, sub) => {
        const monthly =
          sub.billingCycle === "monthly"
            ? sub.cost
            : sub.billingCycle === "quarterly"
              ? sub.cost / 3
              : sub.cost / 12;
        return total + monthly;
      }, 0);

      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      const amount = baseAmount * (1 + variation);

      patterns.push({
        period: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        amount,
        trend: i === 0 ? "stable" : amount > baseAmount ? "up" : "down",
        prediction: baseAmount * (1 + Math.random() * 0.1), // Slight growth prediction
      });
    }

    return patterns;
  }, [subscriptions]);

  // Category Analysis
  const categoryAnalysis = useMemo(() => {
    const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");
    const categoryData: Record<string, CategoryAnalysis> = {};

    activeSubscriptions.forEach((sub) => {
      const monthly =
        sub.billingCycle === "monthly"
          ? sub.cost
          : sub.billingCycle === "quarterly"
            ? sub.cost / 3
            : sub.cost / 12;

      if (!categoryData[sub.category]) {
        categoryData[sub.category] = {
          category: sub.category,
          currentSpend: 0,
          projectedSpend: 0,
          efficiency: Math.random() * 40 + 60, // 60-100% efficiency
          recommendations: [],
        };
      }

      categoryData[sub.category].currentSpend += monthly;
      categoryData[sub.category].projectedSpend += monthly * 1.05; // 5% growth
    });

    // Add recommendations based on efficiency
    Object.values(categoryData).forEach((cat) => {
      if (cat.efficiency < 70) {
        cat.recommendations.push("High optimization potential");
        cat.recommendations.push("Consider service consolidation");
      } else if (cat.efficiency < 85) {
        cat.recommendations.push("Moderate optimization potential");
        cat.recommendations.push("Review feature utilization");
      } else {
        cat.recommendations.push("Well optimized category");
        cat.recommendations.push("Monitor for new alternatives");
      }
    });

    return Object.values(categoryData).sort((a, b) => b.currentSpend - a.currentSpend);
  }, [subscriptions]);

  // Simulate AI analysis
  useEffect(() => {
    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      setInsights(generateInsights);
      setIsAnalyzing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [generateInsights]);

  const filteredInsights =
    selectedInsightType === "all"
      ? insights
      : insights.filter((insight) => insight.type === selectedInsightType);

  const totalPotentialSavings = insights.reduce(
    (total, insight) => total + (insight.potentialSavings || 0),
    0
  );

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "optimization":
        return TrendingDown;
      case "warning":
        return AlertTriangle;
      case "opportunity":
        return TrendingUp;
      case "trend":
        return BarChart3;
      case "prediction":
        return Target;
      default:
        return Lightbulb;
    }
  };

  const getInsightColor = (type: string) => {
    if (isStealthOps) {
      switch (type) {
        case "optimization":
          return "text-blue-400 tactical-surface border border-blue-400";
        case "warning":
          return "text-orange-400 tactical-surface border border-orange-400";
        case "opportunity":
          return "text-green-400 tactical-surface border border-green-400";
        case "trend":
          return "text-purple-400 tactical-surface border border-purple-400";
        case "prediction":
          return "text-indigo-400 tactical-surface border border-indigo-400";
        default:
          return "text-gray-400 tactical-surface border border-gray-600";
      }
    }
    switch (type) {
      case "optimization":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950";
      case "warning":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950";
      case "opportunity":
        return "text-green-600 bg-green-50 dark:bg-green-950";
      case "trend":
        return "text-purple-600 bg-purple-50 dark:bg-purple-950";
      case "prediction":
        return "text-indigo-600 bg-indigo-50 dark:bg-indigo-950";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950";
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Stealth Ops Support */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={`flex items-center space-x-2 ${textColors.primary} ${
              isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
            }`}
          >
            <Brain className={`w-6 h-6 ${isStealthOps ? "text-green-400" : "text-purple-600"}`} />
            <span>{isStealthOps ? "[AI FINANCIAL INSIGHTS]" : "AI Financial Insights"}</span>
            <Badge
              variant="secondary"
              className={`${
                isStealthOps
                  ? "tactical-surface border border-green-400 text-green-400 font-mono tracking-wide tactical-glow"
                  : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
              }`}
              style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {isStealthOps ? "[SMART ANALYSIS]" : "Smart Analysis"}
            </Badge>
          </h2>
          <p className={`${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}>
            {isStealthOps
              ? "[AI-POWERED ANALYSIS OF YOUR SUBSCRIPTION SPENDING PATTERNS AND OPTIMIZATION OPPORTUNITIES]"
              : "AI-powered analysis of your subscription spending patterns and optimization opportunities"}
          </p>
        </div>
        {isAnalyzing && (
          <div
            className={`flex items-center space-x-2 ${
              isStealthOps ? "text-green-400" : "text-purple-600"
            }`}
          >
            <div
              className={`animate-spin h-4 w-4 border-b-2 ${
                isStealthOps ? "border-green-400 tactical-glow" : "rounded-full border-purple-600"
              }`}
              style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
            ></div>
            <span className={`text-sm ${isStealthOps ? "font-mono tracking-wide" : ""}`}>
              {isStealthOps ? "[ANALYZING PATTERNS...]" : "Analyzing patterns..."}
            </span>
          </div>
        )}
      </div>

      {/* Enhanced AI Summary Cards with Stealth Ops Support */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`${
            isStealthOps
              ? "tactical-surface border-2 border-purple-400 tactical-glow"
              : "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className={`w-4 h-4 ${isStealthOps ? "text-purple-400" : "text-purple-600"}`} />
              <div
                className={`text-sm ${
                  isStealthOps
                    ? "text-purple-300 font-mono tracking-wide"
                    : "text-purple-700 dark:text-purple-300"
                }`}
              >
                {isStealthOps ? "[AI INSIGHTS]" : "AI Insights"}
              </div>
            </div>
            <div
              className={`text-2xl font-bold ${
                isStealthOps
                  ? "text-purple-400 font-mono tracking-wide tactical-text-glow"
                  : "text-purple-800 dark:text-purple-200"
              }`}
            >
              {insights.length}
            </div>
            <div
              className={`text-xs ${
                isStealthOps
                  ? "text-purple-400 font-mono tracking-wide"
                  : "text-purple-600 dark:text-purple-400"
              }`}
            >
              {isStealthOps
                ? `[${insights.filter((i) => i.impact === "high").length} HIGH IMPACT]`
                : `${insights.filter((i) => i.impact === "high").length} high impact`}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${
            isStealthOps
              ? "tactical-surface border-2 border-green-400 tactical-glow"
              : "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign
                className={`w-4 h-4 ${isStealthOps ? "text-green-400" : "text-green-600"}`}
              />
              <div
                className={`text-sm ${
                  isStealthOps
                    ? "text-green-300 font-mono tracking-wide"
                    : "text-green-700 dark:text-green-300"
                }`}
              >
                {isStealthOps ? "[POTENTIAL SAVINGS]" : "Potential Savings"}
              </div>
            </div>
            <div
              className={`text-2xl font-bold ${
                isStealthOps
                  ? "text-green-400 font-mono tracking-wide tactical-text-glow"
                  : "text-green-800 dark:text-green-200"
              }`}
            >
              {formatCurrency(totalPotentialSavings)}
            </div>
            <div
              className={`text-xs ${
                isStealthOps
                  ? "text-green-400 font-mono tracking-wide"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {isStealthOps ? "[PER MONTH]" : "per month"}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${
            isStealthOps
              ? "tactical-surface border-2 border-blue-400 tactical-glow"
              : "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className={`w-4 h-4 ${isStealthOps ? "text-blue-400" : "text-blue-600"}`} />
              <div
                className={`text-sm ${
                  isStealthOps
                    ? "text-blue-300 font-mono tracking-wide"
                    : "text-blue-700 dark:text-blue-300"
                }`}
              >
                {isStealthOps ? "[OPTIMIZATION SCORE]" : "Optimization Score"}
              </div>
            </div>
            <div
              className={`text-2xl font-bold ${
                isStealthOps
                  ? "text-blue-400 font-mono tracking-wide tactical-text-glow"
                  : "text-blue-800 dark:text-blue-200"
              }`}
            >
              {Math.round(85 - insights.length * 2)}%
            </div>
            <div
              className={`text-xs ${
                isStealthOps
                  ? "text-blue-400 font-mono tracking-wide"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {isStealthOps ? "[EFFICIENCY RATING]" : "efficiency rating"}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${
            isStealthOps
              ? "tactical-surface border-2 border-orange-400 tactical-glow"
              : "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle
                className={`w-4 h-4 ${isStealthOps ? "text-orange-400" : "text-orange-600"}`}
              />
              <div
                className={`text-sm ${
                  isStealthOps
                    ? "text-orange-300 font-mono tracking-wide"
                    : "text-orange-700 dark:text-orange-300"
                }`}
              >
                {isStealthOps ? "[ACTION ITEMS]" : "Action Items"}
              </div>
            </div>
            <div
              className={`text-2xl font-bold ${
                isStealthOps
                  ? "text-orange-400 font-mono tracking-wide tactical-text-glow"
                  : "text-orange-800 dark:text-orange-200"
              }`}
            >
              {insights.reduce((total, insight) => total + (insight.actionItems?.length || 0), 0)}
            </div>
            <div
              className={`text-xs ${
                isStealthOps
                  ? "text-orange-400 font-mono tracking-wide"
                  : "text-orange-600 dark:text-orange-400"
              }`}
            >
              {isStealthOps ? "[RECOMMENDATIONS]" : "recommendations"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Main Analysis Tabs with Stealth Ops Support */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className={`grid w-full grid-cols-4 ${isStealthOps ? "tactical-surface" : ""}`}>
          <TabsTrigger
            value="insights"
            className={`${isStealthOps ? "font-mono tracking-wide" : ""}`}
          >
            {isStealthOps ? "[SMART INSIGHTS]" : "Smart Insights"}
          </TabsTrigger>
          <TabsTrigger
            value="patterns"
            className={`${isStealthOps ? "font-mono tracking-wide" : ""}`}
          >
            {isStealthOps ? "[SPENDING PATTERNS]" : "Spending Patterns"}
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className={`${isStealthOps ? "font-mono tracking-wide" : ""}`}
          >
            {isStealthOps ? "[CATEGORY ANALYSIS]" : "Category Analysis"}
          </TabsTrigger>
          <TabsTrigger
            value="predictions"
            className={`${isStealthOps ? "font-mono tracking-wide" : ""}`}
          >
            {isStealthOps ? "[PREDICTIONS]" : "Predictions"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <div className="space-y-4">
            {/* Enhanced Insight Filters with Stealth Ops Support */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedInsightType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedInsightType("all")}
                className={`${
                  isStealthOps
                    ? "tactical-button font-mono tracking-wide border-gray-600 hover:border-green-400"
                    : ""
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                {isStealthOps ? `[ALL (${insights.length})]` : `All (${insights.length})`}
              </Button>
              {["optimization", "warning", "opportunity", "trend", "prediction"].map((type) => {
                const count = insights.filter((i) => i.type === type).length;
                return count > 0 ? (
                  <Button
                    key={type}
                    variant={selectedInsightType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedInsightType(type)}
                    className={`capitalize ${
                      isStealthOps
                        ? "tactical-button font-mono tracking-wide border-gray-600 hover:border-green-400"
                        : ""
                    }`}
                    style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                  >
                    {isStealthOps ? `[${type.toUpperCase()} (${count})]` : `${type} (${count})`}
                  </Button>
                ) : null;
              })}
            </div>

            {/* Enhanced Insights List with Stealth Ops Support */}
            <div className="space-y-4">
              {filteredInsights.map((insight) => {
                const Icon = getInsightIcon(insight.type);
                const colorClass = getInsightColor(insight.type);

                return (
                  <Card
                    key={insight.id}
                    className={`${isStealthOps ? "tactical-surface border-l-4" : "border-l-4"}`}
                    style={{
                      borderLeftColor:
                        insight.impact === "high"
                          ? isStealthOps
                            ? "#ff0000"
                            : "#ef4444"
                          : insight.impact === "medium"
                            ? isStealthOps
                              ? "#ffff00"
                              : "#f59e0b"
                            : isStealthOps
                              ? "#00ff00"
                              : "#10b981",
                      borderRadius: isStealthOps ? "0.125rem" : undefined,
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`p-2 ${isStealthOps ? "" : "rounded-lg"} ${colorClass}`}
                            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <CardTitle
                              className={`text-base ${textColors.primary} ${
                                isStealthOps ? "font-mono tracking-wide" : ""
                              }`}
                            >
                              {isStealthOps ? `[${insight.title.toUpperCase()}]` : insight.title}
                            </CardTitle>
                            <CardDescription
                              className={`mt-1 ${textColors.muted} ${
                                isStealthOps ? "font-mono tracking-wide" : ""
                              }`}
                            >
                              {isStealthOps
                                ? `[${insight.description.toUpperCase()}]`
                                : insight.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              insight.impact === "high"
                                ? "destructive"
                                : insight.impact === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className={`${
                              isStealthOps ? "font-mono tracking-wide tactical-surface border" : ""
                            }`}
                            style={
                              isStealthOps
                                ? {
                                    borderRadius: "0.125rem",
                                    borderColor:
                                      insight.impact === "high"
                                        ? "#ff0000"
                                        : insight.impact === "medium"
                                          ? "#ffff00"
                                          : "#00ff00",
                                    color:
                                      insight.impact === "high"
                                        ? "#ff0000"
                                        : insight.impact === "medium"
                                          ? "#ffff00"
                                          : "#00ff00",
                                  }
                                : undefined
                            }
                          >
                            {isStealthOps
                              ? `[${insight.impact.toUpperCase()} IMPACT]`
                              : `${insight.impact} impact`}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`${
                              isStealthOps
                                ? "font-mono tracking-wide tactical-surface border border-gray-600"
                                : ""
                            }`}
                            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                          >
                            {isStealthOps
                              ? `[${Math.round(insight.confidence * 100)}% CONFIDENCE]`
                              : `${Math.round(insight.confidence * 100)}% confidence`}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {insight.potentialSavings && (
                        <div
                          className={`mb-3 p-3 ${
                            isStealthOps
                              ? "tactical-surface border border-green-400"
                              : "bg-green-50 dark:bg-green-950 rounded-lg"
                          }`}
                          style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm ${
                                isStealthOps
                                  ? "text-green-300 font-mono tracking-wide"
                                  : "text-green-700 dark:text-green-300"
                              }`}
                            >
                              {isStealthOps
                                ? "[POTENTIAL MONTHLY SAVINGS]"
                                : "Potential Monthly Savings"}
                            </span>
                            <span
                              className={`font-semibold ${
                                isStealthOps
                                  ? "text-green-400 font-mono tracking-wide tactical-text-glow"
                                  : "text-green-800 dark:text-green-200"
                              }`}
                            >
                              {formatCurrency(insight.potentialSavings)}
                            </span>
                          </div>
                        </div>
                      )}

                      {insight.actionItems && insight.actionItems.length > 0 && (
                        <div>
                          <h4
                            className={`font-medium mb-2 ${textColors.primary} ${
                              isStealthOps ? "font-mono tracking-wide text-green-400" : ""
                            }`}
                          >
                            {isStealthOps ? "[RECOMMENDED ACTIONS:]" : "Recommended Actions:"}
                          </h4>
                          <ul className="space-y-1">
                            {insight.actionItems.map((action, index) => (
                              <li
                                key={index}
                                className={`flex items-center space-x-2 text-sm ${
                                  isStealthOps ? "font-mono tracking-wide" : ""
                                }`}
                              >
                                <div
                                  className={`w-1.5 h-1.5 bg-primary ${
                                    isStealthOps ? "bg-green-400" : "rounded-full"
                                  }`}
                                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                                ></div>
                                <span className={textColors.secondary}>
                                  {isStealthOps ? `[${action.toUpperCase()}]` : action}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredInsights.length === 0 && (
              <Card className={isStealthOps ? "tactical-surface" : ""}>
                <CardContent className="text-center py-8">
                  <Lightbulb className={`w-8 h-8 mx-auto mb-2 ${textColors.muted} opacity-50`} />
                  <p
                    className={`${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                  >
                    {isAnalyzing
                      ? isStealthOps
                        ? "[ANALYZING YOUR DATA...]"
                        : "Analyzing your data..."
                      : isStealthOps
                        ? "[NO INSIGHTS OF THIS TYPE FOUND.]"
                        : "No insights of this type found."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="patterns">
          <div className="space-y-6">
            <Card className={isStealthOps ? "tactical-surface" : ""}>
              <CardHeader>
                <CardTitle
                  className={`${textColors.primary} ${
                    isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                  }`}
                >
                  {isStealthOps ? "[SPENDING TREND ANALYSIS]" : "Spending Trend Analysis"}
                </CardTitle>
                <CardDescription
                  className={`${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps
                    ? "[YOUR SUBSCRIPTION SPENDING PATTERNS OVER THE LAST 6 MONTHS]"
                    : "Your subscription spending patterns over the last 6 months"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {spendingPatterns.map((pattern, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 border ${
                        isStealthOps ? "tactical-surface border-gray-600" : "rounded-lg"
                      }`}
                      style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`text-sm font-medium ${textColors.primary} ${
                            isStealthOps ? "font-mono tracking-wide" : ""
                          }`}
                        >
                          {isStealthOps ? `[${pattern.period.toUpperCase()}]` : pattern.period}
                        </div>
                        <Badge
                          variant={
                            pattern.trend === "up"
                              ? "destructive"
                              : pattern.trend === "down"
                                ? "default"
                                : "secondary"
                          }
                          className={`${
                            isStealthOps ? "font-mono tracking-wide tactical-surface border" : ""
                          }`}
                          style={
                            isStealthOps
                              ? {
                                  borderRadius: "0.125rem",
                                  borderColor:
                                    pattern.trend === "up"
                                      ? "#ff0000"
                                      : pattern.trend === "down"
                                        ? "#00ff00"
                                        : "#666666",
                                  color:
                                    pattern.trend === "up"
                                      ? "#ff0000"
                                      : pattern.trend === "down"
                                        ? "#00ff00"
                                        : "#cccccc",
                                }
                              : undefined
                          }
                        >
                          {pattern.trend === "up" ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : pattern.trend === "down" ? (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          ) : (
                            <div className="w-3 h-1 bg-current mr-1"></div>
                          )}
                          {isStealthOps ? `[${pattern.trend.toUpperCase()}]` : pattern.trend}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-semibold ${textColors.primary} ${
                            isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                          }`}
                        >
                          {formatCurrency(pattern.amount)}
                        </div>
                        <div
                          className={`text-xs ${textColors.muted} ${
                            isStealthOps ? "font-mono tracking-wide" : ""
                          }`}
                        >
                          {isStealthOps ? "[PREDICTED: " : "Predicted: "}
                          {formatCurrency(pattern.prediction)}
                          {isStealthOps ? "]" : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="space-y-4">
            {categoryAnalysis.map((category) => (
              <Card key={category.category} className={isStealthOps ? "tactical-surface" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle
                      className={`text-base ${textColors.primary} ${
                        isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                      }`}
                    >
                      {isStealthOps ? `[${category.category.toUpperCase()}]` : category.category}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={`${
                          isStealthOps
                            ? "font-mono tracking-wide tactical-surface border border-gray-600"
                            : ""
                        }`}
                        style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                      >
                        {isStealthOps
                          ? `[${Math.round(category.efficiency)}% EFFICIENT]`
                          : `${Math.round(category.efficiency)}% efficient`}
                      </Badge>
                      <div
                        className={`text-sm ${textColors.muted} ${
                          isStealthOps ? "font-mono tracking-wide" : ""
                        }`}
                      >
                        {formatCurrency(category.currentSpend)}
                        {isStealthOps ? "[/MONTH]" : "/month"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div
                        className={`flex justify-between text-sm mb-1 ${
                          isStealthOps ? "font-mono tracking-wide" : ""
                        }`}
                      >
                        <span className={textColors.secondary}>
                          {isStealthOps ? "[EFFICIENCY SCORE]" : "Efficiency Score"}
                        </span>
                        <span className={textColors.primary}>
                          {Math.round(category.efficiency)}%
                        </span>
                      </div>
                      <Progress
                        value={category.efficiency}
                        className={`h-2 ${isStealthOps ? "tactical-surface" : ""}`}
                      />
                    </div>

                    <div
                      className={`grid grid-cols-2 gap-4 text-sm ${
                        isStealthOps ? "font-mono tracking-wide" : ""
                      }`}
                    >
                      <div>
                        <div className={textColors.muted}>
                          {isStealthOps ? "[CURRENT SPEND]" : "Current Spend"}
                        </div>
                        <div
                          className={`font-semibold ${textColors.primary} ${
                            isStealthOps ? "tactical-text-glow" : ""
                          }`}
                        >
                          {formatCurrency(category.currentSpend)}
                        </div>
                      </div>
                      <div>
                        <div className={textColors.muted}>
                          {isStealthOps ? "[PROJECTED (6MO)]" : "Projected (6mo)"}
                        </div>
                        <div
                          className={`font-semibold ${textColors.primary} ${
                            isStealthOps ? "tactical-text-glow" : ""
                          }`}
                        >
                          {formatCurrency(category.projectedSpend)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4
                        className={`font-medium mb-2 ${textColors.primary} ${
                          isStealthOps ? "font-mono tracking-wide text-green-400" : ""
                        }`}
                      >
                        {isStealthOps ? "[AI RECOMMENDATIONS:]" : "AI Recommendations:"}
                      </h4>
                      <ul className="space-y-1">
                        {category.recommendations.map((rec, index) => (
                          <li
                            key={index}
                            className={`flex items-center space-x-2 text-sm ${
                              isStealthOps ? "font-mono tracking-wide" : ""
                            }`}
                          >
                            <div
                              className={`w-1 h-1 bg-primary ${
                                isStealthOps ? "bg-green-400" : "rounded-full"
                              }`}
                              style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                            ></div>
                            <span className={textColors.secondary}>
                              {isStealthOps ? `[${rec.toUpperCase()}]` : rec}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions">
          <div className="space-y-6">
            <Card className={isStealthOps ? "tactical-surface" : ""}>
              <CardHeader>
                <CardTitle
                  className={`${textColors.primary} ${
                    isStealthOps ? "font-mono tracking-wide tactical-text-glow" : ""
                  }`}
                >
                  {isStealthOps ? "[AI SPENDING PREDICTIONS]" : "AI Spending Predictions"}
                </CardTitle>
                <CardDescription
                  className={`${textColors.muted} ${isStealthOps ? "font-mono tracking-wide" : ""}`}
                >
                  {isStealthOps
                    ? "[MACHINE LEARNING FORECASTS BASED ON YOUR SUBSCRIPTION PATTERNS]"
                    : "Machine learning forecasts based on your subscription patterns"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className={isStealthOps ? "tactical-surface border border-green-400" : ""}>
                  <Brain className={`h-4 w-4 ${isStealthOps ? "text-green-400" : ""}`} />
                  <AlertDescription
                    className={`${isStealthOps ? "font-mono tracking-wide text-green-300" : ""}`}
                  >
                    {isStealthOps
                      ? "[AI PREDICTION MODELS ARE CONTINUOUSLY LEARNING FROM YOUR SPENDING PATTERNS TO PROVIDE MORE ACCURATE FORECASTS OVER TIME.]"
                      : "AI prediction models are continuously learning from your spending patterns to provide more accurate forecasts over time."}
                  </AlertDescription>
                </Alert>

                <div className="mt-6 space-y-4">
                  {insights
                    .filter((insight) => insight.type === "prediction")
                    .map((prediction) => (
                      <div
                        key={prediction.id}
                        className={`p-4 border-l-4 ${
                          isStealthOps
                            ? "tactical-surface border-indigo-400"
                            : "bg-indigo-50 dark:bg-indigo-950 rounded-lg border-indigo-500"
                        }`}
                        style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                      >
                        <h4
                          className={`font-semibold mb-2 ${textColors.primary} ${
                            isStealthOps ? "font-mono tracking-wide text-indigo-400" : ""
                          }`}
                        >
                          {isStealthOps ? `[${prediction.title.toUpperCase()}]` : prediction.title}
                        </h4>
                        <p
                          className={`text-sm mb-3 ${textColors.secondary} ${
                            isStealthOps ? "font-mono tracking-wide" : ""
                          }`}
                        >
                          {isStealthOps
                            ? `[${prediction.description.toUpperCase()}]`
                            : prediction.description}
                        </p>
                        <div
                          className={`text-xs ${textColors.muted} ${
                            isStealthOps ? "font-mono tracking-wide" : ""
                          }`}
                        >
                          {isStealthOps
                            ? `[CONFIDENCE: ${Math.round(prediction.confidence * 100)}%]`
                            : `Confidence: ${Math.round(prediction.confidence * 100)}%`}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
