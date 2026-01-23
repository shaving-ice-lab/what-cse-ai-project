import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";

const request = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

request.interceptors.request.use(
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

request.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code !== 0) {
      return Promise.reject(new Error(data.message || "Request failed"));
    }
    return data.data;
  },
  async (error: AxiosError<{ code: number; message: string }>) => {
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
};

export default request;
