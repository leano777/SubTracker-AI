import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Eye,
  MoreHorizontal,
  Calendar,
  CreditCard,
  DollarSign,
  Zap,
  AlertTriangle,
  Star,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type { FullSubscription, PaymentCard } from "../types/subscription";
import { formatCurrency } from "../utils/helpers";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { SubscriptionDetailPanel } from "./SubscriptionDetailPanel";

interface SubscriptionListEnhancedProps {
  subscriptions: FullSubscription[];
  cards: PaymentCard[];
  viewMode: "compact" | "expanded";
  selectedSubscription: FullSubscription | null;
  onSubscriptionSelect: (subscription: FullSubscription | null) => void;
  onEdit: (subscription: FullSubscription) => void;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
  onReactivate: (id: string) => void;
  onActivateFromWatchlist: (id: string) => void;
}

export const SubscriptionListEnhanced = ({
  subscriptions,
  cards,
  viewMode,
  selectedSubscription,
  onSubscriptionSelect,
  onEdit,
  onDelete,
  onCancel,
  onReactivate,
  onActivateFromWatchlist,
}: SubscriptionListEnhancedProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getDaysUntilPayment = (nextPayment: string | undefined) => {
    if (!nextPayment) return null;
    const paymentDate = new Date(nextPayment);
    const now = new Date();
    const daysUntil = Math.ceil((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700";
      case "watchlist":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700";
    }
  };

  const CompactRow = ({ subscription }: { subscription: FullSubscription }) => {
    const daysUntil = getDaysUntilPayment(subscription.nextPayment);
    const card = cards.find((c) => c.id === subscription.cardId);
    const isExpanded = expandedRows.has(subscription.id);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
      >
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleRowExpansion(subscription.id)}
            className="mr-2 h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>

          {/* Logo/Icon */}
          <div className="mr-3 flex-shrink-0">
            {subscription.logoUrl ? (
              <ImageWithFallback
                src={subscription.logoUrl}
                alt={`${subscription.name} logo`}
                className="w-8 h-8 rounded object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>

          {/* Name and Category */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{subscription.name}</h4>
              {subscription.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
            </div>
            <p className="text-xs text-muted-foreground">{subscription.category}</p>
          </div>

          {/* Status Badge */}
          <Badge className={`text-xs mr-3 ${getStatusColor(subscription.status)}`}>
            {subscription.status}
          </Badge>

          {/* Cost */}
          <div className="text-right mr-3 min-w-0">
            <div className="font-semibold text-sm">{formatCurrency(subscription.cost)}</div>
            <div className="text-xs text-muted-foreground">{subscription.billingCycle}</div>
          </div>

          {/* Next Payment */}
          {subscription.nextPayment && subscription.status === "active" && (
            <div className="text-right mr-3 min-w-0">
              <div className="text-xs">
                {daysUntil !== null && (
                  <span
                    className={
                      daysUntil <= 3
                        ? "text-red-600 font-medium"
                        : daysUntil <= 7
                          ? "text-orange-600"
                          : "text-muted-foreground"
                    }
                  >
                    {daysUntil === 0
                      ? "Due today"
                      : daysUntil === 1
                        ? "Tomorrow"
                        : `${daysUntil}d`}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick Indicators */}
          <div className="flex items-center gap-1 mr-3">
            {card && (
              <CreditCard className="w-3 h-3 text-green-600" />
            )}
            {subscription.automationEnabled && (
              <Zap className="w-3 h-3 text-blue-600" />
            )}
            {daysUntil !== null && daysUntil <= 3 && subscription.status === "active" && (
              <AlertTriangle className="w-3 h-3 text-red-500" />
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSubscriptionSelect(subscription)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(subscription)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30"
            >
              <div className="p-4 ml-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Type</label>
                    <div className="mt-1">{subscription.subscriptionType || "Personal"}</div>
                  </div>
                  {card && (
                    <div>
                      <label className="text-xs text-muted-foreground font-medium">Payment Card</label>
                      <div className="mt-1 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {card.nickname || `****${card.lastFour}`}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Next Payment</label>
                    <div className="mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {subscription.nextPayment ? 
                        new Date(subscription.nextPayment).toLocaleDateString() : 
                        "Not set"
                      }
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Added</label>
                    <div className="mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(subscription.dateAdded).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {subscription.description && (
                  <div className="mt-4">
                    <label className="text-xs text-muted-foreground font-medium">Description</label>
                    <div className="mt-1 text-sm">{subscription.description}</div>
                  </div>
                )}

                {subscription.tags && subscription.tags.length > 0 && (
                  <div className="mt-4">
                    <label className="text-xs text-muted-foreground font-medium">Tags</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {subscription.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {subscription.billingUrl && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(subscription.billingUrl, "_blank")}
                      className="text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open Billing Page
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const ExpandedRow = ({ subscription }: { subscription: FullSubscription }) => {
    const daysUntil = getDaysUntilPayment(subscription.nextPayment);
    const card = cards.find((c) => c.id === subscription.cardId);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                {subscription.logoUrl ? (
                  <ImageWithFallback
                    src={subscription.logoUrl}
                    alt={`${subscription.name} logo`}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{subscription.name}</h3>
                      {subscription.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    </div>
                    <p className="text-muted-foreground">{subscription.category}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onSubscriptionSelect(subscription)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(subscription)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-muted-foreground font-medium">Cost</span>
                    </div>
                    <div className="font-semibold">{formatCurrency(subscription.cost)}</div>
                    <div className="text-xs text-muted-foreground">{subscription.billingCycle}</div>
                  </div>

                  {subscription.nextPayment && subscription.status === "active" && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-muted-foreground font-medium">Next Payment</span>
                      </div>
                      <div className="font-semibold">
                        {new Date(subscription.nextPayment).toLocaleDateString()}
                      </div>
                      {daysUntil !== null && (
                        <div
                          className={`text-xs ${
                            daysUntil <= 3
                              ? "text-red-600 font-medium"
                              : daysUntil <= 7
                                ? "text-orange-600"
                                : "text-muted-foreground"
                          }`}
                        >
                          {daysUntil === 0
                            ? "Due today"
                            : daysUntil === 1
                              ? "Due tomorrow"
                              : `Due in ${daysUntil} days`}
                        </div>
                      )}
                    </div>
                  )}

                  {card && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-muted-foreground font-medium">Payment Card</span>
                      </div>
                      <div className="font-semibold">{card.nickname || `****${card.lastFour}`}</div>
                      <div className="text-xs text-muted-foreground">{card.type?.toUpperCase()}</div>
                    </div>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      <span className="text-xs text-muted-foreground font-medium">Automation</span>
                    </div>
                    <div className="font-semibold">
                      {subscription.automationEnabled ? "Enabled" : "Manual"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {subscription.automationEnabled ? "Auto-managed" : "Manual management"}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {subscription.description && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="mt-1 text-sm">{subscription.description}</p>
                  </div>
                )}

                {/* Tags */}
                {subscription.tags && subscription.tags.length > 0 && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-muted-foreground">Tags</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {subscription.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSubscriptionSelect(subscription)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(subscription)}
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {subscription.billingUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(subscription.billingUrl, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Billing Page
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {subscriptions.map((subscription) =>
          viewMode === "compact" ? (
            <CompactRow key={subscription.id} subscription={subscription} />
          ) : (
            <ExpandedRow key={subscription.id} subscription={subscription} />
          )
        )}
      </AnimatePresence>

      {/* Detail Panel Sheet */}
      <Sheet
        open={!!selectedSubscription}
        onOpenChange={() => onSubscriptionSelect(null)}
      >
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedSubscription?.logoUrl ? (
                <ImageWithFallback
                  src={selectedSubscription.logoUrl}
                  alt={`${selectedSubscription.name} logo`}
                  className="w-6 h-6 rounded object-cover"
                />
              ) : (
                <DollarSign className="w-5 h-5" />
              )}
              {selectedSubscription?.name}
            </SheetTitle>
          </SheetHeader>
          {selectedSubscription && (
            <SubscriptionDetailPanel
              subscription={selectedSubscription}
              cards={cards}
              onEdit={onEdit}
              onDelete={onDelete}
              onCancel={onCancel}
              onReactivate={onReactivate}
              onActivateFromWatchlist={onActivateFromWatchlist}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
