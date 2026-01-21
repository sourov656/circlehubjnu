import dbConnect from "@/lib/mongodb";
import { AuditLog } from "@/models/audit-logs.m";
import { Report } from "@/models/reports.m";
import User from "@/models/users.m";
import LostItem from "@/models/lost-items.m";
import FoundItem from "@/models/found-items.m";
import ShareItem from "@/models/share-items.m";
import FoundItemClaim from "@/models/found-item-claims.m";
import type {
  ServiceResponse,
  UserFilters,
  ItemFilters,
  ClaimFilters,
  ReportFilters,
  AuditLogFilters,
  AuditLogExportFilters,
  UserUpdateData,
  ReportUpdateData,
  PaginatedResponse,
  DashboardStats,
  UserQueryFilter,
  ItemQueryFilter,
  ClaimQueryFilter,
  ReportQueryFilter,
  AuditLogQueryFilter,
} from "@/types/admin.types";

/**
 * Admin Service
 * Comprehensive service class for admin operations
 * Follows the same pattern as AuthService
 */
export class AdminService {
  // ==================== Admin User Management ====================
  // Note: Admin-specific data (permissions, last_login) removed.
  // All role information is now stored in users collection.

  /**
   * Check if user has admin role
   */
  static async checkPermission(
    user_id: string,
    permission: string,
  ): Promise<boolean> {
    try {
      await dbConnect();

      const user = await User.findById(user_id);
      if (!user || !user.is_active) return false;

      // Check if user has admin-level role
      const admin_roles = ["admin", "moderator", "support_staff"];
      if (!admin_roles.includes(user.role)) return false;

      // Get permissions based on role
      const permissions = this.getDefaultPermissionsByRole(user.role);
      return permissions.includes(permission);
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }

  // ==================== User Management ====================

  /**
   * Get all users with pagination and filters
   */
  static async getAllUsers(
    options: UserFilters,
  ): Promise<ServiceResponse<PaginatedResponse<unknown>>> {
    try {
      await dbConnect();

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      const query: UserQueryFilter = {};

      if (options.search) {
        query.$or = [
          { name: { $regex: options.search, $options: "i" } },
          { email: { $regex: options.search, $options: "i" } },
          { phone: { $regex: options.search, $options: "i" } },
          { student_id: { $regex: options.search, $options: "i" } },
        ];
      }

      if (options.role) query.role = options.role;
      if (options.verified !== undefined) query.verified = options.verified;
      if (options.is_banned !== undefined) query.is_banned = options.is_banned;
      if (options.is_active !== undefined) query.is_active = options.is_active;

      const [users, total] = await Promise.all([
        User.find(query)
          .select("-password")
          .skip(skip)
          .limit(limit)
          .sort({ created_at: -1 })
          .lean(),
        User.countDocuments(query),
      ]);

      return {
        success: true,
        data: {
          items: users,
          total,
          page,
          total_pages: Math.ceil(total / limit),
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        error: "Failed to fetch users",
        statusCode: 500,
      };
    }
  }

  /**
   * Get user by ID with full details
   */
  static async getUserById(user_id: string): Promise<ServiceResponse<unknown>> {
    try {
      if (!user_id) {
        return {
          success: false,
          error: "User ID is required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const user = await User.findById(user_id).select("-password").lean();
      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      // Get user statistics
      const [
        lost_items_count,
        found_items_count,
        share_items_count,
        claims_count,
      ] = await Promise.all([
        LostItem.countDocuments({ user_id }),
        FoundItem.countDocuments({ user_id }),
        ShareItem.countDocuments({ user_id }),
        FoundItemClaim.countDocuments({ claimant_id: user_id }),
      ]);

      return {
        success: true,
        data: {
          ...user,
          statistics: {
            lost_items_count,
            found_items_count,
            share_items_count,
            claims_count,
          },
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return {
        success: false,
        error: "Failed to fetch user",
        statusCode: 500,
      };
    }
  }

  /**
   * Ban user
   */
  static async banUser(
    user_id: string,
    admin_id: string,
    reason: string,
    ip_address?: string,
    user_agent?: string,
  ): Promise<ServiceResponse<unknown>> {
    try {
      if (!user_id || !admin_id || !reason) {
        return {
          success: false,
          error: "User ID, admin ID, and reason are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const user = await User.findByIdAndUpdate(
        user_id,
        {
          is_banned: true,
          ban_reason: reason,
          ban_date: new Date(),
        },
        { new: true },
      ).select("-password");

      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      // Log action
      await AuditLog.create({
        admin_id,
        action: "ban_user",
        target_type: "user",
        target_id: user_id,
        details: { reason },
        ip_address,
        user_agent,
      });

      return {
        success: true,
        data: user,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error banning user:", error);
      return {
        success: false,
        error: "Failed to ban user",
        statusCode: 500,
      };
    }
  }

  /**
   * Unban user
   */
  static async unbanUser(
    user_id: string,
    admin_id: string,
    ip_address?: string,
    user_agent?: string,
  ): Promise<ServiceResponse<unknown>> {
    try {
      if (!user_id || !admin_id) {
        return {
          success: false,
          error: "User ID and admin ID are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const user = await User.findByIdAndUpdate(
        user_id,
        {
          is_banned: false,
          ban_reason: null,
          ban_date: null,
        },
        { new: true },
      ).select("-password");

      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      // Log action
      await AuditLog.create({
        admin_id,
        action: "unban_user",
        target_type: "user",
        target_id: user_id,
        details: {},
        ip_address,
        user_agent,
      });

      return {
        success: true,
        data: user,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error unbanning user:", error);
      return {
        success: false,
        error: "Failed to unban user",
        statusCode: 500,
      };
    }
  }

  /**
   * Update user details
   */
  static async updateUserDetails(
    user_id: string,
    admin_id: string,
    updates: UserUpdateData,
    ip_address?: string,
    user_agent?: string,
  ): Promise<ServiceResponse<unknown>> {
    try {
      if (!user_id || !admin_id) {
        return {
          success: false,
          error: "User ID and admin ID are required",
          statusCode: 400,
        };
      }

      if (!updates || Object.keys(updates).length === 0) {
        return {
          success: false,
          error: "No updates provided",
          statusCode: 400,
        };
      }

      await dbConnect();

      const user = await User.findByIdAndUpdate(user_id, updates, {
        new: true,
      }).select("-password");

      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      // Log action
      await AuditLog.create({
        admin_id,
        action: "update_user",
        target_type: "user",
        target_id: user_id,
        details: { updates },
        ip_address,
        user_agent,
      });

      return {
        success: true,
        data: user,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error updating user:", error);
      return {
        success: false,
        error: "Failed to update user",
        statusCode: 500,
      };
    }
  }

  /**
   * Update user role
   * Simply updates the role in users collection
   */
  static async updateUserRole(
    user_id: string,
    new_role: "student" | "admin" | "moderator" | "support_staff",
    admin_id: string,
    ip_address?: string,
    user_agent?: string,
  ): Promise<ServiceResponse<unknown>> {
    try {
      if (!user_id || !admin_id || !new_role) {
        return {
          success: false,
          error: "User ID, admin ID, and role are required",
          statusCode: 400,
        };
      }

      // Validate role
      const valid_roles = ["student", "admin", "moderator", "support_staff"];
      if (!valid_roles.includes(new_role)) {
        return {
          success: false,
          error: "Invalid role",
          statusCode: 400,
        };
      }

      await dbConnect();

      // Find the user
      const user = await User.findById(user_id);
      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      const old_role = user.role;

      // Update user role
      user.role = new_role;
      await user.save();

      // Log action
      await AuditLog.create({
        admin_id,
        action: "update_user_role",
        target_type: "user",
        target_id: user_id,
        details: { old_role, new_role },
        ip_address,
        user_agent,
      });

      return {
        success: true,
        data: {
          message: `User role updated from ${old_role} to ${new_role}`,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error updating user role:", error);
      return {
        success: false,
        error: "Failed to update user role",
        statusCode: 500,
      };
    }
  }

  /**
   * Update user verification status
   */
  static async updateUserVerification(
    user_id: string,
    verified: boolean,
    admin_id: string,
    ip_address?: string,
    user_agent?: string,
  ): Promise<ServiceResponse<unknown>> {
    try {
      if (!user_id || !admin_id || typeof verified !== "boolean") {
        return {
          success: false,
          error: "User ID, admin ID, and verified status are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      // Find the user
      const user = await User.findById(user_id);
      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      const old_status = user.verified;

      // Update verification status
      user.verified = verified;
      await user.save();

      // Log action
      await AuditLog.create({
        admin_id,
        action: verified ? "verify_user" : "unverify_user",
        target_type: "user",
        target_id: user_id,
        details: { old_status, new_status: verified },
        ip_address,
        user_agent,
      });

      return {
        success: true,
        data: {
          message: `User ${verified ? "verified" : "unverified"} successfully`,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            verified: user.verified,
          },
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error updating user verification:", error);
      return {
        success: false,
        error: "Failed to update user verification",
        statusCode: 500,
      };
    }
  }

  /**
   * Update user active status
   */
  static async updateUserActiveStatus(
    user_id: string,
    is_active: boolean,
    admin_id: string,
    ip_address?: string,
    user_agent?: string,
  ): Promise<ServiceResponse<unknown>> {
    try {
      if (!user_id || !admin_id || typeof is_active !== "boolean") {
        return {
          success: false,
          error: "User ID, admin ID, and active status are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      // Find the user
      const user = await User.findById(user_id);
      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      const old_status = user.is_active;

      // Update active status
      user.is_active = is_active;
      await user.save();

      // Log action
      await AuditLog.create({
        admin_id,
        action: is_active ? "activate_user" : "deactivate_user",
        target_type: "user",
        target_id: user_id,
        details: { old_status, new_status: is_active },
        ip_address,
        user_agent,
      });

      return {
        success: true,
        data: {
          message: `User ${
            is_active ? "activated" : "deactivated"
          } successfully`,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            is_active: user.is_active,
          },
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error updating user active status:", error);
      return {
        success: false,
        error: "Failed to update user active status",
        statusCode: 500,
      };
    }
  }

  /**
   * Get default permissions based on role
   */
  private static getDefaultPermissionsByRole(role: string): string[] {
    switch (role) {
      case "admin":
        return [
          "users.view",
          "users.edit",
          "users.delete",
          "users.ban",
          "items.view",
          "items.edit",
          "items.delete",
          "items.approve",
          "claims.view",
          "claims.manage",
          "reports.view",
          "reports.manage",
          "analytics.view",
          "logs.view",
          "logs.export",
          "admins.manage",
          "settings.edit",
        ];
      case "moderator":
        return [
          "users.view",
          "users.ban",
          "items.view",
          "items.edit",
          "items.approve",
          "items.delete",
          "claims.view",
          "claims.manage",
          "reports.view",
          "reports.manage",
          "analytics.view",
        ];
      case "support_staff":
        return ["users.view", "items.view", "claims.view", "reports.view"];
      default:
        return [];
    }
  }

  /**
   * Delete user (soft delete - set inactive)
   */
  static async deleteUser(
    user_id: string,
    admin_id: string,
    ip_address?: string,
    user_agent?: string,
  ): Promise<ServiceResponse<unknown>> {
    try {
      if (!user_id || !admin_id) {
        return {
          success: false,
          error: "User ID and admin ID are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const user = await User.findByIdAndUpdate(
        user_id,
        { is_active: false },
        { new: true },
      ).select("-password");

      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      // Log action
      await AuditLog.create({
        admin_id,
        action: "delete_user",
        target_type: "user",
        target_id: user_id,
        details: {},
        ip_address,
        user_agent,
      });

      return {
        success: true,
        data: user,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error deleting user:", error);
      return {
        success: false,
        error: "Failed to delete user",
        statusCode: 500,
      };
    }
  }

  // ==================== Item Management ====================

  /**
   * Get model by item type
   */
  private static getItemModel(
    item_type: "lost" | "found" | "share",
  ): typeof LostItem | typeof FoundItem | typeof ShareItem {
    switch (item_type) {
      case "lost":
        return LostItem;
      case "found":
        return FoundItem;
      case "share":
        return ShareItem;
      default:
        throw new Error("Invalid item type");
    }
  }

  /**
   * Get all items with filters
   */
  static async getAllItems(
    options: ItemFilters,
  ): Promise<ServiceResponse<PaginatedResponse<unknown>>> {
    try {
      if (!options.type) {
        return {
          success: false,
          error: "Item type is required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      const Model = this.getItemModel(options.type);

      const query: ItemQueryFilter = {};

      if (options.status) query.status = options.status;
      if (options.category) query.category = options.category;
      if (options.search) {
        query.$or = [
          { title: { $regex: options.search, $options: "i" } },
          { description: { $regex: options.search, $options: "i" } },
        ];
      }
      if (options.date_from || options.date_to) {
        query.created_at = {} as { $gte?: Date; $lte?: Date };
        if (options.date_from)
          (query.created_at as { $gte?: Date; $lte?: Date }).$gte =
            options.date_from;
        if (options.date_to)
          (query.created_at as { $gte?: Date; $lte?: Date }).$lte =
            options.date_to;
      }

      const [items, total] = await Promise.all([
        Model.find(query)
          .populate("user_id", "name email")
          .skip(skip)
          .limit(limit)
          .sort({ created_at: -1 })
          .lean(),
        Model.countDocuments(query),
      ]);

      return {
        success: true,
        data: {
          items,
          total,
          page,
          total_pages: Math.ceil(total / limit),
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error fetching items:", error);
      return {
        success: false,
        error: "Failed to fetch items",
        statusCode: 500,
      };
    }
  }

  /**
   * Approve item
   */
  static async approveItem(
    item_id: string,
    item_type: "lost" | "found" | "share",
    admin_id: string,
    ip_address?: string,
    user_agent?: string,
  ): Promise<ServiceResponse<unknown>> {
    try {
      if (!item_id || !item_type || !admin_id) {
        return {
          success: false,
          error: "Item ID, item type, and admin ID are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const Model = this.getItemModel(item_type);

      const status = item_type === "lost" ? "active" : "available";

      const item = await Model.findByIdAndUpdate(
        item_id,
        { status },
        { new: true },
      );

      if (!item) {
        return {
          success: false,
          error: "Item not found",
          statusCode: 404,
        };
      }

      // Log action
      await AuditLog.create({
        admin_id,
        action: "approve_item",
        target_type: "item",
        target_id: item_id,
        details: { item_type },
        ip_address,
        user_agent,
      });

      return {
        success: true,
        data: item,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error approving item:", error);
      return {
        success: false,
        error: "Failed to approve item",
        statusCode: 500,
      };
    }
  }

  /**
   * Reject item
   */
  static async rejectItem(
    item_id: string,
    item_type: "lost" | "found" | "share",
    admin_id: string,
    reason: string,
    ip_address?: string,
    user_agent?: string,
  ): Promise<ServiceResponse<unknown>> {
    try {
      if (!item_id || !item_type || !admin_id || !reason) {
        return {
          success: false,
          error: "Item ID, item type, admin ID, and reason are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const Model = this.getItemModel(item_type);

      const item = await Model.findByIdAndUpdate(
        item_id,
        { status: "rejected" },
        { new: true },
      );

      if (!item) {
        return {
          success: false,
          error: "Item not found",
          statusCode: 404,
        };
      }

      // Log action
      await AuditLog.create({
        admin_id,
        action: "reject_item",
        target_type: "item",
        target_id: item_id,
        details: { item_type, reason },
        ip_address,
        user_agent,
      });

      return {
        success: true,
        data: item,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error rejecting item:", error);
      return {
        success: false,
        error: "Failed to reject item",
        statusCode: 500,
      };
    }
  }

  /**
   * Delete item
   */
  static async deleteItem(
    item_id: string,
    item_type: "lost" | "found" | "share",
    admin_id: string,
    ip_address?: string,
    user_agent?: string,
  ): Promise<ServiceResponse<{ success: boolean }>> {
    try {
      if (!item_id || !item_type || !admin_id) {
        return {
          success: false,
          error: "Item ID, item type, and admin ID are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const Model = this.getItemModel(item_type);

      const item = await Model.findByIdAndDelete(item_id);

      if (!item) {
        return {
          success: false,
          error: "Item not found",
          statusCode: 404,
        };
      }

      // Log action
      await AuditLog.create({
        admin_id,
        action: "delete_item",
        target_type: "item",
        target_id: item_id,
        details: { item_type },
        ip_address,
        user_agent,
      });

      return {
        success: true,
        data: { success: true },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error deleting item:", error);
      return {
        success: false,
        error: "Failed to delete item",
        statusCode: 500,
      };
    }
  }

  // ==================== Claims Management ====================

  /**
   * Get all claims with filters
   */
  static async getAllClaims(
    options: ClaimFilters,
  ): Promise<ServiceResponse<PaginatedResponse<unknown>>> {
    try {
      await dbConnect();

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      const query: ClaimQueryFilter = {};

      if (options.status) query.status = options.status;
      if (options.verification_status)
        query.verification_status = options.verification_status;

      const [claims, total] = await Promise.all([
        FoundItemClaim.find(query)
          .populate("claimerId", "name email phone")
          .populate("foundItemId", "title category images")
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .lean(),
        FoundItemClaim.countDocuments(query),
      ]);

      return {
        success: true,
        data: {
          items: claims,
          total,
          page,
          total_pages: Math.ceil(total / limit),
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error fetching claims:", error);
      return {
        success: false,
        error: "Failed to fetch claims",
        statusCode: 500,
      };
    }
  }

  /**
   * Approve claim
   */
  static async approveClaim(
    claim_id: string,
    admin_id: string,
    ip_address?: string,
    user_agent?: string,
  ): Promise<ServiceResponse<unknown>> {
    try {
      if (!claim_id || !admin_id) {
        return {
          success: false,
          error: "Claim ID and admin ID are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const claim = await FoundItemClaim.findByIdAndUpdate(
        claim_id,
        {
          verification_status: "verified",
          status: "approved",
        },
        { new: true },
      );

      if (!claim) {
        return {
          success: false,
          error: "Claim not found",
          statusCode: 404,
        };
      }

      // Log action
      await AuditLog.create({
        admin_id,
        action: "approve_claim",
        target_type: "claim",
        target_id: claim_id,
        details: {},
        ip_address,
        user_agent,
      });

      return {
        success: true,
        data: claim,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error approving claim:", error);
      return {
        success: false,
        error: "Failed to approve claim",
        statusCode: 500,
      };
    }
  }

  /**
   * Reject claim
   */
  static async rejectClaim(
    claim_id: string,
    admin_id: string,
    reason: string,
    ip_address?: string,
    user_agent?: string,
  ): Promise<ServiceResponse<unknown>> {
    try {
      if (!claim_id || !admin_id || !reason) {
        return {
          success: false,
          error: "Claim ID, admin ID, and reason are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const claim = await FoundItemClaim.findByIdAndUpdate(
        claim_id,
        {
          verification_status: "rejected",
          status: "rejected",
        },
        { new: true },
      );

      if (!claim) {
        return {
          success: false,
          error: "Claim not found",
          statusCode: 404,
        };
      }

      // Log action
      await AuditLog.create({
        admin_id,
        action: "reject_claim",
        target_type: "claim",
        target_id: claim_id,
        details: { reason },
        ip_address,
        user_agent,
      });

      return {
        success: true,
        data: claim,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error rejecting claim:", error);
      return {
        success: false,
        error: "Failed to reject claim",
        statusCode: 500,
      };
    }
  }

  // ==================== Reports Management ====================

  /**
   * Get all reports with filters
   */
  static async getAllReports(
    options: ReportFilters,
  ): Promise<ServiceResponse<PaginatedResponse<unknown>>> {
    try {
      await dbConnect();

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      const query: ReportQueryFilter = {};

      if (options.status) query.status = options.status;
      if (options.priority) query.priority = options.priority;
      if (options.reported_type) query.reported_type = options.reported_type;

      const [reports, total] = await Promise.all([
        Report.find(query)
          .populate("reporter_id", "name email")
          .populate("assigned_to")
          .skip(skip)
          .limit(limit)
          .sort({ priority: -1, created_at: -1 })
          .lean(),
        Report.countDocuments(query),
      ]);

      return {
        success: true,
        data: {
          items: reports,
          total,
          page,
          total_pages: Math.ceil(total / limit),
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error fetching reports:", error);
      return {
        success: false,
        error: "Failed to fetch reports",
        statusCode: 500,
      };
    }
  }

  /**
   * Update report status
   */
  static async updateReportStatus(
    report_id: string,
    admin_id: string,
    status: "new" | "under_review" | "resolved" | "dismissed",
    resolution?: string,
    ip_address?: string,
    user_agent?: string,
  ): Promise<ServiceResponse<unknown>> {
    try {
      if (!report_id || !admin_id || !status) {
        return {
          success: false,
          error: "Report ID, admin ID, and status are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const updates: ReportUpdateData = { status };
      if (resolution) updates.resolution = resolution;
      if (status === "resolved") updates.resolved_at = new Date();

      const report = await Report.findByIdAndUpdate(report_id, updates, {
        new: true,
      });

      if (!report) {
        return {
          success: false,
          error: "Report not found",
          statusCode: 404,
        };
      }

      // Log action
      await AuditLog.create({
        admin_id,
        action: "update_report_status",
        target_type: "report",
        target_id: report_id,
        details: { status, resolution },
        ip_address,
        user_agent,
      });

      return {
        success: true,
        data: report,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error updating report:", error);
      return {
        success: false,
        error: "Failed to update report",
        statusCode: 500,
      };
    }
  }

  /**
   * Assign report to admin
   */
  static async assignReport(
    report_id: string,
    assigned_to: string,
    admin_id: string,
    ip_address?: string,
    user_agent?: string,
  ): Promise<ServiceResponse<unknown>> {
    try {
      if (!report_id || !assigned_to || !admin_id) {
        return {
          success: false,
          error: "Report ID, assigned_to, and admin ID are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      const report = await Report.findByIdAndUpdate(
        report_id,
        {
          assigned_to,
          status: "under_review",
        },
        { new: true },
      );

      if (!report) {
        return {
          success: false,
          error: "Report not found",
          statusCode: 404,
        };
      }

      // Log action
      await AuditLog.create({
        admin_id,
        action: "assign_report",
        target_type: "report",
        target_id: report_id,
        details: { assigned_to },
        ip_address,
        user_agent,
      });

      return {
        success: true,
        data: report,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error assigning report:", error);
      return {
        success: false,
        error: "Failed to assign report",
        statusCode: 500,
      };
    }
  }

  // ==================== Analytics ====================

  /**
   * Get dashboard overview statistics
   */
  static async getDashboardStats(): Promise<ServiceResponse<DashboardStats>> {
    try {
      await dbConnect();

      const [
        total_users,
        active_users,
        banned_users,
        today_registrations,
        total_lost_items,
        total_found_items,
        total_share_items,
        pending_items,
        active_items,
        total_claims,
        pending_claims,
        approved_claims,
        rejected_claims,
        total_reports,
        new_reports,
        under_review_reports,
        resolved_reports,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ is_active: true, is_banned: false }),
        User.countDocuments({ is_banned: true }),
        User.countDocuments({
          created_at: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        }),
        LostItem.countDocuments(),
        FoundItem.countDocuments(),
        ShareItem.countDocuments(),
        Promise.all([
          LostItem.countDocuments({ status: "pending" }),
          FoundItem.countDocuments({ status: "pending" }),
          ShareItem.countDocuments({ status: "pending" }),
        ]).then((counts) => counts.reduce((a, b) => a + b, 0)),
        Promise.all([
          LostItem.countDocuments({ status: "active" }),
          FoundItem.countDocuments({ status: "available" }),
          ShareItem.countDocuments({ status: "available" }),
        ]).then((counts) => counts.reduce((a, b) => a + b, 0)),
        FoundItemClaim.countDocuments(),
        FoundItemClaim.countDocuments({ status: "pending" }),
        FoundItemClaim.countDocuments({ status: "approved" }),
        FoundItemClaim.countDocuments({ status: "rejected" }),
        Report.countDocuments(),
        Report.countDocuments({ status: "new" }),
        Report.countDocuments({ status: "under_review" }),
        Report.countDocuments({ status: "resolved" }),
      ]);

      return {
        success: true,
        data: {
          users: {
            total: total_users,
            active: active_users,
            banned: banned_users,
            new_today: today_registrations,
          },
          items: {
            total: total_lost_items + total_found_items + total_share_items,
            pending: pending_items,
            active: active_items,
            lost_items: total_lost_items,
            found_items: total_found_items,
            share_items: total_share_items,
          },
          claims: {
            total: total_claims,
            pending: pending_claims,
            approved: approved_claims,
            rejected: rejected_claims,
          },
          reports: {
            total: total_reports,
            new: new_reports,
            under_review: under_review_reports,
            resolved: resolved_reports,
          },
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        success: false,
        error: "Failed to fetch dashboard stats",
        statusCode: 500,
      };
    }
  }

  /**
   * Get user analytics
   */
  static async getUserAnalytics(): Promise<ServiceResponse<unknown>> {
    try {
      await dbConnect();

      // Get user growth data (last 30 days)
      const thirty_days_ago = new Date();
      thirty_days_ago.setDate(thirty_days_ago.getDate() - 30);

      const user_growth = await User.aggregate([
        {
          $match: {
            created_at: { $gte: thirty_days_ago },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Get user distribution by role
      const user_by_role = await User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]);

      // Get most active users
      const most_active_users = await User.find({ is_active: true })
        .select("name email last_active")
        .sort({ last_active: -1 })
        .limit(10)
        .lean();

      return {
        success: true,
        data: {
          user_growth,
          user_by_role,
          most_active_users,
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      return {
        success: false,
        error: "Failed to fetch user analytics",
        statusCode: 500,
      };
    }
  }

  /**
   * Get item analytics
   */
  static async getItemAnalytics(): Promise<ServiceResponse<unknown>> {
    try {
      await dbConnect();

      // Get items posted over time (last 30 days)
      const thirty_days_ago = new Date();
      thirty_days_ago.setDate(thirty_days_ago.getDate() - 30);

      const [lost_items_trend, found_items_trend, share_items_trend] =
        await Promise.all([
          LostItem.aggregate([
            {
              $match: {
                created_at: { $gte: thirty_days_ago },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ]),
          FoundItem.aggregate([
            {
              $match: {
                created_at: { $gte: thirty_days_ago },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ]),
          ShareItem.aggregate([
            {
              $match: {
                created_at: { $gte: thirty_days_ago },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ]),
        ]);

      // Get category distribution
      const category_distribution = await LostItem.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      return {
        success: true,
        data: {
          lost_items_trend,
          found_items_trend,
          share_items_trend,
          category_distribution,
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error fetching item analytics:", error);
      return {
        success: false,
        error: "Failed to fetch item analytics",
        statusCode: 500,
      };
    }
  }

  /**
   * Get claim analytics
   */
  static async getClaimAnalytics(): Promise<ServiceResponse<unknown>> {
    try {
      await dbConnect();

      // Get claims by status
      const claims_by_status = await FoundItemClaim.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Get claims trend (last 30 days)
      const thirty_days_ago = new Date();
      thirty_days_ago.setDate(thirty_days_ago.getDate() - 30);

      const claims_trend = await FoundItemClaim.aggregate([
        {
          $match: {
            created_at: { $gte: thirty_days_ago },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Calculate success rate
      const total_claims = await FoundItemClaim.countDocuments();
      const successful_claims = await FoundItemClaim.countDocuments({
        status: "approved",
      });
      const success_rate =
        total_claims > 0 ? (successful_claims / total_claims) * 100 : 0;

      return {
        success: true,
        data: {
          claims_by_status,
          claims_trend,
          success_rate: success_rate.toFixed(2),
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error fetching claim analytics:", error);
      return {
        success: false,
        error: "Failed to fetch claim analytics",
        statusCode: 500,
      };
    }
  }

  // ==================== Audit Logs ====================

  /**
   * Get audit logs with filters
   */
  static async getAuditLogs(
    options: AuditLogFilters,
  ): Promise<ServiceResponse<PaginatedResponse<unknown>>> {
    try {
      await dbConnect();

      const page = options.page || 1;
      const limit = options.limit || 50;
      const skip = (page - 1) * limit;

      const query: AuditLogQueryFilter = {};

      if (options.admin_id) query.admin_id = options.admin_id;
      if (options.action) query.action = options.action;
      if (options.target_type) query.target_type = options.target_type;
      if (options.date_from || options.date_to) {
        query.timestamp = {} as { $gte?: Date; $lte?: Date };
        if (options.date_from)
          (query.timestamp as { $gte?: Date; $lte?: Date }).$gte =
            options.date_from;
        if (options.date_to)
          (query.timestamp as { $gte?: Date; $lte?: Date }).$lte =
            options.date_to;
      }

      const [logs, total] = await Promise.all([
        AuditLog.find(query)
          .populate("admin_id", "name email role")
          .skip(skip)
          .limit(limit)
          .sort({ timestamp: -1 })
          .lean(),
        AuditLog.countDocuments(query),
      ]);

      return {
        success: true,
        data: {
          items: logs,
          total,
          page,
          total_pages: Math.ceil(total / limit),
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return {
        success: false,
        error: "Failed to fetch audit logs",
        statusCode: 500,
      };
    }
  }

  /**
   * Export audit logs (for compliance)
   */
  static async exportAuditLogs(
    filters: AuditLogExportFilters,
  ): Promise<ServiceResponse<unknown[]>> {
    try {
      await dbConnect();

      const query: AuditLogQueryFilter = {};

      if (filters.admin_id) query.admin_id = filters.admin_id;
      if (filters.date_from || filters.date_to) {
        query.timestamp = {} as { $gte?: Date; $lte?: Date };
        if (filters.date_from)
          (query.timestamp as { $gte?: Date; $lte?: Date }).$gte =
            filters.date_from;
        if (filters.date_to)
          (query.timestamp as { $gte?: Date; $lte?: Date }).$lte =
            filters.date_to;
      }

      const logs = await AuditLog.find(query)
        .populate("admin_id", "name email role")
        .sort({ timestamp: -1 })
        .lean();

      return {
        success: true,
        data: logs,
        statusCode: 200,
      };
    } catch (error) {
      console.error("Error exporting audit logs:", error);
      return {
        success: false,
        error: "Failed to export audit logs",
        statusCode: 500,
      };
    }
  }
}
