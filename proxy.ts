import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Add pathname to headers so we can access it in server components
  response.headers.set("x-pathname", request.nextUrl.pathname);

  // No authentication checks - handled on client side
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login, register (auth pages)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
  ],
};
