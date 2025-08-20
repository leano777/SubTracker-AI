import { useState } from "react";
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  Plus,
  Brain,
  Calendar,
  Menu,
  X
} from "lucide-react";
import { cn } from "../utils/cn";

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddSubscription?: () => void;
  className?: string;
}

export const MobileNavigation = ({ 
  activeTab, 
  onTabChange, 
  onAddSubscription,
  className 
}: MobileNavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainTabs = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "subscriptions", label: "Subs", icon: CreditCard },
    { id: "intelligence", label: "AI", icon: Brain },
    { id: "planning", label: "Plan", icon: Calendar },
  ];

  const moreTabs = [
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-40 md:hidden",
        "bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800",
        "safe-area-bottom", // For iOS safe area
        className
      )}>
        <div className="flex items-center justify-around h-16 px-2">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full py-2 px-1",
                  "transition-all duration-200 rounded-lg",
                  isActive 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 mb-1",
                  isActive && "scale-110"
                )} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
          
          {/* More Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full py-2 px-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Menu className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>

        {/* Floating Action Button - Add Subscription */}
        {onAddSubscription && (
          <button
            onClick={onAddSubscription}
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* More Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900",
            "rounded-t-2xl shadow-xl animate-slide-up",
            "safe-area-bottom"
          )}>
            <div className="p-4">
              {/* Handle */}
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4" />
              
              <div className="space-y-2">
                {moreTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        setIsMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg",
                        "transition-colors duration-200",
                        isActive 
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-full mt-4 p-3 text-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
    </>
  );
};