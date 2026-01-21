import { NextRequest, NextResponse } from "next/server";
import { JWTService } from "@/services/jwt.services";
import { JwtPayload } from "@/types/jwt.types";

export interface AuthenticatedRequest extends NextRequest {
  user?: JwtPayload;
}

/**
 * Extract JWT token from Authorization header
 */
export const getTokenFromHeader = (request: NextRequest): string | null => {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7); // Remove "Bearer " prefix
};

/**
 * Middleware to verify JWT token and extract user info
 * Returns user data if authenticated, otherwise returns error response
 */
export const authenticate = (
  request: NextRequest
):
  | { authenticated: true; user: JwtPayload }
  | { authenticated: false; response: NextResponse } => {
  const token = getTokenFromHeader(request);

  if (!token) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          success: false,
          message: "Authentication required. Please provide a valid token.",
        },
        { status: 401 }
      ),
    };
  }

  const result = JWTService.verifyAccessToken(token);

  if (!result.valid || !result.payload) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token. Please login again.",
        },
        { status: 401 }
      ),
    };
  }

  return {
    authenticated: true,
    user: result.payload,
  };
};

/**
 * Helper function to get user ID from request
 * Use this in API routes after calling authenticate()
 */
export const getUserId = (request: NextRequest): string | null => {
  const auth = authenticate(request);
  return auth.authenticated ? auth.user.userId : null;
};

/**
 * Verify JWT token and return payload
 * Used in middleware for token validation
 */
export const verify_token = (token: string): JwtPayload | null => {
  const result = JWTService.verifyAccessToken(token);
  return result.valid && result.payload ? result.payload : null;
};
