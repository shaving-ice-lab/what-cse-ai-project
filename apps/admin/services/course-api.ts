import axios, { AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";
import { ADMIN_AUTH_CONFIG } from "@what-cse/shared";

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
      window.location.href = ADMIN_AUTH_CONFIG.loginPath;
    }
    const message = error.response?.data?.message || error.message || "Network error";
    return Promise.reject(new Error(message));
  }
);

// ============================================
// Types
// ============================================

export type CourseStatus = "draft" | "published" | "archived";
export type ContentType = "video" | "document" | "audio" | "mixed";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type Subject = "xingce" | "shenlun" | "mianshi" | "gongji";
export type Frequency = "high" | "medium" | "low";

// 课程分类
export interface CourseCategory {
  id: number;
  parent_id?: number;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  level: number;
  subject: Subject;
  exam_type: string;
  sort_order: number;
  is_active: boolean;
  course_count: number;
  children?: CourseCategory[];
  created_at: string;
  updated_at: string;
}

// 课程
export interface Course {
  id: number;
  category_id: number;
  title: string;
  subtitle?: string;
  description?: string;
  cover_image?: string;
  content_type: ContentType;
  difficulty: Difficulty;
  duration_minutes: number;
  chapter_count: number;
  author_name?: string;
  author_avatar?: string;
  author_intro?: string;
  is_free: boolean;
  price?: number;
  vip_only: boolean;
  view_count: number;
  study_count: number;
  like_count: number;
  collect_count: number;
  sort_order: number;
  status: CourseStatus;
  published_at?: string;
  created_at: string;
  updated_at: string;
  category?: CourseCategory;
}

// 课程章节
export interface CourseChapter {
  id: number;
  course_id: number;
  parent_id?: number;
  title: string;
  description?: string;
  content_type: ContentType;
  content_url?: string;
  content_text?: string;
  duration_minutes: number;
  level: number;
  is_free_preview: boolean;
  sort_order: number;
  children?: CourseChapter[];
  created_at: string;
}

// 知识点
export interface KnowledgePoint {
  id: number;
  category_id: number;
  parent_id?: number;
  code: string;
  name: string;
  description?: string;
  importance: number;
  frequency: Frequency;
  tips?: string;
  related_courses?: number[];
  level: number;
  sort_order: number;
  children?: KnowledgePoint[];
  created_at: string;
  updated_at: string;
}

// 课程统计
export interface CourseStats {
  total_courses: number;
  published_courses: number;
  draft_courses: number;
  total_chapters: number;
  total_categories: number;
  total_knowledge_points: number;
  total_study_count: number;
}

// ============================================
// Request/Response Types
// ============================================

export interface CategoryListParams {
  subject?: Subject;
  parent_id?: number;
  is_active?: boolean;
}

export interface CourseListParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  category_id?: number;
  subject?: Subject;
  status?: CourseStatus;
  content_type?: ContentType;
  difficulty?: Difficulty;
  is_free?: boolean;
  vip_only?: boolean;
  order_by?: string;
}

export interface KnowledgeListParams {
  category_id?: number;
  parent_id?: number;
  frequency?: Frequency;
}

