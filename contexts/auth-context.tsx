"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types/auth.types";

// Auth Context Type
interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  university?: string;
  studentId?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = "campus_connect_access_token";
const REFRESH_TOKEN_KEY = "campus_connect_refresh_token";
const USER_KEY = "campus_connect_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Clear auth data function (defined early for use in other functions)
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAccessToken(null);
    setUser(null);
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
  }, []);

  // Logout function (defined early for use in other functions)
  const logout = useCallback(() => {
    clearAuthData();
    // Redirect to login page
    router.push("/login");
  }, [clearAuthData, router]);

  // Clear refresh timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // Refresh access token using refresh token
  const refreshAccessToken = useCallback(async () => {
    try {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!storedRefreshToken) {
        logout();
        return;
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
          return data;
        } else {
          logout();
        }
      } else {
        // Refresh token is invalid or expired, logout user
        logout();
      }
    } catch (error) {
      console.error("Error refreshing access token:", error);
      logout();
    }
  }, [logout]);

  // Auto-refresh access token before expiry
  const scheduleTokenRefresh = useCallback(
    (expiresIn: number) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      // Refresh token 1 minute before expiry
      const refreshTime = Math.max(0, (expiresIn - 60) * 1000);

      refreshTimerRef.current = setTimeout(async () => {
        const refreshResult = await refreshAccessToken();
        // Schedule next refresh if successful
        if (refreshResult?.expiresIn) {
          scheduleTokenRefresh(refreshResult.expiresIn);
        }
      }, refreshTime);
    },
    [refreshAccessToken],
  );

  // Fetch current user from API using token
  const fetchCurrentUser = useCallback(
    async (authToken: string) => {
      console.log("Auth: Fetching current user...");
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        console.log("Auth: /api/auth/me response:", {
          status: response.status,
          ok: response.ok,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Auth: Current user data received:", {
            hasUser: !!data.user,
            userId: data.user?.id,
          });
          if (data.user) {
            setUser(data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            return true;
          }
        } else {
          // Parse error response
          const errorData = await response.json().catch(() => null);

          // Check for token expired error
          if (
            errorData?.success === false &&
            (errorData?.error === "INVALID_TOKEN" ||
              errorData?.error === "TOKEN_EXPIRED") &&
            (errorData?.message?.toLowerCase().includes("token expired") ||
              errorData?.message?.toLowerCase().includes("invalid token"))
          ) {
            console.warn("Auth: Token expired, logging out...");
            logout();
            return false;
          }

          // Handle 401 - try to refresh token
          if (response.status === 401) {
            console.warn("Auth: Token invalid (401), attempting refresh...");
            // Token is invalid, try to refresh
            const refreshResult = await refreshAccessToken();
            if (refreshResult?.accessToken) {
              // Retry with new token
              console.log("Auth: Token refreshed, retrying fetchCurrentUser");
              return await fetchCurrentUser(refreshResult.accessToken);
            } else {
              console.error("Auth: Token refresh failed");
            }
          } else {
            console.error("Auth: Unexpected response status:", response.status);
          }
        }
        return false;
      } catch (error) {
        console.error("Auth: Error fetching current user:", error);
        return false;
      }
    },
    [refreshAccessToken, logout],
  );

  // Load user from localStorage and verify token on mount
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        console.log("Auth: Loading user from localStorage", {
          hasToken: !!storedAccessToken,
          hasUser: !!storedUser,
        });

        if (storedAccessToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);

          // Only update state if component is still mounted
          if (!mounted) return;

          // Set user and token immediately for better UX
          setAccessToken(storedAccessToken);
          setUser(parsedUser);
          setIsLoading(false);

          console.log("Auth: User loaded from localStorage", {
            userId: parsedUser.id,
            role: parsedUser.role,
          });

          // Verify token in background - but don't clear auth if it fails
          // Token might still be valid even if API call fails temporarily
          try {
            const response = await fetch("/api/auth/me", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${storedAccessToken}`,
              },
            });

            console.log("Auth: /api/auth/me response:", {
              status: response.status,
              ok: response.ok,
            });

            if (response.ok) {
              const data = await response.json();
              if (data.user && mounted) {
                setUser(data.user);
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
              }
            } else {
              // Check for token expired error
              const errorData = await response.json().catch(() => null);
              if (
                errorData?.success === false &&
                (errorData?.error === "INVALID_TOKEN" ||
                  errorData?.error === "TOKEN_EXPIRED") &&
                (errorData?.message?.toLowerCase().includes("token expired") ||
                  errorData?.message?.toLowerCase().includes("invalid token"))
              ) {
                console.warn(
                  "Auth: Token expired during verification, logging out...",
                );
                if (mounted) {
                  logout();
                }
              }
            }
            // Don't clear auth on other failures - token might still be valid
          } catch (err) {
            console.warn("Auth: Background verification failed:", err);
            // Keep user logged in even if verification fails
          }
        } else {
          console.log("Auth: No stored credentials found");
          if (mounted) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Auth: Error loading user:", error);
        if (mounted) {
          // Clear invalid data
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setAccessToken(null);
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (accessToken) {
      await fetchCurrentUser(accessToken);
    }
  }, [accessToken, fetchCurrentUser]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.user && data.tokens) {
        console.log("Login successful:", {
          user: data.user,
          hasTokens: !!data.tokens,
        });
        setUser(data.user);
        setAccessToken(data.tokens.accessToken);
        localStorage.setItem(ACCESS_TOKEN_KEY, data.tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.tokens.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));

        // Schedule token refresh
        if (data.tokens.expiresIn) {
          scheduleTokenRefresh(data.tokens.expiresIn);
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Google Sign In function
  const loginWithGoogle = async () => {
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Google sign-in failed");
      }

      if (data.url) {
        // Redirect to Google OAuth URL
        window.location.href = data.url;
      } else {
        throw new Error("No OAuth URL received");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      // Registration successful, don't auto-login
      // User needs to login manually after registration
      return;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshUser,
  };

  // Debug: Log auth state changes
  useEffect(() => {
    console.log("Auth State Changed:", {
      isLoading,
      isAuthenticated: !!user && !!accessToken,
      hasUser: !!user,
      hasToken: !!accessToken,
      userId: user?.id,
    });
  }, [user, accessToken, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
