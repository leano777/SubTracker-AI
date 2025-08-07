import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Chrome,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Info,
  ExternalLink,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import { useAuth } from "../contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [showGoogleSetup, setShowGoogleSetup] = useState(false);

  const { signIn, signUp, signInWithGoogle, resetPassword, loading, error, googleAuthAvailable } =
    useAuth();

  // Static accessibility ID to prevent undefined values
  const AUTH_DIALOG_DESCRIPTION_ID = "auth-dialog-description";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalLoading(true);

    try {
      if (mode === "signin") {
        const result = await signIn(email, password);
        if (result.success) {
          onClose();
          resetForm();
        } else {
          setLocalError(result.error || "Failed to sign in");
        }
      } else if (mode === "signup") {
        const result = await signUp(email, password, name);
        if (result.success) {
          setLocalError(null);
          // Show success message or switch to signin
          setMode("signin");
          setLocalError("Account created! Please check your email to verify your account.");
        } else {
          setLocalError(result.error || "Failed to create account");
        }
      } else if (mode === "reset") {
        const result = await resetPassword(email);
        if (result.success) {
          setLocalError("Password reset email sent! Check your inbox.");
          setTimeout(() => setMode("signin"), 3000);
        } else {
          setLocalError(result.error || "Failed to send reset email");
        }
      }
    } catch (err) {
      setLocalError("An unexpected error occurred");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setLocalLoading(true);

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        onClose();
        resetForm();
      } else {
        setLocalError(result.error || "Failed to sign in with Google");
        // If Google auth is not available, show setup instructions
        if (!googleAuthAvailable) {
          setShowGoogleSetup(true);
        }
      }
    } catch (err) {
      setLocalError("Failed to sign in with Google");
    } finally {
      setLocalLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setLocalError(null);
    setShowPassword(false);
    setShowGoogleSetup(false);
  };

  const handleModeChange = (newMode: "signin" | "signup" | "reset") => {
    setMode(newMode);
    setLocalError(null);
    setShowGoogleSetup(false);
    resetForm();
  };

  const currentError = localError || error;
  const currentLoading = localLoading || loading;

  const getTitle = () => {
    switch (mode) {
      case "signin":
        return "Welcome Back";
      case "signup":
        return "Create Your Account";
      case "reset":
        return "Reset Password";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "signin":
        return "Sign in to your SubTracker AI account to access your subscription management dashboard";
      case "signup":
        return "Join thousands of users managing their subscriptions with AI-powered insights";
      case "reset":
        return "Enter your email address and we'll send you a link to reset your password";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby={AUTH_DIALOG_DESCRIPTION_ID}>
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">{getTitle()}</DialogTitle>
          <DialogDescription id={AUTH_DIALOG_DESCRIPTION_ID} className="text-muted-foreground">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Google Sign In - Only show for signin/signup and if available */}
          {mode !== "reset" && googleAuthAvailable && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12"
                onClick={handleGoogleSignIn}
                disabled={currentLoading}
              >
                {currentLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Chrome className="w-4 h-4 mr-2" />
                )}
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Google Setup Instructions */}
          {showGoogleSetup && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Google Sign-in Setup Required
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    To enable Google authentication, follow these steps:
                  </p>
                  <ol className="text-sm text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1">
                    <li>Go to your Supabase Dashboard</li>
                    <li>Navigate to Authentication → Providers</li>
                    <li>Enable Google provider and configure OAuth settings</li>
                    <li>Follow the setup guide for Google OAuth</li>
                  </ol>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-blue-600 border-blue-300 hover:bg-blue-100"
                    onClick={() =>
                      window.open(
                        "https://supabase.com/docs/guides/auth/social-login/auth-google",
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Setup Guide
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {currentError && !showGoogleSetup && (
            <Alert
              variant={
                currentError.includes("sent") || currentError.includes("created")
                  ? "default"
                  : "destructive"
              }
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{currentError}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field - only for signup */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                    disabled={currentLoading}
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={currentLoading}
                />
              </div>
            </div>

            {/* Password field - not for reset */}
            {mode !== "reset" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={currentLoading}
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={currentLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={currentLoading}
            >
              {currentLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {mode === "signin" && "Sign In"}
              {mode === "signup" && "Create Account"}
              {mode === "reset" && "Send Reset Link"}
            </Button>
          </form>

          {/* OAuth Configuration Notice */}
          {mode !== "reset" && !googleAuthAvailable && (
            <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <div className="space-y-1">
                  <p className="font-medium">Google Sign-in Unavailable</p>
                  <p className="text-sm">
                    Google authentication is not configured. Please use email and password to sign
                    in.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Mode Switching */}
          <div className="text-center text-sm">
            {mode === "signin" && (
              <>
                <p className="text-muted-foreground mb-2">
                  Don't have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto font-medium"
                    onClick={() => handleModeChange("signup")}
                  >
                    Sign up
                  </Button>
                </p>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-medium text-xs"
                  onClick={() => handleModeChange("reset")}
                >
                  Forgot your password?
                </Button>
              </>
            )}

            {mode === "signup" && (
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-medium"
                  onClick={() => handleModeChange("signin")}
                >
                  Sign in
                </Button>
              </p>
            )}

            {mode === "reset" && (
              <p className="text-muted-foreground">
                Remember your password?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-medium"
                  onClick={() => handleModeChange("signin")}
                >
                  Sign in
                </Button>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
