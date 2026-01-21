"use client";

import { useAdmin } from "@/contexts/admin-context";
import { useEffect } from "react";
import { Users, Package, ClipboardList } from "lucide-react";

export default function AnalyticsPage() {
  const {
    overview_stats,
    users,
    lost_items,
    found_items,
    share_items,
    claims,
    loading,
    fetch_overview,
    fetch_users,
    fetch_lost_items,
    fetch_found_items,
    fetch_share_items,
    fetch_claims,
  } = useAdmin();

  useEffect(() => {
    fetch_overview();
    fetch_users();
    fetch_lost_items();
    fetch_found_items();
    fetch_share_items();
    fetch_claims();
  }, [
    fetch_overview,
    fetch_users,
    fetch_lost_items,
    fetch_found_items,
    fetch_share_items,
    fetch_claims,
  ]);

  const category_stats = {
    electronics: {
      lost: lost_items.filter((i) => i.category === "electronics").length,
      found: found_items.filter((i) => i.category === "electronics").length,
    },
    books: {
      lost: lost_items.filter((i) => i.category === "books").length,
      found: found_items.filter((i) => i.category === "books").length,
    },
    clothing: {
      lost: lost_items.filter((i) => i.category === "clothing").length,
      found: found_items.filter((i) => i.category === "clothing").length,
    },
    accessories: {
      lost: lost_items.filter((i) => i.category === "accessories").length,
      found: found_items.filter((i) => i.category === "accessories").length,
    },
    others: {
      lost: lost_items.filter((i) => i.category === "others").length,
      found: found_items.filter((i) => i.category === "others").length,
    },
  };

  const claim_stats = {
    pending: claims.filter((c) => c.status === "pending").length,
    processing: claims.filter((c) => c.status === "processing").length,
    approved: claims.filter((c) => c.status === "approved").length,
    rejected: claims.filter((c) => c.status === "rejected").length,
    completed: claims.filter((c) => c.status === "completed").length,
  };

  const user_stats = {
    active: users.filter((u) => !u.is_banned).length,
    banned: users.filter((u) => u.is_banned).length,
    verified: users.filter((u) => u.verified).length,
  };

  if (loading.overview || loading.users || loading.items || loading.claims) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics & Insights
        </h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Total Users
            </span>
            <Users className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {overview_stats?.total_users || 0}
          </p>
          {overview_stats?.user_growth !== undefined && (
            <p
              className={`text-sm mt-2 ${
                overview_stats.user_growth >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {overview_stats.user_growth >= 0 ? "↗" : "↘"}{" "}
              {Math.abs(overview_stats.user_growth).toFixed(1)}% from last month
            </p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Total Items
            </span>
            <Package className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {overview_stats?.total_items || 0}
          </p>
          {overview_stats?.items_trend !== undefined && (
            <p
              className={`text-sm mt-2 ${
                overview_stats.items_trend >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {overview_stats.items_trend >= 0 ? "↗" : "↘"}{" "}
              {Math.abs(overview_stats.items_trend).toFixed(1)}% trend
            </p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Active Claims
            </span>
            <ClipboardList className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {overview_stats?.active_claims || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Share Items
            </span>
            <Package className="text-orange-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {share_items.length}
          </p>
        </div>
      </div>

      {/* User Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          User Analytics
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {user_stats.active}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {user_stats.verified}
            </div>
            <div className="text-sm text-gray-600">Verified Users</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {user_stats.banned}
            </div>
            <div className="text-sm text-gray-600">Banned Users</div>
          </div>
        </div>
      </div>

      {/* Items by Category */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Items by Category
        </h2>
        <div className="space-y-4">
          {Object.entries(category_stats).map(([category, stats]) => (
            <div key={category} className="flex items-center gap-4">
              <div className="w-32 capitalize text-sm font-medium text-gray-700">
                {category}
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-blue-500 rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${
                        (stats.lost / (lost_items.length || 1)) * 100
                      }%`,
                    }}
                  >
                    <span className="text-xs text-white font-medium">
                      {stats.lost} Lost
                    </span>
                  </div>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-green-500 rounded-full flex items-center justify-end pr-2"
                    style={{
                      width: `${
                        (stats.found / (found_items.length || 1)) * 100
                      }%`,
                    }}
                  >
                    <span className="text-xs text-white font-medium">
                      {stats.found} Found
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claims Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Claims Status
        </h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {claim_stats.pending}
            </div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {claim_stats.processing}
            </div>
            <div className="text-xs text-gray-600">Processing</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {claim_stats.approved}
            </div>
            <div className="text-xs text-gray-600">Approved</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {claim_stats.rejected}
            </div>
            <div className="text-xs text-gray-600">Rejected</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {claim_stats.completed}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
        </div>
      </div>

      {/* Item Status Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lost Items
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active</span>
              <span className="font-medium">
                {lost_items.filter((i) => i.status === "active").length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Resolved</span>
              <span className="font-medium">
                {lost_items.filter((i) => i.status === "resolved").length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending</span>
              <span className="font-medium">
                {lost_items.filter((i) => i.status === "pending").length}
              </span>
            </div>
            <div className="pt-2 border-t flex justify-between font-semibold">
              <span>Total</span>
              <span>{lost_items.length}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Found Items
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active</span>
              <span className="font-medium">
                {found_items.filter((i) => i.status === "active").length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Claimed</span>
              <span className="font-medium">
                {found_items.filter((i) => i.status === "claimed").length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending</span>
              <span className="font-medium">
                {found_items.filter((i) => i.status === "pending").length}
              </span>
            </div>
            <div className="pt-2 border-t flex justify-between font-semibold">
              <span>Total</span>
              <span>{found_items.length}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Share Items
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Available</span>
              <span className="font-medium">
                {share_items.filter((i) => i.status === "available").length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Reserved</span>
              <span className="font-medium">
                {share_items.filter((i) => i.status === "reserved").length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shared</span>
              <span className="font-medium">
                {share_items.filter((i) => i.status === "shared").length}
              </span>
            </div>
            <div className="pt-2 border-t flex justify-between font-semibold">
              <span>Total</span>
              <span>{share_items.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
