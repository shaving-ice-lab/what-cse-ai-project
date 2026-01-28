import { apiRequest } from "./api";

// =====================================================
// Types
// =====================================================

export type TaskStatus = "pending" | "processing" | "completed" | "failed";
export type TaskType = "category" | "course" | "chapter" | "knowledge" | "bulk" | "template" | "ai_generate" | "import";

export interface ContentTask {
  id: number;
  task_type: TaskType;
  status: TaskStatus;
  subject?: string;
  template_name?: string;
  total_items: number;
  processed_items: number;
  success_items: number;
  failed_items: number;
  error_message?: string;
  progress: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface ContentStats {
  total_categories: number;
  total_courses: number;
  total_chapters: number;
  total_knowledge_points: number;
  total_questions?: number;
  total_materials?: number;
  // Coverage stats
  category_coverage?: { [key: string]: number };
  difficulty_distribution?: { [key: string]: number };
  source_distribution?: { [key: string]: number };
  // Quality stats
  avg_correct_rate?: number;
  avg_discrimination?: number;
  questions_with_analysis?: number;
  questions_without_analysis?: number;
}

export interface CourseTemplate {
  id: number;
  name: string;
  subject: string;
  exam_type?: string;
  description?: string;
  is_builtin: boolean;
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

export interface SubjectStructure {
  subject: string;
  subject_name: string;
  structure: { [key: string]: string[] };
}

// Batch create request types
export interface BatchCreateCategoryItem {
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
  children?: BatchCreateCategoryItem[];
}

export interface BatchCreateCategoryRequest {
  subject: string;
  exam_type?: string;
  items: BatchCreateCategoryItem[];
}

export interface BatchCreateChapterItem {
  title: string;
  content_type?: string;
  content_url?: string;
  content_text?: string;
  duration?: number;
  is_free_preview?: boolean;
  children?: BatchCreateChapterItem[];
}

export interface BatchCreateCourseItem {
  title: string;
  subtitle?: string;
  description?: string;
  cover_image?: string;
  duration?: number;
  tags?: string[];
  chapters?: BatchCreateChapterItem[];
}

export interface BatchCreateCourseRequest {
  category_id: number;
  content_type?: string;
  difficulty?: string;
  teacher_name?: string;
  is_free?: boolean;
  vip_only?: boolean;
  status?: string;
  items: BatchCreateCourseItem[];
}

export interface BatchCreateKnowledgeItem {
  code: string;
  name: string;
  description?: string;
  importance?: number;
  frequency?: string;
  tips?: string;
  related_courses?: number[];
  children?: BatchCreateKnowledgeItem[];
}

export interface BatchCreateKnowledgeRequest {
  category_id: number;
  items: BatchCreateKnowledgeItem[];
}

// AI content generation types
export interface AIGenerateRequest {
  generate_type: "question_analysis" | "knowledge_summary" | "similar_questions" | "material_classify";
  target_ids?: number[];
  options?: {
    batch_size?: number;
    model?: string;
    overwrite?: boolean;
  };
}

// Import types
export interface ImportRequest {
  import_type: "questions" | "courses" | "materials" | "knowledge_points";
  file_format: "excel" | "json" | "csv";
  data: string; // Base64 encoded data or JSON string
  options?: {
    skip_duplicates?: boolean;
    category_id?: number;
    auto_publish?: boolean;
  };
}

// Quality check types
export interface QualityCheckResult {
  id: number;
  check_type: "typo" | "format" | "duplicate" | "coverage" | "difficulty";
  target_type: "question" | "course" | "material";
  target_id: number;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
  created_at: string;
}

// =====================================================
// API Functions
// =====================================================

export const contentGeneratorApi = {
  // Stats
  getStats: async (): Promise<ContentStats> => {
    const res = await apiRequest<{ data: ContentStats }>("/api/v1/admin/generator/stats");
    return res.data;
  },

  // Tasks
  getTasks: async (params?: { page?: number; page_size?: number; status?: TaskStatus }): Promise<{
    tasks: ContentTask[];
    total: number;
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.page_size) query.set("page_size", params.page_size.toString());
    if (params?.status) query.set("status", params.status);
    
    const res = await apiRequest<{ data: { tasks: ContentTask[]; total: number } }>(
      `/api/v1/admin/generator/tasks?${query.toString()}`
    );
    return res.data;
  },

  getTask: async (id: number): Promise<ContentTask> => {
    const res = await apiRequest<{ data: ContentTask }>(`/api/v1/admin/generator/tasks/${id}`);
    return res.data;
  },

  // Batch create
  batchCreateCategories: async (req: BatchCreateCategoryRequest): Promise<ContentTask> => {
    const res = await apiRequest<{ data: ContentTask }>("/api/v1/admin/generator/categories/batch", {
      method: "POST",
      body: JSON.stringify(req),
    });
    return res.data;
  },

  batchCreateCourses: async (req: BatchCreateCourseRequest): Promise<ContentTask> => {
    const res = await apiRequest<{ data: ContentTask }>("/api/v1/admin/generator/courses/batch", {
      method: "POST",
      body: JSON.stringify(req),
    });
    return res.data;
  },

  batchCreateKnowledgePoints: async (req: BatchCreateKnowledgeRequest): Promise<ContentTask> => {
    const res = await apiRequest<{ data: ContentTask }>("/api/v1/admin/generator/knowledge/batch", {
      method: "POST",
      body: JSON.stringify(req),
    });
    return res.data;
  },

  // Quick generate
  quickGenerateCategories: async (subject: string): Promise<ContentTask> => {
    const res = await apiRequest<{ data: ContentTask }>("/api/v1/admin/generator/quick/categories", {
      method: "POST",
      body: JSON.stringify({ subject }),
    });
    return res.data;
  },

