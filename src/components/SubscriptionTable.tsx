import {
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  Calendar,
  TrendingUp,
  TrendingDown,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";

import type {
  FullSubscription as Subscription,
  FullPaymentCard as PaymentCard,
} from "../types/subscription";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onCancel?: (id: string) => void;
  onReactivate?: (id: string) => void;
  onViewDetails: (subscription: Subscription) => void;
  cards: PaymentCard[];
  showCancelledActions?: boolean;
}

export const SubscriptionTable = ({
  subscriptions,
  onEdit,
  onDelete,
  onCancel,
  onReactivate,
  onViewDetails,
  cards,
  showCancelledActions = false,
}: SubscriptionTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Get unique categories for filter
  const categories = Array.from(new Set(subscriptions.map((sub) => sub.category))).sort();

  // Apply filters and search
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "all" || subscription.category === categoryFilter;
    const matchesType = typeFilter === "all" || subscription.subscriptionType === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Sort subscriptions
  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "cost":
        return b.cost - a.cost;
      case "nextPayment":
        return new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime();
      case "category":
        return a.category.localeCompare(b.category);
      case "dateCancelled":
        if (showCancelledActions) {
          const aDate = a.dateCancelled || "";
          const bDate = b.dateCancelled || "";
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        }
        return 0;
      default:
        return 0;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getBillingCycleDisplay = (subscription: Subscription) => {
    if (subscription.billingCycle === "variable") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="cursor-help">
              Variable
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p>Current: {formatCurrency(subscription.cost)}</p>
              {subscription.variablePricing?.upcomingChanges?.map((change, index) => (
                <p key={index} className="text-xs">
                  {formatDate(change.date)}: {formatCurrency(parseFloat(change.cost))}
                  {change.description && (
                    <span className="block text-muted-foreground">{change.description}</span>
                  )}
                </p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Badge variant="outline">
        {subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}
      </Badge>
    );
  };

  const getCostDisplay = (subscription: Subscription) => {
    if (
      subscription.billingCycle === "variable" &&
      subscription.variablePricing?.upcomingChanges?.length
    ) {
      const nextChange = subscription.variablePricing.upcomingChanges
        .filter((change) => new Date(change.date) > new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

      if (nextChange) {
        const isIncrease = parseFloat(nextChange.cost) > subscription.cost;
        const Icon = isIncrease ? TrendingUp : TrendingDown;
        const colorClass = isIncrease ? "text-red-600" : "text-green-600";

        return (
          <div className="space-y-1">
            <div>{formatCurrency(subscription.cost)}</div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center space-x-1 text-xs ${colorClass} cursor-help`}>
                  <Icon className="w-3 h-3" />
                  <span>{formatCurrency(parseFloat(nextChange.cost))}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Changes to {formatCurrency(parseFloat(nextChange.cost))} on{" "}
                  {formatDate(nextChange.date)}
                </p>
                {nextChange.description && (
                  <p className="text-xs text-muted-foreground">{nextChange.description}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
        );
      }
    }

    return formatCurrency(subscription.cost);
  };

  const getPaymentCard = (cardId?: string) => {
    if (!cardId) return null;
    return cards.find((card) => card.id === cardId);
  };

  const totalMonthlyCost = subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((total, sub) => {
      let monthlyCost = 0;
      switch (sub.billingCycle) {
        case "monthly":
        case "variable":
          monthlyCost = sub.cost;
          break;
        case "quarterly":
          monthlyCost = sub.cost / 3;
          break;
        case "yearly":
          monthlyCost = sub.cost / 12;
          break;
      }
      return total + monthlyCost;
    }, 0);

  const getStatusBadge = (subscription: Subscription) => {
    switch (subscription.status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Active
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Cancelled
          </Badge>
        );
      case "watchlist":
        return <Badge variant="outline">Watchlist</Badge>;
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Summary Card */}
        {!showCancelledActions && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{subscriptions.length}</div>
                  <div className="text-sm text-muted-foreground">Active Subscriptions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(totalMonthlyCost)}</div>
                  <div className="text-sm text-muted-foreground">Monthly Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(totalMonthlyCost * 12)}</div>
                  <div className="text-sm text-muted-foreground">Annual Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {subscriptions.filter((sub) => sub.billingCycle === "variable").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Variable Pricing</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
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

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="cost">Cost</SelectItem>
              {!showCancelledActions && <SelectItem value="nextPayment">Next Payment</SelectItem>}
              {showCancelledActions && (
                <SelectItem value="dateCancelled">Date Cancelled</SelectItem>
              )}
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead className="hidden md:table-cell">Billing</TableHead>
                  {!showCancelledActions && (
                    <TableHead className="hidden lg:table-cell">Next Payment</TableHead>
                  )}
                  {showCancelledActions && (
                    <TableHead className="hidden lg:table-cell">Date Cancelled</TableHead>
                  )}
                  <TableHead className="hidden md:table-cell">Payment Card</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSubscriptions.map((subscription) => {
                  const card = getPaymentCard(subscription.cardId);
                  return (
                    <TableRow key={subscription.id} className="group">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {subscription.logoUrl && (
                            <img
                              src={subscription.logoUrl}
                              alt={`${subscription.name} logo`}
                              className="w-6 h-6 rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium">{subscription.name}</div>
                            {subscription.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {subscription.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{getStatusBadge(subscription)}</TableCell>

                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary">{subscription.category}</Badge>
                      </TableCell>

                      <TableCell>{getCostDisplay(subscription)}</TableCell>

                      <TableCell className="hidden md:table-cell">
                        {getBillingCycleDisplay(subscription)}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        {showCancelledActions ? (
                          subscription.dateCancelled && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{formatDate(subscription.dateCancelled)}</span>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{formatDate(subscription.nextPayment)}</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {card ? (
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: card.color }}
                            ></div>
                            <span className="text-sm">{card.nickname}</span>
                            <span className="text-xs text-muted-foreground">
                              ••••{card.lastFour}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No card set</span>
                        )}
                      </TableCell>

                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant={
                            subscription.subscriptionType === "business" ? "default" : "outline"
                          }
                        >
                          {subscription.subscriptionType}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(subscription)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {subscription.billingUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(subscription.billingUrl, "_blank")}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}

                          <Button variant="ghost" size="sm" onClick={() => onEdit(subscription)}>
                            <Edit className="w-4 h-4" />
                          </Button>

                          {showCancelledActions
                            ? onReactivate && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onReactivate(subscription.id)}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Reactivate subscription</p>
                                  </TooltipContent>
                                </Tooltip>
                              )
                            : onCancel &&
                              subscription.status === "active" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-orange-600 hover:text-orange-700"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to cancel "{subscription.name}"? This
                                        will mark it as cancelled and remove it from your active
                                        subscriptions. You can reactivate it later if needed.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Keep Active</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => onCancel(subscription.id)}
                                        className="bg-orange-600 hover:bg-orange-700"
                                      >
                                        Cancel Subscription
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to permanently delete "{subscription.name}"?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(subscription.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {sortedSubscriptions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter !== "all" || typeFilter !== "all"
                ? "No subscriptions match your current filters."
                : showCancelledActions
                  ? "No cancelled subscriptions found."
                  : "No active subscriptions found."}
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
