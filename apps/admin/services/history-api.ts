import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import type {
  PositionHistory,
  PositionHistoryBrief,
  HistoryQueryParams,
  HistoryListResponse,
  YearlyTrendResponse,
  ScoreLineResponse,
  ScoreLinePrediction,
  HistoryStats,
  YearStats,
  ProvinceHistoryStats,
  ExamTypeHistoryStats,
  HistoryFilterOptions,
  CreateHistoryRequest,
  ImportHistoryRequest,
} from "@/types/history";

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

export const historyApi = {
  // =====================================================
  // 公开 API
  // =====================================================

  // 获取历年数据列表
  getHistories: (params?: HistoryQueryParams) => {
    return request.get<HistoryListResponse>("/history", { params });
  },

  // 获取历年数据详情
  getHistoryById: (id: number) => {
    return request.get<PositionHistory>(`/history/${id}`);
  },

  // 根据职位ID获取历年数据
  getPositionHistory: (positionId: number) => {
    return request.get<{
      position_code: string;
      position_name: string;
      histories: PositionHistory[];
    }>(`/positions/${positionId}/history`);
  },

  // 根据单位名称获取历年数据
  getDepartmentHistory: (deptName: string) => {
    return request.get<{
      department_name: string;
      histories: PositionHistory[];
    }>(`/history/department/${encodeURIComponent(deptName)}`);
  },

  // 获取年度趋势数据
  getYearlyTrends: (params?: {
    position_code?: string;
    department_code?: string;
    exam_type?: string;
    province?: string;
  }) => {
    return request.get<YearlyTrendResponse>("/history/trends", { params });
  },

  // 获取分数线数据
  getScoreLines: (params?: { exam_type?: string; province?: string; years?: number }) => {
    return request.get<ScoreLineResponse>("/history/score-lines", { params });
  },

  // 获取分数线预测
  getScorePrediction: (positionId: number) => {
    return request.get<{
      has_prediction: boolean;
      prediction?: ScoreLinePrediction;
      message?: string;
    }>(`/positions/${positionId}/score-prediction`);
  },

  // 获取历史统计
  getHistoryStats: (params?: { exam_type?: string; province?: string }) => {
    return request.get<HistoryStats>("/history/stats", { params });
  },

  // 按年份统计
  getStatsByYear: () => {
    return request.get<{ stats: YearStats[] }>("/history/stats/year");
  },

  // 按省份统计
  getStatsByProvince: () => {
    return request.get<{ stats: ProvinceHistoryStats[] }>("/history/stats/province");
  },

  // 按考试类型统计
  getStatsByExamType: () => {
    return request.get<{ stats: ExamTypeHistoryStats[] }>("/history/stats/exam-type");
  },

  // 获取筛选选项
  getFilterOptions: () => {
    return request.get<HistoryFilterOptions>("/history/filter-options");
  },

  // =====================================================
  // 管理端 API
  // =====================================================

  // 创建历史记录
  createHistory: (data: CreateHistoryRequest) => {
    return request.post<PositionHistory>("/admin/history", data);
  },

  // 更新历史记录
  updateHistory: (id: number, data: CreateHistoryRequest) => {
    return request.put<PositionHistory>(`/admin/history/${id}`, data);
  },

  // 删除历史记录
  deleteHistory: (id: number) => {
    return request.delete<{ message: string }>(`/admin/history/${id}`);
  },

  // 批量删除历史记录
  batchDeleteHistories: (ids: number[]) => {
    return request.post<{ message: string }>("/admin/history/batch-delete", { ids });
  },

  // 导入历史数据
  importHistories: (data: ImportHistoryRequest) => {
    return request.post<{ message: string; count: number }>("/admin/history/import", data);
  },
};

export default historyApi;
