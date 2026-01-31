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

export type QuestionType = "single_choice" | "multi_choice" | "fill_blank" | "essay" | "material" | "judge";
export type QuestionSourceType = "real_exam" | "mock" | "original";
export type QuestionStatus = 0 | 1 | 2; // 0: draft, 1: published, 2: archived
export type PaperType = "real_exam" | "mock" | "daily" | "custom";
export type PaperStatus = 0 | 1 | 2; // 0: draft, 1: published, 2: archived

// 题目选项
export interface QuestionOption {
  key: string;
  content: string;
}

// 题目
export interface Question {
  id: number;
  category_id: number;
  question_type: QuestionType;
  difficulty: number;
  source_type: QuestionSourceType;
  source_year?: number;
  source_region?: string;
  source_exam?: string;
  content: string;
  material_id?: number;
  options?: QuestionOption[];
  answer: string;
  analysis?: string;
  tips?: string;
  knowledge_points?: number[];
  tags?: string[];
  attempt_count: number;
  correct_count: number;
  correct_rate: number;
  avg_time: number;
  is_vip: boolean;
  status: QuestionStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
  };
}

// 材料
export interface QuestionMaterial {
  id: number;
  title: string;
  content: string;
  content_type: "text" | "table" | "chart";
  source_year?: number;
  source_exam?: string;
  created_at: string;
  updated_at: string;
}

// 试卷题目
export interface PaperQuestion {
  question_id: number;
  score: number;
  order: number;
}

// 试卷分区
export interface PaperSection {
  name: string;
  question_ids: number[];
}

// 试卷
export interface ExamPaper {
  id: number;
  title: string;
  paper_type: PaperType;
  exam_type?: string;
  subject?: string;
  year?: number;
  region?: string;
  total_questions: number;
  total_score: number;
  time_limit: number;
  questions: PaperQuestion[];
  sections: PaperSection[];
  is_free: boolean;
  attempt_count: number;
  avg_score: number;
  status: PaperStatus;
  sort_order: number;
  description?: string;
  cover_image?: string;
  created_at: string;
  updated_at: string;
}

// 题库统计
export interface QuestionStats {
  total_questions: number;
  published_questions: number;
  draft_questions: number;
  total_papers: number;
  published_papers: number;
  total_attempts: number;
}

// ============================================
// Request/Response Types
// ============================================

export interface QuestionListParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  category_id?: number;
  question_type?: QuestionType;
  difficulty?: number;
  source_type?: QuestionSourceType;
  source_year?: number;
  source_region?: string;
  is_vip?: boolean;
  status?: QuestionStatus;
}

export interface PaperListParams {
  page?: number;
  page_size?: number;
  keyword?: string;
  paper_type?: PaperType;
  exam_type?: string;
  subject?: string;
  year?: number;
  region?: string;
  is_free?: boolean;
  status?: PaperStatus;
}

export interface MaterialListParams {
  page?: number;
  page_size?: number;
}

export interface CreateQuestionRequest {
  category_id: number;
  question_type: QuestionType;
  difficulty: number;
  source_type: QuestionSourceType;
  source_year?: number;
  source_region?: string;
  source_exam?: string;
  content: string;
  material_id?: number;
  options?: QuestionOption[];
  answer: string;
  analysis?: string;
  tips?: string;
  knowledge_points?: number[];
  tags?: string[];
  is_vip?: boolean;
  status?: QuestionStatus;
  sort_order?: number;
}

export interface UpdateQuestionRequest {
  category_id?: number;
  question_type?: QuestionType;
  difficulty?: number;
  source_type?: QuestionSourceType;
  source_year?: number;
  source_region?: string;
  source_exam?: string;
  content?: string;
  material_id?: number;
  options?: QuestionOption[];
  answer?: string;
  analysis?: string;
  tips?: string;
  knowledge_points?: number[];
  tags?: string[];
  is_vip?: boolean;
  status?: QuestionStatus;
  sort_order?: number;
}

export interface CreatePaperRequest {
  title: string;
  paper_type: PaperType;
  exam_type?: string;
  subject?: string;
  year?: number;
  region?: string;
  total_score?: number;
  time_limit?: number;
  questions?: PaperQuestion[];
  sections?: PaperSection[];
  is_free?: boolean;
  status?: PaperStatus;
  description?: string;
  cover_image?: string;
}