export interface CreateCategoryRequest {
  parent_id?: number;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  subject: Subject;
  exam_type?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CreateCourseRequest {
  category_id: number;
  title: string;
  subtitle?: string;
  description?: string;
  cover_image?: string;
  content_type: ContentType;
  difficulty: Difficulty;
  author_name?: string;
  author_avatar?: string;
  author_intro?: string;
  is_free?: boolean;
  price?: number;
  vip_only?: boolean;
  sort_order?: number;
  status?: CourseStatus;
}

export interface UpdateCourseRequest {
  category_id?: number;
  title?: string;
  subtitle?: string;
  description?: string;
  cover_image?: string;
  content_type?: ContentType;
  difficulty?: Difficulty;
  author_name?: string;
  author_avatar?: string;
  author_intro?: string;
  is_free?: boolean;
  price?: number;
  vip_only?: boolean;
  sort_order?: number;
  status?: CourseStatus;
}

export interface CreateChapterRequest {
  course_id: number;
  parent_id?: number;
  title: string;
  description?: string;
  content_type: ContentType;
  content_url?: string;
  content_text?: string;
  duration_minutes?: number;
  is_free_preview?: boolean;
  sort_order?: number;
}

export interface UpdateChapterRequest {
  title?: string;
  description?: string;
  content_type?: ContentType;
  content_url?: string;
  content_text?: string;
  duration_minutes?: number;
  is_free_preview?: boolean;
  sort_order?: number;
}

export interface CreateKnowledgeRequest {
  category_id: number;
  parent_id?: number;
  code: string;
  name: string;
  description?: string;
  importance?: number;
  frequency?: Frequency;
  tips?: string;
  related_courses?: number[];
  sort_order?: number;
}

export interface UpdateKnowledgeRequest {
  name?: string;
  description?: string;
  importance?: number;
  frequency?: Frequency;
  tips?: string;
  related_courses?: number[];
  sort_order?: number;
}

export interface ReorderRequest {
  items: { id: number; sort_order: number }[];
}

// ============================================
// API
// ============================================

export const courseApi = {
  // =============== 统计 ===============
  
  getStats: () => {
    return request.get<CourseStats>("/admin/courses/stats");
  },

  // =============== 分类管理 ===============
  
  // 获取分类列表（树形）- 使用公共API
  getCategories: (params?: CategoryListParams) => {
    return request.get<{
      categories: CourseCategory[];
      total: number;
    }>("/courses/categories", { params });
  },

  // 获取分类树（兼容旧命名）
  getCategoriesTree: (params?: CategoryListParams) => {
    return request.get<{
      categories: CourseCategory[];
      total?: number;
    }>("/courses/categories", { params });
  },

  // 获取单个分类 - 使用公共API
  getCategory: (id: number) => {
    return request.get<CourseCategory>(`/courses/categories/${id}`);
  },

  // 创建分类
  createCategory: (data: CreateCategoryRequest) => {
    return request.post<CourseCategory>("/admin/courses/categories", data);
  },

  // 更新分类
  updateCategory: (id: number, data: UpdateCategoryRequest) => {
    return request.put<CourseCategory>(`/admin/courses/categories/${id}`, data);
  },

  // 删除分类
  deleteCategory: (id: number) => {
    return request.delete<{ message: string }>(`/admin/courses/categories/${id}`);
  },

  // 分类排序
  reorderCategories: (data: ReorderRequest) => {
    return request.post<{ message: string }>("/admin/courses/categories/reorder", data);
  },

  // 批量删除分类
  batchDeleteCategories: async (ids: number[]) => {
    const results = await Promise.allSettled(
      ids.map((id) => request.delete<{ message: string }>(`/admin/courses/categories/${id}`))
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    return { succeeded, failed, total: ids.length };
  },

  // 批量更新分类状态
  batchUpdateCategories: async (ids: number[], data: UpdateCategoryRequest) => {
    const results = await Promise.allSettled(
      ids.map((id) => request.put<CourseCategory>(`/admin/courses/categories/${id}`, data))
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    return { succeeded, failed, total: ids.length };
  },

  // =============== 课程管理 ===============
  
  // 获取课程列表
  getCourses: (params?: CourseListParams) => {
    return request.get<{
      courses: Course[];
      total: number;
      page: number;
      page_size: number;
    }>("/admin/courses", { params });
  },

  // 获取单个课程
  getCourse: (id: number) => {
    return request.get<Course>(`/admin/courses/${id}`);
  },

  // 获取课程详情（含章节）
  getCourseDetail: (id: number) => {
    return request.get<{
      course: Course;
      chapters: CourseChapter[];
    }>(`/admin/courses/${id}/detail`);
  },

  // 创建课程
  createCourse: (data: CreateCourseRequest) => {
    return request.post<Course>("/admin/courses", data);
  },

  // 更新课程
  updateCourse: (id: number, data: UpdateCourseRequest) => {
    return request.put<Course>(`/admin/courses/${id}`, data);
  },

  // 删除课程
  deleteCourse: (id: number) => {
    return request.delete<{ message: string }>(`/admin/courses/${id}`);
  },

  // 发布课程
  publishCourse: (id: number) => {
    return request.post<Course>(`/admin/courses/${id}/publish`);
  },

  // 下架课程
  archiveCourse: (id: number) => {
    return request.post<Course>(`/admin/courses/${id}/archive`);
  },

  // =============== 章节管理 ===============
  
  // 获取课程章节
  getChapters: (courseId: number) => {
    return request.get<{
      chapters: CourseChapter[];
      total: number;
    }>(`/admin/courses/${courseId}/chapters`);
  },

  // 创建章节
  createChapter: (data: CreateChapterRequest) => {
    return request.post<CourseChapter>("/admin/courses/chapters", data);
  },

  // 更新章节
  updateChapter: (id: number, data: UpdateChapterRequest) => {
    return request.put<CourseChapter>(`/admin/courses/chapters/${id}`, data);
  },

  // 删除章节
  deleteChapter: (id: number) => {
    return request.delete<{ message: string }>(`/admin/courses/chapters/${id}`);
  },

  // 章节排序
  reorderChapters: (courseId: number, data: ReorderRequest) => {
    return request.post<{ message: string }>(`/admin/courses/${courseId}/chapters/reorder`, data);
  },

  // =============== 知识点管理 ===============
  
  // 获取知识点列表（树形）
  getKnowledgePoints: (params?: KnowledgeListParams) => {
    return request.get<{
      knowledge_points: KnowledgePoint[];
      total: number;
    }>("/admin/courses/knowledge", { params });
  },

  // 获取单个知识点
  getKnowledgePoint: (id: number) => {
    return request.get<KnowledgePoint>(`/admin/courses/knowledge/${id}`);
  },

  // 创建知识点
  createKnowledgePoint: (data: CreateKnowledgeRequest) => {
    return request.post<KnowledgePoint>("/admin/courses/knowledge", data);
  },

  // 更新知识点
  updateKnowledgePoint: (id: number, data: UpdateKnowledgeRequest) => {
    return request.put<KnowledgePoint>(`/admin/courses/knowledge/${id}`, data);
  },

  // 删除知识点
  deleteKnowledgePoint: (id: number) => {
    return request.delete<{ message: string }>(`/admin/courses/knowledge/${id}`);
  },

  // 知识点排序
  reorderKnowledgePoints: (categoryId: number, data: ReorderRequest) => {
    return request.post<{ message: string }>(`/admin/courses/knowledge/${categoryId}/reorder`, data);
  },
};

// ============================================
// Helper Functions
// ============================================

export const getSubjectName = (subject: Subject): string => {
  const names: Record<Subject, string> = {
    xingce: "行测",
    shenlun: "申论",
    mianshi: "面试",
    gongji: "公基",
  };
  return names[subject] || subject;
};

export const getSubjectIcon = (subject: Subject): string => {
  const icons: Record<Subject, string> = {
    xingce: "📊",
    shenlun: "📝",
    mianshi: "🎤",
    gongji: "📚",
  };
  return icons[subject] || "📖";
};

export const getDifficultyLabel = (difficulty: Difficulty): string => {
  const labels: Record<Difficulty, string> = {
    beginner: "入门",
    intermediate: "进阶",
    advanced: "高级",
  };
  return labels[difficulty] || difficulty;
};

export const getContentTypeLabel = (contentType: ContentType): string => {
  const labels: Record<ContentType, string> = {
    video: "视频",
    document: "文档",
    audio: "音频",
    mixed: "综合",
  };
  return labels[contentType] || contentType;
};

export const getStatusLabel = (status: CourseStatus): string => {
  const labels: Record<CourseStatus, string> = {
    draft: "草稿",
    published: "已发布",
    archived: "已下架",
  };
  return labels[status] || status;
};

export const getFrequencyLabel = (frequency: Frequency): string => {
  const labels: Record<Frequency, string> = {
    high: "高频",
    medium: "中频",
    low: "低频",
  };
  return labels[frequency] || frequency;
};

// ============================================
// §25.3 知识点内容生成 Types
// ============================================

export type KnowledgeDetailContentType = 
  | "definition"
  | "key_points"
  | "question_types"
  | "solving_method"
  | "examples"
  | "error_prone"
  | "related";

export type FlashCardType =
  | "idiom"
  | "word"
  | "formula"
  | "logic"
  | "figure"
  | "law"
  | "history"
  | "geography"
  | "tech"
  | "writing"
  | "interview"
  | "document"
  | "data"
  | "other";

export type MindMapType =
  | "knowledge"
  | "course"
  | "subject"
  | "chapter"
  | "custom";

// 知识点详情
export interface KnowledgeDetail {
  id: number;
  knowledge_point_id: number;
  content_type: KnowledgeDetailContentType;
  title?: string;
  content: string;
  sort_order: number;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  view_count: number;
  like_count: number;
  created_at: string;
}

// 速记卡片
export interface FlashCard {
  id: number;
  knowledge_point_id?: number;
  category_id?: number;
  card_type: FlashCardType;
  title: string;
  front_content: string;
  back_content: string;
  example?: string;
  mnemonic?: string;
  tags?: string[];
  difficulty: number;
  importance: number;
  sort_order: number;
  is_active: boolean;
  view_count: number;
  collect_count: number;
  master_count: number;
  created_at: string;
}

// 思维导图
export interface MindMap {
  id: number;
  knowledge_point_id?: number;
  category_id?: number;
  map_type: MindMapType;
  title: string;
  description?: string;
  map_data: string;
  thumbnail_url?: string;
  tags?: string[];
  is_active: boolean;
  is_public: boolean;
  view_count: number;
  collect_count: number;
  download_count: number;
  created_by: number;
  created_at: string;
}

// 内容统计
export interface KnowledgeContentStats {
  total_details: number;
  total_flash_cards: number;
  total_mind_maps: number;
  active_details: number;
  active_flash_cards: number;
  active_mind_maps: number;
  total_view_count: number;
  total_collect_count: number;
}

// 卡片类型统计
export interface FlashCardTypeStats {
  card_type: FlashCardType;
  count: number;
  view_sum: number;
}

// 导图类型统计
export interface MindMapTypeStats {
  map_type: MindMapType;
  count: number;
  view_sum: number;
}

// 请求类型
export interface CreateKnowledgeDetailRequest {
  knowledge_point_id: number;
  content_type: KnowledgeDetailContentType;
  title?: string;
  content: string;
  sort_order?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateKnowledgeDetailRequest {
  title?: string;
  content?: string;
  sort_order?: number;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
}

export interface CreateFlashCardRequest {
  knowledge_point_id?: number;
  category_id?: number;
  card_type: FlashCardType;
  title: string;
  front_content: string;
  back_content: string;
  example?: string;
  mnemonic?: string;
  tags?: string[];
  difficulty?: number;
  importance?: number;
  sort_order?: number;
}

export interface UpdateFlashCardRequest {
  title?: string;
  front_content?: string;
  back_content?: string;
  example?: string;
  mnemonic?: string;
  tags?: string[];
  difficulty?: number;
  importance?: number;
  sort_order?: number;
  is_active?: boolean;
}

export interface CreateMindMapRequest {
  knowledge_point_id?: number;
  category_id?: number;
  map_type: MindMapType;
  title: string;
  description?: string;
  map_data: string;
  thumbnail_url?: string;
  tags?: string[];
  is_public?: boolean;
}

export interface UpdateMindMapRequest {
  title?: string;
  description?: string;
  map_data?: string;
  thumbnail_url?: string;
  tags?: string[];
  is_active?: boolean;
  is_public?: boolean;
}

export interface KnowledgeDetailListParams {
  knowledge_point_id?: number;
  content_type?: KnowledgeDetailContentType;
  page?: number;
  page_size?: number;
}

export interface FlashCardListParams {
  knowledge_point_id?: number;
  category_id?: number;
  card_type?: FlashCardType;
  difficulty?: number;
  importance?: number;
  keyword?: string;
  page?: number;
  page_size?: number;
  order_by?: string;
}

export interface MindMapListParams {
  knowledge_point_id?: number;
  category_id?: number;
  map_type?: MindMapType;
  keyword?: string;
  page?: number;
  page_size?: number;
}

// ============================================
// §25.3 知识点内容生成 API
// ============================================

export const knowledgeContentApi = {
  // =============== 统计 ===============
  getStats: () => {
    return request.get<KnowledgeContentStats>("/admin/knowledge-content/stats");
  },

  // =============== 知识点详情 ===============
  
  // 获取详情列表
  getDetails: (params?: KnowledgeDetailListParams) => {
    return request.get<{
      details: KnowledgeDetail[];
      total: number;
      page: number;
      page_size: number;
    }>("/admin/knowledge-content/details", { params });
  },

  // 获取单个详情
  getDetail: (id: number) => {
    return request.get<KnowledgeDetail>(`/admin/knowledge-content/details/${id}`);
  },

  // 获取知识点的所有详情
  getDetailsByKnowledgePoint: (knowledgePointId: number) => {
    return request.get<KnowledgeDetail[]>(`/admin/knowledge-content/knowledge/${knowledgePointId}/details`);
  },

  // 获取知识点的完整内容
  getKnowledgePointFullContent: (knowledgePointId: number) => {
    return request.get<{
      knowledge_point_id: number;
      details: KnowledgeDetail[];
      flash_cards: FlashCard[];
      mind_maps: MindMap[];
    }>(`/admin/knowledge-content/knowledge/${knowledgePointId}/full`);
  },

  // 创建详情
  createDetail: (data: CreateKnowledgeDetailRequest) => {
    return request.post<KnowledgeDetail>("/admin/knowledge-content/details", data);
  },

  // 更新详情
  updateDetail: (id: number, data: UpdateKnowledgeDetailRequest) => {
    return request.put<{ message: string }>(`/admin/knowledge-content/details/${id}`, data);
  },

  // 删除详情
  deleteDetail: (id: number) => {
    return request.delete<{ message: string }>(`/admin/knowledge-content/details/${id}`);
  },

  // =============== 速记卡片 ===============
  
  // 获取卡片列表
  getFlashCards: (params?: FlashCardListParams) => {
    return request.get<{
      flash_cards: FlashCard[];
      total: number;
      page: number;
      page_size: number;
    }>("/admin/knowledge-content/flash-cards", { params });
  },

  // 获取单个卡片
  getFlashCard: (id: number) => {
    return request.get<FlashCard>(`/admin/knowledge-content/flash-cards/${id}`);
  },

  // 获取指定类型的卡片
  getFlashCardsByType: (cardType: FlashCardType, limit?: number) => {
    return request.get<FlashCard[]>(`/admin/knowledge-content/flash-cards/type/${cardType}`, { params: { limit } });
  },

  // 随机获取卡片
  getRandomFlashCards: (cardType?: FlashCardType, count?: number) => {
    return request.get<FlashCard[]>("/admin/knowledge-content/flash-cards/random", { params: { type: cardType, count } });
  },

  // 获取卡片类型统计
  getFlashCardStats: () => {
    return request.get<FlashCardTypeStats[]>("/admin/knowledge-content/flash-cards/stats");
  },

  // 创建卡片
  createFlashCard: (data: CreateFlashCardRequest) => {
    return request.post<FlashCard>("/admin/knowledge-content/flash-cards", data);
  },

  // 批量创建卡片
  batchCreateFlashCards: (cards: CreateFlashCardRequest[]) => {
    return request.post<{ count: number }>("/admin/knowledge-content/flash-cards/batch", cards);
  },

  // 更新卡片
  updateFlashCard: (id: number, data: UpdateFlashCardRequest) => {
    return request.put<{ message: string }>(`/admin/knowledge-content/flash-cards/${id}`, data);
  },

  // 删除卡片
  deleteFlashCard: (id: number) => {
    return request.delete<{ message: string }>(`/admin/knowledge-content/flash-cards/${id}`);
  },

  // =============== 思维导图 ===============
  
  // 获取导图列表
  getMindMaps: (params?: MindMapListParams) => {
    return request.get<{
      mind_maps: MindMap[];
      total: number;
      page: number;
      page_size: number;
    }>("/admin/knowledge-content/mind-maps", { params });
  },

  // 获取单个导图
  getMindMap: (id: number) => {
    return request.get<MindMap>(`/admin/knowledge-content/mind-maps/${id}`);
  },

  // 获取指定类型的导图
  getMindMapsByType: (mapType: MindMapType, limit?: number) => {
    return request.get<MindMap[]>(`/admin/knowledge-content/mind-maps/type/${mapType}`, { params: { limit } });
  },

  // 获取导图类型统计
  getMindMapStats: () => {
    return request.get<MindMapTypeStats[]>("/admin/knowledge-content/mind-maps/stats");
  },

  // 下载导图
  downloadMindMap: (id: number) => {
    return request.get<MindMap>(`/admin/knowledge-content/mind-maps/${id}/download`);
  },

  // 创建导图
  createMindMap: (data: CreateMindMapRequest) => {
    return request.post<MindMap>("/admin/knowledge-content/mind-maps", data);
  },

  // 更新导图
  updateMindMap: (id: number, data: UpdateMindMapRequest) => {
    return request.put<{ message: string }>(`/admin/knowledge-content/mind-maps/${id}`, data);
  },

  // 删除导图
  deleteMindMap: (id: number) => {
    return request.delete<{ message: string }>(`/admin/knowledge-content/mind-maps/${id}`);
  },

  // =============== 种子数据生成 ===============
  
  // 生成所有种子数据
  seedAll: () => {
    return request.post<{
      details_created: number;
      flash_cards_created: number;
      mind_maps_created: number;
      errors?: string[];
    }>("/admin/knowledge-content/seed/all");
  },

  // 生成速记卡片种子数据
  seedFlashCards: () => {
    return request.post<{ flash_cards_created: number }>("/admin/knowledge-content/seed/flash-cards");
  },

  // 生成思维导图种子数据
  seedMindMaps: () => {
    return request.post<{ mind_maps_created: number }>("/admin/knowledge-content/seed/mind-maps");
  },
};

// ============================================
// §25.3 Helper Functions
// ============================================

export const getDetailContentTypeLabel = (type: KnowledgeDetailContentType): string => {
  const labels: Record<KnowledgeDetailContentType, string> = {
    definition: "概念定义",
    key_points: "核心要点",
    question_types: "常见题型",
    solving_method: "解题方法",
    examples: "典型例题",
    error_prone: "易错点提醒",
    related: "关联知识点",
  };
  return labels[type] || type;
};

export const getFlashCardTypeLabel = (type: FlashCardType): string => {
  const labels: Record<FlashCardType, string> = {
    idiom: "成语",
    word: "实词辨析",
    formula: "数学公式",
    logic: "逻辑公式",
    figure: "图推规律",
    law: "法律常识",
    history: "历史常识",
    geography: "地理常识",
    tech: "科技常识",
    writing: "申论写作",
    interview: "面试技巧",
    document: "公文格式",
    data: "资料分析",
    other: "其他",
  };
  return labels[type] || type;
};

export const getMindMapTypeLabel = (type: MindMapType): string => {
  const labels: Record<MindMapType, string> = {
    knowledge: "知识点导图",
    course: "课程导图",
    subject: "科目导图",
    chapter: "章节导图",
    custom: "自定义导图",
  };
  return labels[type] || type;
};
