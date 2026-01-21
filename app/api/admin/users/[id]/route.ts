import { NextRequest, NextResponse } from "next/server";
import "@/lib/mongodb";
import "@/lib/init-models";
import {
  with_admin_auth,
  AdminAuthRequest,
  get_client_info,
} from "@/middleware/with-admin-auth";
import { AdminService } from "@/services/admin.services";

/**
 * GET /api/admin/users/[id]
 * Get user details by ID
 */
async function handle_get(
  req: AdminAuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user_id = id;
    const result = await AdminService.getUserById(user_id);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error,
        },
        { status: result.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User details retrieved successfully",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const error_message =
      error instanceof Error ? error.message : "Failed to fetch user details";
    const status_code = error_message === "User not found" ? 404 : 500;
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        success: false,
        message: error_message,
      },
      { status: status_code }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user details
 */
async function handle_patch(
  req: AdminAuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user_id = id;
    const body = await req.json();
    const { ip_address, user_agent } = get_client_info(req);

    // Remove fields that shouldn't be updated this way
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, email, _id, ...updates } = body;

    const result = await AdminService.updateUserDetails(
      user_id,
      req.admin_id!,
      updates,
      ip_address,
      user_agent
    );
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error,
        },
        { status: result.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user (soft delete)
 */
async function handle_delete(
  req: AdminAuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user_id = id;
    const { ip_address, user_agent } = get_client_info(req);

    const result = await AdminService.deleteUser(
      user_id,
      req.admin_id!,
      ip_address,
      user_agent
    );
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error,
        },
        { status: result.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User deleted successfully",
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user",
      },
      { status: 500 }
    );
  }
}

export const GET = with_admin_auth(handle_get, "users.view");

export const PATCH = with_admin_auth(handle_patch, "users.edit");

export const DELETE = with_admin_auth(handle_delete, "users.delete");
