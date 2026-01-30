import axios, { AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";

// 创建独立的 axios 实例（用于生成器 API，超时时间更长）
const generatorAxios = axios.create({
  baseURL: "/api/v1",
  timeout: 600000, // 10分钟超时（内容生成可能需要较长时间）
  headers: {
    "Content-Type": "application/json",
  },
});

// 添加认证拦截器
generatorAxios.interceptors.request.use(
  (config) => {
    const { adminToken } = useAuthStore.getState();
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
generatorAxios.interceptors.response.use(
  (response) => {
    // 对于生成器 API，直接返回 data（不需要 code 检查）
    return response.data;
  },
  async (error) => {
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
      window.location.href = "/login";
    }
    const message = error.response?.data?.message || error.response?.data?.error || error.message || "请求失败";
    return Promise.reject(new Error(message));
  }
);

// 类型定义
export type TaskType = "course" | "question" | "material" | "description";
export type TaskStatus = "pending" | "generating" | "completed" | "failed" | "cancelled";

export interface GenerationTask {
  id: number;
  task_type: TaskType;
  target_id?: number;
  target_info?: Record<string, unknown>;
  status: TaskStatus;
  result?: Record<string, unknown>;
  error_message?: string;
  tokens_used: number;
  duration_ms: number;
  created_at: string;
  completed_at?: string;
}

export interface CategoryDescriptionResult {
  name: string;
  description: string;
  long_description: string;
  features: string[];
  learning_objectives: string[];
  keywords: string[];
  difficulty: string;
  icon_suggestion: string;
  color_suggestion: string;
}

export interface GenerateCategoryDescriptionRequest {
  force?: boolean;
}

export interface GenerateCourseContentRequest {
  chapter_title?: string;
  subject?: string;
  knowledge_point?: string;
  force?: boolean;
}

export interface GenerateQuestionBatchRequest {
  category: string;
  topic: string;
  sub_topic?: string;
  subject?: string;
}

export interface GenerateMaterialBatchRequest {
  category: string;
  topic: string;
  sub_topic?: string;
  material_type?: string;
}

export interface TaskListResponse {
  tasks: GenerationTask[];
  total: number;
  page: number;
  page_size: number;
}

export interface TaskCreatedResponse {
  message: string;
  task: GenerationTask;
}

// 生成器 API
export const generatorApi = {
  // =====================================================
  // 分类描述生成
  // =====================================================
  
  /**
   * 为分类生成 AI 描述
   * @param categoryId 分类 ID
   * @param params 请求参数
   */
  generateCategoryDescription: async (
    categoryId: number,
    params?: GenerateCategoryDescriptionRequest
  ): Promise<CategoryDescriptionResult> => {
    return generatorAxios.post(`/admin/generator/categories/${categoryId}/description`, params);
  },

  // =====================================================
  // 课程内容生成
  // =====================================================
  
  /**
   * 为章节生成完整课程内容（异步任务）
   * @param chapterId 章节 ID
   * @param params 请求参数
   */
  generateCourseContent: async (
    chapterId: number,
    params?: GenerateCourseContentRequest
  ): Promise<TaskCreatedResponse> => {
    return generatorAxios.post(`/admin/generator/courses/${chapterId}/content`, params);
  },

  // =====================================================
  // 题目批次生成
  // =====================================================
  
  /**
   * 生成题目批次（异步任务）
   * @param params 请求参数
   */
  generateQuestionBatch: async (
    params: GenerateQuestionBatchRequest
  ): Promise<TaskCreatedResponse> => {
    return generatorAxios.post("/admin/generator/questions/batch", params);
  },

  // =====================================================
  // 素材批次生成
  // =====================================================
  
  /**
   * 生成素材批次（异步任务）
   * @param params 请求参数
   */
  generateMaterialBatch: async (
    params: GenerateMaterialBatchRequest
  ): Promise<TaskCreatedResponse> => {
    return generatorAxios.post("/admin/generator/materials/batch", params);
  },

  // =====================================================
  // 任务管理
  // =====================================================
  
  /**
   * 获取任务列表
   * @param params 查询参数
   */
  listTasks: async (params?: {
    task_type?: TaskType;
    status?: TaskStatus;
    page?: number;
    page_size?: number;
  }): Promise<TaskListResponse> => {
    const query = new URLSearchParams();
    if (params?.task_type) query.append("task_type", params.task_type);
    if (params?.status) query.append("status", params.status);
    if (params?.page) query.append("page", String(params.page));
    if (params?.page_size) query.append("page_size", String(params.page_size));
    
    const queryString = query.toString();
    const url = `/admin/generator/tasks${queryString ? `?${queryString}` : ""}`;
    return generatorAxios.get(url);
  },

  /**
   * 获取任务详情
   * @param taskId 任务 ID
   */
  getTask: async (taskId: number): Promise<GenerationTask> => {
    return generatorAxios.get(`/admin/generator/tasks/${taskId}`);
  },

  /**
   * 取消任务
   * @param taskId 任务 ID
   */
  cancelTask: async (taskId: number): Promise<{ message: string }> => {
    return generatorAxios.delete(`/admin/generator/tasks/${taskId}`);
  },

  /**
   * 轮询任务状态（用于等待异步任务完成）
   * @param taskId 任务 ID
   * @param options 轮询选项
   */
  pollTaskStatus: async (
    taskId: number,
    options?: {
      interval?: number; // 轮询间隔（毫秒）
      maxAttempts?: number; // 最大尝试次数
      onProgress?: (task: GenerationTask) => void; // 进度回调
    }
  ): Promise<GenerationTask> => {
    const { interval = 2000, maxAttempts = 300, onProgress } = options || {};
    let attempts = 0;

    while (attempts < maxAttempts) {
      const task = await generatorApi.getTask(taskId);
      
      if (onProgress) {
        onProgress(task);
      }

      if (task.status === "completed" || task.status === "failed" || task.status === "cancelled") {
        return task;
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
      attempts++;
    }

    throw new Error("任务轮询超时");
  },
};

export default generatorApi;
