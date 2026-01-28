import request from "../request";

// =====================================================
// 类型定义
// =====================================================

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
  subject: string; // xingce, shenlun, mianshi, gongji
  exam_type: string; // national, provincial, institution
  course_count: number;
  children?: CourseCategory[];
}

// 课程简要信息（列表用）
export interface CourseBrief {
  id: number;
  category_id: number;
  title: string;
  subtitle?: string;
  description?: string;
  cover_image?: string;
  content_type: string; // video, document, audio, mixed
  difficulty: string; // beginner, intermediate, advanced
  duration_minutes: number;
  chapter_count: number;
  is_free: boolean;
  vip_only: boolean;
  view_count: number;
  study_count: number;
  like_count: number;
  collect_count: number;
  category?: CourseCategory;
}

// 章节信息
export interface CourseChapter {
  id: number;
  course_id: number;
  parent_id?: number;
  title: string;
  description?: string;
  content_type: string;
  content_url?: string;
  content_text?: string;
  duration_minutes: number;
  level: number;
  is_free_preview: boolean;
  sort_order: number;
  children?: CourseChapter[];
}

// 课程详情
export interface CourseDetail extends CourseBrief {
  author_name?: string;
  author_avatar?: string;
  author_intro?: string;
  objectives?: string[];
  requirements?: string[];
  target_audience?: string[];
  chapters?: CourseChapter[];
  is_collected: boolean;
  study_progress: number;
}

// 知识点
export interface KnowledgePoint {
  id: number;
  category_id: number;
  parent_id?: number;
  code: string;
  name: string;
  description?: string;
  importance: number; // 1-5
  frequency: string; // high, medium, low
  level: number;
  children?: KnowledgePoint[];
}

// 学习进度
export interface UserCourseProgress {
  id: number;
  user_id: number;
  course_id: number;
  progress: number;
  last_chapter_id?: number;
  last_study_at?: string;
  is_completed: boolean;
  completed_at?: string;
  course?: CourseBrief;
}

// 课程收藏
export interface UserCourseCollect {
  id: number;
  user_id: number;
  course_id: number;
  created_at: string;
  course?: CourseBrief;
}

// =====================================================
// 请求/响应类型
// =====================================================

// 课程列表查询参数
export interface CourseQueryParams {
  category_id?: number;
  subject?: string;
  exam_type?: string;
  content_type?: string;
  difficulty?: string;
  is_free?: boolean;
  vip_only?: boolean;
  keyword?: string;
  order_by?: "latest" | "popular" | "views" | "rating";
  page?: number;
  page_size?: number;
}

// 课程列表响应
export interface CourseListResponse {
  courses: CourseBrief[];
  total: number;
  page: number;
  page_size: number;
}

// 分类列表响应
export interface CategoryListResponse {
  categories: CourseCategory[];
}

// 知识点树响应
export interface KnowledgeTreeResponse {
  knowledge_points: KnowledgePoint[];
}

// 收藏列表响应
export interface CollectListResponse {
  collects: UserCourseCollect[];
  total: number;
  page: number;
  page_size: number;
}

// 学习课程列表响应
export interface LearningListResponse {
  courses: UserCourseProgress[];
  total: number;
  page: number;
  page_size: number;
}

// 更新进度请求
export interface UpdateProgressRequest {
  chapter_id: number;
  progress: number;
}

// =====================================================
// API 调用
// =====================================================

export const courseApi = {
  // =============== 分类 ===============
  
  // 获取所有分类
  getCategories: () => 
    request.get<CategoryListResponse>("/api/v1/courses/categories"),
  
  // 按科目获取分类
  getCategoriesBySubject: (subject: string) =>
    request.get<CategoryListResponse>(`/api/v1/courses/categories/subject/${subject}`),
  
  // 获取单个分类
  getCategory: (id: number) =>
    request.get<CourseCategory>(`/api/v1/courses/categories/${id}`),

  // =============== 课程 ===============
  
  // 获取课程列表
  getCourses: (params?: CourseQueryParams) =>
    request.get<CourseListResponse>("/api/v1/courses", { params }),
  
  // 获取推荐课程
  getFeaturedCourses: (limit?: number) =>
    request.get<{ courses: CourseBrief[] }>("/api/v1/courses/featured", { 
      params: { limit } 
    }),
  
  // 获取免费课程
  getFreeCourses: (limit?: number) =>
    request.get<{ courses: CourseBrief[] }>("/api/v1/courses/free", { 
      params: { limit } 
    }),
  
  // 获取课程详情
  getCourse: (id: number) =>
    request.get<CourseDetail>(`/api/v1/courses/${id}`),
  
  // 获取章节内容
  getChapterContent: (chapterId: number) =>
    request.get<CourseChapter>(`/api/v1/courses/chapters/${chapterId}`),

  // =============== 用户操作 ===============
  
  // 收藏课程
  collectCourse: (courseId: number) =>
    request.post<{ message: string }>(`/api/v1/courses/${courseId}/collect`),
  
  // 取消收藏
  uncollectCourse: (courseId: number) =>
    request.delete<{ message: string }>(`/api/v1/courses/${courseId}/collect`),
  
  // 获取我的收藏
  getMyCollects: (page?: number, pageSize?: number) =>
    request.get<CollectListResponse>("/api/v1/courses/my/collects", {
      params: { page, page_size: pageSize }
    }),
  
  // 获取最近学习
  getRecentLearning: (limit?: number) =>
    request.get<{ courses: UserCourseProgress[] }>("/api/v1/courses/my/recent", {
      params: { limit }
    }),
  
  // 获取在学课程
  getMyLearning: (page?: number, pageSize?: number) =>
    request.get<LearningListResponse>("/api/v1/courses/my/learning", {
      params: { page, page_size: pageSize }
    }),
  
  // 获取课程学习进度
  getCourseProgress: (courseId: number) =>
    request.get<UserCourseProgress>(`/api/v1/courses/${courseId}/progress`),
  
  // 更新学习进度
  updateProgress: (courseId: number, data: UpdateProgressRequest) =>
    request.put<{ message: string }>(`/api/v1/courses/${courseId}/progress`, data),

  // =============== 知识点 ===============
  
  // 获取知识点树
  getKnowledgeTree: (categoryId: number) =>
    request.get<KnowledgeTreeResponse>(`/api/v1/courses/knowledge/${categoryId}`),
  
  // 获取单个知识点
  getKnowledgePoint: (id: number) =>
    request.get<KnowledgePoint>(`/api/v1/courses/knowledge/point/${id}`),
  
  // 获取高频知识点
  getHotKnowledge: (categoryId?: number, limit?: number) =>
    request.get<{ knowledge_points: KnowledgePoint[] }>("/api/v1/courses/knowledge/hot", {
      params: { category_id: categoryId, limit }
    }),
};
