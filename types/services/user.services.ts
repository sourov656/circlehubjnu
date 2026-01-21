import dbConnect from "@/lib/mongodb";
import User from "@/models/users.m";
import type {
  ServiceResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/types/auth.types";
import bcrypt from "bcryptjs";

export class UserService {
  /**
   * Get user by ID with role information
   */
  static async getUserById(userId: string): Promise<
    ServiceResponse<{
      id: string;
      email: string;
      name: string;
      role: "student" | "admin" | "moderator" | "support_staff";
      verified: boolean;
      is_active: boolean;
      is_banned: boolean;
    }>
  > {
    try {
      await dbConnect();

      const user = await User.findById(userId);

      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          verified: user.verified,
          is_active: user.is_active,
          is_banned: user.is_banned,
        },
        statusCode: 200,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Get user by ID error:", error);
      return {
        success: false,
        error: "Failed to fetch user",
        statusCode: 500,
      };
    }
  }

  /**
   * Update user role
   * Only admin can update roles
   */
  static async updateUserRole(
    userId: string,
    newRole: "student" | "admin" | "moderator" | "support_staff",
    adminUserId: string,
  ): Promise<ServiceResponse<{ message: string }>> {
    try {
      await dbConnect();

      // Check if the admin has permission
      const adminUser = await User.findById(adminUserId);
      if (!adminUser || adminUser.role !== "admin") {
        return {
          success: false,
          error: "Only admins can update user roles",
          statusCode: 403,
        };
      }

      // Find the user to update
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      // Update the role
      user.role = newRole;
      await user.save();

      return {
        success: true,
        data: {
          message: `User role updated to ${newRole} successfully`,
        },
        statusCode: 200,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Update user role error:", error);
      return {
        success: false,
        error: "Failed to update user role",
        statusCode: 500,
      };
    }
  }

  /**
   * Get all users with pagination
   */
  static async getAllUsers(
    page: number = 1,
    limit: number = 10,
    role?: "student" | "admin" | "moderator" | "support_staff",
  ): Promise<
    ServiceResponse<{
      users: Array<{
        id: string;
        email: string;
        name: string;
        role: string;
        verified: boolean;
        is_active: boolean;
        is_banned: boolean;
        created_at: Date;
      }>;
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>
  > {
    try {
      await dbConnect();

      const query = role ? { role } : {};
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find(query)
          .select("-password")
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(query),
      ]);

      return {
        success: true,
        data: {
          users: users.map((user) => ({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            verified: user.verified,
            is_active: user.is_active,
            is_banned: user.is_banned,
            created_at: user.created_at,
          })),
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        statusCode: 200,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Get all users error:", error);
      return {
        success: false,
        error: "Failed to fetch users",
        statusCode: 500,
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    user_id: string,
    update_data: UpdateProfileRequest,
  ): Promise<ServiceResponse<{ message: string; user: unknown }>> {
    try {
      await dbConnect();

      const update_fields: Record<string, string> = {};
      if (update_data.name) update_fields.name = update_data.name;
      if (update_data.university !== undefined)
        update_fields.university = update_data.university;
      if (update_data.studentId !== undefined)
        update_fields.student_id = update_data.studentId;
      if (update_data.phone !== undefined)
        update_fields.phone = update_data.phone;

      const updated_user = await User.findByIdAndUpdate(
        user_id,
        { $set: update_fields },
        { new: true, runValidators: true },
      ).select("-password");

      if (!updated_user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: {
          message: "Profile updated successfully",
          user: {
            id: updated_user._id.toString(),
            email: updated_user.email,
            name: updated_user.name,
            phone: updated_user.phone,
            university: updated_user.university,
            studentId: updated_user.student_id,
            verified: updated_user.verified,
            role: updated_user.role,
          },
        },
        statusCode: 200,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Update profile error:", error);
      return {
        success: false,
        error: "Failed to update profile",
        statusCode: 500,
      };
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    user_id: string,
    password_data: ChangePasswordRequest,
  ): Promise<ServiceResponse<{ message: string }>> {
    try {
      await dbConnect();

      // Verify new password matches confirmation
      if (password_data.new_password !== password_data.confirm_password) {
        return {
          success: false,
          error: "New passwords do not match",
          statusCode: 400,
        };
      }

      // Get user with password
      const user = await User.findById(user_id).select("+password");
      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      // Verify current password
      const is_password_valid = await bcrypt.compare(
        password_data.current_password,
        user.password,
      );

      if (!is_password_valid) {
        return {
          success: false,
          error: "Current password is incorrect",
          statusCode: 401,
        };
      }

      // Validate new password strength
      if (password_data.new_password.length < 6) {
        return {
          success: false,
          error: "New password must be at least 6 characters long",
          statusCode: 400,
        };
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashed_password = await bcrypt.hash(
        password_data.new_password,
        salt,
      );

      // Update password
      user.password = hashed_password;
      await user.save();

      return {
        success: true,
        data: {
          message: "Password changed successfully",
        },
        statusCode: 200,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Change password error:", error);
      return {
        success: false,
        error: "Failed to change password",
        statusCode: 500,
      };
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(
    user_id: string,
    password: string,
  ): Promise<ServiceResponse<{ message: string }>> {
    try {
      await dbConnect();

      // Get user with password
      const user = await User.findById(user_id).select("+password");
      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      // Verify password
      const is_password_valid = await bcrypt.compare(password, user.password);

      if (!is_password_valid) {
        return {
          success: false,
          error: "Password is incorrect",
          statusCode: 401,
        };
      }

      // Delete user
      await User.findByIdAndDelete(user_id);

      return {
        success: true,
        data: {
          message: "Account deleted successfully",
        },
        statusCode: 200,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Delete account error:", error);
      return {
        success: false,
        error: "Failed to delete account",
        statusCode: 500,
      };
    }
  }
}

export default UserService;
