import { useState, useCallback } from "react";
import {
  learningApi,
  DailyLearningReport,
  WeeklyLearningReport,
  AbilityReport,
  AIAbilityReport,
  LeaderboardResponse,
  LearningGoal,
  LearningOverview,
  LearningAchievement,
  UpdateGoalRequest,
} from "@/services/api/learning";
import { toast } from "@what-cse/ui";

// =====================================================
// 每日学习报告 Hook
// =====================================================

export function useDailyReport() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DailyLearningReport | null>(null);

  const fetchDailyReport = useCallback(async (date?: string) => {
    setLoading(true);
    try {
      const result = date 
        ? await learningApi.getDailyReportByDate(date)
        : await learningApi.getDailyReport();
      setReport(result);
      return result;
    } catch (error) {
      // Don't show error for missing data
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    report,
    fetchDailyReport,
  };
}

// =====================================================
// 每周学习报告 Hook
// =====================================================

export function useWeeklyReport() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<WeeklyLearningReport | null>(null);

  const fetchWeeklyReport = useCallback(async (weekStart?: string) => {
    setLoading(true);
    try {
      const result = weekStart
        ? await learningApi.getWeeklyReportByDate(weekStart)
        : await learningApi.getWeeklyReport();
      setReport(result);
      return result;
    } catch (error) {
      // Don't show error for missing data
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    report,
    fetchWeeklyReport,
  };
}

// =====================================================
// 能力分析报告 Hook
// =====================================================

export function useAbilityReport() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AbilityReport | null>(null);

  const fetchAbilityReport = useCallback(async () => {
    setLoading(true);
    try {
      const result = await learningApi.getAbilityReport();
      setReport(result);
      return result;
    } catch (error) {
      toast.error("获取能力分析失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    report,
    fetchAbilityReport,
  };
}

// =====================================================
// AI 增强版能力分析报告 Hook
// =====================================================

export function useAIAbilityReport() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AIAbilityReport | null>(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);

  const fetchAIAbilityReport = useCallback(async () => {
    setLoading(true);
    setAiAnalysisLoading(true);
    try {
      const result = await learningApi.getAIAbilityReport();
      setReport(result);
      return result;
    } catch (error) {
      toast.error("获取AI能力分析失败");
      throw error;
    } finally {
      setLoading(false);
      setAiAnalysisLoading(false);
    }
  }, []);

  return {
    loading,
    aiAnalysisLoading,
    report,
    fetchAIAbilityReport,
  };
}

// =====================================================
// 学习概览 Hook
// =====================================================

export function useLearningOverview() {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<LearningOverview | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const result = await learningApi.getOverview();
      setOverview(result);
      return result;
    } catch (error) {
      // Don't show error for unauthenticated users
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    overview,
    fetchOverview,
  };
}

// =====================================================
// 学习目标 Hook
// =====================================================

export function useLearningGoal() {
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState<LearningGoal | null>(null);

  const fetchGoal = useCallback(async () => {
    setLoading(true);
    try {
      const result = await learningApi.getGoal();
      setGoal(result);
      return result;
    } catch (error) {
      // Don't show error for unauthenticated users
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGoal = useCallback(async (data: UpdateGoalRequest) => {
    setLoading(true);
    try {
      await learningApi.updateGoal(data);
      toast.success("目标更新成功");
      // Refresh goal data
      await fetchGoal();
    } catch (error) {
      toast.error("更新目标失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchGoal]);

  return {
    loading,
    goal,
    fetchGoal,
    updateGoal,
  };
}

// =====================================================
// 排行榜 Hook
// =====================================================

export function useLeaderboard() {
  const [loading, setLoading] = useState(false);
  const [dailyLeaderboard, setDailyLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [consecutiveLeaderboard, setConsecutiveLeaderboard] = useState<LeaderboardResponse | null>(null);

  const fetchDailyLeaderboard = useCallback(async (metric: "study_time" | "question_count" = "study_time") => {
    setLoading(true);
    try {
      const result = await learningApi.getDailyLeaderboard(metric);
      setDailyLeaderboard(result);
      return result;
    } catch (error) {
      toast.error("获取排行榜失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeeklyLeaderboard = useCallback(async (metric: "study_time" | "question_count" = "study_time") => {
    setLoading(true);
    try {
      const result = await learningApi.getWeeklyLeaderboard(metric);
      setWeeklyLeaderboard(result);
      return result;
    } catch (error) {
      toast.error("获取排行榜失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsecutiveLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const result = await learningApi.getConsecutiveLeaderboard();
      setConsecutiveLeaderboard(result);
      return result;
    } catch (error) {
      toast.error("获取排行榜失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    dailyLeaderboard,
    weeklyLeaderboard,
    consecutiveLeaderboard,
    fetchDailyLeaderboard,
    fetchWeeklyLeaderboard,
    fetchConsecutiveLeaderboard,
  };
}

// =====================================================
// 成就 Hook
// =====================================================

export function useAchievements() {
  const [loading, setLoading] = useState(false);
  const [achievements, setAchievements] = useState<LearningAchievement[]>([]);

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const result = await learningApi.getAchievements();
      setAchievements(result || []);
      return result;
    } catch (error) {
      // Don't show error for missing data
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    achievements,
    fetchAchievements,
  };
}

// =====================================================
// 学习记录 Hook
// =====================================================

export function useLearningRecord() {
  const [loading, setLoading] = useState(false);

  const recordStudy = useCallback(async (minutes: number, isCourse: boolean, subject?: string) => {
    setLoading(true);
    try {
      await learningApi.recordStudy({ minutes, is_course: isCourse, subject });
    } catch (error) {
      // Silent fail for record updates
    } finally {
      setLoading(false);
    }
  }, []);

  const recordQuestion = useCallback(async (isCorrect: boolean, subject?: string) => {
    setLoading(true);
    try {
      await learningApi.recordQuestion({ is_correct: isCorrect, subject });
    } catch (error) {
      // Silent fail for record updates
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    recordStudy,
    recordQuestion,
  };
}

// =====================================================
// 辅助函数
// =====================================================

// 格式化学习时长
export function formatStudyTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}

// 格式化百分比
export function formatPercent(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

// 获取能力等级颜色
export function getRankColor(rank: string): string {
  const colors: Record<string, string> = {
    A: "text-green-600 bg-green-50",
    B: "text-blue-600 bg-blue-50",
    C: "text-yellow-600 bg-yellow-50",
    D: "text-orange-600 bg-orange-50",
    E: "text-red-600 bg-red-50",
  };
  return colors[rank] || "text-gray-600 bg-gray-50";
}

// 获取趋势图标
export function getTrendIcon(trend: "up" | "down" | "stable"): string {
  const icons: Record<string, string> = {
    up: "↑",
    down: "↓",
    stable: "→",
  };
  return icons[trend] || "";
}

// 获取趋势颜色
export function getTrendColor(trend: "up" | "down" | "stable"): string {
  const colors: Record<string, string> = {
    up: "text-green-600",
    down: "text-red-600",
    stable: "text-gray-600",
  };
  return colors[trend] || "text-gray-600";
}

// 获取科目名称
export function getSubjectLabel(subject: string): string {
  const labels: Record<string, string> = {
    xingce: "行测",
    shenlun: "申论",
    mianshi: "面试",
    gongji: "公基",
  };
  return labels[subject] || subject;
}

// 获取科目颜色
export function getSubjectColorClass(subject: string): string {
  const colors: Record<string, string> = {
    xingce: "from-blue-500 to-indigo-600",
    shenlun: "from-emerald-500 to-teal-600",
    mianshi: "from-purple-500 to-violet-600",
    gongji: "from-amber-500 to-orange-600",
  };
  return colors[subject] || "from-gray-500 to-gray-600";
}

// 计算目标完成百分比
export function calculateGoalProgress(actual: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((actual / goal) * 100));
}

// 获取周几名称
export function getDayOfWeekName(dayIndex: number): string {
  const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return days[dayIndex] || "";
}

// 格式化日期
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// 格式化日期时间
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}
