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
 * POST /api/admin/items/[id]/approve
 * Approve an item
 * Body: { type: "lost" | "found" | "share" }
 */
async function handle_post(
  req: AdminAuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item_id = id;
    const body = await req.json();
    const { type } = body;

    if (!type || !["lost", "found", "share"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid item type (lost/found/share) is required",
        },
        { status: 400 }
      );
    }

    const { ip_address, user_agent } = get_client_info(req);

    const result = await AdminService.approveItem(
      item_id,
      type,
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
        message: "Item approved successfully",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error approving item:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to approve item",
      },
      { status: 500 }
    );
  }
}

export const POST = with_admin_auth(handle_post, "items.approve");
