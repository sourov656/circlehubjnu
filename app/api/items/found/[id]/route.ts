import { FoundItemsService } from "@/services/found-items.services";
import { withAuth } from "@/middleware/with-auth";
import { JwtPayload } from "@/types/jwt.types";
import { UpdateFoundItemRequest } from "@/types/items.types";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/items/found/[id]
 * Get a single found item by ID
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Item ID is required",
        },
        { status: 400 }
      );
    }

    const result = await FoundItemsService.getItemById(id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: result.statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Get found item error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/items/found/[id]
 * Update a found item (requires authentication and ownership)
 */
export const PUT = withAuth(
  async (
    req: NextRequest,
    user: JwtPayload,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      if (!context?.params) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing item ID",
          },
          { status: 400 }
        );
      }

      const { id } = await context.params;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: "Item ID is required",
          },
          { status: 400 }
        );
      }

      const body: UpdateFoundItemRequest = await req.json();

      const result = await FoundItemsService.updateItem(id, user.userId, body);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: result.statusCode }
        );
      }

      return NextResponse.json({
        success: true,
        message: result.data?.message || "Found item updated successfully",
        data: result.data?.item,
      });
    } catch (error) {
      console.error("Update found item error:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/items/found/[id]
 * Delete a found item (requires authentication and ownership)
 */
export const DELETE = withAuth(
  async (
    req: NextRequest,
    user: JwtPayload,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      if (!context?.params) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing item ID",
          },
          { status: 400 }
        );
      }

      const { id } = await context.params;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: "Item ID is required",
          },
          { status: 400 }
        );
      }

      const result = await FoundItemsService.deleteItem(id, user.userId);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: result.statusCode }
        );
      }

      return NextResponse.json({
        success: true,
        message: result.data?.message || "Found item deleted successfully",
      });
    } catch (error) {
      console.error("Delete found item error:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * PATCH /api/items/found/[id]
 * Partial update (e.g., mark as resolved)
 */
export const PATCH = withAuth(
  async (
    req: NextRequest,
    user: JwtPayload,
    context?: { params: Promise<{ id: string }> }
  ) => {
    try {
      if (!context?.params) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing item ID",
          },
          { status: 400 }
        );
      }

      const { id } = await context.params;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: "Item ID is required",
          },
          { status: 400 }
        );
      }

      const { action, status } = await req.json();

      if (action === "resolve") {
        const result = await FoundItemsService.markAsResolved(
          id,
          user.userId,
          status || "returned"
        );

        if (!result.success) {
          return NextResponse.json(
            {
              success: false,
              error: result.error,
            },
            { status: result.statusCode }
          );
        }

        return NextResponse.json({
          success: true,
          message: result.data?.message || "Item marked as resolved",
          data: result.data?.item,
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: "Invalid action",
        },
        { status: 400 }
      );
    } catch (error) {
      console.error("Patch found item error:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Internal server error",
        },
        { status: 500 }
      );
    }
  }
);
