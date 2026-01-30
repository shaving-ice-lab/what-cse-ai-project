import { apiRequest } from "./api";

// =====================================================
// Types - AI 生成内容
// =====================================================

export type AIContentType =
  | "question_analysis"
  | "question_tips"
  | "question_similar"
  | "question_extension"
  | "knowledge_summary"
  | "knowledge_mindmap"
  | "knowledge_keypoints"
  | "knowledge_examples"
  | "chapter_summary"
  | "chapter_keypoints"
  | "chapter_exercises"
  | "chapter_lesson" // 章节教学内容（完整图文教程）
  | "course_outline"
  | "course_preview"
  | "course_review"
  | "learning_path"
  | "weak_point_analysis"
  | "error_analysis"
  | "progress_evaluation"
  | "ability_report";

export type AIRelatedType =
  | "question"
  | "course"
  | "chapter"
  | "knowledge_point"
  | "user";

export type AIContentStatus = "pending" | "approved" | "rejected" | "expired";

export type AIBatchTaskStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface AIGeneratedContent {
  id: number;
  content_type: AIContentType;
  related_type: AIRelatedType;
  related_id: number;
  title?: string;
  content: AIContentData;
  metadata?: AIContentMetadata;
  quality_score: number;
  status: AIContentStatus;
  version: number;
  generated_at: string;
  approved_at?: string;
  approved_by?: number;
  created_at: string;
  updated_at: string;
}

export interface AIContentData {
  summary?: string;
  main_points?: string[];
  details?: string;
  analysis?: string;
  key_points?: string[];
  solution_steps?: string[];
  option_analysis?: Record<string, string>;
  common_mistakes?: string[];
  tips?: string[];
  related_knowledge?: number[];
  similar_questions?: number[];
  quick_solution_tips?: string[];
  definition?: string;
  mnemonics?: string;
  common_types?: string[];
  mindmap_data?: MindmapData;
  examples?: ExampleQuestion[];
  key_formulas?: string[];
  memory_methods?: string[];
  outline?: OutlineItem[];
  preview_points?: string[];
  review_points?: string[];
  exercises?: number[];
  learning_steps?: LearningStep[];
  weak_points?: WeakPoint[];
  error_reasons?: string[];
  recommendations?: string[];
  ability_scores?: Record<string, number>;
  progress_percent?: number;
  estimated_time?: number;
  // 章节教学内容相关
  lesson_content?: LessonContent;
  lesson_sections?: LessonSection[];
  practice_problems?: PracticeProblem[];
}

// 教学内容结构
export interface LessonContent {
  introduction: string;
  learning_goals: string[];
  prerequisites?: string[];
  core_concepts: string[];
  main_content: string;
  formulas?: string[];
  memory_tips?: string[];
  common_mistakes?: string[];
  summary_points: string[];
  extended_reading?: string;
  estimated_minutes?: number;
}

// 教学分节
export interface LessonSection {
  order: number;
  title: string;
  content: string;
  section_type: LessonSectionType;
  duration?: number;
  key_points?: string[];
  examples?: LessonExample[];
}

export type LessonSectionType =
  | "intro"
  | "concept"
  | "method"
  | "example"
  | "practice"
  | "summary"
  | "extension";

// 教学示例
export interface LessonExample {
  title: string;
  problem: string;
  analysis: string;
  solution: string;
  answer?: string;
  key_insight?: string;
  variations?: string[];
}

// 随堂练习题
export interface PracticeProblem {
  order: number;
  problem: string;
  options?: string[];
  answer: string;
  analysis: string;
  difficulty?: number;
  type?: string;
}

export interface MindmapData {
  root: MindmapNode;
  children?: MindmapNode[];
}

export interface MindmapNode {
  id: string;
  label: string;
  color?: string;
  children?: MindmapNode[];
}

export interface ExampleQuestion {
  question_id?: number;
  question: string;
  options?: string[];
  answer: string;
  analysis: string;
}

