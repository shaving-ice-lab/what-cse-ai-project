import request from "../request";

// =====================================================
// 类型定义
// =====================================================

// 科目学习统计
export interface SubjectLearningStats {
  subject: string;
  minutes: number;
  question_count: number;
  correct_count: number;
  correct_rate: number;
  course_completed: number;
}

// 每日概览
export interface DailyOverview {
  total_minutes: number;
  question_count: number;
  correct_rate: number;
  course_completed: number;
  chapter_completed: number;
}

// 学习对比（与昨日）
export interface LearningComparison {
  total_minutes_change: number;
  question_count_change: number;
  correct_rate_change: number;
}

// 目标对比
export interface GoalComparison {
  minutes_goal: number;
  minutes_actual: number;
  minutes_percent: number;
  questions_goal: number;
  questions_actual: number;
  questions_percent: number;
  is_goal_achieved: boolean;
}

// 成就
export interface LearningAchievement {
  id: number;
  user_id: number;
  achievement_type: string;
  achievement_id: string;
  title: string;
  description?: string;
  icon?: string;
  value: number;
  unlocked_at: string;
}

// 每日学习报告
export interface DailyLearningReport {
  date: string;
  overview: DailyOverview;
  subject_breakdown: SubjectLearningStats[];
  hourly_distribution?: { hour: number; minutes: number }[];
  comparison_with_yesterday?: LearningComparison;
  comparison_with_goal?: GoalComparison;
  achievements?: LearningAchievement[];
}

// 每周概览
export interface WeeklyOverview {
  total_minutes: number;
  total_questions: number;
  avg_daily_minutes: number;
  avg_correct_rate: number;
  learning_days: number;
  course_completed: number;
}

// 每日趋势项
export interface DailyTrendItem {
  date: string;
  day_of_week: string;
  minutes: number;
  question_count: number;
  correct_rate: number;
  is_goal_achieved: boolean;
}

// 知识点分析
export interface KnowledgeAnalysis {
  strong_points: KnowledgePointStat[];
  weak_points: KnowledgePointStat[];
}

export interface KnowledgePointStat {
  id: number;
  name: string;
  subject: string;
  correct_rate: number;
  total_count: number;
  trend: "up" | "down" | "stable";
}

// 成就摘要
export interface AchievementSummary {
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
}

// 每周学习报告
export interface WeeklyLearningReport {
  week_start: string;
  week_end: string;
  overview: WeeklyOverview;
  daily_trend: DailyTrendItem[];
  subject_breakdown: SubjectLearningStats[];
  knowledge_points: KnowledgeAnalysis;
  achievements?: AchievementSummary[];
  consecutive_days: number;
}

// 科目能力
export interface SubjectAbility {
  subject: string;
  subject_name: string;
  score: number;
  correct_rate: number;
  total_questions: number;
  rank: string; // A/B/C/D/E
  trend: "up" | "down" | "stable";
}

// 雷达图数据点
export interface RadarDataPoint {
  dimension: string;
  value: number;
  full_mark: number;
}

// 知识点掌握度
export interface KnowledgeMastery {
  category_id: number;
  category_name: string;
  subject: string;
  mastery_level: number;
  total_points: number;
  mastered_points: number;
}

// 题型统计
export interface QuestionTypeStat {
  question_type: string;
  type_name: string;
  total_count: number;
  correct_count: number;
  correct_rate: number;
  avg_time: number;
  is_weak: boolean;
}

// 进步曲线点
export interface ProgressPoint {
  date: string;
  score: number;
  correct_rate: number;
}

// 预测分数
export interface PredictedScore {
  min_score: number;
  max_score: number;
  most_likely: number;
  confidence: number;
  last_updated: string;
}

// 与平均水平对比
export interface AvgComparison {
  overall_vs_avg: number;
  study_time_vs_avg: number;
  correct_rate_vs_avg: number;
  percentile: number;
}

