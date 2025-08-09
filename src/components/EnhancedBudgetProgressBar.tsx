import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Clock,
  DollarSign,
  Zap,
  ShieldAlert,
} from "lucide-react";
import { useMemo } from "react";

import { formatCurrency } from "../utils/helpers";
import { getTextColors } from "../utils/theme";

import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface BudgetData {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  category: string;
  color: string;
  priority: number;
  trend: "up" | "down" | "stable";
  trendPercentage: number;
  projectedSpend: number;
  daysRemaining: number;
  isOverBudget: boolean;
  warningThreshold: number; // Percentage (e.g., 80 for 80%)
  criticalThreshold: number; // Percentage (e.g., 95 for 95%)
}

interface EnhancedBudgetProgressBarProps {
  budgetData: BudgetData;
  showDetails?: boolean;
  showProjection?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact" | "detailed";
  isStealthOps?: boolean;
  isDarkMode?: boolean;
  className?: string;
  onBudgetClick?: (budgetId: string) => void;
}

export const EnhancedBudgetProgressBar = ({
  budgetData,
  showDetails = true,
  showProjection = true,
  size = "md",
  variant = "default",
  isStealthOps = false,
  isDarkMode = false,
  className = "",
  onBudgetClick,
}: EnhancedBudgetProgressBarProps) => {
  const textColors = getTextColors(isStealthOps, isDarkMode);

  // Calculate utilization percentage
  const utilizationPercentage = useMemo(() => {
    if (budgetData.allocated === 0) return 0;
    return (budgetData.spent / budgetData.allocated) * 100;
  }, [budgetData.allocated, budgetData.spent]);

  // Determine status and colors
  const budgetStatus = useMemo(() => {
    if (budgetData.isOverBudget || utilizationPercentage > budgetData.criticalThreshold) {
      return {
        level: "critical",
        color: isStealthOps ? "text-red-400" : "text-red-600",
        bgColor: isStealthOps ? "bg-red-400/10" : "bg-red-50",
        borderColor: isStealthOps ? "border-red-400" : "border-red-200",
        progressColor: "bg-red-500",
        icon: ShieldAlert,
        message: isStealthOps ? "[CRITICAL - OVER BUDGET]" : "Critical - Over Budget",
      };
    } else if (utilizationPercentage > budgetData.warningThreshold) {
      return {
        level: "warning",
        color: isStealthOps ? "text-orange-400" : "text-orange-600",
        bgColor: isStealthOps ? "bg-orange-400/10" : "bg-orange-50",
        borderColor: isStealthOps ? "border-orange-400" : "border-orange-200",
        progressColor: "bg-orange-500",
        icon: AlertTriangle,
        message: isStealthOps ? "[WARNING - APPROACHING LIMIT]" : "Warning - Approaching Limit",
      };
    } else {
      return {
        level: "healthy",
        color: isStealthOps ? "text-green-400" : "text-green-600",
        bgColor: isStealthOps ? "bg-green-400/10" : "bg-green-50",
        borderColor: isStealthOps ? "border-green-400" : "border-green-200",
        progressColor: "bg-green-500",
        icon: CheckCircle,
        message: isStealthOps ? "[HEALTHY - WITHIN BUDGET]" : "Healthy - Within Budget",
      };
    }
  }, [utilizationPercentage, budgetData, isStealthOps]);

  // Get trend icon
  const getTrendIcon = () => {
    switch (budgetData.trend) {
      case "up":
        return TrendingUp;
      case "down":
        return TrendingDown;
      default:
        return Target;
    }
  };

  const getTrendColor = () => {
    if (budgetData.trend === "up") {
      return isStealthOps ? "text-red-400" : "text-red-600";
    } else if (budgetData.trend === "down") {
      return isStealthOps ? "text-green-400" : "text-green-600";
    }
    return textColors.muted;
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      height: "h-2",
      padding: "p-2",
      textSize: "text-xs",
      iconSize: "w-3 h-3",
    },
    md: {
      height: "h-3",
      padding: "p-3",
      textSize: "text-sm",
      iconSize: "w-4 h-4",
    },
    lg: {
      height: "h-4",
      padding: "p-4",
      textSize: "text-base",
      iconSize: "w-5 h-5",
    },
  };

  const config = sizeConfig[size];
  const StatusIcon = budgetStatus.icon;
  const TrendIcon = getTrendIcon();

  // Compact variant
  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`relative cursor-pointer ${className}`}
              onClick={() => onBudgetClick?.(budgetData.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`font-medium ${config.textSize} ${textColors.primary} ${
                    isStealthOps ? "font-mono tracking-wide" : ""
                  }`}
                >
                  {isStealthOps ? `[${budgetData.name.toUpperCase()}]` : budgetData.name}
                </span>
                <div className="flex items-center space-x-1">
                  <StatusIcon className={`${config.iconSize} ${budgetStatus.color}`} />
                  <span className={`${config.textSize} font-semibold ${textColors.primary}`}>
                    {utilizationPercentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <Progress
                value={Math.min(utilizationPercentage, 100)}
                className={`${config.height} ${isStealthOps ? "tactical-surface" : ""}`}
                style={{
                  backgroundColor: isStealthOps ? "#1a1a1a" : undefined,
                }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <div className="font-semibold">{budgetData.name}</div>
              <div>Spent: {formatCurrency(budgetData.spent)} of {formatCurrency(budgetData.allocated)}</div>
              <div>Remaining: {formatCurrency(budgetData.remaining)}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed variant
  if (variant === "detailed") {
    return (
      <div
        className={`border ${isStealthOps ? "tactical-surface border-gray-600" : "rounded-lg"} ${config.padding} ${
          budgetStatus.bgColor
        } ${budgetStatus.borderColor} ${className}`}
        style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 ${isStealthOps ? "" : "rounded-full"}`}
              style={{
                backgroundColor: budgetData.color,
                borderRadius: isStealthOps ? "0.125rem" : undefined,
              }}
            />
            <h4
              className={`font-semibold ${config.textSize} ${textColors.primary} ${
                isStealthOps ? "font-mono tracking-wide" : ""
              }`}
            >
              {isStealthOps ? `[${budgetData.name.toUpperCase()}]` : budgetData.name}
            </h4>
            <Badge
              variant="secondary"
              className={`text-xs ${isStealthOps ? "font-mono tracking-wide tactical-surface" : ""}`}
              style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
            >
              {isStealthOps ? `[${budgetData.category.toUpperCase()}]` : budgetData.category}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              className={`text-xs ${budgetStatus.color} ${budgetStatus.bgColor} ${budgetStatus.borderColor} ${
                isStealthOps ? "font-mono tracking-wide tactical-surface border" : ""
              }`}
              style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
            >
              <StatusIcon className={`${config.iconSize} mr-1`} />
              {budgetStatus.message}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className={`${config.textSize} ${textColors.secondary}`}>
              {isStealthOps ? "[UTILIZATION]" : "Utilization"}
            </span>
            <span className={`${config.textSize} font-semibold ${textColors.primary}`}>
              {utilizationPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={Math.min(utilizationPercentage, 100)}
            className={`${config.height} ${isStealthOps ? "tactical-surface" : ""}`}
            style={{
              backgroundColor: isStealthOps ? "#1a1a1a" : undefined,
            }}
          />
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div>
            <div className={`${config.textSize} ${textColors.muted} mb-1`}>
              {isStealthOps ? "[ALLOCATED]" : "Allocated"}
            </div>
            <div
              className={`font-semibold ${textColors.primary} ${
                isStealthOps ? "font-mono tracking-wide" : ""
              }`}
            >
              {formatCurrency(budgetData.allocated)}
            </div>
          </div>
          <div>
            <div className={`${config.textSize} ${textColors.muted} mb-1`}>
              {isStealthOps ? "[SPENT]" : "Spent"}
            </div>
            <div
              className={`font-semibold ${textColors.primary} ${
                isStealthOps ? "font-mono tracking-wide" : ""
              }`}
            >
              {formatCurrency(budgetData.spent)}
            </div>
          </div>
          <div>
            <div className={`${config.textSize} ${textColors.muted} mb-1`}>
              {isStealthOps ? "[REMAINING]" : "Remaining"}
            </div>
            <div
              className={`font-semibold ${
                budgetData.remaining < 0
                  ? isStealthOps
                    ? "text-red-400"
                    : "text-red-600"
                  : textColors.primary
              } ${isStealthOps ? "font-mono tracking-wide" : ""}`}
            >
              {formatCurrency(budgetData.remaining)}
            </div>
          </div>
        </div>

        {/* Trend and Projection */}
        {(showDetails || showProjection) && (
          <div className="flex items-center justify-between">
            {showDetails && (
              <div className="flex items-center space-x-2">
                <TrendIcon className={`${config.iconSize} ${getTrendColor()}`} />
                <span
                  className={`${config.textSize} ${getTrendColor()} ${
                    isStealthOps ? "font-mono tracking-wide" : ""
                  }`}
                >
                  {budgetData.trendPercentage > 0 ? "+" : ""}
                  {budgetData.trendPercentage.toFixed(1)}%
                </span>
                <span className={`${config.textSize} ${textColors.muted}`}>
                  {isStealthOps ? "[TREND]" : "trend"}
                </span>
              </div>
            )}

            {showProjection && (
              <div className="flex items-center space-x-2">
                <Clock className={`${config.iconSize} ${textColors.muted}`} />
                <span
                  className={`${config.textSize} ${textColors.muted} ${
                    isStealthOps ? "font-mono tracking-wide" : ""
                  }`}
                >
                  {isStealthOps ? `[${budgetData.daysRemaining} DAYS LEFT]` : `${budgetData.daysRemaining} days left`}
                </span>
              </div>
            )}
          </div>
        )}

        {showProjection && budgetData.projectedSpend > budgetData.allocated && (
          <div
            className={`mt-3 p-2 border ${
              isStealthOps
                ? "tactical-surface border-orange-400"
                : "bg-orange-50 border-orange-200 rounded-md"
            }`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle
                className={`${config.iconSize} ${isStealthOps ? "text-orange-400" : "text-orange-600"}`}
              />
              <span
                className={`${config.textSize} ${
                  isStealthOps
                    ? "text-orange-300 font-mono tracking-wide"
                    : "text-orange-700"
                }`}
              >
                {isStealthOps ? "[PROJECTED OVERSPEND: " : "Projected overspend: "}
                {formatCurrency(budgetData.projectedSpend - budgetData.allocated)}
                {isStealthOps ? "]" : ""}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`${config.padding} cursor-pointer transition-all duration-200 hover:shadow-sm ${
        isStealthOps ? "tactical-surface" : "border rounded-lg"
      } ${className}`}
      onClick={() => onBudgetClick?.(budgetData.id)}
      style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 ${isStealthOps ? "" : "rounded-full"}`}
            style={{
              backgroundColor: budgetData.color,
              borderRadius: isStealthOps ? "0.125rem" : undefined,
            }}
          />
          <span
            className={`font-medium ${config.textSize} ${textColors.primary} ${
              isStealthOps ? "font-mono tracking-wide" : ""
            }`}
          >
            {isStealthOps ? `[${budgetData.name.toUpperCase()}]` : budgetData.name}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <StatusIcon className={`${config.iconSize} ${budgetStatus.color}`} />
          <span className={`${config.textSize} font-semibold ${textColors.primary}`}>
            {utilizationPercentage.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <Progress
          value={Math.min(utilizationPercentage, 100)}
          className={`${config.height} ${isStealthOps ? "tactical-surface" : ""}`}
          style={{
            backgroundColor: isStealthOps ? "#1a1a1a" : undefined,
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span
          className={`${config.textSize} ${textColors.muted} ${
            isStealthOps ? "font-mono tracking-wide" : ""
          }`}
        >
          {formatCurrency(budgetData.spent)} {isStealthOps ? "[OF]" : "of"} {formatCurrency(budgetData.allocated)}
        </span>
        
        {showDetails && (
          <div className="flex items-center space-x-1">
            <TrendIcon className={`w-3 h-3 ${getTrendColor()}`} />
            <span className={`text-xs ${getTrendColor()}`}>
              {budgetData.trendPercentage > 0 ? "+" : ""}
              {budgetData.trendPercentage.toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Remaining amount highlight */}
      {budgetData.remaining < budgetData.allocated * 0.1 && budgetData.remaining > 0 && (
        <div className="mt-1 text-center">
          <Badge
            variant="outline"
            className={`text-xs ${
              isStealthOps
                ? "font-mono tracking-wide tactical-surface border-yellow-400 text-yellow-400"
                : "border-yellow-300 text-yellow-700"
            }`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
          >
            <Zap className="w-3 h-3 mr-1" />
            {isStealthOps ? `[${formatCurrency(budgetData.remaining)} LEFT]` : `${formatCurrency(budgetData.remaining)} left`}
          </Badge>
        </div>
      )}
    </div>
  );
};
