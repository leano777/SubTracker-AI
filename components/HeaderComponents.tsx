import { useState } from 'react';
import { Sun, Moon, Search, Brain, Menu, Bell, BarChart3, Bot, Calendar, Clock, CreditCard, RotateCcw, Star, FileDown, Wifi, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { UserProfile } from './UserProfile';
import { Subscription as FullSubscription, PaymentCard as FullPaymentCard } from '../types/subscription';
import { Notification } from '../types/constants';

interface ThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
}

export const ThemeToggle = ({ darkMode, onToggle }: ThemeToggleProps) => {
  return (
    <Button variant="outline" size="sm" onClick={onToggle}>
      {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

interface GlobalSearchProps {
  onSearch: (term: string) => void;
}

export const GlobalSearch = ({ onSearch }: GlobalSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAISearch, setIsAISearch] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsAISearch(value.length > 0 && (value.includes('?') || value.includes('find') || value.includes('show')));
    onSearch(value);
  };

  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        placeholder="Ask AI or search..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-8"
      />
      {isAISearch && (
        <Brain className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-4 h-4 animate-pulse" />
      )}
    </div>
  );
};

interface MobileNavProps {
  activeTab: string;
  subscriptions: FullSubscription[];
  paymentCards: FullPaymentCard[];
  notifications: Notification[];
  onTabChange: (tab: string) => void;
}

export const MobileNav = ({ 
  activeTab, 
  subscriptions, 
  paymentCards, 
  notifications,
  onTabChange 
}: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled');
  const watchlistSubscriptions = subscriptions.filter(sub => sub.status === 'watchlist');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, count: null },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: activeSubscriptions.length },
    { id: 'planning', label: 'Planning', icon: Calendar, count: null },
    { id: 'intelligence', label: 'Intelligence', icon: Brain, count: null, badge: 'AI' },
    { id: 'management', label: 'Management', icon: Settings, count: null },
  ];

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Menu className="h-4 w-4" />
            {notifications.filter(n => !n.read).length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">{notifications.filter(n => !n.read).length}</span>
              </div>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[320px]">
          <div className="space-y-4 mt-8">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-2 font-semibold">Navigation</h2>
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      onTabChange(tab.id);
                      setIsOpen(false);
                    }}
                  >
                    <tab.icon className="mr-2 h-4 w-4" />
                    {tab.label}
                    <div className="ml-auto flex items-center space-x-1">
                      {tab.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {tab.badge}
                        </Badge>
                      )}
                      {tab.count !== null && tab.count > 0 && (
                        <Badge variant="secondary">
                          {tab.count}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {notifications.filter(n => !n.read).length > 0 && (
              <div className="px-3 py-2">
                <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                  AI Alerts & Insights
                </h3>
                <div className="space-y-2">
                  {notifications
                    .filter(n => !n.read)
                    .slice(0, 3)
                    .map(notification => (
                      <div key={notification.id} className="p-2 rounded-lg bg-muted">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {notification.message}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* AI Status */}
            <div className="px-3 py-2">
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
                <div className="flex items-center space-x-2 mb-1">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">AI Engine</span>
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Analyzing patterns • Finding savings opportunities
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

interface UserProfileHeaderProps {
  onOpenSettings?: () => void;
  onOpenManagement?: () => void;
}

export const UserProfileHeader = ({ onOpenSettings, onOpenManagement }: UserProfileHeaderProps) => {
  return <UserProfile onOpenSettings={onOpenSettings} onOpenManagement={onOpenManagement} />;
};