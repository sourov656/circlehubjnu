import { NextRequest, NextResponse } from "next/server";
import "@/lib/mongodb";
import "@/lib/init-models";
import {
  with_admin_auth,
  AdminAuthRequest,
} from "@/middleware/with-admin-auth";
import { AdminService } from "@/services/admin.services";

/**
 * GET /api/admin/claims
 * Get all claims with pagination and filters
 */
async function handle_get(req: AdminAuthRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      status: searchParams.get("status") || undefined,
      verification_status: searchParams.get("verification_status") || undefined,
    };

    const result = await AdminService.getAllClaims(options);
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
        message: "Claims retrieved successfully",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching claims:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch claims",
      },
      { status: 500 }
    );
  }
}

export const GET = with_admin_auth(handle_get, "claims.view");
