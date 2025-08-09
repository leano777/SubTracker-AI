import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AppShell from "./components/AppShell";
import { DashboardTab } from "./components/DashboardTab";
import { SubscriptionsUnifiedTab } from "./components/SubscriptionsUnifiedTab";
import { PlanningTab } from "./components/PlanningTab";
import { IntelligenceTab } from "./components/IntelligenceTab";
import { LandingPage } from "./components/LandingPage";

// Route wrapper components to pass proper props
interface RouteWrapperProps {
  children: React.ReactNode;
}

// Dashboard Route Component
const DashboardRoute: React.FC<any> = (props) => {
  return (
    <DashboardTab
      subscriptions={props.subscriptions || []}
      cards={props.cards || []}
      settings={props.settings || props.defaultAppSettings}
      notifications={props.notifications || []}
      weeklyBudgets={props.weeklyBudgets || []}
    />
  );
};

// Subscriptions Route Component
const SubscriptionsRoute: React.FC<any> = (props) => {
  return (
    <SubscriptionsUnifiedTab
      subscriptions={props.subscriptions || []}
      cards={props.cards || []}
      onEdit={props.openEditForm}
      onDelete={props.handleDeleteSubscription}
      onCancel={props.handleCancelSubscription}
      onReactivate={props.handleReactivateSubscription}
      onActivateFromWatchlist={props.handleActivateFromWatchlist}
      onAddNew={props.openAddForm}
      onAddToWatchlist={props.openWatchlistForm}
    />
  );
};

// Planning Route Component
const PlanningRoute: React.FC<any> = (props) => {
  return (
    <PlanningTab
      subscriptions={props.subscriptions || []}
      weeklyBudgets={props.weeklyBudgets || []}
      onViewSubscription={props.handleViewSubscription}
      onUpdateSubscriptionDate={props.handleUpdateSubscriptionDate}
      onUpdateCategories={props.handleUpdateCategories}
    />
  );
};

// Intelligence Route Component
const IntelligenceRoute: React.FC<any> = (props) => {
  return (
    <IntelligenceTab
      subscriptions={props.subscriptions || []}
      cards={props.cards || []}
      onAutomationTrigger={() => {}}
    />
  );
};

// Create router configuration
export const createAppRouter = (appProps: any) => {
  return createBrowserRouter([
    {
      path: "/",
      element: appProps.isAuthenticated ? (
        <AppShell {...appProps} />
      ) : (
        <LandingPage />
      ),
      children: appProps.isAuthenticated ? [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />,
        },
        {
          path: "dashboard",
          element: <DashboardRoute {...appProps} />,
        },
        {
          path: "subscriptions",
          element: <SubscriptionsRoute {...appProps} />,
        },
        {
          path: "planning",
          element: <PlanningRoute {...appProps} />,
        },
        {
          path: "intelligence",
          element: <IntelligenceRoute {...appProps} />,
        },
      ] : [],
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);
};

export default createAppRouter;
