import request from "../request";

// 订阅类型
export type SubscribeType =
  | "exam_type"
  | "province"
  | "city"
  | "keyword"
  | "department"
  | "education"
  | "major";

// 通知渠道
export type NotifyChannel = "email" | "sms" | "push" | "wechat";

// 订阅响应
export interface SubscriptionResponse {
  id: number;
  subscribe_type: SubscribeType;
  subscribe_value: string;
  subscribe_name: string;
  notify_on_new: boolean;
  notify_channels: NotifyChannel[];
  is_enabled: boolean;
  last_notify_at?: string;
  created_at: string;
}

// 订阅列表响应
export interface SubscriptionListResponse {
  subscriptions: SubscriptionResponse[];
  total: number;
  page: number;
  page_size: number;
}

// 创建订阅请求
export interface CreateSubscriptionRequest {
  subscribe_type: SubscribeType;
  subscribe_value: string;
  subscribe_name: string;
  notify_on_new?: boolean;
  notify_channels?: NotifyChannel[];
}

// 更新订阅请求
export interface UpdateSubscriptionRequest {
  subscribe_name?: string;
  notify_on_new?: boolean;
  notify_channels?: NotifyChannel[];
}

// 订阅类型选项
export interface SubscribeTypeOption {
  value: SubscribeType;
  label: string;
  description: string;
}

// 通知渠道选项
export interface NotifyChannelOption {
  value: NotifyChannel;
  label: string;
  description: string;
}

export const subscriptionApi = {
  // 获取订阅列表
  list: (
    page?: number,
    pageSize?: number
  ): Promise<SubscriptionListResponse> =>
    request.get("/subscriptions", { params: { page, page_size: pageSize } }),

  // 创建订阅
  create: (data: CreateSubscriptionRequest): Promise<SubscriptionResponse> =>
    request.post("/subscriptions", data),

  // 更新订阅
  update: (id: number, data: UpdateSubscriptionRequest): Promise<void> =>
    request.put(`/subscriptions/${id}`, data),

  // 切换订阅状态
  toggle: (id: number): Promise<void> =>
    request.put(`/subscriptions/${id}/toggle`),

  // 删除订阅
  delete: (id: number): Promise<void> =>
    request.delete(`/subscriptions/${id}`),

  // 获取订阅类型选项
  getTypes: (): Promise<{
    types: SubscribeTypeOption[];
    channels: NotifyChannelOption[];
  }> => request.get("/subscriptions/types"),
};
