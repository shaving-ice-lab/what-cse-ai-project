import request from "./api";
import { useAuthStore } from "@/stores/authStore";

// Helper function to make API requests
const apiRequest = async <T>(url: string, options?: RequestInit): Promise<T> => {
  if (options?.method === "POST" || options?.method === "PUT" || options?.method === "PATCH") {
    const body = options.body ? JSON.parse(options.body as string) : undefined;
    return request.post<T>(url, body);
  } else if (options?.method === "DELETE") {
    return request.delete<T>(url);
  } else {
    return request.get<T>(url);
  }
};

// =====================================================
// Types
// =====================================================

export type TaskStatus = "pending" | "processing" | "generating" | "completed" | "failed";
export type TaskType = "category" | "course" | "chapter" | "knowledge" | "bulk" | "template" | "ai_generate" | "import";

export interface ContentTask {
  id: number;
  task_source?: "content" | "llm" | string;
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

// Subject definitions
export type Subject = 'xingce' | 'shenlun' | 'mianshi' | 'gongji';

export const SUBJECTS: { value: Subject; label: string; icon: string; hours: number; modules: number }[] = [
  { value: 'xingce', label: '行测', icon: '🧮', hours: 280, modules: 5 },
  { value: 'shenlun', label: '申论', icon: '📝', hours: 120, modules: 6 },
  { value: 'mianshi', label: '面试', icon: '🎤', hours: 100, modules: 8 },
  { value: 'gongji', label: '公基', icon: '📚', hours: 80, modules: 4 },
];

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
  prompt?: string; // Custom prompt template (optional, will use default if not provided)
  target_ids?: number[];
  target_data?: Record<string, string>; // 目标数据（如题目内容、知识点信息等）
  options?: {
    batch_size?: number;
    model?: string;
    overwrite?: boolean;
  };
}

