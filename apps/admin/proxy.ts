import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 认证配置 - 与 @what-cse/shared 保持同步
 * 注意：proxy 运行在 Edge Runtime，不能直接导入 workspace 包
 */
const AUTH_CONFIG = {
  loginPath: "/login",
  cookieName: "admin-auth-storage",
  inactivityTimeout: 7 * 24 * 60 * 60 * 1000, // 7 天
};

// 开发模式：跳过所有鉴权检查
const DEV_SKIP_AUTH = false;

// 不需要登录的路由
const publicRoutes = ["/login"];

/**
 * 重定向到登录页面
 */
function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(new URL(AUTH_CONFIG.loginPath, request.url));
}

/**
 * 清除认证 cookie 并重定向到登录页面
 */
function clearAuthAndRedirect(request: NextRequest) {
  const response = redirectToLogin(request);
  // 清除认证 cookie
  response.cookies.delete(AUTH_CONFIG.cookieName);
  return response;
}

export function proxy(request: NextRequest) {
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
  const authCookie = request.cookies.get(AUTH_CONFIG.cookieName);

  if (!authCookie) {
    return redirectToLogin(request);
  }

  try {
    // Cookie 值可能被 URL 编码，需要先解码
    const decodedValue = decodeURIComponent(authCookie.value);
    const authData = JSON.parse(decodedValue);
    const state = authData?.state;

    // 检查 1: 是否已认证
    if (!state?.isAuthenticated) {
      return redirectToLogin(request);
    }

    // 检查 2: 是否超过不活动时间
    if (state.lastActivityAt) {
      const now = Date.now();
      const lastActivity = state.lastActivityAt;

      if (now - lastActivity > AUTH_CONFIG.inactivityTimeout) {
        // 会话过期，清除 cookie 并重定向到登录页
        return clearAuthAndRedirect(request);
      }
    }

    // 认证通过
    return NextResponse.next();
  } catch {
    // 解析失败，重定向到登录页
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
