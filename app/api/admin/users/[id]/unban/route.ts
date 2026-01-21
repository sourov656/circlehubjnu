import { NextRequest, NextResponse } from "next/server";
import "@/lib/mongodb";
import "@/lib/init-models";
import {
  with_admin_auth,
  AdminAuthRequest,
  get_client_info,
} from "@/middleware/with-admin-auth";
import { AdminService } from "@/services/admin.services";

/**
 * POST /api/admin/users/[id]/unban
 * Unban a user
 */
async function handle_post(
  req: AdminAuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user_id = id;
    const { ip_address, user_agent } = get_client_info(req);

    const result = await AdminService.unbanUser(
      user_id,
      req.admin_id!,
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
        message: "User unbanned successfully",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error unbanning user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to unban user",
      },
      { status: 500 }
    );
  }
}

export const POST = with_admin_auth(handle_post, "users.ban");
