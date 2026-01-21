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
 * POST /api/admin/claims/[id]/approve
 * Approve a claim
 */
async function handle_post(
  req: AdminAuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const claim_id = id;
    const { ip_address, user_agent } = get_client_info(req);

    const result = await AdminService.approveClaim(
      claim_id,
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
        message: "Claim approved successfully",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving claim:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to approve claim",
      },
      { status: 500 }
    );
  }
}

export const POST = with_admin_auth(handle_post, "claims.manage");
