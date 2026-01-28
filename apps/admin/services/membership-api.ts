import axios, { AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";

const axiosInstance = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const request = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.get(url, config) as Promise<T>,
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.post(url, data, config) as Promise<T>,
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.put(url, data, config) as Promise<T>,
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.delete(url, config) as Promise<T>,
};

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

axiosInstance.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code !== 0) {
      return Promise.reject(new Error(data.message || "Request failed"));
    }
    return data.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
      window.location.href = "/login";
    }
    const message = error.response?.data?.message || error.message || "Network error";
    return Promise.reject(new Error(message));
  }
);

// ============================================
// Types
// ============================================

export type MembershipLevel = 0 | 1; // 0=普通用户, 1=VIP会员
export type MembershipStatus = 0 | 1 | 2; // 0=未开通, 1=已开通, 2=已过期
export type OrderPaymentStatus = 0 | 1 | 2 | 3; // 0=待支付, 1=已支付, 2=已取消, 3=已退款

export interface User {
  id: number;
  phone: string;
  email: string;
  nickname: string;
  avatar: string;
  status: number;
  created_at: string;
}

export interface UserMembership {
  id: number;
  user_id: number;
  level: MembershipLevel;
  status: MembershipStatus;
  start_at?: string;
  expire_at?: string;
  total_days: number;
  source: string;
  last_renewal_at?: string;
  auto_renewal: boolean;
  renewal_reminder: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface MembershipPlan {
  id: number;
  name: string;
  code: string;
  level: MembershipLevel;
  duration: number;
  original_price: number;
  price: number;
  discount: number;
  description: string;
  features: string;
  sort_order: number;
  is_recommended: boolean;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface MembershipOrder {
  id: number;
  order_no: string;
  user_id: number;
  plan_id: number;
  plan_name: string;
  amount: number;
  original_amount: number;
  duration: number;
  payment_method: string;
  payment_status: OrderPaymentStatus;
  paid_at?: string;
  expire_at?: string;
  refunded_at?: string;
  refund_amount: number;
  refund_reason: string;
  remark: string;
  created_at: string;
  user?: User;
  plan?: MembershipPlan;
}

export interface VIPFeature {
  code: string;
  name: string;
  description: string;
  is_vip_only: boolean;
  free_limit: number;
  vip_limit: number;
}

export interface FeatureInfo {
  code: string;
  name: string;
  description: string;
  is_vip_only: boolean;
  available: boolean;
  limit: number;
}

export interface MembershipStats {
  total_members: number;
  active_vip_count: number;
  expired_vip_count: number;
  today_new_vip: number;
  month_new_vip: number;
  expiring_count: number;
}

export interface OrderStats {
  today_orders: number;
  today_revenue: number;
  month_orders: number;
  month_revenue: number;
  total_orders: number;
  total_revenue: number;
}

export interface MembershipListParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  level?: MembershipLevel;
  status?: MembershipStatus;
}

export interface OrderListParams {
  page?: number;
  page_size?: number;
  user_id?: number;
  payment_status?: OrderPaymentStatus;
}

export interface CreatePlanRequest {
  name: string;
  code: string;
  duration: number;
  original_price: number;
  price: number;
  discount?: number;
  description?: string;
  features?: string[];
  sort_order?: number;
  is_recommended?: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  duration?: number;
  original_price?: number;
  price?: number;
  discount?: number;
  description?: string;
  features?: string[];
  sort_order?: number;
  is_recommended?: boolean;
  is_enabled?: boolean;
}

export interface ActivateVIPRequest {
  days: number;
  source?: string;
}

// ============================================
// API
// ============================================

export const membershipApi = {
  // 获取统计数据
  getStats: () => {
    return request.get<{
      membership: MembershipStats;
      order: OrderStats;
    }>("/admin/memberships/stats");
  },

  // 获取会员列表
  getMemberships: (params?: MembershipListParams) => {
    return request.get<{
      memberships: UserMembership[];
      total: number;
      page: number;
      page_size: number;
    }>("/admin/memberships", { params });
  },

  // 获取用户会员详情
  getUserMembership: (userId: number) => {
    return request.get<{
      membership: UserMembership;
      is_vip: boolean;
      days_remaining: number;
      features: FeatureInfo[];
    }>(`/admin/memberships/${userId}`);
  },

  // 激活VIP
  activateVIP: (userId: number, data: ActivateVIPRequest) => {
    return request.post<UserMembership>(`/admin/memberships/${userId}/activate`, data);
  },

  // 取消VIP
  deactivateVIP: (userId: number) => {
    return request.post<{ message: string }>(`/admin/memberships/${userId}/deactivate`);
  },

  // 获取套餐列表
  getPlans: () => {
    return request.get<{
      plans: MembershipPlan[];
      total: number;
    }>("/admin/memberships/plans");
  },

  // 创建套餐
  createPlan: (data: CreatePlanRequest) => {
    return request.post<MembershipPlan>("/admin/memberships/plans", data);
  },

  // 更新套餐
  updatePlan: (id: number, data: UpdatePlanRequest) => {
    return request.put<MembershipPlan>(`/admin/memberships/plans/${id}`, data);
  },

  // 删除套餐
  deletePlan: (id: number) => {
    return request.delete<{ message: string }>(`/admin/memberships/plans/${id}`);
  },

  // 获取订单列表
  getOrders: (params?: OrderListParams) => {
    return request.get<{
      orders: MembershipOrder[];
      total: number;
      page: number;
      page_size: number;
    }>("/admin/memberships/orders", { params });
  },

  // 获取功能权益列表
  getFeatures: () => {
    return request.get<{
      features: VIPFeature[];
      total: number;
    }>("/admin/memberships/features");
  },
};

// Helper functions
export const getMembershipLevelText = (level: MembershipLevel): string => {
  switch (level) {
    case 1:
      return "VIP会员";
    default:
      return "普通用户";
  }
};

export const getMembershipStatusText = (status: MembershipStatus): string => {
  switch (status) {
    case 1:
      return "已开通";
    case 2:
      return "已过期";
    default:
      return "未开通";
  }
};

export const getOrderStatusText = (status: OrderPaymentStatus): string => {
  switch (status) {
    case 1:
      return "已支付";
    case 2:
      return "已取消";
    case 3:
      return "已退款";
    default:
      return "待支付";
  }
};

export const formatPrice = (price: number): string => {
  return `¥${(price / 100).toFixed(2)}`;
};