// AI 生成任务响应
export interface AIGenerateTaskResponse {
  task_id: number;
  generate_type: string;
  status: string;
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

// Course tree types (for content generation page)
export interface CourseTreeChapterNode {
  id: number;
  title: string;
  course_id: number;
  has_content: boolean;
}

export interface CourseTreeCourseNode {
  id: number;
  title: string;
  category_id: number;
  chapters?: CourseTreeChapterNode[];
  chapter_count?: number;
  has_chapters?: boolean;
  pending_count?: number;
}

export interface CourseTreeCategoryNode {
  id: number;
  name: string;
  subject: string;
  children?: CourseTreeCategoryNode[];
  courses?: CourseTreeCourseNode[];
  has_children?: boolean;
  has_courses?: boolean;
  pending_count?: number;
}

export interface CourseTreeSummary {
  categories: number;
  courses: number;
  chapters: number;
  pending: number;
}

export interface CourseTreeSubjectNode {
  subject: string;
  name: string;
  categories: CourseTreeCategoryNode[];
  summary?: CourseTreeSummary;
}

export interface CourseTreeResponse {
  subjects: CourseTreeSubjectNode[];
}

export interface CourseTreeCategoryChildrenResponse {
  category_id: number;
  children: CourseTreeCategoryNode[];
  courses: CourseTreeCourseNode[];
}

export interface CourseTreeCourseChaptersResponse {
  course_id: number;
  chapters: CourseTreeChapterNode[];
  chapter_count: number;
  pending_count: number;
}

// Batch generate request/response
// 注意：skip_existing 由前端在调用前过滤待生成章节，后端不处理此字段
export interface BatchGenerateChapterLessonsRequest {
  chapter_ids: number[];
  subject?: string;
  auto_approve?: boolean;
  auto_import?: boolean;
  // 从前端传入的 prompt（可选，如果不传则使用后端默认）
  system_prompt?: string;
  user_prompt_template?: string;
}

export interface BatchGenerateResult {
  total_tasks: number;
  created_tasks: number;
  skipped_tasks: number;
  task_ids: number[];
  skipped_reasons?: string[];
}

export interface GenerateChapterLessonRequest {
  chapter_id: number;
  chapter_title?: string;
  subject?: string;
  knowledge_point?: string;
  auto_approve?: boolean;
  auto_import?: boolean;
  // 从前端传入的 prompt（可选，如果不传则使用后端默认）
  system_prompt?: string;
  user_prompt_template?: string;
}

export interface GenerateCourseLessonsRequest {
  course_id: number;
  subject?: string;
  auto_approve?: boolean;
  auto_import?: boolean;
  skip_existing?: boolean;
  // 从前端传入的 prompt（可选）
  system_prompt?: string;
  user_prompt_template?: string;
}

export interface GenerateCategoryLessonsRequest {
  category_id: number;
  subject?: string;
  auto_approve?: boolean;
  auto_import?: boolean;
  skip_existing?: boolean;
  include_sub_categories?: boolean;
  // 从前端传入的 prompt（可选）
  system_prompt?: string;
  user_prompt_template?: string;
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

// Generated content types (for listing already generated content)
export type AIContentType = "chapter_lesson" | "question_analysis" | "knowledge_summary" | "course_preview" | "material_content";
export type AIContentStatus = "pending" | "approved" | "rejected" | "imported";
export type AIRelatedType = "chapter" | "question" | "knowledge_point" | "course" | "material";

export interface GeneratedContentItem {
  id: number;
  content_type: AIContentType;
  related_type: AIRelatedType;
  related_id: number;
  title?: string;
  content: any;
  quality_score: number;
  status: AIContentStatus;
  version: number;
  generated_at: string;
}

export interface GeneratedContentListResponse {
  contents: GeneratedContentItem[];
  total: number;
  page: number;
  page_size: number;
}

// LLM Config types (for model selection)
export interface LLMConfigOption {
  id: number;
  name: string;
  provider: string;
  model: string;
  is_default?: boolean;
}

// Prompt preview info
export interface PromptPreviewInfo {
  system_prompt: string;
  user_prompt_template: string;
  variables: string[];
}

// =====================================================
// API Functions
// =====================================================

export const contentGeneratorApi = {
  // Stats
  getStats: async (): Promise<ContentStats> => {
    return apiRequest<ContentStats>("/admin/generator/stats");
  },

  // Tasks
  getTasks: async (params?: { page?: number; page_size?: number; status?: TaskStatus; session_only?: boolean }): Promise<{
    tasks: ContentTask[];
    total: number;
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.page_size) query.set("page_size", params.page_size.toString());
    if (params?.status) query.set("status", params.status);
    if (params?.session_only) query.set("session_only", "1");
    
    return apiRequest<{ tasks: ContentTask[]; total: number }>(
      `/admin/generator/tasks?${query.toString()}`
    );
  },

