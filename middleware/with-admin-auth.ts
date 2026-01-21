import { NextRequest, NextResponse } from "next/server";
import { JWTService } from "@/services/jwt.services";
import dbConnect from "@/lib/mongodb";
import User from "@/models/users.m";

interface AdminData {
  _id: string;
  user_id: string;
  role: string;
  permissions: string[];
  is_active: boolean;
}

/**
 * Admin Authentication Middleware
 * Verifies that the user is an authenticated admin with appropriate permissions
 */

export interface AdminAuthRequest extends NextRequest {
  user_id?: string;
  admin_id?: string;
  admin_role?: string;
  permissions?: string[];
}

/**
 * Get default permissions based on user role
 */
function getDefaultPermissionsByRole(role: string): string[] {
  const permission_map: Record<string, string[]> = {
    admin: [
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
    ],
    moderator: [
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
    ],
    support_staff: ["users.view", "items.view", "claims.view", "reports.view"],
  };

  return permission_map[role] || [];
}

/**
 * Middleware to verify admin authentication and authorization
 * @param handler - The route handler function to wrap
 * @param required_permission - Optional specific permission required
 * @returns Route handler with admin authentication
 */
export function with_admin_auth<T>(
  handler: (req: AdminAuthRequest, context: T) => Promise<NextResponse>,
  required_permission?: string,
): (req: NextRequest, context: T) => Promise<NextResponse>;
export function with_admin_auth(
  handler: (req: AdminAuthRequest) => Promise<NextResponse>,
  required_permission?: string,
): (req: NextRequest) => Promise<NextResponse>;
export function with_admin_auth<T = unknown>(
  handler: (req: AdminAuthRequest, context?: T) => Promise<NextResponse>,
  required_permission?: string,
) {
  return async (req: NextRequest, context?: T) => {
    try {
      // Get authorization header
      const auth_header = req.headers.get("authorization");
      if (!auth_header || !auth_header.startsWith("Bearer ")) {
        return NextResponse.json(
          {
            success: false,
            message: "No authorization token provided",
          },
          { status: 401 },
        );
      }

      // Extract and verify token
      const token = auth_header.substring(7);
      const decoded = JWTService.verifyAccessToken(token);

      if (!decoded || !decoded.payload?.userId) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid or expired token",
          },
          { status: 401 },
        );
      }

      // Connect to database and get user details
      await dbConnect();
      const user = await User.findById(decoded.payload.userId).select(
        "-password",
      );

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "User not found",
          },
          { status: 404 },
        );
      }

      // Check if user has admin role
      const admin_roles = ["admin", "moderator", "support_staff"];
      if (!admin_roles.includes(user.role)) {
        return NextResponse.json(
          {
            success: false,
            message: "User is not an admin",
          },
          { status: 403 },
        );
      }

      // Check if user is active
      if (!user.is_active) {
        return NextResponse.json(
          {
            success: false,
            message: "Admin account is deactivated",
          },
          { status: 403 },
        );
      }

      // Get permissions based on role
      const permissions = getDefaultPermissionsByRole(user.role);

      // Check specific permission if required
      if (required_permission) {
        if (!permissions.includes(required_permission)) {
          return NextResponse.json(
            {
              success: false,
              message: `Permission denied. Required: ${required_permission}`,
            },
            { status: 403 },
          );
        }
      }

      // Add admin info to request
      const admin_req = req as AdminAuthRequest;
      admin_req.user_id = decoded.payload.userId;
      admin_req.admin_id = user._id.toString();
      admin_req.admin_role = user.role;
      admin_req.permissions = permissions;

      // Call the handler with context if provided
      return await handler(admin_req, context as T);
    } catch (error) {
      console.error("Admin auth middleware error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Authentication failed",
        },
        { status: 500 },
      );
    }
  };
}

/**
 * Helper to check multiple permissions (user must have at least one)
 */
