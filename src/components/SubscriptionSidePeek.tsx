import {
  X,
  Calendar,
  DollarSign,
  CreditCard,
  Globe,
  Edit3,
  Trash2,
  RotateCcw,
  Play,
  AlertCircle,
  Eye,
  Clock,
  Tag,
} from "lucide-react";
import { useState, useEffect } from "react";

import type { FullSubscription, FullPaymentCard } from "../types/subscription";
import { formatCurrency } from "../utils/helpers";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

interface SubscriptionSidePeekProps {
  subscription: FullSubscription | null;
  cards: FullPaymentCard[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (subscription: FullSubscription) => void;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
  onReactivate: (id: string) => void;
  onActivateFromWatchlist: (id: string) => void;
}

export const SubscriptionSidePeek = ({
  subscription,
  cards,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onCancel,
  onReactivate,
  onActivateFromWatchlist,
}: SubscriptionSidePeekProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Detect dark mode
  const isDarkMode = document.documentElement.classList.contains("dark");

  // Glassmorphic styles
  const glassStyles = {
    backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.95)" : "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: isDarkMode ? "1px solid rgba(75, 85, 99, 0.3)" : "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: isDarkMode
      ? "-8px 0 32px 0 rgba(0, 0, 0, 0.8)"
      : "-8px 0 32px 0 rgba(31, 38, 135, 0.4)",
  };

