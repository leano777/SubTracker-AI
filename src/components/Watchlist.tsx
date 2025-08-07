import { useState } from "react";
import { Plus, Filter, Star, TrendingUp, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { WatchlistCard } from "./WatchlistCard";
import { Subscription } from "../types/subscription";

interface WatchlistProps {
  watchlistItems: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onViewDetails: (subscription: Subscription) => void;
  onActivate: (subscription: Subscription) => void;
  onAddNew: () => void;
}

export function Watchlist({
  watchlistItems,
  onEdit,
  onDelete,
  onViewDetails,
  onActivate,
  onAddNew,
}: WatchlistProps) {
  const [sortBy, setSortBy] = useState<"date" | "priority" | "cost" | "name">("date");
  const [filterPriority, setFilterPriority] = useState<"all" | "high" | "medium" | "low">("all");
  const [filterType, setFilterType] = useState<"all" | "personal" | "business">("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Calculate statistics
  const totalPotentialSpending = watchlistItems.reduce((total, item) => {
    if (item.planType === "free") return total;
    switch (item.billingCycle) {
      case "monthly":
        return total + item.cost;
      case "quarterly":
        return total + item.cost / 3;
      case "yearly":
        return total + item.cost / 12;
      default:
        return total;
    }
  }, 0);

  const priorityCounts = watchlistItems.reduce(
    (acc, item) => {
      const priority = item.priority || "low";
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const categoryBreakdown = watchlistItems.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Filter and sort items
  const filteredItems = watchlistItems
    .filter((item) => {
      if (filterPriority !== "all" && item.priority !== filterPriority) return false;
      if (filterType !== "all" && item.subscriptionType !== filterType) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.dateAdded || "").getTime() - new Date(a.dateAdded || "").getTime();
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (
            (priorityOrder[b.priority || "low"] || 1) - (priorityOrder[a.priority || "low"] || 1)
          );
        case "cost":
          const getMonthlyCost = (item: Subscription) => {
            if (item.planType === "free") return 0;
            switch (item.billingCycle) {
              case "monthly":
                return item.cost;
              case "quarterly":
                return item.cost / 3;
              case "yearly":
                return item.cost / 12;
              default:
                return item.cost;
            }
          };
          return getMonthlyCost(b) - getMonthlyCost(a);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watchlist Items</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{watchlistItems.length}</div>
            <p className="text-xs text-muted-foreground">Services to explore</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Monthly Cost</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPotentialSpending)}</div>
            <p className="text-xs text-muted-foreground">If all activated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{priorityCounts.high || 0}</div>
            <p className="text-xs text-muted-foreground">Ready to try soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(categoryBreakdown).length > 0
                ? Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0]?.[1] || 0
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.keys(categoryBreakdown).length > 0
                ? Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0]?.[0] || "None"
                : "None"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Subscription Watchlist ({filteredItems.length})</h2>
          <p className="text-sm text-muted-foreground">Services you're interested in trying</p>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date Added</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="cost">Cost</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add to Watchlist
          </Button>
        </div>
      </div>

      {/* Watchlist Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="font-medium mb-2">
            {watchlistItems.length === 0 ? "No watchlist items yet" : "No items match your filters"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {watchlistItems.length === 0
              ? "Add subscriptions you're curious about to keep track of services you might want to try."
              : "Try adjusting your filters to see more items."}
          </p>
          {watchlistItems.length === 0 && (
            <Button onClick={onAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Watchlist Item
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <WatchlistCard
              key={item.id}
              subscription={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
              onActivate={onActivate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
