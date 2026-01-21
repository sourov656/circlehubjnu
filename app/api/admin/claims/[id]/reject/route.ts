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
 * POST /api/admin/claims/[id]/reject
 * Reject a claim
 * Body: { reason: string }
 */
async function handle_post(
  req: AdminAuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const claim_id = id;
    const body = await req.json();
    const { reason } = body;

    if (!reason || reason.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Rejection reason is required",
        },
        { status: 400 }
      );
    }

    const { ip_address, user_agent } = get_client_info(req);

    const result = await AdminService.rejectClaim(
      claim_id,
      req.admin_id!,
      reason,
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
        message: "Claim rejected successfully",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting claim:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reject claim",
      },
      { status: 500 }
    );
  }
}

export const POST = with_admin_auth(handle_post, "claims.manage");
