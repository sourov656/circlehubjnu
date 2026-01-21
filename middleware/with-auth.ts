import { JWTService } from "@/services/jwt.services";
import { JwtPayload } from "@/types/jwt.types";
import { NextRequest, NextResponse } from "next/server";

/**
 * JWT Authentication Middleware
 * Validates JWT access tokens and attaches user data to the request
 */
export async function authMiddleware(request: NextRequest): Promise<{
  success: boolean;
  user?: JwtPayload;
  error?: string;
  response?: NextResponse;
}> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        error: "Missing or invalid authorization header",
        response: NextResponse.json(
          {
            success: false,
            message:
              "Authentication required. Please provide a valid access token.",
            error: "MISSING_TOKEN",
          },
          { status: 401 }
        ),
      };
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Validate token using JWTService
    const validationResult = JWTService.verifyAccessToken(token);

    if (!validationResult.valid || !validationResult.payload) {
      return {
        success: false,
        error: validationResult.error || "Invalid token",
        response: NextResponse.json(
          {
            success: false,
            message:
              validationResult.error || "Invalid or expired access token",
            error: "INVALID_TOKEN",
          },
          { status: 401 }
        ),
      };
    }

    return {
      success: true,
      user: validationResult.payload,
    };
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
      response: NextResponse.json(
        {
          success: false,
          message: "Internal authentication error",
          error: "AUTH_ERROR",
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Higher-order function to protect API routes with JWT authentication
 * @param handler - The API route handler function
 * @returns Protected API route handler
 */
export function withAuth<T = unknown>(
  handler: (
    request: NextRequest,
    user: JwtPayload,
    context?: T
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T) => {
    const authResult = await authMiddleware(request);

    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    return handler(request, authResult.user, context);
  };
}
