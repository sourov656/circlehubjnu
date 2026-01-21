import { NextRequest, NextResponse } from "next/server";
import { with_admin_auth } from "@/middleware/with-admin-auth";
import dbConnect from "@/lib/mongodb";
import { Report } from "@/models/reports.m";

async function handler(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    // Get reports
    const reports = await Report.find(query)
      .populate("reporter_id", "name email")
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Report.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Reports List API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reports",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export const GET = with_admin_auth(handler);