export function with_admin_auth_any<T = unknown>(
  handler: (req: AdminAuthRequest, context?: T) => Promise<NextResponse>,
  required_permissions: string[],
) {
  return async (req: NextRequest, context?: T) => {
    try {
      // Get authorization header
      const auth_header = req.headers.get("authorization");
      if (!auth_header || !auth_header.startsWith("Bearer ")) {
        return NextResponse.json(
          {
            success: false,
            message: "No authorization token provided",
          },
          { status: 401 },
        );
      }

      // Extract and verify token
      const token = auth_header.substring(7);
      const decoded = JWTService.verifyAccessToken(token);

      if (!decoded || !decoded.payload?.userId) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid or expired token",
          },
          { status: 401 },
        );
      }

      // Connect to database and get user details
      await dbConnect();
      const user = await User.findById(decoded.payload.userId).select(
        "-password",
      );

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "User not found",
          },
          { status: 404 },
        );
      }

      // Check if user has admin role
      const admin_roles = ["admin", "moderator", "support_staff"];
      if (!admin_roles.includes(user.role)) {
        return NextResponse.json(
          {
            success: false,
            message: "User is not an admin",
          },
          { status: 403 },
        );
      }

      // Check if user is active
      if (!user.is_active) {
        return NextResponse.json(
          {
            success: false,
            message: "Admin account is deactivated",
          },
          { status: 403 },
        );
      }

      // Get permissions based on role
      const permissions = getDefaultPermissionsByRole(user.role);

      // Check if admin has at least one of the required permissions
      const has_permission = required_permissions.some((perm) =>
        permissions.includes(perm),
      );

      if (!has_permission) {
        return NextResponse.json(
          {
            success: false,
            message: `Permission denied. Required one of: ${required_permissions.join(
              ", ",
            )}`,
          },
          { status: 403 },
        );
      }

      // Add admin info to request
      const admin_req = req as AdminAuthRequest;
      admin_req.user_id = decoded.payload.userId;
      admin_req.admin_id = user._id.toString();
      admin_req.admin_role = user.role;
      admin_req.permissions = permissions;

      // Call the handler with context if provided
      return await handler(admin_req, context);
    } catch (error) {
      console.error("Admin auth middleware error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Authentication failed",
        },
        { status: 500 },
      );
    }
  };
}

/**
 * Helper to check if user has a specific role
 */
export function with_admin_role<T = unknown>(
  handler: (req: AdminAuthRequest, context?: T) => Promise<NextResponse>,
  required_role: "super_admin" | "moderator" | "support_staff",
) {
  return async (req: NextRequest, context?: T) => {
    try {
      // Get authorization header
      const auth_header = req.headers.get("authorization");
      if (!auth_header || !auth_header.startsWith("Bearer ")) {
        return NextResponse.json(
          {
            success: false,
            message: "No authorization token provided",
          },
          { status: 401 },
        );
      }

      // Extract and verify token
      const token = auth_header.substring(7);
      const decoded = JWTService.verifyAccessToken(token);

      if (!decoded || !decoded.payload?.userId) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid or expired token",
          },
          { status: 401 },
        );
      }

      // Connect to database and get user details
      await dbConnect();
      const user = await User.findById(decoded.payload.userId).select(
        "-password",
      );

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "User not found",
          },
          { status: 404 },
        );
      }

      // Check if user has admin role
      const admin_roles = ["admin", "moderator", "support_staff"];
      if (!admin_roles.includes(user.role)) {
        return NextResponse.json(
          {
            success: false,
            message: "User is not an admin",
          },
          { status: 403 },
        );
      }

      // Check if user is active
      if (!user.is_active) {
        return NextResponse.json(
          {
            success: false,
            message: "Admin account is deactivated",
          },
          { status: 403 },
        );
      }

      // Check role
      if (user.role !== required_role) {
        return NextResponse.json(
          {
            success: false,
            message: `Access denied. Required role: ${required_role}`,
          },
          { status: 403 },
        );
      }

      // Get permissions based on role
      const permissions = getDefaultPermissionsByRole(user.role);

      // Add admin info to request
      const admin_req = req as AdminAuthRequest;
      admin_req.user_id = decoded.payload?.userId;
      admin_req.admin_id = user._id.toString();
      admin_req.admin_role = user.role;
      admin_req.permissions = permissions;

      // Call the handler with context if provided
      return await handler(admin_req, context);
    } catch (error) {
      console.error("Admin auth middleware error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Authentication failed",
        },
        { status: 500 },
      );
    }
  };
}

/**
 * Extract client information from request
 */
export function get_client_info(req: NextRequest) {
  const ip_address =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const user_agent = req.headers.get("user-agent") || "unknown";

  return { ip_address, user_agent };
}
