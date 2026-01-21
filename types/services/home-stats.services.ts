import dbConnect from "@/lib/mongodb";
import LostItem from "@/models/lost-items.m";
import FoundItem from "@/models/found-items.m";
import ShareItem from "@/models/share-items.m";
import User from "@/models/users.m";
import type { ServiceResponse } from "@/types/auth.types";

/**
 * Home Stats Service
 * Handles business logic for home page statistics and recent activity
 */

// Types for Home Stats
export interface HomeStats {
  items_recovered: number;
  active_users: number;
  items_shared: number;
  success_rate: number;
}

export interface RecentActivityItem {
  id: string;
  type: "lost" | "found" | "share";
  title: string;
  location: string;
  time: string;
  created_at: Date;
}

export class HomeStatsService {
  /**
   * Get home page statistics
   */
  static async getStats(): Promise<ServiceResponse<HomeStats>> {
    try {
      await dbConnect();

      // Get counts from all collections
      const [
        total_lost,
        recovered_lost,
        total_found,
        returned_found,
        shared_items,
        active_users_count,
      ] = await Promise.all([
        // Total lost items
        LostItem.countDocuments({}),
        // Recovered/found lost items
        LostItem.countDocuments({ status: "found" }),
        // Total found items
        FoundItem.countDocuments({}),
        // Returned found items
        FoundItem.countDocuments({ status: "returned" }),
        // Shared items (completed)
        ShareItem.countDocuments({ status: "shared" }),
        // Active users (users who have posted something or logged in recently)
        User.countDocuments({}),
      ]);

      // Calculate items recovered (lost items that were found + found items that were returned)
      const items_recovered = recovered_lost + returned_found;

      // Calculate success rate
      // Success rate = (recovered lost items + returned found items) / (total lost + total found) * 100
      const total_items = total_lost + total_found;
      const success_rate =
        total_items > 0 ? Math.round((items_recovered / total_items) * 100) : 0;

      return {
        success: true,
        data: {
          items_recovered,
          active_users: active_users_count,
          items_shared: shared_items,
          success_rate,
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error getting home stats:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get stats",
        statusCode: 500,
      };
    }
  }

  /**
   * Get recent activity across all item types
   */
  static async getRecentActivity(
    limit: number = 10
  ): Promise<ServiceResponse<RecentActivityItem[]>> {
    try {
      await dbConnect();

      // Fetch recent items from each collection
      const [lost_items, found_items, share_items] = await Promise.all([
        LostItem.find({ status: "active" })
          .sort({ created_at: -1 })
          .limit(limit)
          .lean(),
        FoundItem.find({ status: "available" })
          .sort({ created_at: -1 })
          .limit(limit)
          .lean(),
        ShareItem.find({ status: "available" })
          .sort({ created_at: -1 })
          .limit(limit)
          .lean(),
      ]);

      // Map and combine all items
      const activity_items: RecentActivityItem[] = [
        ...lost_items.map((item) => ({
          id: item._id.toString(),
          type: "lost" as const,
          title: item.title,
          location: item.location,
          time: this.formatTimeAgo(item.created_at),
          created_at: item.created_at,
        })),
        ...found_items.map((item) => ({
          id: item._id.toString(),
          type: "found" as const,
          title: item.title,
          location: item.location,
          time: this.formatTimeAgo(item.created_at),
          created_at: item.created_at,
        })),
        ...share_items.map((item) => ({
          id: item._id.toString(),
          type: "share" as const,
          title: item.title,
          location: item.location,
          time: this.formatTimeAgo(item.created_at),
          created_at: item.created_at,
        })),
      ];

      // Sort by created_at descending and limit
      activity_items.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Return only the requested limit
      const limited_items = activity_items.slice(0, limit);

      return {
        success: true,
        data: limited_items,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error getting recent activity:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get recent activity",
        statusCode: 500,
      };
    }
  }

  /**
   * Format date to "X time ago" format
   */
  private static formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (months > 0) {
      return months === 1 ? "1 month ago" : `${months} months ago`;
    } else if (weeks > 0) {
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    } else if (days > 0) {
      return days === 1 ? "1 day ago" : `${days} days ago`;
    } else if (hours > 0) {
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    } else if (minutes > 0) {
      return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    } else {
      return "Just now";
    }
  }

  /**
   * Get combined home page data (stats + recent activity)
   */
  static async getHomeData(activity_limit: number = 5): Promise<
    ServiceResponse<{
      stats: HomeStats;
      recent_activity: RecentActivityItem[];
    }>
  > {
    try {
      const [stats_result, activity_result] = await Promise.all([
        this.getStats(),
        this.getRecentActivity(activity_limit),
      ]);

      if (!stats_result.success) {
        return {
          success: false,
          error: stats_result.error,
          statusCode: stats_result.statusCode,
        };
      }

      if (!activity_result.success) {
        return {
          success: false,
          error: activity_result.error,
          statusCode: activity_result.statusCode,
        };
      }

      return {
        success: true,
        data: {
          stats: stats_result.data!,
          recent_activity: activity_result.data!,
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error getting home data:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get home data",
        statusCode: 500,
      };
    }
  }
}
