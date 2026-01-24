import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 需要用户登录的路由
const protectedUserRoutes = [
  "/match",
  "/profile",
  "/favorites",
  "/preferences",
  "/notifications",
  "/security",
  "/history",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查用户路由保护
  const isProtectedUserRoute = protectedUserRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedUserRoute) {
    // 检查用户认证 (通过 cookie)
    const authStorage = request.cookies.get("auth-storage");

    if (!authStorage) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Cookie 值可能被 URL 编码，需要先解码
      const decodedValue = decodeURIComponent(authStorage.value);
      const authData = JSON.parse(decodedValue);
      if (!authData?.state?.isAuthenticated) {
        const url = new URL("/login", request.url);
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }
    } catch {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 用户保护路由
    "/match/:path*",
    "/profile/:path*",
    "/favorites/:path*",
    "/preferences/:path*",
    "/notifications/:path*",
    "/security/:path*",
    "/history/:path*",
  ],
};
