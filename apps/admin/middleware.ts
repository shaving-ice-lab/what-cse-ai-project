import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 开发模式：跳过所有鉴权检查
const DEV_SKIP_AUTH = false;

// 不需要登录的路由
const publicRoutes = ["/login"];

export function middleware(request: NextRequest) {
  // 开发模式下跳过所有鉴权
  if (DEV_SKIP_AUTH) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // 检查是否是公开路由
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 检查管理员认证 (通过 cookie)
  const authStorage = request.cookies.get("admin-auth-storage");

  if (!authStorage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const authData = JSON.parse(authStorage.value);
    if (!authData?.state?.isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
