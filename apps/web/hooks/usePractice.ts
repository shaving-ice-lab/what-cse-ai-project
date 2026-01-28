import { useState, useCallback } from "react";
import {
  practiceApi,
  DailyPracticeDetailResponse,
  UserStreakResponse,
  DailyPracticeResponse,
  CalendarItem,
  WeakCategoryResponse,
  QuestionDetailResponse,
  SubmitAnswerRequest,
} from "@/services/api";

// =====================================================
// 每日一练 Hook
// =====================================================

export function useDailyPractice() {
  const [loading, setLoading] = useState(false);
  const [practice, setPractice] = useState<DailyPracticeDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 获取今日练习
  const fetchTodayPractice = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await practiceApi.getTodayPractice();
      setPractice(data);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.error || "获取每日练习失败";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 提交答案
  const submitAnswer = useCallback(async (data: SubmitAnswerRequest) => {
    try {
      const result = await practiceApi.submitAnswer(data);
      
      // 更新本地练习状态
      if (practice) {
        const updatedQuestions = practice.questions.map((q) => {
          if (q.question_id === data.question_id) {
            return {
              ...q,
              user_answer: data.user_answer,
              is_correct: result.is_correct,
              time_spent: data.time_spent,
            };
          }
          return q;
        });

        const completedCount = updatedQuestions.filter((q) => q.is_correct !== undefined).length;
        const correctCount = updatedQuestions.filter((q) => q.is_correct === true).length;
        const wrongCount = updatedQuestions.filter((q) => q.is_correct === false).length;

        setPractice({
          ...practice,
          questions: updatedQuestions,
          completed_count: completedCount,
          correct_count: correctCount,
          wrong_count: wrongCount,
          progress: (completedCount / practice.total_questions) * 100,
          correct_rate: completedCount > 0 ? (correctCount / completedCount) * 100 : 0,
          status: completedCount >= practice.total_questions ? "completed" : completedCount > 0 ? "partial" : "pending",
        });
      }

      return result;
    } catch (err: any) {
      throw err;
    }
  }, [practice]);

  // 获取当前题目索引
  const getCurrentQuestionIndex = useCallback(() => {
    if (!practice) return 0;
    const firstUnanswered = practice.questions.findIndex((q) => q.is_correct === undefined);
    return firstUnanswered === -1 ? practice.questions.length - 1 : firstUnanswered;
  }, [practice]);

  return {
    loading,
    error,
    practice,
    fetchTodayPractice,
    submitAnswer,
    getCurrentQuestionIndex,
  };
}

// =====================================================
// 打卡统计 Hook
// =====================================================

export function useStreak() {
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState<UserStreakResponse | null>(null);

  const fetchStreak = useCallback(async () => {
    setLoading(true);
    try {
      const data = await practiceApi.getStreak();
      setStreak(data);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    streak,
    fetchStreak,
  };
}

// =====================================================
// 练习历史 Hook
// =====================================================

export function usePracticeHistory() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<DailyPracticeResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchHistory = useCallback(async (p: number = 1, pageSize: number = 20) => {
    setLoading(true);
    try {
      const data = await practiceApi.getHistory(p, pageSize);
      setHistory(data.data || []);
      setTotal(data.total);
      setPage(p);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    history,
    total,
    page,
    fetchHistory,
  };
}

// =====================================================
// 打卡日历 Hook
// =====================================================

export function usePracticeCalendar() {
  const [loading, setLoading] = useState(false);
  const [calendar, setCalendar] = useState<CalendarItem[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const fetchCalendar = useCallback(async (y?: number, m?: number) => {
    setLoading(true);
    try {
      const targetYear = y || year;
      const targetMonth = m || month;
      const data = await practiceApi.getCalendar(targetYear, targetMonth);
      setCalendar(data.calendar || []);
      setYear(data.year);
      setMonth(data.month);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  return {
    loading,
    calendar,
    year,
    month,
    fetchCalendar,
  };
}

// =====================================================
// 薄弱分类 Hook
// =====================================================

export function useWeakCategories() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<WeakCategoryResponse[]>([]);

  const fetchWeakCategories = useCallback(async (limit?: number) => {
    setLoading(true);
    try {
      const data = await practiceApi.getWeakCategories(limit);
      setCategories(data || []);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    categories,
    fetchWeakCategories,
  };
}

// =====================================================
// 工具函数
// =====================================================

// 获取难度标签
export function getDifficultyLabel(level: number): string {
  const labels: Record<number, string> = {
    1: "入门",
    2: "基础",
    3: "进阶",
    4: "困难",
    5: "挑战",
  };
  return labels[level] || "未知";
}

// 获取难度颜色
export function getDifficultyColor(level: number): string {
  const colors: Record<number, string> = {
    1: "bg-green-100 text-green-700",
    2: "bg-blue-100 text-blue-700",
    3: "bg-yellow-100 text-yellow-700",
    4: "bg-orange-100 text-orange-700",
    5: "bg-red-100 text-red-700",
  };
  return colors[level] || "bg-gray-100 text-gray-700";
}

// 获取题目类型标签
export function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    single_choice: "单选题",
    multi_choice: "多选题",
    fill_blank: "填空题",
    essay: "简答题",
    material: "材料题",
    judge: "判断题",
  };
  return labels[type] || "未知类型";
}

// 格式化用时
export function formatTimeSpent(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes}分钟`;
  }
  return `${minutes}分${remainingSeconds}秒`;
}