  quickGenerateCourses: async (subject: string, categoryId: number): Promise<ContentTask> => {
    const res = await apiRequest<{ data: ContentTask }>("/api/v1/admin/generator/quick/courses", {
      method: "POST",
      body: JSON.stringify({ subject, category_id: categoryId }),
    });
    return res.data;
  },

  // Templates
  getTemplates: async (subject?: string): Promise<{ templates: CourseTemplate[]; total: number }> => {
    const query = subject ? `?subject=${subject}` : "";
    const res = await apiRequest<{ data: { templates: CourseTemplate[]; total: number } }>(
      `/api/v1/admin/generator/templates${query}`
    );
    return res.data;
  },

  getTemplate: async (id: number): Promise<CourseTemplate> => {
    const res = await apiRequest<{ data: CourseTemplate }>(`/api/v1/admin/generator/templates/${id}`);
    return res.data;
  },

  createTemplate: async (template: Partial<CourseTemplate> & { structure: string }): Promise<CourseTemplate> => {
    const res = await apiRequest<{ data: CourseTemplate }>("/api/v1/admin/generator/templates", {
      method: "POST",
      body: JSON.stringify(template),
    });
    return res.data;
  },

  updateTemplate: async (id: number, template: Partial<CourseTemplate>): Promise<CourseTemplate> => {
    const res = await apiRequest<{ data: CourseTemplate }>(`/api/v1/admin/generator/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(template),
    });
    return res.data;
  },

  deleteTemplate: async (id: number): Promise<void> => {
    await apiRequest(`/api/v1/admin/generator/templates/${id}`, {
      method: "DELETE",
    });
  },

  // Generate from template
  generateFromTemplate: async (templateId: number, options?: { subject?: string; exam_type?: string }): Promise<ContentTask> => {
    const res = await apiRequest<{ data: ContentTask }>("/api/v1/admin/generator/from-template", {
      method: "POST",
      body: JSON.stringify({ template_id: templateId, ...options }),
    });
    return res.data;
  },

  // Subject structure
  getSubjectStructure: async (subject: string): Promise<SubjectStructure> => {
    const res = await apiRequest<{ data: SubjectStructure }>(`/api/v1/admin/generator/structures/${subject}`);
    return res.data;
  },

  // AI Content Generation
  generateAIContent: async (req: AIGenerateRequest): Promise<ContentTask> => {
    const res = await apiRequest<{ data: ContentTask }>("/api/v1/admin/generator/ai/generate", {
      method: "POST",
      body: JSON.stringify(req),
    });
    return res.data;
  },

  // Import
  importContent: async (req: ImportRequest): Promise<ContentTask> => {
    const res = await apiRequest<{ data: ContentTask }>("/api/v1/admin/generator/import", {
      method: "POST",
      body: JSON.stringify(req),
    });
    return res.data;
  },

  // Quality check
  runQualityCheck: async (checkType: string, targetType: string): Promise<ContentTask> => {
    const res = await apiRequest<{ data: ContentTask }>("/api/v1/admin/generator/quality/check", {
      method: "POST",
      body: JSON.stringify({ check_type: checkType, target_type: targetType }),
    });
    return res.data;
  },

  getQualityResults: async (params?: { 
    page?: number; 
    page_size?: number;
    check_type?: string;
    severity?: string;
  }): Promise<{ results: QualityCheckResult[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.page_size) query.set("page_size", params.page_size.toString());
    if (params?.check_type) query.set("check_type", params.check_type);
    if (params?.severity) query.set("severity", params.severity);
    
    const res = await apiRequest<{ data: { results: QualityCheckResult[]; total: number } }>(
      `/api/v1/admin/generator/quality/results?${query.toString()}`
    );
    return res.data;
  },

  // Coverage statistics
  getCoverageStats: async (subject?: string): Promise<{
    course_coverage: { category: string; count: number; total_duration: number }[];
    question_coverage: { category: string; count: number; by_difficulty: { [key: string]: number } }[];
    knowledge_coverage: { category: string; total: number; with_content: number }[];
    material_coverage: { type: string; count: number }[];
  }> => {
    const query = subject ? `?subject=${subject}` : "";
    const res = await apiRequest<{ data: any }>(`/api/v1/admin/generator/stats/coverage${query}`);
    return res.data;
  },

  // Quality statistics  
  getQualityStats: async (): Promise<{
    question_quality: {
      total: number;
      with_analysis: number;
      avg_correct_rate: number;
      avg_discrimination: number;
      difficulty_distribution: { [key: string]: number };
    };
    course_quality: {
      total: number;
      avg_rating: number;
      avg_completion_rate: number;
      by_status: { [key: string]: number };
    };
  }> => {
    const res = await apiRequest<{ data: any }>("/api/v1/admin/generator/stats/quality");
    return res.data;
  },
};

// Helper functions
export const getTaskStatusLabel = (status: TaskStatus): string => {
  const labels: Record<TaskStatus, string> = {
    pending: "待处理",
    processing: "处理中",
    completed: "已完成",
    failed: "失败",
  };
  return labels[status] || status;
};

export const getTaskTypeLabel = (type: TaskType): string => {
  const labels: Record<TaskType, string> = {
    category: "分类生成",
    course: "课程生成",
    chapter: "章节生成",
    knowledge: "知识点生成",
    bulk: "批量导入",
    template: "模板生成",
    ai_generate: "AI生成",
    import: "数据导入",
  };
  return labels[type] || type;
};

export const getSubjectLabel = (subject: string): string => {
  const labels: Record<string, string> = {
    xingce: "行测",
    shenlun: "申论",
    mianshi: "面试",
    gongji: "公基",
  };
  return labels[subject] || subject;
};