  getTask: async (id: number): Promise<ContentTask | null> => {
    try {
      // Note: This endpoint returns task directly without wrapping in {code, data}
      // So we need to make a direct fetch call with auth token
      const { adminToken } = useAuthStore.getState();
      const response = await fetch(`/api/v1/admin/generator/tasks/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(adminToken && { Authorization: `Bearer ${adminToken}` }),
        },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  },

  // Batch create
  batchCreateCategories: async (req: BatchCreateCategoryRequest): Promise<ContentTask> => {
    return apiRequest<ContentTask>("/admin/generator/categories/batch", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  batchCreateCourses: async (req: BatchCreateCourseRequest): Promise<ContentTask> => {
    return apiRequest<ContentTask>("/admin/generator/courses/batch", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  batchCreateKnowledgePoints: async (req: BatchCreateKnowledgeRequest): Promise<ContentTask> => {
    return apiRequest<ContentTask>("/admin/generator/knowledge/batch", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  // Quick generate
  quickGenerateCategories: async (subject: string): Promise<ContentTask> => {
    return apiRequest<ContentTask>("/admin/generator/quick/categories", {
      method: "POST",
      body: JSON.stringify({ subject }),
    });
  },

  quickGenerateCourses: async (subject: string, categoryId: number): Promise<ContentTask> => {
    return apiRequest<ContentTask>("/admin/generator/quick/courses", {
      method: "POST",
      body: JSON.stringify({ subject, category_id: categoryId }),
    });
  },

  // AI Generate Knowledge Points (uses LLM to generate and returns for preview)
  aiGenerateKnowledgePoints: async (req: {
    category_id: number;
    subject: string;
    topic?: string;
    count: number;
  }): Promise<{ items: BatchCreateKnowledgeItem[]; count: number }> => {
    return apiRequest<{ items: BatchCreateKnowledgeItem[]; count: number }>("/admin/generator/ai/knowledge-points", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  // Templates
  getTemplates: async (subject?: string): Promise<{ templates: CourseTemplate[]; total: number }> => {
    const query = subject ? `?subject=${subject}` : "";
    return apiRequest<{ templates: CourseTemplate[]; total: number }>(
      `/admin/generator/templates${query}`
    );
  },

  getTemplate: async (id: number): Promise<CourseTemplate> => {
    return apiRequest<CourseTemplate>(`/admin/generator/templates/${id}`);
  },

  createTemplate: async (template: Partial<CourseTemplate> & { structure: string }): Promise<CourseTemplate> => {
    return apiRequest<CourseTemplate>("/admin/generator/templates", {
      method: "POST",
      body: JSON.stringify(template),
    });
  },

  updateTemplate: async (id: number, template: Partial<CourseTemplate>): Promise<CourseTemplate> => {
    return apiRequest<CourseTemplate>(`/admin/generator/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(template),
    });
  },

  deleteTemplate: async (id: number): Promise<void> => {
    await apiRequest(`/admin/generator/templates/${id}`, {
      method: "DELETE",
    });
  },

  // Generate from template
  generateFromTemplate: async (templateId: number, options?: { subject?: string; exam_type?: string }): Promise<ContentTask> => {
    return apiRequest<ContentTask>("/admin/generator/from-template", {
      method: "POST",
      body: JSON.stringify({ template_id: templateId, ...options }),
    });
  },

  // Subject structure
  getSubjectStructure: async (subject: string): Promise<SubjectStructure> => {
    return apiRequest<SubjectStructure>(`/admin/generator/structures/${subject}`);
  },

  // Course tree (for content generation page)
  getCourseTree: async (): Promise<CourseTreeResponse> => {
    return apiRequest<CourseTreeResponse>("/admin/generator/course-tree");
  },

  // Course tree roots (lazy loading)
  getCourseTreeRoots: async (): Promise<CourseTreeResponse> => {
    return apiRequest<CourseTreeResponse>("/admin/generator/course-tree/roots");
  },

  // Category children and courses (lazy loading)
  getCourseTreeCategoryChildren: async (
    categoryId: number
  ): Promise<CourseTreeCategoryChildrenResponse> => {
    return apiRequest<CourseTreeCategoryChildrenResponse>(
      `/admin/generator/course-tree/categories/${categoryId}`
    );
  },

  // Course chapters (lazy loading)
  getCourseTreeCourseChapters: async (
    courseId: number
  ): Promise<CourseTreeCourseChaptersResponse> => {
    return apiRequest<CourseTreeCourseChaptersResponse>(
      `/admin/generator/course-tree/courses/${courseId}/chapters`
    );
  },

  // Batch generate chapter lessons (by chapter IDs)
  batchGenerateChapterLessons: async (req: BatchGenerateChapterLessonsRequest): Promise<BatchGenerateResult> => {
    return apiRequest<BatchGenerateResult>(
      "/admin/generator/generate/chapter-lessons-batch",
      { method: "POST", body: JSON.stringify(req) }
    );
  },

