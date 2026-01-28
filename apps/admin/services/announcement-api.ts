import axios, { AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";
import type {
  Announcement,
  AnnouncementBrief,
  AnnouncementQueryParams,
  AnnouncementListResponse,
  AnnouncementStats,
  ExamTypeStats,
  ProvinceStats,
  MonthlyStats,
} from "@/types/announcement";

const axiosInstance = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
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

// Response interceptor
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

export const announcementApi = {
  // 获取公告列表
  getAnnouncements: (params?: AnnouncementQueryParams): Promise<AnnouncementListResponse> =>
    request.get("/admin/announcements/v2", { params }),

  // 搜索公告
  searchAnnouncements: (
    keyword: string,
    params?: Omit<AnnouncementQueryParams, "keyword">
  ): Promise<AnnouncementListResponse> =>
    request.get("/admin/announcements/search", { params: { keyword, ...params } }),

  // 获取公告详情
  getAnnouncement: (id: number): Promise<Announcement> =>
    request.get(`/admin/announcements/${id}`),

  // 获取统计数据
  getStats: (): Promise<AnnouncementStats> =>
    request.get("/admin/announcements/stats"),

  // 按考试类型统计
  getStatsByExamType: (): Promise<ExamTypeStats[]> =>
    request.get("/admin/announcements/stats/exam-type"),

  // 按省份统计
  getStatsByProvince: (): Promise<ProvinceStats[]> =>
    request.get("/admin/announcements/stats/province"),

  // 按月份统计
  getStatsByMonth: (year?: number): Promise<MonthlyStats[]> =>
    request.get("/admin/announcements/stats/monthly", { params: { year } }),

  // 获取筛选选项
  getFilterOptions: (): Promise<{
    exam_types: string[];
    provinces: string[];
    sources: string[];
  }> => request.get("/admin/announcements/filter-options"),

  // 创建公告
  createAnnouncement: (data: Partial<Announcement>): Promise<{ message: string; announcement: Announcement }> =>
    request.post("/admin/announcements", data),

  // 更新公告
  updateAnnouncement: (id: number, data: Partial<Announcement>): Promise<{ message: string; announcement: Announcement }> =>
    request.put(`/admin/announcements/${id}`, data),

  // 更新公告状态
  updateAnnouncementStatus: (id: number, status: number): Promise<{ message: string }> =>
    request.put(`/admin/announcements/${id}/status`, { status }),

  // 批量更新状态
  batchUpdateStatus: (ids: number[], status: number): Promise<{ message: string; count: number }> =>
    request.put("/admin/announcements/batch-status", { ids, status }),

  // 删除公告
  deleteAnnouncement: (id: number): Promise<{ message: string }> =>
    request.delete(`/admin/announcements/${id}`),

  // 批量删除
  batchDelete: (ids: number[]): Promise<{ message: string; count: number }> =>
    request.delete("/admin/announcements/batch", { data: { ids } }),

  // 更新公告分类
  updateExamType: (id: number, examType: string): Promise<{ message: string }> =>
    request.put(`/admin/announcements/${id}/exam-type`, { exam_type: examType }),

  // 获取关联职位
  getAnnouncementPositions: (id: number): Promise<{
    positions: Array<{
      id: number;
      position_name: string;
      department_name?: string;
      recruit_count: number;
      education?: string;
    }>;
    total: number;
  }> => request.get(`/admin/announcements/${id}/positions`),

  // 关联职位
  linkPositions: (id: number, positionIds: number[]): Promise<{ message: string }> =>
    request.post(`/admin/announcements/${id}/positions`, { position_ids: positionIds }),

  // 取消关联职位
  unlinkPositions: (id: number, positionIds: number[]): Promise<{ message: string }> =>
    request.delete(`/admin/announcements/${id}/positions`, { data: { position_ids: positionIds } }),
};

export default announcementApi;
