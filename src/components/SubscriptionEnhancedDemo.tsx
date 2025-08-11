import { useState } from "react";
import { Grid3X3, List, Plus } from "lucide-react";

import type { FullSubscription, PaymentCard } from "../types/subscription";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { SubscriptionListEnhanced } from "./SubscriptionListEnhanced";

// Sample data for demonstration
const sampleSubscriptions: FullSubscription[] = [
  {
    id: "1",
    name: "Netflix",
    cost: 15.99,
    price: 15.99,
    frequency: "monthly",
    billingCycle: "monthly",
    nextPayment: "2024-02-15",
    category: "Entertainment",
    status: "active",
    isActive: true,
    subscriptionType: "personal",
    logoUrl: "https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2023.ico",
    description: "Video streaming service with movies and TV shows",
    billingUrl: "https://netflix.com/billing",
    tags: ["streaming", "entertainment", "movies"],
    planType: "paid",
    dateAdded: "2024-01-01",
    hasLinkedCard: true,
    automationEnabled: true,
    cardId: "card1",
  },
  {
    id: "2",
    name: "Spotify Premium",
    cost: 9.99,
    price: 9.99,
    frequency: "monthly",
    billingCycle: "monthly",
    nextPayment: "2024-02-10",
    category: "Music",
    status: "active",
    isActive: true,
    subscriptionType: "personal",
    description: "Music streaming with premium features",
    tags: ["music", "streaming", "audio"],
    planType: "paid",
    dateAdded: "2024-01-05",
    hasLinkedCard: false,
    automationEnabled: false,
  },
  {
    id: "3",
    name: "Adobe Creative Cloud",
    cost: 52.99,
    price: 52.99,
    frequency: "monthly",
    billingCycle: "monthly",
    nextPayment: "2024-02-20",
    category: "Design",
    status: "active",
    isActive: true,
    subscriptionType: "business",
    description: "Complete suite of creative tools",
    tags: ["design", "creative", "professional"],
    planType: "paid",
    dateAdded: "2024-01-10",
    hasLinkedCard: true,
    automationEnabled: true,
    cardId: "card2",
  },
  {
    id: "4",
    name: "Figma",
    cost: 12.00,
    price: 12.00,
    frequency: "monthly",
    billingCycle: "monthly",
    nextPayment: "2024-02-08",
    category: "Design",
    status: "cancelled",
    isActive: false,
    subscriptionType: "business",
    description: "Collaborative design tool",
    tags: ["design", "collaboration", "ui"],
    planType: "paid",
    dateAdded: "2024-01-15",
    dateCancelled: "2024-01-30",
    hasLinkedCard: false,
    automationEnabled: false,
  },
  {
    id: "5",
    name: "Notion Pro",
    cost: 8.00,
    price: 8.00,
    frequency: "monthly",
    billingCycle: "monthly",
    nextPayment: "",
    category: "Productivity",
    status: "watchlist",
    isActive: false,
    subscriptionType: "personal",
    description: "All-in-one workspace for notes, tasks, and databases",
    tags: ["productivity", "notes", "organization"],
    planType: "paid",
    dateAdded: "2024-02-01",
    hasLinkedCard: false,
    automationEnabled: false,
    priority: "high",
    watchlistNotes: "Considering for better organization and project management. Want to try the database features.",
  },
];

const sampleCards: PaymentCard[] = [
  {
    id: "card1",
    nickname: "Main Visa",
    lastFour: "4242",
    type: "visa",
    issuer: "Chase",
    color: "#1a73e8",
    isDefault: true,
    dateAdded: "2024-01-01",
  },
  {
    id: "card2",
    nickname: "Business Amex",
    lastFour: "1005",
    type: "amex",
    issuer: "American Express",
    color: "#00a651",
    isDefault: false,
    dateAdded: "2024-01-01",
  },
];

