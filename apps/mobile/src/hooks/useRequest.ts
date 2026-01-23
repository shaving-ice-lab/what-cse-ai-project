import { useState, useCallback } from "react";
import Taro from "@tarojs/taro";
import { useAuthStore } from "../stores";

interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  showLoading?: boolean;
  showError?: boolean;
}

interface UseRequestReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  run: (options?: Partial<RequestOptions>) => Promise<T | null>;
}

const BASE_URL = "http://localhost:9000/api";

export function useRequest<T = any>(defaultOptions: RequestOptions): UseRequestReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  const run = useCallback(
    async (options?: Partial<RequestOptions>): Promise<T | null> => {
      const {
        url,
        method = "GET",
        data: requestData,
        showLoading = false,
        showError = true,
      } = {
        ...defaultOptions,
        ...options,
      };

      setLoading(true);
      setError(null);

      if (showLoading) {
        Taro.showLoading({ title: "加载中..." });
      }

      try {
        const response = await Taro.request({
          url: `${BASE_URL}${url}`,
          method,
          data: requestData,
          header: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (response.statusCode >= 200 && response.statusCode < 300) {
          setData(response.data);
          return response.data;
        } else {
          throw new Error(response.data?.message || "请求失败");
        }
      } catch (err: any) {
        const errorMsg = err.message || "网络请求失败";
        setError(errorMsg);
        if (showError) {
          Taro.showToast({ title: errorMsg, icon: "none" });
        }
        return null;
      } finally {
        setLoading(false);
        if (showLoading) {
          Taro.hideLoading();
        }
      }
    },
    [defaultOptions, token]
  );

  return { data, loading, error, run };
}
