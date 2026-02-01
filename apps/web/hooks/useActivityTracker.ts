"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { WEB_AUTH_CONFIG } from "@what-cse/shared";
import { useAuthStore } from "@/stores/authStore";

/**
 * 活动追踪 Hook
 *
 * 功能：
 * 1. 监听用户活动事件（click, keydown, scroll, touchstart）
 * 2. 节流更新 lastActivityAt（每分钟最多一次）
 * 3. 定期检查会话有效性（每5分钟）
 * 4. 超时自动登出并跳转登录页
 */
export function useActivityTracker() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, updateActivity, isSessionValid, logout } = useAuthStore();

  // 上次更新活动时间的时间戳
  const lastUpdateRef = useRef<number>(Date.now());
  // 节流间隔：1分钟
  const THROTTLE_INTERVAL = 60 * 1000;
  // 会话检查间隔：5分钟
  const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

  /**
   * 检查会话有效性，无效则登出
   */
  const checkSession = useCallback(() => {
    if (!isAuthenticated || !_hasHydrated) return;

    if (!isSessionValid()) {
      logout();
      router.push(`${WEB_AUTH_CONFIG.loginPath}?expired=true`);
    }
  }, [isAuthenticated, _hasHydrated, isSessionValid, logout, router]);

  /**
   * 处理用户活动事件（节流）
   */
  const handleActivity = useCallback(() => {
    if (!isAuthenticated || !_hasHydrated) return;

    const now = Date.now();
    // 节流：每分钟最多更新一次
    if (now - lastUpdateRef.current > THROTTLE_INTERVAL) {
      updateActivity();
      lastUpdateRef.current = now;
    }
  }, [isAuthenticated, _hasHydrated, updateActivity]);

  useEffect(() => {
    if (!isAuthenticated || !_hasHydrated) return;

    // 初始检查会话有效性
    checkSession();

    // 监听用户活动事件
    const events = ["mousedown", "keydown", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // 定期检查会话有效性
    const intervalId = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    // 页面可见性变化时也检查
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, _hasHydrated, handleActivity, checkSession]);
}
