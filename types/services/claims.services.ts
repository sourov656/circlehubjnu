import dbConnect from "@/lib/mongodb";
import FoundItemClaimModel from "@/models/found-item-claims.m";
import FoundItemModel from "@/models/found-items.m";
import {
  FoundItemClaim,
  FoundItemClaimWithProfile,
  CreateClaimRequest,
  UpdateClaimRequest,
} from "@/types/items.types";

// Type for populated claim data from MongoDB
interface PopulatedClaim {
  _id: unknown;
  foundItemId: {
    _id: unknown;
    title: string;
    description: string;
    category: string;
    location: string;
    date_found: Date;
    image_url?: string;
    status: string;
    tags?: string[];
    views?: number;
    user_id: unknown;
    created_at: Date;
    updated_at: Date;
  };
  claimerId: {
    _id: unknown;
    name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  status: "pending" | "approved" | "rejected";
  message?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    other?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class ClaimsService {
  /**
   * Create a new claim for a found item
   */
  static async createClaim(
    userId: string,
    claimData: CreateClaimRequest
  ): Promise<FoundItemClaim> {
    await dbConnect();

    // Check if user already claimed this item
    const existingClaim = await FoundItemClaimModel.findOne({
      foundItemId: claimData.found_item_id,
      claimerId: userId,
    });

    if (existingClaim) {
      throw new Error("You have already claimed this item");
    }

    // Check if item is still available
    const foundItem = await FoundItemModel.findById(claimData.found_item_id);

    if (!foundItem) {
      throw new Error("Found item not found");
    }

    if (foundItem.status !== "available") {
      throw new Error("This item is no longer available for claiming");
    }

    // User cannot claim their own found item
    if (foundItem.user_id.toString() === userId) {
      throw new Error("You cannot claim your own found item");
    }

    const newClaim = await FoundItemClaimModel.create({
      foundItemId: claimData.found_item_id,
      claimerId: userId,
      message: claimData.message || null,
      contactInfo: claimData.contact_info || null,
    });

    return {
      id: newClaim._id.toString(),
      found_item_id: newClaim.foundItemId.toString(),
      claimer_id: newClaim.claimerId.toString(),
      status: newClaim.status,
      message: newClaim.message || null,
      contact_info: newClaim.contactInfo || null,
      created_at: newClaim.createdAt.toISOString(),
      updated_at: newClaim.updatedAt.toISOString(),
    } as FoundItemClaim;
  }

  /**
   * Get all claims for a specific found item (for item owner)
   */
  static async getClaimsByItemId(
    itemId: string,
    userId: string
  ): Promise<FoundItemClaimWithProfile[]> {
    await dbConnect();

    // Verify user owns this item
    const foundItem = await FoundItemModel.findById(itemId);

    if (!foundItem || foundItem.user_id.toString() !== userId) {
      throw new Error("Unauthorized to view claims for this item");
    }

    const claims = await FoundItemClaimModel.find({ foundItemId: itemId })
      .populate("claimerId", "name email phone avatar_url")
      .sort({ createdAt: -1 })
      .lean();

    return claims.map((claim: PopulatedClaim) => ({
      id: String(claim._id),
      found_item_id: itemId,
      claimer_id: String(claim.claimerId._id),
      status: claim.status,
      message: claim.message || null,
      contact_info: claim.contactInfo || null,
      created_at: claim.createdAt.toISOString(),
      updated_at: claim.updatedAt.toISOString(),
      claimer_profile: {
        id: String(claim.claimerId._id),
        name: claim.claimerId.name,
        email: claim.claimerId.email,
        phone: claim.claimerId.phone || null,
        avatar_url: claim.claimerId.avatar_url || null,
      },
    })) as FoundItemClaimWithProfile[];
  }

  /**
   * Get all claims made by a user
   */
  static async getClaimsByUserId(
    userId: string
  ): Promise<FoundItemClaimWithProfile[]> {
    await dbConnect();

    const claims = await FoundItemClaimModel.find({ claimerId: userId })
      .populate("foundItemId")
      .populate("claimerId", "name email phone avatar_url")
      .sort({ createdAt: -1 })
      .lean();

    return claims.map((claim: PopulatedClaim) => ({
      id: String(claim._id),
      found_item_id: String(claim.foundItemId._id),
      claimer_id: String(claim.claimerId._id),
      status: claim.status,
      message: claim.message || null,
      contact_info: claim.contactInfo || null,
      created_at: claim.createdAt.toISOString(),
      updated_at: claim.updatedAt.toISOString(),
      found_item: claim.foundItemId
        ? {
            _id: String(claim.foundItemId._id),
            title: claim.foundItemId.title,
            description: claim.foundItemId.description,
            category: claim.foundItemId.category,
            location: claim.foundItemId.location,
            date_found: claim.foundItemId.date_found.toISOString(),
            image_url: claim.foundItemId.image_url || undefined,
            status: claim.foundItemId.status,
            tags: claim.foundItemId.tags || [],
            views: claim.foundItemId.views || 0,
            user_id: String(claim.foundItemId.user_id),
            created_at: claim.foundItemId.created_at.toISOString(),
            updated_at: claim.foundItemId.updated_at.toISOString(),
          }
        : undefined,
      claimer_profile: {
        id: String(claim.claimerId._id),
        name: claim.claimerId.name,
        email: claim.claimerId.email,
        phone: claim.claimerId.phone || null,
        avatar_url: claim.claimerId.avatar_url || null,
      },
    })) as FoundItemClaimWithProfile[];
  }

  /**
   * Get all claims received by a user (for items they found)
   */
  static async getReceivedClaims(
    userId: string
  ): Promise<FoundItemClaimWithProfile[]> {
    await dbConnect();

    // First, find all items found by this user
    const foundItems = await FoundItemModel.find({ user_id: userId }).select(
      "_id"
    );
    const foundItemIds = foundItems.map((item) => item._id);

    // Then find all claims for those items
    const claims = await FoundItemClaimModel.find({
      foundItemId: { $in: foundItemIds },
    })
      .populate("foundItemId")
      .populate("claimerId", "name email phone avatar_url")
      .sort({ createdAt: -1 })
      .lean();

    return claims.map((claim: PopulatedClaim) => ({
      id: String(claim._id),
      found_item_id: String(claim.foundItemId._id),
      claimer_id: String(claim.claimerId._id),
      status: claim.status,
      message: claim.message || null,
      contact_info: claim.contactInfo || null,
      created_at: claim.createdAt.toISOString(),
      updated_at: claim.updatedAt.toISOString(),
      found_item: claim.foundItemId
        ? {
            _id: String(claim.foundItemId._id),
            title: claim.foundItemId.title,
            description: claim.foundItemId.description,
            category: claim.foundItemId.category,
            location: claim.foundItemId.location,
            date_found: claim.foundItemId.date_found.toISOString(),
            image_url: claim.foundItemId.image_url || undefined,
            status: claim.foundItemId.status,
            tags: claim.foundItemId.tags || [],
            views: claim.foundItemId.views || 0,
            user_id: String(claim.foundItemId.user_id),
            created_at: claim.foundItemId.created_at.toISOString(),
            updated_at: claim.foundItemId.updated_at.toISOString(),
          }
        : undefined,
      claimer_profile: {
        id: String(claim.claimerId._id),
        name: claim.claimerId.name,
        email: claim.claimerId.email,
        phone: claim.claimerId.phone || null,
        avatar_url: claim.claimerId.avatar_url || null,
      },
    })) as FoundItemClaimWithProfile[];
  }

  /**
   * Update claim status (approve/reject)
   */
  static async updateClaimStatus(
    claimId: string,
    userId: string,
    updateData: UpdateClaimRequest
  ): Promise<FoundItemClaim> {
    await dbConnect();

    // Get claim and verify ownership
    const claim = await FoundItemClaimModel.findById(claimId);

    if (!claim) {
      throw new Error("Claim not found");
    }

    // Verify user owns the found item
    const foundItem = await FoundItemModel.findById(claim.foundItemId);

    if (!foundItem || foundItem.user_id.toString() !== userId) {
      throw new Error("Unauthorized to update this claim");
    }

    const updatedClaim = await FoundItemClaimModel.findByIdAndUpdate(
      claimId,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedClaim) {
      throw new Error("Failed to update claim");
    }

    return {
      id: updatedClaim._id.toString(),
      found_item_id: updatedClaim.foundItemId.toString(),
      claimer_id: updatedClaim.claimerId.toString(),
      status: updatedClaim.status,
      message: updatedClaim.message || null,
      contact_info: updatedClaim.contactInfo || null,
      created_at: updatedClaim.createdAt.toISOString(),
      updated_at: updatedClaim.updatedAt.toISOString(),
    } as FoundItemClaim;
  }

  /**
   * Delete a claim (user can only delete their own pending claims)
   */
  static async deleteClaim(claimId: string, userId: string): Promise<void> {
    await dbConnect();

    const claim = await FoundItemClaimModel.findById(claimId);

    if (!claim) {
      throw new Error("Claim not found");
    }

    if (claim.claimerId.toString() !== userId) {
      throw new Error("Unauthorized to delete this claim");
    }

    if (claim.status !== "pending") {
      throw new Error("Can only delete pending claims");
    }

    await FoundItemClaimModel.findByIdAndDelete(claimId);
  }

  /**
   * Check if user has claimed an item
   */
  static async hasUserClaimed(
    userId: string,
    itemId: string
  ): Promise<boolean> {
    await dbConnect();

    const claim = await FoundItemClaimModel.findOne({
      foundItemId: itemId,
      claimerId: userId,
    });

    return !!claim;
  }

  /**
   * Get claim count for an item
   */
  static async getClaimCount(itemId: string): Promise<number> {
    await dbConnect();

    const count = await FoundItemClaimModel.countDocuments({
      foundItemId: itemId,
    });

    return count;
  }
}
