import { NextRequest, NextResponse } from "next/server";
import "@/lib/mongodb";
import "@/lib/init-models";
import {
  with_admin_auth,
  AdminAuthRequest,
} from "@/middleware/with-admin-auth";
import { AdminService } from "@/services/admin.services";

/**
 * GET /api/admin/analytics
 * Get comprehensive analytics based on type
 * Query param: type (users/items/claims)
 */
async function handle_get(req: AdminAuthRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        {
          success: false,
          message: "Analytics type is required (users/items/claims)",
        },
        { status: 400 }
      );
    }

    let analytics;

    switch (type) {
      case "users":
        analytics = await AdminService.getUserAnalytics();
        break;
      case "items":
        analytics = await AdminService.getItemAnalytics();
        break;
      case "claims":
        analytics = await AdminService.getClaimAnalytics();
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid analytics type. Use: users, items, or claims",
          },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Analytics retrieved successfully",
        data: analytics,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch analytics",
      },
      { status: 500 }
    );
  }
}

export const GET = with_admin_auth(handle_get, "analytics.view");
