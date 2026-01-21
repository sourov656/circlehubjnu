import { NextRequest, NextResponse } from "next/server";
import { with_admin_auth } from "@/middleware/with-admin-auth";
import dbConnect from "@/lib/mongodb";
import { AuditLog } from "@/models/audit-logs.m";

async function handler(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "";
    const target_type = searchParams.get("target_type") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query
    const query: any = {};

    if (action) {
      query.action = action;
    }

    if (target_type) {
      query.target_type = target_type;
    }

    // Get logs
    const logs = await AuditLog.find(query)
      .populate("admin_id", "name email role")
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await AuditLog.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Logs List API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch logs",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export const GET = with_admin_auth(handler);
