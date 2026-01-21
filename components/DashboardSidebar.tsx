"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Home, LogOut } from "lucide-react";
import type { RouteConfig } from "@/config/routes.config";
import { useAuth } from "@/contexts/auth-context";

interface DashboardSidebarProps {
  nav_items: RouteConfig[];
  title: string;
  user_role_label: string;
}

export default function DashboardSidebar({
  nav_items,
  title,
  user_role_label,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebar_open, set_sidebar_open] = useState(true);

  return (
    <aside
      className={`bg-background border-r border-border transition-all duration-300 ${
        sidebar_open ? "w-64" : "w-20"
      }`}
    >
      <div className="sticky top-0 h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebar_open && (
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
          )}
          <button
            onClick={() => set_sidebar_open(!sidebar_open)}
            className="p-2 rounded-lg hover:bg-muted text-foreground"
            title={sidebar_open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebar_open ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Home Button */}
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-foreground hover:bg-muted border border-border mb-3"
            title="Back to Home"
          >
            <Home size={20} />
            {sidebar_open && <span className="text-sm font-medium">Home</span>}
          </Link>

          {/* Dashboard Navigation Items */}
          {nav_items.map((item) => {
            const is_active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const IconComponent = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  is_active
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
                title={sidebar_open ? undefined : item.name}
              >
                <IconComponent size={20} />
                {sidebar_open && <span className="text-sm">{item.name}</span>}
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full mt-3 border border-red-200 dark:border-red-800"
            title="Logout"
          >
            <LogOut size={20} />
            {sidebar_open && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {sidebar_open && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 truncate font-medium">
                  {user_role_label}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
