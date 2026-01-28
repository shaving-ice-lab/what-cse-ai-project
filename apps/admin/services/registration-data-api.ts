import axios, { AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";
import type {
  RegistrationDataOverviewResponse,
  HotPositionsResponse,
  ColdPositionsResponse,
  RegistrationTrendsResponse,
  PositionTrendsResponse,
  ProvinceRegistrationStatsResponse,
  ExamTypeRegistrationStatsResponse,
} from "@/types/registration-data";

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
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.delete(url, config) as Promise<T>,
};

/**
 * Registration Data API 服务
 */
export const registrationDataApi = {
  // =====================================================
  // 总览数据
  // =====================================================

  /**
   * 获取报名数据总览
   */
  getOverview: () => {
    return request.get<RegistrationDataOverviewResponse>("/registration-data/overview");
  },

  // =====================================================
  // 热门职位
  // =====================================================

  /**
   * 获取报名人数TOP职位
   */
  getHotByApplyCount: (limit: number = 10) => {
    return request.get<HotPositionsResponse>("/registration-data/hot/apply-count", {
      params: { limit },
    });
  },

  /**
   * 获取竞争比TOP职位
   */
  getHotByCompetitionRatio: (limit: number = 10) => {
    return request.get<HotPositionsResponse>("/registration-data/hot/competition-ratio", {
      params: { limit },
    });
  },

  // =====================================================
  // 冷门职位
  // =====================================================

  /**
   * 获取无人报考职位
   */
  getNoApplicantPositions: (page: number = 1, pageSize: number = 20) => {
    return request.get<ColdPositionsResponse>("/registration-data/cold/no-applicant", {
      params: { page, page_size: pageSize },
    });
  },

  /**
   * 获取低竞争比职位
   */
  getLowCompetitionPositions: (maxRatio: number = 10, page: number = 1, pageSize: number = 20) => {
    return request.get<ColdPositionsResponse>("/registration-data/cold/low-competition", {
      params: { max_ratio: maxRatio, page, page_size: pageSize },
    });
  },

  // =====================================================
  // 趋势数据
  // =====================================================

  /**
   * 获取报名趋势
   */
  getTrends: (days: number = 30) => {
    return request.get<RegistrationTrendsResponse>("/registration-data/trends", {
      params: { days },
    });
  },

  /**
   * 获取单个职位的报名趋势
   */
  getPositionTrends: (positionId: number, days: number = 30) => {
    return request.get<PositionTrendsResponse>(`/registration-data/position/${positionId}/trends`, {
      params: { days },
    });
  },

  // =====================================================
  // 统计数据
  // =====================================================

  /**
   * 按省份统计报名数据
   */
  getStatsByProvince: () => {
    return request.get<ProvinceRegistrationStatsResponse>("/registration-data/stats/province");
  },

  /**
   * 按考试类型统计报名数据
   */
  getStatsByExamType: () => {
    return request.get<ExamTypeRegistrationStatsResponse>("/registration-data/stats/exam-type");
  },

  // =====================================================
  // 管理操作
  // =====================================================

  /**
   * 手动触发数据采集
   */
  collectSnapshot: () => {
    return request.post<{ message: string }>("/admin/registration-data/collect");
  },

  /**
   * 清理旧数据
   */
  cleanOldData: (days: number = 90) => {
    return request.delete<{ message: string }>("/admin/registration-data/clean", {
      params: { days },
    });
  },
};

export default registrationDataApi;
