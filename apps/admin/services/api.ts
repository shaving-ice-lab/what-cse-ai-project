import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";

const axiosInstance = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Typed request wrapper that reflects the response interceptor behavior
// The interceptor returns data.data, so the return type is T, not AxiosResponse<T>
const request = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.get(url, config) as Promise<T>,
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.post(url, data, config) as Promise<T>,
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.put(url, data, config) as Promise<T>,
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.delete(url, config) as Promise<T>,
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.patch(url, data, config) as Promise<T>,
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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

axiosInstance.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code !== 0) {
      return Promise.reject(new Error(data.message || "Request failed"));
    }
    return data.data;
  },
  async (error: AxiosError<{ code: number; message: string }>) => {
    // 忽略用户主动取消的请求
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
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

export interface AdminUser {
  id: number;
  username: string;
  role: string;
  status: number;
  last_login: string;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_positions: number;
  total_announcements: number;
  pending_reviews: number;
  today_new_users: number;
  today_new_positions: number;
}

export interface AdminUserListParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  status?: number;
}

export interface AdminPositionListParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  status?: number;
  exam_type?: string;
}

export const adminApi = {
  login: (data: { username: string; password: string }) => {
    return request.post<{ token: string; admin: AdminUser }>("/admin/login", data);
  },

  getDashboardStats: () => {
    return request.get<DashboardStats>("/admin/dashboard/stats");
  },

  getUsers: (params?: AdminUserListParams) => {
    return request.get("/admin/users", { params });
  },

  getUserDetail: (id: number) => {
    return request.get(`/admin/users/${id}`);
  },

  updateUserStatus: (id: number, status: number) => {
    return request.put(`/admin/users/${id}/status`, { status });
  },

  getPositions: (params?: AdminPositionListParams) => {
    return request.get("/admin/positions", { params });
  },

  getPositionDetail: (id: number) => {
    return request.get(`/admin/positions/${id}`);
  },

  updatePositionStatus: (id: number, status: number) => {
    return request.put(`/admin/positions/${id}/status`, { status });
  },

  deletePosition: (id: number) => {
    return request.delete(`/admin/positions/${id}`);
  },

  getAnnouncements: (params?: { page?: number; page_size?: number; status?: number }) => {
    return request.get("/admin/announcements", { params });
  },

  createAnnouncement: (data: { title: string; content: string; type: string }) => {
    return request.post("/admin/announcements", data);
  },

  updateAnnouncement: (id: number, data: { title?: string; content?: string; status?: number }) => {
    return request.put(`/admin/announcements/${id}`, data);
  },

  deleteAnnouncement: (id: number) => {
    return request.delete(`/admin/announcements/${id}`);
  },

  // Crawler APIs
  getCrawlerStats: () => {
    return request.get("/admin/crawlers");
  },

  getCrawlerStatistics: () => {
    return request.get("/admin/crawlers/stats");
  },

  triggerCrawler: (data: { spider_type: string; list_page_id?: number }) => {
    return request.post("/admin/crawlers/trigger", data);
  },

  getCrawlTasks: (params?: {
    page?: number;
    page_size?: number;
    task_type?: string;
    status?: string;
  }) => {
    return request.get("/admin/crawlers/tasks", { params });
  },

  getCrawlTask: (taskId: string) => {
    return request.get(`/admin/crawlers/tasks/${taskId}`);
  },

  cancelCrawlTask: (taskId: string) => {
    return request.post(`/admin/crawlers/tasks/${taskId}/cancel`);
  },

  getCrawlerLogs: (params?: { task_id?: string; limit?: number }) => {
    return request.get("/admin/crawlers/logs", { params });
  },

  // List Pages APIs
  getListPages: (params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }) => {
    return request.get("/admin/list-pages", { params });
  },

  getListPage: (id: number) => {
    return request.get(`/admin/list-pages/${id}`);
  },

  createListPage: (data: {
    url: string;
    source_name?: string;
    category?: string;
    crawl_frequency?: string;
    article_selector?: string;
    pagination_pattern?: string;
  }) => {
    return request.post("/admin/list-pages", data);
  },

  updateListPage: (
    id: number,
    data: {
      source_name?: string;
      category?: string;
      crawl_frequency?: string;
      article_selector?: string;
      pagination_pattern?: string;
      status?: string;
    }
  ) => {
    return request.put(`/admin/list-pages/${id}`, data);
  },

  deleteListPage: (id: number) => {
    return request.delete(`/admin/list-pages/${id}`);
  },

  testListPageCrawl: (id: number) => {
    return request.post(`/admin/list-pages/${id}/test`);
  },
};

