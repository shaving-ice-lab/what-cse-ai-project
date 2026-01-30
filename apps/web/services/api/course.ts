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

  // 新增：LLM 生成的丰富描述信息
  long_description?: string;
  features?: string[];
  learning_objectives?: string[];
  keywords?: string[];
  estimated_duration?: string;
  difficulty?: string;
  question_count?: number;
  avg_time?: number;
  weight?: number;
  key_points?: string[];
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
  word_count?: number;
  lesson_order?: number;
  children?: CourseChapter[];
}

// 课程模块信息
export interface CourseLessonModule {
  id: number;
  chapter_id: number;
  module_type: string; // exam_analysis, introduction, core_concepts, method_steps, formulas, examples, mistakes, drills, practice, vocabulary, extension, summary, homework
  title: string;
  content_json?: Record<string, unknown>;
  content_text?: string;
  word_count: number;
  sort_order: number;
}

// 章节完整内容响应
export interface ChapterContentResponse {
  chapter: CourseChapter;
  content?: Record<string, unknown>;
  exam_analysis?: string;
  modules?: CourseLessonModule[];
  word_count?: {
    total: number;
    by_module?: Record<string, number>;
  };
}

// 科目模块配置
export interface SubjectModuleConfig {
  id: string;
  name: string;
  short_name: string;
  description: string;
  question_count?: number;
  avg_time?: number;
  weight?: number;
  difficulty: number;
  color: string;
  categories?: string[];
  key_points?: string[];

  // 新增：LLM 生成的丰富描述信息
  long_description?: string;
  features?: string[];
  learning_objectives?: string[];
  keywords?: string[];
  estimated_duration?: string;
  icon?: string;
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

// 科目概览（用于学习首页展示）
export interface SubjectOverview {
  id: string;
  name: string;
  full_name: string;
  description: string;
  question_count: number;
  course_count: number;
  features: string[];
  icon: string;
  bg_color: string;
  text_color: string;
  border_color: string;
}

// =====================================================
// 学习内容类型定义
// =====================================================

// 学习内容类型
export type LearningContentType = 
  | "tips"        // 学习技巧
  | "formulas"    // 公式/口诀
  | "guides"      // 学习指南
  | "hot_topics"  // 热点话题
  | "patterns"    // 图形规律
  | "methods"     // 学习方法
  | "strategies"  // 答题策略
  | "quick_facts" // 速记知识点

// 学习内容
export interface LearningContent {
  id: number;
  content_type: LearningContentType;
  subject?: string;
  module?: string;
  category_id?: number;
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  content_json?: Record<string, unknown>;
  content_text?: string;
  sort_order: number;
  is_active: boolean;
  view_count: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// 学习内容查询参数
export interface LearningContentQueryParams {
  content_type?: LearningContentType;
  subject?: string;
  module?: string;
  category_id?: number;
  page?: number;
  page_size?: number;
}

// 学习内容列表响应
export interface LearningContentListResponse {
  contents: LearningContent[];
  total: number;
  page: number;
  page_size: number;
}

// 过滤选项
export interface LearningContentFilterOption {
  value: string;
  label: string;
}

// 过滤选项响应
export interface LearningContentFiltersResponse {
  subjects: LearningContentFilterOption[];
  content_types: LearningContentFilterOption[];
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
  status?: string;
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
    request.get<CategoryListResponse>("/courses/categories", { params: { status: "published" } }),
  
  // 按科目获取分类
  getCategoriesBySubject: (subject: string, status: string = "published") =>
    request.get<CategoryListResponse>("/courses/categories", { params: { subject, status } }),
  
  // 获取单个分类
  getCategory: (id: number) =>
    request.get<CourseCategory>(`/courses/categories/${id}`),

  // =============== 课程 ===============
  
  // 获取课程列表
  getCourses: (params?: CourseQueryParams) =>
    request.get<CourseListResponse>("/courses", { params }),
  
  // 获取推荐课程
  getFeaturedCourses: (limit?: number) =>
    request.get<{ courses: CourseBrief[] }>("/courses/featured", { 
      params: { limit } 
    }),
  
  // 获取免费课程
  getFreeCourses: (limit?: number) =>
    request.get<{ courses: CourseBrief[] }>("/courses/free", { 
      params: { limit } 
    }),
  
