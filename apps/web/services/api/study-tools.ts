import request from "../request";

// =====================================================
// 类型定义
// =====================================================

// 学习计划状态
export type StudyPlanStatus = "active" | "completed" | "abandoned" | "paused";

// 学习类型
export type StudyType = "video" | "article" | "practice" | "exam" | "review" | "note";

// 学习内容类型
export type LearningContentType = "course" | "chapter" | "question" | "knowledge" | "article";

// 学习阶段
export interface StudyPhase {
  name: string;
  start_day: number;
  end_day: number;
  focus: string[];
  daily_time: number;
  daily_tasks: number;
  description: string;
}

// 计划详情
export interface PlanDetails {
  phases?: StudyPhase[];
}

// 学习计划
export interface StudyPlan {
  id: number;
  title: string;
  description?: string;
  exam_type?: string;
  target_exam_date?: string;
  start_date: string;
  end_date: string;
  daily_study_time: number;
  daily_questions: number;
  plan_details?: PlanDetails;
  status: StudyPlanStatus;
  progress: number;
  total_days: number;
  completed_days: number;
  current_phase: number;
  remaining_days: number;
  created_at: string;
}

// 学习计划模板
export interface StudyPlanTemplate {
  id: number;
  name: string;
  description?: string;
  exam_type: string;
  duration: number;
  daily_study_time: number;
  daily_questions: number;
  plan_details: PlanDetails;
  difficulty: string;
  use_count: number;
}

// 每日任务
export interface StudyDailyTask {
  id: number;
  plan_id: number;
  task_date: string;
  task_type: string;
  target_content: string;
  target_time: number;
  target_count: number;
  actual_time: number;
  actual_count: number;
  is_completed: boolean;
  completed_at?: string;
  note?: string;
}

// 每日任务统计
export interface DailyTaskStats {
  total: number;
  completed: number;
  progress: number;
}

// 学习时长记录
export interface StudyTimeRecord {
  id: number;
  study_type: StudyType;
  subject?: string;
  content_type?: string;
  content_id?: number;
  content_name?: string;
  duration: number;
  duration_minutes: number;
  study_date: string;
  start_time: string;
  end_time?: string;
  created_at: string;
}

// 学习统计
export interface StudyStatistics {
  period: string; // day, week, month
  total_minutes: number;
  total_hours: number;
  video_minutes: number;
  practice_minutes: number;
  article_minutes: number;
  other_minutes: number;
  session_count: number;
  question_count: number;
  correct_rate: number;
  daily_average_minutes?: number;
  trend?: DailyStudyTrend[];
  by_subject?: Record<string, number>;
}

// 每日学习趋势
export interface DailyStudyTrend {
  date: string;
  total_minutes: number;
  session_count: number;
}

// 学习收藏
export interface LearningFavorite {
  id: number;
  content_type: LearningContentType;
  content_id: number;
  folder_id?: number;
  folder_name?: string;
  note?: string;
  tags?: string[];
  created_at: string;
  content?: any; // 关联的内容详情
}

// 收藏夹
export interface LearningFavoriteFolder {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  item_count: number;
  created_at: string;
}

// 知识点掌握度
export interface KnowledgeMastery {
  knowledge_point_id: number;
  knowledge_name: string;
  mastery_level: number;
  total_questions: number;
  correct_rate: number;
  is_weak: boolean;
}

// 掌握度统计
export interface MasteryStats {
  mastered: number;
  familiar: number;
  learning: number;
  weak: number;
  total: number;
}

// =====================================================
// 学习计划 API
// =====================================================

// 创建学习计划
export interface CreateStudyPlanParams {
  title: string;
  description?: string;
  exam_type?: string;
  target_exam_date?: string;
  start_date: string;
  end_date: string;
  daily_study_time?: number;
  daily_questions?: number;
  plan_details?: PlanDetails;
  template_id?: number;
}

export const createStudyPlan = (params: CreateStudyPlanParams): Promise<StudyPlan> => {
  return request.post("/study/plans", params);
};

// 从模板创建计划
export interface CreatePlanFromTemplateParams {
  template_id: number;
  start_date: string;
  target_exam_date?: string;
}