// Crawler Types
export interface CrawlTask {
  id: number;
  task_id: string;
  task_type: string;
  task_name: string;
  task_params: Record<string, unknown>;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  result?: Record<string, unknown>;
  error_message?: string;
  items_scraped: number;
  items_saved: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface ListPage {
  id: number;
  url: string;
  source_name: string;
  category: string;
  crawl_frequency: string;
  last_crawl_time?: string;
  article_count: number;
  article_selector: string;
  pagination_pattern: string;
  status: "active" | "inactive" | "error";
  created_at: string;
  updated_at: string;
}

export interface CrawlerStats {
  list_pages: {
    total: number;
    by_status: Record<string, number>;
  };
  tasks: {
    total: number;
    by_status: Record<string, number>;
    by_type: Record<string, number>;
    running_count: number;
  };
}

export interface CrawlLog {
  id: number;
  task_id: string;
  level: string;
  message: string;
  data?: Record<string, unknown>;
  created_at: string;
}

// Fenbi Types
export interface FenbiCredential {
  id: number;
  phone: string;
  phone_masked: string;
  password?: string; // 明文密码，只允许单账号登录
  login_status: number;
  login_status_text: string;
  last_login_at?: string;
  last_check_at?: string;
  is_default: boolean;
  created_at: string;
}

export interface FenbiLoginStatus {
  is_logged_in: boolean;
  status: number;
  status_text: string;
  phone?: string;
  phone_masked?: string;
  last_login_at?: string;
  last_check_at?: string;
  cookie_expires_at?: string;
}

export interface FenbiCategory {
  id: number;
  category_type: string;
  code: string;
  name: string;
  sort_order: number;
  is_enabled: boolean;
}

export interface FenbiAnnouncement {
  id: number;
  fenbi_id: string;
  title: string;
  fenbi_url: string;
  original_url?: string;
  region_code?: string;
  region_name?: string;
  exam_type_code?: string;
  exam_type_name?: string;
  year?: number;
  publish_date?: string;
  crawl_status: number;
  sync_to_announcement: boolean;
  announcement_id?: number;
  created_at: string;
  updated_at: string;
}

export interface FenbiCrawlProgress {
  total_tasks: number;
  completed_tasks: number;
  current_task: string;
  items_crawled: number;
  items_saved: number;
  status: string;
  message?: string;
}

export interface FenbiAnnouncementListParams {
  page?: number;
  page_size?: number;
  region?: string;
  exam_type?: string;
  year?: number;
  crawl_status?: number;
  keyword?: string;
}

// Fenbi APIs
export const fenbiApi = {
  // Credential management
  getCredential: () => {
    return request.get<{
      has_credential: boolean;
      credential?: FenbiCredential;
      message?: string;
    }>("/admin/fenbi/credentials");
  },

  saveCredential: (data: { phone: string; password: string }) => {
    return request.post<{
      message: string;
      credential: FenbiCredential;
    }>("/admin/fenbi/credentials", data);
  },

  // Login management
  login: () => {
    return request.post<FenbiLoginStatus>("/admin/fenbi/login");
  },

  checkLoginStatus: () => {
    return request.get<FenbiLoginStatus>("/admin/fenbi/login-status");
  },

  importCookies: (data: { cookies: string; phone?: string }) => {
    return request.post<{
      message: string;
      login_status: FenbiLoginStatus;
    }>("/admin/fenbi/import-cookies", data);
  },

  // Categories
  getCategories: (type?: string) => {
    return request.get<{
      regions?: FenbiCategory[];
      exam_types?: FenbiCategory[];
      years?: FenbiCategory[];
      categories?: FenbiCategory[];
    }>("/admin/fenbi/categories", { params: type ? { type } : {} });
  },

  // Crawler operations
  triggerCrawl: (data: {
    regions?: string[];
    exam_types?: string[];
    years?: number[];
  }, signal?: AbortSignal) => {
    return request.post<FenbiCrawlProgress>("/admin/fenbi/crawl", data, { signal });
  },

  stopCrawl: () => {
    return request.post<{ message: string }>("/admin/fenbi/crawl/stop");
  },

  batchCrawlDetails: (limit?: number) => {
    return request.post<{ message: string; crawled: number }>(
      "/admin/fenbi/crawl-details",
      {},
      { params: limit ? { limit } : {} }
    );
  },

  // Announcements
  getAnnouncements: (params?: FenbiAnnouncementListParams) => {
    return request.get<{
      announcements: FenbiAnnouncement[];
      total: number;
      page: number;
      page_size: number;
    }>("/admin/fenbi/announcements", { params });
  },

  crawlAnnouncementDetail: (id: number) => {
    return request.post<{
      message: string;
      announcement: FenbiAnnouncement;
    }>(`/admin/fenbi/announcements/${id}/crawl-detail`);
  },

  // Stats
  getStats: () => {
    return request.get<{
      total: number;
      by_crawl_status: Record<number, number>;
      by_region: Record<string, number>;
      by_year: Record<number, number>;
    }>("/admin/fenbi/stats");
  },

  // Test crawl with cookie
  testCrawl: () => {
    return request.post<{
      success: boolean;
      message: string;
      test_result?: {
        announcement_id?: number;
        title?: string;
        fenbi_url?: string;
        original_url?: string;
        raw_data?: Record<string, unknown>;
      };
    }>("/admin/fenbi/test-crawl");
  },
};

// LLM Config Types
export interface LLMConfig {
  id: number;
  name: string;
  provider: string;
  model: string;
  api_url: string;
  api_key_masked: string;
  organization_id?: string;
  max_tokens: number;
  temperature: number;
  timeout: number;
  is_default: boolean;
  is_enabled: boolean;
  extra_params?: Record<string, unknown>;
  description?: string;
  last_test_at?: string;
  last_test_status?: number;
  last_test_message?: string;
  created_at: string;
  updated_at: string;
}

export interface LLMConfigSelectOption {
  id: number;
  name: string;
  provider: string;
  model: string;
}

export interface LLMProvider {
  id: string;
  name: string;
  description: string;
  api_url: string;
  models: string[];
}

export interface CreateLLMConfigRequest {
  name: string;
  provider: string;
  model: string;
  api_url: string;
  api_key: string;
  organization_id?: string;
  max_tokens?: number;
  temperature?: number;
  timeout?: number;
  is_default?: boolean;
  is_enabled?: boolean;
  extra_params?: Record<string, unknown>;
  description?: string;
}

export interface UpdateLLMConfigRequest {
  name?: string;
  provider?: string;
  model?: string;
  api_url?: string;
  api_key?: string;
  organization_id?: string;
  max_tokens?: number;
  temperature?: number;
  timeout?: number;
  is_default?: boolean;
  is_enabled?: boolean;
  extra_params?: Record<string, unknown>;
  description?: string;
}

// LLM Config APIs
export const llmConfigApi = {
  // Get all configs
  getConfigs: (params?: { provider?: string; is_enabled?: boolean }) => {
    return request.get<{
      configs: LLMConfig[];
      total: number;
    }>("/admin/llm-configs", { params });
  },

  // Get single config
  getConfig: (id: number) => {
    return request.get<LLMConfig>(`/admin/llm-configs/${id}`);
  },

  // Create config
  createConfig: (data: CreateLLMConfigRequest) => {
    return request.post<{
      message: string;
      config: LLMConfig;
    }>("/admin/llm-configs", data);
  },

  // Update config
  updateConfig: (id: number, data: UpdateLLMConfigRequest) => {
    return request.put<{
      message: string;
      config: LLMConfig;
    }>(`/admin/llm-configs/${id}`, data);
  },

  // Delete config
  deleteConfig: (id: number) => {
    return request.delete<{ message: string }>(`/admin/llm-configs/${id}`);
  },

  // Get default config
  getDefault: () => {
    return request.get<LLMConfig>("/admin/llm-configs/default");
  },

  // Set default config
  setDefault: (id: number) => {
    return request.post<{ message: string }>(`/admin/llm-configs/${id}/default`);
  },

  // Test config
  testConfig: (id: number, prompt?: string) => {
    return request.post<{
      message: string;
      response: string;
    }>(`/admin/llm-configs/${id}/test`, { prompt });
  },

  // Get select options
  getSelectOptions: () => {
    return request.get<{
      options: LLMConfigSelectOption[];
    }>("/admin/llm-configs/options");
  },

  // Get supported providers
  getProviders: () => {
    return request.get<{
      providers: LLMProvider[];
    }>("/admin/llm-configs/providers");
  },
};

export default request;