  // Single chapter lesson (ai-content V2)
  generateChapterLesson: async (req: GenerateChapterLessonRequest): Promise<{ task: ContentTask }> => {
    return apiRequest<{ task: ContentTask }>(
      "/admin/ai-content/generate/chapter-lesson",
      { method: "POST", body: JSON.stringify(req) }
    );
  },

  // Course lessons batch (ai-content V2)
  generateCourseLessons: async (req: GenerateCourseLessonsRequest): Promise<BatchGenerateResult> => {
    return apiRequest<BatchGenerateResult>(
      "/admin/ai-content/generate/course-lessons",
      { method: "POST", body: JSON.stringify(req) }
    );
  },

  // Category lessons batch (ai-content V2)
  generateCategoryLessons: async (req: GenerateCategoryLessonsRequest): Promise<BatchGenerateResult> => {
    return apiRequest<BatchGenerateResult>(
      "/admin/ai-content/generate/category-lessons",
      { method: "POST", body: JSON.stringify(req) }
    );
  },

  // Enrich category description with AI
  enrichCategoryDescription: async (categoryId: number): Promise<any> => {
    return apiRequest<any>(`/admin/generator/categories/${categoryId}/enrich`, {
      method: "POST",
    });
  },

  // AI Content Generation (使用真实 LLM 生成)
  generateAIContent: async (req: AIGenerateRequest): Promise<AIGenerateTaskResponse> => {
    return apiRequest<AIGenerateTaskResponse>("/admin/generator/ai/generate", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  // Import
  importContent: async (req: ImportRequest): Promise<ContentTask> => {
    return apiRequest<ContentTask>("/admin/generator/import", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  // Quality check
  runQualityCheck: async (checkType: string, targetType: string): Promise<ContentTask> => {
    return apiRequest<ContentTask>("/admin/generator/quality/check", {
      method: "POST",
      body: JSON.stringify({ check_type: checkType, target_type: targetType }),
    });
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
    
    return apiRequest<{ results: QualityCheckResult[]; total: number }>(
      `/admin/generator/quality/results?${query.toString()}`
    );
  },

  // Coverage statistics
  getCoverageStats: async (subject?: string): Promise<{
    course_coverage: { category: string; count: number; total_duration: number }[];
    question_coverage: { category: string; count: number; by_difficulty: { [key: string]: number } }[];
    knowledge_coverage: { category: string; total: number; with_content: number }[];
    material_coverage: { type: string; count: number }[];
  }> => {
    const query = subject ? `?subject=${subject}` : "";
    return apiRequest<any>(`/admin/generator/stats/coverage${query}`);
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
    return apiRequest<any>("/admin/generator/stats/quality");
  },

  // LLM Config options (for model selection)
  getLLMConfigOptions: async (): Promise<LLMConfigOption[]> => {
    const res = await apiRequest<{ options: LLMConfigOption[] }>("/admin/llm-configs/options");
    return res.options || [];
  },

  // Get chapter content (for test preview)
  getChapterContent: async (chapterId: number): Promise<any> => {
    return apiRequest<any>(`/courses/chapters/${chapterId}/content`);
  },

  // Delete chapter content (clear generated content)
  deleteChapterContent: async (chapterId: number): Promise<void> => {
    await apiRequest<void>(`/admin/courses/chapters/${chapterId}/content`, {
      method: "DELETE",
    });
  },

  // Clear all chapter contents (delete all generated classroom data)
  clearAllChapterContents: async (): Promise<{ message: string; affected: number }> => {
    return apiRequest<{ message: string; affected: number }>("/admin/courses/chapters/all/content", {
      method: "DELETE",
    });
  },

  // Get generation task by ID (uses ai-content endpoint for LLM generation tasks)
  getGenerationTask: async (taskId: number): Promise<any> => {
    try {
      const { adminToken } = useAuthStore.getState();
      const response = await fetch(`/api/v1/admin/ai-content/tasks/${taskId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(adminToken && { Authorization: `Bearer ${adminToken}` }),
        },
      });
      if (!response.ok) return null;
      const result = await response.json();
      // Backend wraps response in {code, data}, extract the data
      return result.code === 0 ? result.data : null;
    } catch {
      return null;
    }
  },

  // Get generated content list
  getGeneratedContents: async (params?: {
    content_type?: string;
    status?: AIContentStatus;
    page?: number;
    page_size?: number;
  }): Promise<GeneratedContentListResponse> => {
    const query = new URLSearchParams();
    if (params?.content_type) query.set("content_type", params.content_type);
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", params.page.toString());
    if (params?.page_size) query.set("page_size", params.page_size.toString());
    
    return apiRequest<GeneratedContentListResponse>(
      `/admin/ai-content/contents?${query.toString()}`
    );
  },

  // Get generated content detail by ID
  getGeneratedContentDetail: async (id: number): Promise<GeneratedContentItem | null> => {
    try {
      const result = await apiRequest<GeneratedContentItem>(`/admin/ai-content/contents/${id}`);
      return result;
    } catch {
      return null;
    }
  },
};

// Helper functions
export const getTaskStatusLabel = (status: TaskStatus): string => {
  const labels: Record<TaskStatus, string> = {
    pending: "待处理",
    processing: "处理中",
    generating: "生成中",
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

export const getTaskKey = (task: Pick<ContentTask, "id" | "task_source">): string =>
  `${task.task_source ?? "content"}:${task.id}`;

export const getSubjectLabel = (subject: string): string => {
  const labels: Record<string, string> = {
    xingce: "行测",
    shenlun: "申论",
    mianshi: "面试",
    gongji: "公基",
  };
  return labels[subject] || subject;
};

// Alias for backward compatibility
export const generatorApi = contentGeneratorApi;

// Type alias for backward compatibility
export type GeneratorTask = ContentTask;

// Additional helper functions
export const getSubjectName = (subject: string): string => getSubjectLabel(subject);

export const getSubjectIcon = (subject: Subject): string => {
  const icons: Record<Subject, string> = {
    xingce: "🧮",
    shenlun: "📝",
    mianshi: "🎤",
    gongji: "📚",
  };
  return icons[subject] || "📚";
};

export const getTaskStatusColor = (status: TaskStatus): string => {
  const colors: Record<TaskStatus, string> = {
    pending: "bg-gray-100 text-gray-800",
    processing: "bg-amber-100 text-amber-800",
    generating: "bg-amber-100 text-amber-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// Course content generation prompt preview (summary version)
// 课程内容生成 Prompt 预览（完整版，与后端 llm_prompts.go 保持一致）
export const COURSE_PROMPT_PREVIEW = {
  system_prompt: `你是一位资深的公务员考试辅导专家，拥有20年的教学经验。你需要根据给定的课程主题，生成高质量的教学内容。

## 核心要求：每课程必须生成 15000-20000 字！！！

## 内容模块清单（全部必填，缺一不可）

| 模块 | 字数要求 | 数量要求 |
|---|----|----|
| 考情深度分析 | 500字 | 含5年数据趋势 |
| 课程导入 | 600字 | 含案例故事 |
| 核心概念精讲 | 2000字 | **6个概念**，每个350字 |
| 方法论体系 | 2000字 | **6个步骤**，每步350字 |
| 口诀公式 | 500字 | **4个口诀**，每个含详解 |
| 记忆技巧 | 600字 | **3条技巧**，每条含示例 |
| 应试策略 | 600字 | **3条策略**，每条含说明 |
| 例题精讲 | 4500字 | **8道例题**，每道550字 |
| 易错深度剖析 | 1200字 | **6个陷阱**，每个200字 |
| 真题限时演练 | 2400字 | **6道真题**，每道400字 |
| 巩固练习 | 4800字 | **12道练习**，每道400字 |
| 高频词汇积累 | 800字 | **40组易混词** |
| 知识拓展延伸 | 800字 | 相关知识链接 |
| 课程总结回顾 | 600字 | 思维导图+要点 |
| 课后作业 | 300字 | 必做+选做+思考 |
| **思维导图（Mermaid）** | 300字 | **可视化知识结构图** |
| **快速笔记** | 500字 | **考前冲刺速记卡** |

**总计：约 20000 字**

## Mermaid 思维导图语法说明

思维导图使用 Mermaid mindmap 语法，便于前端可视化渲染。格式如下：

\`\`\`
mindmap
  root((课程主题))
    核心方法
      方法1
      方法2
      方法3
    解题步骤
      步骤1
      步骤2
      步骤3
    易错陷阱
      陷阱1
      陷阱2
    考点分布
      高频考点
      中频考点
\`\`\`

**注意**：
- 使用两个空格缩进表示层级关系
- 根节点用双括号 \`(())\` 包围
- 子节点直接写文字即可
- 保持结构清晰，层级不超过4层

## 输出格式

必须输出严格的 JSON 格式，包含以下完整结构：

\`\`\`json
{
    "chapter_title": "课程标题",
    "subject": "xingce/shenlun/mianshi/gongji",
    "knowledge_point": "知识点路径，如：言语理解-逻辑填空-实词辨析",
    "estimated_duration": "60分钟",
    "difficulty_level": "基础/进阶/提高/冲刺",
    "word_count_target": "15000-20000字",
    
    "exam_analysis": {
        "description": "考情分析（500字，必须包含具体数据）",
        "frequency": "高频考点，每年国考必考X-X题，省考X-X题",
        "score_weight": "约占XX模块X%的分值",
        "difficulty_trend": "近三年难度趋势分析",
        "exam_forms": ["考查形式1", "考查形式2", "考查形式3"],
        "key_patterns": ["命题规律1", "命题规律2", "命题规律3", "命题规律4"],
        "recent_trends": "2023-2024年命题趋势"
    },
    
    "lesson_content": {
        "introduction": "课程导入（600字）",
        "learning_goals": ["知识目标", "能力目标", "应试目标", "拓展目标"],
        "prerequisites": ["前置知识1", "前置知识2", "前置知识3"],
        "core_concepts": [
            {
                "name": "概念名称",
                "definition": "概念定义（50字）",
                "detailed_explanation": "详细解释（350字以上）",
                "application_scenarios": ["场景1", "场景2", "场景3"],
                "example": "具体示例（100字）",
                "common_pairs": ["相关词组1", "相关词组2"]
            }
        ],
        "method_steps": [
            {
                "step": 1,
                "title": "第一步：xxx",
                "content": "详细说明（350字以上）",
                "tips": "操作口诀",
                "time_allocation": "建议用时：X秒",
                "common_errors": "常见错误",
                "key_signals": ["关键信号1", "关键信号2"]
            }
        ],
        "formulas": [
            {
                "name": "口诀名称",
                "content": "口诀内容",
                "detailed_explanation": "详细解释（120字以上）",
                "memory_aid": "记忆技巧",
                "examples": ["应用示例1", "应用示例2"]
            }
        ],
        "memory_tips": [
            {
                "tip": "记忆技巧标题",
                "content": "详细说明（200字以上）",
                "example": "应用示例（100字以上）",
                "word_pairs": ["易混词组1", "易混词组2"]
            }
        ],
        "common_mistakes": [
            {
                "mistake": "错误类型",
                "frequency": "高频错误（占错误的X%）",
                "reason": "错误原因分析（200字以上）",
                "typical_case": "典型错误案例",
                "correction": "正确做法说明（100字）",
                "prevention": "预防措施"
            }
        ],
        "exam_strategies": [
            {
                "strategy": "应试策略标题",
                "content": "策略说明（200字以上）"
            }
        ],
        "vocabulary_accumulation": {
            "must_know": ["必知词组1：xxx vs xxx（差异说明）"],
            "should_know": ["应知词组1：xxx vs xxx"],
            "nice_to_know": ["了解词组1：xxx vs xxx"]
        },
        "extension_knowledge": "拓展知识（800字以上）",
        "summary_points": ["核心回顾1", "核心回顾2", "核心回顾3"],
        "mind_map_mermaid": "mindmap\\n  root((课程主题))\\n    核心方法\\n      方法1\\n      方法2",
        "quick_notes": {
            "formulas": [{"name": "口诀名称", "content": "口诀内容", "explanation": "详细解释"}],
            "key_points": ["核心要点1", "核心要点2", "核心要点3"],
            "common_mistakes": [{"mistake": "易错点", "correction": "正确做法"}],
            "exam_tips": ["技巧1", "技巧2", "技巧3"]
        }
    },
    
    "lesson_sections": [
        {"order": 1, "title": "【导入】考情速览与学习价值", "section_type": "intro", "duration": "5分钟"},
        {"order": 2, "title": "【理论】核心概念深度讲解", "section_type": "theory", "duration": "12分钟"},
        {"order": 3, "title": "【方法】X步解题法详解", "section_type": "method", "duration": "10分钟"},
        {"order": 4, "title": "【精讲】例题深度剖析（8道）", "section_type": "example", "duration": "25分钟"},
        {"order": 5, "title": "【警示】易错陷阱深度剖析", "section_type": "warning", "duration": "8分钟"},
        {"order": 6, "title": "【实战】真题限时演练（6道）", "section_type": "drill", "duration": "10分钟"},
        {"order": 7, "title": "【总结】知识体系梳理", "section_type": "summary", "duration": "5分钟"}
    ],
    
    "practice_problems": [
        {
            "order": 1,
            "difficulty": "★★☆☆☆",
            "difficulty_level": "基础",
            "problem": "练习题完整题目",
            "options": ["A. 选项A", "B. 选项B", "C. 选项C", "D. 选项D"],
            "answer": "A",
            "analysis": "【答案】A\\n\\n【难度】★★☆☆☆（基础）\\n\\n【考点】xxx\\n\\n【审题要点】\\n- 关键词：xxx\\n\\n【解题步骤】\\n第一步：...\\n\\n【选项详解】\\nA项：正确...\\nB项：错误...\\n\\n【技巧总结】...\\n\\n【易错提醒】...",
            "knowledge_point": "xxx",
            "time_suggestion": "40秒"
        }
    ],
    
    "homework": {
        "required": ["必做作业1", "必做作业2"],
        "optional": ["选做作业1"],
        "thinking_questions": ["思考题1"],
        "preview": "预习任务"
    }
}
\`\`\`

## 质量检查清单（生成前必须逐项确认）

**课程内容（15000字以上）：**
- [ ] 考情分析有具体的5年数据趋势？（500字）
- [ ] 导入部分有生动的案例或故事？（600字）
- [ ] 6个核心概念都有定义+原理+详解+示例+适用场景？（2100字）
- [ ] 6个方法步骤都有详细操作说明+技巧+时间分配？（2100字）
- [ ] 4个记忆口诀都有完整解释和应用示例？（500字）
- [ ] 3条记忆技巧都有清晰说明+应用示例？
- [ ] 8道例题都有550字以上的完整解析？（4400字）
- [ ] 6个易错陷阱都有案例+原因+纠正方法？（1200字）
- [ ] 3条应试策略都有可执行建议？
- [ ] 6道真题都有400字以上的快速解析？（2400字）
- [ ] 12道练习题都有400字以上的详细解析？（4800字）
- [ ] 40组高频词汇都有核心差异说明？（800字）
- [ ] 拓展知识部分有800字以上的深度内容？
- [ ] 课程总结有思维导图和核心要点回顾？（600字）
- [ ] 课后作业有必做+选做+思考题？（300字）
- [ ] **思维导图（Mermaid格式）包含核心方法、解题步骤、易错陷阱、知识要点？**
- [ ] **快速笔记包含3个口诀公式+5个核心要点+3个易错点+4个考场技巧？**

## 禁止事项（违反将导致内容不合格！！！）

- **禁止使用占位符**：不要出现"xxx"、"..."、"此处省略"、"详见xxx"等
- **禁止内容过短**：任何字段都必须有充实的实质内容
- **禁止简单罗列**：解析必须有完整的逻辑分析
- **禁止重复套用**：每道题必须独特
- **禁止错误信息**：引用必须准确
- **禁止空洞表述**：必须有具体内容

## 注意事项

1. 所有内容必须用中文
2. 所有"xxx"都是需要替换的占位符示例，生成时必须替换为实际内容
3. 例题和练习题必须是原创的，不能直接复制已知真题
4. 解析必须详细，包含完整的解题步骤
5. 难度分布合理：基础2题、中等5题、较难3题、困难2题`,

  user_prompt_template: `请为以下课程主题生成完整的教学内容：

## 课程信息

- **课程标题**：{title}
- **所属章节**：{section}
- **所属小节**：{subsection}
- **科目**：{subject}
- **父级主题**：{parent}

## 特殊要求

{special_requirements}

## 生成要求（必须严格遵守）

1. 严格按照系统提示中的 JSON 格式输出
2. **内容总字数必须达到 15000-20000 字**
3. **核心概念必须 6 个**，每个详解 350 字以上
4. **方法步骤必须 6 步**，每步详解 350 字以上
5. **记忆口诀必须 4 个**，每个详解 120 字以上
6. **精讲例题必须 8 道**，每道解析 550 字以上
7. **易错陷阱必须 6 个**，每个分析 200 字以上
8. **真题演练必须 6 道**，每道解析 400 字以上
9. **练习题目必须 12 道**，每道解析 400 字以上
10. **高频词汇必须 40 组**（must_know 20组 + should_know 10组 + nice_to_know 10组）
11. **拓展知识必须 800 字以上**
12. **课程总结必须 600 字以上**
13. **思维导图必须使用 Mermaid mindmap 语法**，包含核心方法、解题步骤、易错陷阱、知识要点四大分支
14. **快速笔记必须包含**：3个口诀公式（含解释）、5个核心要点、3个易错点纠正、4个考场技巧
15. 所有占位符"xxx"必须替换为实际内容

请开始生成（注意：这是一个大型内容生成任务，请耐心完成所有模块）：`,

  variables: ["title", "section", "subsection", "subject", "parent", "special_requirements"],
};

// =====================================================
// Prompt 构建辅助函数
// =====================================================

export interface PromptVariables {
  title: string;
  section?: string;
  subsection?: string;
  subject: string;
  parent?: string;
  special_requirements?: string;
}

// 科目名称映射
const SUBJECT_NAME_MAP: Record<string, string> = {
  xingce: "行政职业能力测验（行测）",
  shenlun: "申论",
  mianshi: "面试",
  gongji: "公共基础知识",
};

/**
 * 获取科目完整名称
 */
export const getSubjectFullName = (subject: string): string => {
  return SUBJECT_NAME_MAP[subject] || subject;
};

/**
 * 构建用户提示词
 * 将模板中的变量替换为实际值
 */
export const buildUserPrompt = (variables: PromptVariables): string => {
  const {
    title,
    section = "未分类",
    subsection = "未分类",
    subject,
    parent = "无",
    special_requirements = "无特殊要求",
  } = variables;

  return COURSE_PROMPT_PREVIEW.user_prompt_template
    .replace("{title}", title)
    .replace("{section}", section)
    .replace("{subsection}", subsection)
    .replace("{subject}", getSubjectFullName(subject))
    .replace("{parent}", parent)
    .replace("{special_requirements}", special_requirements);
};

/**
 * 获取完整的 System Prompt
 */
export const getSystemPrompt = (): string => {
  return COURSE_PROMPT_PREVIEW.system_prompt;
};

/**
 * 获取 User Prompt 模板
 */
export const getUserPromptTemplate = (): string => {
  return COURSE_PROMPT_PREVIEW.user_prompt_template;
};
