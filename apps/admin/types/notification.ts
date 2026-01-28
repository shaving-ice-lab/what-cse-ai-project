// 通知类型定义

// 通知类型枚举
export type NotificationType = "announcement" | "position" | "system";

// 通知类型标签映射
export const NotificationTypeLabels: Record<NotificationType, string> = {
  announcement: "公告通知",
  position: "职位通知",
  system: "系统消息",
};

// 通知完整信息
export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
  is_read: boolean;
  read_at?: string;
  source_type?: string;
  source_id?: string;
  created_at: string;
}

// 通知列表响应
export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
}

// 通知查询参数
export interface NotificationQueryParams {
  page?: number;
  page_size?: number;
  unread_only?: boolean;
  type?: NotificationType;
}

// 通知统计
export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<NotificationType, number>;
}

// 创建通知请求
export interface CreateNotificationRequest {
  user_ids: number[];
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
}

// 批量操作请求
export interface BatchNotificationRequest {
  notification_ids: number[];
}
