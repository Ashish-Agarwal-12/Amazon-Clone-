import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const isTokenValid = accessToken && verifyToken(accessToken);

  const protectedRoutes = ["/checkout", "/orders", "/admin"];
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // ✅ Add the dev-only logger here
  if (process.env.NODE_ENV === "development") {
    console.log("Middleware:", {
      pathname,
      accessTokenPresent: !!accessToken,
      isTokenValid,
      isProtected,
    });
  }

  if (isProtected && !isTokenValid) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/orders/:path*", "/admin/:path*"],
};