export interface OutlineItem {
  title: string;
  duration?: number;
  children?: OutlineItem[];
}

export interface LearningStep {
  step: number;
  title: string;
  description: string;
  duration?: number;
  resource_id?: number;
}

export interface WeakPoint {
  knowledge_id: number;
  knowledge_name: string;
  mastery_level: number;
  suggestion?: string;
  related_course?: number;
}

export interface AIContentMetadata {
  model_name?: string;
  model_version?: string;
  prompt?: string;
  temperature?: number;
  tokens_used?: number;
  generate_time?: number;
  source?: string;
  tags?: string[];
  extra?: Record<string, string>;
}

// =====================================================
// Types - AI 批量任务
// =====================================================

export interface AIBatchTask {
  id: number;
  task_name: string;
  content_type: AIContentType;
  related_type: AIRelatedType;
  target_ids: number[];
  total_count: number;
  processed_count: number;
  success_count: number;
  failed_count: number;
  status: AIBatchTaskStatus;
  priority: number;
  config?: AIBatchConfig;
  error_log?: string;
  started_at?: string;
  completed_at?: string;
  created_by: number;
  created_at: string;
  creator?: { id: number; username: string };
}

export interface AIBatchConfig {
  concurrency?: number;
  retry_count?: number;
  skip_existing?: boolean;
  auto_approve?: boolean;
  model_name?: string;
  temperature?: number;
}

// =====================================================
// Types - AI 质量统计
// =====================================================

export interface AIQualityStats {
  total_contents: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  average_quality_score: number;
  content_type_distribution: Record<string, number>;
  quality_score_distribution: {
    excellent: number; // >= 4.0
    good: number; // >= 3.0
    average: number; // >= 2.0
    poor: number; // < 2.0
  };
  daily_generation_trend: {
    date: string;
    count: number;
  }[];
  approval_rate: number;
  common_issues: {
    issue: string;
    count: number;
    percentage: number;
  }[];
}

// =====================================================
// Types - Prompt 模板
// =====================================================

