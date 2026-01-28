import request from "../request";

// =====================================================
// 类型定义 - 学习路径
// =====================================================

// 用户画像
export interface UserProfile {
  user_id: number;
  target_exam: string;
  target_exam_date?: string;
  daily_study_minutes: number;
  current_level: "beginner" | "intermediate" | "advanced";
  weak_subjects: string[];
  strong_subjects: string[];
  overall_score: number;
  study_days: number;
  total_minutes: number;
}

// 学习阶段
export interface LearningPhase {
  id: string;
  name: string;
  description: string;
  start_day: number;
  end_day: number;
  goals: string[];
  focus: string[];
  is_completed: boolean;
  is_current: boolean;
  progress: number;
}

// 每日任务
export interface DailyTask {
  id: string;
  type: "course" | "practice" | "review";
  title: string;
  description: string;
  subject: string;
  duration: number;
  priority: number;
  is_completed: boolean;
  resource_id?: number;
  tags?: string[];
}

// 学习路径
export interface LearningPath {
  id: string;
  user_id: number;
  name: string;
  description: string;
  target_exam: string;
  total_days: number;
  current_day: number;
  progress_percent: number;
  phases: LearningPhase[];
  daily_tasks: DailyTask[];
  created_at: string;
  updated_at: string;
}

// 进度摘要
export interface ProgressSummary {
  total_progress: number;
  current_phase: string;
  phase_progress: number;
  days_remaining: number;
  days_completed: number;
  today_completed: number;
  today_total: number;
  is_on_track: boolean;
  status_message: string;
  streak: number;
}

// 下一步推荐
export interface NextStepRecommendation {
  type: "course" | "practice" | "review" | "mock";
  title: string;
  description: string;
  duration: number;
  priority: number;
  reason: string;
  resource_id?: number;
}

// =====================================================
// 类型定义 - 薄弱点分析
// =====================================================

// 薄弱知识点
export interface WeakKnowledgePoint {
  id: number;
  name: string;
  subject: string;
  category: string;
  correct_rate: number;
  total_count: number;
  correct_count: number;
  avg_time: number;
  severity_level: "critical" | "high" | "medium" | "low";
  trend: "improving" | "stable" | "declining";
  last_practiced: string;
  recommended_priority: number;
}

// 薄弱题型
export interface WeakQuestionType {
  type: string;
  type_name: string;
  subject: string;
  correct_rate: number;
  total_count: number;
  correct_count: number;
  avg_time: number;
  severity_level: "critical" | "high" | "medium" | "low";
  common_mistakes: string[];
}

// 错误模式
export interface ErrorPattern {
  pattern_id: string;
  pattern_name: string;
  description: string;
  frequency: number;
  example_ids: number[];
  causes: string[];
  solutions: string[];
}

// 改进阶段
export interface ImprovementPhase {
  phase_id: string;
  name: string;
  description: string;
  days: number;
  focus: string[];
  tasks: string[];
  goals: string[];
}

// 改进计划
export interface ImprovementPlan {
  plan_id: string;
  title: string;
  description: string;
  total_days: number;
  daily_minutes: number;
  phases: ImprovementPhase[];
  expected_outcome: string;
  created_at: string;
}

// 改进建议
export interface ImprovementRecommendation {
  type: "knowledge" | "skill" | "strategy" | "mindset";
  title: string;
  description: string;
  priority: number;
  resource_id?: number;
  action_items: string[];
}

// 薄弱点分析结果
export interface WeaknessAnalysisResult {
  user_id: number;
  analyzed_at: string;
  overall_score: number;
  total_questions: number;
  correct_rate: number;
  weak_knowledge_points: WeakKnowledgePoint[];
  weak_question_types: WeakQuestionType[];
  error_patterns: ErrorPattern[];
  improvement_plan: ImprovementPlan | null;
  recommendations: ImprovementRecommendation[];
}

// 典型错题
export interface TypicalMistake {
  question_id: number;
  question_content: string;
  user_answer: string;
  correct_answer: string;
  knowledge_point: string;
  error_type: string;
  analysis: string;
  practiced_at: string;
}

// 专项练习
export interface SpecializedPractice {
  id: string;
  title: string;
  description: string;
  knowledge_point: string;
  question_count: number;
  estimated_time: number;
  difficulty: "easy" | "medium" | "hard";
  question_ids: number[];
}

// =====================================================
// 请求类型
// =====================================================

export interface GeneratePathRequest {
  target_exam: string;
  target_exam_date?: string;
  daily_study_minutes?: number;
  force?: boolean;
}

export interface AdjustPathRequest {
  path_id: string;
  reason?: string;
  new_focus?: string[];
}

export interface AnalyzeWeaknessRequest {
  subject?: string;
  date_from?: string;
  date_to?: string;
  min_questions?: number;
}

export interface GeneratePracticeRequest {
  knowledge_point: string;
  count?: number;
}

// =====================================================
// API 调用
// =====================================================

export const aiLearningApi = {
  // =============== 学习路径 ===============

  // 获取学习路径
  getLearningPath: () =>
    request.get<LearningPath>("/api/v1/ai/learning/path"),

  // 生成学习路径
  generateLearningPath: (data: GeneratePathRequest) =>
    request.post<LearningPath>("/api/v1/ai/learning/path/generate", data),

  // 调整学习路径
  adjustLearningPath: (data: AdjustPathRequest) =>
    request.put<LearningPath>("/api/v1/ai/learning/path/adjust", data),

  // 获取进度摘要
  getProgressSummary: () =>
    request.get<ProgressSummary>("/api/v1/ai/learning/path/progress"),

  // 获取下一步推荐
  getNextStepRecommendations: (limit?: number) =>
    request.get<NextStepRecommendation[]>("/api/v1/ai/learning/path/recommendations", {
      params: { limit },
    }),

  // 获取用户画像
  getUserProfile: () =>
    request.get<UserProfile>("/api/v1/ai/learning/profile"),

  // =============== 薄弱点分析 ===============

  // 获取薄弱点分析结果
  getWeaknessAnalysis: (subject?: string) =>
    request.get<WeaknessAnalysisResult>("/api/v1/ai/learning/weakness", {
      params: { subject },
    }),

  // 执行薄弱点分析
  analyzeWeakness: (data?: AnalyzeWeaknessRequest) =>
    request.post<WeaknessAnalysisResult>("/api/v1/ai/learning/weakness/analyze", data || {}),

  // 获取典型错题
  getTypicalMistakes: (limit?: number) =>
    request.get<TypicalMistake[]>("/api/v1/ai/learning/weakness/mistakes", {
      params: { limit },
    }),

  // 生成专项练习
  generateSpecializedPractice: (data: GeneratePracticeRequest) =>
    request.post<SpecializedPractice>("/api/v1/ai/learning/weakness/practice", data),
};
