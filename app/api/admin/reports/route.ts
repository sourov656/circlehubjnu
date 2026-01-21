import { NextRequest, NextResponse } from "next/server";
import "@/lib/mongodb";
import "@/lib/init-models";
import {
  with_admin_auth,
  AdminAuthRequest,
} from "@/middleware/with-admin-auth";
import { AdminService } from "@/services/admin.services";

/**
 * GET /api/admin/reports
 * Get all reports with pagination and filters
 */
async function handle_get(req: AdminAuthRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      reported_type: searchParams.get("reported_type") || undefined,
    };

    const result = await AdminService.getAllReports(options);
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
        message: "Reports retrieved successfully",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reports",
      },
      { status: 500 }
    );
  }
}

export const GET = with_admin_auth(handle_get, "reports.view");
