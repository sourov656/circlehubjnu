import { NextRequest, NextResponse } from "next/server";
import { verify_token } from "@/lib/auth";

export type UserRole = "student" | "admin" | "moderator" | "support_staff";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Middleware to check if user is authenticated and has required role
 */
export async function withRoleAuth(
  request: NextRequest,
  allowed_roles: UserRole[],
): Promise<
  | { authorized: true; user: AuthenticatedUser }
  | { authorized: false; response: NextResponse }
> {
  try {
    // Get access token from cookie or authorization header
    const access_token =
      request.cookies.get("campus_connect_access_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!access_token) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Unauthorized", message: "No access token provided" },
          { status: 401 },
        ),
      };
    }

    // Verify token
    const decoded = await verify_token(access_token);

    if (!decoded) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Unauthorized", message: "Invalid or expired token" },
          { status: 401 },
        ),
      };
    }

    const user: AuthenticatedUser = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role as UserRole,
    };

    // Check if user has required role
    if (!allowed_roles.includes(user.role)) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            error: "Forbidden",
            message: `Access denied. Required roles: ${allowed_roles.join(
              ", ",
            )}`,
          },
          { status: 403 },
        ),
      };
    }

    return { authorized: true, user };
  } catch (error) {
    console.error("Role auth error:", error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Internal Server Error", message: "Authentication failed" },
        { status: 500 },
      ),
    };
  }
}

/**
 * Check if user has admin role
 */
export async function withAdminAuth(
  request: NextRequest,
): Promise<
  | { authorized: true; user: AuthenticatedUser }
  | { authorized: false; response: NextResponse }
> {
  return withRoleAuth(request, ["admin"]);
}

/**
 * Check if user has moderator or admin role
 */
export async function withModeratorAuth(
  request: NextRequest,
): Promise<
  | { authorized: true; user: AuthenticatedUser }
  | { authorized: false; response: NextResponse }
> {
  return withRoleAuth(request, ["admin", "moderator"]);
}

/**
 * Check if user has support_staff, moderator or admin role
 */
export async function withSupportAuth(
  request: NextRequest,
): Promise<
  | { authorized: true; user: AuthenticatedUser }
  | { authorized: false; response: NextResponse }
> {
  return withRoleAuth(request, ["admin", "moderator", "support_staff"]);
}

/**
 * Check if user is authenticated (any role)
 */
export async function withAuth(
  request: NextRequest,
): Promise<
  | { authorized: true; user: AuthenticatedUser }
  | { authorized: false; response: NextResponse }
> {
  return withRoleAuth(request, [
    "student",
    "admin",
    "moderator",
    "support_staff",
  ]);
}
