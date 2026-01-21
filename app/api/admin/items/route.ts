import { NextRequest, NextResponse } from "next/server";
import "@/lib/mongodb";
import "@/lib/init-models";
import {
  with_admin_auth,
  AdminAuthRequest,
} from "@/middleware/with-admin-auth";
import { AdminService } from "@/services/admin.services";

/**
 * GET /api/admin/items
 * Get all items with pagination and filters
 * Query params: type (lost/found/share), page, limit, status, category, search, date_from, date_to
 */
async function handle_get(req: AdminAuthRequest) {
  try {
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

    const options = {
      type,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      status: searchParams.get("status") || undefined,
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      date_from: searchParams.get("date_from")
        ? new Date(searchParams.get("date_from")!)
        : undefined,
      date_to: searchParams.get("date_to")
        ? new Date(searchParams.get("date_to")!)
        : undefined,
    };

    const result = await AdminService.getAllItems(options);
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
        message: "Items retrieved successfully",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch items",
      },
      { status: 500 }
    );
  }
}

export const GET = with_admin_auth(handle_get, "items.view");
