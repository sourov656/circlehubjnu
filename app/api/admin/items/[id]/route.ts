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
 * DELETE /api/admin/items/[id]
 * Delete an item
 * Query param: type (lost/found/share)
 */
async function handle_delete(
  req: AdminAuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item_id = id;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as "lost" | "found" | "share";

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

    const result = await AdminService.deleteItem(
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
        message: "Item deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete item",
      },
      { status: 500 }
    );
  }
}

export const DELETE = with_admin_auth(handle_delete, "items.delete");
