"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { WEB_AUTH_CONFIG } from "@what-cse/shared";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/services/api/auth";

/**
 * Token 自动刷新 Hook
 *
 * 功能：
 * 1. 定期检查 token 是否即将过期
 * 2. 在过期前自动刷新 token
 * 3. 刷新失败时登出用户
 */
export function useTokenRefresh() {
  const router = useRouter();
  const {
    isAuthenticated,
    _hasHydrated,
    refreshToken,
    shouldRefreshToken,
    updateTokens,
    logout,
  } = useAuthStore();

  // 是否正在刷新中，避免重复刷新
  const isRefreshingRef = useRef(false);
  // 检查间隔：1分钟
  const CHECK_INTERVAL = 60 * 1000;

  /**
   * 执行 token 刷新
   */
  const doRefresh = useCallback(async () => {
    if (!refreshToken || isRefreshingRef.current) return;

    isRefreshingRef.current = true;

    try {
      const response = await authApi.refreshToken(refreshToken);
      updateTokens(
        response.access_token,
        response.refresh_token,
        response.expires_in
      );
    } catch (error) {
      console.error("Token refresh failed:", error);
      // 刷新失败，登出用户
      logout();
      router.push(`${WEB_AUTH_CONFIG.loginPath}?expired=true`);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [refreshToken, updateTokens, logout, router]);

  /**
   * 检查并刷新 token
   */
  const checkAndRefresh = useCallback(() => {
    if (!isAuthenticated || !_hasHydrated) return;

    if (shouldRefreshToken()) {
      doRefresh();
    }
  }, [isAuthenticated, _hasHydrated, shouldRefreshToken, doRefresh]);

  useEffect(() => {
    if (!isAuthenticated || !_hasHydrated) return;

    // 初始检查
    checkAndRefresh();

    // 定期检查
    const intervalId = setInterval(checkAndRefresh, CHECK_INTERVAL);

    // 页面获得焦点时也检查
    const handleFocus = () => {
      checkAndRefresh();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isAuthenticated, _hasHydrated, checkAndRefresh]);
}
