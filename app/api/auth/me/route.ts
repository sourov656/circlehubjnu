import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/with-auth";
import { JwtPayload } from "@/types/jwt.types";
import { AuthService } from "@/services/auth.services";

export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    const result = await AuthService.getCurrentUser(user.userId);

    if (result.success && result.data) {
      return NextResponse.json(result.data, { status: result.statusCode });
    }

    return NextResponse.json(
      { error: result.error },
      { status: result.statusCode }
    );
  } catch (error) {
    console.error("Get current user API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