  // 获取课程详情
  getCourse: (id: number) =>
    request.get<CourseDetail>(`/courses/${id}`),
  
  // 获取章节内容（基础）
  getChapterContent: (chapterId: number) =>
    request.get<CourseChapter>(`/courses/chapters/${chapterId}`),

  // 获取章节完整内容（含 13 模块）
  getChapterFullContent: (chapterId: number) =>
    request.get<ChapterContentResponse>(`/courses/chapters/${chapterId}/content`),

  // 获取章节模块列表
  getChapterModules: (chapterId: number) =>
    request.get<{ modules: CourseLessonModule[] }>(`/courses/chapters/${chapterId}/modules`),

  // 获取科目模块配置（替代前端硬编码）
  getSubjectModulesConfig: (subject: string) =>
    request.get<{ subject: string; modules: SubjectModuleConfig[] }>("/courses/modules-config", {
      params: { subject }
    }),
  
  // 获取所有科目概览（用于学习首页展示）
  getSubjectsOverview: () =>
    request.get<{ subjects: SubjectOverview[] }>("/courses/subjects"),

  // =============== 用户操作 ===============
  
  // 收藏课程
  collectCourse: (courseId: number) =>
    request.post<{ message: string }>(`/courses/${courseId}/collect`),
  
  // 取消收藏
  uncollectCourse: (courseId: number) =>
    request.delete<{ message: string }>(`/courses/${courseId}/collect`),
  
  // 获取我的收藏
  getMyCollects: (page?: number, pageSize?: number) =>
    request.get<CollectListResponse>("/courses/my/collects", {
      params: { page, page_size: pageSize }
    }),
  
  // 获取最近学习
  getRecentLearning: (limit?: number) =>
    request.get<{ courses: UserCourseProgress[] }>("/courses/my/recent", {
      params: { limit }
    }),
  
  // 获取在学课程
  getMyLearning: (page?: number, pageSize?: number) =>
    request.get<LearningListResponse>("/courses/my/learning", {
      params: { page, page_size: pageSize }
    }),
  
  // 获取课程学习进度
  getCourseProgress: (courseId: number) =>
    request.get<UserCourseProgress>(`/courses/${courseId}/progress`),
  
  // 更新学习进度
  updateProgress: (courseId: number, data: UpdateProgressRequest) =>
    request.put<{ message: string }>(`/courses/${courseId}/progress`, data),

  // =============== 知识点 ===============
  
  // 获取知识点树
  getKnowledgeTree: (categoryId: number) =>
    request.get<KnowledgeTreeResponse>(`/courses/knowledge/${categoryId}`),
  
  // 获取单个知识点
  getKnowledgePoint: (id: number) =>
    request.get<KnowledgePoint>(`/courses/knowledge/point/${id}`),
  
  // 获取高频知识点
  getHotKnowledge: (categoryId?: number, limit?: number) =>
    request.get<{ knowledge_points: KnowledgePoint[] }>("/courses/knowledge/hot", {
      params: { category_id: categoryId, limit }
    }),

  // =============== 学习内容 ===============

  // 按类型获取学习内容
  getLearningContent: (contentType: LearningContentType, params?: Omit<LearningContentQueryParams, 'content_type'>) =>
    request.get<LearningContentListResponse>(`/learning-content/${contentType}`, { params }),

  // 获取所有学习内容
  getAllLearningContent: (params?: LearningContentQueryParams) =>
    request.get<LearningContentListResponse>("/learning-content", { params }),

  // 获取单个学习内容详情
  getLearningContentDetail: (id: number) =>
    request.get<LearningContent>(`/learning-content/detail/${id}`),

  // 按科目获取学习内容
  getLearningContentBySubject: (subject: string, module?: string) =>
    request.get<{ contents: LearningContent[] }>(`/learning-content/subject/${subject}`, {
      params: module ? { module } : undefined
    }),

  // 获取学习内容过滤选项
  getLearningContentFilters: () =>
    request.get<LearningContentFiltersResponse>("/learning-content/filters"),

  // 获取科目下的模块列表
  getLearningContentModules: (subject: string) =>
    request.get<{ modules: LearningContentFilterOption[] }>(`/learning-content/modules/${subject}`),
};
