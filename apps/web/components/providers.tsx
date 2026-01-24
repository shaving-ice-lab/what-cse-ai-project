"use client";

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster, toast } from "@/components/ui/toaster";

// Global error handler for API errors
const handleGlobalError = (error: unknown) => {
  const err = error as {
    response?: { status?: number; data?: { message?: string } };
    message?: string;
  };

  // 401 errors are handled by the request interceptor
  if (err?.response?.status === 401) {
    return;
  }

  if (err?.response?.status === 403) {
    toast.error("没有权限访问该资源");
    return;
  }

  if (err?.response?.status === 404) {
    toast.error("请求的资源不存在");
    return;
  }

  if (err?.response?.status === 500) {
    toast.error("服务器错误，请稍后重试");
    return;
  }

  // Default error message
  const message = err?.response?.data?.message || err?.message || "操作失败，请重试";
  toast.error(message);
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: handleGlobalError,
        }),
        mutationCache: new MutationCache({
          onError: handleGlobalError,
        }),
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: (failureCount, error) => {
              const err = error as { response?: { status?: number } };
              // Don't retry on 401, 403, 404
              if ([401, 403, 404].includes(err?.response?.status || 0)) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
