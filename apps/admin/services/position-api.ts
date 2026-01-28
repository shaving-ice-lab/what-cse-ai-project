import axios, { AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";
import type {
  Position,
  PositionBrief,
  PositionDetail,
  PositionQueryParams,
  PositionListResponse,
  PositionStats,
  ProvinceStats,
  ExamTypeStats,
  EducationStats,
  PositionTrendsResponse,
  FilterOptions,
  CascadeRegionsResponse,
} from "@/types/position";

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: "/api/v1",
  timeout: 30000,
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
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code !== 0) {
      return Promise.reject(new Error(data.message || "Request failed"));
    }
    return data.data;
  },
  async (error) => {
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
      window.location.href = "/login";
    }

    const message = error.response?.data?.message || error.message || "Network error";
    return Promise.reject(new Error(message));
  }
);

// 封装请求方法
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

/**
 * Position API 服务
 */
export const positionApi = {
  // =====================================================
  // 列表查询
  // =====================================================

  /**
   * 获取职位列表（新版增强筛选）
   */
  getPositions: (params?: PositionQueryParams) => {
    return request.get<PositionListResponse>("/positions/v2", { params });
  },

  /**
   * 搜索职位
   */
  searchPositions: (keyword: string, params?: Omit<PositionQueryParams, "keyword">) => {
    return request.get<PositionListResponse>("/positions/search", {
      params: { keyword, ...params },
    });
  },

  /**
   * 获取职位详情
   */
  getPosition: (id: number) => {
    return request.get<PositionDetail>(`/positions/${id}`);
  },

  // =====================================================
  // 统计数据
  // =====================================================

  /**
   * 获取统计信息
   */
  getStats: () => {
    return request.get<PositionStats>("/positions/stats");
  },

  /**
   * 按省份统计
   */
  getStatsByProvince: () => {
    return request.get<{ stats: ProvinceStats[] }>("/positions/stats/province");
  },

  /**
   * 按考试类型统计
   */
  getStatsByExamType: () => {
    return request.get<{ stats: ExamTypeStats[] }>("/positions/stats/exam-type");
  },

  /**
   * 按学历统计
   */
  getStatsByEducation: () => {
    return request.get<{ stats: EducationStats[] }>("/positions/stats/education");
  },

  /**
   * 获取趋势数据
   */
  getTrends: (days: number = 30) => {
    return request.get<PositionTrendsResponse>("/positions/stats/trends", {
      params: { days },
    });
  },

  // =====================================================
  // 筛选选项
  // =====================================================

  /**
   * 获取筛选选项
   */
  getFilterOptions: () => {
    return request.get<FilterOptions>("/positions/filter-options");
  },

  /**
   * 获取级联地区数据
   */
  getCascadeRegions: () => {
    return request.get<CascadeRegionsResponse>("/positions/regions");
  },

  /**
   * 获取区县数据
   */
  getDistricts: (province?: string, city?: string) => {
    return request.get<{ districts: string[] }>("/positions/districts", {
      params: { province, city },
    });
  },

  // =====================================================
  // 推荐和热门
  // =====================================================

  /**
   * 获取热门职位
   */
  getHotPositions: (limit: number = 10) => {
    return request.get<{ positions: PositionBrief[] }>("/positions/hot", {
      params: { limit },
    });
  },

  /**
   * 获取即将截止的职位
   */
  getExpiringPositions: (days: number = 3, limit: number = 10) => {
    return request.get<{ positions: PositionBrief[] }>("/positions/expiring", {
      params: { days, limit },
    });
  },

  /**
   * 获取最新职位
   */
  getLatestPositions: (limit: number = 10) => {
    return request.get<{ positions: PositionBrief[] }>("/positions/latest", {
      params: { limit },
    });
  },

  /**
   * 获取相似职位
   */
  getSimilarPositions: (id: number, limit: number = 5) => {
    return request.get<{ positions: PositionBrief[] }>(`/positions/${id}/similar`, {
      params: { limit },
    });
  },

  // =====================================================
  // 管理操作
  // =====================================================

  /**
   * 删除职位
   */
  deletePosition: (id: number) => {
    return request.delete<{ message: string }>(`/admin/positions/${id}`);
  },

  /**
   * 批量删除职位
   */
  batchDeletePositions: (ids: number[]) => {
    return request.post<{ message: string }>("/admin/positions/batch-delete", { ids });
  },

  /**
   * 更新职位状态
   */
  updatePositionStatus: (id: number, status: number) => {
    return request.put<{ message: string }>(`/admin/positions/${id}/status`, { status });
  },

  /**
   * 批量更新职位状态
   */
  batchUpdateStatus: (ids: number[], status: number) => {
    return request.put<{ message: string }>("/admin/positions/batch-status", { ids, status });
  },

  // =====================================================
  // 对比功能
  // =====================================================

  /**
   * 对比职位
   */
  comparePositions: (ids: number[]) => {
    return request.post<CompareResponse>("/compare/positions", { ids });
  },

  /**
   * 导出对比报告
   */
  exportCompareReport: (ids: number[], format: "pdf" | "excel" = "excel") => {
    return request.post<{ message: string; data: CompareResponse }>(
      `/compare/export?format=${format}`,
      { ids }
    );
  },
};

// =====================================================
// 对比功能类型定义
// =====================================================

/** 对比项 */
export interface CompareItem {
  position: Position;
  days_until_end?: number;
  is_registering: boolean;
  formatted_reg_end?: string;
}

/** 职位推荐 */
export interface PositionRecommend {
  position_id: number;
  position_name: string;
  reason: string;
  value?: string;
}

/** 推荐结果 */
export interface Recommendation {
  best_for_fresh_grad?: PositionRecommend;
  most_recruit?: PositionRecommend;
  lowest_requirement?: PositionRecommend;
  soonest_deadline?: PositionRecommend;
  lowest_competition?: PositionRecommend;
}

/** 对比总结 */
export interface CompareSummary {
  overview: string;
  highlights: string[];
  suggestions: string[];
}

/** 维度值 */
export interface DimensionValue {
  position_id: number;
  value: unknown;
  display: string;
  is_best: boolean;
}

/** 对比维度 */
export interface CompareDimension {
  key: string;
  label: string;
  type: string;
  values: DimensionValue[];
  has_diff: boolean;
  best_value_id?: number;
}

/** 对比响应 */
export interface CompareResponse {
  items: CompareItem[];
  recommendation?: Recommendation;
  summary?: CompareSummary;
  dimensions: CompareDimension[];
}

export default positionApi;
