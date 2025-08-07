import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Star,
  MoreVertical,
  Eye,
  EyeOff,
  Pause,
  Play,
  Trash2,
  Edit,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  Clock,
  CreditCard,
  Zap,
  Link,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { FullSubscription, PaymentCard } from "../types/subscription";
import {
  calculateMonthlyAmount,
  formatCurrency,
  validateSubscriptionForCalculations,
  safeCalculateMonthlyAmount,
} from "../utils/helpers";

interface SubscriptionsUnifiedTabProps {
  subscriptions: FullSubscription[];
  cards: PaymentCard[];
  onEdit: (subscription: FullSubscription) => void;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
  onReactivate: (id: string) => void;
  onActivateFromWatchlist: (id: string) => void;
  onAddNew: () => void;
  onAddToWatchlist: () => void;
}

export function SubscriptionsUnifiedTab({
  subscriptions,
  cards,
  onEdit,
  onDelete,
  onCancel,
  onReactivate,
  onActivateFromWatchlist,
  onAddNew,
  onAddToWatchlist,
}: SubscriptionsUnifiedTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCardStatus, setSelectedCardStatus] = useState<string>("all");
  const [selectedAutomationStatus, setSelectedAutomationStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "cost" | "nextPayment">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentTab, setCurrentTab] = useState<"active" | "cancelled" | "watchlist">("active");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Detect mobile screen
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(subscriptions.map((sub) => sub.category))];
    return cats.sort();
  }, [subscriptions]);

  // Filter and sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions.filter((sub) => {
      // Filter by search term
      if (searchTerm && !sub.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filter by category
      if (selectedCategory !== "all" && sub.category !== selectedCategory) {
        return false;
      }

      // Filter by status
      if (selectedStatus !== "all" && sub.status !== selectedStatus) {
        return false;
      }

      // Filter by card linking status
      if (selectedCardStatus !== "all") {
        const hasCard = sub.linkedCard !== undefined && sub.linkedCard !== null;
        if (selectedCardStatus === "linked" && !hasCard) {
          return false;
        }
        if (selectedCardStatus === "not-linked" && hasCard) {
          return false;
        }
      }

      // Filter by automation status
      if (selectedAutomationStatus !== "all") {
        const hasAutomation = sub.automationEnabled === true;
        if (selectedAutomationStatus === "enabled" && !hasAutomation) {
          return false;
        }
        if (selectedAutomationStatus === "disabled" && hasAutomation) {
          return false;
        }
      }

      // Filter by tab
      switch (currentTab) {
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

    // Sort subscriptions
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "cost":
          comparison = safeCalculateMonthlyAmount(a) - safeCalculateMonthlyAmount(b);
          break;
        case "nextPayment":
          const dateA = a.nextPayment ? new Date(a.nextPayment).getTime() : 0;
          const dateB = b.nextPayment ? new Date(b.nextPayment).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [
    subscriptions,
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedCardStatus,
    selectedAutomationStatus,
    sortBy,
    sortOrder,
    currentTab,
  ]);

  // Calculate statistics
  const stats = useMemo(() => {
    const active = subscriptions.filter((sub) => sub.status === "active");
    const cancelled = subscriptions.filter((sub) => sub.status === "cancelled");
    const watchlist = subscriptions.filter((sub) => sub.status === "watchlist");

    const totalMonthly = active.reduce((sum, sub) => {
      return sum + safeCalculateMonthlyAmount(sub);
    }, 0);

    // Upcoming payments
    const upcoming = active.filter((sub) => {
      if (!sub.nextPayment) return false;
      const paymentDate = new Date(sub.nextPayment);
      const now = new Date();
      const daysUntil = Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil >= 0;
    });

    // Card linking and automation stats
    const cardsLinked = subscriptions.filter(
      (sub) => sub.linkedCard !== undefined && sub.linkedCard !== null
    ).length;
    const automationEnabled = subscriptions.filter((sub) => sub.automationEnabled === true).length;

    return {
      active: active.length,
      cancelled: cancelled.length,
      watchlist: watchlist.length,
      totalMonthly,
      upcoming: upcoming.length,
      cardsLinked,
      automationEnabled,
    };
  }, [subscriptions]);

  // Get days until next payment
  const getDaysUntilPayment = (nextPayment: string | undefined) => {
    if (!nextPayment) return null;
    const paymentDate = new Date(nextPayment);
    const now = new Date();
    const daysUntil = Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  // Subscription Card Component
  const SubscriptionCard = ({ subscription }: { subscription: FullSubscription }) => {
    const daysUntil = getDaysUntilPayment(subscription.nextPayment);
    const card = cards.find((c) => c.id === subscription.cardId);

    return (
      <Card className="overflow-hidden hover:shadow-md transition-all duration-200 group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {subscription.logoUrl ? (
                <ImageWithFallback
                  src={subscription.logoUrl}
                  alt={`${subscription.name} logo`}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{subscription.name}</h3>
                <p className="text-sm text-muted-foreground">{subscription.category}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge
                    variant={
                      subscription.status === "active"
                        ? "default"
                        : subscription.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {subscription.status}
                  </Badge>
                  {subscription.planType && (
                    <Badge variant="outline" className="text-xs">
                      {subscription.planType}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-xs flex items-center gap-1 ${
                      subscription.linkedCard
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                    }`}
                  >
                    <CreditCard className="w-3 h-3" />
                    {subscription.linkedCard ? "Card" : "No Card"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs flex items-center gap-1 ${
                      subscription.automationEnabled
                        ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                        : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    {subscription.automationEnabled ? "Auto" : "Manual"}
                  </Badge>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(subscription)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {subscription.status === "active" && (
                  <DropdownMenuItem onClick={() => onCancel(subscription.id)}>
                    <Pause className="w-4 h-4 mr-2" />
                    Cancel
                  </DropdownMenuItem>
                )}
                {subscription.status === "cancelled" && (
                  <DropdownMenuItem onClick={() => onReactivate(subscription.id)}>
                    <Play className="w-4 h-4 mr-2" />
                    Reactivate
                  </DropdownMenuItem>
                )}
                {subscription.status === "watchlist" && (
                  <DropdownMenuItem onClick={() => onActivateFromWatchlist(subscription.id)}>
                    <Star className="w-4 h-4 mr-2" />
                    Activate
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(subscription.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3">
            {/* Cost Information */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">{formatCurrency(subscription.price)}</div>
                <div className="text-sm text-muted-foreground">
                  {subscription.frequency}
                  {subscription.frequency !== "monthly" && (
                    <span className="ml-1">
                      ({formatCurrency(safeCalculateMonthlyAmount(subscription))}/mo)
                    </span>
                  )}
                </div>
              </div>
              {card && (
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Paid with</div>
                  <div className="text-sm font-medium">{card.nickname}</div>
                </div>
              )}
            </div>

            {/* Next Payment */}
            {subscription.nextPayment && subscription.status === "active" && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Next payment</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {new Date(subscription.nextPayment).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  {daysUntil !== null && (
                    <div
                      className={`text-xs ${
                        daysUntil <= 3
                          ? "text-red-600"
                          : daysUntil <= 7
                            ? "text-orange-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {daysUntil === 0
                        ? "Today"
                        : daysUntil === 1
                          ? "Tomorrow"
                          : `${daysUntil} days`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Watchlist Notes */}
            {subscription.status === "watchlist" && subscription.watchlistNotes && (
              <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  {subscription.watchlistNotes}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // List Item Component
  const SubscriptionListItem = ({ subscription }: { subscription: FullSubscription }) => {
    const daysUntil = getDaysUntilPayment(subscription.nextPayment);
    const card = cards.find((c) => c.id === subscription.cardId);

    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {subscription.logoUrl ? (
              <ImageWithFallback
                src={subscription.logoUrl}
                alt={`${subscription.name} logo`}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold truncate">{subscription.name}</h3>
                  <p className="text-sm text-muted-foreground">{subscription.category}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge
                      variant={
                        subscription.status === "active"
                          ? "default"
                          : subscription.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {subscription.status}
                    </Badge>
                    {card && (
                      <Badge variant="outline" className="text-xs">
                        {card.nickname}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={`text-xs flex items-center gap-1 ${
                        subscription.linkedCard
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                      }`}
                    >
                      <CreditCard className="w-3 h-3" />
                      {subscription.linkedCard ? "Card" : "No Card"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs flex items-center gap-1 ${
                        subscription.automationEnabled
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                          : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      {subscription.automationEnabled ? "Auto" : "Manual"}
                    </Badge>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="font-semibold">{formatCurrency(subscription.price)}</div>
                  <div className="text-sm text-muted-foreground">{subscription.frequency}</div>
                  {subscription.nextPayment && subscription.status === "active" && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {daysUntil !== null && daysUntil <= 7 && (
                        <span className={daysUntil <= 3 ? "text-red-600" : "text-orange-600"}>
                          Due{" "}
                          {daysUntil === 0
                            ? "today"
                            : daysUntil === 1
                              ? "tomorrow"
                              : `in ${daysUntil} days`}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(subscription)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {subscription.status === "active" && (
                      <DropdownMenuItem onClick={() => onCancel(subscription.id)}>
                        <Pause className="w-4 h-4 mr-2" />
                        Cancel
                      </DropdownMenuItem>
                    )}
                    {subscription.status === "cancelled" && (
                      <DropdownMenuItem onClick={() => onReactivate(subscription.id)}>
                        <Play className="w-4 h-4 mr-2" />
                        Reactivate
                      </DropdownMenuItem>
                    )}
                    {subscription.status === "watchlist" && (
                      <DropdownMenuItem onClick={() => onActivateFromWatchlist(subscription.id)}>
                        <Star className="w-4 h-4 mr-2" />
                        Activate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(subscription.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Filter controls
  const FilterControls = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Category</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Card Status
        </label>
        <Select value={selectedCardStatus} onValueChange={setSelectedCardStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cards</SelectItem>
            <SelectItem value="linked">Card Linked</SelectItem>
            <SelectItem value="not-linked">No Card Linked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Automation Status
        </label>
        <Select value={selectedAutomationStatus} onValueChange={setSelectedAutomationStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Automations</SelectItem>
            <SelectItem value="enabled">Automation Enabled</SelectItem>
            <SelectItem value="disabled">Manual Management</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Sort By</label>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="cost">Cost</SelectItem>
            <SelectItem value="nextPayment">Next Payment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Order</label>
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">Subscriptions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all your subscription services
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onAddToWatchlist} variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            {isMobile ? "" : "Watchlist"}
          </Button>
          <Button onClick={onAddNew} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            {isMobile ? "" : "Add Subscription"}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats.totalMonthly)}
            </div>
            <div className="text-sm text-muted-foreground">Monthly</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.upcoming}</div>
            <div className="text-sm text-muted-foreground">Due Soon</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.watchlist}</div>
            <div className="text-sm text-muted-foreground">Watchlist</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-emerald-600">
              <CreditCard className="w-5 h-5" />
              {stats.cardsLinked}
            </div>
            <div className="text-sm text-muted-foreground">Cards Linked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600">
              <Zap className="w-5 h-5" />
              {stats.automationEnabled}
            </div>
            <div className="text-sm text-muted-foreground">Automated</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground mr-2">Quick Filters:</span>
        <Button
          variant={selectedCardStatus === "not-linked" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setSelectedCardStatus(selectedCardStatus === "not-linked" ? "all" : "not-linked");
            setCurrentTab("active");
          }}
          className="h-7 text-xs"
        >
          <CreditCard className="w-3 h-3 mr-1" />
          No Cards
        </Button>
        <Button
          variant={selectedAutomationStatus === "disabled" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setSelectedAutomationStatus(
              selectedAutomationStatus === "disabled" ? "all" : "disabled"
            );
            setCurrentTab("active");
          }}
          className="h-7 text-xs"
        >
          <Zap className="w-3 h-3 mr-1" />
          Manual Only
        </Button>
        <Button
          variant={
            selectedCardStatus === "linked" && selectedAutomationStatus === "enabled"
              ? "default"
              : "outline"
          }
          size="sm"
          onClick={() => {
            if (selectedCardStatus === "linked" && selectedAutomationStatus === "enabled") {
              setSelectedCardStatus("all");
              setSelectedAutomationStatus("all");
            } else {
              setSelectedCardStatus("linked");
              setSelectedAutomationStatus("enabled");
              setCurrentTab("active");
            }
          }}
          className="h-7 text-xs"
        >
          <div className="flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            <Zap className="w-3 h-3" />
          </div>
          Fully Automated
        </Button>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as any)}
            className="hidden sm:block"
          >
            <TabsList>
              <TabsTrigger value="grid" className="flex items-center gap-1">
                <Grid3X3 className="w-3 h-3" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-1">
                <List className="w-3 h-3" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filter Indicators and Quick Reset */}
          {(selectedCategory !== "all" ||
            selectedCardStatus !== "all" ||
            selectedAutomationStatus !== "all") && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedCardStatus("all");
                  setSelectedAutomationStatus("all");
                }}
                className="text-xs h-7 px-2"
              >
                Clear Filters
              </Button>
              <div className="text-xs text-muted-foreground">
                {[
                  selectedCategory !== "all" && `Cat: ${selectedCategory}`,
                  selectedCardStatus !== "all" &&
                    `Card: ${selectedCardStatus === "linked" ? "Linked" : "Not Linked"}`,
                  selectedAutomationStatus !== "all" &&
                    `Auto: ${selectedAutomationStatus === "enabled" ? "On" : "Off"}`,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </div>
            </div>
          )}

          {/* Mobile Filters */}
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={
                  selectedCategory !== "all" ||
                  selectedCardStatus !== "all" ||
                  selectedAutomationStatus !== "all"
                    ? "border-primary bg-primary/5"
                    : ""
                }
              >
                <Filter className="w-4 h-4" />
                {!isMobile && <span className="ml-1">Filters</span>}
                {(selectedCategory !== "all" ||
                  selectedCardStatus !== "all" ||
                  selectedAutomationStatus !== "all") && (
                  <div className="w-2 h-2 bg-primary rounded-full ml-1" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Filter & Sort</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterControls />
                {isMobile && (
                  <div className="mt-6">
                    <label className="text-sm font-medium mb-2 block">View Mode</label>
                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="grid">Grid</TabsTrigger>
                        <TabsTrigger value="list">List</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Play className="w-3 h-3" />
            Active ({stats.active})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <Pause className="w-3 h-3" />
            Cancelled ({stats.cancelled})
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="flex items-center gap-2">
            <Eye className="w-3 h-3" />
            Watchlist ({stats.watchlist})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="mt-6">
          {filteredSubscriptions.length > 0 ? (
            viewMode === "grid" ? (
              <div
                className={`grid gap-4 ${
                  isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {filteredSubscriptions.map((subscription) => (
                  <SubscriptionCard key={subscription.id} subscription={subscription} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSubscriptions.map((subscription) => (
                  <SubscriptionListItem key={subscription.id} subscription={subscription} />
                ))}
              </div>
            )
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No subscriptions found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ||
                  selectedCategory !== "all" ||
                  selectedCardStatus !== "all" ||
                  selectedAutomationStatus !== "all" ? (
                    <>
                      Try adjusting your search or filters.
                      {(selectedCardStatus !== "all" || selectedAutomationStatus !== "all") && (
                        <span className="block mt-2 text-sm">
                          Active filters:{" "}
                          {[
                            selectedCategory !== "all" && `Category: ${selectedCategory}`,
                            selectedCardStatus !== "all" &&
                              `Card: ${selectedCardStatus === "linked" ? "Linked" : "Not Linked"}`,
                            selectedAutomationStatus !== "all" &&
                              `Automation: ${selectedAutomationStatus === "enabled" ? "Enabled" : "Disabled"}`,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </span>
                      )}
                    </>
                  ) : (
                    `No ${currentTab} subscriptions yet.`
                  )}
                </p>
                {searchTerm ||
                selectedCategory !== "all" ||
                selectedCardStatus !== "all" ||
                selectedAutomationStatus !== "all" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setSelectedCardStatus("all");
                      setSelectedAutomationStatus("all");
                    }}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </Button>
                ) : (
                  <Button onClick={currentTab === "watchlist" ? onAddToWatchlist : onAddNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    {currentTab === "watchlist" ? "Add to Watchlist" : "Add Subscription"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
