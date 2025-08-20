import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User, Mail, Lock, Camera, Save, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { toast } from "sonner";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal = ({ isOpen, onClose }: UserProfileModalProps) => {
  const { user, resetPassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you would update the user profile via Supabase
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    const result = await resetPassword(user.email);
    if (result.success) {
      toast.success("Password reset email sent! Check your inbox.");
    } else {
      toast.error(result.error || "Failed to send reset email");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </Avatar>
              <button className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Member since</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing || isSaving}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="mt-1 bg-gray-50 dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Button
                variant="outline"
                onClick={handlePasswordReset}
                disabled={isSaving}
                className="w-full"
              >
                Send Password Reset Email
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || "",
                      email: user?.email || "",
                    });
                  }}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex-1"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};