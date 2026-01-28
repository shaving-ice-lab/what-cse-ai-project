import request from "../request";

// ============================================
// Types
// ============================================

export type MembershipLevel = 0 | 1; // 0=普通用户, 1=VIP会员
export type MembershipStatus = 0 | 1 | 2; // 0=未开通, 1=已开通, 2=已过期
export type OrderPaymentStatus = 0 | 1 | 2 | 3; // 0=待支付, 1=已支付, 2=已取消, 3=已退款

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
}

export interface FeatureInfo {
  code: string;
  name: string;
  description: string;
  is_vip_only: boolean;
  available: boolean;
  limit: number;
}

export interface FeatureAccessResult {
  allowed: boolean;
  is_vip: boolean;
  remaining?: number;
  limit?: number;
  message: string;
}

export interface FeatureCompareItem {
  code: string;
  name: string;
  description: string;
  available: boolean;
  limit: string;
}

export interface VIPComparisonResponse {
  normal_features: FeatureCompareItem[];
  vip_features: FeatureCompareItem[];
}

export interface MembershipDetailResponse {
  membership: UserMembership;
  is_vip: boolean;
  days_remaining: number;
  features: FeatureInfo[];
}

export interface VIPStatusResponse {
  is_vip: boolean;
  level: MembershipLevel;
  level_name: string;
  status: MembershipStatus;
  status_name: string;
  days_remaining: number;
  expire_at?: string;
}

// ============================================
// API
// ============================================

export const membershipApi = {
  // 获取用户会员信息
  getMembership: (): Promise<MembershipDetailResponse> => {
    return request.get("/membership");
  },

  // 检查VIP状态
  getVIPStatus: (): Promise<VIPStatusResponse> => {
    return request.get("/membership/vip-status");
  },

  // 检查功能访问权限
  checkFeatureAccess: (featureCode: string): Promise<FeatureAccessResult> => {
    return request.get("/membership/feature-access", { params: { code: featureCode } });
  },

  // 记录功能使用
  recordFeatureUsage: (featureCode: string): Promise<{ message: string }> => {
    return request.post("/membership/feature-usage", { feature_code: featureCode });
  },

  // 获取VIP权益对比
  getVIPComparison: (): Promise<VIPComparisonResponse> => {
    return request.get("/membership/comparison");
  },

  // 获取套餐列表
  getPlans: (): Promise<{ plans: MembershipPlan[]; total: number }> => {
    return request.get("/membership/plans");
  },

  // 创建订单
  createOrder: (planId: number): Promise<MembershipOrder> => {
    return request.post("/membership/orders", { plan_id: planId });
  },

  // 获取订单列表
  getOrders: (params?: { page?: number; page_size?: number }): Promise<{
    orders: MembershipOrder[];
    total: number;
    page: number;
    page_size: number;
  }> => {
    return request.get("/membership/orders", { params });
  },

  // 支付订单(模拟)
  payOrder: (orderNo: string, paymentMethod?: string): Promise<MembershipOrder> => {
    return request.post(`/membership/orders/${orderNo}/pay`, {
      payment_method: paymentMethod || "alipay",
    });
  },
};

// ============================================
// Helper Functions
// ============================================

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

export const formatPriceYuan = (price: number): string => {
  return (price / 100).toFixed(2);
};
