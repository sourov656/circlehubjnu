"use client";

import { AdminProvider } from "@/contexts/admin-context";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { filterDashboardRoutes } from "@/utils/navigation-filter";
import type { UserRole } from "@/config/routes.config";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Get filtered navigation items based on user role
  const nav_items = useMemo(() => {
    if (!user) return [];
    return filterDashboardRoutes(user.role as UserRole);
  }, [user]);

  // Get role display name
  const role_display = useMemo(() => {
    if (!user) return "";
    switch (user.role) {
      case "admin":
        return "Administrator";
      case "moderator":
        return "Moderator";
      case "support_staff":
        return "Support Staff";
      default:
        return user.role;
    }
  }, [user]);

  useEffect(() => {
    if (
      !isLoading &&
      (!user || !["admin", "moderator", "support_staff"].includes(user.role))
    ) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (
    isLoading ||
    !user ||
    !["admin", "moderator", "support_staff"].includes(user.role)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AdminProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-800 flex">
        {/* Sidebar */}
        <DashboardSidebar
          nav_items={nav_items}
          title={user.role === "admin" ? "Admin Dashboard" : "Admin Panel"}
          user_role_label={role_display}
        />

        {/* Main Content */}
        <main className="flex-1">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </AdminProvider>
  );
}
