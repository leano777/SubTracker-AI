import { Search, User, ChevronDown, Loader2, LogOut, RefreshCw, Menu } from "lucide-react";
import React from "react";

import type { SyncStatus } from "../utils/dataSync";
import { getSyncStatusColor, getSyncStatusIcon, getSyncStatusText } from "../utils/syncStatus";
import { getGlassSecondaryStyles, getTextColors } from "../utils/theme";

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
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";

interface AppHeaderProps {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
  isOnline: boolean;
  cloudSyncEnabled: boolean;
  isAuthenticated: boolean;
  syncStatus: SyncStatus | null;
  lastSyncTime: string | null;
  isLoggingOut: boolean;
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isDarkMode: boolean;
  isStealthOps: boolean;
  textColors: ReturnType<typeof getTextColors>;
  glassSecondaryStyles: ReturnType<typeof getGlassSecondaryStyles>;
  triggerDataSync: () => void;
  dataSyncManager: any;
  openSettingsModal: () => void;
  handleQuickLogout: (e: React.MouseEvent) => void;
  handleConfirmLogout: () => void;
}

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "planning", label: "Planning" },
  { id: "intelligence", label: "Intelligence" },
];

// Enhanced Mobile navigation component with tactical styling
const MobileNavigation = ({
  activeTab,
  setActiveTab,
  setIsMobileMenuOpen,
  textColors,
  isStealthOps,
  isDarkMode,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  textColors: ReturnType<typeof getTextColors>;
  isStealthOps: boolean;
  isDarkMode: boolean;
}) => (
  <div className="flex flex-col space-y-2 p-4">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => {
          setActiveTab(tab.id);
          setIsMobileMenuOpen(false);
        }}
        className={`px-4 py-3 text-left transition-all duration-300 ${
          isStealthOps
            ? `${textColors.primary || "text-white"} ${
                activeTab === tab.id
                  ? "tactical-button tactical-glow bg-gray-800 border-green-400 text-green-400"
                  : "hover:bg-gray-800 hover:text-green-400 border border-gray-600"
              }`
            : `rounded-xl ${
                activeTab === tab.id
                  ? `${isDarkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"} shadow-sm`
                  : `text-muted-foreground hover:bg-accent hover:text-accent-foreground`
              }`
        }`}
        style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
      >
        {isStealthOps ? `[${tab.label.toUpperCase()}]` : tab.label}
      </button>
    ))}
  </div>
);

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  globalSearchTerm,
  setGlobalSearchTerm,
  isOnline,
  cloudSyncEnabled,
  isAuthenticated,
  syncStatus,
  lastSyncTime,
  isLoggingOut,
  isMobile,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isDarkMode,
  isStealthOps,
  textColors,
  glassSecondaryStyles,
  triggerDataSync,
  dataSyncManager,
  openSettingsModal,
  handleQuickLogout,
  handleConfirmLogout,
}) => {
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
    <div
      className={`backdrop-blur-xl sticky top-0 z-40 ${isStealthOps ? "tactical-border" : ""}`}
      style={{
        backgroundColor: glassSecondaryStyles.backgroundColor,
        backdropFilter: glassSecondaryStyles.backdropFilter,
        WebkitBackdropFilter: glassSecondaryStyles.WebkitBackdropFilter,
        borderRadius: glassSecondaryStyles.borderRadius,
        boxShadow: glassSecondaryStyles.boxShadow,
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: isStealthOps
          ? "#333333"
          : isDarkMode
            ? "rgba(75, 85, 99, 0.2)"
            : "rgba(229, 231, 235, 0.5)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: App Title and Navigation */}
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-8 min-w-0">
            <h1
              className={`text-lg sm:text-xl lg:text-2xl font-semibold ${safeTextColors.primary} drop-shadow-sm flex-shrink-0`}
            >
              <span
                className={`${
                  isStealthOps
                    ? "text-green-400 tactical-text-glow"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
                } gradient-text`}
              >
                {isStealthOps ? "[SUBTRACKER]" : "SubTracker"}
              </span>
            </h1>

            {/* Desktop Tab Navigation - SIMPLIFIED AND WORKING */}
            <nav className="hidden lg:flex space-x-2 p-1 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg border border-white/10 dark:border-gray-700/20">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button with tactical styling and FIXED ACCESSIBILITY */}
            {isMobile && (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`lg:hidden h-9 w-9 p-0 backdrop-blur-sm transition-all duration-300 ${
                      isStealthOps
                        ? "tactical-button border border-gray-600 hover:border-green-400 text-green-400"
                        : `${isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-white/50 hover:bg-white/70"} rounded-lg`
                    }`}
                    aria-label="Open menu"
                    style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                  >
                    <Menu
                      className={`w-4 h-4 ${isStealthOps ? "text-green-400" : safeTextColors.primary}`}
                    />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className={`w-64 p-0 border-0 ${isStealthOps ? "tactical-surface" : ""}`}
                  style={glassSecondaryStyles}
                  aria-describedby="mobile-navigation-description"
                >
                  <SheetHeader className="py-6">
                    <SheetTitle className={`text-lg font-semibold ${safeTextColors.onGlass}`}>
                      {isStealthOps ? "[NAVIGATION]" : "Navigation"}
                    </SheetTitle>
                    <SheetDescription
                      id="mobile-navigation-description"
                      className={safeTextColors.muted}
                    >
                      {isStealthOps
                        ? "[NAVIGATE BETWEEN APP SECTIONS]"
                        : "Navigate between app sections"}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="pb-6">
                    <MobileNavigation
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      setIsMobileMenuOpen={setIsMobileMenuOpen}
                      textColors={safeTextColors}
                      isStealthOps={isStealthOps}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* Right: Actions and Profile with enhanced tactical styling */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Enhanced Sync Status Indicator with tactical styling */}
            <div
              className={`flex items-center gap-1 ${getSyncStatusColor(isOnline, cloudSyncEnabled, isAuthenticated, syncStatus, isStealthOps)}`}
              title={getSyncStatusText(
                isAuthenticated,
                isOnline,
                cloudSyncEnabled,
                syncStatus,
                isStealthOps
              )}
            >
              <SyncIcon className="w-4 h-4" />
              <Badge
                variant="secondary"
                className={`text-xs ${getSyncStatusColor(isOnline, cloudSyncEnabled, isAuthenticated, syncStatus, isStealthOps)} bg-opacity-20 hidden sm:flex border-0 ${
                  isStealthOps
                    ? "font-mono tracking-wide tactical-surface border border-gray-600"
                    : ""
                }`}
                style={{
                  backgroundColor: getSyncStatusColor(
                    isOnline,
                    cloudSyncEnabled,
                    isAuthenticated,
                    syncStatus,
                    isStealthOps
                  ).includes("red")
                    ? "rgba(239, 68, 68, 0.1)"
                    : getSyncStatusColor(
                          isOnline,
                          cloudSyncEnabled,
                          isAuthenticated,
                          syncStatus,
                          isStealthOps
                        ).includes("orange")
                      ? "rgba(249, 115, 22, 0.1)"
                      : getSyncStatusColor(
                            isOnline,
                            cloudSyncEnabled,
                            isAuthenticated,
                            syncStatus,
                            isStealthOps
                          ).includes("yellow")
                        ? "rgba(245, 158, 11, 0.1)"
                        : getSyncStatusColor(
                              isOnline,
                              cloudSyncEnabled,
                              isAuthenticated,
                              syncStatus,
                              isStealthOps
                            ).includes("blue")
                          ? "rgba(59, 130, 246, 0.1)"
                          : getSyncStatusColor(
                                isOnline,
                                cloudSyncEnabled,
                                isAuthenticated,
                                syncStatus,
                                isStealthOps
                              ).includes("green")
                            ? "rgba(34, 197, 94, 0.1)"
                            : "rgba(107, 114, 128, 0.1)",
                  borderRadius: isStealthOps ? "0.125rem" : undefined,
                }}
              >
                {getSyncStatusText(
                  isAuthenticated,
                  isOnline,
                  cloudSyncEnabled,
                  syncStatus,
                  isStealthOps
                )}
              </Badge>
            </div>

            {/* Search with enhanced tactical styling */}
            <div className="relative hidden md:block">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  isStealthOps ? "text-green-400" : safeTextColors.muted
                }`}
              />
              <Input
                placeholder={isStealthOps ? "[SEARCH...]" : "Search..."}
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                className={`pl-10 w-36 lg:w-48 backdrop-blur-sm ${safeTextColors.onGlass} transition-all duration-300 ${
                  isStealthOps
                    ? "tactical-input border border-gray-600 focus:border-green-400 focus:tactical-glow placeholder:text-gray-500"
                    : isDarkMode
                      ? "bg-gray-700/50 border-gray-600 placeholder:text-gray-400 focus:border-gray-500 rounded-lg"
                      : "bg-white/50 border-gray-200 placeholder:text-gray-500 focus:border-gray-300 rounded-lg"
                }`}
                style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
              />
            </div>

            {/* Sync Button with tactical styling */}
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 w-9 p-0 backdrop-blur-sm transition-all duration-300 ${
                isStealthOps
                  ? "tactical-button border border-gray-600 hover:border-green-400 text-green-400"
                  : isDarkMode
                    ? "bg-gray-700/50 hover:bg-gray-600 rounded-lg"
                    : "bg-white/50 hover:bg-white/70 rounded-lg"
              }`}
              onClick={triggerDataSync}
              disabled={!isOnline || !cloudSyncEnabled || dataSyncManager.isSyncInProgress()}
              aria-label="Sync data"
              style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isStealthOps ? "text-green-400" : safeTextColors.primary
                } ${dataSyncManager.isSyncInProgress() ? "animate-spin" : ""}`}
              />
            </Button>

            {/* Enhanced Profile Dropdown with comprehensive tactical styling */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 h-9 px-2 sm:px-3 backdrop-blur-sm transition-all duration-300 ${
                    isStealthOps
                      ? "tactical-button border border-gray-600 hover:border-green-400"
                      : isDarkMode
                        ? "bg-gray-700/50 hover:bg-gray-600 rounded-lg"
                        : "bg-white/50 hover:bg-white/70 rounded-lg"
                  }`}
                  aria-label="User menu"
                  disabled={isLoggingOut}
                  style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                >
                  <Avatar
                    className={`h-7 w-7 ring-2 ${
                      isStealthOps
                        ? "ring-green-400"
                        : isDarkMode
                          ? "ring-gray-600"
                          : "ring-gray-200"
                    }`}
                    style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                  >
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback
                      className={`text-sm ${
                        isStealthOps
                          ? "bg-black border border-green-400 text-green-400 font-mono font-bold"
                          : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                      }`}
                      style={isStealthOps ? { borderRadius: "0.125rem" } : undefined}
                    >
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`text-sm font-medium ${safeTextColors.primary} hidden sm:block max-w-20 lg:max-w-32 truncate`}
                  >
                    {isStealthOps ? `[${user?.name?.toUpperCase() || "USER"}]` : user?.name}
                  </span>
                  <ChevronDown className={`w-3 h-3 ${safeTextColors.muted} hidden sm:block`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`w-56 border-0 ${isStealthOps ? "tactical-surface font-mono" : "rounded-2xl"}`}
                style={glassSecondaryStyles}
              >
                <DropdownMenuLabel className={`font-normal ${safeTextColors.onGlass}`}>
                  <div className="flex flex-col space-y-1">
                    <p
                      className={`text-sm font-medium leading-none ${
                        isStealthOps ? "text-green-400 tracking-wide" : ""
                      }`}
                    >
                      {isStealthOps ? `[${user?.name?.toUpperCase() || "USER"}]` : user?.name}
                    </p>
                    <p className={`text-xs leading-none ${safeTextColors.muted}`}>
                      {isStealthOps ? `[${user?.email?.toUpperCase() || "EMAIL"}]` : user?.email}
                    </p>
                    {lastSyncTime && (
                      <p className={`text-xs leading-none ${safeTextColors.muted}`}>
                        {isStealthOps ? "[SYNC: " : "Last sync: "}
                        {new Date(lastSyncTime).toLocaleTimeString()}
                        {isStealthOps ? "]" : ""}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator
                  className={
                    isStealthOps ? "bg-gray-700" : isDarkMode ? "bg-gray-600" : "bg-gray-200"
                  }
                />
                <DropdownMenuItem
                  onClick={openSettingsModal}
                  className={`cursor-pointer ${safeTextColors.onGlass} ${
                    isStealthOps
                      ? "hover:bg-gray-800 hover:text-green-400 font-mono tracking-wide"
                      : `hover:${isDarkMode ? "bg-gray-600" : "bg-gray-100"}`
                  }`}
                >
                  <User className={`mr-2 h-4 w-4 ${isStealthOps ? "text-green-400" : ""}`} />
                  <span>{isStealthOps ? "[PROFILE & SETTINGS]" : "Profile & Settings"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator
                  className={
                    isStealthOps ? "bg-gray-700" : isDarkMode ? "bg-gray-600" : "bg-gray-200"
                  }
                />

                {/* Enhanced Logout Options with tactical styling */}
                <DropdownMenuItem
                  onClick={handleQuickLogout}
                  className={`cursor-pointer focus:text-blue-400 hover:bg-blue-500/10 ${
                    isStealthOps
                      ? "text-green-400 hover:bg-green-500/10 hover:text-green-300 font-mono tracking-wide"
                      : "text-blue-500"
                  }`}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2
                      className={`mr-2 h-4 w-4 animate-spin ${isStealthOps ? "text-green-400" : ""}`}
                    />
                  ) : (
                    <LogOut className={`mr-2 h-4 w-4 ${isStealthOps ? "text-green-400" : ""}`} />
                  )}
                  <span>{isStealthOps ? "[QUICK SIGN OUT]" : "Quick Sign Out"}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleConfirmLogout}
                  className={`cursor-pointer focus:text-red-400 hover:bg-red-500/10 ${
                    isStealthOps
                      ? "text-red-400 hover:bg-red-500/10 hover:text-red-300 font-mono tracking-wide"
                      : "text-red-500"
                  }`}
                  disabled={isLoggingOut}
                >
                  <LogOut className={`mr-2 h-4 w-4 ${isStealthOps ? "text-red-400" : ""}`} />
                  <span>{isStealthOps ? "[SIGN OUT]" : "Sign Out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};
