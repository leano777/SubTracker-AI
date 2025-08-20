import { useState } from "react";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  ChevronRight,
  Bell,
  BellOff
} from "lucide-react";
import { cn } from "../utils/cn";
import { formatCurrency } from "../utils/helpers";
import { format } from "date-fns";
import type { FullSubscription } from "../types/subscription";

interface MobileSubscriptionCardProps {
  subscription: FullSubscription;
  onEdit?: (subscription: FullSubscription) => void;
  onDelete?: (id: string) => void;
  onToggleNotification?: (id: string) => void;
  onClick?: (subscription: FullSubscription) => void;
  className?: string;
}

export const MobileSubscriptionCard = ({
  subscription,
  onEdit,
  onDelete,
  onToggleNotification,
  onClick,
  className
}: MobileSubscriptionCardProps) => {
  const [showActions, setShowActions] = useState(false);
  
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      entertainment: "bg-purple-500",
      productivity: "bg-blue-500",
      utilities: "bg-green-500",
      finance: "bg-yellow-500",
      health: "bg-pink-500",
      education: "bg-indigo-500",
      other: "bg-gray-500"
    };
    return colors[category.toLowerCase()] || colors.other;
  };

  const getDaysUntilPayment = () => {
    if (!subscription.nextPayment) return null;
    const today = new Date();
    const nextPayment = new Date(subscription.nextPayment);
    const diffTime = nextPayment.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilPayment();
  const isUpcoming = daysUntil !== null && daysUntil <= 7 && daysUntil >= 0;
  const isOverdue = daysUntil !== null && daysUntil < 0;

  return (
    <>
      <div
        className={cn(
          "relative bg-white dark:bg-gray-800 rounded-xl shadow-sm",
          "border border-gray-200 dark:border-gray-700",
          "transition-all duration-200 active:scale-98",
          isUpcoming && "ring-2 ring-yellow-500 ring-opacity-50",
          isOverdue && "ring-2 ring-red-500 ring-opacity-50",
          className
        )}
      >
        {/* Main Card Content */}
        <div
          onClick={() => onClick?.(subscription)}
          className="p-4 cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Category Indicator */}
              <div className={cn(
                "w-2 h-2 rounded-full",
                getCategoryColor(subscription.category || "other")
              )} />
              
              {/* Name and Category */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {subscription.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {subscription.category || "Uncategorized"}
                </p>
              </div>
            </div>

            {/* Actions Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Cost and Billing */}
          <div className="flex items-end justify-between mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(subscription.cost)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                /{subscription.billingCycle || "month"}
              </span>
            </div>
            
            {/* Status Badge */}
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              subscription.status === "active" 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
            )}>
              {subscription.status}
            </span>
          </div>

          {/* Next Payment */}
          {subscription.nextPayment && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Next payment</span>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(subscription.nextPayment), "MMM d, yyyy")}
                </div>
                {daysUntil !== null && (
                  <div className={cn(
                    "text-xs",
                    isOverdue ? "text-red-500" : 
                    isUpcoming ? "text-yellow-600 dark:text-yellow-400" : 
                    "text-gray-500 dark:text-gray-400"
                  )}>
                    {isOverdue ? `${Math.abs(daysUntil)} days overdue` :
                     daysUntil === 0 ? "Due today" :
                     daysUntil === 1 ? "Due tomorrow" :
                     `In ${daysUntil} days`}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions (shown when actions button clicked) */}
        {showActions && (
          <div className="absolute top-12 right-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(subscription);
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleNotification?.(subscription.id);
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              {subscription.notificationsEnabled ? (
                <>
                  <BellOff className="w-4 h-4" />
                  Disable Alerts
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Enable Alerts
                </>
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(subscription.id);
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Click outside to close actions */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}

      <style>{`
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
    </>
  );
};