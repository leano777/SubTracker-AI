// Lazy-loaded route components for performance optimization
// This implements code-splitting for heavy route components
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Loading fallback component
const RouteLoading = ({ route }: { route?: string }) => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Loading {route || 'Page'}...
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Please wait while we load the content.
        </p>
      </div>
    </div>
  </div>
);

// Lazy load heavy route components
const LazyDashboardTab = lazy(() => import('./DashboardTab').then(module => ({
  default: module.DashboardTab
})));

const LazyIntelligenceTab = lazy(() => import('./IntelligenceTab').then(module => ({
  default: module.IntelligenceTab
})));

const LazyPlanningTab = lazy(() => import('./PlanningTab').then(module => ({
  default: module.PlanningTab
})));

const LazySubscriptionsUnifiedTab = lazy(() => import('./SubscriptionsUnifiedTab').then(module => ({
  default: module.SubscriptionsUnifiedTab
})));

const LazyAIInsightsTab = lazy(() => import('./AIInsightsTab').then(module => ({
  default: module.AIInsightsTab
})));

const LazyAdvancedSettingsTab = lazy(() => import('./AdvancedSettingsTab').then(module => ({
  default: module.AdvancedSettingsTab
})));

const LazyWhatIfModal = lazy(() => import('./WhatIfModal').then(module => ({
  default: module.WhatIfModal
})));

// Export lazy route components with Suspense
export const DashboardTab = (props: any) => (
  <Suspense fallback={<RouteLoading route="Dashboard" />}>
    <LazyDashboardTab {...props} />
  </Suspense>
);

export const IntelligenceTab = (props: any) => (
  <Suspense fallback={<RouteLoading route="Intelligence" />}>
    <LazyIntelligenceTab {...props} />
  </Suspense>
);

export const PlanningTab = (props: any) => (
  <Suspense fallback={<RouteLoading route="Planning" />}>
    <LazyPlanningTab {...props} />
  </Suspense>
);

export const SubscriptionsUnifiedTab = (props: any) => (
  <Suspense fallback={<RouteLoading route="Subscriptions" />}>
    <LazySubscriptionsUnifiedTab {...props} />
  </Suspense>
);

export const AIInsightsTab = (props: any) => (
  <Suspense fallback={<RouteLoading route="AI Insights" />}>
    <LazyAIInsightsTab {...props} />
  </Suspense>
);

export const AdvancedSettingsTab = (props: any) => (
  <Suspense fallback={<RouteLoading route="Settings" />}>
    <LazyAdvancedSettingsTab {...props} />
  </Suspense>
);

export const WhatIfModal = (props: any) => (
  <Suspense fallback={<RouteLoading route="Analysis" />}>
    <LazyWhatIfModal {...props} />
  </Suspense>
);

// Bundle all lazy routes
export const LazyRoutes = {
  DashboardTab,
  IntelligenceTab, 
  PlanningTab,
  SubscriptionsUnifiedTab,
  AIInsightsTab,
  AdvancedSettingsTab,
  WhatIfModal,
  RouteLoading
};

export default LazyRoutes;
