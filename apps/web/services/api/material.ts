import request from "../request";

// =====================================================
// 类型定义
// =====================================================

// 素材类型
export type MaterialType =
  | "quote" // 名言警句
  | "case" // 案例素材
  | "sentence" // 优美语句
  | "hot_topic" // 热点专题
  | "interview" // 面试素材
  | "knowledge" // 常识素材
  | "formula" // 公式速记
  | "mnemonic" // 记忆口诀
  | "template" // 答题模板
  | "vocabulary"; // 词汇素材

// 素材子类型
export type MaterialSubType =
  // 名言警句子类型
  | "xi_quote" // 习近平讲话金句
  | "ancient_quote" // 古代名言警句
  | "leader_quote" // 领导人论述
  | "celebrity_quote" // 名人名言
  // 案例素材子类型
  | "positive_case" // 正面典型案例
  | "negative_case" // 反面警示案例
  | "hot_event" // 热点事件分析
  // 优美语句子类型
  | "opening" // 开头句式
  | "transition" // 过渡句式
  | "ending" // 结尾句式
  | "argument" // 论证句式
  // 热点专题子类型
  | "annual_hot" // 年度热点
  | "theme_hot" // 主题热点
  | "hot_analysis" // 热点解读
  // 面试素材子类型
  | "politics_news" // 时政热点素材
  | "interview_case" // 答题案例库
  | "interview_quote"; // 面试金句库

// 素材状态
export type MaterialStatus = "draft" | "published" | "archived";

// 素材分类
export interface MaterialCategory {
  id: number;
  parent_id?: number;
  name: string;
  code: string;
  material_type: MaterialType;
  subject?: string;
  icon?: string;
  color: string;
  description?: string;
  sort_order: number;
  level: number;
  material_count: number;
  children?: MaterialCategory[];
}

// 素材详情
export interface LearningMaterial {
  id: number;
  category_id: number;
  type: MaterialType;
  sub_type?: MaterialSubType;
  title: string;
  content: string;
  source?: string;
  author?: string;
  year?: number;
  tags?: string[];
  keywords?: string[];
  theme_topics?: string[];
  subject?: string;
  analysis?: string;
  usage?: string;
  example?: string;
  translation?: string;
  background?: string;
  significance?: string;
  is_free: boolean;
  vip_only: boolean;
  is_hot: boolean;
  is_featured: boolean;
  view_count: number;
  collect_count: number;
  use_count: number;
  status: MaterialStatus;
  published_at?: string;
  created_at: string;
  updated_at: string;
  category?: MaterialCategory;
  is_collected?: boolean;
}

// 素材简要信息（列表用）
export interface MaterialBrief {
  id: number;
  category_id: number;
  type: MaterialType;
  sub_type?: MaterialSubType;
  title: string;
  content: string;
  source?: string;
  author?: string;
  year?: number;
  tags?: string[];
  theme_topics?: string[];
  subject?: string;
  is_free: boolean;
  vip_only: boolean;
  is_hot: boolean;
  is_featured: boolean;
  view_count: number;
  collect_count: number;
  status: MaterialStatus;
  created_at: string;
  category_name?: string;
}

// 素材统计
export interface MaterialStats {
  total_count: number;
  published_count: number;
  draft_count: number;
  quote_count: number;
  case_count: number;
  sentence_count: number;
  hot_topic_count: number;
  interview_count: number;
  knowledge_count: number;
  hot_count: number;
  featured_count: number;
  today_new_count: number;
  type_stats: { type: MaterialType; name: string; count: number }[];
  subject_stats: { subject: string; count: number }[];
}