export interface UpdatePaperRequest {
  title?: string;
  paper_type?: PaperType;
  exam_type?: string;
  subject?: string;
  year?: number;
  region?: string;
  total_score?: number;
  time_limit?: number;
  questions?: PaperQuestion[];
  sections?: PaperSection[];
  is_free?: boolean;
  status?: PaperStatus;
  description?: string;
  cover_image?: string;
}

export interface CreateMaterialRequest {
  title: string;
  content: string;
  content_type: "text" | "table" | "chart";
  source_year?: number;
  source_exam?: string;
}

export interface UpdateMaterialRequest {
  title?: string;
  content?: string;
  content_type?: "text" | "table" | "chart";
  source_year?: number;
  source_exam?: string;
}

// ============================================
// API
// ============================================

export const questionApi = {
  // =============== 题目管理 ===============
  
  // 获取题目列表
  getQuestions: (params?: QuestionListParams) => {
    return request.get<{
      questions: Question[];
      total: number;
      page: number;
      page_size: number;
    }>("/admin/questions", { params });
  },

  // 获取单个题目
  getQuestion: (id: number) => {
    return request.get<Question>(`/questions/${id}`);
  },

  // 创建题目
  createQuestion: (data: CreateQuestionRequest) => {
    return request.post<Question>("/admin/questions", data);
  },

  // 更新题目
  updateQuestion: (id: number, data: UpdateQuestionRequest) => {
    return request.put<Question>(`/admin/questions/${id}`, data);
  },

  // 删除题目
  deleteQuestion: (id: number) => {
    return request.delete<{ message: string }>(`/admin/questions/${id}`);
  },

  // 批量创建题目
  batchCreateQuestions: (questions: CreateQuestionRequest[]) => {
    return request.post<{ message: string; count: number }>("/admin/questions/batch", questions);
  },

  // =============== 试卷管理 ===============
  
  // 获取试卷列表
  getPapers: (params?: PaperListParams) => {
    return request.get<{
      papers: ExamPaper[];
      total: number;
      page: number;
      page_size: number;
    }>("/admin/papers", { params });
  },

  // 获取单个试卷
  getPaper: (id: number) => {
    return request.get<ExamPaper>(`/papers/${id}`);
  },

  // 创建试卷
  createPaper: (data: CreatePaperRequest) => {
    return request.post<ExamPaper>("/admin/papers", data);
  },

  // 更新试卷
  updatePaper: (id: number, data: UpdatePaperRequest) => {
    return request.put<ExamPaper>(`/admin/papers/${id}`, data);
  },

  // 删除试卷
  deletePaper: (id: number) => {
    return request.delete<{ message: string }>(`/admin/papers/${id}`);
  },

  // =============== 材料管理 ===============
  
  // 获取材料列表
  getMaterials: (params?: MaterialListParams) => {
    return request.get<{
      materials: QuestionMaterial[];
      total: number;
      page: number;
      page_size: number;
    }>("/admin/materials", { params });
  },

  // 获取单个材料
  getMaterial: (id: number) => {
    return request.get<QuestionMaterial>(`/admin/materials/${id}`);
  },

  // 创建材料
  createMaterial: (data: CreateMaterialRequest) => {
    return request.post<QuestionMaterial>("/admin/materials", data);
  },

  // 更新材料
  updateMaterial: (id: number, data: UpdateMaterialRequest) => {
    return request.put<QuestionMaterial>(`/admin/materials/${id}`, data);
  },

  // 删除材料
  deleteMaterial: (id: number) => {
    return request.delete<{ message: string }>(`/admin/materials/${id}`);
  },

  // =============== AI 辅助生成 ===============
  
  // AI生成题目
  aiGenerateQuestions: (params: AIGenerateRequest) => {
    return request.post<AIGenerateResponse>("/admin/questions/ai/generate", params);
  },

  // 保存AI生成的题目
  aiSaveQuestions: (data: AISaveQuestionsRequest) => {
    return request.post<{ success: number; total: number }>("/admin/questions/ai/save", data);
  },
};

// AI生成请求
export interface AIGenerateRequest {
  category_id: number;
  question_type: QuestionType;
  difficulty: number;
  count: number;
  topic?: string;
  source_type?: QuestionSourceType;
  source_year?: number;
}

// AI生成的题目
export interface AIGeneratedQuestion {
  content: string;
  options?: QuestionOption[];
  answer: string;
  analysis: string;
  tips?: string;
  difficulty: number;
  tags?: string[];
}

// AI生成响应
export interface AIGenerateResponse {
  questions: AIGeneratedQuestion[];
  count: number;
  category: string;
}

