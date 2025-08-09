import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  DollarSign,
  Clock,
  Star,
} from "lucide-react";
import { useState } from "react";

import { formatCurrency } from "../utils/helpers";
import { getGlassStyles, getTextColors } from "../utils/theme";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";

interface AIInsight {
  id: string;
  type: "optimization" | "warning" | "opportunity" | "trend" | "prediction" | "achievement";
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  confidence: number;
  potentialSavings?: number;
  actionItems?: string[];
  category?: string;
  priority: number;
  timeframe?: "immediate" | "short-term" | "long-term";
  status?: "new" | "viewed" | "acting" | "dismissed";
  aiReasoning?: string;
  relatedMetrics?: {
    label: string;
    value: string;
    change?: number;
    positive?: boolean;
  }[];
}

interface EnhancedAIInsightCardProps {
  insight: AIInsight;
  onAction?: (action: string, insightId: string) => void;
  onDismiss?: (insightId: string) => void;
  isStealthOps?: boolean;
  isDarkMode?: boolean;
  className?: string;
}

export const EnhancedAIInsightCard = ({
  insight,
  onAction,
  onDismiss,
  isStealthOps = false,
  isDarkMode = false,
  className = "",
}: EnhancedAIInsightCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActing, setIsActing] = useState(false);

  const glassStyles = getGlassStyles(isStealthOps, isDarkMode);
  const textColors = getTextColors(isStealthOps, isDarkMode);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "optimization":
        return TrendingDown;
      case "warning":
        return AlertTriangle;
      case "opportunity":
        return TrendingUp;
      case "trend":
        return BarChart3;
      case "prediction":
        return Target;
      case "achievement":
        return Star;
      default:
        return Lightbulb;
    }
  };

  const getInsightColor = (type: string) => {
    if (isStealthOps) {
      switch (type) {
        case "optimization":
          return {
            primary: "text-blue-400",
            background: "tactical-surface border-blue-400",
            accent: "bg-blue-400/10",
          };
        case "warning":
          return {
            primary: "text-orange-400",
            background: "tactical-surface border-orange-400",
            accent: "bg-orange-400/10",
          };
        case "opportunity":
          return {
            primary: "text-green-400",
            background: "tactical-surface border-green-400",
            accent: "bg-green-400/10",
          };
        case "trend":
          return {
            primary: "text-purple-400",
            background: "tactical-surface border-purple-400",
            accent: "bg-purple-400/10",
          };
        case "prediction":
          return {
            primary: "text-indigo-400",
            background: "tactical-surface border-indigo-400",
            accent: "bg-indigo-400/10",
          };
        case "achievement":
          return {
            primary: "text-yellow-400",
            background: "tactical-surface border-yellow-400",
            accent: "bg-yellow-400/10",
          };
        default:
          return {
            primary: "text-gray-400",
            background: "tactical-surface border-gray-600",
            accent: "bg-gray-400/10",
          };
      }
    }

    switch (type) {
      case "optimization":
        return {
          primary: "text-blue-600",
          background: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800",
          accent: "bg-blue-100 dark:bg-blue-900",
        };
      case "warning":
        return {
          primary: "text-orange-600",
          background: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800",
          accent: "bg-orange-100 dark:bg-orange-900",
        };
      case "opportunity":
        return {
          primary: "text-green-600",
          background: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800",
          accent: "bg-green-100 dark:bg-green-900",
        };
      case "trend":
        return {
          primary: "text-purple-600",
          background: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800",
          accent: "bg-purple-100 dark:bg-purple-900",
        };
      case "prediction":
        return {
          primary: "text-indigo-600",
          background: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800",
          accent: "bg-indigo-100 dark:bg-indigo-900",
        };
      case "achievement":
        return {
          primary: "text-yellow-600",
          background: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800",
          accent: "bg-yellow-100 dark:bg-yellow-900",
        };
      default:
        return {
          primary: "text-gray-600",
          background: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 border-gray-200 dark:border-gray-800",
          accent: "bg-gray-100 dark:bg-gray-900",
        };
    }
  };

  const getImpactBadge = (impact: string) => {
    const baseClass = isStealthOps ? "font-mono tracking-wide tactical-surface border" : "";
    
    if (isStealthOps) {
      switch (impact) {
        case "high":
          return `${baseClass} border-red-400 text-red-400`;
        case "medium":
          return `${baseClass} border-yellow-400 text-yellow-400`;
        case "low":
          return `${baseClass} border-green-400 text-green-400`;
        default:
          return `${baseClass} border-gray-600 text-gray-400`;
      }
    }

    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800";
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800";
    }
  };

  const getTimeframeIcon = (timeframe?: string) => {
    switch (timeframe) {
      case "immediate":
        return Zap;
      case "short-term":
        return Clock;
      case "long-term":
        return Target;
      default:
        return Clock;
    }
  };

  const IconComponent = getInsightIcon(insight.type);
  const colors = getInsightColor(insight.type);
  const TimeframeIcon = getTimeframeIcon(insight.timeframe);

  const handleAction = async (action: string) => {
    setIsActing(true);
    try {
      await onAction?.(action, insight.id);
    } finally {
      setIsActing(false);
    }
  };

  return (
    <Card
      className={`transition-all duration-300 hover:shadow-lg ${
        isStealthOps ? `${colors.background} border-2 tactical-glow` : colors.background
      } ${insight.status === "new" ? "ring-2 ring-blue-300 dark:ring-blue-700" : ""} ${className}`}
      style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Icon with enhanced styling */}
            <div
              className={`p-2 ${isStealthOps ? "" : "rounded-lg"} ${colors.accent}`}
              style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
            >
              <IconComponent className={`w-5 h-5 ${colors.primary}`} />
            </div>

            <div className="flex-1 min-w-0">
              <CardTitle
                className={`text-base font-semibold ${textColors.primary} ${
                  isStealthOps ? "font-mono tracking-wide" : ""
                }`}
              >
                {isStealthOps ? `[${insight.title.toUpperCase()}]` : insight.title}
              </CardTitle>
              
              <CardDescription
                className={`mt-1 line-clamp-2 ${textColors.muted} ${
                  isStealthOps ? "font-mono tracking-wide" : ""
                }`}
              >
                {isStealthOps ? `[${insight.description.toUpperCase()}]` : insight.description}
              </CardDescription>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center space-x-2 ml-2">
            {insight.status === "new" && (
              <div
                className={`w-2 h-2 rounded-full ${
                  isStealthOps ? "bg-blue-400 tactical-glow" : "bg-blue-500"
                }`}
              />
            )}
            
            {insight.timeframe && (
              <div
                className={`p-1 ${isStealthOps ? "" : "rounded"} ${colors.accent}`}
                title={`${insight.timeframe} action required`}
              >
                <TimeframeIcon className={`w-3 h-3 ${colors.primary}`} />
              </div>
            )}
          </div>
        </div>

        {/* Badges row */}
        <div className="flex items-center space-x-2 pt-2">
          <Badge
            className={`text-xs ${getImpactBadge(insight.impact)}`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
          >
            {isStealthOps ? `[${insight.impact.toUpperCase()} IMPACT]` : `${insight.impact} impact`}
          </Badge>

          <Badge
            variant="outline"
            className={`text-xs ${
              isStealthOps ? "font-mono tracking-wide tactical-surface border-gray-600" : ""
            }`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
          >
            {isStealthOps
              ? `[${Math.round(insight.confidence * 100)}% CONFIDENCE]`
              : `${Math.round(insight.confidence * 100)}% confidence`}
          </Badge>

          {insight.category && (
            <Badge
              variant="secondary"
              className={`text-xs ${
                isStealthOps ? "font-mono tracking-wide tactical-surface" : ""
              }`}
              style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
            >
              {isStealthOps ? `[${insight.category.toUpperCase()}]` : insight.category}
            </Badge>
          )}

          <div className="flex-1" />

          {/* Priority indicator */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`w-1 h-1 ${
                  i < insight.priority
                    ? isStealthOps
                      ? "bg-green-400"
                      : "bg-green-500"
                    : isStealthOps
                      ? "bg-gray-600"
                      : "bg-gray-300"
                } ${isStealthOps ? "" : "rounded-full"}`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Potential savings highlight */}
        {insight.potentialSavings && insight.potentialSavings > 0 && (
          <div
            className={`mb-4 p-3 border ${
              isStealthOps
                ? "tactical-surface border-green-400"
                : "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 rounded-lg"
            }`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign
                  className={`w-4 h-4 ${isStealthOps ? "text-green-400" : "text-green-600"}`}
                />
                <span
                  className={`font-medium ${
                    isStealthOps
                      ? "text-green-300 font-mono tracking-wide"
                      : "text-green-700 dark:text-green-300"
                  }`}
                >
                  {isStealthOps ? "[POTENTIAL MONTHLY SAVINGS]" : "Potential Monthly Savings"}
                </span>
              </div>
              <div
                className={`text-lg font-bold ${
                  isStealthOps
                    ? "text-green-400 font-mono tracking-wide tactical-text-glow"
                    : "text-green-800 dark:text-green-200"
                }`}
              >
                {formatCurrency(insight.potentialSavings)}
              </div>
            </div>
          </div>
        )}

        {/* Related metrics */}
        {insight.relatedMetrics && insight.relatedMetrics.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-3">
              {insight.relatedMetrics.map((metric, index) => (
                <div
                  key={index}
                  className={`p-2 border ${
                    isStealthOps ? "tactical-surface border-gray-600" : "rounded border-gray-200 dark:border-gray-700"
                  }`}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  <div
                    className={`text-xs ${
                      isStealthOps ? "text-gray-300 font-mono tracking-wide" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {isStealthOps ? `[${metric.label.toUpperCase()}]` : metric.label}
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <span
                      className={`font-semibold ${
                        isStealthOps
                          ? "text-white font-mono tracking-wide"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {metric.value}
                    </span>
                    {metric.change !== undefined && (
                      <span
                        className={`text-xs ${
                          metric.positive === true
                            ? isStealthOps
                              ? "text-green-400"
                              : "text-green-600"
                            : metric.positive === false
                              ? isStealthOps
                                ? "text-red-400"
                                : "text-red-600"
                              : isStealthOps
                                ? "text-gray-400"
                                : "text-gray-500"
                        }`}
                      >
                        {metric.change > 0 ? "+" : ""}
                        {metric.change}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Reasoning (expandable) */}
        {insight.aiReasoning && (
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-0 h-auto font-normal ${
                isStealthOps ? "text-green-400 hover:text-green-300 font-mono tracking-wide" : ""
              }`}
            >
              <Brain className={`w-4 h-4 mr-2 ${isStealthOps ? "text-green-400" : ""}`} />
              {isStealthOps ? "[AI REASONING]" : "AI Reasoning"}
              <ArrowRight
                className={`w-3 h-3 ml-1 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </Button>
            
            {isExpanded && (
              <div
                className={`mt-2 p-3 border ${
                  isStealthOps
                    ? "tactical-surface border-blue-400"
                    : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 rounded-lg"
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              >
                <p
                  className={`text-sm ${
                    isStealthOps
                      ? "text-blue-300 font-mono tracking-wide"
                      : "text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {isStealthOps ? `[${insight.aiReasoning.toUpperCase()}]` : insight.aiReasoning}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action items */}
        {insight.actionItems && insight.actionItems.length > 0 && (
          <div className="mb-4">
            <h5
              className={`font-medium mb-2 ${
                isStealthOps ? "text-green-400 font-mono tracking-wide" : textColors.primary
              }`}
            >
              {isStealthOps ? "[RECOMMENDED ACTIONS:]" : "Recommended Actions:"}
            </h5>
            <div className="space-y-2">
              {insight.actionItems.map((action, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div
                    className={`w-1.5 h-1.5 mt-2 ${
                      isStealthOps ? "bg-green-400" : "bg-green-500 rounded-full"
                    }`}
                    style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                  />
                  <span
                    className={`text-sm ${
                      isStealthOps ? "text-gray-300 font-mono tracking-wide" : textColors.secondary
                    }`}
                  >
                    {isStealthOps ? `[${action.toUpperCase()}]` : action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => handleAction("apply")}
              disabled={isActing}
              className={`${
                isStealthOps
                  ? "bg-green-600 hover:bg-green-500 text-black font-mono tracking-wide tactical-glow"
                  : ""
              }`}
              style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
            >
              {isActing ? (
                <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1" />
              )}
              {isStealthOps ? "[APPLY]" : "Apply"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("learn-more")}
              className={`${
                isStealthOps
                  ? "tactical-button border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black font-mono tracking-wide"
                  : ""
              }`}
              style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              {isStealthOps ? "[LEARN MORE]" : "Learn More"}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss?.(insight.id)}
            className={`${
              isStealthOps
                ? "text-gray-400 hover:text-red-400 font-mono tracking-wide"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <XCircle className="w-4 h-4 mr-1" />
            {isStealthOps ? "[DISMISS]" : "Dismiss"}
          </Button>
        </div>

        {/* Confidence bar */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className={textColors.muted}>
              {isStealthOps ? "[AI CONFIDENCE]" : "AI Confidence"}
            </span>
            <span className={textColors.primary}>
              {Math.round(insight.confidence * 100)}%
            </span>
          </div>
          <Progress
            value={insight.confidence * 100}
            className={`mt-1 h-1 ${isStealthOps ? "tactical-surface" : ""}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};
