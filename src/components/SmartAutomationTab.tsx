import { useState, useEffect } from "react";
import {
  Bot,
  Zap,
  Bell,
  TrendingUp,
  AlertTriangle,
  Calendar,
  DollarSign,
  Target,
  Settings,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Subscription, PaymentCard } from "../types/subscription";
import { formatCurrency } from "../utils/helpers";

interface SmartAutomationTabProps {
  subscriptions: Subscription[];
  cards: PaymentCard[];
  onAutomationTrigger: (automation: any) => void;
}

interface AutomationRule {
  id: string;
  name: string;
  type:
    | "price_alert"
    | "renewal_reminder"
    | "usage_optimizer"
    | "budget_guard"
    | "duplicate_detector";
  isActive: boolean;
  trigger: {
    condition: string;
    threshold?: number;
    timeframe?: string;
  };
  action: {
    type: "notify" | "cancel" | "downgrade" | "suggest";
    description: string;
  };
  lastTriggered?: Date;
  triggerCount: number;
  confidence: number;
}

interface AutomationInsight {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  automationType: string;
  suggestedAction: string;
  estimatedSavings?: number;
}

export function SmartAutomationTab({
  subscriptions,
  cards,
  onAutomationTrigger,
}: SmartAutomationTabProps) {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: "price-monitor",
      name: "Price Increase Monitor",
      type: "price_alert",
      isActive: true,
      trigger: {
        condition: "price_increase",
        threshold: 10,
        timeframe: "immediate",
      },
      action: {
        type: "notify",
        description: "Send alert when subscription price increases by more than $10",
      },
      triggerCount: 3,
      confidence: 0.95,
    },
    {
      id: "renewal-guard",
      name: "Smart Renewal Reminder",
      type: "renewal_reminder",
      isActive: true,
      trigger: {
        condition: "approaching_renewal",
        timeframe: "7_days_before",
      },
      action: {
        type: "notify",
        description: "Remind me to review subscription 7 days before renewal",
      },
      triggerCount: 12,
      confidence: 0.88,
    },
    {
      id: "budget-protector",
      name: "Monthly Budget Guardian",
      type: "budget_guard",
      isActive: true,
      trigger: {
        condition: "budget_exceeded",
        threshold: 500,
      },
      action: {
        type: "suggest",
        description: "Suggest cancellations when monthly total exceeds $500",
      },
      triggerCount: 1,
      confidence: 0.72,
    },
    {
      id: "duplicate-finder",
      name: "Duplicate Service Detector",
      type: "duplicate_detector",
      isActive: false,
      trigger: {
        condition: "similar_services",
        timeframe: "weekly_scan",
      },
      action: {
        type: "suggest",
        description: "Identify potentially redundant subscriptions",
      },
      triggerCount: 0,
      confidence: 0.68,
    },
    {
      id: "usage-optimizer",
      name: "Low Usage Optimizer",
      type: "usage_optimizer",
      isActive: false,
      trigger: {
        condition: "low_usage",
        threshold: 20,
        timeframe: "30_days",
      },
      action: {
        type: "suggest",
        description: "Suggest downgrade for services with <20% usage",
      },
      triggerCount: 0,
      confidence: 0.55,
    },
  ]);

  const [automationInsights, setAutomationInsights] = useState<AutomationInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [automationStats, setAutomationStats] = useState({
    totalSavings: 247.5,
    averageConfidence: 0.78,
    activeRules: 3,
    triggersThisMonth: 16,
  });

  // Generate automation insights based on current data
  useEffect(() => {
    const generateInsights = () => {
      const insights: AutomationInsight[] = [];
      const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");

      // Price increase pattern detection
      const recentExpensiveAdds = activeSubscriptions.filter((sub) => {
        const addedDate = new Date(sub.dateAdded || "");
        const monthsAgo = (new Date().getTime() - addedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return monthsAgo < 3 && sub.cost > 30;
      });

      if (recentExpensiveAdds.length > 1) {
        insights.push({
          id: "recent-expensive-trend",
          title: "High-Cost Addition Pattern",
          description: `You've added ${recentExpensiveAdds.length} expensive subscriptions in the last 3 months. Consider setting up budget alerts.`,
          impact: "medium",
          automationType: "Budget Guardian",
          suggestedAction: "Enable budget threshold automation",
          estimatedSavings: 120,
        });
      }

      // Renewal clustering detection
      const renewalsThisMonth = activeSubscriptions.filter((sub) => {
        const renewalDate = new Date(sub.nextPayment);
        const currentMonth = new Date().getMonth();
        return renewalDate.getMonth() === currentMonth;
      });

      if (renewalsThisMonth.length > 4) {
        insights.push({
          id: "renewal-clustering",
          title: "Renewal Date Clustering",
          description: `${renewalsThisMonth.length} subscriptions renew this month. Automation can help spread these out for better cash flow.`,
          impact: "medium",
          automationType: "Smart Scheduler",
          suggestedAction: "Enable renewal date optimization",
        });
      }

      // Category concentration
      const categoryCount = activeSubscriptions.reduce(
        (acc, sub) => {
          acc[sub.category] = (acc[sub.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const maxCategoryCount = Math.max(...Object.values(categoryCount));
      if (maxCategoryCount > 3) {
        const dominantCategory = Object.entries(categoryCount).find(
          ([, count]) => count === maxCategoryCount
        )?.[0];
        insights.push({
          id: "category-concentration",
          title: "Service Category Concentration",
          description: `You have ${maxCategoryCount} ${dominantCategory?.toLowerCase()} subscriptions. Automation can detect overlap and suggest consolidation.`,
          impact: "high",
          automationType: "Duplicate Detector",
          suggestedAction: "Enable duplicate service detection",
          estimatedSavings: 75,
        });
      }

      setAutomationInsights(insights);
    };

    generateInsights();
  }, [subscriptions]);

  const toggleAutomationRule = (ruleId: string) => {
    setAutomationRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule))
    );
  };

  const updateRuleThreshold = (ruleId: string, threshold: number) => {
    setAutomationRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, trigger: { ...rule.trigger, threshold } } : rule
      )
    );
  };

  const testAutomationRule = async (ruleId: string) => {
    setIsAnalyzing(true);
    const rule = automationRules.find((r) => r.id === ruleId);

    // Simulate automation testing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (rule) {
      onAutomationTrigger({
        ruleId,
        ruleName: rule.name,
        testMode: true,
        result: "Test completed successfully",
        confidence: rule.confidence,
      });
    }

    setIsAnalyzing(false);
  };

  const getAutomationIcon = (type: string) => {
    switch (type) {
      case "price_alert":
        return DollarSign;
      case "renewal_reminder":
        return Calendar;
      case "budget_guard":
        return Target;
      case "duplicate_detector":
        return TrendingUp;
      case "usage_optimizer":
        return RotateCcw;
      default:
        return Bot;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-blue-600" />
            <span>Smart Automation Engine</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </h2>
          <p className="text-muted-foreground">
            Intelligent automation to optimize your subscription management and reduce costs
          </p>
        </div>
        {isAnalyzing && (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Running automation test...</span>
          </div>
        )}
      </div>

      {/* Automation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div className="text-sm text-green-700 dark:text-green-300">Total Savings</div>
            </div>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(automationStats.totalSavings)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">this year</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <div className="text-sm text-blue-700 dark:text-blue-300">Avg Confidence</div>
            </div>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {Math.round(automationStats.averageConfidence * 100)}%
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">accuracy rate</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <div className="text-sm text-purple-700 dark:text-purple-300">Active Rules</div>
            </div>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {automationStats.activeRules}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              of {automationRules.length} total
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="w-4 h-4 text-orange-600" />
              <div className="text-sm text-orange-700 dark:text-orange-300">Triggers</div>
            </div>
            <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
              {automationStats.triggersThisMonth}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">this month</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Automation Tabs */}
      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="insights">Smart Insights</TabsTrigger>
          <TabsTrigger value="scheduler">Smart Scheduler</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <div className="space-y-4">
            {automationRules.map((rule) => {
              const Icon = getAutomationIcon(rule.type);

              return (
                <Card
                  key={rule.id}
                  className={`${rule.isActive ? "border-green-200 bg-green-50/30 dark:bg-green-950/30" : "opacity-60"}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg ${rule.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{rule.name}</CardTitle>
                          <CardDescription>{rule.action.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">
                          {Math.round(rule.confidence * 100)}% confidence
                        </Badge>
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={() => toggleAutomationRule(rule.id)}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Configuration */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Configuration</Label>
                        {rule.trigger.threshold && (
                          <div className="flex items-center space-x-2">
                            <Label className="text-xs">Threshold:</Label>
                            <Input
                              type="number"
                              value={rule.trigger.threshold}
                              onChange={(e) =>
                                updateRuleThreshold(rule.id, parseFloat(e.target.value))
                              }
                              className="w-20 h-8 text-xs"
                              disabled={!rule.isActive}
                            />
                            <span className="text-xs text-muted-foreground">
                              {rule.type === "price_alert"
                                ? "$"
                                : rule.type === "usage_optimizer"
                                  ? "%"
                                  : ""}
                            </span>
                          </div>
                        )}
                        {rule.trigger.timeframe && (
                          <div className="text-xs text-muted-foreground">
                            Timeframe: {rule.trigger.timeframe.replace("_", " ")}
                          </div>
                        )}
                      </div>

                      {/* Statistics */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Performance</Label>
                        <div className="text-xs space-y-1">
                          <div>Triggered: {rule.triggerCount} times</div>
                          {rule.lastTriggered && (
                            <div>Last: {rule.lastTriggered.toLocaleDateString()}</div>
                          )}
                          <div className="flex items-center space-x-2">
                            <span>Accuracy:</span>
                            <Progress value={rule.confidence * 100} className="w-16 h-2" />
                            <span>{Math.round(rule.confidence * 100)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Actions</Label>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testAutomationRule(rule.id)}
                            disabled={!rule.isActive || isAnalyzing}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {}}
                            disabled={!rule.isActive}
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="space-y-4">
            {automationInsights.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Bot className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    No automation insights available yet. AI will analyze your patterns and suggest
                    optimizations.
                  </p>
                </CardContent>
              </Card>
            ) : (
              automationInsights.map((insight) => (
                <Card key={insight.id} className={`border-l-4 ${getImpactColor(insight.impact)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                        <CardDescription>{insight.description}</CardDescription>
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
                        >
                          {insight.impact} impact
                        </Badge>
                        {insight.estimatedSavings && (
                          <Badge variant="outline" className="text-green-600">
                            Save {formatCurrency(insight.estimatedSavings)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Suggested Automation:</div>
                        <div className="text-sm text-muted-foreground">
                          {insight.automationType}
                        </div>
                      </div>
                      <Button size="sm">
                        <Zap className="w-3 h-3 mr-1" />
                        {insight.suggestedAction}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="scheduler">
          <div className="space-y-6">
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Smart Scheduler analyzes your cash flow and automatically suggests optimal renewal
                dates to spread costs evenly.
              </AlertDescription>
            </Alert>

            {/* Smart Scheduling Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cash Flow Optimization</CardTitle>
                  <CardDescription>Spread renewals for better financial management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">23%</div>
                      <div className="text-sm text-muted-foreground">
                        Improvement in cash flow smoothness
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current peak month:</span>
                        <span className="font-medium">{formatCurrency(890)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Optimized peak month:</span>
                        <span className="font-medium text-green-600">{formatCurrency(650)}</span>
                      </div>
                    </div>

                    <Button className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Apply Smart Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Renewal Coordination</CardTitle>
                  <CardDescription>Sync renewals with your payday schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Payday Schedule</Label>
                      <Select defaultValue="bi-weekly-thursdays">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bi-weekly-thursdays">Bi-weekly (Thursdays)</SelectItem>
                          <SelectItem value="monthly-first">Monthly (1st)</SelectItem>
                          <SelectItem value="monthly-fifteenth">Monthly (15th)</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Buffer Days</Label>
                      <Select defaultValue="3">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day after payday</SelectItem>
                          <SelectItem value="3">3 days after payday</SelectItem>
                          <SelectItem value="5">5 days after payday</SelectItem>
                          <SelectItem value="7">1 week after payday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="outline" className="w-full">
                      <Target className="w-4 h-4 mr-2" />
                      Auto-align Renewals
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Optimizations */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Optimizations</CardTitle>
                <CardDescription>Scheduled automation actions for the next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-sm">Netflix renewal optimization</div>
                        <div className="text-xs text-muted-foreground">
                          Schedule for August 15th (payday +3)
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium text-sm">Adobe annual billing reminder</div>
                        <div className="text-xs text-muted-foreground">Potential $119 savings</div>
                      </div>
                    </div>
                    <Badge variant="outline">August 20th</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <div>
                        <div className="font-medium text-sm">Duplicate service check</div>
                        <div className="text-xs text-muted-foreground">
                          Scan for overlapping productivity tools
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">August 25th</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
