import request from "../request";

// 公告简要信息
export interface AnnouncementBrief {
  id: number;
  title: string;
  exam_type?: string;
  province?: string;
  city?: string;
  source?: string;
  source_url?: string;
  status: number;
  publish_date?: string;
  registration_start?: string;
  registration_end?: string;
  position_count?: number;
  recruit_count?: number;
  views?: number;
  created_at: string;
}

// 公告完整信息
export interface Announcement extends AnnouncementBrief {
  content?: string;
  summary?: string;
  exam_date?: string;
  interview_date?: string;
  attachments?: AnnouncementAttachment[];
  updated_at?: string;
}

// 公告附件
export interface AnnouncementAttachment {
  id: number;
  name: string;
  url: string;
  type: string;
  size?: number;
}

// 查询参数
export interface AnnouncementQueryParams {
  // 基础筛选
  exam_type?: string;
  province?: string;
  city?: string;
  source?: string;
  
  // 状态筛选
  status?: number;
  
  // 时间筛选
  start_date?: string;
  end_date?: string;
  reg_status?: "registering" | "upcoming" | "ended";
  
  // 关键词搜索
  keyword?: string;
  
  // 排序
  sort_by?: "created_at" | "publish_date" | "registration_end" | "position_count" | "views";
  sort_order?: "asc" | "desc";
  
  // 分页
  page?: number;
  page_size?: number;
}

// 列表响应
export interface AnnouncementListResponse {
  announcements: AnnouncementBrief[];
  total: number;
  page: number;
  page_size: number;
}

// 兼容旧接口
export interface AnnouncementListParams {
  page?: number;
  page_size?: number;
  type?: string;
  exam_type?: string;
  region?: string;
  keyword?: string;
}

// 统计数据
export interface AnnouncementStats {
  total: number;
  published_count: number;
  today_new_count: number;
  registering_count: number;
  total_positions: number;
  total_recruit: number;
}

// 按考试类型统计
export interface ExamTypeStats {
  exam_type: string;
  count: number;
  position_count: number;
  recruit_count: number;
}

// 按省份统计
export interface ProvinceStats {
  province: string;
  count: number;
  position_count: number;
}

// 关联职位
export interface AnnouncementPosition {
  id: number;
  position_name: string;
  department_name?: string;
  recruit_count: number;
  education?: string;
  major?: string;
  work_location?: string;
}

// 时间线事件
export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  status: "completed" | "active" | "pending";
}

// 公告详情（含关联数据）
export interface AnnouncementDetail extends Announcement {
  positions?: AnnouncementPosition[];
  timeline?: TimelineEvent[];
}

// 筛选选项
export interface FilterOptions {
  exam_types: string[];
  provinces: string[];
  sources: string[];
}

export const announcementApi = {
  // 获取公告列表（新接口）
  getAnnouncements: (params?: AnnouncementQueryParams): Promise<AnnouncementListResponse> =>
    request.get("/announcements/v2", { params }),

  // 获取公告列表（旧接口兼容）
  getList: (params?: AnnouncementListParams): Promise<{ list: Announcement[]; total: number; page: number; page_size: number }> =>
    request.get("/announcements", { params }),

  // 获取公告详情
  getDetail: (id: number): Promise<AnnouncementDetail> =>
    request.get(`/announcements/${id}`),

  // 获取最新公告
  getLatest: (limit?: number): Promise<AnnouncementBrief[]> =>
    request.get("/announcements/latest", { params: { limit } }),

  // 搜索公告
  search: (keyword: string, params?: AnnouncementQueryParams): Promise<AnnouncementListResponse> =>
    request.get("/announcements/search", { params: { keyword, ...params } }),

  // 获取统计数据
  getStats: (): Promise<AnnouncementStats> =>
    request.get("/announcements/stats"),

  // 按考试类型统计
  getStatsByExamType: (): Promise<ExamTypeStats[]> =>
    request.get("/announcements/stats/exam-type"),

  // 按省份统计
  getStatsByProvince: (): Promise<ProvinceStats[]> =>
    request.get("/announcements/stats/province"),

  // 获取筛选选项
  getFilterOptions: (): Promise<FilterOptions> =>
    request.get("/announcements/filter-options"),

  // 获取公告关联的职位
  getPositions: (id: number, params?: { page?: number; page_size?: number }): Promise<{
    positions: AnnouncementPosition[];
    total: number;
  }> => request.get(`/announcements/${id}/positions`, { params }),

  // 获取热门公告
  getHotAnnouncements: (limit?: number): Promise<AnnouncementBrief[]> =>
    request.get("/announcements/hot", { params: { limit } }),

  // 获取正在报名的公告
  getRegisteringAnnouncements: (limit?: number): Promise<AnnouncementBrief[]> =>
    request.get("/announcements/registering", { params: { limit } }),

  // 收藏公告
  addFavorite: (id: number): Promise<{ message: string }> =>
    request.post(`/announcements/${id}/favorite`),

  // 取消收藏
  removeFavorite: (id: number): Promise<{ message: string }> =>
    request.delete(`/announcements/${id}/favorite`),

  // 获取收藏列表
  getFavorites: (params?: { page?: number; page_size?: number }): Promise<{
    announcements: AnnouncementBrief[];
    total: number;
  }> => request.get("/announcements/favorites", { params }),
};

export default announcementApi;
