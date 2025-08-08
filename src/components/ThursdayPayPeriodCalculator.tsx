import { Calendar, DollarSign, Clock, AlertCircle } from "lucide-react";
import { useMemo } from "react";

import type { FullSubscription, Subscription } from "../types/subscription";
import { formatCurrency } from "../utils/helpers";
import {
  getCurrentPayPeriodThursday,
  getUpcomingSubscriptions,
} from "../utils/payPeriodCalculations";

import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

interface ThursdayPayPeriodCalculatorProps {
  subscriptions: FullSubscription[] | Subscription[];
}

export const ThursdayPayPeriodCalculator = ({
  subscriptions,
}: ThursdayPayPeriodCalculatorProps) => {
  const payPeriodData = useMemo(() => {
    const now = new Date();
    const periodStart = getCurrentPayPeriodThursday(now);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 6); // Wednesday (6 days after Thursday)

    // Get subscriptions due in this pay period
    const upcomingSubscriptions = getUpcomingSubscriptions(
      subscriptions,
      periodStart,
      periodEnd,
      false // Only active subscriptions
    );

    const totalAmount = upcomingSubscriptions.reduce((sum, sub) => sum + sub.cost, 0);

    // Calculate days until pay period starts/ends
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysUntilStart = Math.ceil((periodStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilEnd = Math.ceil((periodEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      periodStart,
      periodEnd,
      upcomingSubscriptions,
      totalAmount,
      daysUntilStart,
      daysUntilEnd,
      isCurrentPeriod: daysUntilStart <= 0 && daysUntilEnd >= 0,
    };
  }, [subscriptions]);

  const {
    periodStart,
    periodEnd,
    upcomingSubscriptions,
    totalAmount,
    daysUntilStart,
    daysUntilEnd,
    isCurrentPeriod,
  } = payPeriodData;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getDayOfWeekName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  return (
    <div className="space-y-4">
      {/* Pay Period Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Thursday-to-Wednesday Pay Period
            </CardTitle>
            {isCurrentPeriod && (
              <Badge variant="default" className="bg-green-600">
                Current Period
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Period Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">THU</span>
              </div>
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Period Starts
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {formatDate(periodStart)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">WED</span>
              </div>
              <div>
                <p className="font-medium text-purple-800 dark:text-purple-200">
                  Period Ends
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  {formatDate(periodEnd)}
                </p>
              </div>
            </div>
          </div>

          {/* Period Status */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {isCurrentPeriod ? (
                <span className="text-green-600 font-medium">
                  This is the current pay period ({Math.abs(daysUntilEnd)} days remaining)
                </span>
              ) : daysUntilStart > 0 ? (
                <span>
                  Pay period starts in <span className="font-medium">{daysUntilStart} days</span>
                </span>
              ) : (
                <span>
                  Pay period ended <span className="font-medium">{Math.abs(daysUntilEnd)} days ago</span>
                </span>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Amount Required Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Amount Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {formatCurrency(totalAmount)}
            </div>
            <div className="text-muted-foreground mb-4">
              Total for {upcomingSubscriptions.length} subscription{upcomingSubscriptions.length !== 1 ? 's' : ''}
            </div>
            
            {totalAmount > 0 && (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  {isCurrentPeriod 
                    ? "Allocate this amount from your current paycheck for upcoming subscriptions."
                    : daysUntilStart > 0 
                      ? "Prepare to allocate this amount from your next paycheck."
                      : "This amount was required for the previous pay period."
                  }
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Due */}
      {upcomingSubscriptions.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Subscriptions Due This Period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingSubscriptions.map((sub, index) => (
              <div key={sub.id}>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {sub.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Due: {formatDate(new Date(sub.dueDate))}</span>
                        <span>•</span>
                        <span>{getDayOfWeekName(new Date(sub.dueDate))}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(sub.cost)}</p>
                    <Badge variant="outline" className="text-xs">
                      {sub.category}
                    </Badge>
                  </div>
                </div>
                {index < upcomingSubscriptions.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground mb-2">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No subscriptions due this period</p>
              <p className="text-sm">Enjoy a subscription-free pay period!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};