// 查询参数
export interface MaterialQueryParams {
  category_id?: number;
  type?: MaterialType;
  sub_type?: MaterialSubType;
  subject?: string;
  status?: MaterialStatus;
  is_free?: boolean;
  vip_only?: boolean;
  is_hot?: boolean;
  is_featured?: boolean;
  year?: number;
  keyword?: string;
  tags?: string[];
  theme_topics?: string[];
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// 列表响应
export interface MaterialListResponse {
  materials: MaterialBrief[];
  total: number;
  page: number;
  page_size: number;
}

// 收藏列表响应
export interface MaterialCollectsResponse {
  materials: MaterialBrief[];
  total: number;
  page: number;
  page_size: number;
}

// =====================================================
// 素材类型和子类型名称映射
// =====================================================

export const materialTypeNames: Record<MaterialType, string> = {
  quote: "名言警句",
  case: "案例素材",
  sentence: "优美语句",
  hot_topic: "热点专题",
  interview: "面试素材",
  knowledge: "常识素材",
  formula: "公式速记",
  mnemonic: "记忆口诀",
  template: "答题模板",
  vocabulary: "词汇素材",
};

export const materialSubTypeNames: Record<MaterialSubType, string> = {
  xi_quote: "习近平讲话金句",
  ancient_quote: "古代名言警句",
  leader_quote: "领导人论述",
  celebrity_quote: "名人名言",
  positive_case: "正面典型案例",
  negative_case: "反面警示案例",
  hot_event: "热点事件分析",
  opening: "开头句式",
  transition: "过渡句式",
  ending: "结尾句式",
  argument: "论证句式",
  annual_hot: "年度热点",
  theme_hot: "主题热点",
  hot_analysis: "热点解读",
  politics_news: "时政热点素材",
  interview_case: "答题案例库",
  interview_quote: "面试金句库",
};

// 素材类型图标颜色
export const materialTypeColors: Record<
  MaterialType,
  { bg: string; text: string; gradient: string }
> = {
  quote: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    gradient: "from-amber-500 to-orange-500",
  },
  case: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    gradient: "from-blue-500 to-indigo-500",
  },
  sentence: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    gradient: "from-violet-500 to-purple-500",
  },
  hot_topic: {
    bg: "bg-red-50",
    text: "text-red-600",
    gradient: "from-red-500 to-rose-500",
  },
  interview: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    gradient: "from-emerald-500 to-teal-500",
  },
  knowledge: {
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    gradient: "from-cyan-500 to-sky-500",
  },
  formula: {
    bg: "bg-pink-50",
    text: "text-pink-600",
    gradient: "from-pink-500 to-rose-500",
  },
  mnemonic: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    gradient: "from-indigo-500 to-violet-500",
  },
  template: {
    bg: "bg-stone-50",
    text: "text-stone-600",
    gradient: "from-stone-500 to-slate-500",
  },
  vocabulary: {
    bg: "bg-lime-50",
    text: "text-lime-600",
    gradient: "from-lime-500 to-green-500",
  },
};

// =====================================================
// API 方法
// =====================================================

export const materialApi = {
  // 素材列表
  getMaterials: (params?: MaterialQueryParams) =>
    request.get<MaterialListResponse>("/materials", { params }),

  // 搜索素材
  searchMaterials: (keyword: string, params?: MaterialQueryParams) =>
    request.get<MaterialListResponse>("/materials/search", {
      params: { keyword, ...params },
    }),

  // 获取素材详情
  getMaterial: (id: number) => request.get<LearningMaterial>(`/materials/${id}`),

  // 获取热门素材
  getHotMaterials: (limit?: number) =>
    request.get<MaterialBrief[]>("/materials/hot", { params: { limit } }),

  // 获取精选素材
  getFeaturedMaterials: (limit?: number) =>
    request.get<MaterialBrief[]>("/materials/featured", { params: { limit } }),

  // 随机获取素材
  getRandomMaterials: (type?: MaterialType, count?: number) =>
    request.get<MaterialBrief[]>("/materials/random", {
      params: { type, count },
    }),

  // 按主题获取素材
  getMaterialsByThemeTopic: (topic: string, limit?: number) =>
    request.get<MaterialBrief[]>(`/materials/by-theme/${encodeURIComponent(topic)}`, {
      params: { limit },
    }),

  // 获取素材统计
  getMaterialStats: () => request.get<MaterialStats>("/materials/stats"),

  // 获取素材类型列表
  getMaterialTypes: () => request.get<Record<MaterialType, string>>("/materials/types"),

  // 获取素材子类型列表
  getMaterialSubTypes: () => request.get<Record<MaterialSubType, string>>("/materials/sub-types"),

  // 获取热点主题列表
  getThemeTopics: () => request.get<string[]>("/materials/theme-topics"),

  // =====================================================
  // 分类接口
  // =====================================================

  // 获取所有分类
  getCategories: () => request.get<{ categories: MaterialCategory[] }>("/materials/categories"),

  // 获取分类树
  getCategoryTree: () =>
    request.get<{ categories: MaterialCategory[] }>("/materials/categories/tree"),

  // 按素材类型获取分类
  getCategoriesByType: (type: MaterialType) =>
    request.get<{ categories: MaterialCategory[] }>(`/materials/categories/type/${type}`),

  // 按科目获取分类
  getCategoriesBySubject: (subject: string) =>
    request.get<{ categories: MaterialCategory[] }>(
      `/materials/categories/subject/${encodeURIComponent(subject)}`
    ),

  // 获取分类详情
  getCategory: (id: number) => request.get<MaterialCategory>(`/materials/categories/${id}`),

  // =====================================================
  // 收藏接口 (需要登录)
  // =====================================================

  // 收藏素材
  collectMaterial: (id: number) => request.post<{ message: string }>(`/materials/${id}/collect`),

  // 取消收藏素材
  uncollectMaterial: (id: number) =>
    request.delete<{ message: string }>(`/materials/${id}/collect`),

  // 获取我的收藏
  getMyCollects: (page?: number, pageSize?: number) =>
    request.get<MaterialCollectsResponse>("/materials/my/collects", {
      params: { page, page_size: pageSize },
    }),
};

export default materialApi;
