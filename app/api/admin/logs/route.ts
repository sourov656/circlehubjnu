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
 * GET /api/admin/logs
 * Get audit logs with pagination and filters
 */
async function handle_get(req: AdminAuthRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "50"),
      admin_id: searchParams.get("admin_id") || undefined,
      action: searchParams.get("action") || undefined,
      target_type: searchParams.get("target_type") || undefined,
      date_from: searchParams.get("date_from")
        ? new Date(searchParams.get("date_from")!)
        : undefined,
      date_to: searchParams.get("date_to")
        ? new Date(searchParams.get("date_to")!)
        : undefined,
    };

    const result = await AdminService.getAuditLogs(options);

    return NextResponse.json(
      {
        success: true,
        message: "Audit logs retrieved successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch audit logs",
      },
      { status: 500 }
    );
  }
}

export const GET = with_admin_auth(handle_get, "logs.view");
