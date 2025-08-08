import { User, LogOut, Settings, CreditCard, Bell, HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../contexts/AuthContext"; // Updated import

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface UserProfileProps {
  onOpenSettings?: () => void;
  onOpenManagement?: () => void;
}

export const UserProfile = ({ onOpenSettings, onOpenManagement }: UserProfileProps) => {
  const { user, signOut, loading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 h-10 px-3">
          <Avatar className="h-8 w-8">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
              {getUserInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium truncate max-w-32">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate max-w-32">{user.email}</div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
        <DropdownMenuLabel className="pb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              <Badge variant="secondary" className="mt-1 text-xs">
                Pro Plan
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-xs text-muted-foreground px-3 py-2">
          Member since {memberSince}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => onOpenSettings?.()}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <User className="h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onOpenManagement?.()}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <CreditCard className="h-4 w-4" />
          <span>Payment Cards</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onOpenSettings?.()}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onOpenSettings?.()}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          <span>App Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
          <HelpCircle className="h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex items-center space-x-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
        >
          <LogOut className="h-4 w-4" />
          <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
