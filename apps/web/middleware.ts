import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 认证配置 - 与 @what-cse/shared 保持同步
 * 注意：middleware 运行在 Edge Runtime，不能直接导入 workspace 包
 */
const AUTH_CONFIG = {
  loginPath: "/login",
  cookieName: "auth-storage",
  inactivityTimeout: 7 * 24 * 60 * 60 * 1000, // 7 天
  protectedRoutes: [
    "/match",
    "/profile",
    "/favorites",
    "/preferences",
    "/notifications",
    "/security",
    "/history",
    "/learn/favorites",
    "/learn/mistakes",
    "/learn/stats",
    "/learn/plan",
    "/learn/practice",
    "/learn/report",
    "/learn/course",
  ],
};

/**
 * 重定向到登录页面
 */
function redirectToLogin(request: NextRequest, redirectPath: string) {
  const url = new URL(AUTH_CONFIG.loginPath, request.url);
  url.searchParams.set("redirect", redirectPath);
  return NextResponse.redirect(url);
}

/**
 * 清除认证 cookie 并重定向到登录页面
 */
function clearAuthAndRedirect(request: NextRequest, redirectPath: string) {
  const response = redirectToLogin(request, redirectPath);
  // 清除认证 cookie
  response.cookies.delete(AUTH_CONFIG.cookieName);
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否是受保护的路由
  const isProtectedRoute = AUTH_CONFIG.protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // 获取认证 cookie
  const authCookie = request.cookies.get(AUTH_CONFIG.cookieName);

  if (!authCookie) {
    return redirectToLogin(request, pathname);
  }

  try {
    // Cookie 值可能被 URL 编码，需要先解码
    const decodedValue = decodeURIComponent(authCookie.value);
    const authData = JSON.parse(decodedValue);
    const state = authData?.state;

    // 检查 1: 是否已认证
    if (!state?.isAuthenticated) {
      return redirectToLogin(request, pathname);
    }

    // 检查 2: 是否超过不活动时间
    if (state.lastActivityAt) {
      const now = Date.now();
      const lastActivity = state.lastActivityAt;

      if (now - lastActivity > AUTH_CONFIG.inactivityTimeout) {
        // 会话过期，清除 cookie 并重定向到登录页
        return clearAuthAndRedirect(request, pathname);
      }
    }

    // 认证通过
    return NextResponse.next();
  } catch {
    // 解析失败，重定向到登录页
    return redirectToLogin(request, pathname);
  }
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
    // 学习相关保护路由
    "/learn/favorites/:path*",
    "/learn/mistakes/:path*",
    "/learn/stats/:path*",
    "/learn/plan/:path*",
    "/learn/practice/:path*",
    "/learn/report/:path*",
    "/learn/course/:path*",
  ],
};
