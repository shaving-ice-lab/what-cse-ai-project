import { useState, useCallback } from "react";
import * as studyToolsApi from "@/services/api/study-tools";

// =====================================================
// 学习计划 Hook
// =====================================================

export function useStudyPlan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<studyToolsApi.StudyPlan | null>(null);
  const [plans, setPlans] = useState<studyToolsApi.StudyPlan[]>([]);
  const [templates, setTemplates] = useState<studyToolsApi.StudyPlanTemplate[]>([]);

  // 获取当前进行中的计划
  const fetchActivePlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await studyToolsApi.getActivePlan();
      setActivePlan(result.plan);
      return result.plan;
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取学习计划失败");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取计划列表
  const fetchPlans = useCallback(async (params?: studyToolsApi.GetPlansParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await studyToolsApi.getStudyPlans(params);
      setPlans(result.plans);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取计划列表失败");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取计划模板
  const fetchTemplates = useCallback(async (examType?: string) => {
    try {
      const result = await studyToolsApi.getPlanTemplates(examType);
      setTemplates(result.templates);
      return result.templates;
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      return [];
    }
  }, []);

  // 创建计划
  const createPlan = useCallback(async (params: studyToolsApi.CreateStudyPlanParams) => {
    setLoading(true);
    setError(null);
    try {
      const plan = await studyToolsApi.createStudyPlan(params);
      setActivePlan(plan);
      return plan;
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建计划失败");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 从模板创建计划
  const createFromTemplate = useCallback(async (params: studyToolsApi.CreatePlanFromTemplateParams) => {
    setLoading(true);
    setError(null);
    try {
      const plan = await studyToolsApi.createPlanFromTemplate(params);
      setActivePlan(plan);
      return plan;
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建计划失败");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新计划
  const updatePlan = useCallback(async (id: number, params: studyToolsApi.UpdateStudyPlanParams) => {
    setLoading(true);
    setError(null);
    try {
      await studyToolsApi.updateStudyPlan(id, params);
      await fetchActivePlan();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新计划失败");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchActivePlan]);

  // 更新计划状态
  const updateStatus = useCallback(async (id: number, status: studyToolsApi.StudyPlanStatus) => {
    setLoading(true);
    setError(null);
    try {
      await studyToolsApi.updatePlanStatus(id, status);
      if (status === "completed" || status === "abandoned") {
        setActivePlan(null);
      }
      await fetchActivePlan();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新状态失败");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchActivePlan]);

  // 删除计划
  const deletePlan = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await studyToolsApi.deleteStudyPlan(id);
      if (activePlan?.id === id) {
        setActivePlan(null);
      }
      setPlans(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除计划失败");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activePlan]);

  return {
    loading,
    error,
    activePlan,
    plans,
    templates,
    fetchActivePlan,
    fetchPlans,
    fetchTemplates,
    createPlan,
    createFromTemplate,
    updatePlan,
    updateStatus,
    deletePlan,
  };
}

// =====================================================
// 每日任务 Hook
// =====================================================

export function useDailyTasks() {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<studyToolsApi.StudyDailyTask[]>([]);
  const [stats, setStats] = useState<studyToolsApi.DailyTaskStats | null>(null);

  // 获取每日任务
  const fetchTasks = useCallback(async (date?: string) => {
    setLoading(true);
    try {
      const result = await studyToolsApi.getDailyTasks(date);
      setTasks(result.tasks);
      return result.tasks;
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取任务统计
  const fetchStats = useCallback(async (planId?: number, date?: string) => {
    try {
      const result = await studyToolsApi.getDailyTaskStats(planId, date);
      setStats(result);
      return result;
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      return null;
    }
  }, []);

  // 完成任务
  const completeTask = useCallback(async (taskId: number) => {
    try {
      await studyToolsApi.completeDailyTask(taskId);
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, is_completed: true, completed_at: new Date().toISOString() } : t
      ));
    } catch (err) {
      console.error("Failed to complete task:", err);
      throw err;
    }
  }, []);

  // 更新任务进度
  const updateProgress = useCallback(async (taskId: number, actualTime: number, actualCount: number) => {
    try {
      await studyToolsApi.updateTaskProgress(taskId, actualTime, actualCount);
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, actual_time: actualTime, actual_count: actualCount } : t
      ));
    } catch (err) {
      console.error("Failed to update progress:", err);
      throw err;
    }
  }, []);

  return {
    loading,
    tasks,
    stats,
    fetchTasks,
    fetchStats,
    completeTask,
    updateProgress,
  };
}

// =====================================================
// 学习时长 Hook
// =====================================================

export function useStudyTime() {
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<studyToolsApi.StudyTimeRecord | null>(null);
  const [records, setRecords] = useState<studyToolsApi.StudyTimeRecord[]>([]);
  const [dailyStats, setDailyStats] = useState<studyToolsApi.StudyStatistics | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<studyToolsApi.StudyStatistics | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<studyToolsApi.StudyStatistics | null>(null);

  // 获取活跃会话
  const fetchActiveSession = useCallback(async () => {
    try {
      const result = await studyToolsApi.getActiveSession();
      setActiveSession(result.session);
      return result.session;
    } catch (err) {
      console.error("Failed to fetch active session:", err);
      return null;
    }
  }, []);

  // 开始学习会话
  const startSession = useCallback(async (params: studyToolsApi.StartSessionParams) => {
    setLoading(true);
    try {
      const record = await studyToolsApi.startStudySession(params);
      setActiveSession(record);
      return record;
    } catch (err) {
      console.error("Failed to start session:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 结束学习会话
  const endSession = useCallback(async (recordId: number) => {
    setLoading(true);
    try {
      await studyToolsApi.endStudySession(recordId);
      setActiveSession(null);
    } catch (err) {
      console.error("Failed to end session:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 记录学习时长
  const recordTime = useCallback(async (params: studyToolsApi.RecordStudyTimeParams) => {
    setLoading(true);
    try {
      const record = await studyToolsApi.recordStudyTime(params);
      return record;
    } catch (err) {
      console.error("Failed to record time:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取学习记录
  const fetchRecords = useCallback(async (params?: studyToolsApi.GetStudyRecordsParams) => {
    setLoading(true);
    try {
      const result = await studyToolsApi.getStudyRecords(params);
      setRecords(result.records);
      return result;
    } catch (err) {
      console.error("Failed to fetch records:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取日统计
  const fetchDailyStats = useCallback(async (date?: string) => {
    try {
      const stats = await studyToolsApi.getDailyStatistics(date);
      setDailyStats(stats);
      return stats;
    } catch (err) {
      console.error("Failed to fetch daily stats:", err);
      return null;
    }
  }, []);

  // 获取周统计
  const fetchWeeklyStats = useCallback(async () => {
    try {
      const stats = await studyToolsApi.getWeeklyStatistics();
      setWeeklyStats(stats);
      return stats;
    } catch (err) {
      console.error("Failed to fetch weekly stats:", err);
      return null;
    }
  }, []);

  // 获取月统计
  const fetchMonthlyStats = useCallback(async () => {
    try {
      const stats = await studyToolsApi.getMonthlyStatistics();
      setMonthlyStats(stats);
      return stats;
    } catch (err) {
      console.error("Failed to fetch monthly stats:", err);
      return null;
    }
  }, []);

  return {
    loading,
    activeSession,
    records,
    dailyStats,
    weeklyStats,
    monthlyStats,
    fetchActiveSession,
    startSession,
    endSession,
    recordTime,
    fetchRecords,
    fetchDailyStats,
    fetchWeeklyStats,
    fetchMonthlyStats,
  };
}

// =====================================================
// 学习收藏 Hook
// =====================================================

export function useLearningFavorites() {
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<studyToolsApi.LearningFavorite[]>([]);
  const [folders, setFolders] = useState<studyToolsApi.LearningFavoriteFolder[]>([]);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [total, setTotal] = useState(0);

  // 获取收藏列表
  const fetchFavorites = useCallback(async (params?: studyToolsApi.GetLearningFavoritesParams) => {
    setLoading(true);
    try {
      const result = await studyToolsApi.getLearningFavorites(params);
      setFavorites(result.favorites);
      setTotal(result.total);
      if (result.stats) {
        setStats(result.stats);
      }
      return result;
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取收藏夹列表
  const fetchFolders = useCallback(async () => {
    try {
      const result = await studyToolsApi.getLearningFolders();
      setFolders(result.folders);
      return result.folders;
    } catch (err) {
      console.error("Failed to fetch folders:", err);
      return [];
    }
  }, []);

  // 获取收藏统计
  const fetchStats = useCallback(async () => {
    try {
      const result = await studyToolsApi.getLearningFavoriteStats();
      setStats(result.stats);
      return result.stats;
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      return null;
    }
  }, []);

  // 添加收藏
  const addFavorite = useCallback(async (params: studyToolsApi.AddLearningFavoriteParams) => {
    setLoading(true);
    try {
      const favorite = await studyToolsApi.addLearningFavorite(params);
      setFavorites(prev => [favorite, ...prev]);
      return favorite;
    } catch (err) {
      console.error("Failed to add favorite:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 取消收藏
  const removeFavorite = useCallback(async (favoriteId: number) => {
    setLoading(true);
    try {
      await studyToolsApi.removeLearningFavorite(favoriteId);
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 检查是否已收藏
  const checkFavorite = useCallback(async (contentType: studyToolsApi.LearningContentType, contentId: number) => {
    try {
      const result = await studyToolsApi.checkLearningFavorite(contentType, contentId);
      return result.is_favorite;
    } catch (err) {
      console.error("Failed to check favorite:", err);
      return false;
    }
  }, []);

  // 创建收藏夹
  const createFolder = useCallback(async (params: studyToolsApi.CreateLearningFolderParams) => {
    setLoading(true);
    try {
      const folder = await studyToolsApi.createLearningFolder(params);
      setFolders(prev => [...prev, folder]);
      return folder;
    } catch (err) {
      console.error("Failed to create folder:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 删除收藏夹
  const deleteFolder = useCallback(async (folderId: number) => {
    setLoading(true);
    try {
      await studyToolsApi.deleteLearningFolder(folderId);
      setFolders(prev => prev.filter(f => f.id !== folderId));
    } catch (err) {
      console.error("Failed to delete folder:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 移动收藏到文件夹
  const moveToFolder = useCallback(async (favoriteId: number, folderId: number | null) => {
    try {
      await studyToolsApi.moveLearningFavoriteToFolder(favoriteId, folderId);
      setFavorites(prev => prev.map(f => 
        f.id === favoriteId ? { ...f, folder_id: folderId || undefined } : f
      ));
    } catch (err) {
      console.error("Failed to move to folder:", err);
      throw err;
    }
  }, []);

  return {
    loading,
    favorites,
    folders,
    stats,
    total,
    fetchFavorites,
    fetchFolders,
    fetchStats,
    addFavorite,
    removeFavorite,
    checkFavorite,
    createFolder,
    deleteFolder,
    moveToFolder,
  };
}

// =====================================================
// 知识掌握度 Hook
// =====================================================

export function useKnowledgeMastery() {
  const [loading, setLoading] = useState(false);
  const [masteries, setMasteries] = useState<studyToolsApi.KnowledgeMastery[]>([]);
  const [weakPoints, setWeakPoints] = useState<studyToolsApi.KnowledgeMastery[]>([]);
  const [stats, setStats] = useState<studyToolsApi.MasteryStats | null>(null);

  // 获取知识点掌握情况
  const fetchMasteries = useCallback(async (categoryId?: number) => {
    setLoading(true);
    try {
      const result = await studyToolsApi.getKnowledgeMastery(categoryId);
      setMasteries(result.masteries);
      return result.masteries;
    } catch (err) {
      console.error("Failed to fetch masteries:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取薄弱知识点
  const fetchWeakPoints = useCallback(async (limit?: number) => {
    setLoading(true);
    try {
      const result = await studyToolsApi.getWeakPoints(limit);
      setWeakPoints(result.weak_points);
      return result.weak_points;
    } catch (err) {
      console.error("Failed to fetch weak points:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取统计
  const fetchStats = useCallback(async () => {
    try {
      const result = await studyToolsApi.getMasteryStats();
      setStats(result);
      return result;
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      return null;
    }
  }, []);

  // 更新掌握度
  const updateMastery = useCallback(async (knowledgePointId: number, isCorrect: boolean) => {
    try {
      await studyToolsApi.updateKnowledgeMastery(knowledgePointId, isCorrect);
    } catch (err) {
      console.error("Failed to update mastery:", err);
      throw err;
    }
  }, []);

  return {
    loading,
    masteries,
    weakPoints,
    stats,
    fetchMasteries,
    fetchWeakPoints,
    fetchStats,
    updateMastery,
  };
}
