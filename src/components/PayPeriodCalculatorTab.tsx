import { DollarSign, AlertTriangle, Calculator, Clock, ChevronRight, Info } from "lucide-react";
import { useState, useMemo } from "react";

import type { Subscription } from "../types/subscription";
import { formatCurrency } from "../utils/helpers";
import {
  calculatePayPeriodRequirements,
  getSubscriptionStatistics,
} from "../utils/payPeriodCalculations";

import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ThursdayPayPeriodCalculator } from "./ThursdayPayPeriodCalculator";

interface PayPeriodCalculatorTabProps {
  subscriptions: Subscription[];
}

export const PayPeriodCalculatorTab = ({ subscriptions }: PayPeriodCalculatorTabProps) => {
  const [weeks, setWeeks] = useState(8);
  const [selectedWeek, setSelectedWeek] = useState<any>(null);

  // Detect mobile screen

  // Calculate pay period requirements
  const payPeriodData = useMemo(() => {
    try {
      const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active");
      const requirements = calculatePayPeriodRequirements(activeSubscriptions, weeks);
      const stats = getSubscriptionStatistics(activeSubscriptions);

      return {
        requirements,
        stats,
        error: null,
      };
    } catch (error) {
      console.error("Error calculating pay period data:", error);
      return {
        requirements: [],
        stats: { total: 0, active: 0, cancelled: 0, watchlist: 0 },
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }, [subscriptions, weeks]);

  const { requirements, stats, error } = payPeriodData;

  // Calculate summary statistics
  const totalRequired = requirements.reduce((sum, req) => sum + req.requiredAmount, 0);
  const averageWeekly = requirements.length > 0 ? totalRequired / requirements.length : 0;
  const highestWeek = requirements.reduce((max, req) => Math.max(max, req.requiredAmount), 0);

  // Get current Thursday (pay day reference)
  const getCurrentThursday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilThursday = dayOfWeek <= 4 ? 4 - dayOfWeek : 11 - dayOfWeek;
    const thursday = new Date(today);
    thursday.setDate(today.getDate() + daysUntilThursday);
    return thursday;
  };

  const currentThursday = getCurrentThursday();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Thursday Pay Period Calculator</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Plan your subscription costs based on your Thursday pay schedule
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          >
            <Clock className="w-3 h-3 mr-1" />
            Next Thursday:{" "}
            {currentThursday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </Badge>
        </div>
      </div>

      {/* Current Thursday-to-Wednesday Pay Period */}
      <ThursdayPayPeriodCalculator subscriptions={subscriptions} />

      {/* Week Range Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-medium mb-1">Planning Period</h4>
              <p className="text-sm text-muted-foreground">
                How many weeks ahead would you like to plan?
              </p>
            </div>

            <div className="flex items-center gap-2">
              {[4, 8, 12, 16].map((weekOption) => (
                <Button
                  key={weekOption}
                  variant={weeks === weekOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWeeks(weekOption)}
                  className="min-w-[3rem]"
                >
                  {weekOption}w
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>Error calculating pay periods: {error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatCurrency(totalRequired)}
            </div>
            <div className="text-sm text-muted-foreground">Total {weeks} Weeks</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatCurrency(averageWeekly)}
            </div>
            <div className="text-sm text-muted-foreground">Average Weekly</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {formatCurrency(highestWeek)}
            </div>
            <div className="text-sm text-muted-foreground">Highest Week</div>
          </CardContent>
        </Card>
      </div>

      {/* Pay Period Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Weekly Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requirements.length > 0 ? (
            <div className="space-y-3">
              {requirements.map((period) => {
                const isHighest = period.requiredAmount === highestWeek && highestWeek > 0;
                const urgency =
                  period.requiredAmount > averageWeekly * 1.5
                    ? "high"
                    : period.requiredAmount > averageWeekly * 1.2
                      ? "medium"
                      : "normal";

                return (
                  <div
                    key={period.id}
                    className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                      selectedWeek?.id === period.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    } ${isHighest ? "ring-2 ring-orange-200 dark:ring-orange-800" : ""}`}
                    onClick={() => setSelectedWeek(selectedWeek?.id === period.id ? null : period)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <div className="font-semibold">{period.weekLabel}</div>
                          <div className="text-sm text-muted-foreground">
                            {period.startDate && period.endDate
                              ? `${new Date(period.startDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })} - ${new Date(period.endDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}`
                              : "Date range unavailable"}
                          </div>
                        </div>

                        {isHighest && (
                          <Badge
                            variant="outline"
                            className="bg-orange-100 text-orange-800 border-orange-300"
                          >
                            Highest
                          </Badge>
                        )}

                        {urgency === "high" && (
                          <Badge variant="destructive" className="text-xs">
                            Heavy Week
                          </Badge>
                        )}

                        {urgency === "medium" && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800 text-xs"
                          >
                            Above Average
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {formatCurrency(period.requiredAmount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {period.subscriptions.length} subscription
                            {period.subscriptions.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 text-muted-foreground transition-transform ${
                            selectedWeek?.id === period.id ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedWeek?.id === period.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Subscriptions Due This Week
                        </h5>
                        <div className="space-y-2">
                          {period.subscriptions.map((subscription) => (
                            <div
                              key={subscription.id}
                              className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                                  <DollarSign className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium">{subscription.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {subscription.category}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {formatCurrency(subscription.cost)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {subscription.dueDate &&
                                    new Date(subscription.dueDate).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {period.subscriptions.length === 0 && (
                          <div className="text-center py-4 text-muted-foreground">
                            No subscriptions due this week
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calculator className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h4 className="font-medium mb-2">No Active Subscriptions</h4>
              <p className="text-sm text-muted-foreground">
                Add some active subscriptions to see your pay period breakdown.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planning Tips */}
      {requirements.length > 0 && (
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription className="space-y-2">
            <div className="font-medium">💡 Planning Tips:</div>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Set aside {formatCurrency(averageWeekly)} per week on average</li>
              <li>
                • Plan extra for week of{" "}
                {requirements.find((r) => r.requiredAmount === highestWeek)?.weekLabel ||
                  "highest spending"}{" "}
                ({formatCurrency(highestWeek)})
              </li>
              <li>• Consider moving some subscriptions to spread costs more evenly</li>
              {stats.active > 0 && (
                <li>
                  • You have {stats.active} active subscription{stats.active !== 1 ? "s" : ""} to
                  track
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
