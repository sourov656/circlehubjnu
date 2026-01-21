import { LucideIcon } from "lucide-react";
import {
  Home,
  Search,
  MapPin,
  Share2,
  LayoutDashboard,
  Users,
  Sparkles,
  Handshake,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  FileText,
  Package,
  Settings,
  User,
  MessageSquare,
} from "lucide-react";

/**
 * User roles in the system
 */
export type UserRole = "student" | "admin" | "moderator" | "support_staff";

/**
 * Route configuration for navigation menu
 */
export interface RouteConfig {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[]; // Roles that can access this route
  showInNav: boolean; // Should show in main navigation
  description?: string;
}

/**
 * Public routes accessible by all users (including non-authenticated)
 */
export const PUBLIC_ROUTES: RouteConfig[] = [
  {
    name: "Home",
    href: "/",
    icon: Home,
    roles: ["student", "admin", "moderator", "support_staff"],
    showInNav: true,
    description: "Home page with all items",
  },
  {
    name: "Lost",
    href: "/lost",
    icon: Search,
    roles: ["student", "admin", "moderator", "support_staff"],
    showInNav: true,
    description: "Browse lost items",
  },
  {
    name: "Found",
    href: "/found",
    icon: MapPin,
    roles: ["student", "admin", "moderator", "support_staff"],
    showInNav: true,
    description: "Browse found items",
  },
  {
    name: "Share",
    href: "/share",
    icon: Share2,
    roles: ["student", "admin", "moderator", "support_staff"],
    showInNav: true,
    description: "Browse shared items",
  },
];

/**
 * User-specific routes (require authentication)
 */
export const USER_ROUTES: RouteConfig[] = [
  {
    name: "My Items",
    href: "/my-items",
    icon: Package,
    roles: ["student", "admin", "moderator", "support_staff"],
    showInNav: false,
    description: "View your posted items",
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
    roles: ["student", "admin", "moderator", "support_staff"],
    showInNav: false,
    description: "View and edit your profile",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["student", "admin", "moderator", "support_staff"],
    showInNav: false,
    description: "Account settings",
  },
];

/**
 * Admin dashboard routes (for admin, moderator, support_staff roles)
 * Path: /admin/**
 * Sidebar will filter based on user role permissions
 */
export const ADMIN_DASHBOARD_ROUTES: RouteConfig[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["admin", "moderator", "support_staff"],
    showInNav: true,
    description: "Admin dashboard overview",
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
    showInNav: true,
    description: "Manage all users",
  },
  {
    name: "Lost Items",
    href: "/admin/lost-items",
    icon: Search,
    roles: ["admin", "moderator", "support_staff"],
    showInNav: true,
    description: "Manage lost items",
  },
  {
    name: "Found Items",
    href: "/admin/found-items",
    icon: Sparkles,
    roles: ["admin", "moderator", "support_staff"],
    showInNav: true,
    description: "Manage found items",
  },
  {
    name: "Share Items",
    href: "/admin/share-items",
    icon: Handshake,
    roles: ["admin", "moderator"],
    showInNav: true,
    description: "Manage shared items",
  },
  {
    name: "Claims",
    href: "/admin/claims",
    icon: ClipboardList,
    roles: ["admin", "moderator", "support_staff"],
    showInNav: true,
    description: "Manage item claims",
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: AlertTriangle,
    roles: ["admin", "moderator"],
    showInNav: true,
    description: "View user reports",
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: TrendingUp,
    roles: ["admin"],
    showInNav: true,
    description: "View platform analytics",
  },
  {
    name: "Audit Logs",
    href: "/admin/logs",
    icon: FileText,
    roles: ["admin"],
    showInNav: true,
    description: "View audit logs",
  },
  {
    name: "Support",
    href: "/admin/support",
    icon: MessageSquare,
    roles: ["support_staff"],
    showInNav: true,
    description: "Support tickets (support staff only)",
  },
];

/**
 * Moderator/Support routes (for moderator and support_staff roles)
 * Path: /admin/**
 */
export const MODERATOR_ROUTES: RouteConfig[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["moderator", "support_staff"],
    showInNav: true,
    description: "Moderator dashboard",
  },
  {
    name: "Lost Items",
    href: "/admin/lost-items",
    icon: Search,
    roles: ["moderator", "support_staff"],
    showInNav: true,
    description: "Manage lost items",
  },
  {
    name: "Found Items",
    href: "/admin/found-items",
    icon: Sparkles,
    roles: ["moderator", "support_staff"],
    showInNav: true,
    description: "Manage found items",
  },
  {
    name: "Share Items",
    href: "/admin/share-items",
    icon: Handshake,
    roles: ["moderator"],
    showInNav: true,
    description: "Manage shared items (moderator only)",
  },
  {
    name: "Claims",
    href: "/admin/claims",
    icon: ClipboardList,
    roles: ["moderator", "support_staff"],
    showInNav: true,
    description: "Manage claims",
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: AlertTriangle,
    roles: ["moderator"],
    showInNav: true,
    description: "View reports (moderator only)",
  },
  {
    name: "Support",
    href: "/admin/support",
    icon: MessageSquare,
    roles: ["support_staff"],
    showInNav: true,
    description: "Support tickets (support staff only)",
  },
];

/**
 * Get accessible routes for a specific user role
 */
export function getAccessibleRoutes(role: UserRole | null): RouteConfig[] {
  if (!role) {
    return PUBLIC_ROUTES;
  }

  // Combine all routes
  const all_routes = [
    ...PUBLIC_ROUTES,
    ...USER_ROUTES,
    ...ADMIN_DASHBOARD_ROUTES,
  ];

  // Filter by role
  return all_routes.filter((route) => route.roles.includes(role));
}

/**
 * Get navigation menu items based on user role
 */
export function getNavigationItems(
  role: UserRole | null,
  isAuthenticated: boolean,
): RouteConfig[] {
  if (!isAuthenticated) {
    return PUBLIC_ROUTES.filter((route) => route.showInNav);
  }

  const accessible_routes = getAccessibleRoutes(role);
  return accessible_routes.filter((route) => route.showInNav);
}

/**
 * Check if user has access to a specific route
 */
export function hasRouteAccess(route: string, role: UserRole | null): boolean {
  const accessible_routes = getAccessibleRoutes(role);
  return accessible_routes.some((r) => route.startsWith(r.href));
}

/**
 * Get dashboard routes based on user role
 */
export function getDashboardRoutes(role: UserRole): RouteConfig[] {
  if (role === "admin") {
    return ADMIN_DASHBOARD_ROUTES;
  } else if (role === "moderator" || role === "support_staff") {
    return MODERATOR_ROUTES.filter((route) => route.roles.includes(role));
  }
  return [];
}

/**
 * Get default redirect path after login based on user role
 */
export function getDefaultRedirectPath(role: UserRole): string {
  switch (role) {
    case "admin":
    case "moderator":
    case "support_staff":
      return "/admin";
    case "student":
    default:
      return "/";
  }
}