export const SubscriptionEnhancedDemo = () => {
  const [viewMode, setViewMode] = useState<"compact" | "expanded">("compact");
  const [selectedSubscription, setSelectedSubscription] = useState<FullSubscription | null>(null);
  const [activeTab, setActiveTab] = useState("active");

  // Filter subscriptions by status
  const filteredSubscriptions = sampleSubscriptions.filter((sub) => {
    switch (activeTab) {
      case "active":
        return sub.status === "active";
      case "cancelled":
        return sub.status === "cancelled";
      case "watchlist":
        return sub.status === "watchlist";
      default:
        return true;
    }
  });

  const handleEdit = (subscription: FullSubscription) => {
    console.log("Edit subscription:", subscription.name);
    // In real implementation, this would open the edit form
  };

  const handleDelete = (id: string) => {
    console.log("Delete subscription:", id);
    // In real implementation, this would delete the subscription
  };

  const handleCancel = (id: string) => {
    console.log("Cancel subscription:", id);
    // In real implementation, this would cancel the subscription
  };

  const handleReactivate = (id: string) => {
    console.log("Reactivate subscription:", id);
    // In real implementation, this would reactivate the subscription
  };

  const handleActivateFromWatchlist = (id: string) => {
    console.log("Activate from watchlist:", id);
    // In real implementation, this would activate the subscription
  };

  const getStatusCount = (status: string) => {
    return sampleSubscriptions.filter(sub => sub.status === status).length;
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground mt-2">
            Enhanced UX with compact/expanded views and slide-in detail panels
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">View:</span>
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "compact" | "expanded")}>
              <TabsList>
                <TabsTrigger value="compact" className="flex items-center gap-1">
                  <List className="w-3 h-3" />
                  Compact
                </TabsTrigger>
                <TabsTrigger value="expanded" className="flex items-center gap-1">
                  <Grid3X3 className="w-3 h-3" />
                  Expanded
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Subscription
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getStatusCount("active")}</div>
            <p className="text-xs text-muted-foreground">Currently subscribed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${sampleSubscriptions
                .filter(sub => sub.status === "active")
                .reduce((sum, sub) => sum + sub.cost, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total active spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watchlist Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{getStatusCount("watchlist")}</div>
            <p className="text-xs text-muted-foreground">Services to consider</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{getStatusCount("cancelled")}</div>
            <p className="text-xs text-muted-foreground">Previously used</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active" className="relative">
              Active
              {getStatusCount("active") > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getStatusCount("active")}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="relative">
              Cancelled
              {getStatusCount("cancelled") > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getStatusCount("cancelled")}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="relative">
              Watchlist
              {getStatusCount("watchlist") > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getStatusCount("watchlist")}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <SubscriptionListEnhanced
              subscriptions={filteredSubscriptions}
              cards={sampleCards}
              viewMode={viewMode}
              selectedSubscription={selectedSubscription}
              onSubscriptionSelect={setSelectedSubscription}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCancel={handleCancel}
              onReactivate={handleReactivate}
              onActivateFromWatchlist={handleActivateFromWatchlist}
            />
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            <SubscriptionListEnhanced
              subscriptions={filteredSubscriptions}
              cards={sampleCards}
              viewMode={viewMode}
              selectedSubscription={selectedSubscription}
              onSubscriptionSelect={setSelectedSubscription}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCancel={handleCancel}
              onReactivate={handleReactivate}
              onActivateFromWatchlist={handleActivateFromWatchlist}
            />
          </TabsContent>

          <TabsContent value="watchlist" className="mt-6">
            <SubscriptionListEnhanced
              subscriptions={filteredSubscriptions}
              cards={sampleCards}
              viewMode={viewMode}
              selectedSubscription={selectedSubscription}
              onSubscriptionSelect={setSelectedSubscription}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCancel={handleCancel}
              onReactivate={handleReactivate}
              onActivateFromWatchlist={handleActivateFromWatchlist}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Feature Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>✨ Enhanced Features Delivered</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">📋 Redesigned Subscription List</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Compact and expanded row modes</li>
              <li>• Expandable details with smooth animations</li>
              <li>• Quick action buttons with status indicators</li>
              <li>• Visual payment due warnings</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">📱 Slide-in Detail Panel</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Full subscription details view</li>
              <li>• Inline editing with form validation</li>
              <li>• Card linking and automation status</li>
              <li>• Quick actions (edit, cancel, delete)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">✅ Inline Validation</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• React Hook Form integration</li>
              <li>• Zod schema validation</li>
              <li>• Real-time field validation</li>
              <li>• Context-aware error messages</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">🎨 UX Improvements</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Smooth animations and transitions</li>
              <li>• Consistent design language</li>
              <li>• Mobile-responsive layouts</li>
              <li>• Accessible keyboard navigation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