export const createPlanFromTemplate = (params: CreatePlanFromTemplateParams): Promise<StudyPlan> => {
  return request.post("/study/plans/from-template", params);
};

// 获取计划列表
export interface GetPlansParams {
  status?: StudyPlanStatus;
  exam_type?: string;
  page?: number;
  page_size?: number;
}

export interface GetPlansResponse {
  plans: StudyPlan[];
  total: number;
  page: number;
  page_size: number;
}

export const getStudyPlans = (params?: GetPlansParams): Promise<GetPlansResponse> => {
  return request.get("/study/plans", { params });
};

// 获取当前进行中的计划
export const getActivePlan = (): Promise<{ plan: StudyPlan | null }> => {
  return request.get("/study/plans/active");
};

// 获取计划详情
export const getStudyPlan = (id: number): Promise<StudyPlan> => {
  return request.get(`/study/plans/${id}`);
};

// 更新计划
export interface UpdateStudyPlanParams {
  title?: string;
  description?: string;
  daily_study_time?: number;
  daily_questions?: number;
  end_date?: string;
  plan_details?: PlanDetails;
}

export const updateStudyPlan = (id: number, params: UpdateStudyPlanParams): Promise<void> => {
  return request.put(`/study/plans/${id}`, params);
};

// 更新计划状态
export const updatePlanStatus = (id: number, status: StudyPlanStatus): Promise<void> => {
  return request.put(`/study/plans/${id}/status`, { status });
};

// 删除计划
export const deleteStudyPlan = (id: number): Promise<void> => {
  return request.delete(`/study/plans/${id}`);
};

// 获取计划模板
export const getPlanTemplates = (examType?: string): Promise<{ templates: StudyPlanTemplate[] }> => {
  return request.get("/study/plans/templates", { params: { exam_type: examType } });
};

// =====================================================
// 每日任务 API
// =====================================================

// 获取每日任务
export const getDailyTasks = (date?: string): Promise<{ tasks: StudyDailyTask[] }> => {
  return request.get("/study/tasks", { params: { date } });
};

// 获取任务统计
export const getDailyTaskStats = (planId?: number, date?: string): Promise<DailyTaskStats> => {
  return request.get("/study/tasks/stats", { params: { plan_id: planId, date } });
};

// 完成任务
export const completeDailyTask = (taskId: number): Promise<void> => {
  return request.put(`/study/tasks/${taskId}/complete`);
};

// 更新任务进度
export const updateTaskProgress = (taskId: number, actualTime: number, actualCount: number): Promise<void> => {
  return request.put(`/study/tasks/${taskId}/progress`, { actual_time: actualTime, actual_count: actualCount });
};

// =====================================================
// 学习时长 API
// =====================================================

// 开始学习会话
export interface StartSessionParams {
  study_type: StudyType;
  subject?: string;
  content_type?: string;
  content_id?: number;
  content_name?: string;
  device_info?: string;
}

export const startStudySession = (params: StartSessionParams): Promise<StudyTimeRecord> => {
  return request.post("/study/time/start", params);
};

// 结束学习会话
export const endStudySession = (recordId: number): Promise<void> => {
  return request.post(`/study/time/end/${recordId}`);
};

// 直接记录学习时长
export interface RecordStudyTimeParams extends StartSessionParams {
  duration: number; // 秒
}

export const recordStudyTime = (params: RecordStudyTimeParams): Promise<StudyTimeRecord> => {
  return request.post("/study/time/record", params);
};

// 获取当前活跃会话
export const getActiveSession = (): Promise<{ session: StudyTimeRecord | null }> => {
  return request.get("/study/time/active");
};