  const cardStyles = {
    backgroundColor: isDarkMode ? "rgba(31, 41, 55, 0.6)" : "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: isDarkMode ? "1px solid rgba(75, 85, 99, 0.2)" : "1px solid rgba(255, 255, 255, 0.2)",
  };

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isVisible || !subscription) return null;

  const associatedCard = cards.find((card) => card.id === subscription.paymentCard);

  const getStatusIcon = () => {
    switch (subscription.status) {
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "watchlist":
        return <Eye className="w-4 h-4 text-yellow-500" />;
      default:
        return <Play className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = () => {
    switch (subscription.status) {
      case "cancelled":
        return "destructive";
      case "watchlist":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getBillingCycleLabel = (cycle: string) => {
    const labels: Record<string, string> = {
      monthly: "Monthly",
      quarterly: "Quarterly",
      yearly: "Yearly",
      variable: "Variable",
    };
    return labels[cycle] || cycle;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Side Peek Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={glassStyles}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{
              borderColor: isDarkMode ? "rgba(75, 85, 99, 0.2)" : "rgba(255, 255, 255, 0.2)",
            }}
          >
            <div className="flex items-center gap-3">
              {subscription.logoUrl ? (
                <ImageWithFallback
                  src={subscription.logoUrl}
                  alt={`${subscription.name} logo`}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h2 className={`font-semibold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                  {subscription.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon()}
                  <Badge variant={getStatusColor()} className="text-xs">
                    {subscription.status}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`h-8 w-8 p-0 rounded-lg ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Cost Information */}
            <Card style={cardStyles} className="border-0">
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                  Cost Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Amount
                  </span>
                  <span
                    className={`text-xl font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                  >
                    {formatCurrency(subscription.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Billing Cycle
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {getBillingCycleLabel(subscription.frequency)}
                  </Badge>
                </div>
                {subscription.nextPayment && (
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Next Payment
                    </span>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span
                        className={`text-sm font-medium ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                      >
                        {formatDate(subscription.nextPayment)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details */}
            <Card style={cardStyles} className="border-0">
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"} uppercase tracking-wide`}
                    >
                      Category
                    </label>
                    <p className={`mt-1 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                      {subscription.category}
                    </p>
                  </div>
                  <div>
                    <label
                      className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"} uppercase tracking-wide`}
                    >
                      Type
                    </label>
                    <p className={`mt-1 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                      {subscription.businessExpense ? "Business" : "Personal"}
                    </p>
                  </div>
                </div>

                {subscription.priority && (
                  <div>
                    <label
                      className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"} uppercase tracking-wide`}
                    >
                      Priority
                    </label>
                    <div className="mt-1">
                      <Badge className={`text-xs ${getPriorityColor(subscription.priority)}`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {subscription.priority}
                      </Badge>
                    </div>
                  </div>
                )}

                {subscription.dateAdded && (
                  <div>
                    <label
                      className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"} uppercase tracking-wide`}
                    >
                      Date Added
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                        {formatDate(subscription.dateAdded)}
                      </span>
                    </div>
                  </div>
                )}

                {subscription.cancelledDate && (
                  <div>
                    <label className={`text-xs font-medium text-red-500 uppercase tracking-wide`}>
                      Date Cancelled
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className={`text-sm ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                        {formatDate(subscription.cancelledDate)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {subscription.description && (
              <Card style={cardStyles} className="border-0">
                <CardHeader className="pb-3">
                  <CardTitle
                    className={`text-lg ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                  >
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    {subscription.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Watchlist Notes */}
            {subscription.status === "watchlist" && subscription.notes && (
              <Card style={cardStyles} className="border-0">
                <CardHeader className="pb-3">
                  <CardTitle
                    className={`text-lg ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                  >
                    Watchlist Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                  >
                    {subscription.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Payment Card */}
            {associatedCard && (
              <Card style={cardStyles} className="border-0">
                <CardHeader className="pb-3">
                  <CardTitle
                    className={`text-lg ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                  >
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-6 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: associatedCard.color }}
                    >
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p
                        className={`font-medium ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                      >
                        {associatedCard.nickname}
                      </p>
                      <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        ****{associatedCard.lastFourDigits} • {associatedCard.provider}
                      </p>
                    </div>
                    {associatedCard.isDefault && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        Default
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Website Link */}
            {subscription.website && (
              <Card style={cardStyles} className="border-0">
                <CardContent className="pt-4">
                  <a
                    href={subscription.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100/50"
                    }`}
                  >
                    <Globe className="w-5 h-5 text-blue-500" />
                    <div>
                      <p
                        className={`font-medium ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                      >
                        Visit Website
                      </p>
                      <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Open billing portal
                      </p>
                    </div>
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Variable Pricing */}
            {subscription.variablePricing?.upcomingChanges &&
              subscription.variablePricing.upcomingChanges.length > 0 && (
                <Card style={cardStyles} className="border-0">
                  <CardHeader className="pb-3">
                    <CardTitle
                      className={`text-lg ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                    >
                      Upcoming Price Changes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {subscription.variablePricing.upcomingChanges.map((change, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20"
                      >
                        <div>
                          <p
                            className={`font-medium ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                          >
                            {formatDate(change.date)}
                          </p>
                          {change.description && (
                            <p
                              className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                              {change.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                          >
                            {formatCurrency(change.cost)}
                          </p>
                          <p
                            className={`text-xs ${
                              change.cost > subscription.price
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            {change.cost > subscription.price ? "+" : ""}
                            {formatCurrency(change.cost - subscription.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Action Buttons */}
          <div
            className="p-6 border-t space-y-3"
            style={{
              borderColor: isDarkMode ? "rgba(75, 85, 99, 0.2)" : "rgba(255, 255, 255, 0.2)",
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => onEdit(subscription)}
                variant="outline"
                className={`${
                  isDarkMode
                    ? "bg-gray-700/50 border-gray-600 text-gray-100 hover:bg-gray-600"
                    : "bg-white/50 border-gray-200 text-gray-900 hover:bg-gray-50"
                } backdrop-blur-sm border transition-colors`}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>

              {subscription.status === "active" && (
                <Button
                  onClick={() => onCancel(subscription.id)}
                  variant="outline"
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}

              {subscription.status === "cancelled" && (
                <Button
                  onClick={() => onReactivate(subscription.id)}
                  variant="outline"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Reactivate
                </Button>
              )}

              {subscription.status === "watchlist" && (
                <Button
                  onClick={() => onActivateFromWatchlist(subscription.id)}
                  variant="outline"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Activate
                </Button>
              )}
            </div>

            <Button
              onClick={() => onDelete(subscription.id)}
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Subscription
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
