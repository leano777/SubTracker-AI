import { Calendar, DollarSign, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import type { PayPeriodRequirement } from "../types/subscription";
import { formatCurrency } from "../utils/payPeriodCalculations";

interface PayPeriodCalculatorProps {
  payPeriods: PayPeriodRequirement[];
  selectedPeriodId: string;
  onPeriodChange: (periodId: string) => void;
}

export function PayPeriodCalculator({
  payPeriods,
  selectedPeriodId,
  onPeriodChange,
}: PayPeriodCalculatorProps) {
  const selectedPeriod = payPeriods.find((period) => period.id === selectedPeriodId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  const formatDateRange = (startDateString: string, endDateString: string) => {
    return `${formatDate(startDateString)} - ${formatDate(endDateString)}`;
  };

  const getDaysUntilDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPriorityColor = (daysUntil: number) => {
    if (daysUntil <= 3) return "bg-red-500";
    if (daysUntil <= 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPriorityText = (daysUntil: number) => {
    if (daysUntil <= 0) return "Due today";
    if (daysUntil === 1) return "Due tomorrow";
    if (daysUntil <= 3) return "Due soon";
    if (daysUntil <= 7) return "Due this week";
    return "Due later";
  };

  // Calculate summary data
  const totalRequired = payPeriods.reduce((sum, period) => sum + period.requiredAmount, 0);
  const averagePerPeriod = payPeriods.length > 0 ? totalRequired / payPeriods.length : 0;
  const highestPeriod = payPeriods.reduce(
    (highest, period) =>
      period.requiredAmount > (highest?.requiredAmount || 0) ? period : highest,
    null as PayPeriodRequirement | null
  );
  const periodsWithPayments = payPeriods.filter((period) => period.subscriptions.length > 0).length;

  // Get upcoming subscriptions (next 14 days)
  const upcomingPayments = payPeriods
    .flatMap((period) =>
      period.subscriptions.map((sub) => ({
        ...sub,
        daysUntil: getDaysUntilDate(sub.dueDate),
        periodLabel: period.weekLabel,
      }))
    )
    .filter((payment) => payment.daysUntil <= 14 && payment.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pay Period Calculator</h2>
          <p className="text-muted-foreground">
            Calculate exact amounts needed from each Thursday paycheck
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {payPeriods.length} pay periods tracked
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Total Required</div>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(totalRequired)}</div>
            <div className="text-xs text-muted-foreground">
              Next {payPeriods.length} pay periods
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Average per Period</div>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(averagePerPeriod)}</div>
            <div className="text-xs text-muted-foreground">Across all periods</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Highest Period</div>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(highestPeriod?.requiredAmount || 0)}
            </div>
            <div className="text-xs text-muted-foreground">{highestPeriod?.weekLabel || "N/A"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Active Periods</div>
            </div>
            <div className="text-2xl font-bold">{periodsWithPayments}</div>
            <div className="text-xs text-muted-foreground">Have payments due</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pay Period Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Pay Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {payPeriods.map((period) => {
                const isCurrentWeek =
                  getDaysUntilDate(period.startDate) <= 0 && getDaysUntilDate(period.endDate) >= 0;

                return (
                  <Button
                    key={period.id}
                    variant={selectedPeriodId === period.id ? "default" : "outline"}
                    className="w-full justify-between h-auto p-3"
                    onClick={() => onPeriodChange(period.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-left">
                        <div className="font-medium">{period.weekLabel}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateRange(period.startDate, period.endDate)}
                        </div>
                      </div>
                      {isCurrentWeek && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(period.requiredAmount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {period.subscriptions.length} subscription
                        {period.subscriptions.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Period Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedPeriod ? selectedPeriod.weekLabel : "Select a Pay Period"}
            </CardTitle>
            {selectedPeriod && (
              <div className="text-sm text-muted-foreground">
                {formatDateRange(selectedPeriod.startDate, selectedPeriod.endDate)}
                {getDaysUntilDate(selectedPeriod.startDate) <= 0 &&
                  getDaysUntilDate(selectedPeriod.endDate) >= 0 && (
                    <Badge variant="secondary" className="ml-2">
                      Current Week
                    </Badge>
                  )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {selectedPeriod ? (
              <div className="space-y-4">
                {/* Required Amount */}
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground">Amount to Set Aside</div>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(selectedPeriod.requiredAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    From your {formatDate(selectedPeriod.startDate)} paycheck
                  </div>
                </div>

                {selectedPeriod.subscriptions.length > 0 ? (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-3">
                        Subscriptions Due ({selectedPeriod.subscriptions.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedPeriod.subscriptions
                          .sort(
                            (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                          )
                          .map((subscription) => {
                            const daysUntil = getDaysUntilDate(subscription.dueDate);

                            return (
                              <div
                                key={`${subscription.id}-${subscription.dueDate}`}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <div className="font-medium">{subscription.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Due {formatDate(subscription.dueDate)}
                                      {daysUntil <= 7 && (
                                        <span
                                          className={`ml-2 px-2 py-0.5 rounded-full text-xs text-white ${getPriorityColor(daysUntil)}`}
                                        >
                                          {getPriorityText(daysUntil)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">
                                    {formatCurrency(subscription.cost)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {subscription.category}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No subscriptions due in this period</p>
                    <p className="text-sm">You can use this paycheck for other expenses</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Select a pay period to see subscription requirements</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments (Next 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingPayments.slice(0, 6).map((payment, index) => (
                <div
                  key={`${payment.id}-${payment.dueDate}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div>
                      <div className="font-medium text-sm">{payment.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(payment.dueDate)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{formatCurrency(payment.cost)}</div>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-xs text-white ${getPriorityColor(payment.daysUntil)}`}
                    >
                      {payment.daysUntil}d
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {upcomingPayments.length > 6 && (
              <div className="text-center mt-4">
                <Button variant="outline" size="sm">
                  View All {upcomingPayments.length} Upcoming Payments
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
