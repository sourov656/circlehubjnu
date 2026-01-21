import { NextRequest, NextResponse } from "next/server";
import { with_admin_auth } from "@/middleware/with-admin-auth";
import dbConnect from "@/lib/mongodb";
import FoundItemClaim from "@/models/found-item-claims.m";

async function handler(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    // Get claims
    const claims = await FoundItemClaim.find(query)
      .populate("foundItemId", "title category images")
      .populate("claimerId", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await FoundItemClaim.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: claims,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Claims List API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch claims",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export const GET = with_admin_auth(handler);
