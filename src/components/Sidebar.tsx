import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  Calendar,
  BarChart3,
  Brain,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  PieChart,
  BarChart,
  FileText,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'budgetpods', label: 'Budget Pods', icon: PieChart },
  { id: 'investments', label: 'Investments', icon: BarChart },
  { id: 'notebooks', label: 'Notebooks', icon: FileText },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'cards', label: 'Payment Cards', icon: CreditCard },
  { id: 'financials', label: 'Financials', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileToggle
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-overlay z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={onMobileToggle}
        className="fixed top-4 left-4 z-50 p-2 bg-secondary hover:bg-hover rounded-lg transition-colors lg:hidden"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-primary" />
        ) : (
          <Menu className="w-6 h-6 text-primary" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-secondary border-r border-primary z-50 lg:z-30
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-primary-text" />
              </div>
              <h1 className="text-xl font-semibold text-primary">
                SubTracker
              </h1>
            </div>
          )}
          
          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 hover:bg-hover rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-secondary" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-secondary" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (window.innerWidth < 1024) {
                    onMobileToggle();
                  }
                }}
                className={`
                  w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                  transition-all duration-200 ease-in-out group
                  ${isActive 
                    ? 'bg-primary text-primary-text shadow-lg' 
                    : 'text-secondary hover:bg-hover hover:text-primary'
                  }
                  ${isCollapsed ? 'justify-center' : 'justify-start'}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`
                  w-5 h-5 flex-shrink-0
                  ${isActive ? 'text-primary-text' : 'text-muted group-hover:text-primary'}
                  transition-colors duration-200
                `} />
                
                {!isCollapsed && (
                  <span className="font-medium transition-colors duration-200">
                    {item.label}
                  </span>
                )}
                
                {isActive && !isCollapsed && (
                  <div className="w-2 h-2 bg-primary-text rounded-full ml-auto animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-primary">
            <div className="text-xs text-muted text-center">
              SubTracker AI
            </div>
          </div>
        )}
      </aside>

      {/* Content Spacer for Desktop */}
      <div className={`
        hidden lg:block transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-64'}
      `} />
    </>
  );
};
