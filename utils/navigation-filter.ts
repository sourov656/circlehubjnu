import type { UserRole, RouteConfig } from "@/config/routes.config";
import {
  getNavigationItems,
  getDashboardRoutes,
  hasRouteAccess,
  getDefaultRedirectPath,
} from "@/config/routes.config";

/**
 * Filter navigation menu items based on user role and authentication status
 */
export function filterNavigationByRole(
  role: UserRole | null,
  isAuthenticated: boolean
): RouteConfig[] {
  return getNavigationItems(role, isAuthenticated);
}

/**
 * Filter dashboard/admin panel routes based on user role
 */
export function filterDashboardRoutes(role: UserRole): RouteConfig[] {
  return getDashboardRoutes(role);
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(route: string, role: UserRole | null): boolean {
  return hasRouteAccess(route, role);
}

/**
 * Get redirect path after login based on user role
 */
export function getLoginRedirectPath(role: UserRole): string {
  return getDefaultRedirectPath(role);
}

/**
 * Check if route is an admin panel route
 */
export function isAdminRoute(path: string): boolean {
  return path.startsWith("/admin");
}

/**
 * Check if user should be redirected based on their role and current path
 */
export function shouldRedirectUser(
  role: UserRole,
  currentPath: string
): { shouldRedirect: boolean; redirectTo: string | null } {
  // Check if user has access to the current route
  if (!canAccessRoute(currentPath, role)) {
    return { shouldRedirect: true, redirectTo: getLoginRedirectPath(role) };
  }

  return { shouldRedirect: false, redirectTo: null };
}
