import { useState, useRef, useEffect, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "../utils/cn";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  threshold?: number;
}

export const PullToRefresh = ({
  onRefresh,
  children,
  className,
  threshold = 80
}: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setTouchStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || isRefreshing) return;
    
    const touchCurrent = e.touches[0].clientY;
    const distance = touchCurrent - touchStart;
    
    if (distance > 0 && containerRef.current?.scrollTop === 0) {
      e.preventDefault();
      // Apply resistance factor
      const resistedDistance = Math.min(distance * 0.5, 150);
      setPullDistance(resistedDistance);
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error("Refresh failed:", error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    setTouchStart(0);
  };

  // Calculate visual states
  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "relative overflow-auto touch-pan-y",
        className
      )}
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Pull Indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-300",
          "bg-gradient-to-b from-blue-50 to-transparent dark:from-gray-800",
          pullDistance > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: `${pullDistance}px`,
          transform: `translateY(-${pullDistance}px)`,
        }}
      >
        <div
          className={cn(
            "flex flex-col items-center justify-center",
            "transition-transform duration-200"
          )}
          style={{
            transform: `scale(${0.8 + pullProgress * 0.2})`,
          }}
        >
          <div
            className={cn(
              "p-3 rounded-full transition-all duration-200",
              shouldTrigger 
                ? "bg-blue-600 text-white shadow-lg" 
                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 shadow"
            )}
          >
            <RefreshCw
              className={cn(
                "w-6 h-6 transition-transform duration-500",
                isRefreshing && "animate-spin",
                shouldTrigger && !isRefreshing && "rotate-180"
              )}
              style={{
                transform: !isRefreshing && !shouldTrigger 
                  ? `rotate(${pullProgress * 180}deg)` 
                  : undefined,
              }}
            />
          </div>
          <span
            className={cn(
              "mt-2 text-sm font-medium transition-opacity duration-200",
              pullDistance > 40 ? "opacity-100" : "opacity-0",
              shouldTrigger ? "text-blue-600" : "text-gray-600 dark:text-gray-400"
            )}
          >
            {isRefreshing 
              ? "Refreshing..." 
              : shouldTrigger 
                ? "Release to refresh" 
                : "Pull to refresh"}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div
        className="relative transition-transform duration-300"
        style={{
          transform: `translateY(${isRefreshing ? threshold : pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};