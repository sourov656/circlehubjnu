import { NextResponse } from "next/server";
import "@/lib/mongodb";
import "@/lib/init-models";
import {
  with_admin_auth,
  AdminAuthRequest,
} from "@/middleware/with-admin-auth";
import { AdminService } from "@/services/admin.services";

/**
 * PATCH /api/admin/users/[id]/verify
 * Toggle user verification status (admin only)
 * Requires "users.edit" permission
 */
async function handle_patch(
  req: AdminAuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { verified } = body;

    if (typeof verified !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "Verified field must be a boolean",
        },
        { status: 400 }
      );
    }

    // Get admin info from request
    const admin_id = req.admin_id;
    if (!admin_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin ID not found in request",
        },
        { status: 401 }
      );
    }

    const ip_address = req.headers.get("x-forwarded-for") || "unknown";
    const user_agent = req.headers.get("user-agent") || "unknown";

    // Update user verification status
    const result = await AdminService.updateUserVerification(
      id,
      verified,
      admin_id,
      ip_address,
      user_agent
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error,
        },
        { status: result.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `User ${verified ? "verified" : "unverified"} successfully`,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update user verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user verification",
      },
      { status: 500 }
    );
  }
}

export const PATCH = with_admin_auth(handle_patch, "users.edit");

// Apply dynamic rendering
export const dynamic = "force-dynamic";
