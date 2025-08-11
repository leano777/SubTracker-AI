// Lazy-loaded route components for performance optimization
// This implements code-splitting for heavy route components with preloading
import { lazy, Suspense, type ComponentType } from 'react';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { SimpleErrorBoundary } from './SimpleErrorBoundary';

// Enhanced loading fallback component with retry capability
const RouteLoading = ({ route, onRetry }: { route?: string; onRetry?: () => void }) => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Loading {route || 'Page'}...
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Please wait while we load the content.
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Loading
        </button>
      )}
    </div>
  </div>
);

// Enhanced error fallback for individual tabs
const TabErrorFallback = ({ route, onRetry }: { route: string; onRetry?: () => void }) => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {route} Tab Error
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        The {route.toLowerCase()} tab couldn't load properly. This might be a temporary issue.
      </p>
      <div className="space-y-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Loading Tab
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Reload Application
        </button>
      </div>
    </div>
  </div>
);

// Preloading utility function
const preloadComponent = (componentFactory: () => Promise<any>) => {
  // Start preloading the component immediately
  componentFactory().catch((error) => {
    console.warn('Preload failed:', error);
  });
};

// Lazy load heavy route components with enhanced error handling and retry logic
const createLazyComponent = (importFn: () => Promise<any>, componentName: string) => {
  return lazy(() => 
    importFn()
      .then(module => {
        // Ensure the component exists
        if (!module || (!module.default && !module[componentName])) {
          throw new Error(`Component ${componentName} not found in module`);
        }
        return { default: module[componentName] || module.default };
      })
      .catch(error => {
        console.error(`Failed to load ${componentName}:`, error);
        // Return a fallback component instead of failing completely
        return {
          default: () => (
            <TabErrorFallback 
              route={componentName.replace('Tab', '').replace('Lazy', '')} 
              onRetry={() => window.location.reload()}
            />
          )
        };
      })
  );
};

// Create lazy components with enhanced error handling
const LazyDashboardTab = createLazyComponent(
  () => import('./DashboardTab'), 
  'DashboardTab'
);

const LazyIntelligenceTab = createLazyComponent(
  () => import('./IntelligenceTab'), 
  'IntelligenceTab'
);

const LazyPlanningTab = createLazyComponent(
  () => import('./PlanningTab'), 
  'PlanningTab'
);

const LazySubscriptionsUnifiedTab = createLazyComponent(
  () => import('./SubscriptionsUnifiedTab'), 
  'SubscriptionsUnifiedTab'
);

const LazyAIInsightsTab = createLazyComponent(
  () => import('./AIInsightsTab'), 
  'AIInsightsTab'
);

const LazyAdvancedSettingsTab = createLazyComponent(
  () => import('./AdvancedSettingsTab'), 
  'AdvancedSettingsTab'
);

const LazyWhatIfModal = createLazyComponent(
  () => import('./WhatIfModal'), 
  'WhatIfModal'
);

// Preload critical tabs on app initialization
export const preloadCriticalTabs = () => {
  // Preload the most commonly used tabs
  preloadComponent(() => import('./DashboardTab'));
  preloadComponent(() => import('./SubscriptionsUnifiedTab'));
  
  // Preload others after a short delay to avoid blocking initial load
  setTimeout(() => {
    preloadComponent(() => import('./PlanningTab'));
    preloadComponent(() => import('./AIInsightsTab'));
  }, 1000);
};

// Enhanced tab wrapper component with error boundary and retry logic
const createTabComponent = (LazyComponent: ComponentType<any>, routeName: string) => {
  return (props: any) => {
    const handleRetry = () => {
      // Force a refresh of the specific component
      window.location.reload();
    };

    return (
      <SimpleErrorBoundary
        fallback={
          <TabErrorFallback
            route={routeName}
            onRetry={handleRetry}
          />
        }
      >
        <Suspense 
          fallback={
            <RouteLoading 
              route={routeName} 
              onRetry={handleRetry}
            />
          }
        >
          <LazyComponent {...props} />
        </Suspense>
      </SimpleErrorBoundary>
    );
  };
};

// Export lazy route components with enhanced error boundaries and suspense
export const DashboardTab = createTabComponent(LazyDashboardTab, 'Dashboard');
export const IntelligenceTab = createTabComponent(LazyIntelligenceTab, 'Intelligence');
export const PlanningTab = createTabComponent(LazyPlanningTab, 'Planning');
export const SubscriptionsUnifiedTab = createTabComponent(LazySubscriptionsUnifiedTab, 'Subscriptions');
export const AIInsightsTab = createTabComponent(LazyAIInsightsTab, 'AI Insights');
export const AdvancedSettingsTab = createTabComponent(LazyAdvancedSettingsTab, 'Settings');
export const WhatIfModal = createTabComponent(LazyWhatIfModal, 'Analysis');

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
