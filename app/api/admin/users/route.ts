import { NextRequest, NextResponse } from "next/server";
import "@/lib/mongodb";
import "@/lib/init-models";
import {
  with_admin_auth,
  AdminAuthRequest,
} from "@/middleware/with-admin-auth";
import { AdminService } from "@/services/admin.services";

/**
 * GET /api/admin/users
 * Get all users with pagination and filters
 */
async function handle_get(req: AdminAuthRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      search: searchParams.get("search") || undefined,
      role: searchParams.get("role") || undefined,
      verified: searchParams.get("verified")
        ? searchParams.get("verified") === "true"
        : undefined,
      is_banned: searchParams.get("is_banned")
        ? searchParams.get("is_banned") === "true"
        : undefined,
      is_active: searchParams.get("is_active")
        ? searchParams.get("is_active") === "true"
        : undefined,
    };

    const result = await AdminService.getAllUsers(options);
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
        message: "Users retrieved successfully",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

export const GET = with_admin_auth(handle_get, "users.view");
