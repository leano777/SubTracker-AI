import { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  PiggyBank,
  Calculator,
  ChevronRight,
  ChevronLeft,
  Download,
  Info,
  Target,
  Wallet,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { useFinancialStore } from '../../stores/useFinancialStore';
import type { FullSubscription } from '../../types/subscription';

interface PayPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  payDate: Date;
  weekNumber: number;
  monthName: string;
  subscriptions: {
    subscription: FullSubscription;
    dueDate: Date;
    amount: number;
  }[];
  totalDue: number;
  isCurrentPeriod: boolean;
  isPastPeriod: boolean;
  daysUntilPay: number;
}

interface MonthlyOverview {
  month: string;
  year: number;
  thursdays: Date[];
  totalMonthlyBills: number;
  averagePerThursday: number;
  hasExtraThursday: boolean;
}

export const SmartPayPeriodCalculator = () => {
  const { subscriptions, bills } = useFinancialStore();
  const [selectedPayDay, setSelectedPayDay] = useState<'thursday' | 'friday' | 'biweekly'>('thursday');
  const [viewMode, setViewMode] = useState<'periods' | 'monthly' | 'optimizer'>('periods');
  const [weeksToShow, setWeeksToShow] = useState(4);
  const [bufferPercentage, setBufferPercentage] = useState(10);

  // Get all active recurring payments (subscriptions + bills)
  const allRecurringPayments = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const activeBills = bills.filter(b => b.status === 'active');
    return [...activeSubscriptions, ...activeBills];
  }, [subscriptions, bills]);

  // Calculate total monthly obligations
  const totalMonthlyObligations = useMemo(() => {
    return allRecurringPayments.reduce((total, payment) => {
      const monthlyAmount = 
        payment.frequency === 'yearly' ? payment.price / 12 :
        payment.frequency === 'quarterly' ? payment.price / 3 :
        payment.frequency === 'weekly' ? payment.price * 4.33 :
        payment.frequency === 'daily' ? payment.price * 30 :
        payment.price;
      return total + monthlyAmount;
    }, 0);
  }, [allRecurringPayments]);

  // Generate pay periods based on selected schedule
  const generatePayPeriods = (): PayPeriod[] => {
    const periods: PayPeriod[] = [];
    const today = new Date();
    const startDate = new Date(today);
    
    // Find the next Thursday (or selected day)
    const targetDay = selectedPayDay === 'thursday' ? 4 : 5; // Thursday = 4, Friday = 5
    while (startDate.getDay() !== targetDay) {
      startDate.setDate(startDate.getDate() + 1);
    }
    startDate.setDate(startDate.getDate() - 7); // Start from last week

    for (let i = 0; i < weeksToShow; i++) {
      const periodStart = new Date(startDate);
      periodStart.setDate(startDate.getDate() + (i * 7));
      
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
      
      const payDate = new Date(periodStart);
      
      // Find subscriptions due in this period
      const periodSubscriptions = allRecurringPayments
        .map(payment => {
          const nextPaymentDate = new Date(payment.nextPayment);
          if (nextPaymentDate >= periodStart && nextPaymentDate <= periodEnd) {
            return {
              subscription: payment,
              dueDate: nextPaymentDate,
              amount: payment.price,
            };
          }
          return null;
        })
        .filter(Boolean) as any[];

      const totalDue = periodSubscriptions.reduce((sum, item) => sum + item.amount, 0);
      const daysUntilPay = Math.ceil((payDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      periods.push({
        id: `period-${i}`,
        startDate: periodStart,
        endDate: periodEnd,
        payDate,
        weekNumber: i + 1,
        monthName: periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        subscriptions: periodSubscriptions,
        totalDue,
        isCurrentPeriod: today >= periodStart && today <= periodEnd,
        isPastPeriod: today > periodEnd,
        daysUntilPay,
      });
    }
    
    return periods;
  };

  const payPeriods = generatePayPeriods();

  // Calculate monthly overview
  const generateMonthlyOverview = (): MonthlyOverview[] => {
    const overviews: MonthlyOverview[] = [];
    const today = new Date();
    
    for (let i = 0; i < 3; i++) {
      const targetMonth = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const thursdays: Date[] = [];
      
      // Find all Thursdays in the month
      const tempDate = new Date(targetMonth);
      while (tempDate.getMonth() === targetMonth.getMonth()) {
        if (tempDate.getDay() === 4) {
          thursdays.push(new Date(tempDate));
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }
      
      overviews.push({
        month: targetMonth.toLocaleDateString('en-US', { month: 'long' }),
        year: targetMonth.getFullYear(),
        thursdays,
        totalMonthlyBills: totalMonthlyObligations,
        averagePerThursday: totalMonthlyObligations / thursdays.length,
        hasExtraThursday: thursdays.length === 5,
      });
    }
    
    return overviews;
  };

  const monthlyOverviews = generateMonthlyOverview();

  // Calculate recommended set-aside amount
  const recommendedWeeklySetAside = useMemo(() => {
    const baseAmount = (totalMonthlyObligations * 12) / 52;
    const bufferAmount = baseAmount * (bufferPercentage / 100);
    return baseAmount + bufferAmount;
  }, [totalMonthlyObligations, bufferPercentage]);

  // Calculate variance for current period
  const currentPeriod = payPeriods.find(p => p.isCurrentPeriod);
  const variance = currentPeriod ? currentPeriod.totalDue - recommendedWeeklySetAside : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short',
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Pay Date', 'Period Start', 'Period End', 'Subscriptions Due', 'Amount Due', 'Set Aside', 'Variance'];
    const rows = payPeriods.map(period => [
      formatDate(period.payDate),
      formatDate(period.startDate),
      formatDate(period.endDate),
      period.subscriptions.length,
      period.totalDue.toFixed(2),
      recommendedWeeklySetAside.toFixed(2),
      (period.totalDue - recommendedWeeklySetAside).toFixed(2),
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pay-period-calculator-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Smart Pay Period Calculator</h2>
          <p className="text-muted-foreground">
            Calculate exactly how much to set aside from each paycheck
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Obligations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyObligations)}</div>
            <p className="text-xs text-muted-foreground">
              {allRecurringPayments.length} active payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recommended Weekly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(recommendedWeeklySetAside)}</div>
            <p className="text-xs text-muted-foreground">
              Includes {bufferPercentage}% buffer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week's Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentPeriod ? formatCurrency(currentPeriod.totalDue) : '$0.00'}
            </div>
            <div className="flex items-center mt-1">
              {variance > 0 ? (
                <ArrowUp className="w-3 h-3 text-red-500 mr-1" />
              ) : (
                <ArrowDown className="w-3 h-3 text-green-500 mr-1" />
              )}
              <span className={`text-xs ${variance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {formatCurrency(Math.abs(variance))} {variance > 0 ? 'over' : 'under'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Pay Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentPeriod ? formatDate(currentPeriod.payDate) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentPeriod && currentPeriod.daysUntilPay > 0 
                ? `In ${currentPeriod.daysUntilPay} days`
                : 'Today'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pay Schedule</label>
              <Select value={selectedPayDay} onValueChange={(value: any) => setSelectedPayDay(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thursday">Weekly (Thursday)</SelectItem>
                  <SelectItem value="friday">Weekly (Friday)</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Buffer Percentage</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={bufferPercentage}
                  onChange={(e) => setBufferPercentage(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12">{bufferPercentage}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Weeks to Show</label>
              <Select value={weeksToShow.toString()} onValueChange={(value) => setWeeksToShow(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 weeks</SelectItem>
                  <SelectItem value="8">8 weeks</SelectItem>
                  <SelectItem value="12">12 weeks</SelectItem>
                  <SelectItem value="16">16 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="periods">Pay Periods</TabsTrigger>
          <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          <TabsTrigger value="optimizer">Optimizer</TabsTrigger>
        </TabsList>

        <TabsContent value="periods" className="space-y-4">
          {/* Pay Periods Table */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Pay Periods</CardTitle>
              <CardDescription>
                Breakdown of subscriptions due each pay period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pay Date</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Subscriptions</TableHead>
                    <TableHead className="text-right">Amount Due</TableHead>
                    <TableHead className="text-right">Set Aside</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payPeriods.map((period) => {
                    const periodVariance = period.totalDue - recommendedWeeklySetAside;
                    return (
                      <TableRow 
                        key={period.id}
                        className={period.isCurrentPeriod ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      >
                        <TableCell className="font-medium">
                          {formatDate(period.payDate)}
                          {period.isCurrentPeriod && (
                            <Badge className="ml-2" variant="secondary">Current</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(period.startDate)} - {formatDate(period.endDate)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {period.subscriptions.length > 0 ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="cursor-pointer">
                                      <Badge variant="outline">
                                        {period.subscriptions.length} due
                                      </Badge>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="space-y-1">
                                      {period.subscriptions.map((item, idx) => (
                                        <div key={idx} className="text-xs">
                                          {item.subscription.name}: {formatCurrency(item.amount)}
                                        </div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-sm text-muted-foreground">None</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(period.totalDue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(recommendedWeeklySetAside)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={`flex items-center justify-end ${
                            periodVariance > 0 ? 'text-red-500' : 'text-green-500'
                          }`}>
                            {periodVariance > 0 ? (
                              <ArrowUp className="w-3 h-3 mr-1" />
                            ) : (
                              <ArrowDown className="w-3 h-3 mr-1" />
                            )}
                            {formatCurrency(Math.abs(periodVariance))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          {/* Monthly Overview */}
          {monthlyOverviews.map((overview) => (
            <Card key={`${overview.month}-${overview.year}`}>
              <CardHeader>
                <CardTitle>{overview.month} {overview.year}</CardTitle>
                <CardDescription>
                  {overview.thursdays.length} Thursdays
                  {overview.hasExtraThursday && (
                    <Badge className="ml-2" variant="secondary">5-Thursday Month</Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Monthly Bills</p>
                    <p className="text-xl font-bold">{formatCurrency(overview.totalMonthlyBills)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Per Thursday (Average)</p>
                    <p className="text-xl font-bold">{formatCurrency(overview.averagePerThursday)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recommended Set-Aside</p>
                    <p className="text-xl font-bold">{formatCurrency(recommendedWeeklySetAside)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Thursday Pay Dates:</p>
                  <div className="flex flex-wrap gap-2">
                    {overview.thursdays.map((thursday, idx) => (
                      <Badge key={idx} variant="outline">
                        {thursday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Badge>
                    ))}
                  </div>
                </div>

                {overview.hasExtraThursday && (
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertTitle>5-Thursday Month</AlertTitle>
                    <AlertDescription>
                      This month has 5 Thursdays. Consider saving the extra paycheck or using it for one-time expenses.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="optimizer" className="space-y-4">
          {/* Optimization Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>
                Smart suggestions to optimize your payment schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Suggestion 1: Annual Billing */}
              <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Switch to Annual Billing</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    3 subscriptions offer annual discounts. Switching could save you {formatCurrency(240)} per year.
                  </p>
                  <Button size="sm" className="mt-2">
                    View Opportunities
                  </Button>
                </div>
              </div>

              {/* Suggestion 2: Payment Date Alignment */}
              <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Align Payment Dates</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Contact providers to align payment dates with your pay schedule. This reduces variance between periods.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    See Instructions
                  </Button>
                </div>
              </div>

              {/* Suggestion 3: High Variance Alert */}
              {variance > recommendedWeeklySetAside * 0.5 && (
                <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">High Variance This Week</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This week's payments are {formatCurrency(Math.abs(variance))} over your regular set-aside. 
                      Consider using buffer funds.
                    </p>
                  </div>
                </div>
              )}

              {/* Buffer Fund Status */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Buffer Fund Target</p>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(recommendedWeeklySetAside * 4)}
                  </span>
                </div>
                <Progress value={65} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  Maintain 4 weeks of set-aside amount as buffer for high-variance periods
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Savings Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Savings Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allRecurringPayments
                  .filter(p => p.frequency === 'monthly' && p.price > 20)
                  .slice(0, 3)
                  .map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Currently {formatCurrency(payment.price)}/month
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          Save ~{formatCurrency(payment.price * 2)}/year
                        </p>
                        <p className="text-xs text-muted-foreground">with annual billing</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};