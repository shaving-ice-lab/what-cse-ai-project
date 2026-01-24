import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { useAuthStore } from "@/stores/authStore";

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
// Queue of requests waiting for token refresh
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

const request = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    if (data.code !== 0) {
      return Promise.reject(new Error(data.message || "Request failed"));
    }
    return data.data;
  },
  async (error: AxiosError<{ code: number; message: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if this is already a refresh token request
      if (originalRequest.url?.includes("/auth/refresh")) {
        const { logout } = useAuthStore.getState();
        logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return request(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, logout } = useAuthStore.getState();

      if (!refreshToken) {
        logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(new Error("No refresh token available"));
      }

      try {
        // Call refresh token API directly to avoid interceptor loop
        const response = await axios.post(
          "/api/v1/auth/refresh",
          { refresh_token: refreshToken },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.data.code !== 0) {
          throw new Error(response.data.message || "Token refresh failed");
        }

        const { access_token, refresh_token } = response.data.data;

        // Update tokens in store
        useAuthStore.setState({
          accessToken: access_token,
          refreshToken: refresh_token,
        });

        // Process queued requests
        processQueue(null, access_token);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return request(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout and redirect
        processQueue(refreshError as Error, null);
        logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    const message = error.response?.data?.message || error.message || "Network error";
    return Promise.reject(new Error(message));
  }
);

export default request;