// 获取学习记录
export interface GetStudyRecordsParams {
  study_type?: StudyType;
  subject?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

export interface GetStudyRecordsResponse {
  records: StudyTimeRecord[];
  total: number;
  page: number;
  page_size: number;
}

export const getStudyRecords = (params?: GetStudyRecordsParams): Promise<GetStudyRecordsResponse> => {
  return request.get("/study/time/records", { params });
};

// 获取日统计
export const getDailyStatistics = (date?: string): Promise<StudyStatistics> => {
  return request.get("/study/time/statistics/daily", { params: { date } });
};

// 获取周统计
export const getWeeklyStatistics = (): Promise<StudyStatistics> => {
  return request.get("/study/time/statistics/weekly");
};

// 获取月统计
export const getMonthlyStatistics = (): Promise<StudyStatistics> => {
  return request.get("/study/time/statistics/monthly");
};

// =====================================================
// 学习收藏 API
// =====================================================

// 添加收藏
export interface AddLearningFavoriteParams {
  content_type: LearningContentType;
  content_id: number;
  folder_id?: number;
  note?: string;
  tags?: string[];
}

export const addLearningFavorite = (params: AddLearningFavoriteParams): Promise<LearningFavorite> => {
  return request.post("/study/favorites", params);
};

// 获取收藏列表
export interface GetLearningFavoritesParams {
  content_type?: LearningContentType;
  folder_id?: number;
  page?: number;
  page_size?: number;
}

export interface GetLearningFavoritesResponse {
  favorites: LearningFavorite[];
  total: number;
  page: number;
  page_size: number;
  stats?: Record<string, number>;
}

export const getLearningFavorites = (params?: GetLearningFavoritesParams): Promise<GetLearningFavoritesResponse> => {
  return request.get("/study/favorites", { params });
};

// 获取收藏统计
export const getLearningFavoriteStats = (): Promise<{ stats: Record<string, number> }> => {
  return request.get("/study/favorites/stats");
};

// 检查是否已收藏
export const checkLearningFavorite = (contentType: LearningContentType, contentId: number): Promise<{ is_favorite: boolean }> => {
  return request.get("/study/favorites/check", { params: { content_type: contentType, content_id: contentId } });
};

// 批量检查是否已收藏
export const batchCheckLearningFavorites = (contentType: LearningContentType, contentIds: number[]): Promise<{ favorites: Record<number, boolean> }> => {
  return request.post("/study/favorites/batch-check", { content_type: contentType, content_ids: contentIds });
};

// 取消收藏
export const removeLearningFavorite = (favoriteId: number): Promise<void> => {
  return request.delete(`/study/favorites/${favoriteId}`);
};

// 更新收藏备注
export const updateLearningFavoriteNote = (favoriteId: number, note: string): Promise<void> => {
  return request.put(`/study/favorites/${favoriteId}/note`, { note });
};

// 移动到收藏夹
export const moveLearningFavoriteToFolder = (favoriteId: number, folderId: number | null): Promise<void> => {
  return request.put(`/study/favorites/${favoriteId}/folder`, { folder_id: folderId });
};

// =====================================================
// 收藏夹 API
// =====================================================

// 创建收藏夹
export interface CreateLearningFolderParams {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export const createLearningFolder = (params: CreateLearningFolderParams): Promise<LearningFavoriteFolder> => {
  return request.post("/study/folders", params);
};

// 获取收藏夹列表
export const getLearningFolders = (): Promise<{ folders: LearningFavoriteFolder[] }> => {
  return request.get("/study/folders");
};

// 更新收藏夹
export interface UpdateLearningFolderParams {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
}

export const updateLearningFolder = (folderId: number, params: UpdateLearningFolderParams): Promise<void> => {
  return request.put(`/study/folders/${folderId}`, params);
};

// 删除收藏夹
export const deleteLearningFolder = (folderId: number): Promise<void> => {
  return request.delete(`/study/folders/${folderId}`);
};

// =====================================================
// 知识点掌握度 API
// =====================================================

// 获取知识点掌握情况
export const getKnowledgeMastery = (categoryId?: number): Promise<{ masteries: KnowledgeMastery[] }> => {
  return request.get("/study/mastery", { params: { category_id: categoryId } });
};

// 获取薄弱知识点
export const getWeakPoints = (limit?: number): Promise<{ weak_points: KnowledgeMastery[] }> => {
  return request.get("/study/mastery/weak-points", { params: { limit } });
};

// 获取掌握度统计
export const getMasteryStats = (): Promise<MasteryStats> => {
  return request.get("/study/mastery/stats");
};

// 更新知识点掌握度
export const updateKnowledgeMastery = (knowledgePointId: number, isCorrect: boolean): Promise<void> => {
  return request.post("/study/mastery/update", { knowledge_point_id: knowledgePointId, is_correct: isCorrect });
};
