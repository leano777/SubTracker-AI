import { Building2, User, DollarSign, CreditCard } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Subscription } from "../types/subscription";

interface SubscriptionOverviewProps {
  subscriptions: Subscription[];
}

export function SubscriptionOverview({ subscriptions }: SubscriptionOverviewProps) {
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.isActive && sub.status === "active"
  );

  const getMonthlyEquivalent = (subscription: Subscription) => {
    switch (subscription.billingCycle) {
      case "monthly":
      case "variable":
        return subscription.cost;
      case "quarterly":
        return subscription.cost / 3;
      case "yearly":
        return subscription.cost / 12;
      default:
        return subscription.cost;
    }
  };

  const personalSubscriptions = activeSubscriptions.filter(
    (sub) => sub.subscriptionType === "personal"
  );
  const businessSubscriptions = activeSubscriptions.filter(
    (sub) => sub.subscriptionType === "business"
  );

  const personalTotal = personalSubscriptions.reduce(
    (total, sub) => total + getMonthlyEquivalent(sub),
    0
  );
  const businessTotal = businessSubscriptions.reduce(
    (total, sub) => total + getMonthlyEquivalent(sub),
    0
  );
  const grandTotal = personalTotal + businessTotal;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Personal Subscriptions */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Personal</div>
              <div className="text-2xl font-bold">{formatCurrency(personalTotal)}</div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {personalSubscriptions.length} subscriptions
                </Badge>
              </div>
            </div>
          </div>

          {/* Business Subscriptions */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Business</div>
              <div className="text-2xl font-bold">{formatCurrency(businessTotal)}</div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {businessSubscriptions.length} subscriptions
                </Badge>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Monthly</div>
              <div className="text-2xl font-bold">{formatCurrency(grandTotal)}</div>
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="text-xs">
                  {activeSubscriptions.length} total
                </Badge>
              </div>
            </div>
          </div>

          {/* Annual Projection */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Annual Total</div>
              <div className="text-2xl font-bold">{formatCurrency(grandTotal * 12)}</div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  Projected yearly
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Bar */}
        {activeSubscriptions.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Cost Breakdown</span>
              <span>Monthly Totals</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div className="h-full flex">
                {personalTotal > 0 && (
                  <div
                    className="bg-blue-500 flex items-center justify-center text-xs text-white"
                    style={{ width: `${(personalTotal / grandTotal) * 100}%` }}
                    title={`Personal: ${formatCurrency(personalTotal)} (${Math.round((personalTotal / grandTotal) * 100)}%)`}
                  />
                )}
                {businessTotal > 0 && (
                  <div
                    className="bg-green-500 flex items-center justify-center text-xs text-white"
                    style={{ width: `${(businessTotal / grandTotal) * 100}%` }}
                    title={`Business: ${formatCurrency(businessTotal)} (${Math.round((businessTotal / grandTotal) * 100)}%)`}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <div className="flex items-center space-x-4">
                {personalTotal > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Personal ({Math.round((personalTotal / grandTotal) * 100)}%)</span>
                  </div>
                )}
                {businessTotal > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Business ({Math.round((businessTotal / grandTotal) * 100)}%)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
