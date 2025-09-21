import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Calendar, DollarSign, TrendingUp, AlertCircle, Clock, Gift, AlertTriangle } from 'lucide-react';
import { Subscription } from '../types/subscription';

interface DashboardProps {
  subscriptions: Subscription[];
}

export function Dashboard({ subscriptions }: DashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculate statistics
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
  const paidSubscriptions = activeSubscriptions.filter(sub => sub.planType === 'paid');
  const freeSubscriptions = activeSubscriptions.filter(sub => sub.planType === 'free');
  const trialSubscriptions = activeSubscriptions.filter(sub => sub.planType === 'trial');
  
  const totalMonthlySpending = paidSubscriptions.reduce((total, sub) => {
    switch (sub.billingCycle) {
      case 'monthly': return total + sub.cost;
      case 'quarterly': return total + (sub.cost / 3);
      case 'yearly': return total + (sub.cost / 12);
      default: return total;
    }
  }, 0);

  // Calculate potential monthly spending after trials
  const potentialMonthlySpending = totalMonthlySpending + trialSubscriptions.reduce((total, sub) => {
    switch (sub.billingCycle) {
      case 'monthly': return total + sub.cost;
      case 'quarterly': return total + (sub.cost / 3);
      case 'yearly': return total + (sub.cost / 12);
      default: return total;
    }
  }, 0);

  const totalYearlySpending = totalMonthlySpending * 12;

  // Upcoming renewals (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingRenewals = paidSubscriptions.filter(sub => {
    const renewalDate = new Date(sub.nextPayment);
    return renewalDate >= today && renewalDate <= nextWeek;
  });

  // Trial expirations (next 7 days)
  const upcomingTrialExpirations = trialSubscriptions.filter(sub => {
    if (!sub.trialEndDate) return false;
    const expirationDate = new Date(sub.trialEndDate);
    return expirationDate >= today && expirationDate <= nextWeek;
  });

  // Expired trials
  const expiredTrials = trialSubscriptions.filter(sub => {
    if (!sub.trialEndDate) return false;
    const expirationDate = new Date(sub.trialEndDate);
    return expirationDate < today;
  });

  // Category breakdown (only paid subscriptions for spending analysis)
  const categoryData = paidSubscriptions.reduce((acc, sub) => {
    const monthlyAmount = sub.billingCycle === 'monthly' ? sub.cost : 
                         sub.billingCycle === 'quarterly' ? sub.cost / 3 : 
                         sub.cost / 12;
    
    if (acc[sub.category]) {
      acc[sub.category] += monthlyAmount;
    } else {
      acc[sub.category] = monthlyAmount;
    }
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / totalMonthlySpending) * 100).toFixed(1)
  }));

  // Monthly spending trend (mock data for demonstration)
  const monthlyTrend = [
    { month: 'Jan', amount: totalMonthlySpending * 0.9 },
    { month: 'Feb', amount: totalMonthlySpending * 0.95 },
    { month: 'Mar', amount: totalMonthlySpending * 1.1 },
    { month: 'Apr', amount: totalMonthlySpending * 1.05 },
    { month: 'May', amount: totalMonthlySpending * 1.15 },
    { month: 'Jun', amount: totalMonthlySpending }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
              <span>{paidSubscriptions.length} paid</span>
              <span>{trialSubscriptions.length} trial</span>
              <span>{freeSubscriptions.length} free</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlySpending)}</div>
            <p className="text-xs text-muted-foreground">
              {trialSubscriptions.length > 0 ? 
                `+${formatCurrency(potentialMonthlySpending - totalMonthlySpending)} potential from trials` :
                `${formatCurrency(totalMonthlySpending * 12)} annually`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingRenewals.length}</div>
            <p className="text-xs text-muted-foreground">
              Next 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trials & Alerts</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingTrialExpirations.length + expiredTrials.length}
            </div>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
              <span>{upcomingTrialExpirations.length} expiring</span>
              <span>{expiredTrials.length} expired</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals */}
      {upcomingRenewals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Renewals (Next 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingRenewals.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{subscription.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(subscription.nextPayment).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(subscription.cost)}</div>
                    <Badge variant="outline" className="text-xs">
                      {subscription.billingCycle}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trial Expiration Alerts */}
      {(upcomingTrialExpirations.length > 0 || expiredTrials.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Trial Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Expired Trials */}
              {expiredTrials.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">{subscription.name}</h4>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Trial expired on {subscription.trialEndDate ? new Date(subscription.trialEndDate).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600 dark:text-red-400">Action Needed</div>
                    <Badge variant="destructive" className="text-xs">
                      Expired
                    </Badge>
                  </div>
                </div>
              ))}

              {/* Upcoming Trial Expirations */}
              {upcomingTrialExpirations.map((subscription) => {
                const daysLeft = subscription.trialEndDate ? 
                  Math.ceil((new Date(subscription.trialEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                return (
                  <div key={subscription.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">{subscription.name}</h4>
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          Trial ends in {daysLeft} day{daysLeft !== 1 ? 's' : ''} ({subscription.trialEndDate ? new Date(subscription.trialEndDate).toLocaleDateString() : 'Unknown'})
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(subscription.cost)}</div>
                      <Badge variant="outline" className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
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
}