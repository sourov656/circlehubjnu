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
 * PATCH /api/admin/reports/[id]
 * Update report status or assignment
 * Body: { status?: string, resolution?: string, assigned_to?: string }
 */
async function handle_patch(
  req: AdminAuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report_id = id;
    const body = await req.json();
    const { status, resolution, assigned_to } = body;
    const { ip_address, user_agent } = get_client_info(req);

    // If assigning to admin
    if (assigned_to) {
      const result = await AdminService.assignReport(
        report_id,
        assigned_to,
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
          message: "Report assigned successfully",
          data: result.data,
        },
        { status: 200 }
      );
    }

    // If updating status
    if (status) {
      const valid_statuses = ["new", "under_review", "resolved", "dismissed"];
      if (!valid_statuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid status",
          },
          { status: 400 }
        );
      }

      const result = await AdminService.updateReportStatus(
        report_id,
        req.admin_id!,
        status,
        resolution,
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
          message: "Report status updated successfully",
          data: result.data,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "No valid update provided",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update report",
      },
      { status: 500 }
    );
  }
}

export const PATCH = with_admin_auth(handle_patch, "reports.manage");
