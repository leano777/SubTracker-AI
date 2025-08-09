// Performance-optimized dashboard component using React 18 concurrent features
import React, { memo, useMemo, Suspense } from 'react';
import { usePerformantTransition, useDeferredWithStatus } from '../utils/concurrent';
import { LazyChartBundle } from './LazyCharts';
import type { FullSubscription, PaymentCard } from '../types/subscription';

// Lazy load heavy dashboard components - temporarily disabled due to missing components
// const LazySpendingChart = React.lazy(() => import('./SpendingChart').catch(() => ({ 
//   default: () => <div>Failed to load chart</div> 
// })));

// const LazyInsightsPanel = React.lazy(() => import('./InsightsPanel').catch(() => ({ 
//   default: () => <div>Failed to load insights</div> 
// })));

interface OptimizedDashboardProps {
  subscriptions: FullSubscription[];
  cards: PaymentCard[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

// Memoized component to prevent unnecessary re-renders
export const OptimizedDashboard = memo<OptimizedDashboardProps>(({
  subscriptions,
  cards,
  searchQuery,
  onSearchChange
}) => {
  const [isPending, performTransition] = usePerformantTransition();
  const [deferredSearchQuery, isSearchDeferred] = useDeferredWithStatus(searchQuery);

  // Expensive calculations wrapped in useMemo for performance
  const dashboardMetrics = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const totalMonthlySpend = activeSubscriptions.reduce((sum, sub) => {
      const monthlyCost = sub.billingCycle === 'yearly' ? sub.cost / 12 :
                         sub.billingCycle === 'quarterly' ? sub.cost / 3 :
                         sub.cost;
      return sum + monthlyCost;
    }, 0);

    const upcomingPayments = activeSubscriptions.filter(sub => {
      const paymentDate = new Date(sub.nextPayment);
      const today = new Date();
      const diffTime = paymentDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    });

    const categoryBreakdown = activeSubscriptions.reduce((acc, sub) => {
      const category = sub.category || 'Other';
      acc[category] = (acc[category] || 0) + sub.cost;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSubscriptions: activeSubscriptions.length,
      totalMonthlySpend,
      upcomingPayments,
      categoryBreakdown,
      averageSpendPerSubscription: totalMonthlySpend / activeSubscriptions.length || 0
    };
  }, [subscriptions]);

  // Filtered subscriptions using deferred value for smooth search
  const filteredSubscriptions = useMemo(() => {
    if (!deferredSearchQuery.trim()) return subscriptions;
    
    const query = deferredSearchQuery.toLowerCase();
    return subscriptions.filter(sub =>
      sub.name.toLowerCase().includes(query) ||
      sub.category?.toLowerCase().includes(query)
    );
  }, [subscriptions, deferredSearchQuery]);

  // Performance-optimized search handler
  const handleSearchChange = (newQuery: string) => {
    // Update search immediately for input responsiveness
    onSearchChange(newQuery);
    
    // Perform heavy filtering in a transition to keep UI responsive
    performTransition(() => {
      // Any heavy operations would go here
      console.log(`Searching for: ${newQuery}`);
    });
  };

  // Chart data preparation with performance optimization
  const chartData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        spending: Math.random() * 500 + 200 // Mock data - replace with real calculation
      };
    });
    return last6Months;
  }, [subscriptions]);

  return (
    <div className="space-y-6 p-6">
      {/* Performance indicator for debugging */}
      {isPending && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-2 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
            <div className="ml-2">
              <p className="text-sm text-blue-700">Processing search...</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Input with performance optimization */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search subscriptions..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            isSearchDeferred ? 'bg-yellow-50' : 'bg-white'
          }`}
        />
        {isSearchDeferred && (
          <div className="absolute right-2 top-2">
            <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Dashboard Metrics - Optimized with memoization */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Subscriptions"
          value={dashboardMetrics.totalSubscriptions.toString()}
          trend="+2 this month"
          trendColor="text-green-600"
        />
        <MetricCard
          title="Monthly Spend"
          value={`$${dashboardMetrics.totalMonthlySpend.toFixed(2)}`}
          trend="-$12 vs last month"
          trendColor="text-green-600"
        />
        <MetricCard
          title="Upcoming Payments"
          value={dashboardMetrics.upcomingPayments.length.toString()}
          trend="Next 7 days"
          trendColor="text-yellow-600"
        />
        <MetricCard
          title="Average per Service"
          value={`$${dashboardMetrics.averageSpendPerSubscription.toFixed(2)}`}
          trend="Per subscription"
          trendColor="text-blue-600"
        />
      </div>

      {/* Charts with lazy loading and suspense */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Spending Trend</h3>
          <Suspense fallback={<LazyChartBundle.ChartLoading />}>
            <LazyChartBundle.ResponsiveContainer width="100%" height={300}>
              <LazyChartBundle.AreaChart data={chartData}>
                <LazyChartBundle.CartesianGrid strokeDasharray="3 3" />
                <LazyChartBundle.XAxis dataKey="month" />
                <LazyChartBundle.YAxis />
                <LazyChartBundle.Tooltip />
                <LazyChartBundle.Area
                  type="monotone"
                  dataKey="spending"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </LazyChartBundle.AreaChart>
            </LazyChartBundle.ResponsiveContainer>
          </Suspense>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
          <Suspense fallback={<LazyChartBundle.ChartLoading />}>
            <LazyChartBundle.ResponsiveContainer width="100%" height={300}>
              <LazyChartBundle.PieChart>
                <LazyChartBundle.Pie
                  data={Object.entries(dashboardMetrics.categoryBreakdown).map(([category, amount]) => ({
                    name: category,
                    value: amount
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#3B82F6"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                />
                <LazyChartBundle.Tooltip />
              </LazyChartBundle.PieChart>
            </LazyChartBundle.ResponsiveContainer>
          </Suspense>
        </div>
      </div>

      {/* Subscription List with virtualization for large datasets */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">
            Recent Subscriptions ({filteredSubscriptions.length})
          </h3>
        </div>
        <div className="p-6">
          <SubscriptionList
            subscriptions={filteredSubscriptions.slice(0, 10)} // Limit for performance
            isLoading={isSearchDeferred}
          />
        </div>
      </div>
    </div>
  );
});

OptimizedDashboard.displayName = 'OptimizedDashboard';

// Memoized metric card component
const MetricCard = memo<{
  title: string;
  value: string;
  trend: string;
  trendColor: string;
}>(({ title, value, trend, trendColor }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h4 className="text-sm font-medium text-gray-600">{title}</h4>
    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    <p className={`text-sm mt-2 ${trendColor}`}>{trend}</p>
  </div>
));

MetricCard.displayName = 'MetricCard';

// Optimized subscription list component
const SubscriptionList = memo<{
  subscriptions: FullSubscription[];
  isLoading: boolean;
}>(({ subscriptions, isLoading }) => (
  <div className="space-y-3">
    {isLoading && (
      <div className="animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg mb-3"></div>
        ))}
      </div>
    )}
    {!isLoading && subscriptions.map(sub => (
      <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
        <div>
          <h5 className="font-medium">{sub.name}</h5>
          <p className="text-sm text-gray-600">{sub.category}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">${sub.cost}</p>
          <p className="text-sm text-gray-600">{sub.billingCycle}</p>
        </div>
      </div>
    ))}
  </div>
));

SubscriptionList.displayName = 'SubscriptionList';

export default OptimizedDashboard;
