import { type ReactNode, useState, useEffect } from "react";
import { ResponsiveHeader } from "./ResponsiveHeader";
import { MobileNavigation } from "./MobileNavigation";
import { PullToRefresh } from "./PullToRefresh";
import { useIsMobile } from "../hooks/useDeviceDetection";
import { cn } from "../utils/cn";

interface ResponsiveLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onRefresh?: () => Promise<void>;
  onAddSubscription?: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
  notificationCount?: number;
  className?: string;
}

export const ResponsiveLayout = ({
  children,
  activeTab,
  onTabChange,
  isDarkMode,
  onToggleTheme,
  onRefresh,
  onAddSubscription,
  onOpenProfile,
  onOpenNotifications,
  notificationCount = 0,
  className
}: ResponsiveLayoutProps) => {
  const isMobile = useIsMobile();
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Handle viewport height changes (important for mobile browsers)
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      // Set CSS variable for viewport height
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Prevent scroll when modal is open on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      };
    }
  }, [isMobile]);

  const content = (
    <div
      className={cn(
        "min-h-screen bg-gray-50 dark:bg-gray-900",
        "flex flex-col",
        className
      )}
      style={{
        minHeight: isMobile ? `${viewportHeight}px` : '100vh',
      }}
    >
      {/* Header */}
      <ResponsiveHeader
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
        notificationCount={notificationCount}
        onOpenNotifications={onOpenNotifications}
        onOpenProfile={onOpenProfile}
      />

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 overflow-auto",
          isMobile && "pb-20" // Add padding for mobile navigation
        )}
      >
        {isMobile && onRefresh ? (
          <PullToRefresh onRefresh={onRefresh}>
            {children}
          </PullToRefresh>
        ) : (
          children
        )}
      </main>

      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNavigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          onAddSubscription={onAddSubscription}
        />
      )}
    </div>
  );

  return content;
};