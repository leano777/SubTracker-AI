import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Building,
  User,
  ExternalLink,
  Eye,
  Plus,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Subscription } from "../types/subscription";

interface WatchlistCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onViewDetails: (subscription: Subscription) => void;
  onActivate: (subscription: Subscription) => void;
}

export function WatchlistCard({
  subscription,
  onEdit,
  onDelete,
  onViewDetails,
  onActivate,
}: WatchlistCardProps) {
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

  const getBillingCycleText = (cycle: string) => {
    switch (cycle) {
      case "monthly":
        return "Monthly";
      case "quarterly":
        return "Quarterly";
      case "yearly":
        return "Yearly";
      default:
        return cycle;
    }
  };

  const getTypeIcon = () => {
    return subscription.subscriptionType === "business" ? (
      <Building className="w-3 h-3" />
    ) : (
      <User className="w-3 h-3" />
    );
  };

  const getTypeColor = () => {
    return subscription.subscriptionType === "business"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  };

  const getPriorityInfo = () => {
    switch (subscription.priority) {
      case "high":
        return {
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          text: "High Interest",
        };
      case "medium":
        return {
          color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          text: "Medium Interest",
        };
      case "low":
        return {
          color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          text: "Low Interest",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          text: "Not Set",
        };
    }
  };

  const handleBillingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (subscription.billingUrl) {
      window.open(subscription.billingUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleActivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onActivate(subscription);
  };

  const priorityInfo = getPriorityInfo();

  return (
    <Card
      className="relative cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-muted-foreground/30"
      onClick={() => onViewDetails(subscription)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
            <Star className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="font-medium">{subscription.name}</h3>
            <p className="text-sm text-muted-foreground">{subscription.category}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleActivate}>
              <Plus className="w-4 h-4 mr-2" />
              Start Subscription
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(subscription);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {subscription.billingUrl && (
              <DropdownMenuItem onClick={handleBillingClick}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Website
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(subscription);
              }}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(subscription.id);
              }}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">
                {subscription.planType === "free" ? "Free" : formatCurrency(subscription.cost)}
              </span>
              {subscription.planType === "trial" && (
                <span className="text-sm text-muted-foreground">after trial</span>
              )}
            </div>
            {subscription.planType !== "free" && (
              <Badge variant="outline">{getBillingCycleText(subscription.billingCycle)}</Badge>
            )}
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4" />
            <span>Added to watchlist</span>
            {subscription.dateAdded && <span>on {formatDate(subscription.dateAdded)}</span>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <Badge
                variant="outline"
                className="border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300"
              >
                Watchlist
              </Badge>

              <Badge className={`${priorityInfo.color} flex items-center space-x-1`}>
                <span className="text-xs">{priorityInfo.text}</span>
              </Badge>

              <Badge className={`${getTypeColor()} flex items-center space-x-1`}>
                {getTypeIcon()}
                <span className="capitalize text-xs">{subscription.subscriptionType}</span>
              </Badge>
            </div>

            <Button size="sm" onClick={handleActivate} className="text-xs h-7">
              <Plus className="w-3 h-3 mr-1" />
              Start
            </Button>
          </div>

          {/* Tags */}
          {subscription.tags && subscription.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {subscription.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {subscription.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{subscription.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Watchlist Notes Preview */}
          {subscription.watchlistNotes && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              <p className="line-clamp-2">{subscription.watchlistNotes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
