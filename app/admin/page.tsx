"use client";

import { useAdmin } from "@/contexts/admin-context";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Users, Package, ClipboardList, Zap } from "lucide-react";

export default function AdminDashboard() {
  const { overview_stats, loading, fetch_overview } = useAdmin();

  useEffect(() => {
    fetch_overview();
  }, [fetch_overview]);

  if (loading.overview) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <button
          onClick={fetch_overview}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={overview_stats?.total_users || 0}
          trend={overview_stats?.user_growth}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Items"
          value={overview_stats?.total_items || 0}
          trend={overview_stats?.items_trend}
          icon={Package}
          color="green"
        />
        <StatCard
          title="Active Claims"
          value={overview_stats?.active_claims || 0}
          icon={ClipboardList}
          color="purple"
        />
        <StatCard
          title="Today's Activity"
          value={
            (overview_stats?.today_activity?.new_users || 0) +
            (overview_stats?.today_activity?.items_posted || 0) +
            (overview_stats?.today_activity?.claims_made || 0)
          }
          icon={Zap}
          color="orange"
        />
      </div>

      {/* Today's Activity Details */}
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Today's Activity
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {overview_stats?.today_activity?.new_users || 0}
            </div>
            <div className="text-sm text-gray-600">New Users</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {overview_stats?.today_activity?.items_posted || 0}
            </div>
            <div className="text-sm text-gray-600">Items Posted</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {overview_stats?.today_activity?.claims_made || 0}
            </div>
            <div className="text-sm text-gray-600">Claims Made</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Items */}
        <div className="bg-card rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Items
            </h2>
          </div>
          <div className="divide-y divide-border">
            {overview_stats?.recent_activity?.items?.map((item: any) => (
              <div key={item._id} className="p-4 hover:bg-muted">
                <div className="flex items-start gap-3">
                  {item.images?.[0] && (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      by {item.user_id?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      item.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-card rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Users
            </h2>
          </div>
          <div className="divide-y divide-border">
            {overview_stats?.recent_activity?.users?.map((user: any) => (
              <div key={user._id} className="p-4 hover:bg-muted">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(user.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="bg-card rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Claims
          </h2>
        </div>
        <div className="divide-y divide-border">
          {overview_stats?.recent_activity?.claims?.map((claim: any) => (
            <div key={claim._id} className="p-4 hover:bg-muted">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {claim.item_id?.title || "Unknown Item"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Claimed by {claim.claimant_id?.name || "Unknown"}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      claim.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : claim.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {claim.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(claim.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  trend?: number;
  icon: React.ElementType;
  color: string;
}) {
  const color_classes = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-card rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            color_classes[color as keyof typeof color_classes]
          }`}
        >
          <Icon size={24} />
        </div>
        {trend !== undefined && (
          <span
            className={`text-sm font-medium ${
              trend >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend >= 0 ? "↗" : "↘"} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-foreground">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
