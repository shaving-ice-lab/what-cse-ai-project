"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";

// Cookie 操作工具函数
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

/**
 * 认证状态初始化组件
 * 1. 等待 Zustand hydration 完成
 * 2. 同步 localStorage 的认证数据到 cookie
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [isMounted, setIsMounted] = useState(false);

  // 确保客户端挂载
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hydration 完成后同步 cookie
  useEffect(() => {
    if (!isMounted || !_hasHydrated) return;

    const storageKey = "auth-storage";

    // 检查 localStorage 中是否有认证数据
    const localData = localStorage.getItem(storageKey);
    if (!localData) return;

    // 检查 cookie 中是否已有数据
    const cookieData = getCookie(storageKey);

    // 如果 localStorage 有数据但 cookie 没有，同步到 cookie
    if (localData && !cookieData) {
      setCookie(storageKey, localData, 7);
    }

    // 如果两者都有但不一致，以 localStorage 为准
    if (localData && cookieData && localData !== cookieData) {
      setCookie(storageKey, localData, 7);
    }
  }, [isMounted, _hasHydrated]);

  return <>{children}</>;
}
