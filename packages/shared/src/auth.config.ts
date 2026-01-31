/**
 * 认证配置 - 集中管理 web 和 admin 应用的认证相关配置
 */

// 7 天（毫秒）
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
// 5 分钟（毫秒）
const FIVE_MINUTES_MS = 5 * 60 * 1000;

export interface AuthConfig {
  /** 登录页面路径 */
  loginPath: string;
  /** Cookie 名称 */
  cookieName: string;
  /** 用户不活动超时时间（毫秒） */
  inactivityTimeout: number;
  /** Token 刷新阈值，在过期前多久刷新（毫秒） */
  tokenRefreshThreshold: number;
  /** 需要认证保护的路由前缀 */
  protectedRoutes: string[];
  /** Cookie 有效期（天） */
  cookieMaxAgeDays: number;
}

/**
 * Web 应用认证配置
 */
export const WEB_AUTH_CONFIG: AuthConfig = {
  loginPath: "/login",
  cookieName: "auth-storage",
  inactivityTimeout: SEVEN_DAYS_MS,
  tokenRefreshThreshold: FIVE_MINUTES_MS,
  cookieMaxAgeDays: 7,
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
 * Admin 应用认证配置
 */
export const ADMIN_AUTH_CONFIG: AuthConfig = {
  loginPath: "/login",
  cookieName: "admin-auth-storage",
  inactivityTimeout: SEVEN_DAYS_MS,
  tokenRefreshThreshold: FIVE_MINUTES_MS,
  cookieMaxAgeDays: 7,
  protectedRoutes: [
    // Admin 默认所有非登录页面都需要认证
    // 在 middleware 中使用排除法：排除 /login 和静态资源
  ],
};

/**
 * 统一导出
 */
export const AUTH_CONFIG = {
  web: WEB_AUTH_CONFIG,
  admin: ADMIN_AUTH_CONFIG,
} as const;
