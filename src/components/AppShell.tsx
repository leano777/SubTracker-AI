import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CreditCard,
  CalendarDays,
  Brain,
  Search,
  User,
  ChevronDown,
  Loader2,
  LogOut,
  RefreshCw,
  Menu,
  Bell,
  Settings,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useIsMobile } from "./ui/use-mobile";
import { motionVariants, defaultTransition } from "./ui/motion";
import type { SyncStatus } from "../utils/dataSync";
import { getSyncStatusColor, getSyncStatusIcon, getSyncStatusText } from "../utils/syncStatus";
import { getGlassSecondaryStyles, getTextColors } from "../utils/theme";

// Navigation items configuration
const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: CreditCard,
    path: "/subscriptions",
  },
  {
    id: "planning",
    label: "Planning",
    icon: CalendarDays,
    path: "/planning",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    icon: Brain,
    path: "/intelligence",
  },
];

interface AppShellProps {
  user: any;
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
  isOnline: boolean;
  cloudSyncEnabled: boolean;
  isAuthenticated: boolean;
  syncStatus: SyncStatus | null;
  lastSyncTime: string | null;
  isLoggingOut: boolean;
  isDarkMode: boolean;
  isStealthOps: boolean;
  textColors: ReturnType<typeof getTextColors>;
  glassSecondaryStyles: ReturnType<typeof getGlassSecondaryStyles>;
  triggerDataSync: () => void;
  dataSyncManager: any;
  openSettingsModal: () => void;
  handleQuickLogout: (e: React.MouseEvent) => void;
  handleConfirmLogout: () => void;
  unreadNotificationsCount?: number;
}

