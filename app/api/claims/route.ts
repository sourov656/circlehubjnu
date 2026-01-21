import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/with-auth";
import { FoundItemClaimsService } from "@/services/found-item-claims.services";
import { JwtPayload } from "@/types/jwt.types";

/**
 * GET /api/claims
 * Get user's claims (made by user and received by user)
 */
export const GET = withAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "made"; // 'made' or 'received'

    let result;
    if (type === "received") {
      // Get claims on items user found
      result = await FoundItemClaimsService.getReceivedClaims(user.userId);
    } else {
      // Get claims user made
      result = await FoundItemClaimsService.getClaimsByUserId(user.userId);
    }

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
      claims: result.data,
      total: result.data?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching claims:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch claims",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/claims
 * Create a new claim (requires authentication)
 */
export const POST = withAuth(async (req: NextRequest, user: JwtPayload) => {
  try {
    const body = await req.json();

    if (!body.found_item_id) {
      return NextResponse.json(
        {
          success: false,
          error: "found_item_id is required",
        },
        { status: 400 }
      );
    }

    const result = await FoundItemClaimsService.createClaim(user.userId, body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: result.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.data?.message || "Claim submitted successfully",
        claim: result.data?.claim,
      },
      { status: result.statusCode }
    );
  } catch (error) {
    console.error("Error creating claim:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create claim",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
