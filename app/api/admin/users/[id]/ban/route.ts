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
 * POST /api/admin/users/[id]/ban
 * Ban a user
 */
async function handle_post(
  req: AdminAuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user_id = id;
    const body = await req.json();
    const { reason } = body;

    if (!reason || reason.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Ban reason is required",
        },
        { status: 400 }
      );
    }

    const { ip_address, user_agent } = get_client_info(req);

    const result = await AdminService.banUser(
      user_id,
      req.admin_id!,
      reason,
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
        message: "User banned successfully",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error banning user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to ban user",
      },
      { status: 500 }
    );
  }
}

export const POST = with_admin_auth(handle_post, "users.ban");
