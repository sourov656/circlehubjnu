import { NextRequest, NextResponse } from "next/server";
import "@/lib/mongodb";
import "@/lib/init-models";
import { AdminService } from "@/services/admin.services";
import { JWTService } from "@/services/jwt.services";

/**
 * GET /api/admin/auth/verify
 * Verify admin authentication and return admin details
 */
export async function GET(req: NextRequest) {
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

    if (!decoded.valid || !decoded.payload?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: decoded.error || "Invalid or expired token",
        },
        { status: 401 },
      );
    }

    // Get user details and check if they're an admin
    const result = await AdminService.getUserById(decoded.payload.userId);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "User not found",
        },
        { status: result.statusCode },
      );
    }

    const user = result.data as {
      _id: string;
      name: string;
      email: string;
      role: string;
      is_active: boolean;
      verified: boolean;
    };

    // Check if user has admin role
    const admin_roles = ["admin", "moderator", "support_staff"];
    if (!admin_roles.includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "User is not an admin",
        },
        { status: 403 }
      );
    }

    // Check if admin is active
    if (!user.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin account is deactivated",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Admin authenticated",
        data: {
          user_id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verified: user.verified,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error verifying admin:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify admin authentication",
      },
      { status: 500 },
    );
  }
}
