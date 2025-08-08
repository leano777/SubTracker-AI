import { render, screen, waitFor, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import { mockSession, mockUser } from "../utils";

// Mock Supabase client with factory function
vi.mock("../../utils/supabase/client", () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  };

  return {
    supabase: mockSupabase,
  };
});

// Get the mocked supabase instance
const mockSupabase = vi.mocked(await import("../../utils/supabase/client")).supabase;

// Mock localStorage and sessionStorage for corruption tests
const originalLocalStorage = window.localStorage;
const originalSessionStorage = window.sessionStorage;

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default successful session mock
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithAuthProvider = (children: React.ReactNode) => {
    return render(<AuthProvider>{children}</AuthProvider>);
  };

  const useAuthHook = () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    return renderHook(() => useAuth(), { wrapper });
  };

  describe("Initialization", () => {
    it("should initialize with loading state", () => {
      const { result } = useAuthHook();

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should handle successful session initialization", async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = useAuthHook();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        createdAt: mockUser.createdAt,
      });
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.session).toEqual(mockSession);
    });

    it("should handle initialization errors", async () => {
      mockSupabase.auth.getSession.mockRejectedValue(new Error("Init error"));

      const { result } = useAuthHook();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Failed to initialize authentication");
    });

    it("should handle corrupted auth session errors", async () => {
      const authSessionError = new Error("Auth session missing");
      mockSupabase.auth.getSession.mockRejectedValue(authSessionError);

      const { result } = useAuthHook();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe(null); // Should clear error for session issues
    });
  });

  describe("Authentication Methods", () => {
    describe("signIn", () => {
      it("should handle successful sign in", async () => {
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockUser, session: mockSession },
          error: null,
        });

        const { result } = useAuthHook();

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const signInResult = await act(async () => {
          return result.current.signIn("test@example.com", "password");
        });

        expect(signInResult.success).toBe(true);
        expect(signInResult.user).toEqual(mockUser);
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password",
        });
      });

      it("should handle sign in errors", async () => {
        const error = new Error("Invalid credentials");
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: null, session: null },
          error,
        });

        const { result } = useAuthHook();

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const signInResult = await act(async () => {
          return result.current.signIn("test@example.com", "wrong-password");
        });

        expect(signInResult.success).toBe(false);
        expect(signInResult.error).toBe("Invalid credentials");
        expect(result.current.error).toBe("Invalid credentials");
      });

      it("should handle network errors", async () => {
        mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error("Network error"));

        const { result } = useAuthHook();

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const signInResult = await act(async () => {
          return result.current.signIn("test@example.com", "password");
        });

        expect(signInResult.success).toBe(false);
        expect(signInResult.error).toBe("Network error");
      });
    });

    describe("signUp", () => {
      it("should handle successful sign up", async () => {
        const newUser = { ...mockUser, id: "new-user-id" };
        mockSupabase.auth.signUp.mockResolvedValue({
          data: { user: newUser, session: null },
          error: null,
        });

        const { result } = useAuthHook();

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const signUpResult = await act(async () => {
          return result.current.signUp("newuser@example.com", "password", "New User");
        });

        expect(signUpResult.success).toBe(true);
        expect(signUpResult.user).toEqual(newUser);
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: "newuser@example.com",
          password: "password",
          options: {
            data: {
              name: "New User",
              full_name: "New User",
            },
          },
        });
      });

      it("should handle sign up errors", async () => {
        const error = new Error("Email already in use");
        mockSupabase.auth.signUp.mockResolvedValue({
          data: { user: null, session: null },
          error,
        });

        const { result } = useAuthHook();

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const signUpResult = await act(async () => {
          return result.current.signUp("existing@example.com", "password", "User");
        });

        expect(signUpResult.success).toBe(false);
        expect(signUpResult.error).toBe("Email already in use");
      });
    });

    describe("signInWithGoogle", () => {
      it("should handle successful Google sign in", async () => {
        mockSupabase.auth.signInWithOAuth.mockResolvedValue({
          data: { provider: "google", url: "https://oauth-url" },
          error: null,
        });

        const { result } = useAuthHook();

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const googleSignInResult = await act(async () => {
          return result.current.signInWithGoogle();
        });

        expect(googleSignInResult.success).toBe(true);
        expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: "google",
        });
      });

      it("should handle OAuth configuration errors", async () => {
        const error = new Error("provider is not enabled");
        mockSupabase.auth.signInWithOAuth.mockResolvedValue({
          data: null,
          error,
        });

        const { result } = useAuthHook();

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const googleSignInResult = await act(async () => {
          return result.current.signInWithGoogle();
        });

        expect(googleSignInResult.success).toBe(false);
        expect(googleSignInResult.error).toContain("Google OAuth provider is not enabled");
        expect(result.current.googleAuthAvailable).toBe(false);
      });

      it("should handle redirect URI mismatch errors", async () => {
        const error = new Error("redirect_uri_mismatch");
        mockSupabase.auth.signInWithOAuth.mockResolvedValue({
          data: null,
          error,
        });

        const { result } = useAuthHook();

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        const googleSignInResult = await act(async () => {
          return result.current.signInWithGoogle();
        });

        expect(googleSignInResult.success).toBe(false);
        expect(googleSignInResult.error).toContain("redirect URI");
        expect(result.current.googleAuthAvailable).toBe(false);
      });
    });

    describe("signOut", () => {
      it("should handle successful sign out", async () => {
        mockSupabase.auth.signOut.mockResolvedValue({
          error: null,
        });

        // Start with authenticated state
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        const { result } = useAuthHook();

        await waitFor(() => {
          expect(result.current.isAuthenticated).toBe(true);
        });

        const signOutResult = await act(async () => {
          return result.current.signOut();
        });

        expect(signOutResult.success).toBe(true);
        expect(result.current.user).toBe(null);
        expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      });

      it("should handle sign out errors", async () => {
        const error = new Error("Sign out failed");
        mockSupabase.auth.signOut.mockResolvedValue({
          error,
        });

        const { result } = useAuthHook();

        const signOutResult = await act(async () => {
          return result.current.signOut();
        });

        expect(signOutResult.success).toBe(false);
        expect(signOutResult.error).toBe("Sign out failed");
      });

      it("should handle missing Supabase client", async () => {
        // Mock missing supabase
        vi.mocked(mockSupabase.auth.signOut).mockImplementation(() => {
          throw new Error("Authentication service not available - supabase client missing");
        });

        const { result } = useAuthHook();

        const signOutResult = await act(async () => {
          return result.current.signOut();
        });

        expect(signOutResult.success).toBe(false);
        expect(signOutResult.error).toContain("Authentication service not available");
      });
    });

    describe("forceSignOut", () => {
      const mockReload = vi.fn();

      beforeEach(() => {
        Object.defineProperty(window, "location", {
          value: { reload: mockReload },
          writable: true,
        });
      });

      it("should force sign out and clear storage", async () => {
        const { result } = useAuthHook();

        const forceSignOutResult = await act(async () => {
          return result.current.forceSignOut();
        });

        expect(forceSignOutResult.success).toBe(true);
        expect(result.current.user).toBe(null);

        // Should schedule page reload
        await waitFor(() => {
          expect(mockReload).toHaveBeenCalled();
        });
      });
    });

    describe("resetPassword", () => {
      it("should handle successful password reset", async () => {
        mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
          data: {},
          error: null,
        });

        const { result } = useAuthHook();

        const resetResult = await act(async () => {
          return result.current.resetPassword("test@example.com");
        });

        expect(resetResult.success).toBe(true);
        expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith("test@example.com", {
          redirectTo: `${window.location.origin}/reset-password`,
        });
      });

      it("should handle password reset errors", async () => {
        const error = new Error("Email not found");
        mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
          data: null,
          error,
        });

        const { result } = useAuthHook();

        const resetResult = await act(async () => {
          return result.current.resetPassword("nonexistent@example.com");
        });

        expect(resetResult.success).toBe(false);
        expect(resetResult.error).toBe("Email not found");
      });
    });
  });

  describe("Auth State Changes", () => {
    it("should handle SIGNED_IN event", async () => {
      let authStateChangeCallback: any;

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      const { result } = useAuthHook();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate SIGNED_IN event
      act(() => {
        authStateChangeCallback("SIGNED_IN", mockSession);
      });

      expect(result.current.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        createdAt: mockUser.createdAt,
      });
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("should handle SIGNED_OUT event", async () => {
      let authStateChangeCallback: any;

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      // Start with authenticated state
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = useAuthHook();

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Simulate SIGNED_OUT event
      act(() => {
        authStateChangeCallback("SIGNED_OUT", null);
      });

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.session).toBe(null);
    });

    it("should handle TOKEN_REFRESHED event", async () => {
      let authStateChangeCallback: any;
      const refreshedSession = { ...mockSession, access_token: "new-token" };

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      const { result } = useAuthHook();

      // Simulate TOKEN_REFRESHED event
      act(() => {
        authStateChangeCallback("TOKEN_REFRESHED", refreshedSession);
      });

      expect(result.current.session).toEqual(refreshedSession);
      expect(result.current.error).toBe(null);
    });

    it("should handle new user confirmation", async () => {
      let authStateChangeCallback: any;
      const newUserSession = {
        ...mockSession,
        user: {
          ...mockUser,
          email_confirmed_at: new Date().toISOString(), // Just confirmed
        },
      };

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      const { result } = useAuthHook();

      // Simulate SIGNED_IN event with new user
      act(() => {
        authStateChangeCallback("SIGNED_IN", newUserSession);
      });

      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should detect auth session errors", async () => {
      const authSessionError = new Error("refresh token not found");
      mockSupabase.auth.getSession.mockRejectedValue(authSessionError);

      const { result } = useAuthHook();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBe(null);
      expect(result.current.error).toBe(null); // Should clear error for session issues
    });

    it("should clear corrupted auth data", async () => {
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});

      const authSessionError = new Error("AuthSessionMissingError");
      mockSupabase.auth.getSession.mockRejectedValue(authSessionError);

      const { result } = useAuthHook();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should have attempted to clear corrupted data
      expect(spy).toHaveBeenCalledWith(expect.stringContaining("clearing corrupted"));

      spy.mockRestore();
    });

    it("should handle auth state change errors gracefully", async () => {
      let authStateChangeCallback: any;

      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      const { result } = useAuthHook();

      // Simulate error in auth state change
      act(() => {
        try {
          authStateChangeCallback("SIGNED_IN", null); // Invalid session
        } catch (error) {
          // Should handle gracefully
        }
      });

      // Should still be functional
      expect(result.current).toBeDefined();
    });
  });

  describe("Context Usage", () => {
    it("should throw error when used outside provider", () => {
      const TestComponent = () => {
        useAuth(); // This should throw
        return null;
      };

      expect(() => render(<TestComponent />)).toThrow(
        "useAuth must be used within an AuthProvider"
      );
    });

    it("should provide all required context values", () => {
      const { result } = useAuthHook();

      const expectedMethods = [
        "signIn",
        "signUp",
        "signInWithGoogle",
        "signOut",
        "forceSignOut",
        "resetPassword",
      ];

      const expectedProperties = [
        "user",
        "loading",
        "error",
        "isAuthenticated",
        "googleAuthAvailable",
        "session",
      ];

      expectedMethods.forEach((method) => {
        expect(typeof result.current[method as keyof typeof result.current]).toBe("function");
      });

      expectedProperties.forEach((prop) => {
        expect(result.current).toHaveProperty(prop);
      });
    });
  });

  describe("Service Availability", () => {
    it("should handle missing Supabase auth module", async () => {
      // Mock missing auth module
      vi.mocked(mockSupabase).auth = undefined as any;

      const { result } = useAuthHook();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Authentication service not available");
    });
  });
});
