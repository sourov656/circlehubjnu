import { NextRequest, NextResponse } from "next/server";
import "@/lib/mongodb";
import "@/lib/init-models";
import {
  with_admin_auth,
  AdminAuthRequest,
} from "@/middleware/with-admin-auth";
import { AdminService } from "@/services/admin.services";

/**
 * GET /api/admin/logs/export
 * Export audit logs based on filters
 */
async function handle_get(req: AdminAuthRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters = {
      admin_id: searchParams.get("admin_id") || undefined,
      date_from: searchParams.get("date_from")
        ? new Date(searchParams.get("date_from")!)
        : undefined,
      date_to: searchParams.get("date_to")
        ? new Date(searchParams.get("date_to")!)
        : undefined,
    };

    const result = await AdminService.exportAuditLogs(filters);

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to export audit logs",
        },
        { status: result.statusCode || 500 }
      );
    }

    const logs = result.data as any[];

    // Return data as JSON for client-side export
    return NextResponse.json(
      {
        success: true,
        message: "Audit logs retrieved successfully",
        data: logs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to export audit logs",
      },
      { status: 500 }
    );
  }
}

export const GET = with_admin_auth(handle_get, "logs.export");
