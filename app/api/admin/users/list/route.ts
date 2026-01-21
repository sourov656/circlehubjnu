import { NextRequest, NextResponse } from "next/server";
import { with_admin_auth } from "@/middleware/with-admin-auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/users.m";

async function handler(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const role = searchParams.get("role") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { student_id: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active") {
      query.is_banned = false;
    } else if (status === "banned") {
      query.is_banned = true;
    }

    if (role) {
      query.role = role;
    }

    // Get users
    const users = await User.find(query)
      .select("-password")
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Users List API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export const GET = with_admin_auth(handler);
