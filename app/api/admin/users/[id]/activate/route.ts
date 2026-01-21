import { NextResponse } from "next/server";
import "@/lib/mongodb";
import "@/lib/init-models";
import {
  with_admin_auth,
  AdminAuthRequest,
} from "@/middleware/with-admin-auth";
import { AdminService } from "@/services/admin.services";

/**
 * PATCH /api/admin/users/[id]/activate
 * Toggle user active status (admin only)
 * Requires "users.edit" permission
 */
async function handle_patch(
  req: AdminAuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { is_active } = body;

    if (typeof is_active !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "is_active field must be a boolean",
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

    // Update user active status
    const result = await AdminService.updateUserActiveStatus(
      id,
      is_active,
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
        message: `User ${is_active ? "activated" : "deactivated"} successfully`,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update user active status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user active status",
      },
      { status: 500 }
    );
  }
}

export const PATCH = with_admin_auth(handle_patch, "users.edit");

// Apply dynamic rendering
export const dynamic = "force-dynamic";