export interface PromptTemplate {
  id: number;
  name: string;
  code: string;
  category: string;
  content: string;
  variables?: PromptVariable[];
  description?: string;
  version: number;
  is_active: boolean;
  usage_count: number;
  last_used_at?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface PromptVariable {
  name: string;
  description: string;
  type: "string" | "number" | "array" | "object";
  required: boolean;
  default_value?: string;
}

export interface PromptTemplateVersion {
  id: number;
  template_id: number;
  version: number;
  content: string;
  change_note?: string;
  created_by: number;
  created_at: string;
}

// =====================================================
// Types - AI 配置
// =====================================================

export interface AIServiceConfig {
  id: number;
  config_key: string;
  config_value: string;
  description?: string;
  is_sensitive: boolean;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export interface AIGenerationConfig {
  model_name: string;
  api_key_masked?: string;
  max_tokens: number;
  temperature: number;
  daily_limit: number;
  daily_used: number;
  cost_per_1k_tokens: number;
  total_cost_today: number;
  is_enabled: boolean;
  features: {
    question_analysis: boolean;
    knowledge_summary: boolean;
    similar_questions: boolean;
    learning_path: boolean;
    weakness_analysis: boolean;
    ability_report: boolean;
  };
}

// =====================================================
// Request Types
// =====================================================

export interface ListAIContentsRequest {
  page?: number;
  page_size?: number;
  content_type?: AIContentType;
  related_type?: AIRelatedType;
  status?: AIContentStatus;
  keyword?: string;
  min_quality_score?: number;
  max_quality_score?: number;
}

export interface ListAIBatchTasksRequest {
  page?: number;
  page_size?: number;
  content_type?: AIContentType;
  status?: AIBatchTaskStatus;
}

export interface CreateAIBatchTaskRequest {
  task_name: string;
  content_type: AIContentType;
  related_type: AIRelatedType;
  target_ids: number[];
  priority?: number;
  config?: AIBatchConfig;
}

export interface UpdateAIContentRequest {
  title?: string;
  content?: Partial<AIContentData>;
  quality_score?: number;
  status?: AIContentStatus;
}

export interface CreatePromptTemplateRequest {
  name: string;
  code: string;
  category: string;
  content: string;
  variables?: PromptVariable[];
  description?: string;
}

export interface UpdatePromptTemplateRequest {
  name?: string;
  content?: string;
  variables?: PromptVariable[];
  description?: string;
  is_active?: boolean;
  change_note?: string;
}

export interface TestPromptTemplateRequest {
  template_id?: number;
  content: string;
  variables: Record<string, any>;
}

// 章节教学内容生成请求
export interface GenerateChapterLessonRequest {
  chapter_id: number;
  chapter_title?: string;
  course_title?: string;
  subject?: string; // xingce | shenlun | mianshi | gongji
  knowledge_point?: string;
  model_name?: string;
  force?: boolean;
  auto_approve?: boolean;
}

// 为课程批量生成教学内容请求
export interface GenerateCourseLessonsRequest {
  course_id: number;
  subject?: string;
  auto_approve?: boolean;
}

// 为分类批量生成教学内容请求
export interface GenerateCategoryLessonsRequest {
  category_id: number;
  subject?: string;
  auto_approve?: boolean;
}

export interface UpdateAIConfigRequest {
  model_name?: string;
  api_key?: string;
  max_tokens?: number;
  temperature?: number;
  daily_limit?: number;
  is_enabled?: boolean;
  features?: Partial<AIGenerationConfig["features"]>;
}

// =====================================================
// API Functions
// =====================================================

export const aiContentApi = {
  // =====================================================
  // AI 生成内容 API
  // =====================================================

  // 获取内容列表
  getContents: async (
    params?: ListAIContentsRequest
  ): Promise<{ contents: AIGeneratedContent[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.page_size) query.set("page_size", params.page_size.toString());
    if (params?.content_type) query.set("content_type", params.content_type);
    if (params?.related_type) query.set("related_type", params.related_type);
    if (params?.status) query.set("status", params.status);
    if (params?.keyword) query.set("keyword", params.keyword);
    if (params?.min_quality_score)
      query.set("min_quality_score", params.min_quality_score.toString());
    if (params?.max_quality_score)
      query.set("max_quality_score", params.max_quality_score.toString());

    const res = await apiRequest<{
      data: { contents: AIGeneratedContent[]; total: number };
    }>(`/admin/ai/contents?${query.toString()}`);
    return res.data;
  },

  // 获取单个内容
  getContent: async (id: number): Promise<AIGeneratedContent> => {
    const res = await apiRequest<{ data: AIGeneratedContent }>(
      `/admin/ai/contents/${id}`
    );
    return res.data;
  },

  // 更新内容
  updateContent: async (
    id: number,
    data: UpdateAIContentRequest
  ): Promise<AIGeneratedContent> => {
    const res = await apiRequest<{ data: AIGeneratedContent }>(
      `/admin/ai/contents/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  // 删除内容
  deleteContent: async (id: number): Promise<void> => {
    await apiRequest(`/admin/ai/contents/${id}`, {
      method: "DELETE",
    });
  },

  // 审核通过
  approveContent: async (id: number): Promise<void> => {
    await apiRequest(`/admin/ai/contents/${id}/approve`, {
      method: "POST",
    });
  },

  // 审核拒绝
  rejectContent: async (id: number, reason?: string): Promise<void> => {
    await apiRequest(`/admin/ai/contents/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  // 批量审核通过
  batchApprove: async (ids: number[]): Promise<{ success_count: number }> => {
    const res = await apiRequest<{ data: { success_count: number } }>(
      `/admin/ai/contents/batch-approve`,
      {
        method: "POST",
        body: JSON.stringify({ ids }),
      }
    );
    return res.data;
  },

  // 批量审核拒绝
  batchReject: async (
    ids: number[],
    reason?: string
  ): Promise<{ success_count: number }> => {
    const res = await apiRequest<{ data: { success_count: number } }>(
      `/admin/ai/contents/batch-reject`,
      {
        method: "POST",
        body: JSON.stringify({ ids, reason }),
      }
    );
    return res.data;
  },

  // 重新生成内容
  regenerateContent: async (id: number): Promise<AIGeneratedContent> => {
    const res = await apiRequest<{ data: AIGeneratedContent }>(
      `/admin/ai/contents/${id}/regenerate`,
      {
        method: "POST",
      }
    );
    return res.data;
  },

  // =====================================================
  // 章节教学内容生成 API
  // =====================================================

  // 生成单个章节教学内容
  generateChapterLesson: async (
    data: GenerateChapterLessonRequest
  ): Promise<AIGeneratedContent> => {
    const res = await apiRequest<{ data: AIGeneratedContent }>(
      `/admin/ai-content/generate/chapter-lesson`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  // 为课程批量生成所有章节教学内容
  generateCourseLessons: async (
    data: GenerateCourseLessonsRequest
  ): Promise<{ message: string; task: AIBatchTask }> => {
    const res = await apiRequest<{
      data: { message: string; task: AIBatchTask };
    }>(`/admin/ai-content/generate/course-lessons`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  // 为分类批量生成所有课程教学内容
  generateCategoryLessons: async (
    data: GenerateCategoryLessonsRequest
  ): Promise<{ message: string; task_count: number; tasks: AIBatchTask[] }> => {
    const res = await apiRequest<{
      data: { message: string; task_count: number; tasks: AIBatchTask[] };
    }>(`/admin/ai-content/generate/category-lessons`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  // =====================================================
  // AI 批量任务 API
  // =====================================================

  // 获取任务列表
  getTasks: async (
    params?: ListAIBatchTasksRequest
  ): Promise<{ tasks: AIBatchTask[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.page_size) query.set("page_size", params.page_size.toString());
    if (params?.content_type) query.set("content_type", params.content_type);
    if (params?.status) query.set("status", params.status);

    const res = await apiRequest<{
      data: { tasks: AIBatchTask[]; total: number };
    }>(`/admin/ai/tasks?${query.toString()}`);
    return res.data;
  },

  // 获取单个任务
  getTask: async (id: number): Promise<AIBatchTask> => {
    const res = await apiRequest<{ data: AIBatchTask }>(
      `/admin/ai/tasks/${id}`
    );
    return res.data;
  },

  // 创建批量任务
  createTask: async (data: CreateAIBatchTaskRequest): Promise<AIBatchTask> => {
    const res = await apiRequest<{ data: AIBatchTask }>(
      `/admin/ai/tasks`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  // 取消任务
  cancelTask: async (id: number): Promise<void> => {
    await apiRequest(`/admin/ai/tasks/${id}/cancel`, {
      method: "POST",
    });
  },

  // 重试任务
  retryTask: async (id: number): Promise<AIBatchTask> => {
    const res = await apiRequest<{ data: AIBatchTask }>(
      `/admin/ai/tasks/${id}/retry`,
      {
        method: "POST",
      }
    );
    return res.data;
  },

  // =====================================================
  // AI 质量统计 API
  // =====================================================

  // 获取质量统计
  getQualityStats: async (): Promise<AIQualityStats> => {
    const res = await apiRequest<{ data: AIQualityStats }>(
      `/admin/ai/quality/stats`
    );
    return res.data;
  },

  // 获取低质量内容
  getLowQualityContents: async (
    maxScore: number,
    limit?: number
  ): Promise<AIGeneratedContent[]> => {
    const query = new URLSearchParams();
    query.set("max_score", maxScore.toString());
    if (limit) query.set("limit", limit.toString());

    const res = await apiRequest<{ data: { contents: AIGeneratedContent[] } }>(
      `/admin/ai/quality/low-quality?${query.toString()}`
    );
    return res.data.contents;
  },

  // 获取高质量内容
  getHighQualityContents: async (
    minScore: number,
    limit?: number
  ): Promise<AIGeneratedContent[]> => {
    const query = new URLSearchParams();
    query.set("min_score", minScore.toString());
    if (limit) query.set("limit", limit.toString());

    const res = await apiRequest<{ data: { contents: AIGeneratedContent[] } }>(
      `/admin/ai/quality/high-quality?${query.toString()}`
    );
    return res.data.contents;
  },

  // =====================================================
  // Prompt 模板 API
  // =====================================================

  // 获取模板列表
  getPromptTemplates: async (
    category?: string
  ): Promise<{ templates: PromptTemplate[]; total: number }> => {
    const query = category ? `?category=${category}` : "";
    const res = await apiRequest<{
      data: { templates: PromptTemplate[]; total: number };
    }>(`/admin/ai/prompts${query}`);
    return res.data;
  },

  // 获取单个模板
  getPromptTemplate: async (id: number): Promise<PromptTemplate> => {
    const res = await apiRequest<{ data: PromptTemplate }>(
      `/admin/ai/prompts/${id}`
    );
    return res.data;
  },

  // 创建模板
  createPromptTemplate: async (
    data: CreatePromptTemplateRequest
  ): Promise<PromptTemplate> => {
    const res = await apiRequest<{ data: PromptTemplate }>(
      `/admin/ai/prompts`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  // 更新模板
  updatePromptTemplate: async (
    id: number,
    data: UpdatePromptTemplateRequest
  ): Promise<PromptTemplate> => {
    const res = await apiRequest<{ data: PromptTemplate }>(
      `/admin/ai/prompts/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  // 删除模板
  deletePromptTemplate: async (id: number): Promise<void> => {
    await apiRequest(`/admin/ai/prompts/${id}`, {
      method: "DELETE",
    });
  },

  // 获取模板版本历史
  getPromptTemplateVersions: async (
    id: number
  ): Promise<PromptTemplateVersion[]> => {
    const res = await apiRequest<{ data: { versions: PromptTemplateVersion[] } }>(
      `/admin/ai/prompts/${id}/versions`
    );
    return res.data.versions;
  },

  // 回滚到指定版本
  rollbackPromptTemplate: async (
    id: number,
    versionId: number
  ): Promise<PromptTemplate> => {
    const res = await apiRequest<{ data: PromptTemplate }>(
      `/admin/ai/prompts/${id}/rollback`,
      {
        method: "POST",
        body: JSON.stringify({ version_id: versionId }),
      }
    );
    return res.data;
  },

  // 测试模板
  testPromptTemplate: async (
    data: TestPromptTemplateRequest
  ): Promise<{ result: string; tokens_used: number; time_ms: number }> => {
    const res = await apiRequest<{
      data: { result: string; tokens_used: number; time_ms: number };
    }>(`/admin/ai/prompts/test`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  },

  // =====================================================
  // AI 服务配置 API
  // =====================================================

  // 获取配置
  getConfig: async (): Promise<AIGenerationConfig> => {
    const res = await apiRequest<{ data: AIGenerationConfig }>(
      `/admin/ai/config`
    );
    return res.data;
  },

  // 更新配置
  updateConfig: async (
    data: UpdateAIConfigRequest
  ): Promise<AIGenerationConfig> => {
    const res = await apiRequest<{ data: AIGenerationConfig }>(
      `/admin/ai/config`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  // 获取使用统计
  getUsageStats: async (): Promise<{
    daily_usage: { date: string; tokens: number; cost: number }[];
    monthly_usage: { month: string; tokens: number; cost: number }[];
    total_tokens: number;
    total_cost: number;
  }> => {
    const res = await apiRequest<{
      data: {
        daily_usage: { date: string; tokens: number; cost: number }[];
        monthly_usage: { month: string; tokens: number; cost: number }[];
        total_tokens: number;
        total_cost: number;
      };
    }>(`/admin/ai/config/usage`);
    return res.data;
  },

  // 重置每日限额
  resetDailyLimit: async (): Promise<void> => {
    await apiRequest(`/admin/ai/config/reset-daily`, {
      method: "POST",
    });
  },
};

// =====================================================
// Helper Functions
// =====================================================

export const getContentTypeLabel = (type: AIContentType): string => {
  const labels: Record<AIContentType, string> = {
    question_analysis: "题目解析",
    question_tips: "解题技巧",
    question_similar: "相似题目",
    question_extension: "知识延伸",
    knowledge_summary: "知识点总结",
    knowledge_mindmap: "知识点导图",
    knowledge_keypoints: "核心要点",
    knowledge_examples: "例题解析",
    chapter_summary: "章节总结",
    chapter_keypoints: "章节重点",
    chapter_exercises: "配套练习",
    chapter_lesson: "章节教学内容",
    course_outline: "课程大纲",
    course_preview: "预习要点",
    course_review: "复习要点",
    learning_path: "学习路径",
    weak_point_analysis: "薄弱点分析",
    error_analysis: "错因分析",
    progress_evaluation: "进度评估",
    ability_report: "能力报告",
  };
  return labels[type] || type;
};

export const getLessonSectionTypeLabel = (type: LessonSectionType): string => {
  const labels: Record<LessonSectionType, string> = {
    intro: "课程导入",
    concept: "概念讲解",
    method: "方法技巧",
    example: "例题演示",
    practice: "随堂练习",
    summary: "总结归纳",
    extension: "拓展提高",
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

export const getRelatedTypeLabel = (type: AIRelatedType): string => {
  const labels: Record<AIRelatedType, string> = {
    question: "题目",
    course: "课程",
    chapter: "章节",
    knowledge_point: "知识点",
    user: "用户",
  };
  return labels[type] || type;
};

export const getContentStatusLabel = (status: AIContentStatus): string => {
  const labels: Record<AIContentStatus, string> = {
    pending: "待审核",
    approved: "已通过",
    rejected: "已拒绝",
    expired: "已过期",
  };
  return labels[status] || status;
};

export const getContentStatusColor = (
  status: AIContentStatus
): "default" | "secondary" | "destructive" | "outline" => {
  const colors: Record<
    AIContentStatus,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    pending: "outline",
    approved: "default",
    rejected: "destructive",
    expired: "secondary",
  };
  return colors[status] || "outline";
};

export const getTaskStatusLabel = (status: AIBatchTaskStatus): string => {
  const labels: Record<AIBatchTaskStatus, string> = {
    pending: "等待中",
    processing: "处理中",
    completed: "已完成",
    failed: "失败",
    cancelled: "已取消",
  };
  return labels[status] || status;
};

export const getTaskStatusColor = (
  status: AIBatchTaskStatus
): "default" | "secondary" | "destructive" | "outline" => {
  const colors: Record<
    AIBatchTaskStatus,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    pending: "outline",
    processing: "secondary",
    completed: "default",
    failed: "destructive",
    cancelled: "secondary",
  };
  return colors[status] || "outline";
};

export const getPromptCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    question: "题目类",
    knowledge: "知识点类",
    course: "课程类",
    personal: "个性化类",
    report: "报告类",
  };
  return labels[category] || category;
};

export const getQualityScoreLabel = (score: number): string => {
  if (score >= 4.0) return "优秀";
  if (score >= 3.0) return "良好";
  if (score >= 2.0) return "一般";
  return "较差";
};

export const getQualityScoreColor = (score: number): string => {
  if (score >= 4.0) return "text-green-600";
  if (score >= 3.0) return "text-blue-600";
  if (score >= 2.0) return "text-amber-600";
  return "text-red-600";
};
