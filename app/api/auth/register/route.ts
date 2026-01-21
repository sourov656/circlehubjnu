import { NextRequest, NextResponse } from "next/server";
import type { RegisterRequest } from "@/types/auth.types";
import { AuthService } from "@/services/auth.services";

export async function POST(req: NextRequest) {
  try {
    const body: RegisterRequest = await req.json();

    const result = await AuthService.registerUser(body);

    if (result.success && result.data) {
      return NextResponse.json(
        {
          ...result.data,
          redirect: "/login",
        },
        { status: result.statusCode }
      );
    }

    return NextResponse.json(
      { error: result.error },
      { status: result.statusCode }
    );
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
