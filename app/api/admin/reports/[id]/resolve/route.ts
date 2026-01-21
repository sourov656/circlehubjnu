import { NextRequest, NextResponse } from "next/server";
import { with_admin_auth } from "@/middleware/with-admin-auth";
import dbConnect from "@/lib/mongodb";
import { Report } from "@/models/reports.m";
import { AuditLog } from "@/models/audit-logs.m";

async function patchHandler(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const { resolution } = await req.json();
    const admin = (req as any).user;

    const report = await Report.findByIdAndUpdate(
      id,
      {
        status: "resolved",
        resolution,
        resolved_by: admin._id,
        resolved_at: new Date(),
      },
      { new: true }
    );

    if (!report) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    // Log action
    await AuditLog.create({
      admin_id: admin._id,
      action: "resolve_report",
      target_type: "report",
      target_id: id,
      details: { resolution },
      ip_address:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown",
      user_agent: req.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      success: true,
      message: "Report resolved successfully",
      data: report,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to resolve report",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export const PATCH = with_admin_auth(patchHandler);
