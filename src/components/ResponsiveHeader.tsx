import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Moon,
  Sun,
  ChevronDown 
} from "lucide-react";
import { cn } from "../utils/cn";
import { Avatar } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ResponsiveHeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  notificationCount?: number;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  className?: string;
}

export const ResponsiveHeader = ({
  isDarkMode,
  onToggleTheme,
  notificationCount = 0,
  onOpenNotifications,
  onOpenProfile,
  className
}: ResponsiveHeaderProps) => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className={cn(
      "sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800",
      className
    )}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            
            <h1 className="ml-2 md:ml-0 text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SubTracker AI
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:block">
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user?.name || "User"}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenProfile}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-600 dark:text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-4 py-3 space-y-2">
            <button
              onClick={() => {
                onOpenProfile?.();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="text-gray-700 dark:text-gray-300">Profile</span>
            </button>
            
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="text-gray-700 dark:text-gray-300">Settings</span>
            </button>
            
            <button
              onClick={() => {
                signOut();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-red-600 dark:text-red-400">Sign Out</span>
            </button>
          </div>
          
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Signed in as
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {user?.email}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};