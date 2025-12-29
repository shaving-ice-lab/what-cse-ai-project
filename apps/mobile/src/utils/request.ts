import Taro from "@tarojs/taro";
import { authService } from "../services/auth";

const BASE_URL = "http://localhost:8080/api";

interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  header?: Record<string, string>;
  needAuth?: boolean;
}

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const { url, method = "GET", data, header = {}, needAuth = true } = options;

  if (needAuth) {
    const token = await authService.getValidToken();
    if (token) {
      header["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const response = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        "Content-Type": "application/json",
        ...header,
      },
    });

    if (response.statusCode === 401) {
      const newToken = await authService.getValidToken();
      if (newToken) {
        header["Authorization"] = `Bearer ${newToken}`;
        const retryResponse = await Taro.request({
          url: `${BASE_URL}${url}`,
          method,
          data,
          header: {
            "Content-Type": "application/json",
            ...header,
          },
        });
        if (retryResponse.statusCode === 401) {
          authService.clearTokens();
          Taro.showToast({ title: "登录已过期，请重新登录", icon: "none" });
          Taro.reLaunch({ url: "/pages/user/login" });
          throw new Error("登录已过期");
        }
        return retryResponse.data as T;
      }
      authService.clearTokens();
      Taro.showToast({ title: "请先登录", icon: "none" });
      Taro.navigateTo({ url: "/pages/user/login" });
      throw new Error("未登录");
    }

    if (response.statusCode >= 400) {
      const errorData = response.data as ApiResponse;
      throw new Error(errorData?.message || "请求失败");
    }

    return response.data as T;
  } catch (error: any) {
    if (error.message?.includes("request:fail")) {
      Taro.showToast({ title: "网络连接失败", icon: "none" });
    }
    throw error;
  }
}

export const http = {
  get<T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<T> {
    return request<T>({ url, method: "GET", data, ...options });
  },

  post<T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<T> {
    return request<T>({ url, method: "POST", data, ...options });
  },

  put<T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<T> {
    return request<T>({ url, method: "PUT", data, ...options });
  },

  delete<T = any>(url: string, data?: any, options?: Partial<RequestOptions>): Promise<T> {
    return request<T>({ url, method: "DELETE", data, ...options });
  },
};
