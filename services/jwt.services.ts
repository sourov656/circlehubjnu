import { jwtSecret } from "@/config/env";
import jwt, { SignOptions } from "jsonwebtoken";
import type {
  JwtPayload,
  JwtTokenResponse,
  JwtVerifyResult,
  JwtDecodeResult,
} from "@/types/jwt.types";
import crypto from "crypto";

/**
 * Industry-standard JWT Service
 * Handles token generation, verification, and refresh token management
 */
export class JWTService {
  private static readonly ACCESS_TOKEN_SECRET = jwtSecret.secret;
  private static readonly REFRESH_TOKEN_SECRET = jwtSecret.secret + "_refresh";
  private static readonly ACCESS_TOKEN_EXPIRY = jwtSecret.accessTokenExpiry;
  private static readonly REFRESH_TOKEN_EXPIRY = jwtSecret.refreshTokenExpiry;

  // In-memory store for refresh tokens (in production, use Redis or database)
  private static refreshTokenStore = new Map<string, string>();

  /**
   * Generate access and refresh tokens for authenticated user
   * @param payload - User information to embed in token
   * @returns Token response with access and refresh tokens
   */
  static generateTokens(payload: {
    userId: string;
    email: string;
    role: string;
  }): JwtTokenResponse {
    // Generate access token
    const accessToken = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
      this.ACCESS_TOKEN_SECRET,
      {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
      } as SignOptions
    );

    // Generate refresh token with random identifier
    const refreshTokenId = crypto.randomBytes(32).toString("hex");
    const refreshToken = jwt.sign(
      {
        userId: payload.userId,
        tokenId: refreshTokenId,
      },
      this.REFRESH_TOKEN_SECRET,
      {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
      } as SignOptions
    );

    // Store refresh token (in production, store in database with expiry)
    this.refreshTokenStore.set(refreshTokenId, payload.userId);

    // Calculate expiry in seconds
    const expiresIn = this.getExpiryInSeconds(this.ACCESS_TOKEN_EXPIRY);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: "Bearer",
    };
  }

  /**
   * Verify and decode access token
   * @param token - JWT access token to verify
   * @returns Verification result with payload or error
   */
  static verifyAccessToken(token: string): JwtVerifyResult {
    try {
      const decoded = jwt.verify(
        token,
        this.ACCESS_TOKEN_SECRET
      ) as jwt.JwtPayload;

      if (
        !decoded ||
        typeof decoded.userId !== "string" ||
        typeof decoded.email !== "string" ||
        typeof decoded.role !== "string"
      ) {
        return {
          valid: false,
          error: "Invalid token payload structure",
        };
      }

      const payload: JwtPayload = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        iat: decoded.iat,
        exp: decoded.exp,
      };

      return {
        valid: true,
        payload,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          valid: false,
          error: "Token expired",
        };
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return {
          valid: false,
          error: "Invalid token",
        };
      }
      return {
        valid: false,
        error:
          error instanceof Error ? error.message : "Token verification failed",
      };
    }
  }

  /**
   * Verify and decode refresh token
   * @param token - JWT refresh token to verify
   * @returns Verification result with user ID
   */
  static verifyRefreshToken(token: string): {
    valid: boolean;
    userId?: string;
    error?: string;
  } {
    try {
      const decoded = jwt.verify(
        token,
        this.REFRESH_TOKEN_SECRET
      ) as jwt.JwtPayload;

      if (
        !decoded ||
        typeof decoded.userId !== "string" ||
        typeof decoded.tokenId !== "string"
      ) {
        return {
          valid: false,
          error: "Invalid refresh token payload",
        };
      }

      // Check if token exists in store
      const storedUserId = this.refreshTokenStore.get(decoded.tokenId);
      if (!storedUserId || storedUserId !== decoded.userId) {
        return {
          valid: false,
          error: "Refresh token not found or invalid",
        };
      }

      return {
        valid: true,
        userId: decoded.userId,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          valid: false,
          error: "Refresh token expired",
        };
      }
      return {
        valid: false,
        error: "Invalid refresh token",
      };
    }
  }

  /**
   * Revoke a refresh token
   * @param token - Refresh token to revoke
   */
  static revokeRefreshToken(token: string): void {
    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      if (decoded && decoded.tokenId) {
        this.refreshTokenStore.delete(decoded.tokenId);
      }
    } catch (error) {
      console.error("Error revoking refresh token:", error);
    }
  }

  /**
   * Decode token without verification (for debugging)
   * @param token - JWT token to decode
   * @returns Decoded payload or null
   */
  static decodeToken(token: string): JwtDecodeResult {
    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload;

      if (!decoded) {
        return { payload: null, error: "Failed to decode token" };
      }

      return {
        payload: {
          userId: decoded.userId || "",
          email: decoded.email || "",
          role: decoded.role || "",
          iat: decoded.iat,
          exp: decoded.exp,
        },
      };
    } catch (error) {
      return {
        payload: null,
        error: error instanceof Error ? error.message : "Decode failed",
      };
    }
  }

  /**
   * Convert expiry string to seconds
   * @param expiry - Expiry string (e.g., "15m", "7d")
   * @returns Expiry in seconds
   */
  private static getExpiryInSeconds(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      case "d":
        return value * 24 * 60 * 60;
      default:
        return 900; // Default 15 minutes
    }
  }

  /**
   * Clean up expired refresh tokens (call periodically)
   */
  static cleanupExpiredTokens(): void {
    // In production, this would be handled by database TTL or scheduled job
    // For in-memory store, tokens are automatically invalid when JWT expires
    console.log("Token cleanup executed");
  }
}
