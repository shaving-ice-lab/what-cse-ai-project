import request from "../request";

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  content: string;
  is_read: boolean;
  related_id: number;
  related_type: string;
  created_at: string;
}

export interface NotificationListParams {
  page?: number;
  page_size?: number;
  is_read?: boolean;
  type?: string;
}

export interface NotificationListResponse {
  list: Notification[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
}

export const notificationApi = {
  getList: (params?: NotificationListParams) => {
    return request.get<NotificationListResponse>("/notifications", { params });
  },

  getUnreadCount: () => {
    return request.get<{ count: number }>("/notifications/unread-count");
  },

  markAsRead: (id: number) => {
    return request.post(`/notifications/${id}/read`);
  },

  markAllAsRead: () => {
    return request.post("/notifications/read-all");
  },

  delete: (id: number) => {
    return request.delete(`/notifications/${id}`);
  },
};
