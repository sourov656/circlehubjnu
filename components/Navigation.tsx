"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  ChevronDown,
  BookOpen,
  Bell,
  Package,
  Shield,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/auth-context";
import Logo from "@/components/Logo";

import { PUBLIC_ROUTES } from "@/config/routes.config";

export default function Navigation() {
  const pathname = usePathname();
  const { setTheme, actualTheme, mounted } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Always show only public routes in navbar
  const menuItems = useMemo(() => {
    return PUBLIC_ROUTES.filter((route) => route.showInNav);
  }, []);

  // Get dashboard/admin link based on user role
  const dashboardLink = useMemo(() => {
    if (!user || !isAuthenticated) return null;

    // All admin roles go to /admin
    switch (user.role) {
      case "admin":
      case "moderator":
      case "support_staff":
        return { href: "/admin", label: "Dashboard" };
      default:
        return null;
    }
  }, [user, isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  const toggleTheme = () => {
    const newTheme = actualTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo size="md" showText={true} />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Dashboard Link for authenticated users */}
              {isAuthenticated && dashboardLink && (
                <Link
                  href={dashboardLink.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(dashboardLink.href)
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>{dashboardLink.label}</span>
                </Link>
              )}
            </div>

            {/* Right side - Theme Toggle, User Menu */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                title={
                  mounted
                    ? `Switch to ${
                        actualTheme === "light" ? "dark" : "light"
                      } mode`
                    : "Toggle theme"
                }
              >
                {!mounted ? (
                  <div className="w-5 h-5" /> // Placeholder to prevent layout shift
                ) : actualTheme === "light" ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
              </button>

              {/* User Menu - Desktop Only */}
              {isAuthenticated ? (
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-foreground">
                      {user?.name || "User"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-lg border border-border py-1 z-50">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground">
                          {user?.name || "User"}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>

                      <Link
                        href="/my-items"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>My Items</span>
                      </Link>

                      <Link
                        href="/claims"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Package className="w-4 h-4" />
                        <span>Claims</span>
                      </Link>

                      <hr className="border-border my-1" />

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center space-x-3 w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
        <div className="flex justify-around items-center h-16">
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}

          {/* Dashboard Link or User Menu */}
          {isAuthenticated && dashboardLink ? (
            <Link
              href={dashboardLink.href}
              className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive(dashboardLink.href)
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground"
              }`}
            >
              <Shield className="w-6 h-6" />
              <span className="text-xs font-medium">Dashboard</span>
            </Link>
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                  isDropdownOpen
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground"
                }`}
              >
                <User className="w-6 h-6" />
                <span className="text-xs font-medium">Profile</span>
              </button>

              {/* Mobile Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-56 bg-card rounded-lg shadow-lg border border-border py-1 z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">
                      {user?.name || "User"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-foreground hover:bg-muted"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/settings"
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-foreground hover:bg-muted"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>

                  <Link
                    href="/my-items"
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-foreground hover:bg-muted"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>My Items</span>
                  </Link>

                  <Link
                    href="/notifications"
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-foreground hover:bg-muted"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </Link>

                  <hr className="border-border my-1" />

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center space-x-3 w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg text-muted-foreground transition-colors"
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Login</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
