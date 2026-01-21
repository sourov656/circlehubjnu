/**
 * JWT Token Payload
 * Contains user information embedded in the JWT token
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number; // Issued at
  exp?: number; // Expires at
}

/**
 * JWT Token Response
 * Returned when generating tokens
 */
export interface JwtTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
  tokenType: "Bearer";
}

/**
 * JWT Verification Result
 */
export interface JwtVerifyResult {
  valid: boolean;
  payload?: JwtPayload;
  error?: string;
}

/**
 * JWT Token Decode Result
 */
export interface JwtDecodeResult {
  payload: JwtPayload | null;
  error?: string;
}
