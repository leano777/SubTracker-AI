import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Bell,
  Plus,
  ChevronRight,
  Wallet,
  Target,
  BookOpen,
  CreditCard,
  Eye
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFinancialStore } from '../../stores/useFinancialStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../utils/helpers';
import { getDaysUntil, parseStoredDate } from '../../utils/dateUtils';
import type { FullSubscription } from '../../types/subscription';

interface QuickGlanceCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'warning' | 'success' | 'danger';
}

const QuickGlanceCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  onClick,
  variant = 'default' 
}: QuickGlanceCardProps) => {
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };

  return (
    <Card 
      className={`${variantStyles[variant]} cursor-pointer transition-all hover:shadow-md active:scale-98`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className="text-gray-500 dark:text-gray-400">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface UpcomingPaymentCardProps {
  subscription: FullSubscription;
  onClick: () => void;
}

const UpcomingPaymentCard = ({ subscription, onClick }: UpcomingPaymentCardProps) => {
  const daysUntil = getDaysUntil(subscription.nextPayment);
  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;
  const isOverdue = daysUntil < 0;
  
  const getUrgencyColor = () => {
    if (isOverdue) return 'text-red-600 dark:text-red-400';
    if (isToday) return 'text-orange-600 dark:text-orange-400';
    if (isTomorrow) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getUrgencyText = () => {
    if (isOverdue) return `${Math.abs(daysUntil)} days overdue`;
    if (isToday) return 'Due today';
    if (isTomorrow) return 'Due tomorrow';
    return `In ${daysUntil} days`;
  };

  return (
    <div
      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-sm transition-all"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        {subscription.favicon ? (
          <img 
            src={subscription.favicon} 
            alt={subscription.name}
            className="w-8 h-8 rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-gray-500" />
          </div>
        )}
        <div>
          <p className="font-medium text-sm">{subscription.name}</p>
          <p className={`text-xs ${getUrgencyColor()}`}>{getUrgencyText()}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">{formatCurrency(subscription.price)}</p>
        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
      </div>
    </div>
  );
};

export const MobileDashboard = () => {
  const {
    subscriptions,
    bills,
    investments,
    financialGoals,
    notebookEntries,
    notifications,
    setActiveView,
    openModal,
    getActiveSubscriptions,
    getUpcomingPayments,
    getTotalMonthlySpend,
    getPortfolioValue,
    getUnreadNotificationCount,
  } = useFinancialStore();

  const [weeklySetAside, setWeeklySetAside] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate weekly set-aside amount for Thursday paychecks
  useEffect(() => {
    const monthlySpend = getTotalMonthlySpend();
    // Calculate weekly amount (monthly * 12 / 52 weeks)
    const weeklyAmount = (monthlySpend * 12) / 52;
    setWeeklySetAside(weeklyAmount);
  }, [subscriptions, getTotalMonthlySpend]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh - in real app would sync with APIs
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const activeSubscriptions = getActiveSubscriptions();
  const upcomingPayments = getUpcomingPayments(7);
  const portfolioValue = getPortfolioValue();
  const unreadNotifications = getUnreadNotificationCount();
  const monthlySpend = getTotalMonthlySpend();

  // Calculate goals progress
  const goalsProgress = financialGoals.length > 0
    ? financialGoals.reduce((acc, goal) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        return acc + progress;
      }, 0) / financialGoals.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Financial Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className={isRefreshing ? 'animate-spin' : ''}
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView('settings')}
              className="relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <QuickGlanceCard
            title="Monthly Spend"
            value={formatCurrency(monthlySpend)}
            subtitle={`${activeSubscriptions.length} active`}
            icon={<DollarSign className="w-4 h-4" />}
            onClick={() => setActiveView('subscriptions')}
          />
          
          <QuickGlanceCard
            title="Weekly Set-Aside"
            value={formatCurrency(weeklySetAside)}
            subtitle="For Thursday paycheck"
            icon={<Wallet className="w-4 h-4" />}
            onClick={() => setActiveView('calculator' as any)}
            variant="warning"
          />
          
          <QuickGlanceCard
            title="Portfolio"
            value={formatCurrency(portfolioValue)}
            subtitle={`${investments.length} holdings`}
            icon={<TrendingUp className="w-4 h-4" />}
            onClick={() => setActiveView('portfolio')}
            variant={portfolioValue > 0 ? 'success' : 'default'}
          />
          
          <QuickGlanceCard
            title="Goals"
            value={`${Math.round(goalsProgress)}%`}
            subtitle={`${financialGoals.length} active`}
            icon={<Target className="w-4 h-4" />}
            onClick={() => openModal('notebook')}
          />
        </div>

        {/* Upcoming Payments Section */}
        {upcomingPayments.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                Upcoming This Week
              </h2>
              <Badge variant="secondary">
                {upcomingPayments.length} payments
              </Badge>
            </div>
            
            <div className="space-y-2">
              {upcomingPayments.slice(0, 3).map((subscription) => (
                <UpcomingPaymentCard
                  key={subscription.id}
                  subscription={subscription}
                  onClick={() => {
                    // Handle subscription click
                    console.log('View subscription:', subscription.name);
                  }}
                />
              ))}
            </div>
            
            {upcomingPayments.length > 3 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setActiveView('subscriptions')}
              >
                View all {upcomingPayments.length} upcoming payments
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center space-y-2"
            onClick={() => setActiveView('watchlist')}
          >
            <Eye className="w-5 h-5" />
            <span className="text-xs">Watchlist</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center space-y-2"
            onClick={() => setActiveView('calculator' as any)}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-xs">Pay Calculator</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center space-y-2"
            onClick={() => setActiveView('subscriptions')}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Calendar</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center space-y-2"
            onClick={() => openModal('investment')}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Investments</span>
          </Button>
        </div>

        {/* Alerts Section */}
        {notifications.filter(n => !n.read).length > 0 && (
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications
                .filter(n => !n.read)
                .slice(0, 2)
                .map((notification) => (
                  <div key={notification.id} className="text-xs">
                    {notification.message}
                  </div>
                ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          size="lg"
          className="rounded-full shadow-lg w-14 h-14"
          onClick={() => openModal('subscription')}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};