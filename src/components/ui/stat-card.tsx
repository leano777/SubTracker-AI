import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "./utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: "up" | "down" | "neutral";
  };
  variant?: "default" | "glass" | "elevated";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "glass",
  size = "md",
  className,
  children
}: StatCardProps) => {
  const getTrendColor = (direction: "up" | "down" | "neutral") => {
    switch (direction) {
      case "up":
        return "text-success-600 dark:text-success-400 stealth-ops:text-green-400";
      case "down":
        return "text-destructive-600 dark:text-destructive-400 stealth-ops:text-red-400";
      case "neutral":
      default:
        return "text-muted-foreground stealth-ops:text-gray-400";
    }
  };

  const getSizeClasses = (size: "sm" | "md" | "lg") => {
    switch (size) {
      case "sm":
        return {
          card: "p-4",
          title: "text-sm font-medium",
          value: "text-xl font-bold",
          subtitle: "text-xs"
        };
      case "lg":
        return {
          card: "p-8",
          title: "text-lg font-medium",
          value: "text-4xl font-bold",
          subtitle: "text-sm"
        };
      case "md":
      default:
        return {
          card: "p-6",
          title: "text-sm font-medium",
          value: "text-2xl font-bold",
          subtitle: "text-xs"
        };
    }
  };

  const getVariantClasses = (variant: "default" | "glass" | "elevated") => {
    switch (variant) {
      case "glass":
        return cn(
          "glass-card border-glass-border bg-glass-background",
          "hover:bg-glass-accent hover:shadow-glass-hover",
          "transition-all duration-300 backdrop-blur-md",
          "stealth-ops:tactical-surface stealth-ops:tactical-border"
        );
      case "elevated":
        return cn(
          "bg-card shadow-lg hover:shadow-xl transition-all duration-300",
          "border-border hover:scale-[1.02] transform"
        );
      case "default":
      default:
        return "bg-card border-border";
    }
  };

  const sizeConfig = getSizeClasses(size);

  return (
    <Card 
      className={cn(
        getVariantClasses(variant),
        "relative overflow-hidden group",
        className
      )}
    >
      {/* Glass shimmer effect */}
      {variant === "glass" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 glass-shimmer" />
      )}
      
      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", sizeConfig.card)}>
        <CardTitle className={cn(
          sizeConfig.title,
          "text-text-on-glass stealth-ops:text-white stealth-ops:font-mono stealth-ops:tracking-wide"
        )}>
          {title}
        </CardTitle>
        {icon && (
          <div className={cn(
            "opacity-70 group-hover:opacity-100 transition-opacity",
            "stealth-ops:text-green-400"
          )}>
            {icon}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className={cn(
          sizeConfig.value,
          "text-text-on-glass font-bold tracking-tight",
          "stealth-ops:text-white stealth-ops:font-mono stealth-ops:tracking-wide"
        )}>
          {value}
        </div>
        
        <div className="flex items-center justify-between">
          {subtitle && (
            <p className={cn(
              sizeConfig.subtitle,
              "text-text-on-glass-muted",
              "stealth-ops:text-gray-400 stealth-ops:font-mono stealth-ops:tracking-wide"
            )}>
              {subtitle}
            </p>
          )}
          
          {trend && (
            <div className={cn(
              "flex items-center space-x-1",
              sizeConfig.subtitle,
              getTrendColor(trend.direction),
              "stealth-ops:font-mono stealth-ops:tracking-wide"
            )}>
              <span className="font-medium">
                {trend.direction === "up" ? "↗" : trend.direction === "down" ? "↘" : "→"}
                {Math.abs(trend.value)}%
              </span>
              <span>{trend.label}</span>
            </div>
          )}
        </div>
        
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Enhanced metric display component for complex data
interface MetricDisplayProps {
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
  className?: string;
}

export const MetricDisplay = ({
  label,
  value,
  subValue,
  color = "text-muted-foreground",
  className
}: MetricDisplayProps) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center space-x-2">
        <div 
          className={cn(
            "w-2 h-2 rounded-full",
            color.replace("text-", "bg-")
          )} 
        />
        <span className={cn(
          "text-xs text-text-on-glass-muted",
          "stealth-ops:text-gray-400 stealth-ops:font-mono"
        )}>
          {label}
        </span>
      </div>
      <div className="text-right">
        <div className={cn(
          "font-medium text-text-on-glass text-sm",
          "stealth-ops:text-white stealth-ops:font-mono"
        )}>
          {value}
        </div>
        {subValue && (
          <div className={cn(
            "text-xs text-text-on-glass-muted",
            "stealth-ops:text-gray-400 stealth-ops:font-mono"
          )}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};