// 能力分析报告
export interface AbilityReport {
  overall_score: number;
  subject_scores: SubjectAbility[];
  radar_data: RadarDataPoint[];
  knowledge_mastery: KnowledgeMastery[];
  question_type_stats: QuestionTypeStat[];
  progress_curve: ProgressPoint[];
  predicted_score?: PredictedScore;
  comparison_with_avg?: AvgComparison;
}

// =====================================================
// AI 能力分析相关类型
// =====================================================

// 维度分析
export interface DimensionAnalysis {
  dimension: string;
  score: number;
  level: string;
  description: string;
  tips: string;
}

// 雷达图解读
export interface RadarInterpretation {
  dimension_analysis: DimensionAnalysis[];
  strength_analysis: string;
  weakness_analysis: string;
  overall_summary: string;
}

// 科目差距
export interface SubjectGap {
  subject: string;
  subject_name: string;
  target_score: number;
  current_score: number;
  gap_value: number;
  priority: number;
  suggestion: string;
}

// 目标差距分析
export interface TargetGapAnalysis {
  target_score: number;
  current_score: number;
  gap_value: number;
  gap_description: string;
  subject_gaps: SubjectGap[];
  estimated_days: number;
}

// 平均水平差距分析
export interface AverageGapAnalysis {
  average_score: number;
  current_score: number;
  gap_value: number;
  percentile_rank: number;
  gap_description: string;
}

// 优秀者差距分析
export interface TopGapAnalysis {
  top_score: number;
  current_score: number;
  gap_value: number;
  gap_description: string;
}

// 对标分析
export interface ComparisonAnalysis {
  target_gap?: TargetGapAnalysis;
  average_gap?: AverageGapAnalysis;
  top_gap?: TopGapAnalysis;
  quantified_gap: string;
  key_gap_areas: string[];
}

// 提升策略
export interface ImprovementStrategy {
  period: string;
  goals: string[];
  actions: string[];
  expected_gain: number;
}

// 重点突破方向
export interface FocusArea {
  area: string;
  priority: number;
  current_level: string;
  target_level: string;
  recommend_tasks: string[];
  estimated_time: number;
}

// 周计划项
export interface WeeklyPlanItem {
  week: number;
  theme: string;
  main_tasks: string[];
  target_minutes: number;
  target_questions: number;
}

// 提升建议
export interface ImprovementPlan {
  short_term_strategy?: ImprovementStrategy;
  medium_term_strategy?: ImprovementStrategy;
  long_term_strategy?: ImprovementStrategy;
  focus_areas: FocusArea[];
  weekly_plan: WeeklyPlanItem[];
  motivational_tips: string[];
}

// AI能力分析
export interface AIAbilityAnalysis {
  radar_interpretation?: RadarInterpretation;
  comparison_analysis?: ComparisonAnalysis;
  improvement_plan?: ImprovementPlan;
  generated_at?: string;
}

// AI增强版能力分析报告
export interface AIAbilityReport extends AbilityReport {
  ai_analysis?: AIAbilityAnalysis;
}

// 排行榜条目
export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username?: string;
  avatar?: string;
  value: number;
  value_unit: string;
  change: number;
}

// 排行榜响应
export interface LeaderboardResponse {
  type: "daily" | "weekly" | "monthly" | "all_time";
  metric: "study_time" | "question_count" | "consecutive" | "mock_score" | "correct_rate";
  date: string;
  entries: LeaderboardEntry[];
  my_rank?: LeaderboardEntry;
  total_users: number;
}

// 学习目标
export interface LearningGoal {
  id: number;
  user_id: number;
  daily_minutes: number;
  daily_questions: number;
  weekly_course_days: number;
  target_exam_date?: string;
  target_score?: number;
  consecutive_days: number;
  total_learning_days: number;
  longest_streak: number;
  last_check_in_date?: string;
}

