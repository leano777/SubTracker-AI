import React, { useEffect } from "react";
import { createBrowserRouter, Navigate, Outlet, useOutletContext } from "react-router-dom";
import { ModernAppShell } from "./components/ModernAppShell";
import { SimpleErrorBoundary } from "./components/SimpleErrorBoundary";
// Import lazy routes with preloading support
import { 
  DashboardTab, 
  SubscriptionsUnifiedTab, 
  PlanningTab,
  preloadCriticalTabs
} from "./components/LazyRoutes";
// Intelligence tab temporarily disabled
// import { IntelligenceTab } from "./components/IntelligenceTab";

// Modern App Layout Component with preloading
const ModernAppLayout: React.FC<any> = (props) => {
  // Start preloading critical tabs when the app layout mounts
  useEffect(() => {
    // Delay preloading to avoid blocking initial render
    const timer = setTimeout(() => {
      try {
        preloadCriticalTabs();
      } catch (error) {
        console.warn('Failed to preload critical tabs:', error);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <SimpleErrorBoundary>
      <ModernAppShell
        user={props.user}
        signOut={props.signOut}
        openSettingsModal={props.openSettingsModal}
      >
        <Outlet context={props} />
      </ModernAppShell>
    </SimpleErrorBoundary>
  );
};

// Enhanced route components with proper context usage and lazy loading
const DashboardRoute: React.FC = () => {
  const props = useOutletContext<any>();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your subscription spending and insights
          </p>
        </div>
      </div>
      <DashboardTab
        subscriptions={props.subscriptions || []}
        cards={props.paymentCards || []}
        settings={props.appSettings || props.defaultAppSettings}
        notifications={props.notifications || []}
        weeklyBudgets={props.weeklyBudgets || []}
      />
    </div>
  );
};

const SubscriptionsRoute: React.FC = () => {
  const props = useOutletContext<any>();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage all your subscriptions in one place
          </p>
        </div>
      </div>
      <SubscriptionsUnifiedTab
        subscriptions={props.subscriptions || []}
        cards={props.paymentCards || []}
        onEdit={props.openEditForm}
        onDelete={props.handleDeleteSubscription}
        onCancel={props.handleCancelSubscription}
        onReactivate={props.handleReactivateSubscription}
        onActivateFromWatchlist={props.handleActivateFromWatchlist}
        onAddNew={props.openAddForm}
        onAddToWatchlist={props.openWatchlistForm}
      />
    </div>
  );
};

// Intelligence route temporarily disabled
// const IntelligenceRoute: React.FC = () => {
//   const props = useOutletContext<any>();
//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Intelligence</h1>
//           <p className="text-muted-foreground">
//             AI-powered insights and recommendations for your subscriptions
//           </p>
//         </div>
//       </div>
//       <IntelligenceTab
//         subscriptions={props.subscriptions || []}
//       />
//     </div>
//   );
// };

const PlanningRoute: React.FC = () => {
  const props = useOutletContext<any>();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planning</h1>
          <p className="text-muted-foreground">
            Budget planning and forecasting for your subscriptions
          </p>
        </div>
      </div>
      <PlanningTab
        subscriptions={props.subscriptions || []}
        weeklyBudgets={props.weeklyBudgets || []}
        onViewSubscription={props.openViewForm || (() => {})}
        onUpdateSubscriptionDate={props.handleUpdateSubscriptionDate || (() => {})}
        onUpdateCategories={props.handleUpdateCategories || (() => {})}
      />
    </div>
  );
};

// Create modern router with clean structure
const createModernAppRouter = (props: any) => {
  return createBrowserRouter([
    {
      path: "/",
      element: <ModernAppLayout {...props} />,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />,
        },
        {
          path: "dashboard",
          element: <DashboardRoute />,
        },
        {
          path: "subscriptions",
          element: <SubscriptionsRoute />,
        },
        // Intelligence route temporarily disabled
        // {
        //   path: "intelligence",
        //   element: <IntelligenceRoute />,
        // },
        {
          path: "planning",
          element: <PlanningRoute />,
        },
        {
          path: "*",
          element: <Navigate to="/dashboard" replace />,
        },
      ],
    },
  ]);
};

export default createModernAppRouter;