// Sticky Header Component
const AppHeader: React.FC<{
  user: any;
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
  isOnline: boolean;
  cloudSyncEnabled: boolean;
  isAuthenticated: boolean;
  syncStatus: SyncStatus | null;
  lastSyncTime: string | null;
  isLoggingOut: boolean;
  isDarkMode: boolean;
  isStealthOps: boolean;
  textColors: ReturnType<typeof getTextColors>;
  glassSecondaryStyles: ReturnType<typeof getGlassSecondaryStyles>;
  triggerDataSync: () => void;
  dataSyncManager: any;
  openSettingsModal: () => void;
  handleQuickLogout: (e: React.MouseEvent) => void;
  handleConfirmLogout: () => void;
  unreadNotificationsCount?: number;
  currentPageTitle?: string;
}> = ({
  user,
  globalSearchTerm,
  setGlobalSearchTerm,
  isOnline,
  cloudSyncEnabled,
  isAuthenticated,
  syncStatus,
  lastSyncTime,
  isLoggingOut,
  isDarkMode,
  isStealthOps,
  textColors,
  glassSecondaryStyles,
  triggerDataSync,
  dataSyncManager,
  openSettingsModal,
  handleQuickLogout,
  handleConfirmLogout,
  unreadNotificationsCount = 0,
  currentPageTitle,
}) => {
  const location = useLocation();
  const currentPage = navigationItems.find(item => item.path === location.pathname);
  const pageTitle = currentPageTitle || currentPage?.label || "Dashboard";

  // Enhanced safe text color getters with guaranteed fallbacks
  const safeTextColors = {
    primary: textColors.primary || (isDarkMode ? "text-gray-100" : "text-gray-900"),
    secondary: textColors.secondary || (isDarkMode ? "text-gray-300" : "text-gray-700"),
    muted: textColors.muted || (isDarkMode ? "text-gray-400" : "text-gray-600"),
    onGlass: textColors.onGlass || (isDarkMode ? "text-gray-100" : "text-gray-900"),
    accent: textColors.accent || (isDarkMode ? "text-blue-400" : "text-blue-600"),
    danger: textColors.danger || (isDarkMode ? "text-red-400" : "text-red-600"),
    warning: textColors.warning || (isDarkMode ? "text-yellow-400" : "text-yellow-600"),
    success: textColors.success || (isDarkMode ? "text-green-400" : "text-green-600"),
  };

  const SyncIcon = getSyncStatusIcon(isOnline, cloudSyncEnabled, isAuthenticated, syncStatus);

  return (
    <motion.header
      className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
        isStealthOps ? "tactical-border border-gray-700" : "border-border/40"
      }`}
      style={{
        backgroundColor: glassSecondaryStyles.backgroundColor,
        backdropFilter: glassSecondaryStyles.backdropFilter,
        WebkitBackdropFilter: glassSecondaryStyles.WebkitBackdropFilter,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={defaultTransition}
    >
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Sidebar Trigger for Desktop */}
        <div className="hidden md:block">
          <SidebarTrigger />
        </div>

        {/* Page Title */}
        <motion.div 
          className="flex items-center gap-3 min-w-0 flex-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...defaultTransition, delay: 0.1 }}
        >
          <h1 className={`text-xl font-semibold truncate ${safeTextColors.primary}`}>
            {isStealthOps ? `[${pageTitle.toUpperCase()}]` : pageTitle}
          </h1>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="relative hidden sm:block w-64"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...defaultTransition, delay: 0.2 }}
        >
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isStealthOps ? "text-green-400" : safeTextColors.muted
            }`}
          />
          <Input
            placeholder={isStealthOps ? "[SEARCH...]" : "Search..."}
            value={globalSearchTerm}
            onChange={(e) => setGlobalSearchTerm(e.target.value)}
            className={`pl-10 backdrop-blur-sm ${safeTextColors.onGlass} transition-all duration-300 ${
              isStealthOps
                ? "tactical-input border border-gray-600 focus:border-green-400 focus:tactical-glow placeholder:text-gray-500"
                : isDarkMode
                  ? "bg-gray-700/50 border-gray-600 placeholder:text-gray-400 focus:border-gray-500"
                  : "bg-white/50 border-gray-200 placeholder:text-gray-500 focus:border-gray-300"
            }`}
            style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
          />
        </motion.div>

        {/* Actions */}
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...defaultTransition, delay: 0.3 }}
        >
          {/* Sync Status */}
          <div
            className={`flex items-center gap-1 ${getSyncStatusColor(isOnline, cloudSyncEnabled, isAuthenticated, syncStatus, isStealthOps)}`}
            title={getSyncStatusText(isAuthenticated, isOnline, cloudSyncEnabled, syncStatus, isStealthOps)}
          >
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 w-9 p-0 backdrop-blur-sm transition-all duration-300 ${
                isStealthOps
                  ? "tactical-button border border-gray-600 hover:border-green-400 text-green-400"
                  : isDarkMode
                    ? "bg-gray-700/50 hover:bg-gray-600"
                    : "bg-white/50 hover:bg-white/70"
              }`}
              onClick={triggerDataSync}
              disabled={!isOnline || !cloudSyncEnabled || dataSyncManager.isSyncInProgress()}
              aria-label="Sync data"
            >
              <SyncIcon
                className={`w-4 h-4 ${
                  isStealthOps ? "text-green-400" : safeTextColors.primary
                } ${dataSyncManager.isSyncInProgress() ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-9 w-9 p-0 backdrop-blur-sm transition-all duration-300 relative ${
              isStealthOps
                ? "tactical-button border border-gray-600 hover:border-green-400 text-green-400"
                : isDarkMode
                  ? "bg-gray-700/50 hover:bg-gray-600"
                  : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label="Notifications"
          >
            <Bell className={`w-4 h-4 ${isStealthOps ? "text-green-400" : safeTextColors.primary}`} />
            {unreadNotificationsCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white"
              >
                {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`flex items-center gap-2 h-9 px-2 backdrop-blur-sm transition-all duration-300 ${
                  isStealthOps
                    ? "tactical-button border border-gray-600 hover:border-green-400"
                    : isDarkMode
                      ? "bg-gray-700/50 hover:bg-gray-600"
                      : "bg-white/50 hover:bg-white/70"
                }`}
                disabled={isLoggingOut}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback
                    className={`text-xs ${
                      isStealthOps
                        ? "bg-black border border-green-400 text-green-400 font-mono font-bold"
                        : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                    }`}
                  >
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className={`w-3 h-3 ${safeTextColors.muted} hidden sm:block`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={`w-56 border-0 ${isStealthOps ? "tactical-surface font-mono" : ""}`}
              style={glassSecondaryStyles}
            >
              <DropdownMenuLabel className={`font-normal ${safeTextColors.onGlass}`}>
                <div className="flex flex-col space-y-1">
                  <p className={`text-sm font-medium leading-none ${isStealthOps ? "text-green-400 tracking-wide" : ""}`}>
                    {isStealthOps ? `[${user?.name?.toUpperCase() || "USER"}]` : user?.name}
                  </p>
                  <p className={`text-xs leading-none ${safeTextColors.muted}`}>
                    {isStealthOps ? `[${user?.email?.toUpperCase() || "EMAIL"}]` : user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={openSettingsModal}
                className={`cursor-pointer ${safeTextColors.onGlass} ${
                  isStealthOps ? "hover:bg-gray-800 hover:text-green-400 font-mono tracking-wide" : ""
                }`}
              >
                <Settings className={`mr-2 h-4 w-4 ${isStealthOps ? "text-green-400" : ""}`} />
                <span>{isStealthOps ? "[SETTINGS]" : "Settings"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleQuickLogout}
                className={`cursor-pointer focus:text-blue-400 hover:bg-blue-500/10 ${
                  isStealthOps ? "text-green-400 hover:bg-green-500/10 hover:text-green-300 font-mono tracking-wide" : "text-blue-500"
                }`}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className={`mr-2 h-4 w-4 animate-spin ${isStealthOps ? "text-green-400" : ""}`} />
                ) : (
                  <LogOut className={`mr-2 h-4 w-4 ${isStealthOps ? "text-green-400" : ""}`} />
                )}
                <span>{isStealthOps ? "[SIGN OUT]" : "Sign Out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>
    </motion.header>
  );
};

// Desktop Sidebar Component
const AppSidebar: React.FC<{
  isDarkMode: boolean;
  isStealthOps: boolean;
  textColors: ReturnType<typeof getTextColors>;
  user?: any;
}> = ({ isDarkMode, isStealthOps, textColors, user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const safeTextColors = {
    primary: textColors.primary || (isDarkMode ? "text-gray-100" : "text-gray-900"),
    secondary: textColors.secondary || (isDarkMode ? "text-gray-300" : "text-gray-700"),
    muted: textColors.muted || (isDarkMode ? "text-gray-400" : "text-gray-600"),
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <motion.div 
          className="flex items-center gap-2 px-2 py-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={defaultTransition}
        >
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
            isStealthOps ? "bg-black border border-green-400" : "bg-gradient-to-br from-blue-500 to-purple-600"
          }`}>
            <span className={`text-lg font-bold ${isStealthOps ? "text-green-400" : "text-white"}`}>
              {isStealthOps ? "[S]" : "S"}
            </span>
          </div>
          <span className={`font-semibold text-lg ${safeTextColors.primary}`}>
            {isStealthOps ? "[SUBTRACKER]" : "SubTracker"}
          </span>
        </motion.div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={safeTextColors.muted}>
            {isStealthOps ? "[NAVIGATION]" : "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...defaultTransition, delay: index * 0.1 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={isActive}
                        className={`${
                          isStealthOps && isActive
                            ? "bg-gray-800 border border-green-400 text-green-400 tactical-glow"
                            : ""
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{isStealthOps ? `[${item.label.toUpperCase()}]` : item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <motion.div 
          className="px-2 py-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...defaultTransition, delay: 0.5 }}
        >
          <div className={`text-xs ${safeTextColors.muted} text-center`}>
            {isStealthOps ? "[TACTICAL MODE ACTIVE]" : "© 2024 SubTracker"}
          </div>
        </motion.div>
      </SidebarFooter>
    </Sidebar>
  );
};

// Mobile Bottom Navigation Component
const MobileBottomNav: React.FC<{
  isDarkMode: boolean;
  isStealthOps: boolean;
  textColors: ReturnType<typeof getTextColors>;
  glassSecondaryStyles: ReturnType<typeof getGlassSecondaryStyles>;
}> = ({ isDarkMode, isStealthOps, textColors, glassSecondaryStyles }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const safeTextColors = {
    primary: textColors.primary || (isDarkMode ? "text-gray-100" : "text-gray-900"),
    muted: textColors.muted || (isDarkMode ? "text-gray-400" : "text-gray-600"),
  };

  return (
    <motion.div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t ${
        isStealthOps ? "tactical-border border-gray-700" : "border-border/40"
      } safe-area-pb`}
      style={{
        backgroundColor: glassSecondaryStyles.backgroundColor,
        backdropFilter: glassSecondaryStyles.backdropFilter,
        WebkitBackdropFilter: glassSecondaryStyles.WebkitBackdropFilter,
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={defaultTransition}
    >
      <div className="grid grid-cols-4 h-16">
        {navigationItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                isActive
                  ? isStealthOps
                    ? "text-green-400 tactical-glow"
                    : "text-primary"
                  : safeTextColors.muted
              } ${
                isStealthOps && isActive
                  ? "bg-gray-800/50 border-t-2 border-green-400"
                  : isActive
                    ? "bg-primary/10"
                    : "hover:bg-accent/50"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...defaultTransition, delay: index * 0.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">
                {isStealthOps ? item.label.slice(0, 3).toUpperCase() : item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

// Route Transition Wrapper
const RouteTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={motionVariants["route-fade"]}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ ...defaultTransition, duration: 0.2 }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Main AppShell Component
export const AppShell: React.FC<AppShellProps> = ({
  user,
  globalSearchTerm,
  setGlobalSearchTerm,
  isOnline,
  cloudSyncEnabled,
  isAuthenticated,
  syncStatus,
  lastSyncTime,
  isLoggingOut,
  isDarkMode,
  isStealthOps,
  textColors,
  glassSecondaryStyles,
  triggerDataSync,
  dataSyncManager,
  openSettingsModal,
  handleQuickLogout,
  handleConfirmLogout,
  unreadNotificationsCount,
}) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <AppSidebar
            isDarkMode={isDarkMode}
            isStealthOps={isStealthOps}
            textColors={textColors}
            user={user}
          />
        )}

        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-col">
          {/* Sticky Header */}
          <AppHeader
            user={user}
            globalSearchTerm={globalSearchTerm}
            setGlobalSearchTerm={setGlobalSearchTerm}
            isOnline={isOnline}
            cloudSyncEnabled={cloudSyncEnabled}
            isAuthenticated={isAuthenticated}
            syncStatus={syncStatus}
            lastSyncTime={lastSyncTime}
            isLoggingOut={isLoggingOut}
            isDarkMode={isDarkMode}
            isStealthOps={isStealthOps}
            textColors={textColors}
            glassSecondaryStyles={glassSecondaryStyles}
            triggerDataSync={triggerDataSync}
            dataSyncManager={dataSyncManager}
            openSettingsModal={openSettingsModal}
            handleQuickLogout={handleQuickLogout}
            handleConfirmLogout={handleConfirmLogout}
            unreadNotificationsCount={unreadNotificationsCount}
          />

          {/* Page Content */}
          <main className={`flex-1 overflow-auto ${isMobile ? "pb-20" : ""}`}>
            <div className="container mx-auto px-4 py-6">
              <RouteTransition>
                <Outlet />
              </RouteTransition>
            </div>
          </main>
        </SidebarInset>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <MobileBottomNav
            isDarkMode={isDarkMode}
            isStealthOps={isStealthOps}
            textColors={textColors}
            glassSecondaryStyles={glassSecondaryStyles}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default AppShell;