// 学习概览
export interface LearningOverview {
  total_minutes: number;
  total_questions: number;
  total_correct_rate: number;
  learning_days: number;
  consecutive_days: number;
  today_minutes: number;
  today_questions: number;
  daily_goal_minutes: number;
  daily_goal_questions: number;
}

// =====================================================
// 请求类型
// =====================================================

export interface UpdateGoalRequest {
  daily_minutes?: number;
  daily_questions?: number;
  weekly_course_days?: number;
  target_exam_date?: string;
  target_score?: number;
}

export interface RecordStudyRequest {
  minutes: number;
  is_course: boolean;
  subject?: string;
}

export interface RecordQuestionRequest {
  is_correct: boolean;
  subject?: string;
}

// =====================================================
// API 调用
// =====================================================

export const learningApi = {
  // =============== 学习报告 ===============
  
  // 获取今日学习报告
  getDailyReport: () =>
    request.get<DailyLearningReport>("/api/v1/learning/reports/daily"),
  
  // 获取指定日期学习报告
  getDailyReportByDate: (date: string) =>
    request.get<DailyLearningReport>(`/api/v1/learning/reports/daily/${date}`),
  
  // 获取本周学习报告
  getWeeklyReport: () =>
    request.get<WeeklyLearningReport>("/api/v1/learning/reports/weekly"),
  
  // 获取指定周学习报告
  getWeeklyReportByDate: (weekStart: string) =>
    request.get<WeeklyLearningReport>(`/api/v1/learning/reports/weekly/${weekStart}`),
  
  // 获取能力分析报告
  getAbilityReport: () =>
    request.get<AbilityReport>("/api/v1/learning/reports/ability"),
  
  // 获取AI增强版能力分析报告
  getAIAbilityReport: () =>
    request.get<AIAbilityReport>("/api/v1/learning/reports/ability/ai"),

  // =============== 学习统计 ===============
  
  // 获取学习概览
  getOverview: () =>
    request.get<LearningOverview>("/api/v1/learning/stats/overview"),
  
  // 获取学习统计
  getStats: () =>
    request.get<LearningOverview>("/api/v1/learning/stats"),

  // =============== 学习目标 ===============
  
  // 获取学习目标
  getGoal: () =>
    request.get<LearningGoal>("/api/v1/learning/goals"),
  
  // 更新学习目标
  updateGoal: (data: UpdateGoalRequest) =>
    request.put<{ message: string }>("/api/v1/learning/goals", data),

  // =============== 排行榜 ===============
  
  // 获取每日排行榜
  getDailyLeaderboard: (metric: "study_time" | "question_count") =>
    request.get<LeaderboardResponse>(`/api/v1/learning/leaderboards/daily/${metric}`),
  
  // 获取每周排行榜
  getWeeklyLeaderboard: (metric: "study_time" | "question_count") =>
    request.get<LeaderboardResponse>(`/api/v1/learning/leaderboards/weekly/${metric}`),
  
  // 获取连续打卡排行榜
  getConsecutiveLeaderboard: () =>
    request.get<LeaderboardResponse>("/api/v1/learning/leaderboards/consecutive"),
  
  // 获取我的排名
  getMyRank: (type?: "daily" | "weekly", metric?: "study_time" | "question_count") =>
    request.get<LeaderboardEntry>("/api/v1/learning/leaderboards/my-rank", {
      params: { type, metric }
    }),

  // =============== 成就 ===============
  
  // 获取我的成就
  getAchievements: () =>
    request.get<LearningAchievement[]>("/api/v1/learning/achievements"),

  // =============== 学习记录 ===============
  
  // 记录学习
  recordStudy: (data: RecordStudyRequest) =>
    request.post<{ message: string }>("/api/v1/learning/record/study", data),
  
  // 记录做题
  recordQuestion: (data: RecordQuestionRequest) =>
    request.post<{ message: string }>("/api/v1/learning/record/question", data),
};
