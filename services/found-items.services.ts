import dbConnect from "@/lib/mongodb";
import FoundItem from "@/models/found-items.m";
import User from "@/models/users.m";
import { Types } from "mongoose";
import type {
  ItemFilterOptions,
  ItemsResponse,
  FoundItemWithProfile,
  ItemStatistics,
  CreateFoundItemRequest,
} from "@/types/items.types";
import type { ServiceResponse } from "@/types/auth.types";

/**
 * Service for managing found items with MongoDB
 */
export class FoundItemsService {
  /**
   * Get found items with filtering, sorting, and pagination
   */
  static async getItems(
    filters: ItemFilterOptions = {},
  ): Promise<ServiceResponse<ItemsResponse<FoundItemWithProfile>>> {
    try {
      const {
        category,
        status = "available",
        search,
        tags,
        location,
        dateFrom,
        dateTo,
        userId,
        sort = "newest",
        limit = 20,
        offset = 0,
      } = filters;

      await dbConnect();

      // Build query
      const query: Record<string, unknown> = {};

      // Only filter by status if provided (undefined means fetch all statuses)
      if (status) {
        query.status = status;
      }

      if (category && category !== "all") {
        query.category = category;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ];
      }

      if (tags && tags.length > 0) {
        query.tags = { $in: tags };
      }

      if (location) {
        query.location = { $regex: location, $options: "i" };
      }

      if (dateFrom || dateTo) {
        const dateQuery: { $gte?: Date; $lte?: Date } = {};
        if (dateFrom) dateQuery.$gte = new Date(dateFrom);
        if (dateTo) dateQuery.$lte = new Date(dateTo);
        query.date_found = dateQuery;
      }

      if (userId) {
        query.user_id = new Types.ObjectId(userId);
      }

      // Build sort
      let sortObj: Record<string, 1 | -1> = {};
      switch (sort) {
        case "oldest":
          sortObj = { created_at: 1 };
          break;
        case "most-viewed":
          sortObj = { views: -1 };
          break;
        case "recently-updated":
          sortObj = { updated_at: -1 };
          break;
        case "newest":
        default:
          sortObj = { created_at: -1 };
          break;
      }

      // Get total count
      const total = await FoundItem.countDocuments(query);

      // Get items with pagination
      const items = await FoundItem.find(query)
        .sort(sortObj)
        .skip(offset)
        .limit(limit)
        .lean();

      // Fetch user profiles
      const user_ids = [...new Set(items.map((item) => item.user_id))];
      const users = await User.find({ _id: { $in: user_ids } })
        .select("name email avatar university studentId")
        .lean();

      const users_map = new Map(
        users.map((user) => [user._id.toString(), user]),
      );

      // Map items with profiles
      const items_with_profiles = items.map((item) => {
        const user = users_map.get(item.user_id.toString());
        return {
          _id: item._id.toString(),
          user_id: item.user_id.toString(),
          title: item.title,
          description: item.description,
          category: item.category,
          location: item.location,
          date_found: item.date_found.toISOString(),
          image_url: item.image_url || undefined,
          status: item.status,
          tags: item.tags || [],
          views: item.views || 0,
          created_at: item.created_at.toISOString(),
          updated_at: item.updated_at.toISOString(),
          profile: {
            id: user?._id.toString() || "",
            name: user?.name || "",
            email: user?.email || "",
            avatar_url: user?.avatar || null,
            phone: null,
          },
        };
      }) as FoundItemWithProfile[];

      const current_page = Math.floor(offset / limit) + 1;
      const has_more = offset + limit < total;

      return {
        success: true,
        data: {
          items: items_with_profiles,
          total,
          page: current_page,
          limit,
          hasMore: has_more,
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Get found items error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Get a single found item by ID
   */
  static async getItemById(
    item_id: string,
  ): Promise<ServiceResponse<FoundItemWithProfile>> {
    try {
      if (!item_id) {
        return {
          success: false,
          error: "Item ID is required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const item = await FoundItem.findById(item_id).lean();

      if (!item) {
        return {
          success: false,
          error: "Item not found",
          statusCode: 404,
        };
      }

      // Fetch user profile
      const user = await User.findById(item.user_id)
        .select("name email avatar university studentId")
        .lean();

      // Increment views
      await FoundItem.findByIdAndUpdate(item_id, { $inc: { views: 1 } });

      const item_with_profile: FoundItemWithProfile = {
        _id: item._id.toString(),
        user_id: item.user_id.toString(),
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        date_found: item.date_found.toISOString(),
        image_url: item.image_url || undefined,
        status: item.status,
        tags: item.tags || [],
        views: (item.views || 0) + 1,
        created_at: item.created_at.toISOString(),
        updated_at: item.updated_at.toISOString(),
        profile: {
          id: user?._id.toString() || "",
          name: user?.name || "",
          email: user?.email || "",
          avatar_url: user?.avatar || null,
          phone: null,
        },
      };

      return {
        success: true,
        data: item_with_profile,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Get found item by ID error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Create a new found item
   */
  static async createItem(
    user_id: string,
    item_data: CreateFoundItemRequest,
  ): Promise<
    ServiceResponse<{ message: string; item: Record<string, unknown> }>
  > {
    try {
      if (!user_id) {
        return {
          success: false,
          error: "User ID is required",
          statusCode: 400,
        };
      }

      const {
        title,
        description,
        category,
        location,
        dateFound,
        imageUrl,
        tags,
      } = item_data;

      if (!title || !description || !category || !location || !dateFound) {
        return {
          success: false,
          error: "Missing required fields",
          statusCode: 400,
        };
      }

      await dbConnect();

      const new_item = await FoundItem.create({
        user_id,
        title,
        description,
        category,
        location,
        date_found: new Date(dateFound),
        image_url: imageUrl || null,
        tags: tags || [],
        status: "available",
        views: 0,
      });

      return {
        success: true,
        data: {
          message: "Found item created successfully",
          item: {
            id: new_item._id.toString(),
            user_id: new_item.user_id.toString(),
            title: new_item.title,
            description: new_item.description,
            category: new_item.category,
            location: new_item.location,
            date_found: new_item.date_found.toISOString(),
            image_url: new_item.image_url,
            status: new_item.status,
            tags: new_item.tags,
            views: new_item.views,
            created_at: new_item.created_at.toISOString(),
            updated_at: new_item.updated_at.toISOString(),
          },
        },
        statusCode: 201,
      };
    } catch (error: unknown) {
      console.error("Create found item error:", error);

      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "ValidationError" &&
        "errors" in error
      ) {
        const messages = Object.values(
          error.errors as Record<string, { message: string }>,
        )
          .map((err) => err.message)
          .join(", ");
        return {
          success: false,
          error: messages,
          statusCode: 400,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Update a found item
   */
  static async updateItem(
    item_id: string,
    user_id: string,
    updates: Partial<CreateFoundItemRequest>,
  ): Promise<
    ServiceResponse<{ message: string; item: Record<string, unknown> }>
  > {
    try {
      if (!item_id || !user_id) {
        return {
          success: false,
          error: "Item ID and User ID are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const item = await FoundItem.findById(item_id);

      if (!item) {
        return {
          success: false,
          error: "Item not found",
          statusCode: 404,
        };
      }

      if (item.user_id.toString() !== user_id) {
        return {
          success: false,
          error: "Unauthorized: You can only update your own items",
          statusCode: 403,
        };
      }

      // Update fields
      if (updates.title) item.title = updates.title;
      if (updates.description) item.description = updates.description;
      if (updates.category) item.category = updates.category;
      if (updates.location) item.location = updates.location;
      if (updates.dateFound) item.date_found = new Date(updates.dateFound);
      if (updates.imageUrl !== undefined) item.image_url = updates.imageUrl;
      if (updates.tags) item.tags = updates.tags;

      await item.save();

      return {
        success: true,
        data: {
          message: "Found item updated successfully",
          item: {
            id: item._id.toString(),
            user_id: item.user_id.toString(),
            title: item.title,
            description: item.description,
            category: item.category,
            location: item.location,
            date_found: item.date_found.toISOString(),
            image_url: item.image_url,
            status: item.status,
            tags: item.tags,
            views: item.views,
            created_at: item.created_at.toISOString(),
            updated_at: item.updated_at.toISOString(),
          },
        },
        statusCode: 200,
      };
    } catch (error: unknown) {
      console.error("Update found item error:", error);

      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "ValidationError" &&
        "errors" in error
      ) {
        const messages = Object.values(
          error.errors as Record<string, { message: string }>,
        )
          .map((err) => err.message)
          .join(", ");
        return {
          success: false,
          error: messages,
          statusCode: 400,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Delete a found item
   */
  static async deleteItem(
    item_id: string,
    user_id: string,
  ): Promise<ServiceResponse<{ message: string }>> {
    try {
      if (!item_id || !user_id) {
        return {
          success: false,
          error: "Item ID and User ID are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const item = await FoundItem.findById(item_id);

      if (!item) {
        return {
          success: false,
          error: "Item not found",
          statusCode: 404,
        };
      }

      if (item.user_id.toString() !== user_id) {
        return {
          success: false,
          error: "Unauthorized: You can only delete your own items",
          statusCode: 403,
        };
      }

      await FoundItem.findByIdAndDelete(item_id);

      return {
        success: true,
        data: { message: "Found item deleted successfully" },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Delete found item error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Mark item as resolved
   */
  static async markAsResolved(
    item_id: string,
    user_id: string,
    final_status: "claimed" | "returned" = "returned",
  ): Promise<
    ServiceResponse<{ message: string; item: Record<string, unknown> }>
  > {
    try {
      if (!item_id || !user_id) {
        return {
          success: false,
          error: "Item ID and User ID are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const item = await FoundItem.findById(item_id);

      if (!item) {
        return {
          success: false,
          error: "Item not found",
          statusCode: 404,
        };
      }

      if (item.user_id.toString() !== user_id) {
        return {
          success: false,
          error: "Unauthorized: You can only update your own items",
          statusCode: 403,
        };
      }

      item.status = final_status;
      await item.save();

      return {
        success: true,
        data: {
          message: `Item marked as ${final_status}`,
          item: {
            id: item._id.toString(),
            status: item.status,
          },
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Mark as resolved error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Get items statistics
   */
  static async getStatistics(
    user_id?: string,
  ): Promise<ServiceResponse<ItemStatistics>> {
    try {
      await dbConnect();

      const query: Record<string, unknown> = user_id ? { user_id } : {};

      const all_items = await FoundItem.find(query).select(
        "category status created_at",
      );

      const items_by_category: Record<string, number> = {};
      let active_count = 0;
      let resolved_count = 0;

      all_items.forEach((item) => {
        if (item.category) {
          items_by_category[item.category] =
            (items_by_category[item.category] || 0) + 1;
        }
        if (item.status === "available") {
          active_count++;
        } else if (item.status === "claimed" || item.status === "returned") {
          resolved_count++;
        }
      });

      // Recent items (last 7 days)
      const seven_days_ago = new Date();
      seven_days_ago.setDate(seven_days_ago.getDate() - 7);

      const recent_count = await FoundItem.countDocuments({
        ...query,
        created_at: { $gte: seven_days_ago },
      });

      return {
        success: true,
        data: {
          totalItems: all_items.length,
          activeItems: active_count,
          resolvedItems: resolved_count,
          itemsByCategory: items_by_category,
          recentItems: recent_count,
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Get statistics error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Search items by text
   */
  static async searchItems(
    search_query: string,
    filters?: Omit<ItemFilterOptions, "search">,
  ): Promise<ServiceResponse<ItemsResponse<FoundItemWithProfile>>> {
    return this.getItems({
      ...filters,
      search: search_query,
    });
  }

  /**
   * Get user items
   */
  static async getUserItems(
    user_id: string,
    filters?: Omit<ItemFilterOptions, "userId">,
  ): Promise<ServiceResponse<ItemsResponse<FoundItemWithProfile>>> {
    return this.getItems({
      ...filters,
      userId: user_id,
    });
  }
}
