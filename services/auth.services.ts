import dbConnect from "@/lib/mongodb";
import User from "@/models/users.m";
import { JWTService } from "./jwt.services";
import bcrypt from "bcryptjs";
import type {
  RegisterRequest,
  LoginRequest,
  UserProfile,
  AuthSuccessResponse,
  ServiceResponse,
  RefreshTokenResponse,
} from "@/types/auth.types";

export class AuthService {
  /**
   * Hash password using bcrypt
   */
  private static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare password with hashed password
   */
  private static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Register a new user with email and password
   */
  static async registerUser(
    data: RegisterRequest
  ): Promise<ServiceResponse<{ message: string; user: UserProfile }>> {
    try {
      const { email, password, name, university, studentId } = data;

      // Validation
      if (!email || !password || !name) {
        return {
          success: false,
          error: "Email, password, and name are required",
          statusCode: 400,
        };
      }

      // Password strength validation
      if (password.length < 8) {
        return {
          success: false,
          error: "Password must be at least 8 characters long",
          statusCode: 400,
        };
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: "Invalid email format",
          statusCode: 400,
        };
      }

      await dbConnect();

      // Check if user already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return {
          success: false,
          error: "User with this email already exists",
          statusCode: 409,
        };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create new user
      const newUser = await User.create({
        email,
        password: hashedPassword,
        name,
        university,
        studentId,
        verified: false,
        role: "student", // Default role
      });

      const userProfile: UserProfile = {
        id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        university: newUser.university,
        studentId: newUser.studentId,
        verified: newUser.verified || false,
        role: newUser.role || "student",
      };

      return {
        success: true,
        data: {
          message: "Registration successful",
          user: userProfile,
        },
        statusCode: 201,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Register service error:", error);

      if (error.code === 11000) {
        return {
          success: false,
          error: "User with this email already exists",
          statusCode: 409,
        };
      }

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((err: any) => err.message)
          .join(", ");
        return {
          success: false,
          error: messages,
          statusCode: 400,
        };
      }

      return {
        success: false,
        error: "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Login user with email and password
   */
  static async loginUser(
    data: LoginRequest
  ): Promise<ServiceResponse<AuthSuccessResponse>> {
    try {
      const { email, password } = data;

      // Validation
      if (!email || !password) {
        return {
          success: false,
          error: "Email and password are required",
          statusCode: 400,
        };
      }

      await dbConnect();

      // Find user by email (explicitly select password field)
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return {
          success: false,
          error: "Invalid email or password",
          statusCode: 401,
        };
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(
        password,
        user.password
      );

      if (!isPasswordValid) {
        return {
          success: false,
          error: "Invalid email or password",
          statusCode: 401,
        };
      }

      const userProfile: UserProfile = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        university: user.university,
        studentId: user.studentId,
        verified: user.verified || false,
        role: user.role || "student",
      };

      // Generate JWT tokens
      const tokens = JWTService.generateTokens({
        userId: user._id.toString(),
        email: user.email,
        role: user.role || "student",
      });

      return {
        success: true,
        data: {
          message: "Login successful",
          user: userProfile,
          tokens,
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Login service error:", error);
      return {
        success: false,
        error: "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Get current user data by ID from token
   */
  static async getCurrentUser(
    userId: string
  ): Promise<ServiceResponse<{ message: string; user: UserProfile }>> {
    try {
      if (!userId) {
        return {
          success: false,
          error: "User ID is required",
          statusCode: 400,
        };
      }

      await dbConnect();

      // Find user by ID
      const user = await User.findById(userId).select("-password");

      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      const userProfile: UserProfile = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        university: user.university,
        studentId: user.studentId,
        verified: user.verified || false,
        role: user.role || "student",
      };

      return {
        success: true,
        data: {
          message: "User fetched successfully",
          user: userProfile,
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Get current user service error:", error);
      return {
        success: false,
        error: "Internal server error",
        statusCode: 500,
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(
    refreshToken: string
  ): Promise<ServiceResponse<RefreshTokenResponse>> {
    try {
      if (!refreshToken) {
        return {
          success: false,
          error: "Refresh token is required",
          statusCode: 400,
        };
      }

      // Verify refresh token
      const verifyResult = JWTService.verifyRefreshToken(refreshToken);

      if (!verifyResult.valid || !verifyResult.userId) {
        return {
          success: false,
          error: verifyResult.error || "Invalid refresh token",
          statusCode: 401,
        };
      }

      await dbConnect();

      // Fetch user to get email and role
      const user = await User.findById(verifyResult.userId).select(
        "email role"
      );

      if (!user) {
        return {
          success: false,
          error: "User not found",
          statusCode: 404,
        };
      }

      // Generate new tokens
      const tokens = JWTService.generateTokens({
        userId: verifyResult.userId,
        email: user.email,
        role: user.role || "student",
      });

      // Revoke old refresh token
      JWTService.revokeRefreshToken(refreshToken);

      return {
        success: true,
        data: {
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn,
          tokenType: "Bearer",
        },
        statusCode: 200,
      };
    } catch (error) {
      console.error("Refresh token service error:", error);
      return {
        success: false,
        error: "Internal server error",
        statusCode: 500,
      };
    }
  }
}
