import { useState } from 'react';
import { BarChart3, CreditCard, Calendar, Brain, Settings, Home } from 'lucide-react';
import { cn } from '../components/ui/utils';

interface DockItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface GlassmorphicDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  subscriptionsCount: number;
  aiInsightsCount: number;
}

export function GlassmorphicDock({ 
  activeTab, 
  onTabChange, 
  subscriptionsCount, 
  aiInsightsCount 
}: GlassmorphicDockProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const dockItems: DockItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: CreditCard,
      count: subscriptionsCount,
    },
    {
      id: 'planning',
      label: 'Planning',
      icon: Calendar,
    },
    {
      id: 'intelligence',
      label: 'Intelligence',
      icon: Brain,
      count: aiInsightsCount,
    },
  ];

  return (
    <>
      {/* Dock Container */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="relative">
          {/* Hover Label */}
          {hoveredItem && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none">
              <div className="bg-black/80 text-white text-sm px-3 py-2 rounded-lg backdrop-blur-sm">
                <div className="text-center">
                  {dockItems.find(item => item.id === hoveredItem)?.label}
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black/80"></div>
              </div>
            </div>
          )}

          {/* Dock */}
          <div className="flex items-center space-x-2 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-3 shadow-2xl">
            {dockItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ease-out",
                    "hover:scale-110 hover:-translate-y-1",
                    isActive 
                      ? "bg-white/30 dark:bg-white/20 shadow-lg scale-105 -translate-y-0.5" 
                      : "hover:bg-white/20 dark:hover:bg-white/10",
                    hoveredItem === item.id && "scale-110 -translate-y-1"
                  )}
                >
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-colors duration-200",
                      isActive 
                        ? "text-black dark:text-white" 
                        : "text-gray-700 dark:text-gray-300"
                    )} 
                  />
                  
                  {/* Count Badge */}
                  {item.count && item.count > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                      {item.count > 99 ? '99+' : item.count}
                    </div>
                  )}

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black dark:bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Background Blur Overlay (subtle) */}
      <div className="fixed inset-0 pointer-events-none z-40">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/5 to-transparent dark:from-white/5"></div>
      </div>
    </>
  );
}