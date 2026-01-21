import dbConnect from "@/lib/mongodb";
import FoundItemClaim from "@/models/found-item-claims.m";
import FoundItem from "@/models/found-items.m";
import User from "@/models/users.m";
import type { ServiceResponse } from "@/types/auth.types";

/**
 * Claim data for creation
 */
export interface CreateClaimData {
  found_item_id: string;
  message?: string;
  contact_info?: {
    phone?: string;
    email?: string;
    preferredContact?: string;
  };
}

/**
 * Claim with user profile
 */
export interface ClaimWithProfile {
  id: string;
  foundItemId: string;
  claimerId: string;
  status: "pending" | "approved" | "rejected";
  message: string | null;
  contactInfo: {
    phone?: string;
    email?: string;
    other?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  claimerProfile: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    phone: string | null;
  };
}

/**
 * Service for managing found item claims with MongoDB
 */
export class FoundItemClaimsService {
  /**
   * Create a new claim for a found item
   */
  static async createClaim(
    user_id: string,
    claim_data: CreateClaimData,
  ): Promise<
    ServiceResponse<{ message: string; claim: Record<string, unknown> }>
  > {
    try {
      if (!user_id) {
        return {
          success: false,
          error: "User ID is required",
          statusCode: 400,
        };
      }

      const { found_item_id, message, contact_info } = claim_data;

      if (!found_item_id) {
        return {
          success: false,
          error: "Found item ID is required",
          statusCode: 400,
        };
      }

      await dbConnect();

      // Check if user already claimed this item
      const existing_claim = await FoundItemClaim.findOne({
        foundItemId: found_item_id,
        claimerId: user_id,
      });

      if (existing_claim) {
        return {
          success: false,
          error: "You have already claimed this item",
          statusCode: 400,
        };
      }

      // Check if item exists and is available
      const found_item = await FoundItem.findById(found_item_id);

      if (!found_item) {
        return {
          success: false,
          error: "Found item not found",
          statusCode: 404,
        };
      }

      if (found_item.status !== "available") {
        return {
          success: false,
          error: "This item is no longer available for claiming",
          statusCode: 400,
        };
      }

      // User cannot claim their own found item
      if (found_item.user_id.toString() === user_id) {
        return {
          success: false,
          error: "You cannot claim your own found item",
          statusCode: 400,
        };
      }

      // Create claim
      const new_claim = await FoundItemClaim.create({
        foundItemId: found_item_id,
        claimerId: user_id,
        message: message || null,
        contactInfo: contact_info || null,
        status: "pending",
      });

      return {
        success: true,
        data: {
          message: "Claim submitted successfully",
          claim: {
            id: new_claim._id.toString(),
            foundItemId: new_claim.foundItemId.toString(),
            claimerId: new_claim.claimerId.toString(),
            status: new_claim.status,
            message: new_claim.message,
            contactInfo: new_claim.contactInfo,
            createdAt: new_claim.createdAt.toISOString(),
            updatedAt: new_claim.updatedAt.toISOString(),
          },
        },
        statusCode: 201,
      };
    } catch (error) {
      console.error("Create claim error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Get all claims for a specific found item (for item owner)
   */
  static async getClaimsByItemId(
    item_id: string,
    user_id: string,
  ): Promise<ServiceResponse<any[]>> {
    try {
      if (!item_id || !user_id) {
        return {
          success: false,
          error: "Item ID and User ID are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      // Verify user owns this item
      const found_item = await FoundItem.findById(item_id).lean();

      if (!found_item) {
        return {
          success: false,
          error: "Found item not found",
          statusCode: 404,
        };
      }

      if (found_item.user_id.toString() !== user_id) {
        return {
          success: false,
          error: "Unauthorized to view claims for this item",
          statusCode: 403,
        };
      }

      // Get claims with claimer profiles
      const claims = await FoundItemClaim.find({ foundItemId: item_id })
        .sort({ createdAt: -1 })
        .lean();

      // Fetch claimer profiles
      const claimer_ids = [...new Set(claims.map((claim) => claim.claimerId))];
      const users = await User.find({ _id: { $in: claimer_ids } })
        .select("name email avatar phone")
        .lean();

      const users_map = new Map(
        users.map((user) => [user._id.toString(), user]),
      );

      // Map claims with profiles and found item details
      const claims_with_profiles: any[] = claims.map((claim) => {
        const user = users_map.get(claim.claimerId.toString());
        return {
          id: claim._id.toString(),
          found_item_id: claim.foundItemId.toString(),
          claimer_id: claim.claimerId.toString(),
          status: claim.status,
          message: claim.message || null,
          contact_info: claim.contactInfo || null,
          created_at: claim.createdAt.toISOString(),
          updated_at: claim.updatedAt.toISOString(),
          claimer_profile: {
            id: user?._id.toString() || "",
            name: user?.name || "",
            email: user?.email || "",
            avatar_url: user?.avatar_url || null,
            phone: user?.phone || null,
          },
          found_item: {
            _id: found_item._id.toString(),
            user_id: found_item.user_id.toString(),
            title: found_item.title,
            description: found_item.description,
            category: found_item.category,
            location: found_item.location,
            date_found: new Date(found_item.date_found).toISOString(),
            image_url: found_item.image_url || undefined,
            status: found_item.status,
            tags: found_item.tags || [],
            views: found_item.views || 0,
            created_at: new Date(found_item.created_at).toISOString(),
            updated_at: new Date(found_item.updated_at).toISOString(),
          },
        };
      });

      return {
        success: true,
        data: claims_with_profiles,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Get claims by item ID error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Get all claims made by a user
   */
  static async getClaimsByUserId(
    user_id: string,
  ): Promise<ServiceResponse<any[]>> {
    try {
      if (!user_id) {
        return {
          success: false,
          error: "User ID is required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const claims = await FoundItemClaim.find({ claimerId: user_id })
        .sort({ createdAt: -1 })
        .lean();

      // Fetch user profile
      const user = await User.findById(user_id)
        .select("name email avatar_url phone")
        .lean();

      // Fetch found items
      const found_item_ids = claims.map((claim) => claim.foundItemId);
      const found_items = await FoundItem.find({
        _id: { $in: found_item_ids },
      }).lean();

      const found_items_map = new Map(
        found_items.map((item) => [item._id.toString(), item]),
      );

      const claims_with_profiles: any[] = claims.map((claim) => {
        const found_item = found_items_map.get(claim.foundItemId.toString());
        return {
          id: claim._id.toString(),
          found_item_id: claim.foundItemId.toString(),
          claimer_id: claim.claimerId.toString(),
          status: claim.status,
          message: claim.message || null,
          contact_info: claim.contactInfo || null,
          created_at: claim.createdAt.toISOString(),
          updated_at: claim.updatedAt.toISOString(),
          claimer_profile: {
            id: user?._id.toString() || "",
            name: user?.name || "",
            email: user?.email || "",
            avatar_url: user?.avatar_url || null,
            phone: user?.phone || null,
          },
          found_item: found_item
            ? {
                _id: found_item._id.toString(),
                user_id: found_item.user_id.toString(),
                title: found_item.title,
                description: found_item.description,
                category: found_item.category,
                location: found_item.location,
                date_found: new Date(found_item.date_found).toISOString(),
                image_url: found_item.image_url || undefined,
                status: found_item.status,
                tags: found_item.tags || [],
                views: found_item.views || 0,
                created_at: new Date(found_item.created_at).toISOString(),
                updated_at: new Date(found_item.updated_at).toISOString(),
              }
            : undefined,
        };
      });

      return {
        success: true,
        data: claims_with_profiles,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Get claims by user ID error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Get all claims received by a user (for items they found)
   */
  static async getReceivedClaims(
    user_id: string,
  ): Promise<ServiceResponse<any[]>> {
    try {
      if (!user_id) {
        return {
          success: false,
          error: "User ID is required",
          statusCode: 400,
        };
      }

      await dbConnect();

      // Get all found items by user
      const found_items = await FoundItem.find({ user_id }).lean();
      const item_ids = found_items.map((item) => item._id);

      // Create found items map for quick lookup
      const found_items_map = new Map(
        found_items.map((item) => [item._id.toString(), item]),
      );

      // Get all claims for these items
      const claims = await FoundItemClaim.find({
        foundItemId: { $in: item_ids },
      })
        .sort({ createdAt: -1 })
        .lean();

      // Fetch claimer profiles
      const claimer_ids = [...new Set(claims.map((claim) => claim.claimerId))];
      const users = await User.find({ _id: { $in: claimer_ids } })
        .select("name email avatar phone")
        .lean();

      const users_map = new Map(
        users.map((user) => [user._id.toString(), user]),
      );

      // Map claims with profiles and found item details
      const claims_with_profiles: any[] = claims.map((claim) => {
        const user = users_map.get(claim.claimerId.toString());
        const found_item = found_items_map.get(claim.foundItemId.toString());
        return {
          id: claim._id.toString(),
          found_item_id: claim.foundItemId.toString(),
          claimer_id: claim.claimerId.toString(),
          status: claim.status,
          message: claim.message || null,
          contact_info: claim.contactInfo || null,
          created_at: claim.createdAt.toISOString(),
          updated_at: claim.updatedAt.toISOString(),
          claimer_profile: {
            id: user?._id.toString() || "",
            name: user?.name || "",
            email: user?.email || "",
            avatar_url: user?.avatar_url || null,
            phone: user?.phone || null,
          },
          found_item: found_item
            ? {
                _id: found_item._id.toString(),
                user_id: found_item.user_id.toString(),
                title: found_item.title,
                description: found_item.description,
                category: found_item.category,
                location: found_item.location,
                date_found: new Date(found_item.date_found).toISOString(),
                image_url: found_item.image_url || undefined,
                status: found_item.status,
                tags: found_item.tags || [],
                views: found_item.views || 0,
                created_at: new Date(found_item.created_at).toISOString(),
                updated_at: new Date(found_item.updated_at).toISOString(),
              }
            : undefined,
        };
      });

      return {
        success: true,
        data: claims_with_profiles,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Get received claims error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Update claim status (approve/reject)
   */
  static async updateClaimStatus(
    claim_id: string,
    user_id: string,
    status: "approved" | "rejected",
  ): Promise<
    ServiceResponse<{ message: string; claim: Record<string, unknown> }>
  > {
    try {
      if (!claim_id || !user_id || !status) {
        return {
          success: false,
          error: "Claim ID, User ID, and status are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      // Get claim
      const claim = await FoundItemClaim.findById(claim_id);

      if (!claim) {
        return {
          success: false,
          error: "Claim not found",
          statusCode: 404,
        };
      }

      // Verify user owns the found item
      const found_item = await FoundItem.findById(claim.foundItemId);

      if (!found_item) {
        return {
          success: false,
          error: "Found item not found",
          statusCode: 404,
        };
      }

      if (found_item.user_id.toString() !== user_id) {
        return {
          success: false,
          error: "Unauthorized to update this claim",
          statusCode: 403,
        };
      }

      // Update claim status
      claim.status = status;
      await claim.save();

      // If approved, update found item status to claimed
      if (status === "approved") {
        found_item.status = "claimed";
        await found_item.save();
      }

      return {
        success: true,
        data: {
          message: `Claim ${status} successfully`,
          claim: {
            id: claim._id.toString(),
            status: claim.status,
          },
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Update claim status error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Delete a claim (user can only delete their own pending claims)
   */
  static async deleteClaim(
    claim_id: string,
    user_id: string,
  ): Promise<ServiceResponse<{ message: string }>> {
    try {
      if (!claim_id || !user_id) {
        return {
          success: false,
          error: "Claim ID and User ID are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const claim = await FoundItemClaim.findById(claim_id);

      if (!claim) {
        return {
          success: false,
          error: "Claim not found",
          statusCode: 404,
        };
      }

      if (claim.claimerId.toString() !== user_id) {
        return {
          success: false,
          error: "Unauthorized to delete this claim",
          statusCode: 403,
        };
      }

      if (claim.status !== "pending") {
        return {
          success: false,
          error: "Can only delete pending claims",
          statusCode: 400,
        };
      }

      await FoundItemClaim.findByIdAndDelete(claim_id);

      return {
        success: true,
        data: { message: "Claim deleted successfully" },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Delete claim error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Check if user has claimed an item
   */
  static async hasUserClaimed(
    user_id: string,
    item_id: string,
  ): Promise<ServiceResponse<boolean>> {
    try {
      if (!user_id || !item_id) {
        return {
          success: false,
          error: "User ID and Item ID are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const claim = await FoundItemClaim.findOne({
        foundItemId: item_id,
        claimerId: user_id,
      });

      return {
        success: true,
        data: !!claim,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Has user claimed error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Get claim count for an item
   */
  static async getClaimCount(
    item_id: string,
  ): Promise<ServiceResponse<number>> {
    try {
      if (!item_id) {
        return {
          success: false,
          error: "Item ID is required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const count = await FoundItemClaim.countDocuments({
        foundItemId: item_id,
      });

      return {
        success: true,
        data: count,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Get claim count error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        statusCode: 500,
      };
    }
  }
}
