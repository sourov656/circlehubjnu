import ShareItem from "@/models/share-items.m";
import dbConnect from "@/lib/mongodb";
import { Types } from "mongoose";
import type { ServiceResponse } from "@/types/auth.types";

/**
 * Share Items Service
 * Handles all business logic for share items using MongoDB
 */
export class ShareItemsService {
  /**
   * Get share items with filtering, pagination, and sorting
   */
  static async getItems(
    filters: {
      page?: number;
      limit?: number;
      category?: string;
      location?: string;
      status?: "available" | "reserved" | "shared";
      offerType?: "free" | "sale";
      condition?: "new" | "like-new" | "good" | "fair";
      tags?: string[];
      sortBy?: "date" | "price";
      sortOrder?: "asc" | "desc";
      userId?: string;
    } = {},
  ): Promise<
    ServiceResponse<{
      items: Array<{
        _id: string;
        user_id: string;
        title: string;
        description: string;
        category: string;
        condition: string;
        offer_type: string;
        price: number | null;
        location: string;
        image_url: string | null;
        tags: string[];
        status: string;
        created_at: string;
        updated_at: string;
        profile: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
        } | null;
      }>;
      pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      };
    }>
  > {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        location,
        status,
        offerType,
        condition,
        tags,
        sortBy = "date",
        sortOrder = "desc",
        userId,
      } = filters;

      await dbConnect();

      // Build query
      const query: any = {};

      if (status) {
        query.status = status;
      }

      if (category) {
        query.category = category.toLowerCase();
      }

      if (location) {
        query.location = { $regex: location, $options: "i" };
      }

      if (offerType) {
        query.offer_type = offerType;
      }

      if (condition) {
        query.condition = condition;
      }

      if (tags && tags.length > 0) {
        query.tags = { $in: tags };
      }

      if (userId) {
        query.user_id = new Types.ObjectId(userId);
      }

      // Build sort
      const sort: any = {};
      if (sortBy === "price") {
        sort.price = sortOrder === "asc" ? 1 : -1;
      } else {
        sort.created_at = sortOrder === "asc" ? 1 : -1;
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;

      const [items, total_count] = await Promise.all([
        ShareItem.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate("user_id", "name email phone avatar_url")
          .lean()
          .exec(),
        ShareItem.countDocuments(query),
      ]);

      // Transform items
      const transformed_items = items.map((item: any) => {
        const user = item.user_id;
        return {
          _id: item._id.toString(),
          user_id: user?._id ? user._id.toString() : item.user_id.toString(),
          title: item.title,
          description: item.description,
          category: item.category,
          condition: item.condition,
          offer_type: item.offer_type,
          price: item.price || null,
          location: item.location,
          image_url: item.image_url || null,
          tags: item.tags || [],
          status: item.status,
          created_at: item.created_at.toISOString(),
          updated_at: item.updated_at.toISOString(),
          profile: user?._id
            ? {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone || null,
                avatar_url: user.avatar_url || null,
              }
            : null,
        };
      });

      const total_pages = Math.ceil(total_count / limit);

      return {
        success: true,
        data: {
          items: transformed_items,
          pagination: {
            currentPage: page,
            totalPages: total_pages,
            totalItems: total_count,
            itemsPerPage: limit,
          },
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("ShareItemsService.getItems error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch items",
        statusCode: 500,
      };
    }
  }

  /**
   * Get a single share item by ID
   */
  static async getItemById(id: string): Promise<
    ServiceResponse<{
      _id: string;
      user_id: string;
      title: string;
      description: string;
      category: string;
      condition: string;
      offer_type: string;
      price: number | null;
      location: string;
      image_url: string | null;
      tags: string[];
      status: string;
      created_at: string;
      updated_at: string;
      profile: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        avatar_url: string | null;
      } | null;
    }>
  > {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid item ID",
          statusCode: 400,
        };
      }

      await dbConnect();

      const item = await ShareItem.findById(id)
        .populate("user_id", "name email phone avatar_url")
        .lean()
        .exec();

      if (!item) {
        return {
          success: false,
          error: "Share item not found",
          statusCode: 404,
        };
      }

      const user = item.user_id as any;

      return {
        success: true,
        data: {
          _id: item._id.toString(),
          user_id: user?._id ? user._id.toString() : item.user_id.toString(),
          title: item.title,
          description: item.description,
          category: item.category,
          condition: item.condition,
          offer_type: item.offer_type,
          price: item.price || null,
          location: item.location,
          image_url: item.image_url || null,
          tags: item.tags || [],
          status: item.status,
          created_at: item.created_at.toISOString(),
          updated_at: item.updated_at.toISOString(),
          profile: user?._id
            ? {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone || null,
                avatar_url: user.avatar_url || null,
              }
            : null,
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("ShareItemsService.getItemById error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch item",
        statusCode: 500,
      };
    }
  }

  /**
   * Create a new share item
   */
  static async createItem(data: {
    userId: string;
    itemData: {
      title: string;
      description: string;
      category: string;
      condition: "new" | "like-new" | "good" | "fair";
      offerType: "free" | "sale";
      price?: number;
      location: string;
      imageUrl?: string;
      tags?: string[];
    };
  }): Promise<
    ServiceResponse<{
      message: string;
      item: {
        id: string;
        userId: string;
        title: string;
        description: string;
        category: string;
        condition: string;
        offerType: string;
        price?: number;
        location: string;
        imageUrl?: string;
        tags: string[];
        status: string;
        createdAt: string;
        updatedAt: string;
      };
    }>
  > {
    try {
      const { userId: user_id, itemData: item_data } = data;

      const {
        title,
        description,
        category,
        condition,
        offerType,
        price,
        location,
        imageUrl,
        tags,
      } = item_data;

      if (
        !title ||
        !description ||
        !category ||
        !condition ||
        !offerType ||
        !location
      ) {
        return {
          success: false,
          error: "Missing required fields",
          statusCode: 400,
        };
      }

      // Validate price for sale items
      if (offerType === "sale" && (!price || price <= 0)) {
        return {
          success: false,
          error: "Price is required and must be greater than 0 for sale items",
          statusCode: 400,
        };
      }

      await dbConnect();

      const new_item = await ShareItem.create({
        user_id,
        title,
        description,
        category,
        condition,
        offer_type: offerType,
        price: offerType === "sale" ? price : undefined,
        location,
        image_url: imageUrl || null,
        tags: tags || [],
        status: "available",
      });

      return {
        success: true,
        data: {
          message: "Share item created successfully",
          item: {
            id: new_item._id.toString(),
            userId: new_item.user_id.toString(),
            title: new_item.title,
            description: new_item.description,
            category: new_item.category,
            condition: new_item.condition,
            offerType: new_item.offer_type,
            price: new_item.price || null,
            location: new_item.location,
            imageUrl: new_item.image_url || null,
            tags: new_item.tags || [],
            status: new_item.status,
            createdAt: new_item.created_at.toISOString(),
            updatedAt: new_item.updated_at.toISOString(),
          },
        },
        statusCode: 201,
      };
    } catch (error) {
      console.error("ShareItemsService.createItem error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create item",
        statusCode: 500,
      };
    }
  }

  /**
   * Update an existing share item
   */
  static async updateItem(data: {
    id: string;
    userId: string;
    updates: {
      title?: string;
      description?: string;
      category?: string;
      condition?: "new" | "like-new" | "good" | "fair";
      offerType?: "free" | "sale";
      price?: number;
      location?: string;
      imageUrl?: string;
      tags?: string[];
    };
  }): Promise<
    ServiceResponse<{
      message: string;
      item: {
        id: string;
        userId: string;
        title: string;
        description: string;
        category: string;
        condition: string;
        offerType: string;
        price?: number;
        location: string;
        imageUrl?: string;
        tags: string[];
        status: string;
        createdAt: string;
        updatedAt: string;
      };
    }>
  > {
    try {
      const { id, userId: user_id, updates } = data;

      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid item ID",
          statusCode: 400,
        };
      }

      await dbConnect();

      const item = await ShareItem.findById(id);

      if (!item) {
        return {
          success: false,
          error: "Share item not found",
          statusCode: 404,
        };
      }

      // Verify ownership
      if (item.user_id.toString() !== user_id) {
        return {
          success: false,
          error: "You don't have permission to perform this action",
          statusCode: 403,
        };
      }

      // Validate price if offerType is being updated to sale or if price is being updated
      const new_offer_type = updates.offerType || item.offer_type;
      if (
        new_offer_type === "sale" &&
        updates.price !== undefined &&
        updates.price <= 0
      ) {
        return {
          success: false,
          error: "Price must be greater than 0 for sale items",
          statusCode: 400,
        };
      }

      // Build update object
      const update_data: any = {};
      if (updates.title !== undefined) update_data.title = updates.title;
      if (updates.description !== undefined)
        update_data.description = updates.description;
      if (updates.category !== undefined)
        update_data.category = updates.category;
      if (updates.condition !== undefined)
        update_data.condition = updates.condition;
      if (updates.offerType !== undefined)
        update_data.offer_type = updates.offerType;
      if (updates.price !== undefined) update_data.price = updates.price;
      if (updates.location !== undefined)
        update_data.location = updates.location;
      if (updates.imageUrl !== undefined)
        update_data.image_url = updates.imageUrl;
      if (updates.tags !== undefined) update_data.tags = updates.tags;

      // Update the item
      const updated_item = await ShareItem.findByIdAndUpdate(id, update_data, {
        new: true,
        runValidators: true,
      }).exec();

      if (!updated_item) {
        return {
          success: false,
          error: "Failed to update item",
          statusCode: 500,
        };
      }

      return {
        success: true,
        data: {
          message: "Share item updated successfully",
          item: {
            id: updated_item._id.toString(),
            userId: updated_item.user_id.toString(),
            title: updated_item.title,
            description: updated_item.description,
            category: updated_item.category,
            condition: updated_item.condition,
            offerType: updated_item.offer_type,
            price: updated_item.price || null,
            location: updated_item.location,
            imageUrl: updated_item.image_url || null,
            tags: updated_item.tags || [],
            status: updated_item.status,
            createdAt: updated_item.created_at.toISOString(),
            updatedAt: updated_item.updated_at.toISOString(),
          },
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("ShareItemsService.updateItem error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update item",
        statusCode: 500,
      };
    }
  }

  /**
   * Delete a share item
   */
  static async deleteItem(data: {
    id: string;
    userId: string;
  }): Promise<ServiceResponse<{ message: string }>> {
    try {
      const { id, userId: user_id } = data;

      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid item ID",
          statusCode: 400,
        };
      }

      await dbConnect();

      const item = await ShareItem.findById(id);

      if (!item) {
        return {
          success: false,
          error: "Share item not found",
          statusCode: 404,
        };
      }

      // Verify ownership
      if (item.user_id.toString() !== user_id) {
        return {
          success: false,
          error: "You don't have permission to perform this action",
          statusCode: 403,
        };
      }

      await ShareItem.findByIdAndDelete(id);

      return {
        success: true,
        data: {
          message: "Share item deleted successfully",
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("ShareItemsService.deleteItem error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete item",
        statusCode: 500,
      };
    }
  }

  /**
   * Mark item as reserved, shared, or available
   */
  static async updateStatus(data: {
    id: string;
    userId: string;
    status: "available" | "reserved" | "shared";
  }): Promise<
    ServiceResponse<{
      message: string;
      item: {
        _id: string;
        status: string;
      };
    }>
  > {
    try {
      const { id, userId: user_id, status } = data;

      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid item ID",
          statusCode: 400,
        };
      }

      await dbConnect();

      const item = await ShareItem.findById(id);

      if (!item) {
        return {
          success: false,
          error: "Share item not found",
          statusCode: 404,
        };
      }

      // Verify ownership
      if (item.user_id.toString() !== user_id) {
        return {
          success: false,
          error: "You don't have permission to perform this action",
          statusCode: 403,
        };
      }

      item.status = status;
      await item.save();

      return {
        success: true,
        data: {
          message: `Item marked as ${status} successfully`,
          item: {
            _id: item._id.toString(),
            status: item.status,
          },
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("ShareItemsService.updateStatus error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update status",
        statusCode: 500,
      };
    }
  }

  /**
   * Get statistics for share items
   */
  static async getStatistics(userId?: string): Promise<
    ServiceResponse<{
      totalItems: number;
      availableItems: number;
      reservedItems: number;
      sharedItems: number;
      freeItems: number;
      saleItems: number;
    }>
  > {
    try {
      await dbConnect();

      const query: any = {};
      if (userId) {
        query.user_id = new Types.ObjectId(userId);
      }

      const [
        total_items,
        available_items,
        reserved_items,
        shared_items,
        free_items,
        sale_items,
      ] = await Promise.all([
        ShareItem.countDocuments(query),
        ShareItem.countDocuments({ ...query, status: "available" }),
        ShareItem.countDocuments({ ...query, status: "reserved" }),
        ShareItem.countDocuments({ ...query, status: "shared" }),
        ShareItem.countDocuments({ ...query, offer_type: "free" }),
        ShareItem.countDocuments({ ...query, offer_type: "sale" }),
      ]);

      return {
        success: true,
        data: {
          totalItems: total_items,
          availableItems: available_items,
          reservedItems: reserved_items,
          sharedItems: shared_items,
          freeItems: free_items,
          saleItems: sale_items,
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("ShareItemsService.getStatistics error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch statistics",
        statusCode: 500,
      };
    }
  }

  /**
   * Search share items by text query
   */
  static async searchItems(data: { query: string; limit?: number }): Promise<
    ServiceResponse<
      Array<{
        _id: string;
        user_id: string;
        title: string;
        description: string;
        category: string;
        condition: string;
        offer_type: string;
        price: number | null;
        location: string;
        image_url: string | null;
        tags: string[];
        status: string;
        created_at: string;
        updated_at: string;
      }>
    >
  > {
    try {
      const { query: search_query, limit = 10 } = data;

      await dbConnect();

      const items = await ShareItem.find({
        $or: [
          { title: { $regex: search_query, $options: "i" } },
          { description: { $regex: search_query, $options: "i" } },
          { location: { $regex: search_query, $options: "i" } },
          { tags: { $in: [new RegExp(search_query, "i")] } },
        ],
        status: "available",
      })
        .limit(limit)
        .sort({ created_at: -1 })
        .lean()
        .exec();

      const transformed_items = items.map((item: any) => ({
        _id: item._id.toString(),
        user_id: item.user_id.toString(),
        title: item.title,
        description: item.description,
        category: item.category,
        condition: item.condition,
        offer_type: item.offer_type,
        price: item.price || null,
        location: item.location,
        image_url: item.image_url || null,
        tags: item.tags || [],
        status: item.status,
        created_at: item.created_at.toISOString(),
        updated_at: item.updated_at.toISOString(),
      }));

      return {
        success: true,
        data: transformed_items,
        statusCode: 200,
      };
    } catch (error) {
      console.error("ShareItemsService.searchItems error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to search items",
        statusCode: 500,
      };
    }
  }

  /**
   * Get all items by a specific user
   */
  static async getUserItems(userId: string): Promise<
    ServiceResponse<
      Array<{
        _id: string;
        user_id: string;
        title: string;
        description: string;
        category: string;
        condition: string;
        offer_type: string;
        price: number | null;
        location: string;
        image_url: string | null;
        tags: string[];
        status: string;
        created_at: string;
        updated_at: string;
      }>
    >
  > {
    try {
      await dbConnect();

      const items = await ShareItem.find({
        user_id: new Types.ObjectId(userId),
      })
        .sort({ created_at: -1 })
        .lean()
        .exec();

      const transformed_items = items.map((item: any) => ({
        _id: item._id.toString(),
        user_id: item.user_id.toString(),
        title: item.title,
        description: item.description,
        category: item.category,
        condition: item.condition,
        offer_type: item.offer_type,
        price: item.price || null,
        location: item.location,
        image_url: item.image_url || null,
        tags: item.tags || [],
        status: item.status,
        created_at: item.created_at.toISOString(),
        updated_at: item.updated_at.toISOString(),
      }));

      return {
        success: true,
        data: transformed_items,
        statusCode: 200,
      };
    } catch (error) {
      console.error("ShareItemsService.getUserItems error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch user items",
        statusCode: 500,
      };
    }
  }
}
