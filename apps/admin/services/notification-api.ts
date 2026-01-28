import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import type {
  Notification,
  NotificationListResponse,
  NotificationQueryParams,
  NotificationStats,
  CreateNotificationRequest,
  BatchNotificationRequest,
} from "@/types/notification";

const axiosInstance = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const { adminToken } = useAuthStore.getState();
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code !== 0) {
      return Promise.reject(new Error(data.message || "请求失败"));
    }
    return data.data;
  },
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    const message = error.response?.data?.message || error.message || "网络错误";
    return Promise.reject(new Error(message));
  }
);

// 类型化的请求方法
const request = {
  get: <T>(url: string, config?: object): Promise<T> =>
    axiosInstance.get(url, config) as Promise<T>,
  post: <T>(url: string, data?: unknown, config?: object): Promise<T> =>
    axiosInstance.post(url, data, config) as Promise<T>,
  put: <T>(url: string, data?: unknown, config?: object): Promise<T> =>
    axiosInstance.put(url, data, config) as Promise<T>,
  delete: <T>(url: string, config?: object): Promise<T> =>
    axiosInstance.delete(url, config) as Promise<T>,
};

export const notificationApi = {
  // =====================================================
  // 用户通知 API
  // =====================================================

  // 获取通知列表
  getNotifications: (params?: NotificationQueryParams) => {
    return request.get<NotificationListResponse>("/notifications", { params });
  },

  // 获取通知详情
  getNotificationById: (id: number) => {
    return request.get<Notification>(`/notifications/${id}`);
  },

  // 标记通知为已读
  markAsRead: (id: number) => {
    return request.put<{ message: string }>(`/notifications/${id}/read`);
  },

  // 标记所有通知为已读
  markAllAsRead: () => {
    return request.put<{ message: string }>("/notifications/read-all");
  },

  // 删除通知
  deleteNotification: (id: number) => {
    return request.delete<{ message: string }>(`/notifications/${id}`);
  },

  // 获取未读数量
  getUnreadCount: async () => {
    const result = await request.get<NotificationListResponse>("/notifications", {
      params: { page: 1, page_size: 1, unread_only: true },
    });
    return result.unread_count;
  },

  // =====================================================
  // 管理端 API
  // =====================================================

  // 发送系统通知（给指定用户）
  sendNotification: (data: CreateNotificationRequest) => {
    return request.post<{ message: string; count: number }>("/admin/notifications/send", data);
  },

  // 广播通知（给所有用户）
  broadcastNotification: (data: Omit<CreateNotificationRequest, "user_ids">) => {
    return request.post<{ message: string; count: number }>("/admin/notifications/broadcast", data);
  },

  // 批量删除通知
  batchDeleteNotifications: (data: BatchNotificationRequest) => {
    return request.post<{ message: string }>("/admin/notifications/batch-delete", data);
  },

  // 获取通知统计
  getNotificationStats: () => {
    return request.get<NotificationStats>("/admin/notifications/stats");
  },

  // 获取所有用户的通知（管理端）
  getAllNotifications: (params?: NotificationQueryParams & { user_id?: number }) => {
    return request.get<NotificationListResponse>("/admin/notifications", { params });
  },
};

export default notificationApi;
