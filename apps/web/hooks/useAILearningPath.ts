import { useState, useCallback } from "react";
import {
  aiLearningApi,
  LearningPath,
  ProgressSummary,
  NextStepRecommendation,
  UserProfile,
  WeaknessAnalysisResult,
  TypicalMistake,
  SpecializedPractice,
  GeneratePathRequest,
  AdjustPathRequest,
  AnalyzeWeaknessRequest,
  GeneratePracticeRequest,
} from "@/services/api/ai-learning";
import { toast } from "@what-cse/ui";

// =====================================================
// 学习路径 Hook
// =====================================================

export function useAILearningPath() {
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState<LearningPath | null>(null);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [recommendations, setRecommendations] = useState<NextStepRecommendation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // 获取学习路径
  const fetchLearningPath = useCallback(async () => {
    setLoading(true);
    try {
      const result = await aiLearningApi.getLearningPath();
      setPath(result);
      return result;
    } catch (error) {
      // 没有数据时不报错
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 生成学习路径
  const generateLearningPath = useCallback(async (data: GeneratePathRequest) => {
    setLoading(true);
    try {
      const result = await aiLearningApi.generateLearningPath(data);
      setPath(result);
      toast.success("学习路径生成成功");
      return result;
    } catch (error) {
      toast.error("生成学习路径失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 调整学习路径
  const adjustLearningPath = useCallback(async (data: AdjustPathRequest) => {
    setLoading(true);
    try {
      const result = await aiLearningApi.adjustLearningPath(data);
      setPath(result);
      toast.success("学习路径已调整");
      return result;
    } catch (error) {
      toast.error("调整学习路径失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取进度摘要
  const fetchProgressSummary = useCallback(async () => {
    setLoading(true);
    try {
      const result = await aiLearningApi.getProgressSummary();
      setProgressSummary(result);
      return result;
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取下一步推荐
  const fetchRecommendations = useCallback(async (limit?: number) => {
    setLoading(true);
    try {
      const result = await aiLearningApi.getNextStepRecommendations(limit);
      setRecommendations(result || []);
      return result;
    } catch (error) {
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取用户画像
  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const result = await aiLearningApi.getUserProfile();
      setUserProfile(result);
      return result;
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    path,
    progressSummary,
    recommendations,
    userProfile,
    fetchLearningPath,
    generateLearningPath,
    adjustLearningPath,
    fetchProgressSummary,
    fetchRecommendations,
    fetchUserProfile,
  };
}

// =====================================================
// 薄弱点分析 Hook
// =====================================================

export function useWeaknessAnalysis() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<WeaknessAnalysisResult | null>(null);
  const [mistakes, setMistakes] = useState<TypicalMistake[]>([]);
  const [practice, setPractice] = useState<SpecializedPractice | null>(null);

  // 获取薄弱点分析结果
  const fetchWeaknessAnalysis = useCallback(async (subject?: string) => {
    setLoading(true);
    try {
      const result = await aiLearningApi.getWeaknessAnalysis(subject);
      setAnalysis(result);
      return result;
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 执行薄弱点分析
  const analyzeWeakness = useCallback(async (data?: AnalyzeWeaknessRequest) => {
    setLoading(true);
    try {
      const result = await aiLearningApi.analyzeWeakness(data);
      setAnalysis(result);
      toast.success("薄弱点分析完成");
      return result;
    } catch (error) {
      toast.error("薄弱点分析失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取典型错题
  const fetchTypicalMistakes = useCallback(async (limit?: number) => {
    setLoading(true);
    try {
      const result = await aiLearningApi.getTypicalMistakes(limit);
      setMistakes(result || []);
      return result;
    } catch (error) {
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 生成专项练习
  const generateSpecializedPractice = useCallback(async (data: GeneratePracticeRequest) => {
    setLoading(true);
    try {
      const result = await aiLearningApi.generateSpecializedPractice(data);
      setPractice(result);
      toast.success("专项练习已生成");
      return result;
    } catch (error) {
      toast.error("生成专项练习失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    analysis,
    mistakes,
    practice,
    fetchWeaknessAnalysis,
    analyzeWeakness,
    fetchTypicalMistakes,
    generateSpecializedPractice,
  };
}

// =====================================================
// 辅助函数
// =====================================================

// 获取严重程度颜色
export function getSeverityColor(level: string): string {
  const colors: Record<string, string> = {
    critical: "text-red-600 bg-red-50 border-red-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    medium: "text-amber-600 bg-amber-50 border-amber-200",
    low: "text-green-600 bg-green-50 border-green-200",
  };
  return colors[level] || "text-gray-600 bg-gray-50 border-gray-200";
}

// 获取严重程度文本
export function getSeverityText(level: string): string {
  const texts: Record<string, string> = {
    critical: "急需提升",
    high: "需要加强",
    medium: "一般薄弱",
    low: "略有不足",
  };
  return texts[level] || level;
}

// 获取任务类型颜色
export function getTaskTypeColor(type: string): string {
  const colors: Record<string, string> = {
    course: "bg-blue-100 text-blue-700",
    practice: "bg-green-100 text-green-700",
    review: "bg-purple-100 text-purple-700",
    mock: "bg-amber-100 text-amber-700",
  };
  return colors[type] || "bg-gray-100 text-gray-700";
}

// 获取任务类型文本
export function getTaskTypeText(type: string): string {
  const texts: Record<string, string> = {
    course: "课程学习",
    practice: "专项练习",
    review: "复习巩固",
    mock: "模拟测试",
  };
  return texts[type] || type;
}

// 获取能力水平文本
export function getLevelText(level: string): string {
  const texts: Record<string, string> = {
    beginner: "基础薄弱",
    intermediate: "有一定基础",
    advanced: "基础扎实",
  };
  return texts[level] || level;
}

// 获取趋势图标
export function getTrendIcon(trend: string): string {
  const icons: Record<string, string> = {
    improving: "↑",
    stable: "→",
    declining: "↓",
  };
  return icons[trend] || "";
}

// 获取趋势颜色
export function getTrendColor(trend: string): string {
  const colors: Record<string, string> = {
    improving: "text-green-600",
    stable: "text-gray-600",
    declining: "text-red-600",
  };
  return colors[trend] || "text-gray-600";
}

// 格式化学习时长
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}

// 获取推荐类型图标名称
export function getRecommendationIcon(type: string): string {
  const icons: Record<string, string> = {
    knowledge: "BookOpen",
    skill: "Zap",
    strategy: "Target",
    mindset: "Heart",
  };
  return icons[type] || "Circle";
}