// 保存AI生成的题目请求
export interface AISaveQuestionsRequest {
  category_id: number;
  source_type?: QuestionSourceType;
  source_year?: number;
  questions: AIGeneratedQuestion[];
}

// ============================================
// Helper Functions
// ============================================

export const getQuestionTypeName = (type: QuestionType): string => {
  const names: Record<QuestionType, string> = {
    single_choice: "单选题",
    multi_choice: "多选题",
    fill_blank: "填空题",
    essay: "简答题",
    material: "材料题",
    judge: "判断题",
  };
  return names[type] || type;
};

export const getQuestionTypeIcon = (type: QuestionType): string => {
  const icons: Record<QuestionType, string> = {
    single_choice: "○",
    multi_choice: "☐",
    fill_blank: "___",
    essay: "📝",
    material: "📄",
    judge: "✓✗",
  };
  return icons[type] || "?";
};

export const getSourceTypeName = (type: QuestionSourceType): string => {
  const names: Record<QuestionSourceType, string> = {
    real_exam: "真题",
    mock: "模拟题",
    original: "原创题",
  };
  return names[type] || type;
};

export const getDifficultyLabel = (difficulty: number): string => {
  const labels: Record<number, string> = {
    1: "入门",
    2: "简单",
    3: "中等",
    4: "困难",
    5: "极难",
  };
  return labels[difficulty] || `难度${difficulty}`;
};

export const getDifficultyColor = (difficulty: number): string => {
  const colors: Record<number, string> = {
    1: "bg-green-100 text-green-700",
    2: "bg-blue-100 text-blue-700",
    3: "bg-amber-100 text-amber-700",
    4: "bg-orange-100 text-orange-700",
    5: "bg-red-100 text-red-700",
  };
  return colors[difficulty] || "bg-gray-100 text-gray-700";
};

export const getQuestionStatusLabel = (status: QuestionStatus): string => {
  const labels: Record<QuestionStatus, string> = {
    0: "草稿",
    1: "已发布",
    2: "已归档",
  };
  return labels[status] || "未知";
};

export const getPaperTypeName = (type: PaperType): string => {
  const names: Record<PaperType, string> = {
    real_exam: "真题卷",
    mock: "模拟卷",
    daily: "每日练习",
    custom: "自定义",
  };
  return names[type] || type;
};

export const getPaperStatusLabel = (status: PaperStatus): string => {
  const labels: Record<PaperStatus, string> = {
    0: "草稿",
    1: "已发布",
    2: "已归档",
  };
  return labels[status] || "未知";
};

export const getExamTypeOptions = () => [
  { value: "guokao", label: "国考" },
  { value: "shengkao", label: "省考" },
  { value: "shiyedanwei", label: "事业单位" },
  { value: "xuandiao", label: "选调" },
  { value: "junduiwenzhi", label: "军队文职" },
];

export const getSubjectOptions = () => [
  { value: "xingce", label: "行测" },
  { value: "shenlun", label: "申论" },
  { value: "mianshi", label: "面试" },
  { value: "gongji", label: "公基" },
];

export const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 10; i--) {
    years.push({ value: i, label: `${i}年` });
  }
  return years;
};

// 知识点分类选项
export const getCategoryOptions = () => ({
  xingce: {
    label: "行测",
    children: [
      { value: "yanyu", label: "言语理解与表达" },
      { value: "panduan", label: "判断推理" },
      { value: "shuliang", label: "数量关系" },
      { value: "ziliao", label: "资料分析" },
      { value: "changshi", label: "常识判断" },
    ],
  },
  shenlun: {
    label: "申论",
    children: [
      { value: "guina", label: "归纳概括" },
      { value: "duice", label: "提出对策" },
      { value: "fenxi", label: "综合分析" },
      { value: "guanche", label: "贯彻执行" },
      { value: "xiezuo", label: "申发论述" },
    ],
  },
  mianshi: {
    label: "面试",
    children: [
      { value: "zonghefenxi", label: "综合分析" },
      { value: "jihua", label: "计划组织" },
      { value: "renji", label: "人际关系" },
      { value: "yingji", label: "应急应变" },
      { value: "ziwo", label: "自我认知" },
    ],
  },
  gongji: {
    label: "公基",
    children: [
      { value: "zhengzhi", label: "政治" },
      { value: "falv", label: "法律" },
      { value: "jingji", label: "经济" },
      { value: "gongwen", label: "公文" },
      { value: "guanli", label: "管理" },
      { value: "keji", label: "科技人文" },
    ],
  },
});
