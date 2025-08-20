/**
 * Analytics Dashboard Component
 * Enhanced visualizations and insights for subscription data
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Calendar, BarChart3, PieChart } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useFinancialStore } from '@/stores/useFinancialStore';
import type { FullSubscription } from '@/types/subscription';

interface AnalyticsDashboardProps {
  className?: string;
}

interface SpendingTrend {
  month: string;
  amount: number;
  subscriptions: number;
  growth: number;
}

interface CategoryData {
  name: string;
  value: number;
  count: number;
  color: string;
}

interface InsightCard {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  description: string;
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1',
  '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98'
];

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const { subscriptions } = useFinancialStore();
  const [spendingTrends, setSpendingTrends] = useState<SpendingTrend[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (subscriptions.length > 0) {
      generateAnalytics();
    }
    setIsLoading(false);
  }, [subscriptions]);

  const generateAnalytics = () => {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    
    // Generate spending trends (last 12 months)
    const trends = generateSpendingTrends(activeSubscriptions);
    setSpendingTrends(trends);

    // Generate category data
    const categories = generateCategoryData(activeSubscriptions);
    setCategoryData(categories);

    // Generate insights
    const insightCards = generateInsights(activeSubscriptions, trends);
    setInsights(insightCards);
  };

  const generateSpendingTrends = (subs: FullSubscription[]): SpendingTrend[] => {
    const trends: SpendingTrend[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStr = format(monthDate, 'MMM yyyy');
      
      // Calculate spending for this month
      const monthlySpending = subs.reduce((total, sub) => {
        return total + calculateMonthlyEquivalent(sub.cost, sub.billingCycle || sub.frequency);
      }, 0);

      // Calculate growth compared to previous month
      const previousAmount = i === 11 ? 0 : trends[trends.length - 1]?.amount || 0;
      const growth = previousAmount === 0 ? 0 : ((monthlySpending - previousAmount) / previousAmount) * 100;

      trends.push({
        month: monthStr,
        amount: monthlySpending,
        subscriptions: subs.length,
        growth: growth,
      });
    }

    return trends;
  };

  const generateCategoryData = (subs: FullSubscription[]): CategoryData[] => {
    const categoryMap = new Map<string, { amount: number; count: number }>();

    subs.forEach(sub => {
      const category = sub.category || 'Uncategorized';
      const monthlyAmount = calculateMonthlyEquivalent(sub.cost, sub.billingCycle || sub.frequency);
      
      const existing = categoryMap.get(category) || { amount: 0, count: 0 };
      categoryMap.set(category, {
        amount: existing.amount + monthlyAmount,
        count: existing.count + 1,
      });
    });

    return Array.from(categoryMap.entries())
      .map(([name, data], index) => ({
        name,
        value: data.amount,
        count: data.count,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  };

  const generateInsights = (subs: FullSubscription[], trends: SpendingTrend[]): InsightCard[] => {
    const totalMonthly = subs.reduce((total, sub) => 
      total + calculateMonthlyEquivalent(sub.cost, sub.billingCycle || sub.frequency), 0
    );

    const totalYearly = totalMonthly * 12;
    const avgSubCost = totalMonthly / subs.length || 0;
    
    // Calculate growth from last month
    const currentMonth = trends[trends.length - 1]?.amount || 0;
    const lastMonth = trends[trends.length - 2]?.amount || 0;
    const monthlyGrowth = lastMonth === 0 ? 0 : ((currentMonth - lastMonth) / lastMonth) * 100;

    // Find most expensive subscription
    const mostExpensive = subs.reduce((max, sub) => {
      const subMonthly = calculateMonthlyEquivalent(sub.cost, sub.billingCycle || sub.frequency);
      const maxMonthly = calculateMonthlyEquivalent(max.cost, max.billingCycle || max.frequency);
      return subMonthly > maxMonthly ? sub : max;
    }, subs[0]);

    return [
      {
        title: 'Monthly Spending',
        value: `$${totalMonthly.toFixed(2)}`,
        change: monthlyGrowth,
        icon: <DollarSign className="h-4 w-4" />,
        trend: monthlyGrowth > 0 ? 'up' : monthlyGrowth < 0 ? 'down' : 'neutral',
        description: `$${totalYearly.toFixed(2)} per year`,
      },
      {
        title: 'Active Subscriptions',
        value: subs.length.toString(),
        change: 0, // Would need historical data
        icon: <CreditCard className="h-4 w-4" />,
        trend: 'neutral',
        description: `$${avgSubCost.toFixed(2)} average cost`,
      },
      {
        title: 'Highest Cost',
        value: mostExpensive ? `$${mostExpensive.cost}` : '$0',
        change: 0,
        icon: <TrendingUp className="h-4 w-4" />,
        trend: 'neutral',
        description: mostExpensive?.name || 'No subscriptions',
      },
      {
        title: 'Categories',
        value: categoryData.length.toString(),
        change: 0,
        icon: <PieChart className="h-4 w-4" />,
        trend: 'neutral',
        description: 'Different spending categories',
      },
    ];
  };

  const calculateMonthlyEquivalent = (cost: number, billingCycle: string): number => {
    switch (billingCycle) {
      case 'monthly':
        return cost;
      case 'yearly':
        return cost / 12;
      case 'quarterly':
        return cost / 3;
      case 'weekly':
        return cost * 4.33;
      case 'daily':
        return cost * 30;
      default:
        return cost;
    }
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Data to Analyze</h3>
          <p className="text-muted-foreground text-center">
            Add some subscriptions to see detailed analytics and spending insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Insight Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {insights.map((insight, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium">{insight.title}</h3>
                {insight.icon}
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{insight.value}</div>
                <div className="flex items-center space-x-2">
                  {insight.change !== 0 && (
                    <Badge
                      variant={insight.trend === 'up' ? 'destructive' : insight.trend === 'down' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {insight.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                      {insight.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                      {formatPercent(insight.change)}
                    </Badge>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Spending Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trend</CardTitle>
              <CardDescription>
                Your subscription spending over the last 12 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={spendingTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Spending']} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>
                  Distribution of your monthly subscription costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Monthly Cost']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>
                  Detailed view of spending by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryData.slice(0, 6).map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium">{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.count}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(category.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cost Optimization</CardTitle>
                <CardDescription>
                  Potential savings opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Annual vs Monthly Billing</h4>
                    <p className="text-sm text-muted-foreground">
                      Switching to annual billing could save approximately $50-200 per year
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Unused Subscriptions</h4>
                    <p className="text-sm text-muted-foreground">
                      Review subscriptions you haven't used recently
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending Forecast</CardTitle>
                <CardDescription>
                  Projected costs based on current subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {spendingTrends.length > 0 && (
                    <>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(spendingTrends[spendingTrends.length - 1].amount * 12)}
                        </div>
                        <div className="text-sm text-muted-foreground">Projected Annual Cost</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(spendingTrends[spendingTrends.length - 1].amount * 3)}
                        </div>
                        <div className="text-sm text-muted-foreground">Next Quarter Estimate</div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AnalyticsDashboard;