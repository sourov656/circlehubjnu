import { NextResponse } from "next/server";
import "@/lib/mongodb";
import "@/lib/init-models";
import {
  with_admin_auth,
  AdminAuthRequest,
} from "@/middleware/with-admin-auth";
import { AdminService } from "@/services/admin.services";

/**
 * GET /api/admin/dashboard
 * Get dashboard overview statistics
 */
async function handle_get(req: AdminAuthRequest) {
  try {
    const stats = await AdminService.getDashboardStats();

    return NextResponse.json(
      {
        success: true,
        message: "Dashboard stats retrieved successfully",
        data: stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard stats",
      },
      { status: 500 }
    );
  }
}

export const GET = with_admin_auth(handle_get);
