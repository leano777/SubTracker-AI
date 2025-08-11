import React from "react";
import { createBrowserRouter, Navigate, Outlet, useOutletContext } from "react-router-dom";
import { ModernAppShell } from "./components/ModernAppShell";
import { DashboardTab } from "./components/DashboardTab";
import { SubscriptionsUnifiedTab } from "./components/SubscriptionsUnifiedTab";
import { PlanningTab } from "./components/PlanningTab";
import { ErrorBoundary } from "./components/ErrorBoundary";
// Intelligence tab temporarily disabled
// import { IntelligenceTab } from "./components/IntelligenceTab";

// Modern App Layout Component
const ModernAppLayout: React.FC<any> = (props) => {
  return (
    <ModernAppShell
      user={props.user}
      signOut={props.signOut}
      openSettingsModal={props.openSettingsModal}
    >
      <Outlet context={props} />
    </ModernAppShell>
  );
};

// Enhanced route components with proper context usage
const DashboardRoute: React.FC = () => {
  const props = useOutletContext<any>();
  return (
    <ErrorBoundary fallbackTitle="Dashboard Error" fallbackMessage="The dashboard component encountered an error.">
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
    </ErrorBoundary>
  );
};

const SubscriptionsRoute: React.FC = () => {
  const props = useOutletContext<any>();
  return (
    <ErrorBoundary fallbackTitle="Subscriptions Error" fallbackMessage="The subscriptions component encountered an error.">
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
    </ErrorBoundary>
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
    <ErrorBoundary fallbackTitle="Planning Error" fallbackMessage="The planning component encountered an error.">
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
    </ErrorBoundary>
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