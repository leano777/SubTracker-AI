import { useState, useMemo } from "react";
import { Calendar, DollarSign, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from "recharts";

import type { FullSubscription as Subscription } from "../types/subscription";

import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { StatCard, MetricDisplay } from "./ui/stat-card";
import { TimeRangeSelector, getDateRangeFilter, type TimeRange } from "./ui/time-range-selector";
import {
  ChartGradients,
  getTooltipConfig,
  getGridConfig,
  getAxisConfig,
  chartThemes,
  type ChartTheme
} from "./ui/chart-theme";

interface DashboardProps {
  subscriptions: Subscription[];
}

export const Dashboard = ({ subscriptions }: DashboardProps) => {
  // State for time range selection and theme detection
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange["value"]>("30d");
  
  // Detect current theme from document classes
  const currentTheme = useMemo<ChartTheme>(() => {
    if (typeof document !== "undefined") {
      if (document.documentElement.classList.contains("stealth-ops")) return "stealthOps";
      if (document.documentElement.classList.contains("dark")) return "dark";
    }
    return "light";
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Enhanced time-based filtering
  const filteredSubscriptions = useMemo(() => {
    const dateRange = getDateRangeFilter(selectedTimeRange);
    return subscriptions.filter((sub) => {
      // Use the existing date property from the subscription
      const subDate = new Date(sub.nextPayment || Date.now());
      return subDate >= dateRange.start && subDate <= dateRange.end;
    });
  }, [subscriptions, selectedTimeRange]);

  // Calculate statistics with time filtering
  const activeSubscriptions = filteredSubscriptions.filter((sub) => sub.isActive);
  const paidSubscriptions = activeSubscriptions.filter((sub) => sub.planType === "paid");
  const freeSubscriptions = activeSubscriptions.filter((sub) => sub.planType === "free");
  const trialSubscriptions = activeSubscriptions.filter((sub) => sub.planType === "trial");

  const totalMonthlySpending = paidSubscriptions.reduce((total, sub) => {
    switch (sub.billingCycle) {
      case "monthly":
        return total + sub.cost;
      case "quarterly":
        return total + sub.cost / 3;
      case "yearly":
        return total + sub.cost / 12;
      default:
        return total;
    }
  }, 0);

  // Calculate potential monthly spending after trials
  const potentialMonthlySpending =
    totalMonthlySpending +
    trialSubscriptions.reduce((total, sub) => {
      switch (sub.billingCycle) {
        case "monthly":
          return total + sub.cost;
        case "quarterly":
          return total + sub.cost / 3;
        case "yearly":
          return total + sub.cost / 12;
        default:
          return total;
      }
    }, 0);

  // Enhanced metrics with trends
  const previousPeriodSpending = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedTimeRange) {
      case "7d":
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case "ytd":
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default:
        return totalMonthlySpending * 0.85; // Mock comparison
    }
    
    return totalMonthlySpending * 0.92; // Mock trend data
  }, [totalMonthlySpending, selectedTimeRange]);

  const spendingTrend = {
    value: Math.round(((totalMonthlySpending - previousPeriodSpending) / previousPeriodSpending) * 100),
    direction: totalMonthlySpending > previousPeriodSpending ? "up" as const : "down" as const,
    label: "vs last period"
  };

  // Upcoming renewals (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingRenewals = paidSubscriptions.filter((sub) => {
    const renewalDate = new Date(sub.nextPayment);
    return renewalDate >= today && renewalDate <= nextWeek;
  });

  // Trial expirations
  const upcomingTrialExpirations = trialSubscriptions.filter((sub) => {
    if (!sub.trialEndDate) return false;
    const expirationDate = new Date(sub.trialEndDate);
    return expirationDate >= today && expirationDate <= nextWeek;
  });

  const expiredTrials = trialSubscriptions.filter((sub) => {
    if (!sub.trialEndDate) return false;
    const expirationDate = new Date(sub.trialEndDate);
    return expirationDate < today;
  });

  // Enhanced category breakdown with theme colors
  const categoryData = paidSubscriptions.reduce(
    (acc, sub) => {
      const monthlyAmount =
        sub.billingCycle === "monthly"
          ? sub.cost
          : sub.billingCycle === "quarterly"
            ? sub.cost / 3
            : sub.cost / 12;

      if (acc[sub.category]) {
        acc[sub.category] += monthlyAmount;
      } else {
        acc[sub.category] = monthlyAmount;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const pieData = Object.entries(categoryData).map(([name, value], index) => ({
    name,
    value,
    percentage: ((value / totalMonthlySpending) * 100).toFixed(1),
    fill: chartThemes[currentTheme].colors.primary[index % chartThemes[currentTheme].colors.primary.length]
  }));

  // Enhanced monthly spending trend with more data points
  const monthlyTrend = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    
    return months.slice(Math.max(0, currentMonth - 5), currentMonth + 1).map((month, index) => ({
      month,
      amount: totalMonthlySpending * (0.85 + Math.random() * 0.3),
      target: totalMonthlySpending,
      fill: `url(#bar-gradient-${index % chartThemes[currentTheme].colors.primary.length})`
    }));
  }, [totalMonthlySpending, currentTheme]);

  // Chart configurations
  const tooltipConfig = getTooltipConfig(currentTheme);
  const gridConfig = getGridConfig(currentTheme);
  const axisConfig = getAxisConfig(currentTheme);

  return (
    <div className="space-y-8 p-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-on-glass stealth-ops:text-white stealth-ops:font-mono stealth-ops:tracking-wide">
            Dashboard Overview
          </h1>
          <p className="text-text-on-glass-muted stealth-ops:text-gray-400 stealth-ops:font-mono">
            Track your subscription spending and upcoming renewals
          </p>
        </div>
        <TimeRangeSelector
          selected={selectedTimeRange}
          onSelect={setSelectedTimeRange}
          className="glass-surface backdrop-blur-sm"
        />
      </div>

      {/* Enhanced Stats Cards with Glassmorphic Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Subscriptions"
          value={activeSubscriptions.length}
          subtitle={`${paidSubscriptions.length} paid • ${trialSubscriptions.length} trial • ${freeSubscriptions.length} free`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="glass"
        >
          <div className="space-y-2 mt-3">
            <MetricDisplay label="Paid" value={paidSubscriptions.length} color="text-primary" />
            <MetricDisplay label="Trial" value={trialSubscriptions.length} color="text-warning-500" />
            <MetricDisplay label="Free" value={freeSubscriptions.length} color="text-success-500" />
          </div>
        </StatCard>

        <StatCard
          title="Monthly Spending"
          value={formatCurrency(totalMonthlySpending)}
          subtitle={`${formatCurrency(totalMonthlySpending * 12)} annually`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={spendingTrend}
          variant="glass"
        />

        <StatCard
          title="Upcoming Renewals"
          value={upcomingRenewals.length}
          subtitle="Next 7 days"
          icon={<Calendar className="w-5 h-5" />}
          trend={{
            value: upcomingRenewals.reduce((sum, sub) => sum + sub.cost, 0),
            label: formatCurrency(upcomingRenewals.reduce((sum, sub) => sum + sub.cost, 0)),
            direction: "neutral"
          }}
          variant="glass"
        />

        <StatCard
          title="Trials & Alerts"
          value={upcomingTrialExpirations.length + expiredTrials.length}
          subtitle={`${upcomingTrialExpirations.length} expiring • ${expiredTrials.length} expired`}
          icon={<Clock className="w-5 h-5" />}
          trend={{
            value: expiredTrials.length,
            label: "need attention",
            direction: expiredTrials.length > 0 ? "down" : "neutral"
          }}
          variant="glass"
        />
      </div>

      {/* Enhanced Charts with New Theme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-card border-glass-border bg-glass-background backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-text-on-glass stealth-ops:text-white stealth-ops:font-mono stealth-ops:tracking-wide">
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <ChartGradients theme={currentTheme} />
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={85}
                  innerRadius={40}
                  dataKey="value"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={1}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip {...tooltipConfig} formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-glass-border bg-glass-background backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-text-on-glass stealth-ops:text-white stealth-ops:font-mono stealth-ops:tracking-wide">
              Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <ChartGradients theme={currentTheme} />
                <CartesianGrid {...gridConfig} />
                <XAxis 
                  dataKey="month" 
                  {...axisConfig} 
                  axisLine={axisConfig.axisLine}
                  tickLine={axisConfig.tickLine}
                  tick={axisConfig.tick}
                />
                <YAxis 
                  {...axisConfig}
                  axisLine={axisConfig.axisLine}
                  tickLine={axisConfig.tickLine}
                  tick={axisConfig.tick}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                />
                <Tooltip {...tooltipConfig} formatter={(value) => formatCurrency(value as number)} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={chartThemes[currentTheme].colors.primary[0]}
                  strokeWidth={chartThemes[currentTheme].strokeWidth}
                  fill={`url(#chart-gradient-0)`}
                  strokeLinecap="round"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Upcoming Renewals with Glassmorphic Design */}
      {upcomingRenewals.length > 0 && (
        <Card className="glass-card border-glass-border bg-glass-background backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-text-on-glass stealth-ops:text-white stealth-ops:font-mono stealth-ops:tracking-wide flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Upcoming Renewals (Next 7 Days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {upcomingRenewals.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 glass-surface backdrop-blur-sm rounded-lg border border-glass-border hover:bg-glass-accent transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 glass-surface rounded-full flex items-center justify-center border border-glass-border">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-on-glass stealth-ops:text-white stealth-ops:font-mono">
                        {subscription.name}
                      </h4>
                      <p className="text-sm text-text-on-glass-muted stealth-ops:text-gray-400 stealth-ops:font-mono">
                        {new Date(subscription.nextPayment).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-text-on-glass stealth-ops:text-white stealth-ops:font-mono">
                      {formatCurrency(subscription.cost)}
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs glass-surface backdrop-blur-sm border-glass-border"
                    >
                      {subscription.billingCycle}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Trial Status with Glassmorphic Design */}
      {(upcomingTrialExpirations.length > 0 || expiredTrials.length > 0) && (
        <Card className="glass-card border-glass-border bg-glass-background backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-text-on-glass stealth-ops:text-white stealth-ops:font-mono stealth-ops:tracking-wide flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Trial Status & Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {/* Expired Trials */}
              {expiredTrials.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 glass-surface backdrop-blur-sm rounded-lg border border-red-200/30 bg-red-50/10 hover:bg-red-50/20 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100/20 rounded-full flex items-center justify-center border border-red-200/30">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-on-glass stealth-ops:text-white stealth-ops:font-mono">
                        {subscription.name}
                      </h4>
                      <p className="text-sm text-red-600 dark:text-red-400 stealth-ops:text-red-400 stealth-ops:font-mono">
                        Trial expired on{" "}
                        {subscription.trialEndDate
                          ? new Date(subscription.trialEndDate).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600 dark:text-red-400 stealth-ops:text-red-400 stealth-ops:font-mono">
                      Action Needed
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      Expired
                    </Badge>
                  </div>
                </div>
              ))}

              {/* Upcoming Trial Expirations */}
              {upcomingTrialExpirations.map((subscription) => {
                const daysLeft = subscription.trialEndDate
                  ? Math.ceil(
                      (new Date(subscription.trialEndDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0;
                return (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between p-4 glass-surface backdrop-blur-sm rounded-lg border border-orange-200/30 bg-orange-50/10 hover:bg-orange-50/20 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-100/20 rounded-full flex items-center justify-center border border-orange-200/30">
                        <Clock className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-on-glass stealth-ops:text-white stealth-ops:font-mono">
                          {subscription.name}
                        </h4>
                        <p className="text-sm text-orange-600 dark:text-orange-400 stealth-ops:text-yellow-400 stealth-ops:font-mono">
                          Trial ends in {daysLeft} day{daysLeft !== 1 ? "s" : ""} (
                          {subscription.trialEndDate
                            ? new Date(subscription.trialEndDate).toLocaleDateString()
                            : "Unknown"}
                          )
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-text-on-glass stealth-ops:text-white stealth-ops:font-mono">
                        {formatCurrency(subscription.cost)}
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs glass-surface backdrop-blur-sm border-orange-200/50 text-orange-800 dark:text-orange-200 stealth-ops:text-yellow-400"
                      >
                        {daysLeft} days left
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
